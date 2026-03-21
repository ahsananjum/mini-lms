export declare function getStudentDashboard(studentId: string): Promise<{
    enrolledCoursesCount: number;
    pendingAssignmentsCount: number;
    submittedAssignmentsCount: number;
    gradedAssignmentsCount: number;
    recentAnnouncements: {
        _id: import("mongoose").Types.ObjectId;
        title: string;
        courseTitle: any;
        createdAt: Date;
    }[];
    recentGrades: {
        _id: import("mongoose").Types.ObjectId;
        assignmentTitle: any;
        courseTitle: any;
        marks: number | null;
        totalMarks: any;
        gradedAt: Date | null;
    }[];
}>;
export declare function getEnrolledCourses(studentId: string): Promise<(import("../models/Course").ICourse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function getEnrolledCourseById(courseId: string, studentId: string): Promise<import("../models/Course").ICourse & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function getModulesForCourse(courseId: string, studentId: string): Promise<{
    materials: (import("../models/Material").IMaterial & Required<{
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
export declare function getAnnouncementsForCourse(courseId: string, studentId: string): Promise<(import("../models/Announcement").IAnnouncement & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
})[]>;
export declare function getAssignmentsForCourse(courseId: string, studentId: string): Promise<{
    _id: import("mongoose").Types.ObjectId;
    title: string;
    description: string;
    dueDate: Date;
    gradingType: "graded" | "ungraded";
    totalMarks: number | null;
    submissionStatus: "graded" | "not_submitted" | "submitted";
    submittedAt: Date | null;
    marks: number | null;
    feedback: string | null;
}[]>;
export declare function getAssignmentDetail(assignmentId: string, studentId: string): Promise<{
    assignment: {
        _id: import("mongoose").Types.ObjectId;
        title: string;
        description: string;
        dueDate: Date;
        gradingType: any;
        totalMarks: number | null;
        course: import("mongoose").Types.ObjectId;
    };
    submission: any;
}>;
export declare function createOrReplaceSubmission(assignmentId: string, studentId: string, file: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../models/Submission").ISubmission, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Submission").ISubmission & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function getStudentGrades(studentId: string): Promise<{
    courses: (import("../models/Course").ICourse & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
export declare function getStudentCourseGrades(courseId: string, studentId: string): Promise<{
    course: import("../models/Course").ICourse & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    };
    grades: {
        assignmentId: import("mongoose").Types.ObjectId;
        title: string;
        dueDate: Date;
        totalMarks: number | null;
        obtainedMarks: number | null;
        feedback: string | null;
        submittedAt: Date;
        gradedAt: Date | null;
    }[];
}>;
//# sourceMappingURL=student.service.d.ts.map