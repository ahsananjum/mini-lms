import { z } from 'zod';
export declare const updateRequestStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        active: "active";
        rejected: "rejected";
    }>;
}, z.core.$strip>;
export declare const listUsersQuerySchema: z.ZodObject<{
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        student: "student";
        instructor: "instructor";
        all: "all";
    }>>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        active: "active";
        rejected: "rejected";
        all: "all";
    }>>>;
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const userIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const updateUserStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        active: "active";
        rejected: "rejected";
    }>;
}, z.core.$strip>;
export declare const courseIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const courseAndStudentParamSchema: z.ZodObject<{
    id: z.ZodString;
    studentId: z.ZodString;
}, z.core.$strip>;
export declare const courseSearchQuerySchema: z.ZodObject<{
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const createCourseSchema: z.ZodObject<{
    title: z.ZodString;
    code: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
export declare const updateCourseSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const instructorAssignSchema: z.ZodObject<{
    instructorId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const enrollmentBodySchema: z.ZodObject<{
    studentId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=admin.validator.d.ts.map