const AppError = require('../utils/AppError');
const { normalizeAlias, isValidHttpUrl } = require('../utils/linkFields');

const ALIAS_REGEX = /^[a-zA-Z0-9-_]+$/;
const ALIAS_MIN_LENGTH = 2;
const ALIAS_MAX_LENGTH = 50;
// Segments already used as top-level route prefixes elsewhere in the app.
const RESERVED_ALIASES = ['api', 'admin', 'blog', 'l', 'login', 'health'];

function validateAlias(alias, errors) {
  if (!alias) {
    errors.push('alias is required');
    return;
  }
  if (alias.length < ALIAS_MIN_LENGTH || alias.length > ALIAS_MAX_LENGTH) {
    errors.push(`alias must be between ${ALIAS_MIN_LENGTH} and ${ALIAS_MAX_LENGTH} characters`);
  }
  if (!ALIAS_REGEX.test(alias)) {
    errors.push('alias may only contain letters, numbers, hyphens, and underscores');
  }
  if (RESERVED_ALIASES.includes(alias)) {
    errors.push(`alias "${alias}" is reserved and cannot be used`);
  }
}

function validateUrlField(value, fieldName, errors) {
  if (value === undefined || value === null || value === '') {
    errors.push(`${fieldName} is required`);
    return;
  }
  if (!isValidHttpUrl(value)) {
    errors.push(`${fieldName} must be a valid http(s) URL`);
  }
}

// Whitelists and validates fields for link creation; unknown body fields are silently ignored.
function validateCreateLink(req, res, next) {
  const errors = [];
  const body = req.body || {};

  const alias = normalizeAlias(body.alias);
  const iosUrl = typeof body.iosUrl === 'string' ? body.iosUrl.trim() : body.iosUrl;
  const androidUrl = typeof body.androidUrl === 'string' ? body.androidUrl.trim() : body.androidUrl;
  const desktopUrl = typeof body.desktopUrl === 'string' ? body.desktopUrl.trim() : body.desktopUrl;
  const title = typeof body.title === 'string' ? body.title.trim() : undefined;

  validateAlias(alias, errors);
  validateUrlField(iosUrl, 'iosUrl', errors);
  validateUrlField(androidUrl, 'androidUrl', errors);
  validateUrlField(desktopUrl, 'desktopUrl', errors);

  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join('; '), 400));
  }

  req.validatedBody = {
    alias,
    iosUrl,
    androidUrl,
    desktopUrl,
    ...(title && { title }),
    ...(body.isActive !== undefined && { isActive: body.isActive }),
  };
  next();
}

// Allows partial updates; whatever fields are provided must still pass validation.
function validateUpdateLink(req, res, next) {
  const errors = [];
  const body = req.body || {};
  const updates = {};

  if (body.alias !== undefined) {
    const alias = normalizeAlias(body.alias);
    validateAlias(alias, errors);
    updates.alias = alias;
  }
  if (body.iosUrl !== undefined) {
    const iosUrl = typeof body.iosUrl === 'string' ? body.iosUrl.trim() : body.iosUrl;
    validateUrlField(iosUrl, 'iosUrl', errors);
    updates.iosUrl = iosUrl;
  }
  if (body.androidUrl !== undefined) {
    const androidUrl = typeof body.androidUrl === 'string' ? body.androidUrl.trim() : body.androidUrl;
    validateUrlField(androidUrl, 'androidUrl', errors);
    updates.androidUrl = androidUrl;
  }
  if (body.desktopUrl !== undefined) {
    const desktopUrl = typeof body.desktopUrl === 'string' ? body.desktopUrl.trim() : body.desktopUrl;
    validateUrlField(desktopUrl, 'desktopUrl', errors);
    updates.desktopUrl = desktopUrl;
  }
  if (body.title !== undefined) {
    updates.title = typeof body.title === 'string' ? body.title.trim() : body.title;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    } else {
      updates.isActive = body.isActive;
    }
  }

  if (Object.keys(updates).length === 0) {
    errors.push('at least one field must be provided to update');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join('; '), 400));
  }

  req.validatedBody = updates;
  next();
}

module.exports = { validateCreateLink, validateUpdateLink };
