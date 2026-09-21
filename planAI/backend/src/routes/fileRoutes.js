import express from 'express';
import {
  getFilesByProject,
  getFileById,
  getFilePreviewUrl,
  getFileDownloadUrl,
  uploadProjectFile,
  deleteFile,
  upload,
} from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/project/:projectId')
  .get(getFilesByProject)
  .post(upload.single('file'), uploadProjectFile);

router.route('/:fileId/preview')
  .get(getFilePreviewUrl);

router.route('/:fileId/download')
  .get(getFileDownloadUrl);

router.route('/:fileId')
  .get(getFileById)
  .delete(deleteFile);

export default router;