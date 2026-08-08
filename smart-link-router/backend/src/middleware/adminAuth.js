const AppError = require('../utils/AppError');
const env = require('../config/env');
const { verifyToken } = require('../utils/jwt');

function adminAuth(req, res, next) {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    return next(new AppError('Not authenticated', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.admin = { email: decoded.email };
    next();
  } catch {
    next(new AppError('Invalid or expired session', 401));
  }
}

module.exports = adminAuth;
