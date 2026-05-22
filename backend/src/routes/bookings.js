import { Router } from 'express';
import * as ctrl from '../controllers/bookingController.js';

const router = Router();
router.get('/:username/:slug',       ctrl.getEventBySlug);
router.get('/:username/:slug/slots', ctrl.getAvailableSlots);
router.post('/:username/:slug',      ctrl.createBooking);
export default router;
