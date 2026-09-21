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

export const getProjectAnalytics = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/analytics`);
  return response.data;
};

export const getProjectSharing = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/share`);
  return response.data;
};

export const enableProjectSharing = async (projectId) => {
  const response = await api.post(`/projects/${projectId}/share`);
  return response.data;
};

export const disableProjectSharing = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}/share`);
  return response.data;
};

export const getPublicProjectByToken = async (token) => {
  const response = await api.get(`/public/projects/share/${encodeURIComponent(token)}`);
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
 * Add a new member to a project by email
 * @param {string} projectId - Project ID
 * @param {string} email - User email to add
 * @returns {Promise} Updated project
 */
export const addProjectMember = async (projectId, email) => {
  const response = await api.post(`/projects/${projectId}/members`, { email });
  return response.data;
};

/**
 * Remove a member from a project
 * @param {string} projectId - Project ID
 * @param {string} memberId - Member user ID
 * @returns {Promise} Updated project
 */
export const removeProjectMember = async (projectId, memberId) => {
  const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
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
