"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = getAdminDashboard;
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Enrollment_1 = require("../models/Enrollment");
async function getAdminDashboard() {
    const [totalStudents, totalInstructors, totalCourses, totalEnrollments, pendingUsers] = await Promise.all([
        User_1.User.countDocuments({ role: 'student' }),
        User_1.User.countDocuments({ role: 'instructor' }),
        Course_1.Course.countDocuments(),
        Enrollment_1.Enrollment.countDocuments(),
        User_1.User.countDocuments({ status: 'pending' }),
    ]);
    const [recentUsers, recentCourses, recentEnrollments] = await Promise.all([
        User_1.User.find({ role: { $in: ['student', 'instructor'] } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt')
            .lean(),
        Course_1.Course.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title code createdAt')
            .lean(),
        Enrollment_1.Enrollment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('student', 'name email')
            .populate('course', 'title code')
            .lean(),
    ]);
    return {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        pendingUsers,
        recentUsers,
        recentCourses,
        recentEnrollments,
    };
}
//# sourceMappingURL=dashboard.service.js.map