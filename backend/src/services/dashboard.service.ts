import { User } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';

export async function getAdminDashboard() {
  const [totalStudents, totalInstructors, totalCourses, totalEnrollments, pendingUsers] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    User.countDocuments({ status: 'pending' }),
  ]);

  const [recentUsers, recentCourses, recentEnrollments] = await Promise.all([
    User.find({ role: { $in: ['student', 'instructor'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt')
      .lean(),
    Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title code createdAt')
      .lean(),
    Enrollment.find()
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
