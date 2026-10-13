/**
 * Lincoz Enterprise - Authorization Middleware
 * RULE 4: Always check ownership and role permissions on every request.
 */

/**
 * Restricts access to specified enterprise roles.
 * @param {string[]} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User identity not established.',
        statusCode: 401,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Action restricted to [${allowedRoles.join(', ')}]. Your role is '${req.user.role}'.`,
        statusCode: 403,
      });
    }

    next();
  };
};

/**
 * Ensures a user can only access their own profile or sensitive records unless they are SUPER_ADMIN.
 * @param {string} paramKey - URL parameter containing the user ID (e.g. 'userId')
 */
export const authorizeOwnershipOrAdmin = (paramKey = 'userId') => {
  return (req, res, next) => {
    const targetUserId = req.params[paramKey] || req.body[paramKey];
    
    if (!targetUserId) {
      return next();
    }

    const isSelf = req.user.id === targetUserId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isSelf && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to access or modify this user resource.',
        statusCode: 403,
      });
    }

    next();
  };
};
