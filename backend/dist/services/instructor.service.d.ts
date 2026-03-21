import { IModule } from '../models/Module';
import { IMaterial } from '../models/Material';
import { IAnnouncement } from '../models/Announcement';
export declare function getInstructorDashboard(instructorId: string): Promise<{
    assignedCoursesCount: number;
    totalModulesCount: number;
    totalMaterialsCount: number;
    totalAssignmentsCount: number;
    ungradedSubmissionsCount: number;
    recentMaterials: {
        _id: import("mongoose").Types.ObjectId;
        title: string;
        courseTitle: string;
        createdAt: Date;
    }[];
    recentAnnouncements: {
        _id: import("mongoose").Types.ObjectId;
        title: string;
        courseTitle: string;
        createdAt: Date;
    }[];
    recentAssignments: {
        _id: import("mongoose").Types.ObjectId;
        title: string;
        courseTitle: string;
        createdAt: Date;
    }[];
}>;
export declare function getInstructorCourses(instructorId: string): Promise<(import("../models/Course").ICourse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function getInstructorCourseById(courseId: string, instructorId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Course").ICourse, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Course").ICourse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function getModulesForCourse(courseId: string, instructorId: string): Promise<{
    materials: (IMaterial & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    course: import("mongoose").Types.ObjectId;
    title: string;
    description: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    _id: import("mongoose").Types.ObjectId;
    $locals: Record<string, unknown>;
    $op: "save" | "validate" | "remove" | null;
    $where: Record<string, unknown>;
    baseModelName?: string;
    collection: import("mongoose").Collection;
    db: import("mongoose").Connection;
    errors?: import("mongoose").Error.ValidationError;
    isNew: boolean;
    schema: import("mongoose").Schema;
    __v: number;
}[]>;
export declare function createModule(courseId: string, instructorId: string, data: {
    title: string;
    description?: string;
}): Promise<import("mongoose").Document<unknown, {}, IModule, {}, import("mongoose").DefaultSchemaOptions> & IModule & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function updateModule(moduleId: string, instructorId: string, data: {
    title?: string;
    description?: string;
}): Promise<import("mongoose").Document<unknown, {}, IModule, {}, import("mongoose").DefaultSchemaOptions> & IModule & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function deleteModule(moduleId: string, instructorId: string): Promise<void>;
export declare function createMaterial(moduleId: string, instructorId: string, data: {
    title: string;
    description?: string;
}, file: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, IMaterial, {}, import("mongoose").DefaultSchemaOptions> & IMaterial & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function deleteMaterial(materialId: string, instructorId: string): Promise<void>;
export declare function getAnnouncementsForCourse(courseId: string, instructorId: string): Promise<(IAnnouncement & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function createAnnouncement(courseId: string, instructorId: string, data: {
    title: string;
    message: string;
}): Promise<import("mongoose").Document<unknown, {}, IAnnouncement, {}, import("mongoose").DefaultSchemaOptions> & IAnnouncement & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function updateAnnouncement(announcementId: string, instructorId: string, data: {
    title?: string;
    message?: string;
}): Promise<import("mongoose").Document<unknown, {}, IAnnouncement, {}, import("mongoose").DefaultSchemaOptions> & IAnnouncement & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function deleteAnnouncement(announcementId: string, instructorId: string): Promise<void>;
export declare function getAssignmentsForCourse(courseId: string, instructorId: string): Promise<(import("../models/Assignment").IAssignment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function createAssignment(courseId: string, instructorId: string, data: {
    title: string;
    description?: string;
    dueDate: string;
    gradingType: 'graded' | 'ungraded';
    totalMarks?: number | null;
}): Promise<import("mongoose").Document<unknown, {}, import("../models/Assignment").IAssignment, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Assignment").IAssignment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function getAssignmentById(assignmentId: string, instructorId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Assignment").IAssignment, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Assignment").IAssignment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function updateAssignment(assignmentId: string, instructorId: string, data: {
    title?: string;
    description?: string;
    dueDate?: string;
    totalMarks?: number | null;
    gradingType?: string;
}): Promise<import("mongoose").Document<unknown, {}, import("../models/Assignment").IAssignment, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Assignment").IAssignment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function deleteAssignment(assignmentId: string, instructorId: string): Promise<void>;
export declare function getSubmissionsForAssignment(assignmentId: string, instructorId: string): Promise<{
    assignment: {
        _id: import("mongoose").Types.ObjectId;
        title: string;
        gradingType: "graded" | "ungraded";
        totalMarks: number | null;
    };
    rows: ({
        student: import("mongoose").Types.ObjectId;
        submission: {
            _id: null;
            status: "not_submitted";
            fileUrl: null;
            fileName: null;
            submittedAt: null;
            marks: null;
            feedback: null;
        };
    } | {
        student: import("mongoose").Types.ObjectId;
        submission: {
            _id: import("mongoose").Types.ObjectId;
            status: string;
            fileUrl: string;
            fileName: string;
            submittedAt: Date;
            marks: number | null;
            feedback: string | null;
        };
    })[];
}>;
export declare function gradeSubmission(submissionId: string, instructorId: string, data: {
    marks: number;
    feedback?: string;
}): Promise<import("mongoose").Document<unknown, {}, import("../models/Submission").ISubmission, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Submission").ISubmission & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function getSubmissionsOverview(instructorId: string): Promise<{
    summary: {
        gradedAssignmentsCount: number;
        pendingGradingCount: number;
    };
    assignments: {
        assignmentId: import("mongoose").Types.ObjectId;
        assignmentTitle: string;
        courseId: import("mongoose").Types.ObjectId;
        courseTitle: string;
        courseCode: string;
        dueDate: Date;
        totalMarks: number | null;
        enrolledStudentsCount: number;
        submittedCount: number;
        gradedCount: number;
        pendingGradingCount: number;
    }[];
}>;
//# sourceMappingURL=instructor.service.d.ts.map