const env = require('../config/env');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Login and logout must use identical options, otherwise clearCookie() won't
// match the cookie set at login.
function getCookieOptions() {
  const isProduction = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    // Frontend (localhost:3000) and backend (localhost:5000) are different
    // origins but the same "site" locally, so SameSite=Lax still allows the
    // cookie on cross-port fetches. A production deploy across real different
    // domains needs SameSite=None + Secure (HTTPS) instead.
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: ONE_DAY_MS,
    path: '/',
  };
}

module.exports = { getCookieOptions };
