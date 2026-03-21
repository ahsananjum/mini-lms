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
exports.listAnnouncements = listAnnouncements;
exports.listAssignments = listAssignments;
exports.getAssignment = getAssignment;
exports.uploadSubmission = uploadSubmission;
exports.listGrades = listGrades;
exports.getCourseGrades = getCourseGrades;
const studentService = __importStar(require("../services/student.service"));
const apiResponse_1 = require("../utils/apiResponse");
const ApiError_1 = require("../utils/ApiError");
// ── Dashboard ──
async function getDashboard(req, res, next) {
    try {
        const data = await studentService.getStudentDashboard(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Dashboard loaded successfully', data);
    }
    catch (error) {
        next(error);
    }
}
// ── Courses ──
async function listCourses(req, res, next) {
    try {
        const courses = await studentService.getEnrolledCourses(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Enrolled courses fetched successfully', { courses });
    }
    catch (error) {
        next(error);
    }
}
async function getCourse(req, res, next) {
    try {
        const course = await studentService.getEnrolledCourseById(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Course fetched successfully', { course });
    }
    catch (error) {
        next(error);
    }
}
// ── Modules ──
async function listModules(req, res, next) {
    try {
        const modules = await studentService.getModulesForCourse(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Modules fetched successfully', modules);
    }
    catch (error) {
        next(error);
    }
}
// ── Announcements ──
async function listAnnouncements(req, res, next) {
    try {
        const announcements = await studentService.getAnnouncementsForCourse(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Announcements fetched successfully', announcements);
    }
    catch (error) {
        next(error);
    }
}
// ── Assignments ──
async function listAssignments(req, res, next) {
    try {
        const assignments = await studentService.getAssignmentsForCourse(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Assignments fetched successfully', assignments);
    }
    catch (error) {
        next(error);
    }
}
async function getAssignment(req, res, next) {
    try {
        const data = await studentService.getAssignmentDetail(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Assignment fetched successfully', data);
    }
    catch (error) {
        next(error);
    }
}
// ── Submission Upload ──
async function uploadSubmission(req, res, next) {
    try {
        if (!req.file) {
            throw ApiError_1.ApiError.badRequest('File is required');
        }
        const submission = await studentService.createOrReplaceSubmission(req.params.id, req.user.userId, req.file);
        (0, apiResponse_1.sendSuccess)(res, 'Submission uploaded successfully', { submission }, 201);
    }
    catch (error) {
        next(error);
    }
}
// ── Grades ──
async function listGrades(req, res, next) {
    try {
        const data = await studentService.getStudentGrades(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Grades courses fetched successfully', data);
    }
    catch (error) {
        next(error);
    }
}
async function getCourseGrades(req, res, next) {
    try {
        const data = await studentService.getStudentCourseGrades(req.params.id, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Course grades fetched successfully', data);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=student.controller.js.map