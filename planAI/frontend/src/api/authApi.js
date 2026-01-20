import api from './api';

/**
 * Auth API Methods
 * Handles authentication-related API calls
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} User data with token
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - Email and password
 * @returns {Promise} User data with token
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Get stored user from localStorage
 * @returns {Object|null} User object or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
