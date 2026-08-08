const mongoose = require('mongoose');

const PLATFORMS = ['iOS', 'Android', 'Desktop', 'Other'];

const analyticsEventSchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ip: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    platform: {
      type: String,
      enum: PLATFORMS,
      default: 'Other',
    },
    deviceType: {
      type: String,
      default: null,
    },
    browser: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
  },
  { versionKey: false }
);

// Supports "clicks for this link, newest first" — the core analytics query.
analyticsEventSchema.index({ linkId: 1, timestamp: -1 });
// Supports platform-distribution aggregations.
analyticsEventSchema.index({ platform: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
module.exports.PLATFORMS = PLATFORMS;
