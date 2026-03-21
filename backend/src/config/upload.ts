import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError';

// ── Materials Upload (existing) ──

const MATERIALS_DIR = path.join(process.cwd(), 'uploads', 'materials');
if (!fs.existsSync(MATERIALS_DIR)) {
  fs.mkdirSync(MATERIALS_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip',
  '.png', '.jpg', '.jpeg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const materialStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, MATERIALS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type '${ext}' is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
}

export const materialUpload = multer({
  storage: materialStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ── Submissions Upload (Phase 6) ──

const SUBMISSIONS_DIR = path.join(process.cwd(), 'uploads', 'submissions');
if (!fs.existsSync(SUBMISSIONS_DIR)) {
  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
}

const submissionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, SUBMISSIONS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const submissionUpload = multer({
  storage: submissionStorage,
  fileFilter, // same extensions + size
  limits: { fileSize: MAX_FILE_SIZE },
});
