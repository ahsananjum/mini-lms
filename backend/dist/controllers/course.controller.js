"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourses = listCourses;
exports.createCourseHandler = createCourseHandler;
exports.getCourse = getCourse;
exports.updateCourseHandler = updateCourseHandler;
exports.deleteCourseHandler = deleteCourseHandler;
exports.assignInstructorHandler = assignInstructorHandler;
exports.listEnrollments = listEnrollments;
exports.enrollStudentHandler = enrollStudentHandler;
exports.unenrollStudentHandler = unenrollStudentHandler;
const course_service_1 = require("../services/course.service");
const apiResponse_1 = require("../utils/apiResponse");
async function listCourses(req, res, next) {
    try {
        const { search } = req.query;
        const courses = await (0, course_service_1.getCourses)({ search: search });
        (0, apiResponse_1.sendSuccess)(res, 'Courses fetched successfully', { courses });
    }
    catch (error) {
        next(error);
    }
}
async function createCourseHandler(req, res, next) {
    try {
        const course = await (0, course_service_1.createCourse)(req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Course created successfully', { course }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function getCourse(req, res, next) {
    try {
        const course = await (0, course_service_1.getCourseById)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 'Course fetched successfully', { course });
    }
    catch (error) {
        next(error);
    }
}
async function updateCourseHandler(req, res, next) {
    try {
        const course = await (0, course_service_1.updateCourse)(req.params.id, req.body);
        (0, apiResponse_1.sendSuccess)(res, 'Course updated successfully', { course });
    }
    catch (error) {
        next(error);
    }
}
async function deleteCourseHandler(req, res, next) {
    try {
        await (0, course_service_1.deleteCourse)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 'Course deleted successfully', {});
    }
    catch (error) {
        next(error);
    }
}
async function assignInstructorHandler(req, res, next) {
    try {
        const { instructorId } = req.body;
        const course = await (0, course_service_1.assignInstructor)(req.params.id, instructorId);
        (0, apiResponse_1.sendSuccess)(res, 'Instructor updated successfully', { course });
    }
    catch (error) {
        next(error);
    }
}
async function listEnrollments(req, res, next) {
    try {
        const enrollments = await (0, course_service_1.getEnrollments)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 'Enrollments fetched successfully', { enrollments });
    }
    catch (error) {
        next(error);
    }
}
async function enrollStudentHandler(req, res, next) {
    try {
        const { studentId } = req.body;
        const enrollment = await (0, course_service_1.enrollStudent)(req.params.id, studentId);
        (0, apiResponse_1.sendSuccess)(res, 'Student enrolled successfully', { enrollment }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function unenrollStudentHandler(req, res, next) {
    try {
        await (0, course_service_1.unenrollStudent)(req.params.id, req.params.studentId);
        (0, apiResponse_1.sendSuccess)(res, 'Student removed from course successfully', {});
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=course.controller.js.map