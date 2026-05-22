import { Router } from 'express';
import * as ctrl from '../controllers/eventTypeController.js';

const router = Router();
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/toggle', ctrl.toggle);
export default router;