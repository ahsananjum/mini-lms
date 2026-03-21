"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const student_validator_1 = require("../validators/student.validator");
const upload_1 = require("../config/upload");
const ctrl = __importStar(require("../controllers/student.controller"));
const router = (0, express_1.Router)();
// All student routes require authentication + student role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('student'));
// ── Dashboard ──
router.get('/dashboard', ctrl.getDashboard);
// ── Courses ──
router.get('/courses', ctrl.listCourses);
router.get('/courses/:id', (0, validate_middleware_1.validateParams)(student_validator_1.courseIdParamSchema), ctrl.getCourse);
// ── Modules ──
router.get('/courses/:id/modules', (0, validate_middleware_1.validateParams)(student_validator_1.courseIdParamSchema), ctrl.listModules);
// ── Announcements ──
router.get('/courses/:id/announcements', (0, validate_middleware_1.validateParams)(student_validator_1.courseIdParamSchema), ctrl.listAnnouncements);
// ── Assignments ──
router.get('/courses/:id/assignments', (0, validate_middleware_1.validateParams)(student_validator_1.courseIdParamSchema), ctrl.listAssignments);
router.get('/assignments/:id', (0, validate_middleware_1.validateParams)(student_validator_1.assignmentIdParamSchema), ctrl.getAssignment);
// ── Submission Upload ──
router.post('/assignments/:id/submission', (0, validate_middleware_1.validateParams)(student_validator_1.assignmentIdParamSchema), upload_1.submissionUpload.single('file'), ctrl.uploadSubmission);
// ── Grades ──
router.get('/grades', ctrl.listGrades);
router.get('/courses/:id/grades', (0, validate_middleware_1.validateParams)(student_validator_1.courseIdParamSchema), ctrl.getCourseGrades);
exports.default = router;
//# sourceMappingURL=student.routes.js.map