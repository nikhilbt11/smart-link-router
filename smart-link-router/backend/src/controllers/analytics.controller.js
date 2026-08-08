const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');

const getLinkEvents = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  const { page, limit, from, to } = req.query;

  const result = await analyticsService.getLinkEvents(linkId, { page, limit, from, to });
  res.status(200).json({ success: true, data: result, message: 'Analytics events retrieved successfully' });
});

const getLinkSummary = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  const { from, to } = req.query;

  const summary = await analyticsService.getLinkSummary(linkId, { from, to });
  res.status(200).json({ success: true, data: summary, message: 'Link analytics summary retrieved successfully' });
});

const getGlobalSummary = asyncHandler(async (req, res) => {
  const { from, to, topLinksLimit } = req.query;

  const summary = await analyticsService.getGlobalSummary({ from, to, topLinksLimit });
  res.status(200).json({ success: true, data: summary, message: 'Global analytics summary retrieved successfully' });
});

module.exports = { getLinkEvents, getLinkSummary, getGlobalSummary };
