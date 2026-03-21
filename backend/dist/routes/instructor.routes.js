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
const instructor_validator_1 = require("../validators/instructor.validator");
const upload_1 = require("../config/upload");
const ctrl = __importStar(require("../controllers/instructor.controller"));
const router = (0, express_1.Router)();
// All instructor routes require authentication + instructor role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('instructor'));
// ── Dashboard ──
router.get('/dashboard', ctrl.getDashboard);
// ── Courses ──
router.get('/courses', ctrl.listCourses);
router.get('/courses/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), ctrl.getCourse);
// ── Modules ──
router.get('/courses/:id/modules', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), ctrl.listModules);
router.post('/courses/:id/modules', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.createModuleSchema), ctrl.createModule);
router.patch('/modules/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.moduleIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.updateModuleSchema), ctrl.updateModule);
router.delete('/modules/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.moduleIdParamSchema), ctrl.deleteModule);
// ── Materials ──
router.post('/modules/:id/materials', (0, validate_middleware_1.validateParams)(instructor_validator_1.moduleIdParamSchema), upload_1.materialUpload.single('file'), ctrl.uploadMaterial);
router.delete('/materials/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.materialIdParamSchema), ctrl.deleteMaterial);
// ── Announcements ──
router.get('/courses/:id/announcements', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), ctrl.listAnnouncements);
router.post('/courses/:id/announcements', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.createAnnouncementSchema), ctrl.createAnnouncement);
router.patch('/announcements/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.announcementIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.updateAnnouncementSchema), ctrl.updateAnnouncement);
router.delete('/announcements/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.announcementIdParamSchema), ctrl.deleteAnnouncement);
// ── Assignments (Phase 5) ──
router.get('/courses/:id/assignments', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), ctrl.listAssignments);
router.post('/courses/:id/assignments', (0, validate_middleware_1.validateParams)(instructor_validator_1.courseIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.createAssignmentSchema), ctrl.createAssignment);
router.get('/assignments/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.assignmentIdParamSchema), ctrl.getAssignment);
router.patch('/assignments/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.assignmentIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.updateAssignmentSchema), ctrl.updateAssignment);
router.delete('/assignments/:id', (0, validate_middleware_1.validateParams)(instructor_validator_1.assignmentIdParamSchema), ctrl.deleteAssignment);
// ── Submissions (Phase 5) ──
router.get('/assignments/:id/submissions', (0, validate_middleware_1.validateParams)(instructor_validator_1.assignmentIdParamSchema), ctrl.listSubmissions);
router.get('/submissions/overview', ctrl.getSubmissionsOverview);
router.patch('/submissions/:id/grade', (0, validate_middleware_1.validateParams)(instructor_validator_1.submissionIdParamSchema), (0, validate_middleware_1.validate)(instructor_validator_1.gradeSubmissionSchema), ctrl.gradeSubmission);
exports.default = router;
//# sourceMappingURL=instructor.routes.js.map