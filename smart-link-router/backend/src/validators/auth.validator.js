const AppError = require('../utils/AppError');

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string') errors.push('email is required');
  if (!password || typeof password !== 'string') errors.push('password is required');

  if (errors.length > 0) {
    return next(new AppError(errors.join('; '), 400));
  }

  req.validatedBody = { email: email.trim(), password };
  next();
}

module.exports = { validateLogin };
