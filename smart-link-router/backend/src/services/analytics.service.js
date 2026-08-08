const mongoose = require('mongoose');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Link = require('../models/Link');
const AppError = require('../utils/AppError');
const { assertValidObjectId } = require('../utils/mongoIds');
const { lookupCountry } = require('../utils/geo');

const PLATFORMS = AnalyticsEvent.PLATFORMS;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const DEFAULT_TOP_LINKS = 5;
const MAX_TOP_LINKS = 20;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// All dates are interpreted as UTC. "from"/"to" query params use ISO 8601
// (e.g. 2026-08-01 or 2026-08-01T00:00:00Z). A date-only "to" value is treated
// as the end of that UTC day so single-day ranges (from=X&to=X) are inclusive.
function parseDateRange(from, to) {
  const range = {};
  if (from !== undefined) {
    const fromDate = new Date(from);
    if (Number.isNaN(fromDate.getTime())) {
      throw new AppError('Invalid "from" date; use an ISO date such as 2026-08-01', 400);
    }
    range.$gte = fromDate;
  }
  if (to !== undefined) {
    let toDate = new Date(to);
    if (Number.isNaN(toDate.getTime())) {
      throw new AppError('Invalid "to" date; use an ISO date such as 2026-08-08', 400);
    }
    if (DATE_ONLY_REGEX.test(to)) {
      toDate = new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    }
    range.$lte = toDate;
  }
  return Object.keys(range).length > 0 ? range : null;
}

function clampInt(value, fallback, min, max) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

async function assertLinkExists(linkId) {
  assertValidObjectId(linkId, 'Invalid link id');
  const exists = await Link.exists({ _id: linkId });
  if (!exists) {
    throw new AppError('Link not found', 404);
  }
}

function normalizePlatformDistribution(rawDistribution) {
  const distribution = PLATFORMS.reduce((acc, platform) => {
    acc[platform] = 0;
    return acc;
  }, {});
  rawDistribution.forEach(({ _id, count }) => {
    if (distribution[_id] !== undefined) distribution[_id] = count;
  });
  return distribution;
}

function summaryFacetStage() {
  return {
    totalClicks: [{ $count: 'count' }],
    platformDistribution: [{ $group: { _id: '$platform', count: { $sum: 1 } } }],
    timeSeries: [
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ],
  };
}

// Entry point for the redirect controller's fire-and-forget analytics hook.
// Country lookup is local/offline (no network I/O) and only runs here, after
// the redirect response has already been sent — never in the redirect's path.
async function recordClick(event) {
  const country = lookupCountry(event.ip);
  return AnalyticsEvent.create({ ...event, country });
}

async function getLinkEvents(linkId, { page, limit, from, to } = {}) {
  await assertLinkExists(linkId);

  const timestampRange = parseDateRange(from, to);
  const query = { linkId };
  if (timestampRange) query.timestamp = timestampRange;

  const safeLimit = clampInt(limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const safePage = clampInt(page, 1, 1, Number.MAX_SAFE_INTEGER);

  const [events, total] = await Promise.all([
    AnalyticsEvent.find(query)
      .select('timestamp platform deviceType browser country referrer ip')
      .sort({ timestamp: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    AnalyticsEvent.countDocuments(query),
  ]);

  return {
    events,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: total > 0 ? Math.ceil(total / safeLimit) : 0,
    },
  };
}

async function getLinkSummary(linkId, { from, to } = {}) {
  await assertLinkExists(linkId);

  const timestampRange = parseDateRange(from, to);
  const matchStage = { linkId: new mongoose.Types.ObjectId(linkId) };
  if (timestampRange) matchStage.timestamp = timestampRange;

  const [result] = await AnalyticsEvent.aggregate([
    { $match: matchStage },
    { $facet: summaryFacetStage() },
  ]);

  return {
    totalClicks: result.totalClicks[0]?.count || 0,
    platformDistribution: normalizePlatformDistribution(result.platformDistribution),
    timeSeries: result.timeSeries.map((entry) => ({ date: entry._id, clicks: entry.clicks })),
  };
}

async function getGlobalSummary({ from, to, topLinksLimit } = {}) {
  const timestampRange = parseDateRange(from, to);
  const matchStage = {};
  if (timestampRange) matchStage.timestamp = timestampRange;

  const safeTopLinksLimit = clampInt(topLinksLimit, DEFAULT_TOP_LINKS, 1, MAX_TOP_LINKS);

  const [result] = await AnalyticsEvent.aggregate([
    { $match: matchStage },
    {
      $facet: {
        ...summaryFacetStage(),
        topLinks: [
          { $group: { _id: '$linkId', clicks: { $sum: 1 } } },
          { $sort: { clicks: -1 } },
          { $limit: safeTopLinksLimit },
          { $lookup: { from: 'links', localField: '_id', foreignField: '_id', as: 'link' } },
          { $unwind: { path: '$link', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              linkId: '$_id',
              alias: '$link.alias',
              title: '$link.title',
              clicks: 1,
            },
          },
        ],
      },
    },
  ]);

  return {
    totalClicks: result.totalClicks[0]?.count || 0,
    platformDistribution: normalizePlatformDistribution(result.platformDistribution),
    timeSeries: result.timeSeries.map((entry) => ({ date: entry._id, clicks: entry.clicks })),
    topLinks: result.topLinks,
  };
}

module.exports = { recordClick, getLinkEvents, getLinkSummary, getGlobalSummary };
