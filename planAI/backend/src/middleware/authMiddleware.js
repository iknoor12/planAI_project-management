import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const normalizeEmail = (email) => (
  typeof email === 'string' ? email.trim().toLowerCase() : ''
);

const objectIdMatches = (candidate, userId) => {
  if (!candidate || !userId) {
    return false;
  }

  const candidateId = candidate._id ? candidate._id.toString() : candidate.toString();
  return candidateId === userId.toString();
};

export const isProjectMember = (project, userId) => {
  if (!project || !userId || !Array.isArray(project.members)) {
    return false;
  }

  return project.members.some((member) => objectIdMatches(member, userId));
};

export const isProjectOwner = (project, userId) => {
  if (!project || !userId) {
    return false;
  }

  return objectIdMatches(project.owner, userId);
};

/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};
