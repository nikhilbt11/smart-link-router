const blogService = require('../services/blog.service');
const asyncHandler = require('../utils/asyncHandler');

const createBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.createBlog(req.validatedBody);
  res.status(201).json({ success: true, data: blog, message: 'Blog post created successfully' });
});

const getBlogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await blogService.getBlogs({ page, limit });
  res.status(200).json({ success: true, data: result, message: 'Blog posts retrieved successfully' });
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.id);
  res.status(200).json({ success: true, data: blog, message: 'Blog post retrieved successfully' });
});

const updateBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.updateBlog(req.params.id, req.validatedBody);
  res.status(200).json({ success: true, data: blog, message: 'Blog post updated successfully' });
});

const deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteBlog(req.params.id);
  res.status(200).json({ success: true, data: null, message: 'Blog post deleted successfully' });
});

const getPublishedBlogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await blogService.getPublishedBlogs({ page, limit });
  res.status(200).json({ success: true, data: result, message: 'Published blog posts retrieved successfully' });
});

const getPublishedBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await blogService.getPublishedBlogBySlug(req.params.slug);
  res.status(200).json({ success: true, data: blog, message: 'Blog post retrieved successfully' });
});

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getPublishedBlogs,
  getPublishedBlogBySlug,
};
