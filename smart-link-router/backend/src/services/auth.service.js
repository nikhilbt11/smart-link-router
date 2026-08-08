const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

// Hash both sides to a fixed-length buffer first so timingSafeEqual never
// throws on a length mismatch and comparison time doesn't leak input length.
function safeEquals(a, b) {
  const bufA = crypto.createHash('sha256').update(String(a)).digest();
  const bufB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

async function login(email, password) {
  const emailMatches = safeEquals(email, env.adminEmail);
  const passwordMatches = safeEquals(password, env.adminPassword);

  // Generic message for both cases — don't reveal which field was wrong.
  if (!emailMatches || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ email: env.adminEmail });
  return { token, admin: { email: env.adminEmail } };
}

module.exports = { login };
