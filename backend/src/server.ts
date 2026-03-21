import { env } from './config/env';
import { connectDB } from './config/db';
import { Assignment } from './models/Assignment';
import app from './app';

async function runMigrations() {
  // One-time migration: backfill gradingType for old assignments
  const result = await Assignment.updateMany(
    { gradingType: { $exists: false } },
    { $set: { gradingType: 'graded' } }
  );
  if (result.modifiedCount > 0) {
    console.log(`🔄 Migration: Set gradingType='graded' on ${result.modifiedCount} old assignments`);
  }
}

async function startServer() {
  try {
    await connectDB();
    await runMigrations();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
