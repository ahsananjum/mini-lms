import app from '../src/app';
import { connectDB } from '../src/config/db';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database connection failed. Please ensure MONGODB_URI is set in Vercel Environment Variables and your MongoDB Atlas Network Access is set to allow all IPs (0.0.0.0/0).' 
    });
  }
  
  return app(req, res);
}
