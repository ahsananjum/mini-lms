"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentIdParamSchema = exports.courseIdParamSchema = void 0;
const zod_1 = require("zod");
exports.courseIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Course ID is required'),
});
exports.assignmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Assignment ID is required'),
});
//# sourceMappingURL=student.validator.js.map