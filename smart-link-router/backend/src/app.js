const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const linkRoutes = require('./routes/link.routes');
const redirectRoutes = require('./routes/redirect.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const blogRoutes = require('./routes/blog.routes');
const adminAuth = require('./middleware/adminAuth');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Only trust X-Forwarded-For when explicitly configured (i.e. behind a real
// reverse proxy). Otherwise req.ip stays the direct socket address, which
// can't be spoofed by request headers.
if (env.trustProxy) {
  app.set('trust proxy', true);
}

// A single known frontend origin + credentials:true so the admin auth cookie
// can be sent cross-port in local dev (Access-Control-Allow-Origin: * is not
// allowed together with credentials).
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 1. PLACE THIS MIDDLEWARE BEFORE ALL ROUTES
app.use(async (req, res, next) => {
  try {
    const connectDB = require("./config/db");
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Middleware Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/links", adminAuth, linkRoutes);
app.use("/api/analytics", adminAuth, analyticsRoutes);
// Not wrapped in adminAuth here — blog.routes.js protects admin endpoints
// individually so its public /published and /slug/:slug routes stay open.
app.use('/api/blogs', blogRoutes);
// Public smart-link redirect endpoint — intentionally outside /api.
app.use('/l', redirectRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
