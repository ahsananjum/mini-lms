import { Request, Response, NextFunction } from 'express';
import {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignInstructor,
  getEnrollments,
  enrollStudent,
  unenrollStudent,
} from '../services/course.service';
import { sendSuccess } from '../utils/apiResponse';

export async function listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search } = req.query;
    const courses = await getCourses({ search: search as string | undefined });
    sendSuccess(res, 'Courses fetched successfully', { courses });
  } catch (error) {
    next(error);
  }
}

export async function createCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await createCourse(req.body);
    sendSuccess(res, 'Course created successfully', { course }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await getCourseById(req.params.id as string);
    sendSuccess(res, 'Course fetched successfully', { course });
  } catch (error) {
    next(error);
  }
}

export async function updateCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await updateCourse(req.params.id as string, req.body);
    sendSuccess(res, 'Course updated successfully', { course });
  } catch (error) {
    next(error);
  }
}

export async function deleteCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteCourse(req.params.id as string);
    sendSuccess(res, 'Course deleted successfully', {});
  } catch (error) {
    next(error);
  }
}

export async function assignInstructorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { instructorId } = req.body;
    const course = await assignInstructor(req.params.id as string, instructorId);
    sendSuccess(res, 'Instructor updated successfully', { course });
  } catch (error) {
    next(error);
  }
}

export async function listEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollments = await getEnrollments(req.params.id as string);
    sendSuccess(res, 'Enrollments fetched successfully', { enrollments });
  } catch (error) {
    next(error);
  }
}

export async function enrollStudentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { studentId } = req.body;
    const enrollment = await enrollStudent(req.params.id as string, studentId);
    sendSuccess(res, 'Student enrolled successfully', { enrollment }, 201);
  } catch (error) {
    next(error);
  }
}

export async function unenrollStudentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await unenrollStudent(req.params.id as string, req.params.studentId as string);
    sendSuccess(res, 'Student removed from course successfully', {});
  } catch (error) {
    next(error);
  }
}
