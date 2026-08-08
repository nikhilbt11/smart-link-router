const linkService = require('../services/link.service');
const asyncHandler = require('../utils/asyncHandler');

const createLink = asyncHandler(async (req, res) => {
  const link = await linkService.createLink(req.validatedBody);
  res.status(201).json({ success: true, data: link, message: 'Link created successfully' });
});

const getLinks = asyncHandler(async (req, res) => {
  const links = await linkService.getLinks();
  res.status(200).json({ success: true, data: links, message: 'Links retrieved successfully' });
});

const getLinkById = asyncHandler(async (req, res) => {
  const link = await linkService.getLinkById(req.params.id);
  res.status(200).json({ success: true, data: link, message: 'Link retrieved successfully' });
});

const updateLink = asyncHandler(async (req, res) => {
  const link = await linkService.updateLink(req.params.id, req.validatedBody);
  res.status(200).json({ success: true, data: link, message: 'Link updated successfully' });
});

const deleteLink = asyncHandler(async (req, res) => {
  await linkService.deleteLink(req.params.id);
  res.status(200).json({ success: true, data: null, message: 'Link deleted successfully' });
});

module.exports = { createLink, getLinks, getLinkById, updateLink, deleteLink };
