/**
 * Lincoz Enterprise - Input Validation Middleware
 * RULE 3: Validate and sanitize everything on the server.
 * Schema validation via Zod with automatic string trimming and bad input rejection.
 */

import { ZodError } from 'zod';

/**
 * Validates req.body, req.query, or req.params against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req[source]);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request payload',
          statusCode: 400,
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Malformed request data',
        statusCode: 400,
      });
    }
  };
};
