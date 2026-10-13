/**
 * Lincoz Enterprise - Application Entrypoint
 * Handles process bootstrapping, graceful termination, and unhandled rejection logging.
 */

import { createServer } from './server.js';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger/logger.js';

const app = createServer();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Lincoz Enterprise API active and listening on port ${env.PORT}`, {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    allowedOrigin: env.ALLOWED_ORIGIN,
  });
});

// Graceful Shutdown on SIGTERM & SIGINT
const handleShutdown = (signal) => {
  logger.info(`Received ${signal}. Gracefully closing HTTP listeners...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    logger.error('Forced shutdown invoked due to hanging connections.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection detected', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown', { error });
  process.exit(1);
});
