const path = require('path');
const dotenv = require('dotenv');

// Single source of truth for env vars lives at the repo root (.env / .env.example)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Fail fast rather than silently falling back to an insecure default secret.
const required = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  // Set to 'true' only when running behind a trusted reverse proxy that sets X-Forwarded-For.
  trustProxy: process.env.TRUST_PROXY === 'true',
  jwtSecret: process.env.JWT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  cookieName: process.env.COOKIE_NAME || 'admin_token',
};

