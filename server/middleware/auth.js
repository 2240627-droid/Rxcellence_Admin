// server/middleware/auth.js

/**
 * Middleware: requireAuth
 * Ensures the user is logged in (session exists) before allowing access.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  console.warn('Unauthorized access attempt');
  return res.redirect('/login'); // redirect to login instead of root
}

/**
 * Middleware: requireRole
 * Ensures the logged-in user has a specific role (e.g., 'admin').
 * Extend this if you add role-based access later.
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
