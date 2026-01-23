import { generateTasksWithAI, generateSubtasksWithAI, analyzeTaskDelaysWithAI } from '../services/aiService.js';

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

    const tasks = await generateTasksWithAI(projectDescription, context);

    res.json({ tasks });
  } catch (error) {
    console.error('Generate tasks error:', error);
    res.status(500).json({ 
      message: 'Server error generating tasks', 
      error: error.message 
    });
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

    const subtasks = await generateSubtasksWithAI(taskTitle, taskDescription);

    res.json({ subtasks });
  } catch (error) {
    console.error('Generate subtasks error:', error);
    res.status(500).json({ 
      message: 'Server error generating subtasks', 
      error: error.message 
    });
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
    res.status(500).json({ 
      message: 'Server error analyzing delays', 
      error: error.message 
    });
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

    const { default: openai } = await import('../config/openai.js');
    if (!openai) {
      return res.status(503).json({ 
        message: 'AI service is not available. Please configure OPENAI_API_KEY in .env file.',
        reply: 'AI assistant is currently unavailable. Please add your OpenAI API key to use AI features.'
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful project management assistant. Help users with task planning, project organization, and productivity tips. ${context ? `Context: ${context}` : ''}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      message: 'Server error processing chat', 
      error: error.message 
    });
  }
};
