import { Request, Response, NextFunction } from 'express';
import * as studentService from '../services/student.service';
import { put } from '@vercel/blob';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

// ── Dashboard ──

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await studentService.getStudentDashboard(req.user!.userId);
    sendSuccess(res, 'Dashboard loaded successfully', data);
  } catch (error) {
    next(error);
  }
}

// ── Courses ──

export async function listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courses = await studentService.getEnrolledCourses(req.user!.userId);
    sendSuccess(res, 'Enrolled courses fetched successfully', { courses });
  } catch (error) {
    next(error);
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await studentService.getEnrolledCourseById(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Course fetched successfully', { course });
  } catch (error) {
    next(error);
  }
}

// ── Modules ──

export async function listModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modules = await studentService.getModulesForCourse(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Modules fetched successfully', modules);
  } catch (error) {
    next(error);
  }
}

// ── Announcements ──

export async function listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const announcements = await studentService.getAnnouncementsForCourse(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Announcements fetched successfully', announcements);
  } catch (error) {
    next(error);
  }
}

// ── Assignments ──

export async function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignments = await studentService.getAssignmentsForCourse(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Assignments fetched successfully', assignments);
  } catch (error) {
    next(error);
  }
}

export async function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await studentService.getAssignmentDetail(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Assignment fetched successfully', data);
  } catch (error) {
    next(error);
  }
}

// ── Submission Upload ──

export async function uploadSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw ApiError.badRequest('File is required');
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw ApiError.internal('BLOB_READ_WRITE_TOKEN is missing in the Vercel container. Please trigger a new deployment!');
    }

    const blob = await put(`submissions/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
      access: 'public',
    });

    const submission = await studentService.createOrReplaceSubmission(
      req.params.id as string,
      req.user!.userId,
      req.file,
      blob.url
    );

    sendSuccess(res, 'Submission uploaded successfully', { submission }, 201);
  } catch (error) {
    next(error);
  }
}

// ── Grades ──

export async function listGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await studentService.getStudentGrades(req.user!.userId);
    sendSuccess(res, 'Grades courses fetched successfully', data);
  } catch (error) {
    next(error);
  }
}

export async function getCourseGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await studentService.getStudentCourseGrades(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Course grades fetched successfully', data);
  } catch (error) {
    next(error);
  }
}
