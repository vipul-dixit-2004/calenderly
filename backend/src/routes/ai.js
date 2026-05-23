import { Router } from 'express';
import * as ctrl from '../controllers/aiController.js';

const router = Router();
router.post('/chat', ctrl.chat);
export default router;
