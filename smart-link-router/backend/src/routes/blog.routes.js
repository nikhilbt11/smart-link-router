const express = require('express');
const controller = require('../controllers/blog.controller');
const adminAuth = require('../middleware/adminAuth');
const { validateCreateBlog, validateUpdateBlog } = require('../validators/blog.validator');

const router = express.Router();

// Public endpoints — no auth, and registered before the admin "/:id" route
// below so "published"/"slug" are never swallowed as an :id value.
router.get('/published', controller.getPublishedBlogs);
router.get('/slug/:slug', controller.getPublishedBlogBySlug);

// Admin endpoints.
router.post('/', adminAuth, validateCreateBlog, controller.createBlog);
router.get('/', adminAuth, controller.getBlogs);
router.get('/:id', adminAuth, controller.getBlogById);
router.put('/:id', adminAuth, validateUpdateBlog, controller.updateBlog);
router.delete('/:id', adminAuth, controller.deleteBlog);

module.exports = router;
