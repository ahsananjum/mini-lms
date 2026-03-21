import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'student' | 'instructor';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'instructor'],
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
