import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';

async function seedAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Database connected');

    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists with email: ${env.ADMIN_EMAIL}`);
      console.log('   Skipping seed.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

    const admin = await User.create({
      name: 'Admin',
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log(`   Status: ${admin.status}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
