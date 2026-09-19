import { generateText } from '../config/gemini.js';

const parseJsonArray = (text, itemName) => {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned invalid ${itemName} JSON`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`Gemini returned no ${itemName}`);
  }

  return parsed;
};

const normalizePriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(priority)) {
    throw new Error('Gemini returned a task with an invalid priority');
  }

  return priority;
};

const normalizeCompleted = (completed) => {
  if (completed === undefined) {
    return false;
  }

  if (typeof completed !== 'boolean') {
    throw new Error('Gemini returned a subtask with an invalid completed value');
  }

  return completed;
};

export const generateTasksWithAI = async (projectDescription, context = '') => {
  try {
    if (!projectDescription || typeof projectDescription !== 'string') {
      throw new Error('A project description is required');
    }

    const prompt = `You are a project management assistant. Break the project into practical tasks.

Project: ${projectDescription}
Context: ${context}

Return only a JSON array. Each task must use only these fields:
[
  { "title": "", "description": "", "priority": "low|medium|high|urgent" }
]`;

    const tasks = parseJsonArray(await generateText(prompt), 'task');
    return {
      tasks: tasks.map((task) => {
        if (!task || typeof task.title !== 'string' || !task.title.trim()) {
          throw new Error('Gemini returned a task without a title');
        }

        return {
          title: task.title.trim(),
          description: typeof task.description === 'string' ? task.description.trim() : '',
          priority: normalizePriority(task.priority),
        };
      }),
    };

  } catch (error) {
    console.error('AI task generation error:', error.message);
    throw new Error(error.message || 'AI task generation failed');
  }
};

export const generateSubtasksWithAI = async (taskTitle, taskDescription = '') => {
  try {
    if (!taskTitle || typeof taskTitle !== 'string') {
      throw new Error('A task title is required');
    }

    const prompt = `Break this task into practical subtasks.

Task: ${taskTitle}
Description: ${taskDescription}

Return only a JSON array. Each subtask must use these fields:
[
  { "title": "", "completed": false }
]`;

    const subtasks = parseJsonArray(await generateText(prompt), 'subtask');
    return {
      subtasks: subtasks.map((subtask) => {
        if (!subtask || typeof subtask.title !== 'string' || !subtask.title.trim()) {
          throw new Error('Gemini returned a subtask without a title');
        }

        return {
          title: subtask.title.trim(),
          completed: normalizeCompleted(subtask.completed),
        };
      }),
    };
  } catch (error) {
    console.error('AI subtask generation error:', error.message);
    throw new Error(error.message || 'AI subtask generation failed');
  }
};

export const chatWithAI = async (message, context) => {
  if (!message || typeof message !== 'string') {
    throw new Error('A chat message is required');
  }

  const prompt = `You are a helpful AI project assistant.
Context: ${context || 'No context provided'}
User: ${message}

Respond helpfully.`;

  return {
    reply: await generateText(prompt),
  };
};

export const analyzeTaskDelaysWithAI = async (tasks, projectContext = '') => {
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  );

  if (overdueTasks.length === 0) {
    return {
      hasDelays: false,
      message: 'All tasks are on track!',
    };
  }

  return {
    hasDelays: true,
    overdueCount: overdueTasks.length,
    message: 'Some tasks are delayed. Review priorities.',
  };
};