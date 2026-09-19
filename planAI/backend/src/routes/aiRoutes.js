import express from 'express';
import {
  generateTasks,
  generateProjectTasks,
  generateSubtasks,
  analyzeDelays,
  aiChat,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * AI Routes
 * All routes are protected (require authentication)
 */

router.use(protect);

router.post('/generate-tasks', generateTasks);
router.post('/projects/:projectId/generate-tasks', generateProjectTasks);
router.post('/generate-subtasks', generateSubtasks);
router.post('/analyze-delays', analyzeDelays);
router.post('/chat', aiChat);

export default router;
