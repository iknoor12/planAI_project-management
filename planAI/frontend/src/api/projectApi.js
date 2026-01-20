import api from './api';

/**
 * Project API Methods
 * Handles project-related API calls
 */

/**
 * Get all projects for current user
 * @returns {Promise} Array of projects
 */
export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

/**
 * Get single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise} Project data
 */
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @returns {Promise} Created project
 */
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise} Updated project
 */
export const updateProject = async (projectId, projectData) => {
  const response = await api.put(`/projects/${projectId}`, projectData);
  return response.data;
};

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise} Success message
 */
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};
