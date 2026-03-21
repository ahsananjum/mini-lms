"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmissionSchema = exports.updateAssignmentSchema = exports.createAssignmentSchema = exports.submissionIdParamSchema = exports.assignmentIdParamSchema = exports.materialFieldsSchema = exports.updateAnnouncementSchema = exports.createAnnouncementSchema = exports.updateModuleSchema = exports.createModuleSchema = exports.announcementIdParamSchema = exports.materialIdParamSchema = exports.moduleIdParamSchema = exports.courseIdParamSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const isObjectId = (val) => mongoose_1.default.Types.ObjectId.isValid(val);
// ── Param schemas ──
exports.courseIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid course ID format' }),
});
exports.moduleIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid module ID format' }),
});
exports.materialIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid material ID format' }),
});
exports.announcementIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid announcement ID format' }),
});
// ── Module body schemas ──
exports.createModuleSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters'),
    description: zod_1.z.string().trim().max(500, 'Description must be at most 500 characters').optional().default(''),
});
exports.updateModuleSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters').optional(),
    description: zod_1.z.string().trim().max(500, 'Description must be at most 500 characters').optional(),
});
// ── Announcement body schemas ──
exports.createAnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters'),
    message: zod_1.z.string().trim().min(3, 'Message must be at least 3 characters').max(2000, 'Message must be at most 2000 characters'),
});
exports.updateAnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters').optional(),
    message: zod_1.z.string().trim().min(3, 'Message must be at least 3 characters').max(2000, 'Message must be at most 2000 characters').optional(),
});
// ── Material text field schema (for multipart forms) ──
exports.materialFieldsSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(120, 'Title must be at most 120 characters'),
    description: zod_1.z.string().trim().max(500, 'Description must be at most 500 characters').optional().default(''),
});
// ── Phase 5: Assignment schemas ──
exports.assignmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid assignment ID format' }),
});
exports.submissionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().refine(isObjectId, { message: 'Invalid submission ID format' }),
});
exports.createAssignmentSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(200, 'Title must be at most 200 characters'),
    description: zod_1.z.string().trim().max(2000, 'Description must be at most 2000 characters').optional().default(''),
    dueDate: zod_1.z.string().min(1, 'Due date is required'),
    totalMarks: zod_1.z.number().int().min(1, 'Total marks must be at least 1'),
});
exports.updateAssignmentSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2, 'Title must be at least 2 characters').max(200, 'Title must be at most 200 characters').optional(),
    description: zod_1.z.string().trim().max(2000, 'Description must be at most 2000 characters').optional(),
    dueDate: zod_1.z.string().optional(),
    totalMarks: zod_1.z.number().int().min(1, 'Total marks must be at least 1').optional(),
});
exports.gradeSubmissionSchema = zod_1.z.object({
    marks: zod_1.z.number().min(0, 'Marks cannot be negative'),
    feedback: zod_1.z.string().trim().max(2000, 'Feedback must be at most 2000 characters').optional().default(''),
});
//# sourceMappingURL=instructor.validator.js.map