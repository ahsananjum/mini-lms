"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentBodySchema = exports.instructorAssignSchema = exports.updateCourseSchema = exports.createCourseSchema = exports.courseSearchQuerySchema = exports.courseAndStudentParamSchema = exports.courseIdParamSchema = exports.updateUserStatusSchema = exports.userIdParamSchema = exports.listUsersQuerySchema = exports.updateRequestStatusSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
// ── Phase 1 ──
exports.updateRequestStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'rejected'], {
        error: 'Status must be active or rejected',
    }),
});
// ── Phase 2 ──
exports.listUsersQuerySchema = zod_1.z.object({
    role: zod_1.z.enum(['all', 'student', 'instructor']).optional().default('all'),
    status: zod_1.z.enum(['all', 'active', 'rejected']).optional().default('all'),
    search: zod_1.z.string().optional().default(''),
});
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: 'Invalid user ID format',
    }),
});
exports.updateUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'rejected'], {
        error: 'Status must be active or rejected',
    }),
});
// ── Phase 3: Courses ──
const isObjectId = (val) => mongoose_1.default.Types.ObjectId.isValid(val);
exports.courseIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid course ID format' }),
});
exports.courseAndStudentParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid course ID format' }),
    studentId: zod_1.z.string().refine(isObjectId, { message: 'Invalid student ID format' }),
});
exports.courseSearchQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional().default(''),
});
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    code: zod_1.z.string().min(1, 'Code is required').max(20),
    description: zod_1.z.string().min(1, 'Description is required').max(2000),
});
exports.updateCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200).optional(),
    code: zod_1.z.string().min(1, 'Code is required').max(20).optional(),
    description: zod_1.z.string().min(1, 'Description is required').max(2000).optional(),
});
exports.instructorAssignSchema = zod_1.z.object({
    instructorId: zod_1.z
        .string()
        .nullable()
        .refine((val) => val === null || isObjectId(val), {
        message: 'Invalid instructor ID format',
    }),
});
exports.enrollmentBodySchema = zod_1.z.object({
    studentId: zod_1.z.string().refine(isObjectId, { message: 'Invalid student ID format' }),
});
//# sourceMappingURL=admin.validator.js.map