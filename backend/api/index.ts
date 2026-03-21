import app from '../src/app';
import { connectDB } from '../src/config/db';

let isDbConnected = false;

app.use(async (req, res, next) => {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
  next();
});

export default app;
