import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { corsOptions } from './config/cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { sendSuccess } from './utils/apiResponse';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import instructorRoutes from './routes/instructor.routes';
import studentRoutes from './routes/student.routes';

const app = express();

// Trust proxy for Vercel deployment so secure cookies are correctly handled
app.set('trust proxy', 1);

// Core middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health endpoints
app.get('/api/health', (req, res) => {
  sendSuccess(res, 'API is running', { service: 'mini-lms-backend' });
});

app.get('/health', (req, res) => {
  sendSuccess(res, 'API is running', { service: 'mini-lms-backend' });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Mini-LMS Backend is seamlessly deployed and running successfully on Vercel!'
  });
});

// Route scaffolds
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);

// Error handling
app.use(errorMiddleware);

export default app;
