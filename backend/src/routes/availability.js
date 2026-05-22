import { Router } from 'express';
import * as ctrl from '../controllers/availabilityController.js';

const router = Router();
router.get('/',                 ctrl.getSchedule);
router.put('/rules',            ctrl.upsertRules);
router.put('/timezone',         ctrl.updateTimezone);
router.get('/overrides',        ctrl.listOverrides);
router.post('/overrides',       ctrl.addOverride);
router.delete('/overrides/:id', ctrl.removeOverride);
export default router;
