const BlogPost = require('../models/BlogPost');
const AppError = require('../utils/AppError');
const { assertValidObjectId } = require('../utils/mongoIds');
const { slugify } = require('../utils/slugify');

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function clampInt(value, fallback, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function paginationOf(total, page, limit) {
  return { page, limit, total, pages: total > 0 ? Math.ceil(total / limit) : 0 };
}

async function createBlog(data) {
  const slug = data.slug || slugify(data.title);
  const status = data.status || 'draft';
  const publishedAt = status === 'published' ? new Date() : null;

  try {
    return await BlogPost.create({ ...data, slug, status, publishedAt });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(`Slug "${slug}" is already in use`, 409);
    }
    throw err;
  }
}

async function getBlogs({ page, limit } = {}) {
  const safeLimit = clampInt(limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const safePage = clampInt(page, 1, 1, Number.MAX_SAFE_INTEGER);

  const [posts, total] = await Promise.all([
    BlogPost.find()
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    BlogPost.countDocuments(),
  ]);

  return { posts, pagination: paginationOf(total, safePage, safeLimit) };
}

async function getBlogById(id) {
  assertValidObjectId(id, 'Invalid blog id');
  const post = await BlogPost.findById(id);
  if (!post) {
    throw new AppError('Blog post not found', 404);
  }
  return post;
}

async function updateBlog(id, updates) {
  assertValidObjectId(id, 'Invalid blog id');

  const existing = await BlogPost.findById(id);
  if (!existing) {
    throw new AppError('Blog post not found', 404);
  }

  const nextUpdates = { ...updates };
  // Only touch publishedAt on an actual draft<->published transition; leave
  // it alone when a published post is edited but stays published (and vice versa).
  if (updates.status !== undefined && updates.status !== existing.status) {
    nextUpdates.publishedAt = updates.status === 'published' ? new Date() : null;
  }

  try {
    Object.assign(existing, nextUpdates);
    return await existing.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(`Slug "${updates.slug}" is already in use`, 409);
    }
    throw err;
  }
}

async function deleteBlog(id) {
  assertValidObjectId(id, 'Invalid blog id');
  const post = await BlogPost.findByIdAndDelete(id);
  if (!post) {
    throw new AppError('Blog post not found', 404);
  }
  return post;
}

async function getPublishedBlogs({ page, limit } = {}) {
  const safeLimit = clampInt(limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const safePage = clampInt(page, 1, 1, Number.MAX_SAFE_INTEGER);
  const query = { status: 'published' };

  const [posts, total] = await Promise.all([
    BlogPost.find(query)
      .sort({ publishedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    BlogPost.countDocuments(query),
  ]);

  return { posts, pagination: paginationOf(total, safePage, safeLimit) };
}

// Never reveals whether a non-published post exists for this slug — always 404.
async function getPublishedBlogBySlug(slug) {
  const post = await BlogPost.findOne({ slug: String(slug).trim().toLowerCase(), status: 'published' });
  if (!post) {
    throw new AppError('Blog post not found', 404);
  }
  return post;
}

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,
  getPublishedBlogBySlug,
};
