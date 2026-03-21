import { z } from 'zod';
import mongoose from 'mongoose';

const isObjectId = (val: string) => mongoose.Types.ObjectId.isValid(val);

// ── Param schemas ──

export const courseIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid course ID format' }),
});

export const moduleIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid module ID format' }),
});

export const materialIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid material ID format' }),
});

export const announcementIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid announcement ID format' }),
});

// ── Module body schemas ──

export const createModuleSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters').optional().default(''),
});

export const updateModuleSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters').optional(),
  description: z.string().trim().max(500, 'Description must be at most 500 characters').optional(),
});

// ── Announcement body schemas ──

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters'),
  message: z.string().trim().min(3, 'Message must be at least 3 characters').max(2000, 'Message must be at most 2000 characters'),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters').optional(),
  message: z.string().trim().min(3, 'Message must be at least 3 characters').max(2000, 'Message must be at most 2000 characters').optional(),
});

// ── Material text field schema (for multipart forms) ──

export const materialFieldsSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters').optional().default(''),
});

// ── Phase 5: Assignment schemas ──

export const assignmentIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid assignment ID format' }),
});

export const submissionIdParamSchema = z.object({
  id: z.string().refine(isObjectId, { message: 'Invalid submission ID format' }),
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().trim().max(2000, 'Description must be at most 2000 characters').optional().default(''),
  dueDate: z.string().min(1, 'Due date is required'),
  totalMarks: z.number().int().min(1, 'Total marks must be at least 1'),
});

export const updateAssignmentSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200, 'Title must be at most 200 characters').optional(),
  description: z.string().trim().max(2000, 'Description must be at most 2000 characters').optional(),
  dueDate: z.string().optional(),
  totalMarks: z.number().int().min(1, 'Total marks must be at least 1').optional(),
});

export const gradeSubmissionSchema = z.object({
  marks: z.number().min(0, 'Marks cannot be negative'),
  feedback: z.string().trim().max(2000, 'Feedback must be at most 2000 characters').optional().default(''),
});
