// server/middleware/auth.js

/**
 * Middleware: requireAuth
 * Checks if the user is logged in by verifying the session.
 * Redirects to login page if not authenticated.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  console.warn('Unauthorized access attempt');
  return res.redirect('/login'); // Redirect to login page
}

/**
 * Middleware: requireRole
 * Checks if the logged-in user has the required role.
 * Useful for role-based access control (e.g., admin-only routes).
 */
function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.admin && req.session.admin.role === role) {
      return next();
    }
    console.warn(`Access denied: requires role "${role}"`);
    return res.status(403).send('Forbidden');
  };
}

module.exports = {
  requireAuth,
  requireRole
};
