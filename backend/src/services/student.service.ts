import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Module } from '../models/Module';
import { Material } from '../models/Material';
import { Announcement } from '../models/Announcement';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { ApiError } from '../utils/ApiError';
import { put, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// ── Helper: verify student is enrolled in the course ──

async function verifyEnrollment(courseId: string, studentId: string) {
  const enrollment = await Enrollment.findOne({ course: courseId, student: studentId });
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');
  return enrollment;
}

async function safeDeleteFile(filePath: string) {
  try {
    if (filePath.startsWith('http')) {
      await del(filePath);
    } else {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (err) {
    console.error('Failed to delete file:', filePath, err);
  }
}

// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════

export async function getStudentDashboard(studentId: string) {
  // Get enrolled course IDs
  const enrollments = await Enrollment.find({ student: studentId }).select('course').lean();
  const courseIds = enrollments.map((e) => e.course);

  // Count enrolled courses
  const enrolledCoursesCount = courseIds.length;

  // Get all assignments in enrolled courses
  const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id').lean();
  const assignmentIds = assignments.map((a) => a._id);

  // Get submissions this student already has
  const submissions = await Submission.find({
    assignment: { $in: assignmentIds },
    student: studentId,
  }).select('assignment marks').lean();

  const submittedAssignmentIds = new Set(submissions.map((s) => s.assignment.toString()));

  // Pending = total assignments minus those with a submission
  const pendingAssignmentsCount = assignmentIds.filter(
    (id) => !submittedAssignmentIds.has(id.toString())
  ).length;

  // Submitted = submission exists and marks is null
  const submittedAssignmentsCount = submissions.filter((s) => s.marks === null).length;

  // Graded = submission exists and marks is not null
  const gradedAssignmentsCount = submissions.filter((s) => s.marks !== null).length;

  // Recent announcements from enrolled courses (max 5, newest first)
  const recentAnnouncementsRaw = await Announcement.find({ course: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('course', 'title')
    .lean();

  const recentAnnouncements = recentAnnouncementsRaw.map((a) => ({
    _id: a._id,
    title: a.title,
    courseTitle: (a.course as any)?.title || 'Unknown',
    createdAt: a.createdAt,
  }));

  // Recent graded submissions (max 5, newest graded first)
  const recentGradesRaw = await Submission.find({
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
    const assignment = s.assignment as any;
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

export async function getEnrolledCourses(studentId: string) {
  const enrollments = await Enrollment.find({ student: studentId }).select('course').lean();
  const courseIds = enrollments.map((e) => e.course);

  const courses = await Course.find({ _id: { $in: courseIds } })
    .populate('instructor', 'name email')
    .lean();

  return courses;
}

export async function getEnrolledCourseById(courseId: string, studentId: string) {
  await verifyEnrollment(courseId, studentId);

  const course = await Course.findById(courseId)
    .populate('instructor', 'name email')
    .lean();

  if (!course) throw ApiError.notFound('Course not found');
  return course;
}

// ══════════════════════════════════════════
//  MODULES + MATERIALS
// ══════════════════════════════════════════

export async function getModulesForCourse(courseId: string, studentId: string) {
  await verifyEnrollment(courseId, studentId);

  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();

  const modulesWithMaterials = await Promise.all(
    modules.map(async (mod) => {
      const materials = await Material.find({ module: mod._id })
        .sort({ createdAt: -1 })
        .lean();
      return { ...mod, materials };
    })
  );

  return modulesWithMaterials;
}

// ══════════════════════════════════════════
//  ANNOUNCEMENTS
// ══════════════════════════════════════════

export async function getAnnouncementsForCourse(courseId: string, studentId: string) {
  await verifyEnrollment(courseId, studentId);
  return Announcement.find({ course: courseId }).sort({ createdAt: -1 }).lean();
}

// ══════════════════════════════════════════
//  ASSIGNMENTS
// ══════════════════════════════════════════

export async function getAssignmentsForCourse(courseId: string, studentId: string) {
  await verifyEnrollment(courseId, studentId);

  const assignments = await Assignment.find({ course: courseId }).sort({ dueDate: 1 }).lean();

  // Get all submissions for this student in these assignments
  const assignmentIds = assignments.map((a) => a._id);
  const submissions = await Submission.find({
    assignment: { $in: assignmentIds },
    student: studentId,
  }).lean();

  const submissionMap = new Map<string, typeof submissions[0]>();
  for (const sub of submissions) {
    submissionMap.set(sub.assignment.toString(), sub);
  }

  return assignments.map((assgn) => {
    const sub = submissionMap.get(assgn._id.toString());

    let submissionStatus: 'not_submitted' | 'submitted' | 'graded' = 'not_submitted';
    let submittedAt: Date | null = null;
    let marks: number | null = null;
    let feedback: string | null = null;

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

export async function getAssignmentDetail(assignmentId: string, studentId: string) {
  const assignment = await Assignment.findById(assignmentId)
    .populate('course', 'title code')
    .lean();

  if (!assignment) throw ApiError.notFound('Assignment not found');

  // Verify student is enrolled in this assignment's course
  const populatedAssignment = assignment as any;
  const courseId = populatedAssignment.course._id
    ? populatedAssignment.course._id.toString()
    : populatedAssignment.course.toString();

  await verifyEnrollment(courseId, studentId);

  // Get the student's submission if it exists
  const submission = await Submission.findOne({
    assignment: assignmentId,
    student: studentId,
  }).lean();

  let submissionData: any = null;
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
      gradingType: (assignment as any).gradingType || 'graded',
      totalMarks: assignment.totalMarks,
      course: assignment.course,
    },
    submission: submissionData,
  };
}

// ══════════════════════════════════════════
//  SUBMISSION UPLOAD
// ══════════════════════════════════════════

export async function createOrReplaceSubmission(
  assignmentId: string,
  studentId: string,
  file: Express.Multer.File,
  fileUrl: string
) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  await verifyEnrollment(assignment.course.toString(), studentId);

  // Check for existing submission
  const existing = await Submission.findOne({
    assignment: assignmentId,
    student: studentId,
  });

  if (existing) {
    // If graded, reject replacement
    if (existing.marks !== null) {
      throw ApiError.badRequest('Cannot replace a graded submission. Your submission has already been graded.');
    }

    // Replace: delete old file, update the same document
    if (existing.fileUrl) {
      safeDeleteFile(existing.fileUrl);
    }

    existing.fileName = file.originalname;
    existing.fileUrl = fileUrl;
    existing.mimeType = file.mimetype;
    existing.fileSize = file.size;
    existing.submittedAt = new Date();

    await existing.save();
    return existing;
  }

  // Create new submission
  const submission = new Submission({
    assignment: assignmentId,
    student: studentId,
    fileName: file.originalname,
    fileUrl: fileUrl,
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

export async function getStudentGrades(studentId: string) {
  // Return the student's enrolled course list for the grades landing page
  const enrollments = await Enrollment.find({ student: studentId }).select('course').lean();
  const courseIds = enrollments.map((e) => e.course);

  const courses = await Course.find({ _id: { $in: courseIds } })
    .select('title code')
    .lean();

  return { courses };
}

// ══════════════════════════════════════════
//  COURSE-WISE GRADES
// ══════════════════════════════════════════

export async function getStudentCourseGrades(courseId: string, studentId: string) {
  // Verify enrollment
  await verifyEnrollment(courseId, studentId);

  // Get the course info
  const course = await Course.findById(courseId).select('title code').lean();
  if (!course) throw ApiError.notFound('Course not found');

  // Get only graded assignments for this course
  const assignments = await Assignment.find({
    course: courseId,
    gradingType: 'graded',
  }).select('_id title dueDate totalMarks').lean();

  const assignmentIds = assignments.map((a) => a._id);

  // Get the student's graded submissions for those assignments
  const submissions = await Submission.find({
    assignment: { $in: assignmentIds },
    student: studentId,
    marks: { $ne: null },
  }).lean();

  const submissionMap = new Map<string, typeof submissions[0]>();
  for (const sub of submissions) {
    submissionMap.set(sub.assignment.toString(), sub);
  }

  const grades = assignments
    .filter((a) => submissionMap.has(a._id.toString()))
    .map((a) => {
      const sub = submissionMap.get(a._id.toString())!;
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
