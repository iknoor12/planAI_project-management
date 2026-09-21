import express from 'express';
import {
  getNotesByProject,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/project/:projectId')
  .get(getNotesByProject);

router.route('/')
  .post(createNote);

router.route('/:noteId')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

export default router;
