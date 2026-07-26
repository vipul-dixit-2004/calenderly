import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { verifyTransport } from './services/mail/index.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import errorHandler from './middleware/errorHandler.js';
import eventTypeRoutes from './routes/eventTypes.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import meetingRoutes from './routes/meetings.js';
import aiRoutes from './routes/ai.js';

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://calenderly.vipuldixit.tech',
  ],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await verifyTransport();
});