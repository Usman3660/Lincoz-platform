/**
 * Lincoz Enterprise - Global Error Handling Middleware
 * RULE 9: Never return internal errors or stack traces to the client.
 * Returns generic messages, uses correct status codes, and logs full context internally.
 */

import { logger } from '../infrastructure/logger/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);

  // Log full context internally
  logger.error('Unhandled API Exception', {
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    statusCode,
    error: {
      message: err.message,
      stack: err.stack,
    },
  });

  // Client response: Never expose stack traces or raw database error strings
  const isClientError = statusCode >= 400 && statusCode < 500;
  const userMessage = isClientError 
    ? err.message 
    : 'An unexpected internal error occurred. Our engineering team has been notified.';

  res.status(statusCode).json({
    success: false,
    error: userMessage,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};
