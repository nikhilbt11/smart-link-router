const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected');
  });

  try {
    await mongoose.connect(env.mongodbUri);
    console.log(`[MongoDB] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('[MongoDB] initial connection failed:', err.message);
    throw err;
  }
}

module.exports = connectDB;
