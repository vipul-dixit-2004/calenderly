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

const allowedOrigins = [
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://calenderly.vipuldixit.tech'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server, curl, Postman) or matching domains
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vipuldixit.tech') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie', 'x-user-id'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Health check / testing root routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Calenderly API is running smoothly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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