/**
 * Lincoz Enterprise - Database Client (Prisma ORM Singleton)
 * RULE 5: Always use an ORM or parameterized queries. Never concatenate raw SQL strings.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger/logger.js';

// Singleton instance to prevent multiple connection pools during hot-reloading
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['warn', 'error'] 
    : ['error'],
  errorFormat: 'minimal', // Never leaks raw internals
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Executes an atomic multi-tenant transaction with automatic rollback on error.
 * @template T
 * @param {(tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function runTransaction(callback) {
  try {
    return await prisma.$transaction(callback, {
      maxWait: 5000, // 5s timeout
      timeout: 10000, // 10s execution window
    });
  } catch (error) {
    logger.error('Database transaction failed and was rolled back safely', { error });
    throw error;
  }
}
