import { Router } from 'express';
import * as ctrl from '../controllers/meetingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/',              ctrl.list);
router.get('/:id',           ctrl.getOne);
router.patch('/:id/cancel',  ctrl.cancel);
export default router;
