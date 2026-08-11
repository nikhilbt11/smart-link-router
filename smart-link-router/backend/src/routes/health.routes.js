const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("../config/db");


const router = express.Router();

const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

router.get("/health", async (req, res) => {
  await connectDB();
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db: DB_STATES[mongoose.connection.readyState] || "unknown",
    },
  });
});

module.exports = router;
