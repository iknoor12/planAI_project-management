import {
  generateTasksWithAI,
  generateSubtasksWithAI,
  analyzeTaskDelaysWithAI,
  chatWithAI,
} from '../services/aiService.js';
import { GeminiRequestError } from '../config/gemini.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const normalizeTitle = (title) => title.trim().toLowerCase();

const geminiErrorResponse = (error, res, fallbackMessage) => {
  if (error instanceof GeminiRequestError) {
    const messages = {
      rate_limit: 'Gemini is temporarily rate-limited. Please try again shortly.',
      authentication: 'Gemini authentication failed. Check the backend API key.',
      invalid_request: 'Gemini rejected the request. Please try again.',
      model_error: 'The configured Gemini model is unavailable.',
      service_unavailable: 'Gemini is temporarily unavailable. Please try again shortly.',
      empty_response: 'Gemini returned an empty response. Please try again.',
      provider_error: 'Gemini could not process the request. Please try again shortly.',
    };

    return res.status(error.statusCode).json({
      message: messages[error.category] || messages.provider_error,
      category: error.category,
    });
  }

  return res.status(500).json({ message: fallbackMessage });
};

/**
 * @route   POST /api/ai/generate-tasks
 * @access  Private
 */
export const generateTasks = async (req, res) => {
  try {
    const { projectDescription, context } = req.body;

    if (!projectDescription) {
      return res.status(400).json({ message: 'Please provide a project description' });
    }

    const result = await generateTasksWithAI(projectDescription, context);

    res.json(result);
  } catch (error) {
    console.error('Generate tasks error:', error);
    return geminiErrorResponse(error, res, 'Server error generating tasks');
  }
};

/**
 * @route   POST /api/ai/projects/:projectId/generate-tasks
 * @access  Private
 */
export const generateProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { context = '' } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.some((member) => member.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    const projectInput = `Project name: ${project.name}\nProject description: ${project.description || ''}`;
    const result = await generateTasksWithAI(projectInput, context);

    if (!result || !Array.isArray(result.tasks) || result.tasks.length === 0) {
      return res.status(502).json({ message: 'Gemini returned no project tasks' });
    }

    const existingTasks = await Task.find({ project: project._id })
      .select('title position')
      .lean();
    const existingTitles = new Set(existingTasks.map((task) => normalizeTitle(task.title)));
    const generatedTitles = new Set();
    const tasksToInsert = [];
    const highestPosition = existingTasks.reduce(
      (max, task) => Math.max(max, Number.isFinite(task.position) ? task.position : -1),
      -1
    );

    for (const generatedTask of result.tasks) {
      if (!generatedTask || typeof generatedTask.title !== 'string' || !generatedTask.title.trim()) {
        return res.status(502).json({ message: 'Gemini returned an invalid project task' });
      }

      const title = generatedTask.title.trim();
      const normalizedTitle = normalizeTitle(title);
      if (existingTitles.has(normalizedTitle) || generatedTitles.has(normalizedTitle)) {
        continue;
      }

      if (!['low', 'medium', 'high', 'urgent'].includes(generatedTask.priority)) {
        return res.status(502).json({ message: 'Gemini returned an invalid task priority' });
      }

      generatedTitles.add(normalizedTitle);
      tasksToInsert.push({
        title,
        description: typeof generatedTask.description === 'string' ? generatedTask.description : '',
        priority: generatedTask.priority,
        status: 'todo',
        project: project._id,
        createdBy: req.user._id,
        position: highestPosition + tasksToInsert.length + 1,
      });
    }

    if (tasksToInsert.length === 0) {
      return res.json({ tasks: [] });
    }

    const savedTasks = await Task.insertMany(tasksToInsert);
    res.status(201).json({ tasks: savedTasks });
  } catch (error) {
    console.error('Generate project tasks error:', error);
    return geminiErrorResponse(error, res, 'Server error generating project tasks');
  }
};

/**
 * @route   POST /api/ai/generate-subtasks
 * @access  Private
 */
export const generateSubtasks = async (req, res) => {
  try {
    const { taskTitle, taskDescription } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ message: 'Please provide a task title' });
    }

    const result = await generateSubtasksWithAI(taskTitle, taskDescription);

    res.json(result);
  } catch (error) {
    console.error('Generate subtasks error:', error);
    return geminiErrorResponse(error, res, 'Server error generating subtasks');
  }
};

/**
 * @route   POST /api/ai/analyze-delays
 * @access  Private
 */
export const analyzeDelays = async (req, res) => {
  try {
    const { tasks, projectContext } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: 'Please provide tasks to analyze' });
    }

    const analysis = await analyzeTaskDelaysWithAI(tasks, projectContext);

    res.json(analysis);
  } catch (error) {
    console.error('Analyze delays error:', error);
    return geminiErrorResponse(error, res, 'Server error analyzing delays');
  }
};

/**
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const aiChat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Please provide a message' });
    }

    const result = await chatWithAI(message, context);

    res.json(result);

  } catch (error) {
    console.error('AI chat error:', error);
    if (error instanceof GeminiRequestError) {
      const messages = {
        rate_limit: 'Gemini is temporarily rate-limited. Please try again shortly.',
        authentication: 'Gemini authentication failed. Check the backend API key.',
        invalid_request: 'Gemini rejected the chat request. Try a shorter message.',
        model_error: 'The configured Gemini model is unavailable.',
        service_unavailable: 'Gemini is temporarily unavailable. Please try again shortly.',
        empty_response: 'Gemini returned an empty response. Please try again.',
        provider_error: 'Gemini could not process the request. Please try again shortly.',
      };

      return res.status(error.statusCode).json({
        message: messages[error.category] || messages.provider_error,
        category: error.category,
      });
    }

    res.status(500).json({
      message: 'Server error processing chat',
    });
  }
};