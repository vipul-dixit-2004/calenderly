import { Router } from 'express';
import * as ctrl from '../controllers/meetingController.js';

const router = Router();
router.get('/',              ctrl.list);
router.get('/:id',           ctrl.getOne);
router.patch('/:id/cancel',  ctrl.cancel);
export default router;
