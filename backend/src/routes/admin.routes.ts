import { Router } from 'express';
import { getDashboard, listRequests, approve, reject, listUsers, updateStatus, removeUser } from '../controllers/admin.controller';
import {
  listCourses,
  createCourseHandler,
  getCourse,
  updateCourseHandler,
  deleteCourseHandler,
  assignInstructorHandler,
  listEnrollments,
  enrollStudentHandler,
  unenrollStudentHandler,
} from '../controllers/course.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate, validateQuery, validateParams } from '../middlewares/validate.middleware';
import {
  listUsersQuerySchema,
  userIdParamSchema,
  updateUserStatusSchema,
  courseIdParamSchema,
  courseAndStudentParamSchema,
  courseSearchQuerySchema,
  createCourseSchema,
  updateCourseSchema,
  instructorAssignSchema,
  enrollmentBodySchema,
} from '../validators/admin.validator';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, authorize('admin'));

// ── Phase 7: Dashboard ──
router.get('/dashboard', getDashboard);

// ── Phase 1: Registration requests ──
router.get('/registration-requests', listRequests);
router.patch('/registration-requests/:id/approve', approve);
router.patch('/registration-requests/:id/reject', reject);

// ── Phase 2: User management ──
router.get('/users', validateQuery(listUsersQuerySchema), listUsers);
router.patch('/users/:id/status', validateParams(userIdParamSchema), validate(updateUserStatusSchema), updateStatus);
router.delete('/users/:id', validateParams(userIdParamSchema), removeUser);

// ── Phase 3: Course management ──
router.get('/courses', validateQuery(courseSearchQuerySchema), listCourses);
router.post('/courses', validate(createCourseSchema), createCourseHandler);
router.get('/courses/:id', validateParams(courseIdParamSchema), getCourse);
router.patch('/courses/:id', validateParams(courseIdParamSchema), validate(updateCourseSchema), updateCourseHandler);
router.delete('/courses/:id', validateParams(courseIdParamSchema), deleteCourseHandler);

// Instructor assignment
router.patch('/courses/:id/instructor', validateParams(courseIdParamSchema), validate(instructorAssignSchema), assignInstructorHandler);

// Enrollment management
router.get('/courses/:id/enrollments', validateParams(courseIdParamSchema), listEnrollments);
router.post('/courses/:id/enrollments', validateParams(courseIdParamSchema), validate(enrollmentBodySchema), enrollStudentHandler);
router.delete('/courses/:id/enrollments/:studentId', validateParams(courseAndStudentParamSchema), unenrollStudentHandler);

export default router;

