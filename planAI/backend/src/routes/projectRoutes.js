import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectAnalytics,
  getProjectSharing,
  enableProjectSharing,
  disableProjectSharing,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Project Routes
 * All routes are protected (require authentication)
 */

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id/members')
  .post(addProjectMember);

router.route('/:id/members/:memberId')
  .delete(removeProjectMember);

router.route('/:projectId/analytics')
  .get(getProjectAnalytics);

router.route('/:id/share')
  .get(getProjectSharing)
  .post(enableProjectSharing)
  .delete(disableProjectSharing);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

export default router;
