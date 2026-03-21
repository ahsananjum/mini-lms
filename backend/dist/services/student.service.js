"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentDashboard = getStudentDashboard;
exports.getEnrolledCourses = getEnrolledCourses;
exports.getEnrolledCourseById = getEnrolledCourseById;
exports.getModulesForCourse = getModulesForCourse;
exports.getAnnouncementsForCourse = getAnnouncementsForCourse;
exports.getAssignmentsForCourse = getAssignmentsForCourse;
exports.getAssignmentDetail = getAssignmentDetail;
exports.createOrReplaceSubmission = createOrReplaceSubmission;
exports.getStudentGrades = getStudentGrades;
exports.getStudentCourseGrades = getStudentCourseGrades;
const Course_1 = require("../models/Course");
const Enrollment_1 = require("../models/Enrollment");
const Module_1 = require("../models/Module");
const Material_1 = require("../models/Material");
const Announcement_1 = require("../models/Announcement");
const Assignment_1 = require("../models/Assignment");
const Submission_1 = require("../models/Submission");
const ApiError_1 = require("../utils/ApiError");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ── Helper: verify student is enrolled in the course ──
async function verifyEnrollment(courseId, studentId) {
    const enrollment = await Enrollment_1.Enrollment.findOne({ course: courseId, student: studentId });
    if (!enrollment)
        throw ApiError_1.ApiError.forbidden('You are not enrolled in this course');
    return enrollment;
}
function safeDeleteFile(filePath) {
    try {
        const fullPath = path_1.default.join(process.cwd(), filePath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
    }
    catch (err) {
        console.error('Failed to delete file:', filePath, err);
    }
}
// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════
async function getStudentDashboard(studentId) {
    // Get enrolled course IDs
    const enrollments = await Enrollment_1.Enrollment.find({ student: studentId }).select('course').lean();
    const courseIds = enrollments.map((e) => e.course);
    // Count enrolled courses
    const enrolledCoursesCount = courseIds.length;
    // Get all assignments in enrolled courses
    const assignments = await Assignment_1.Assignment.find({ course: { $in: courseIds } }).select('_id').lean();
    const assignmentIds = assignments.map((a) => a._id);
    // Get submissions this student already has
    const submissions = await Submission_1.Submission.find({
        assignment: { $in: assignmentIds },
        student: studentId,
    }).select('assignment marks').lean();
    const submittedAssignmentIds = new Set(submissions.map((s) => s.assignment.toString()));
    // Pending = total assignments minus those with a submission
    const pendingAssignmentsCount = assignmentIds.filter((id) => !submittedAssignmentIds.has(id.toString())).length;
    // Submitted = submission exists and marks is null
    const submittedAssignmentsCount = submissions.filter((s) => s.marks === null).length;
    // Graded = submission exists and marks is not null
    const gradedAssignmentsCount = submissions.filter((s) => s.marks !== null).length;
    // Recent announcements from enrolled courses (max 5, newest first)
    const recentAnnouncementsRaw = await Announcement_1.Announcement.find({ course: { $in: courseIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('course', 'title')
        .lean();
    const recentAnnouncements = recentAnnouncementsRaw.map((a) => ({
        _id: a._id,
        title: a.title,
        courseTitle: a.course?.title || 'Unknown',
        createdAt: a.createdAt,
    }));
    // Recent graded submissions (max 5, newest graded first)
    const recentGradesRaw = await Submission_1.Submission.find({
        student: studentId,
        marks: { $ne: null },
    })
        .sort({ gradedAt: -1 })
        .limit(5)
        .populate({
        path: 'assignment',
        select: 'title totalMarks course',
        populate: { path: 'course', select: 'title' },
    })
        .lean();
    const recentGrades = recentGradesRaw.map((s) => {
        const assignment = s.assignment;
        return {
            _id: s._id,
            assignmentTitle: assignment?.title || 'Unknown',
            courseTitle: assignment?.course?.title || 'Unknown',
            marks: s.marks,
            totalMarks: assignment?.totalMarks || 0,
            gradedAt: s.gradedAt,
        };
    });
    return {
        enrolledCoursesCount,
        pendingAssignmentsCount,
        submittedAssignmentsCount,
        gradedAssignmentsCount,
        recentAnnouncements,
        recentGrades,
    };
}
// ══════════════════════════════════════════
//  COURSES
// ══════════════════════════════════════════
async function getEnrolledCourses(studentId) {
    const enrollments = await Enrollment_1.Enrollment.find({ student: studentId }).select('course').lean();
    const courseIds = enrollments.map((e) => e.course);
    const courses = await Course_1.Course.find({ _id: { $in: courseIds } })
        .populate('instructor', 'name email')
        .lean();
    return courses;
}
async function getEnrolledCourseById(courseId, studentId) {
    await verifyEnrollment(courseId, studentId);
    const course = await Course_1.Course.findById(courseId)
        .populate('instructor', 'name email')
        .lean();
    if (!course)
        throw ApiError_1.ApiError.notFound('Course not found');
    return course;
}
// ══════════════════════════════════════════
//  MODULES + MATERIALS
// ══════════════════════════════════════════
async function getModulesForCourse(courseId, studentId) {
    await verifyEnrollment(courseId, studentId);
    const modules = await Module_1.Module.find({ course: courseId }).sort({ order: 1 }).lean();
    const modulesWithMaterials = await Promise.all(modules.map(async (mod) => {
        const materials = await Material_1.Material.find({ module: mod._id })
            .sort({ createdAt: -1 })
            .lean();
        return { ...mod, materials };
    }));
    return modulesWithMaterials;
}
// ══════════════════════════════════════════
//  ANNOUNCEMENTS
// ══════════════════════════════════════════
async function getAnnouncementsForCourse(courseId, studentId) {
    await verifyEnrollment(courseId, studentId);
    return Announcement_1.Announcement.find({ course: courseId }).sort({ createdAt: -1 }).lean();
}
// ══════════════════════════════════════════
//  ASSIGNMENTS
// ══════════════════════════════════════════
async function getAssignmentsForCourse(courseId, studentId) {
    await verifyEnrollment(courseId, studentId);
    const assignments = await Assignment_1.Assignment.find({ course: courseId }).sort({ dueDate: 1 }).lean();
    // Get all submissions for this student in these assignments
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission_1.Submission.find({
        assignment: { $in: assignmentIds },
        student: studentId,
    }).lean();
    const submissionMap = new Map();
    for (const sub of submissions) {
        submissionMap.set(sub.assignment.toString(), sub);
    }
    return assignments.map((assgn) => {
        const sub = submissionMap.get(assgn._id.toString());
        let submissionStatus = 'not_submitted';
        let submittedAt = null;
        let marks = null;
        let feedback = null;
        if (sub) {
            submittedAt = sub.submittedAt;
            marks = sub.marks;
            feedback = sub.feedback;
            submissionStatus = sub.marks !== null ? 'graded' : 'submitted';
        }
        return {
            _id: assgn._id,
            title: assgn.title,
            description: assgn.description,
            dueDate: assgn.dueDate,
            gradingType: assgn.gradingType || 'graded',
            totalMarks: assgn.totalMarks,
            submissionStatus,
            submittedAt,
            marks,
            feedback,
        };
    });
}
// ══════════════════════════════════════════
//  ASSIGNMENT DETAIL
// ══════════════════════════════════════════
async function getAssignmentDetail(assignmentId, studentId) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId)
        .populate('course', 'title code')
        .lean();
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    // Verify student is enrolled in this assignment's course
    const populatedAssignment = assignment;
    const courseId = populatedAssignment.course._id
        ? populatedAssignment.course._id.toString()
        : populatedAssignment.course.toString();
    await verifyEnrollment(courseId, studentId);
    // Get the student's submission if it exists
    const submission = await Submission_1.Submission.findOne({
        assignment: assignmentId,
        student: studentId,
    }).lean();
    let submissionData = null;
    if (submission) {
        const status = submission.marks !== null ? 'graded' : 'submitted';
        submissionData = {
            _id: submission._id,
            fileName: submission.fileName,
            fileUrl: submission.fileUrl,
            mimeType: submission.mimeType,
            fileSize: submission.fileSize,
            submittedAt: submission.submittedAt,
            status,
            marks: submission.marks,
            feedback: submission.feedback,
            gradedAt: submission.gradedAt,
        };
    }
    return {
        assignment: {
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            gradingType: assignment.gradingType || 'graded',
            totalMarks: assignment.totalMarks,
            course: assignment.course,
        },
        submission: submissionData,
    };
}
// ══════════════════════════════════════════
//  SUBMISSION UPLOAD
// ══════════════════════════════════════════
async function createOrReplaceSubmission(assignmentId, studentId, file) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    await verifyEnrollment(assignment.course.toString(), studentId);
    // Check for existing submission
    const existing = await Submission_1.Submission.findOne({
        assignment: assignmentId,
        student: studentId,
    });
    if (existing) {
        // If graded, reject replacement
        if (existing.marks !== null) {
            // Clean up the newly uploaded file since we're rejecting
            safeDeleteFile(`/uploads/submissions/${file.filename}`);
            throw ApiError_1.ApiError.badRequest('Cannot replace a graded submission. Your submission has already been graded.');
        }
        // Replace: delete old file, update the same document
        if (existing.fileUrl) {
            safeDeleteFile(existing.fileUrl);
        }
        existing.fileName = file.originalname;
        existing.fileUrl = `/uploads/submissions/${file.filename}`;
        existing.mimeType = file.mimetype;
        existing.fileSize = file.size;
        existing.submittedAt = new Date();
        await existing.save();
        return existing;
    }
    // Create new submission
    const submission = new Submission_1.Submission({
        assignment: assignmentId,
        student: studentId,
        fileName: file.originalname,
        fileUrl: `/uploads/submissions/${file.filename}`,
        mimeType: file.mimetype,
        fileSize: file.size,
        submittedAt: new Date(),
    });
    await submission.save();
    return submission;
}
// ══════════════════════════════════════════
//  GRADES
// ══════════════════════════════════════════
async function getStudentGrades(studentId) {
    // Return the student's enrolled course list for the grades landing page
    const enrollments = await Enrollment_1.Enrollment.find({ student: studentId }).select('course').lean();
    const courseIds = enrollments.map((e) => e.course);
    const courses = await Course_1.Course.find({ _id: { $in: courseIds } })
        .select('title code')
        .lean();
    return { courses };
}
// ══════════════════════════════════════════
//  COURSE-WISE GRADES
// ══════════════════════════════════════════
async function getStudentCourseGrades(courseId, studentId) {
    // Verify enrollment
    await verifyEnrollment(courseId, studentId);
    // Get the course info
    const course = await Course_1.Course.findById(courseId).select('title code').lean();
    if (!course)
        throw ApiError_1.ApiError.notFound('Course not found');
    // Get only graded assignments for this course
    const assignments = await Assignment_1.Assignment.find({
        course: courseId,
        gradingType: 'graded',
    }).select('_id title dueDate totalMarks').lean();
    const assignmentIds = assignments.map((a) => a._id);
    // Get the student's graded submissions for those assignments
    const submissions = await Submission_1.Submission.find({
        assignment: { $in: assignmentIds },
        student: studentId,
        marks: { $ne: null },
    }).lean();
    const submissionMap = new Map();
    for (const sub of submissions) {
        submissionMap.set(sub.assignment.toString(), sub);
    }
    const grades = assignments
        .filter((a) => submissionMap.has(a._id.toString()))
        .map((a) => {
        const sub = submissionMap.get(a._id.toString());
        return {
            assignmentId: a._id,
            title: a.title,
            dueDate: a.dueDate,
            totalMarks: a.totalMarks,
            obtainedMarks: sub.marks,
            feedback: sub.feedback,
            submittedAt: sub.submittedAt,
            gradedAt: sub.gradedAt,
        };
    });
    return { course, grades };
}
//# sourceMappingURL=student.service.js.map