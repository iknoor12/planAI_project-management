import express from 'express';
import { getPublicProjectByToken } from '../controllers/projectController.js';

const router = express.Router();

router.get('/share/:token', getPublicProjectByToken);

export default router;