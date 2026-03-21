import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;

  try {
    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}
