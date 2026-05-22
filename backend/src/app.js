import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import userRoutes from './routes/users.js';
import errorHandler from './middleware/errorHandler.js';
import eventTypeRoutes from './routes/eventTypes.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import meetingRoutes from './routes/meetings.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/meetings', meetingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));