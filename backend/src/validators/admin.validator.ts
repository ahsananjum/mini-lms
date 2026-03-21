import { z } from 'zod';
import mongoose from 'mongoose';

// ── Phase 1 ──
export const updateRequestStatusSchema = z.object({
  status: z.enum(['active', 'rejected'], {
    error: 'Status must be active or rejected',
  }),
});

// ── Phase 2 ──
export const listUsersQuerySchema = z.object({
  role: z.enum(['all', 'student', 'instructor']).optional().default('all'),
  status: z.enum(['all', 'active', 'rejected']).optional().default('all'),
  search: z.string().optional().default(''),
});

export const userIdParamSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid user ID format',
  }),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'rejected'], {
    error: 'Status must be active or rejected',
  }),
});

// ── Phase 3: Courses ──

const isObjectId = (val: string) => mongoose.Types.ObjectId.isValid(val);

export const courseIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid course ID format' }),
});

export const courseAndStudentParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid course ID format' }),
  studentId: z.string().refine(isObjectId, { message: 'Invalid student ID format' }),
});

export const courseSearchQuerySchema = z.object({
  search: z.string().optional().default(''),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  code: z.string().min(1, 'Code is required').max(20),
  description: z.string().min(1, 'Description is required').max(2000),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  code: z.string().min(1, 'Code is required').max(20).optional(),
  description: z.string().min(1, 'Description is required').max(2000).optional(),
});

export const instructorAssignSchema = z.object({
  instructorId: z
    .string()
    .nullable()
    .refine((val) => val === null || isObjectId(val), {
      message: 'Invalid instructor ID format',
    }),
});

export const enrollmentBodySchema = z.object({
  studentId: z.string().refine(isObjectId, { message: 'Invalid student ID format' }),
});

