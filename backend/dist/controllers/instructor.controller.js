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
exports.getDashboard = getDashboard;
exports.listCourses = listCourses;
exports.getCourse = getCourse;
exports.listModules = listModules;
exports.createModule = createModule;
exports.updateModule = updateModule;
exports.deleteModule = deleteModule;
exports.uploadMaterial = uploadMaterial;
exports.deleteMaterial = deleteMaterial;
exports.listAnnouncements = listAnnouncements;
exports.createAnnouncement = createAnnouncement;
exports.updateAnnouncement = updateAnnouncement;
exports.deleteAnnouncement = deleteAnnouncement;
exports.listAssignments = listAssignments;
exports.createAssignment = createAssignment;
exports.getAssignment = getAssignment;
exports.updateAssignment = updateAssignment;
exports.deleteAssignment = deleteAssignment;
exports.listSubmissions = listSubmissions;
exports.gradeSubmission = gradeSubmission;
exports.getSubmissionsOverview = getSubmissionsOverview;
const instructorService = __importStar(require("../services/instructor.service"));
const apiResponse_1 = require("../utils/apiResponse");
const instructor_validator_1 = require("../validators/instructor.validator");
const ApiError_1 = require("../utils/ApiError");
// ── DASHBOARD ──
async function getDashboard(req, res, next) {
    try {
        const data = await instructorService.getInstructorDashboard(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Dashboard loaded successfully', data);
    }
    catch (error) {
        next(error);
    }
}
// ── COURSES ──
async function listCourses(req, res, next) {
    try {
        const courses = await instructorService.getInstructorCourses(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Courses fetched successfully', { courses });
    }
    catch (error) {
        next(error);
    }
}
async function getCourse(req, res, next) {
    try {
        const course = await instructorService.getInstructorCourseById(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Course fetched successfully', { course });
    }
    catch (error) {
        next(error);
    }
}
// ── MODULES ──
async function listModules(req, res, next) {
    try {
        const modules = await instructorService.getModulesForCourse(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Modules fetched successfully', modules);
    }
    catch (error) {
        next(error);
    }
}
async function createModule(req, res, next) {
    try {
        const mod = await instructorService.createModule(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Module created successfully', { module: mod }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function updateModule(req, res, next) {
    try {
        const mod = await instructorService.updateModule(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Module updated successfully', { module: mod });
    }
    catch (error) {
        next(error);
    }
}
async function deleteModule(req, res, next) {
    try {
        await instructorService.deleteModule(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Module deleted successfully', {});
    }
    catch (error) {
        next(error);
    }
}
// ── MATERIALS ──
async function uploadMaterial(req, res, next) {
    try {
        if (!req.file) {
            throw ApiError_1.ApiError.badRequest('File is required');
        }
        const parsed = instructor_validator_1.materialFieldsSchema.safeParse(req.body);
        if (!parsed.success) {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            if (req.file.path)
                fs.unlinkSync(req.file.path);
            const messages = parsed.error.issues.map((i) => i.message);
            throw ApiError_1.ApiError.badRequest('Validation failed', messages);
        }
        const material = await instructorService.createMaterial(req.params.id, req.user.userId, parsed.data, req.file);
        (0, apiResponse_1.sendSuccess)(res, 'Material uploaded successfully', { material }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function deleteMaterial(req, res, next) {
    try {
        await instructorService.deleteMaterial(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Material deleted successfully', {});
    }
    catch (error) {
        next(error);
    }
}
// ── ANNOUNCEMENTS ──
async function listAnnouncements(req, res, next) {
    try {
        const announcements = await instructorService.getAnnouncementsForCourse(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Announcements fetched successfully', announcements);
    }
    catch (error) {
        next(error);
    }
}
async function createAnnouncement(req, res, next) {
    try {
        const announcement = await instructorService.createAnnouncement(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Announcement created successfully', { announcement }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function updateAnnouncement(req, res, next) {
    try {
        const announcement = await instructorService.updateAnnouncement(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Announcement updated successfully', { announcement });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAnnouncement(req, res, next) {
    try {
        await instructorService.deleteAnnouncement(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Announcement deleted successfully', {});
    }
    catch (error) {
        next(error);
    }
}
// ── ASSIGNMENTS (Phase 5) ──
async function listAssignments(req, res, next) {
    try {
        const assignments = await instructorService.getAssignmentsForCourse(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Assignments fetched successfully', assignments);
    }
    catch (error) {
        next(error);
    }
}
async function createAssignment(req, res, next) {
    try {
        const assignment = await instructorService.createAssignment(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Assignment created successfully', { assignment }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function getAssignment(req, res, next) {
    try {
        const assignment = await instructorService.getAssignmentById(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Assignment fetched successfully', { assignment });
    }
    catch (error) {
        next(error);
    }
}
async function updateAssignment(req, res, next) {
    try {
        const assignment = await instructorService.updateAssignment(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Assignment updated successfully', { assignment });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAssignment(req, res, next) {
    try {
        await instructorService.deleteAssignment(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Assignment deleted successfully', {});
    }
    catch (error) {
        next(error);
    }
}
// ── SUBMISSIONS (Phase 5) ──
async function listSubmissions(req, res, next) {
    try {
        const rows = await instructorService.getSubmissionsForAssignment(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Submissions fetched successfully', rows);
    }
    catch (error) {
        next(error);
    }
}
async function gradeSubmission(req, res, next) {
    try {
        const submission = await instructorService.gradeSubmission(req.params.id, req.user.userId, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Submission graded successfully', { submission });
    }
    catch (error) {
        next(error);
    }
}
// ── Submissions Overview ──
async function getSubmissionsOverview(req, res, next) {
    try {
        const data = await instructorService.getSubmissionsOverview(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Instructor submissions overview fetched successfully', data);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=instructor.controller.js.map