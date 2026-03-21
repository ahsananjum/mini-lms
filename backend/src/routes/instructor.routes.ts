import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate, validateParams } from '../middlewares/validate.middleware';
import {
  courseIdParamSchema,
  moduleIdParamSchema,
  materialIdParamSchema,
  announcementIdParamSchema,
  createModuleSchema,
  updateModuleSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  assignmentIdParamSchema,
  submissionIdParamSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  gradeSubmissionSchema,
} from '../validators/instructor.validator';
import { materialUpload } from '../config/upload';
import * as ctrl from '../controllers/instructor.controller';

const router = Router();

// All instructor routes require authentication + instructor role
router.use(authenticate, authorize('instructor'));

// ── Dashboard ──
router.get('/dashboard', ctrl.getDashboard);

// ── Courses ──
router.get('/courses', ctrl.listCourses);
router.get('/courses/:id', validateParams(courseIdParamSchema), ctrl.getCourse);

// ── Modules ──
router.get('/courses/:id/modules', validateParams(courseIdParamSchema), ctrl.listModules);
router.post('/courses/:id/modules', validateParams(courseIdParamSchema), validate(createModuleSchema), ctrl.createModule);
router.patch('/modules/:id', validateParams(moduleIdParamSchema), validate(updateModuleSchema), ctrl.updateModule);
router.delete('/modules/:id', validateParams(moduleIdParamSchema), ctrl.deleteModule);

// ── Materials ──
router.post('/modules/:id/materials', validateParams(moduleIdParamSchema), materialUpload.single('file'), ctrl.uploadMaterial);
router.delete('/materials/:id', validateParams(materialIdParamSchema), ctrl.deleteMaterial);

// ── Announcements ──
router.get('/courses/:id/announcements', validateParams(courseIdParamSchema), ctrl.listAnnouncements);
router.post('/courses/:id/announcements', validateParams(courseIdParamSchema), validate(createAnnouncementSchema), ctrl.createAnnouncement);
router.patch('/announcements/:id', validateParams(announcementIdParamSchema), validate(updateAnnouncementSchema), ctrl.updateAnnouncement);
router.delete('/announcements/:id', validateParams(announcementIdParamSchema), ctrl.deleteAnnouncement);

// ── Assignments (Phase 5) ──
router.get('/courses/:id/assignments', validateParams(courseIdParamSchema), ctrl.listAssignments);
router.post('/courses/:id/assignments', validateParams(courseIdParamSchema), validate(createAssignmentSchema), ctrl.createAssignment);
router.get('/assignments/:id', validateParams(assignmentIdParamSchema), ctrl.getAssignment);
router.patch('/assignments/:id', validateParams(assignmentIdParamSchema), validate(updateAssignmentSchema), ctrl.updateAssignment);
router.delete('/assignments/:id', validateParams(assignmentIdParamSchema), ctrl.deleteAssignment);

// ── Submissions (Phase 5) ──
router.get('/assignments/:id/submissions', validateParams(assignmentIdParamSchema), ctrl.listSubmissions);
router.get('/submissions/overview', ctrl.getSubmissionsOverview);
router.patch('/submissions/:id/grade', validateParams(submissionIdParamSchema), validate(gradeSubmissionSchema), ctrl.gradeSubmission);

export default router;
