/**
 * Lincoz Enterprise - Vercel Serverless Function Handler
 * Bridges the Express application to Vercel's Node.js Serverless Execution Environment.
 */

import { createServer } from '../server/src/server.js';

const app = createServer();

export default app;
