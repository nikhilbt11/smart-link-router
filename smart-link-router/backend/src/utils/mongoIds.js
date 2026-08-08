const mongoose = require('mongoose');
const AppError = require('./AppError');

function assertValidObjectId(id, message = 'Invalid id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(message, 400);
  }
}

module.exports = { assertValidObjectId };
