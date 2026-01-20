import api from './api';

/**
 * Task API Methods
 * Handles task-related API calls
 */

/**
 * Get all tasks for a project
 * @param {string} projectId - Project ID
 * @returns {Promise} Array of tasks
 */
export const getTasksByProject = async (projectId) => {
  const response = await api.get(`/tasks/project/${projectId}`);
  return response.data;
};

/**
 * Get single task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise} Task data
 */
export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise} Created task
 */
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

/**
 * Update a task
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise} Updated task
 */
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise} Success message
 */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Get task statistics for a project
 * @param {string} projectId - Project ID
 * @returns {Promise} Task statistics
 */
export const getTaskStats = async (projectId) => {
  const response = await api.get(`/tasks/stats/${projectId}`);
  return response.data;
};
