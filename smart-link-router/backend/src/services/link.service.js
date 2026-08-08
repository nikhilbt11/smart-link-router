const Link = require('../models/Link');
const AppError = require('../utils/AppError');
const { assertValidObjectId } = require('../utils/mongoIds');

async function createLink(data) {
  try {
    return await Link.create(data);
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(`Alias "${data.alias}" is already in use`, 409);
    }
    throw err;
  }
}

async function getLinks() {
  return Link.find().sort({ createdAt: -1 });
}

async function getLinkById(id) {
  assertValidObjectId(id, 'Invalid link id');
  const link = await Link.findById(id);
  if (!link) {
    throw new AppError('Link not found', 404);
  }
  return link;
}

async function updateLink(id, updates) {
  assertValidObjectId(id, 'Invalid link id');
  try {
    const link = await Link.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!link) {
      throw new AppError('Link not found', 404);
    }
    return link;
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(`Alias "${updates.alias}" is already in use`, 409);
    }
    throw err;
  }
}

async function deleteLink(id) {
  assertValidObjectId(id, 'Invalid link id');
  const link = await Link.findByIdAndDelete(id);
  if (!link) {
    throw new AppError('Link not found', 404);
  }
  return link;
}

module.exports = { createLink, getLinks, getLinkById, updateLink, deleteLink };
