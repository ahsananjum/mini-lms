"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const course_controller_1 = require("../controllers/course.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const admin_validator_1 = require("../validators/admin.validator");
const router = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('admin'));
// ── Phase 7: Dashboard ──
router.get('/dashboard', admin_controller_1.getDashboard);
// ── Phase 1: Registration requests ──
router.get('/registration-requests', admin_controller_1.listRequests);
router.patch('/registration-requests/:id/approve', admin_controller_1.approve);
router.patch('/registration-requests/:id/reject', admin_controller_1.reject);
// ── Phase 2: User management ──
router.get('/users', (0, validate_middleware_1.validateQuery)(admin_validator_1.listUsersQuerySchema), admin_controller_1.listUsers);
router.patch('/users/:id/status', (0, validate_middleware_1.validateParams)(admin_validator_1.userIdParamSchema), (0, validate_middleware_1.validate)(admin_validator_1.updateUserStatusSchema), admin_controller_1.updateStatus);
router.delete('/users/:id', (0, validate_middleware_1.validateParams)(admin_validator_1.userIdParamSchema), admin_controller_1.removeUser);
// ── Phase 3: Course management ──
router.get('/courses', (0, validate_middleware_1.validateQuery)(admin_validator_1.courseSearchQuerySchema), course_controller_1.listCourses);
router.post('/courses', (0, validate_middleware_1.validate)(admin_validator_1.createCourseSchema), course_controller_1.createCourseHandler);
router.get('/courses/:id', (0, validate_middleware_1.validateParams)(admin_validator_1.courseIdParamSchema), course_controller_1.getCourse);
router.patch('/courses/:id', (0, validate_middleware_1.validateParams)(admin_validator_1.courseIdParamSchema), (0, validate_middleware_1.validate)(admin_validator_1.updateCourseSchema), course_controller_1.updateCourseHandler);
router.delete('/courses/:id', (0, validate_middleware_1.validateParams)(admin_validator_1.courseIdParamSchema), course_controller_1.deleteCourseHandler);
// Instructor assignment
router.patch('/courses/:id/instructor', (0, validate_middleware_1.validateParams)(admin_validator_1.courseIdParamSchema), (0, validate_middleware_1.validate)(admin_validator_1.instructorAssignSchema), course_controller_1.assignInstructorHandler);
// Enrollment management
router.get('/courses/:id/enrollments', (0, validate_middleware_1.validateParams)(admin_validator_1.courseIdParamSchema), course_controller_1.listEnrollments);
router.post('/courses/:id/enrollments', (0, validate_middleware_1.validateParams)(admin_validator_1.courseIdParamSchema), (0, validate_middleware_1.validate)(admin_validator_1.enrollmentBodySchema), course_controller_1.enrollStudentHandler);
router.delete('/courses/:id/enrollments/:studentId', (0, validate_middleware_1.validateParams)(admin_validator_1.courseAndStudentParamSchema), course_controller_1.unenrollStudentHandler);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map