/**
 * Lincoz Enterprise - CORS Configuration
 * RULE 6: Never use wildcard CORS in production.
 * Whitelists explicit origins, restricts methods, and enables secure cookie credentials.
 */

import cors from 'cors';
import { env } from './env.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser agents (cURL, mobile apps, health checks) or whitelisted origin
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      env.ALLOWED_ORIGIN,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];

    const isVercelDomain = origin.endsWith('.vercel.app');

    if (allowedOrigins.includes(origin) || isVercelDomain) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Enables httpOnly refresh token cookies
  maxAge: 86400, // 24-hour pre-flight cache
});
