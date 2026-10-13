/**
 * Lincoz Enterprise - Structured JSON Logger
 * RULE 9: Log errors and operational events server-side with full context.
 */

export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      stack: meta.error?.stack,
      ...meta,
    }));
  },
};
