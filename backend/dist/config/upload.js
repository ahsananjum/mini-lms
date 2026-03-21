"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionUpload = exports.materialUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = require("../utils/ApiError");
// ── Materials Upload (existing) ──
const MATERIALS_DIR = path_1.default.join(process.cwd(), 'uploads', 'materials');
if (!fs_1.default.existsSync(MATERIALS_DIR)) {
    fs_1.default.mkdirSync(MATERIALS_DIR, { recursive: true });
}
const ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip',
    '.png', '.jpg', '.jpeg',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const materialStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, MATERIALS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});
function fileFilter(_req, file, cb) {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.ApiError(400, `File type '${ext}' is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
}
exports.materialUpload = (0, multer_1.default)({
    storage: materialStorage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
});
// ── Submissions Upload (Phase 6) ──
const SUBMISSIONS_DIR = path_1.default.join(process.cwd(), 'uploads', 'submissions');
if (!fs_1.default.existsSync(SUBMISSIONS_DIR)) {
    fs_1.default.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}
const submissionStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, SUBMISSIONS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});
exports.submissionUpload = (0, multer_1.default)({
    storage: submissionStorage,
    fileFilter, // same extensions + size
    limits: { fileSize: MAX_FILE_SIZE },
});
//# sourceMappingURL=upload.js.map