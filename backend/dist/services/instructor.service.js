"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorDashboard = getInstructorDashboard;
exports.getInstructorCourses = getInstructorCourses;
exports.getInstructorCourseById = getInstructorCourseById;
exports.getModulesForCourse = getModulesForCourse;
exports.createModule = createModule;
exports.updateModule = updateModule;
exports.deleteModule = deleteModule;
exports.createMaterial = createMaterial;
exports.deleteMaterial = deleteMaterial;
exports.getAnnouncementsForCourse = getAnnouncementsForCourse;
exports.createAnnouncement = createAnnouncement;
exports.updateAnnouncement = updateAnnouncement;
exports.deleteAnnouncement = deleteAnnouncement;
exports.getAssignmentsForCourse = getAssignmentsForCourse;
exports.createAssignment = createAssignment;
exports.getAssignmentById = getAssignmentById;
exports.updateAssignment = updateAssignment;
exports.deleteAssignment = deleteAssignment;
exports.getSubmissionsForAssignment = getSubmissionsForAssignment;
exports.gradeSubmission = gradeSubmission;
exports.getSubmissionsOverview = getSubmissionsOverview;
const Course_1 = require("../models/Course");
const Module_1 = require("../models/Module");
const Material_1 = require("../models/Material");
const Announcement_1 = require("../models/Announcement");
const Assignment_1 = require("../models/Assignment");
const Submission_1 = require("../models/Submission");
const Enrollment_1 = require("../models/Enrollment");
const ApiError_1 = require("../utils/ApiError");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ── Helper: verify instructor owns the course ──
async function getOwnCourse(courseId, instructorId) {
    const course = await Course_1.Course.findById(courseId);
    if (!course)
        throw ApiError_1.ApiError.notFound('Course not found');
    if (!course.instructor || course.instructor.toString() !== instructorId) {
        throw ApiError_1.ApiError.forbidden('You are not assigned to this course');
    }
    return course;
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
async function getInstructorDashboard(instructorId) {
    const courses = await Course_1.Course.find({ instructor: instructorId }).select('_id title').lean();
    const courseIds = courses.map((c) => c._id);
    const courseTitleMap = new Map();
    for (const c of courses) {
        courseTitleMap.set(c._id.toString(), c.title);
    }
    const modules = await Module_1.Module.find({ course: { $in: courseIds } }).select('_id course').lean();
    const moduleIds = modules.map((m) => m._id);
    const [totalMaterialsCount, totalAssignmentsCount] = await Promise.all([
        Material_1.Material.countDocuments({ module: { $in: moduleIds } }),
        Assignment_1.Assignment.countDocuments({ course: { $in: courseIds } }),
    ]);
    // Ungraded submissions = submissions for assignments in instructor's courses where marks is null
    const assignmentIds = (await Assignment_1.Assignment.find({ course: { $in: courseIds } }).select('_id')).map((a) => a._id);
    const ungradedSubmissionsCount = await Submission_1.Submission.countDocuments({
        assignment: { $in: assignmentIds },
        marks: null,
    });
    const recentMaterials = await Material_1.Material.find({ module: { $in: moduleIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({ path: 'module', select: 'course' })
        .lean();
    const recentMaterialsWithCourse = recentMaterials.map((m) => {
        const mod = m.module;
        const courseId = mod?.course?.toString() || '';
        return {
            _id: m._id,
            title: m.title,
            courseTitle: courseTitleMap.get(courseId) || 'Unknown',
            createdAt: m.createdAt,
        };
    });
    const recentAnnouncements = await Announcement_1.Announcement.find({ course: { $in: courseIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    const recentAnnouncementsWithCourse = recentAnnouncements.map((a) => ({
        _id: a._id,
        title: a.title,
        courseTitle: courseTitleMap.get(a.course.toString()) || 'Unknown',
        createdAt: a.createdAt,
    }));
    const recentAssignments = await Assignment_1.Assignment.find({ course: { $in: courseIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    const recentAssignmentsWithCourse = recentAssignments.map((a) => ({
        _id: a._id,
        title: a.title,
        courseTitle: courseTitleMap.get(a.course.toString()) || 'Unknown',
        createdAt: a.createdAt,
    }));
    return {
        assignedCoursesCount: courses.length,
        totalModulesCount: modules.length,
        totalMaterialsCount,
        totalAssignmentsCount,
        ungradedSubmissionsCount,
        recentMaterials: recentMaterialsWithCourse,
        recentAnnouncements: recentAnnouncementsWithCourse,
        recentAssignments: recentAssignmentsWithCourse,
    };
}
// ══════════════════════════════════════════
//  COURSES
// ══════════════════════════════════════════
async function getInstructorCourses(instructorId) {
    return Course_1.Course.find({ instructor: instructorId }).sort({ createdAt: -1 }).lean();
}
async function getInstructorCourseById(courseId, instructorId) {
    return getOwnCourse(courseId, instructorId);
}
// ══════════════════════════════════════════
//  MODULES
// ══════════════════════════════════════════
async function getModulesForCourse(courseId, instructorId) {
    await getOwnCourse(courseId, instructorId);
    const modules = await Module_1.Module.find({ course: courseId }).sort({ order: 1 }).lean();
    const modulesWithMaterials = await Promise.all(modules.map(async (mod) => {
        const materials = await Material_1.Material.find({ module: mod._id }).sort({ createdAt: -1 }).lean();
        return { ...mod, materials };
    }));
    return modulesWithMaterials;
}
async function createModule(courseId, instructorId, data) {
    await getOwnCourse(courseId, instructorId);
    const lastModule = await Module_1.Module.findOne({ course: courseId }).sort({ order: -1 });
    const nextOrder = lastModule ? lastModule.order + 1 : 1;
    const mod = new Module_1.Module({
        course: courseId,
        title: data.title,
        description: data.description || '',
        order: nextOrder,
    });
    await mod.save();
    return mod;
}
async function updateModule(moduleId, instructorId, data) {
    const mod = await Module_1.Module.findById(moduleId);
    if (!mod)
        throw ApiError_1.ApiError.notFound('Module not found');
    await getOwnCourse(mod.course.toString(), instructorId);
    if (data.title !== undefined)
        mod.title = data.title;
    if (data.description !== undefined)
        mod.description = data.description;
    await mod.save();
    return mod;
}
async function deleteModule(moduleId, instructorId) {
    const mod = await Module_1.Module.findById(moduleId);
    if (!mod)
        throw ApiError_1.ApiError.notFound('Module not found');
    await getOwnCourse(mod.course.toString(), instructorId);
    const materials = await Material_1.Material.find({ module: moduleId });
    for (const mat of materials) {
        if (mat.fileUrl)
            safeDeleteFile(mat.fileUrl);
    }
    await Material_1.Material.deleteMany({ module: moduleId });
    await Module_1.Module.findByIdAndDelete(moduleId);
}
// ══════════════════════════════════════════
//  MATERIALS
// ══════════════════════════════════════════
async function createMaterial(moduleId, instructorId, data, file) {
    const mod = await Module_1.Module.findById(moduleId);
    if (!mod)
        throw ApiError_1.ApiError.notFound('Module not found');
    await getOwnCourse(mod.course.toString(), instructorId);
    const material = new Material_1.Material({
        module: moduleId,
        title: data.title,
        description: data.description || '',
        fileName: file.originalname,
        fileUrl: `/uploads/materials/${file.filename}`,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy: instructorId,
    });
    await material.save();
    return material;
}
async function deleteMaterial(materialId, instructorId) {
    const material = await Material_1.Material.findById(materialId);
    if (!material)
        throw ApiError_1.ApiError.notFound('Material not found');
    const mod = await Module_1.Module.findById(material.module);
    if (!mod)
        throw ApiError_1.ApiError.notFound('Module not found');
    await getOwnCourse(mod.course.toString(), instructorId);
    if (material.fileUrl)
        safeDeleteFile(material.fileUrl);
    await Material_1.Material.findByIdAndDelete(materialId);
}
// ══════════════════════════════════════════
//  ANNOUNCEMENTS
// ══════════════════════════════════════════
async function getAnnouncementsForCourse(courseId, instructorId) {
    await getOwnCourse(courseId, instructorId);
    return Announcement_1.Announcement.find({ course: courseId }).sort({ createdAt: -1 }).lean();
}
async function createAnnouncement(courseId, instructorId, data) {
    await getOwnCourse(courseId, instructorId);
    const announcement = new Announcement_1.Announcement({
        course: courseId,
        title: data.title,
        message: data.message,
        createdBy: instructorId,
    });
    await announcement.save();
    return announcement;
}
async function updateAnnouncement(announcementId, instructorId, data) {
    const announcement = await Announcement_1.Announcement.findById(announcementId);
    if (!announcement)
        throw ApiError_1.ApiError.notFound('Announcement not found');
    await getOwnCourse(announcement.course.toString(), instructorId);
    if (data.title !== undefined)
        announcement.title = data.title;
    if (data.message !== undefined)
        announcement.message = data.message;
    await announcement.save();
    return announcement;
}
async function deleteAnnouncement(announcementId, instructorId) {
    const announcement = await Announcement_1.Announcement.findById(announcementId);
    if (!announcement)
        throw ApiError_1.ApiError.notFound('Announcement not found');
    await getOwnCourse(announcement.course.toString(), instructorId);
    await Announcement_1.Announcement.findByIdAndDelete(announcementId);
}
// ══════════════════════════════════════════
//  ASSIGNMENTS (Phase 5)
// ══════════════════════════════════════════
async function getAssignmentsForCourse(courseId, instructorId) {
    await getOwnCourse(courseId, instructorId);
    return Assignment_1.Assignment.find({ course: courseId }).sort({ createdAt: -1 }).lean();
}
async function createAssignment(courseId, instructorId, data) {
    await getOwnCourse(courseId, instructorId);
    const gradingType = data.gradingType || 'graded';
    // Validate totalMarks based on gradingType
    if (gradingType === 'graded') {
        if (data.totalMarks === undefined || data.totalMarks === null || data.totalMarks < 1) {
            throw ApiError_1.ApiError.badRequest('Total marks is required and must be a positive number for graded assignments');
        }
    }
    const assignment = new Assignment_1.Assignment({
        course: courseId,
        title: data.title,
        description: data.description || '',
        dueDate: new Date(data.dueDate),
        gradingType,
        totalMarks: gradingType === 'graded' ? data.totalMarks : null,
        createdBy: instructorId,
    });
    await assignment.save();
    return assignment;
}
async function getAssignmentById(assignmentId, instructorId) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    await getOwnCourse(assignment.course.toString(), instructorId);
    return assignment;
}
async function updateAssignment(assignmentId, instructorId, data) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    await getOwnCourse(assignment.course.toString(), instructorId);
    // Reject any attempt to change gradingType
    if (data.gradingType !== undefined && data.gradingType !== assignment.gradingType) {
        throw ApiError_1.ApiError.badRequest('Cannot change assignment grading type after creation');
    }
    if (data.title !== undefined)
        assignment.title = data.title;
    if (data.description !== undefined)
        assignment.description = data.description;
    if (data.dueDate !== undefined)
        assignment.dueDate = new Date(data.dueDate);
    // Only allow totalMarks changes for graded assignments
    if (data.totalMarks !== undefined) {
        if (assignment.gradingType === 'graded') {
            if (data.totalMarks === null || data.totalMarks < 1) {
                throw ApiError_1.ApiError.badRequest('Total marks must be a positive number for graded assignments');
            }
            assignment.totalMarks = data.totalMarks;
        }
        // For ungraded, silently ignore totalMarks changes — it stays null
    }
    await assignment.save();
    return assignment;
}
async function deleteAssignment(assignmentId, instructorId) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    await getOwnCourse(assignment.course.toString(), instructorId);
    // Delete related submissions and their files
    const submissions = await Submission_1.Submission.find({ assignment: assignmentId });
    for (const sub of submissions) {
        if (sub.fileUrl)
            safeDeleteFile(sub.fileUrl);
    }
    await Submission_1.Submission.deleteMany({ assignment: assignmentId });
    await Assignment_1.Assignment.findByIdAndDelete(assignmentId);
}
// ══════════════════════════════════════════
//  SUBMISSIONS REVIEW (Phase 5)
// ══════════════════════════════════════════
async function getSubmissionsForAssignment(assignmentId, instructorId) {
    const assignment = await Assignment_1.Assignment.findById(assignmentId);
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    await getOwnCourse(assignment.course.toString(), instructorId);
    // Get all enrolled students in this course
    const enrollments = await Enrollment_1.Enrollment.find({ course: assignment.course })
        .populate('student', 'name email')
        .lean();
    // Get all real submissions for this assignment
    const submissions = await Submission_1.Submission.find({ assignment: assignmentId }).lean();
    // Build a map of student submissions keyed by student ID
    const submissionMap = new Map();
    for (const sub of submissions) {
        submissionMap.set(sub.student.toString(), sub);
    }
    // Merge enrollments with submissions — honest statuses only
    const rows = enrollments.map((enrollment) => {
        const studentId = enrollment.student._id.toString();
        const sub = submissionMap.get(studentId);
        if (!sub) {
            return {
                student: enrollment.student,
                submission: {
                    _id: null,
                    status: 'not_submitted',
                    fileUrl: null,
                    fileName: null,
                    submittedAt: null,
                    marks: null,
                    feedback: null,
                },
            };
        }
        const status = sub.marks !== null ? 'graded' : 'submitted';
        return {
            student: enrollment.student,
            submission: {
                _id: sub._id,
                status,
                fileUrl: sub.fileUrl,
                fileName: sub.fileName,
                submittedAt: sub.submittedAt,
                marks: sub.marks,
                feedback: sub.feedback,
            },
        };
    });
    // Return assignment metadata alongside rows so the frontend knows the grading type
    return {
        assignment: {
            _id: assignment._id,
            title: assignment.title,
            gradingType: assignment.gradingType,
            totalMarks: assignment.totalMarks,
        },
        rows,
    };
}
// ══════════════════════════════════════════
//  GRADING (Phase 5)
// ══════════════════════════════════════════
async function gradeSubmission(submissionId, instructorId, data) {
    const submission = await Submission_1.Submission.findById(submissionId);
    if (!submission)
        throw ApiError_1.ApiError.notFound('Submission not found');
    const assignment = await Assignment_1.Assignment.findById(submission.assignment);
    if (!assignment)
        throw ApiError_1.ApiError.notFound('Assignment not found');
    await getOwnCourse(assignment.course.toString(), instructorId);
    // Reject grading for ungraded assignments
    if (assignment.gradingType === 'ungraded') {
        throw ApiError_1.ApiError.badRequest('Cannot grade an ungraded assignment. This assignment does not accept marks.');
    }
    if (data.marks < 0 || data.marks > (assignment.totalMarks || 0)) {
        throw ApiError_1.ApiError.badRequest(`Marks must be between 0 and ${assignment.totalMarks}`);
    }
    submission.marks = data.marks;
    submission.feedback = data.feedback || null;
    submission.gradedAt = new Date();
    await submission.save();
    return submission;
}
// ══════════════════════════════════════════
//  SUBMISSIONS OVERVIEW (Grading Patch)
// ══════════════════════════════════════════
async function getSubmissionsOverview(instructorId) {
    // 1. Load instructor's course IDs
    const courses = await Course_1.Course.find({ instructor: instructorId }).select('_id title code').lean();
    const courseIds = courses.map((c) => c._id);
    if (courseIds.length === 0) {
        return {
            summary: { gradedAssignmentsCount: 0, pendingGradingCount: 0 },
            assignments: [],
        };
    }
    // Build a course lookup map
    const courseMap = new Map();
    for (const c of courses) {
        courseMap.set(c._id.toString(), { title: c.title, code: c.code });
    }
    // 2. Load only graded assignments for those courses
    const assignments = await Assignment_1.Assignment.find({
        course: { $in: courseIds },
        gradingType: 'graded',
    }).select('_id title course dueDate totalMarks').lean();
    if (assignments.length === 0) {
        return {
            summary: { gradedAssignmentsCount: 0, pendingGradingCount: 0 },
            assignments: [],
        };
    }
    const assignmentIds = assignments.map((a) => a._id);
    // 3. Get enrollment counts grouped by course
    const enrollmentCounts = await Enrollment_1.Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
    ]);
    const enrollmentMap = new Map();
    for (const e of enrollmentCounts) {
        enrollmentMap.set(e._id.toString(), e.count);
    }
    // 4. Get submission counts grouped by assignment
    const submissionCounts = await Submission_1.Submission.aggregate([
        { $match: { assignment: { $in: assignmentIds } } },
        { $group: { _id: '$assignment', total: { $sum: 1 }, graded: { $sum: { $cond: [{ $ne: ['$marks', null] }, 1, 0] } } } },
    ]);
    const submissionMap = new Map();
    for (const s of submissionCounts) {
        submissionMap.set(s._id.toString(), { total: s.total, graded: s.graded });
    }
    // 5. Merge results
    let totalPendingGrading = 0;
    const assignmentRows = assignments.map((a) => {
        const courseInfo = courseMap.get(a.course.toString()) || { title: 'Unknown', code: 'N/A' };
        const enrolled = enrollmentMap.get(a.course.toString()) || 0;
        const subCounts = submissionMap.get(a._id.toString()) || { total: 0, graded: 0 };
        const pending = subCounts.total - subCounts.graded;
        totalPendingGrading += pending;
        return {
            assignmentId: a._id,
            assignmentTitle: a.title,
            courseId: a.course,
            courseTitle: courseInfo.title,
            courseCode: courseInfo.code,
            dueDate: a.dueDate,
            totalMarks: a.totalMarks,
            enrolledStudentsCount: enrolled,
            submittedCount: subCounts.total,
            gradedCount: subCounts.graded,
            pendingGradingCount: pending,
        };
    });
    return {
        summary: {
            gradedAssignmentsCount: assignments.length,
            pendingGradingCount: totalPendingGrading,
        },
        assignments: assignmentRows,
    };
}
//# sourceMappingURL=instructor.service.js.map