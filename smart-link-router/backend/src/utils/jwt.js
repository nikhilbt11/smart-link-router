const jwt = require('jsonwebtoken');
const env = require('../config/env');

const TOKEN_TTL = '1d';

function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

// Throws if the token is missing, malformed, tampered with, or expired.
function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken, TOKEN_TTL };
