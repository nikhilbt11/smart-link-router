const AppError = require('../utils/AppError');
const { isValidHttpUrl } = require('../utils/linkFields');
const { STATUSES } = require('../models/BlogPost');

const TITLE_MAX_LENGTH = 200;
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG_MIN_LENGTH = 2;
const SLUG_MAX_LENGTH = 100;

function validateTitle(title, errors) {
  if (!title || typeof title !== 'string') {
    errors.push('title is required');
    return;
  }
  if (title.length > TITLE_MAX_LENGTH) {
    errors.push(`title must be at most ${TITLE_MAX_LENGTH} characters`);
  }
}

// Slug is optional on create (the service generates one from the title if
// omitted), but if one IS provided, it must already be well-formed.
function validateSlugIfProvided(slug, errors) {
  if (slug === undefined) return;
  if (typeof slug !== 'string' || slug.length === 0) {
    errors.push('slug must be a non-empty string');
    return;
  }
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
    errors.push(`slug must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`);
  }
  if (!SLUG_REGEX.test(slug)) {
    errors.push('slug may only contain lowercase letters, numbers, and single hyphens between words');
  }
}

function validateFeaturedImageIfProvided(featuredImage, errors) {
  if (!featuredImage) return;
  if (!isValidHttpUrl(featuredImage)) {
    errors.push('featuredImage must be a valid http(s) URL');
  }
}

function validateStatusIfProvided(status, errors) {
  if (status === undefined) return;
  if (!STATUSES.includes(status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }
}

// Whitelists and validates fields for blog creation; unknown body fields
// (including _id, admin, role, etc.) are silently ignored.
function validateCreateBlog(req, res, next) {
  const errors = [];
  const body = req.body || {};

  const title = typeof body.title === 'string' ? body.title.trim() : body.title;
  const author = typeof body.author === 'string' ? body.author.trim() : body.author;
  const content = typeof body.content === 'string' ? body.content : body.content;
  const featuredImage = typeof body.featuredImage === 'string' ? body.featuredImage.trim() : undefined;
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : body.slug;
  const status = body.status;

  validateTitle(title, errors);
  if (!author || typeof author !== 'string') errors.push('author is required');
  if (!content || typeof content !== 'string') errors.push('content is required');
  validateSlugIfProvided(slug, errors);
  validateFeaturedImageIfProvided(featuredImage, errors);
  validateStatusIfProvided(status, errors);

  if (errors.length > 0) {
    return next(new AppError(errors.join('; '), 400));
  }

  req.validatedBody = {
    title,
    author,
    content,
    ...(slug !== undefined && { slug }),
    ...(featuredImage && { featuredImage }),
    ...(status !== undefined && { status }),
  };
  next();
}

// Allows partial updates; whatever fields are provided must still pass validation.
function validateUpdateBlog(req, res, next) {
  const errors = [];
  const body = req.body || {};
  const updates = {};

  if (body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : body.title;
    validateTitle(title, errors);
    updates.title = title;
  }
  if (body.slug !== undefined) {
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : body.slug;
    validateSlugIfProvided(slug, errors);
    updates.slug = slug;
  }
  if (body.featuredImage !== undefined) {
    const featuredImage = typeof body.featuredImage === 'string' ? body.featuredImage.trim() : body.featuredImage;
    validateFeaturedImageIfProvided(featuredImage, errors);
    updates.featuredImage = featuredImage;
  }
  if (body.author !== undefined) {
    const author = typeof body.author === 'string' ? body.author.trim() : body.author;
    if (!author) errors.push('author cannot be empty');
    updates.author = author;
  }
  if (body.content !== undefined) {
    if (!body.content || typeof body.content !== 'string') errors.push('content cannot be empty');
    updates.content = body.content;
  }
  if (body.status !== undefined) {
    validateStatusIfProvided(body.status, errors);
    updates.status = body.status;
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

module.exports = { validateCreateBlog, validateUpdateBlog };
