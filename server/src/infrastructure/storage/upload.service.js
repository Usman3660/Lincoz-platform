/**
 * Lincoz Enterprise - File Upload Security Service
 * RULE 8: Validate, rename to UUID, and store uploads safely outside web root or S3.
 */

import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Allowed MIME types & extensions mapping
const ALLOWED_MIME_TYPES = {
  // Images (Avatars, Screenshots) - Max 5MB
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  // Documents (Invoices, Receipts, SOWs) - Max 25MB
  'application/pdf': ['.pdf'],
  'application/zip': ['.zip'],
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;    // 5MB
const MAX_DOC_SIZE = 25 * 1024 * 1024;    // 25MB

// Local uploads directory (securely outside web root)
const UPLOAD_DIR = path.resolve(process.cwd(), 'storage', 'secure_uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Memory storage for server-side validation before writing to disk or cloud
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_DOC_SIZE, // Global ceiling; granular checked per type below
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype.toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase();

    // Verify MIME is allowed
    const validExtensions = ALLOWED_MIME_TYPES[mime];
    if (!validExtensions || !validExtensions.includes(ext)) {
      return cb(new Error(`Security rejection: Invalid file type [${mime}] with extension [${ext}].`));
    }

    cb(null, true);
  },
});

/**
 * Validates, renames to UUID, and commits file securely to disk or S3.
 * @param {Express.Multer.File} file
 * @param {'image' | 'document'} category
 * @returns {Promise<{ filename: string, path: string, size: number, mimeType: string }>}
 */
export async function processAndSaveUpload(file, category = 'image') {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Enforce category size limit
  const maxLimit = category === 'image' ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;
  if (file.size > maxLimit) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum ${maxLimit / (1024 * 1024)}MB allowed.`);
  }

  // Rename to UUID - Never use client filename
  const ext = path.extname(file.originalname).toLowerCase();
  const secureFilename = `${uuidv4()}${ext}`;
  const targetPath = path.join(UPLOAD_DIR, secureFilename);

  // Write file with non-executable permissions (0o644)
  await fs.promises.writeFile(targetPath, file.buffer, { mode: 0o644 });

  return {
    filename: secureFilename,
    path: targetPath,
    url: `/api/files/${secureFilename}`,
    size: file.size,
    mimeType: file.mimetype,
  };
}
