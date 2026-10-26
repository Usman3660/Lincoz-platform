/**
 * Lincoz Enterprise - Authentication Routes (PostgreSQL Connected)
 * Queries prisma.user and verifies bcrypt hashed passwords.
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../infrastructure/database/client.js';
import { env } from '../../config/env.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';

export const authRouter = Router();

// High-speed in-memory user cache
export const userCache = new Map();

// Asynchronously sync and warm up the user cache in the background
(async function warmupUserCache() {
  try {
    const dbUsers = await prisma.user.findMany();
    for (const u of dbUsers) {
      userCache.set(u.email.toLowerCase().trim(), u);
    }
  } catch (err) {
    // Non-blocking background sync
  }
})();

// Track account lockouts
const failedLoginTracker = new Map();

const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase().trim(),
  password: z.string().min(1, 'Password is required').max(100),
  mfaCode: z.string().optional(),
});

/**
 * POST /api/auth/login
 * Validates credentials strictly against PostgreSQL database using bcrypt
 */
authRouter.post('/login', authRateLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check account lockout
    const failureRecord = failedLoginTracker.get(email);
    if (failureRecord && failureRecord.attempts >= 5) {
      const lockRemaining = failureRecord.lockedUntil - Date.now();
      if (lockRemaining > 0) {
        return res.status(429).json({
          success: false,
          error: `Account temporarily locked due to repeated failed logins. Retry in ${Math.ceil(lockRemaining / 60000)} minutes.`,
          statusCode: 429,
        });
      } else {
        failedLoginTracker.delete(email);
      }
    }

    // 1. Fetch user directly from PostgreSQL database
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        userCache.set(email, user);
      }
    } catch (dbErr) {
      console.error('[Auth] Database connection error during login:', dbErr.message);
      return res.status(500).json({
        success: false,
        error: 'Authentication database service temporarily unavailable.',
        statusCode: 500,
      });
    }

    // 2. Strict password verification via bcrypt against database passwordHash
    let isPasswordValid = false;
    if (user && user.passwordHash && user.isActive !== false) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!user || !isPasswordValid) {
      const attempts = (failureRecord?.attempts || 0) + 1;
      const lockedUntil = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : null;
      failedLoginTracker.set(email, { attempts, lockedUntil });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.',
        attemptsRemaining: Math.max(0, 5 - attempts),
        statusCode: 401,
      });
    }

    // Reset failed counter
    failedLoginTracker.delete(email);

    // Generate JWT Access Token (15m)
    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );

    // Generate Refresh Token (7d)
    const refreshToken = jwt.sign(
      { id: user.id, organizationId: user.organizationId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    res.cookie('lincoz_refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Authentication successful',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 */
authRouter.post('/refresh', (req, res) => {
  const refreshToken = req.cookies?.lincoz_refresh_token;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: 'No refresh token provided in secure cookie.',
      statusCode: 401,
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, organizationId: decoded.organizationId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );

    res.json({ success: true, token: newAccessToken });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token expired or invalid.',
      statusCode: 401,
    });
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (req, res) => {
  res.clearCookie('lincoz_refresh_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});
