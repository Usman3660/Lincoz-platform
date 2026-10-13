/**
 * Lincoz Enterprise - Authentication Middleware
 * RULE 4: Use established auth libraries, signed JWTs with short expiry, and httpOnly cookies.
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Extracts and verifies the Bearer JWT access token from headers.
 * Attaches user context (id, email, role, organizationId) to req.user.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No bearer token provided.',
      statusCode: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    // Multi-tenant SaaS isolation: attach active tenant ID
    req.tenantId = decoded.organizationId || 'org_lincoz_primary';
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access token expired. Please refresh your session.',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
      statusCode: 401,
    });
  }
};
