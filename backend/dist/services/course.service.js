"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourses = getCourses;
exports.createCourse = createCourse;
exports.getCourseById = getCourseById;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
exports.assignInstructor = assignInstructor;
exports.getEnrollments = getEnrollments;
exports.enrollStudent = enrollStudent;
exports.unenrollStudent = unenrollStudent;
const Course_1 = require("../models/Course");
const Enrollment_1 = require("../models/Enrollment");
const User_1 = require("../models/User");
const ApiError_1 = require("../utils/ApiError");
const mongoose_1 = require("mongoose");
// ── GET /api/admin/courses ──
async function getCourses(query) {
    const filter = {};
    if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ title: regex }, { code: regex }];
    }
    const courses = await Course_1.Course.find(filter)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 });
    return courses;
}
// ── POST /api/admin/courses ──
async function createCourse(data) {
    const normalizedCode = data.code.trim().toUpperCase();
    const existing = await Course_1.Course.findOne({ code: normalizedCode });
    if (existing) {
        throw ApiError_1.ApiError.conflict(`Course with code "${normalizedCode}" already exists`);
    }
    const course = new Course_1.Course({
        title: data.title.trim(),
        code: normalizedCode,
        description: data.description.trim(),
    });
    await course.save();
    return course;
}
// ── GET /api/admin/courses/:id ──
async function getCourseById(courseId) {
    const course = await Course_1.Course.findById(courseId).populate('instructor', 'name email');
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    return course;
}
// ── PATCH /api/admin/courses/:id ──
async function updateCourse(courseId, data) {
    const course = await Course_1.Course.findById(courseId);
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    if (data.code) {
        const normalizedCode = data.code.trim().toUpperCase();
        const existing = await Course_1.Course.findOne({ code: normalizedCode, _id: { $ne: courseId } });
        if (existing) {
            throw ApiError_1.ApiError.conflict(`Course with code "${normalizedCode}" already exists`);
        }
        data.code = normalizedCode;
    }
    if (data.title)
        course.title = data.title.trim();
    if (data.code)
        course.code = data.code;
    if (data.description)
        course.description = data.description.trim();
    await course.save();
    // Populate instructor before returning
    await course.populate('instructor', 'name email');
    return course;
}
// ── DELETE /api/admin/courses/:id ──
async function deleteCourse(courseId) {
    const course = await Course_1.Course.findById(courseId);
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    // Cascade: delete all enrollments for this course
    await Enrollment_1.Enrollment.deleteMany({ course: courseId });
    await Course_1.Course.findByIdAndDelete(courseId);
}
// ── PATCH /api/admin/courses/:id/instructor ──
async function assignInstructor(courseId, instructorId) {
    const course = await Course_1.Course.findById(courseId);
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    if (instructorId === null) {
        // Clear instructor
        course.instructor = undefined;
        await course.save();
        await course.populate('instructor', 'name email');
        return course;
    }
    const instructor = await User_1.User.findById(instructorId);
    if (!instructor) {
        throw ApiError_1.ApiError.notFound('Instructor not found');
    }
    if (instructor.role !== 'instructor') {
        throw ApiError_1.ApiError.badRequest('Assigned user must have the instructor role');
    }
    if (instructor.status !== 'active') {
        throw ApiError_1.ApiError.badRequest('Assigned instructor must be active');
    }
    course.instructor = new mongoose_1.Types.ObjectId(instructorId);
    await course.save();
    await course.populate('instructor', 'name email');
    return course;
}
// ── GET /api/admin/courses/:id/enrollments ──
async function getEnrollments(courseId) {
    // Verify the course exists
    const course = await Course_1.Course.findById(courseId);
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    const enrollments = await Enrollment_1.Enrollment.find({ course: courseId })
        .populate('student', 'name email')
        .sort({ createdAt: -1 });
    return enrollments;
}
// ── POST /api/admin/courses/:id/enrollments ──
async function enrollStudent(courseId, studentId) {
    const course = await Course_1.Course.findById(courseId);
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    const student = await User_1.User.findById(studentId);
    if (!student) {
        throw ApiError_1.ApiError.notFound('Student not found');
    }
    if (student.role !== 'student') {
        throw ApiError_1.ApiError.badRequest('Enrolled user must have the student role');
    }
    if (student.status !== 'active') {
        throw ApiError_1.ApiError.badRequest('Enrolled student must be active');
    }
    // Block duplicates — the unique index will also catch this but give a nicer error
    const existing = await Enrollment_1.Enrollment.findOne({ course: courseId, student: studentId });
    if (existing) {
        throw ApiError_1.ApiError.conflict('Student is already enrolled in this course');
    }
    const enrollment = new Enrollment_1.Enrollment({ course: courseId, student: studentId });
    await enrollment.save();
    await enrollment.populate('student', 'name email');
    return enrollment;
}
// ── DELETE /api/admin/courses/:id/enrollments/:studentId ──
async function unenrollStudent(courseId, studentId) {
    const course = await Course_1.Course.findById(courseId);
    if (!course) {
        throw ApiError_1.ApiError.notFound('Course not found');
    }
    const result = await Enrollment_1.Enrollment.findOneAndDelete({ course: courseId, student: studentId });
    if (!result) {
        throw ApiError_1.ApiError.notFound('Enrollment not found');
    }
}
//# sourceMappingURL=course.service.js.map