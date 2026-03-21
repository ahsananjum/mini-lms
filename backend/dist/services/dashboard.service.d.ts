export declare function getAdminDashboard(): Promise<{
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    totalEnrollments: number;
    pendingUsers: number;
    recentUsers: (import("../models/User").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    recentCourses: (import("../models/Course").ICourse & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
    recentEnrollments: (import("../models/Enrollment").IEnrollment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
//# sourceMappingURL=dashboard.service.d.ts.map