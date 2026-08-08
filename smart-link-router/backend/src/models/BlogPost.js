const mongoose = require('mongoose');

const STATUSES = ['draft', 'published'];

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    featuredImage: {
      type: String,
      trim: true,
      default: null,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// Supports the public "published posts, newest first" query.
blogPostSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
module.exports.STATUSES = STATUSES;
