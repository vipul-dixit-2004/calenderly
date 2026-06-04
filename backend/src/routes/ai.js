import { Router } from 'express';
import * as ctrl from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/chat', requireAuth, ctrl.chat);
export default router;
