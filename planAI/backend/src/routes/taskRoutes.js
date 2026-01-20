import express from 'express';
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Task Routes
 * All routes are protected (require authentication)
 */

router.use(protect);

router.route('/')
  .post(createTask);

router.route('/project/:projectId')
  .get(getTasksByProject);

router.route('/stats/:projectId')
  .get(getTaskStats);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

export default router;
