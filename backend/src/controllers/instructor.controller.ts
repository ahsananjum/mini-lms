import { Request, Response, NextFunction } from 'express';
import * as instructorService from '../services/instructor.service';
import { sendSuccess } from '../utils/apiResponse';
import { materialFieldsSchema } from '../validators/instructor.validator';
import { ApiError } from '../utils/ApiError';

// ── DASHBOARD ──

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await instructorService.getInstructorDashboard(req.user!.userId);
    sendSuccess(res, 'Dashboard loaded successfully', data);
  } catch (error) {
    next(error);
  }
}

// ── COURSES ──

export async function listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courses = await instructorService.getInstructorCourses(req.user!.userId);
    sendSuccess(res, 'Courses fetched successfully', { courses });
  } catch (error) {
    next(error);
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await instructorService.getInstructorCourseById(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Course fetched successfully', { course });
  } catch (error) {
    next(error);
  }
}

// ── MODULES ──

export async function listModules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const modules = await instructorService.getModulesForCourse(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Modules fetched successfully', modules);
  } catch (error) {
    next(error);
  }
}

export async function createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const mod = await instructorService.createModule(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Module created successfully', { module: mod }, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const mod = await instructorService.updateModule(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Module updated successfully', { module: mod });
  } catch (error) {
    next(error);
  }
}

export async function deleteModule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await instructorService.deleteModule(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Module deleted successfully', {});
  } catch (error) {
    next(error);
  }
}

// ── MATERIALS ──

export async function uploadMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw ApiError.badRequest('File is required');
    }

    const parsed = materialFieldsSchema.safeParse(req.body);
    if (!parsed.success) {
      const fs = await import('fs');
      if (req.file.path) fs.unlinkSync(req.file.path);
      const messages = parsed.error.issues.map((i) => i.message);
      throw ApiError.badRequest('Validation failed', messages);
    }

    const material = await instructorService.createMaterial(
      req.params.id as string,
      req.user!.userId,
      parsed.data,
      req.file
    );
    sendSuccess(res, 'Material uploaded successfully', { material }, 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await instructorService.deleteMaterial(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Material deleted successfully', {});
  } catch (error) {
    next(error);
  }
}

// ── ANNOUNCEMENTS ──

export async function listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const announcements = await instructorService.getAnnouncementsForCourse(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Announcements fetched successfully', announcements);
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const announcement = await instructorService.createAnnouncement(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Announcement created successfully', { announcement }, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const announcement = await instructorService.updateAnnouncement(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Announcement updated successfully', { announcement });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await instructorService.deleteAnnouncement(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Announcement deleted successfully', {});
  } catch (error) {
    next(error);
  }
}

// ── ASSIGNMENTS (Phase 5) ──

export async function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignments = await instructorService.getAssignmentsForCourse(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Assignments fetched successfully', assignments);
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await instructorService.createAssignment(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Assignment created successfully', { assignment }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await instructorService.getAssignmentById(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Assignment fetched successfully', { assignment });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await instructorService.updateAssignment(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Assignment updated successfully', { assignment });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await instructorService.deleteAssignment(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Assignment deleted successfully', {});
  } catch (error) {
    next(error);
  }
}

// ── SUBMISSIONS (Phase 5) ──

export async function listSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await instructorService.getSubmissionsForAssignment(req.params.id as string, req.user!.userId);
    sendSuccess(res, 'Submissions fetched successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await instructorService.gradeSubmission(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, 'Submission graded successfully', { submission });
  } catch (error) {
    next(error);
  }
}

// ── Submissions Overview ──

export async function getSubmissionsOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await instructorService.getSubmissionsOverview(req.user!.userId);
    sendSuccess(res, 'Instructor submissions overview fetched successfully', data);
  } catch (error) {
    next(error);
  }
}
