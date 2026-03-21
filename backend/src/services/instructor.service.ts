import { Course } from '../models/Course';
import { Module, IModule } from '../models/Module';
import { Material, IMaterial } from '../models/Material';
import { Announcement, IAnnouncement } from '../models/Announcement';
import { Assignment } from '../models/Assignment';
import { Submission } from '../models/Submission';
import { Enrollment } from '../models/Enrollment';
import { ApiError } from '../utils/ApiError';
import { put, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// ── Helper: verify instructor owns the course ──

async function getOwnCourse(courseId: string, instructorId: string) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (!course.instructor || course.instructor.toString() !== instructorId) {
    throw ApiError.forbidden('You are not assigned to this course');
  }
  return course;
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

export async function getInstructorDashboard(instructorId: string) {
  const courses = await Course.find({ instructor: instructorId }).select('_id title').lean();
  const courseIds = courses.map((c) => c._id);
  const courseTitleMap = new Map<string, string>();
  for (const c of courses) {
    courseTitleMap.set(c._id.toString(), c.title);
  }

  const modules = await Module.find({ course: { $in: courseIds } }).select('_id course').lean();
  const moduleIds = modules.map((m) => m._id);

  const [totalMaterialsCount, totalAssignmentsCount] = await Promise.all([
    Material.countDocuments({ module: { $in: moduleIds } }),
    Assignment.countDocuments({ course: { $in: courseIds } }),
  ]);

  // Ungraded submissions = submissions for assignments in instructor's courses where marks is null
  const assignmentIds = (await Assignment.find({ course: { $in: courseIds } }).select('_id')).map((a) => a._id);
  const ungradedSubmissionsCount = await Submission.countDocuments({
    assignment: { $in: assignmentIds },
    marks: null,
  });

  const recentMaterials = await Material.find({ module: { $in: moduleIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({ path: 'module', select: 'course' })
    .lean();

  const recentMaterialsWithCourse = recentMaterials.map((m) => {
    const mod = m.module as any;
    const courseId = mod?.course?.toString() || '';
    return {
      _id: m._id,
      title: m.title,
      courseTitle: courseTitleMap.get(courseId) || 'Unknown',
      createdAt: m.createdAt,
    };
  });

  const recentAnnouncements = await Announcement.find({ course: { $in: courseIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentAnnouncementsWithCourse = recentAnnouncements.map((a) => ({
    _id: a._id,
    title: a.title,
    courseTitle: courseTitleMap.get(a.course.toString()) || 'Unknown',
    createdAt: a.createdAt,
  }));

  const recentAssignments = await Assignment.find({ course: { $in: courseIds } })
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

export async function getInstructorCourses(instructorId: string) {
  return Course.find({ instructor: instructorId }).sort({ createdAt: -1 }).lean();
}

export async function getInstructorCourseById(courseId: string, instructorId: string) {
  return getOwnCourse(courseId, instructorId);
}

// ══════════════════════════════════════════
//  MODULES
// ══════════════════════════════════════════

export async function getModulesForCourse(courseId: string, instructorId: string) {
  await getOwnCourse(courseId, instructorId);

  const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();

  const modulesWithMaterials = await Promise.all(
    modules.map(async (mod) => {
      const materials = await Material.find({ module: mod._id }).sort({ createdAt: -1 }).lean();
      return { ...mod, materials };
    })
  );

  return modulesWithMaterials;
}

export async function createModule(
  courseId: string,
  instructorId: string,
  data: { title: string; description?: string }
) {
  await getOwnCourse(courseId, instructorId);

  const lastModule = await Module.findOne({ course: courseId }).sort({ order: -1 });
  const nextOrder = lastModule ? lastModule.order + 1 : 1;

  const mod = new Module({
    course: courseId,
    title: data.title,
    description: data.description || '',
    order: nextOrder,
  });

  await mod.save();
  return mod;
}

export async function updateModule(
  moduleId: string,
  instructorId: string,
  data: { title?: string; description?: string }
) {
  const mod = await Module.findById(moduleId);
  if (!mod) throw ApiError.notFound('Module not found');

  await getOwnCourse(mod.course.toString(), instructorId);

  if (data.title !== undefined) mod.title = data.title;
  if (data.description !== undefined) mod.description = data.description;

  await mod.save();
  return mod;
}

export async function deleteModule(moduleId: string, instructorId: string) {
  const mod = await Module.findById(moduleId);
  if (!mod) throw ApiError.notFound('Module not found');

  await getOwnCourse(mod.course.toString(), instructorId);

  const materials = await Material.find({ module: moduleId });
  for (const mat of materials) {
    if (mat.fileUrl) safeDeleteFile(mat.fileUrl);
  }
  await Material.deleteMany({ module: moduleId });

  await Module.findByIdAndDelete(moduleId);
}

// ══════════════════════════════════════════
//  MATERIALS
// ══════════════════════════════════════════

export async function createMaterial(
  moduleId: string,
  instructorId: string,
  data: { title: string; description?: string },
  file: Express.Multer.File,
  fileUrl: string
) {
  const mod = await Module.findById(moduleId);
  if (!mod) throw ApiError.notFound('Module not found');

  await getOwnCourse(mod.course.toString(), instructorId);

  const material = new Material({
    module: moduleId,
    title: data.title,
    description: data.description || '',
    fileName: file.originalname,
    fileUrl: fileUrl,
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadedBy: instructorId,
  });

  await material.save();
  return material;
}

export async function deleteMaterial(materialId: string, instructorId: string) {
  const material = await Material.findById(materialId);
  if (!material) throw ApiError.notFound('Material not found');

  const mod = await Module.findById(material.module);
  if (!mod) throw ApiError.notFound('Module not found');

  await getOwnCourse(mod.course.toString(), instructorId);

  if (material.fileUrl) safeDeleteFile(material.fileUrl);

  await Material.findByIdAndDelete(materialId);
}

// ══════════════════════════════════════════
//  ANNOUNCEMENTS
// ══════════════════════════════════════════

export async function getAnnouncementsForCourse(courseId: string, instructorId: string) {
  await getOwnCourse(courseId, instructorId);
  return Announcement.find({ course: courseId }).sort({ createdAt: -1 }).lean();
}

export async function createAnnouncement(
  courseId: string,
  instructorId: string,
  data: { title: string; message: string }
) {
  await getOwnCourse(courseId, instructorId);

  const announcement = new Announcement({
    course: courseId,
    title: data.title,
    message: data.message,
    createdBy: instructorId,
  });

  await announcement.save();
  return announcement;
}

export async function updateAnnouncement(
  announcementId: string,
  instructorId: string,
  data: { title?: string; message?: string }
) {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) throw ApiError.notFound('Announcement not found');

  await getOwnCourse(announcement.course.toString(), instructorId);

  if (data.title !== undefined) announcement.title = data.title;
  if (data.message !== undefined) announcement.message = data.message;

  await announcement.save();
  return announcement;
}

export async function deleteAnnouncement(announcementId: string, instructorId: string) {
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) throw ApiError.notFound('Announcement not found');

  await getOwnCourse(announcement.course.toString(), instructorId);

  await Announcement.findByIdAndDelete(announcementId);
}

// ══════════════════════════════════════════
//  ASSIGNMENTS (Phase 5)
// ══════════════════════════════════════════

export async function getAssignmentsForCourse(courseId: string, instructorId: string) {
  await getOwnCourse(courseId, instructorId);
  return Assignment.find({ course: courseId }).sort({ createdAt: -1 }).lean();
}

export async function createAssignment(
  courseId: string,
  instructorId: string,
  data: { title: string; description?: string; dueDate: string; gradingType: 'graded' | 'ungraded'; totalMarks?: number | null }
) {
  await getOwnCourse(courseId, instructorId);

  const gradingType = data.gradingType || 'graded';

  // Validate totalMarks based on gradingType
  if (gradingType === 'graded') {
    if (data.totalMarks === undefined || data.totalMarks === null || data.totalMarks < 1) {
      throw ApiError.badRequest('Total marks is required and must be a positive number for graded assignments');
    }
  }

  const assignment = new Assignment({
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

export async function getAssignmentById(assignmentId: string, instructorId: string) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  await getOwnCourse(assignment.course.toString(), instructorId);
  return assignment;
}

export async function updateAssignment(
  assignmentId: string,
  instructorId: string,
  data: { title?: string; description?: string; dueDate?: string; totalMarks?: number | null; gradingType?: string }
) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  await getOwnCourse(assignment.course.toString(), instructorId);

  // Reject any attempt to change gradingType
  if (data.gradingType !== undefined && data.gradingType !== assignment.gradingType) {
    throw ApiError.badRequest('Cannot change assignment grading type after creation');
  }

  if (data.title !== undefined) assignment.title = data.title;
  if (data.description !== undefined) assignment.description = data.description;
  if (data.dueDate !== undefined) assignment.dueDate = new Date(data.dueDate);

  // Only allow totalMarks changes for graded assignments
  if (data.totalMarks !== undefined) {
    if (assignment.gradingType === 'graded') {
      if (data.totalMarks === null || data.totalMarks < 1) {
        throw ApiError.badRequest('Total marks must be a positive number for graded assignments');
      }
      assignment.totalMarks = data.totalMarks;
    }
    // For ungraded, silently ignore totalMarks changes — it stays null
  }

  await assignment.save();
  return assignment;
}

export async function deleteAssignment(assignmentId: string, instructorId: string) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  await getOwnCourse(assignment.course.toString(), instructorId);

  // Delete related submissions and their files
  const submissions = await Submission.find({ assignment: assignmentId });
  for (const sub of submissions) {
    if (sub.fileUrl) safeDeleteFile(sub.fileUrl);
  }
  await Submission.deleteMany({ assignment: assignmentId });

  await Assignment.findByIdAndDelete(assignmentId);
}

// ══════════════════════════════════════════
//  SUBMISSIONS REVIEW (Phase 5)
// ══════════════════════════════════════════

export async function getSubmissionsForAssignment(assignmentId: string, instructorId: string) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  await getOwnCourse(assignment.course.toString(), instructorId);

  // Get all enrolled students in this course
  const enrollments = await Enrollment.find({ course: assignment.course })
    .populate('student', 'name email')
    .lean();

  // Get all real submissions for this assignment
  const submissions = await Submission.find({ assignment: assignmentId }).lean();

  // Build a map of student submissions keyed by student ID
  const submissionMap = new Map<string, typeof submissions[0]>();
  for (const sub of submissions) {
    submissionMap.set(sub.student.toString(), sub);
  }

  // Merge enrollments with submissions — honest statuses only
  const rows = enrollments.map((enrollment) => {
    const studentId = (enrollment.student as any)._id.toString();
    const sub = submissionMap.get(studentId);

    if (!sub) {
      return {
        student: enrollment.student,
        submission: {
          _id: null,
          status: 'not_submitted' as const,
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

export async function gradeSubmission(
  submissionId: string,
  instructorId: string,
  data: { marks: number; feedback?: string }
) {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw ApiError.notFound('Submission not found');

  const assignment = await Assignment.findById(submission.assignment);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  await getOwnCourse(assignment.course.toString(), instructorId);

  // Reject grading for ungraded assignments
  if (assignment.gradingType === 'ungraded') {
    throw ApiError.badRequest('Cannot grade an ungraded assignment. This assignment does not accept marks.');
  }

  if (data.marks < 0 || data.marks > (assignment.totalMarks || 0)) {
    throw ApiError.badRequest(`Marks must be between 0 and ${assignment.totalMarks}`);
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

export async function getSubmissionsOverview(instructorId: string) {
  // 1. Load instructor's course IDs
  const courses = await Course.find({ instructor: instructorId }).select('_id title code').lean();
  const courseIds = courses.map((c) => c._id);

  if (courseIds.length === 0) {
    return {
      summary: { gradedAssignmentsCount: 0, pendingGradingCount: 0 },
      assignments: [],
    };
  }

  // Build a course lookup map
  const courseMap = new Map<string, { title: string; code: string }>();
  for (const c of courses) {
    courseMap.set(c._id.toString(), { title: c.title, code: c.code });
  }

  // 2. Load only graded assignments for those courses
  const assignments = await Assignment.find({
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
  const enrollmentCounts = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
  ]);
  const enrollmentMap = new Map<string, number>();
  for (const e of enrollmentCounts) {
    enrollmentMap.set(e._id.toString(), e.count);
  }

  // 4. Get submission counts grouped by assignment
  const submissionCounts = await Submission.aggregate([
    { $match: { assignment: { $in: assignmentIds } } },
    { $group: { _id: '$assignment', total: { $sum: 1 }, graded: { $sum: { $cond: [{ $ne: ['$marks', null] }, 1, 0] } } } },
  ]);
  const submissionMap = new Map<string, { total: number; graded: number }>();
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
