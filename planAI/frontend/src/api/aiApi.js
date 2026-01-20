import api from './api';

/**
 * AI API Methods
 * Handles AI-powered feature API calls
 */

/**
 * Generate tasks using AI
 * @param {string} projectDescription - Description of the project
 * @param {string} context - Additional context (optional)
 * @returns {Promise} Generated tasks
 */
export const generateTasks = async (projectDescription, context = '') => {
  const response = await api.post('/ai/generate-tasks', {
    projectDescription,
    context,
  });
  return response.data;
};

/**
 * Generate subtasks for a task using AI
 * @param {string} taskTitle - Task title
 * @param {string} taskDescription - Task description (optional)
 * @returns {Promise} Generated subtasks
 */
export const generateSubtasks = async (taskTitle, taskDescription = '') => {
  const response = await api.post('/ai/generate-subtasks', {
    taskTitle,
    taskDescription,
  });
  return response.data;
};

/**
 * Analyze task delays using AI
 * @param {Array} tasks - Array of task objects
 * @param {string} projectContext - Project context (optional)
 * @returns {Promise} Analysis with suggestions
 */
export const analyzeDelays = async (tasks, projectContext = '') => {
  const response = await api.post('/ai/analyze-delays', {
    tasks,
    projectContext,
  });
  return response.data;
};

/**
 * Chat with AI assistant
 * @param {string} message - User message
 * @param {string} context - Context information (optional)
 * @returns {Promise} AI response
 */
export const chatWithAI = async (message, context = '') => {
  const response = await api.post('/ai/chat', {
    message,
    context,
  });
  return response.data;
};
