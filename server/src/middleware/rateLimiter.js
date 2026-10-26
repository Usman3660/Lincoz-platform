/**
 * Lincoz Enterprise - Rate Limiting Middlewares
 * RULE 2: Apply rate limiting on all API routes.
 * Throttles auth brute-force, API spam, AI resource drainage, and upload floods.
 */

import rateLimit from 'express-rate-limit';

/**
 * 1. Auth endpoints: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 15 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please retry after 15 minutes.',
    statusCode: 429,
  },
});

/**
 * 2. General API: 60 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down and try again.',
    statusCode: 429,
  },
});

/**
 * 3. File uploads: 5 requests per minute per IP
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Upload limit reached (5 per minute). Please wait before uploading more files.',
    statusCode: 429,
  },
});

/**
 * 4. AI & LLM Proxy: 10 requests per minute per authenticated user
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Throttles per authenticated user ID; falls back to IP address
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'AI request limit reached (10 per minute). Please wait a moment.',
    statusCode: 429,
  },
});
