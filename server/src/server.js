/**
 * Lincoz Enterprise - Express Server Assembly
 * Connects layered security middlewares, modular bounded contexts, and global error handling.
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeadersMiddleware } from './middleware/securityHeaders.js';
import { corsMiddleware } from './config/security.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Module Routers
import { authRouter } from './modules/auth/auth.routes.js';
import { attendanceRouter } from './modules/attendance/attendance.routes.js';
import { financialsRouter } from './modules/financials/financials.routes.js';
import { projectsRouter } from './modules/projects/projects.routes.js';
import { auditRouter } from './modules/audit/audit.routes.js';
import { aiRouter } from './modules/ai-proxy/ai.routes.js';
import { uploadRouter } from './modules/upload/upload.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { clientsRouter } from './modules/clients/clients.routes.js';
import { syncRouter } from './modules/sync/sync.routes.js';

export function createServer() {
  const app = express();

  // 1. Security Headers (Helmet, CSP, HSTS, X-Frame-Options: DENY) - Rule 7
  app.use(securityHeadersMiddleware);

  // 2. Strict CORS Configuration - Rule 6
  app.use(corsMiddleware);

  // 3. Cookie Parser (for httpOnly refresh tokens) - Rule 4
  app.use(cookieParser());

  // 4. Request Body Size Limits (Mitigates memory DOS attacks) - Rule 3
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. General API Rate Limiting (60 req/min) - Rule 2
  app.use('/api/', apiRateLimiter);

  // 6. Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'lincoz-enterprise-api',
      version: '1.0.0',
    });
  });

  // 7. Mount Bounded Context Microservice Modules
  app.use('/api/auth', authRouter);
  app.use('/api/attendance', attendanceRouter);
  app.use('/api/financials', financialsRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/audit', auditRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/sync', syncRouter);

  // 8. 404 Route Handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Resource not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
    });
  });

  // 9. Global Error Handling Middleware - Rule 9
  app.use(errorHandler);

  return app;
}
