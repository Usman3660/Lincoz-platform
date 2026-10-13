/**
 * Lincoz Enterprise - Runtime Environment Configuration
 * RULE 1: Never expose secrets in frontend code.
 * Validates and strictly parses all backend environment variables via Zod at startup.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env from root or server directory
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  ALLOWED_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Database Connection URL
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/lincoz_enterprise?schema=public'),
  
  // Authentication Secrets (Minimum 32 characters for HMAC SHA-256)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long').default('development_jwt_secret_must_be_minimum_32_chars_long'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development_refresh_secret_must_be_minimum_32_chars_long'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  
  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  
  // AI Proxy Configuration (Rule: Server-Side Only)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  MAX_AI_TOKENS_PER_REQUEST: z.coerce.number().default(500),
  DAILY_TOKEN_BUDGET_PER_USER: z.coerce.number().default(20000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ FATAL: Invalid or missing environment configuration:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
