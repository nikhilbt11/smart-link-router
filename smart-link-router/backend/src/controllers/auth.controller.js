const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { getCookieOptions } = require('../utils/authCookie');
const env = require('../config/env');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const { token, admin } = await authService.login(email, password);

  res.cookie(env.cookieName, token, getCookieOptions());
  res.status(200).json({ success: true, data: admin, message: 'Logged in successfully' });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.cookieName, getCookieOptions());
  res.status(200).json({ success: true, data: null, message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.admin, message: 'Authenticated' });
});

module.exports = { login, logout, me };
