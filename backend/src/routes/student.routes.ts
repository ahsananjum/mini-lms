import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validateParams } from '../middlewares/validate.middleware';
import {
  courseIdParamSchema,
  assignmentIdParamSchema,
} from '../validators/student.validator';
import { submissionUpload } from '../config/upload';
import * as ctrl from '../controllers/student.controller';

const router = Router();

// All student routes require authentication + student role
router.use(authenticate, authorize('student'));

// ── Dashboard ──
router.get('/dashboard', ctrl.getDashboard);

// ── Courses ──
router.get('/courses', ctrl.listCourses);
router.get('/courses/:id', validateParams(courseIdParamSchema), ctrl.getCourse);

// ── Modules ──
router.get('/courses/:id/modules', validateParams(courseIdParamSchema), ctrl.listModules);

// ── Announcements ──
router.get('/courses/:id/announcements', validateParams(courseIdParamSchema), ctrl.listAnnouncements);

// ── Assignments ──
router.get('/courses/:id/assignments', validateParams(courseIdParamSchema), ctrl.listAssignments);
router.get('/assignments/:id', validateParams(assignmentIdParamSchema), ctrl.getAssignment);

// ── Submission Upload ──
router.post('/assignments/:id/submission', validateParams(assignmentIdParamSchema), submissionUpload.single('file'), ctrl.uploadSubmission);

// ── Grades ──
router.get('/grades', ctrl.listGrades);
router.get('/courses/:id/grades', validateParams(courseIdParamSchema), ctrl.getCourseGrades);

export default router;
