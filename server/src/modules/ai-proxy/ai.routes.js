/**
 * Lincoz Enterprise - AI Proxy Module Routes
 * Rate limited to 10 requests per minute per user.
 * Routes prompt securely to server-side LLM gateway.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { aiRateLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { executeSecureAiPrompt } from './ai.service.js';

export const aiRouter = Router();

const aiPromptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(2000, 'Prompt exceeds 2000 characters ceiling'),
  context: z.string().max(500).optional(),
});

/**
 * POST /api/ai/summarize
 * Server-side AI proxy execution with per-user token rate limiting and input sanitization
 */
aiRouter.post(
  '/summarize',
  authenticate,
  aiRateLimiter,
  validate(aiPromptSchema),
  async (req, res, next) => {
    try {
      const { prompt, context } = req.body;
      const result = await executeSecureAiPrompt(req.user.id, prompt, context);

      res.json({
        success: true,
        summary: result.result,
        tokensUsed: result.tokensUsed,
      });
    } catch (error) {
      next(error);
    }
  }
);
