const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
  {
    alias: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    iosUrl: {
      type: String,
      required: true,
      trim: true,
    },
    androidUrl: {
      type: String,
      required: true,
      trim: true,
    },
    desktopUrl: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional admin-facing label, distinct from the alias used in the redirect URL.
    title: {
      type: String,
      trim: true,
    },
    // Lets the redirect engine (Module 3) disable a link without deleting it.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Link', linkSchema);
