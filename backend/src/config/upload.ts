import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError';

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip',
  '.png', '.jpg', '.jpeg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const memoryStorage = multer.memoryStorage();

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
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const submissionUpload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
