import { Course, ICourse } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { Types } from 'mongoose';

interface ListCoursesQuery {
  search?: string;
}

interface CourseData {
  title: string;
  code: string;
  description: string;
}

// ── GET /api/admin/courses ──
export async function getCourses(query: ListCoursesQuery) {
  const filter: Record<string, any> = {};

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ title: regex }, { code: regex }];
  }

  const courses = await Course.find(filter)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 });

  return courses;
}

// ── POST /api/admin/courses ──
export async function createCourse(data: CourseData): Promise<ICourse> {
  const normalizedCode = data.code.trim().toUpperCase();

  const existing = await Course.findOne({ code: normalizedCode });
  if (existing) {
    throw ApiError.conflict(`Course with code "${normalizedCode}" already exists`);
  }

  const course = new Course({
    title: data.title.trim(),
    code: normalizedCode,
    description: data.description.trim(),
  });

  await course.save();
  return course;
}

// ── GET /api/admin/courses/:id ──
export async function getCourseById(courseId: string): Promise<ICourse> {
  const course = await Course.findById(courseId).populate('instructor', 'name email');
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  return course;
}

// ── PATCH /api/admin/courses/:id ──
export async function updateCourse(courseId: string, data: Partial<CourseData>): Promise<ICourse> {
  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  if (data.code) {
    const normalizedCode = data.code.trim().toUpperCase();
    const existing = await Course.findOne({ code: normalizedCode, _id: { $ne: courseId } });
    if (existing) {
      throw ApiError.conflict(`Course with code "${normalizedCode}" already exists`);
    }
    data.code = normalizedCode;
  }

  if (data.title) course.title = data.title.trim();
  if (data.code) course.code = data.code;
  if (data.description) course.description = data.description.trim();

  await course.save();

  // Populate instructor before returning
  await course.populate('instructor', 'name email');
  return course;
}

// ── DELETE /api/admin/courses/:id ──
export async function deleteCourse(courseId: string): Promise<void> {
  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Cascade: delete all enrollments for this course
  await Enrollment.deleteMany({ course: courseId });
  await Course.findByIdAndDelete(courseId);
}

// ── PATCH /api/admin/courses/:id/instructor ──
export async function assignInstructor(
  courseId: string,
  instructorId: string | null
): Promise<ICourse> {
  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  if (instructorId === null) {
    // Clear instructor
    course.instructor = undefined;
    await course.save();
    await course.populate('instructor', 'name email');
    return course;
  }

  const instructor = await User.findById(instructorId);
  if (!instructor) {
    throw ApiError.notFound('Instructor not found');
  }
  if (instructor.role !== 'instructor') {
    throw ApiError.badRequest('Assigned user must have the instructor role');
  }
  if (instructor.status !== 'active') {
    throw ApiError.badRequest('Assigned instructor must be active');
  }

  course.instructor = new Types.ObjectId(instructorId);
  await course.save();
  await course.populate('instructor', 'name email');
  return course;
}

// ── GET /api/admin/courses/:id/enrollments ──
export async function getEnrollments(courseId: string) {
  // Verify the course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  return enrollments;
}

// ── POST /api/admin/courses/:id/enrollments ──
export async function enrollStudent(courseId: string, studentId: string) {
  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const student = await User.findById(studentId);
  if (!student) {
    throw ApiError.notFound('Student not found');
  }
  if (student.role !== 'student') {
    throw ApiError.badRequest('Enrolled user must have the student role');
  }
  if (student.status !== 'active') {
    throw ApiError.badRequest('Enrolled student must be active');
  }

  // Block duplicates — the unique index will also catch this but give a nicer error
  const existing = await Enrollment.findOne({ course: courseId, student: studentId });
  if (existing) {
    throw ApiError.conflict('Student is already enrolled in this course');
  }

  const enrollment = new Enrollment({ course: courseId, student: studentId });
  await enrollment.save();
  await enrollment.populate('student', 'name email');
  return enrollment;
}

// ── DELETE /api/admin/courses/:id/enrollments/:studentId ──
export async function unenrollStudent(courseId: string, studentId: string): Promise<void> {
  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const result = await Enrollment.findOneAndDelete({ course: courseId, student: studentId });
  if (!result) {
    throw ApiError.notFound('Enrollment not found');
  }
}
