/**
 * Lincoz Enterprise - File Upload Module Routes
 * RULE 8: MIME validation, size caps (5MB/25MB), UUID renaming, stored outside web root.
 * Rate limited to 5 requests per minute.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { uploadRateLimiter } from '../../middleware/rateLimiter.js';
import { uploadMiddleware, processAndSaveUpload } from '../../infrastructure/storage/upload.service.js';

export const uploadRouter = Router();

/**
 * POST /api/upload
 * Handles avatars, invoice PDFs, and deliverable attachments
 */
uploadRouter.post(
  '/',
  authenticate,
  uploadRateLimiter,
  uploadMiddleware.single('file'),
  async (req, res, next) => {
    try {
      const category = req.body.category === 'avatar' ? 'image' : 'document';
      const fileResult = await processAndSaveUpload(req.file, category);

      res.status(201).json({
        success: true,
        message: 'File validated, renamed, and stored securely.',
        file: {
          filename: fileResult.filename,
          url: fileResult.url,
          size: fileResult.size,
          mimeType: fileResult.mimeType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
