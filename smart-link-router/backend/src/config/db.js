const mongoose = require('mongoose');
const env = require('./env');

// Cache the connection across hot reloads / serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If a connection exists and is ready, reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevents hanging queries if connection isn't ready
    };

    cached.promise = mongoose.connect(env.mongodbUri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] connected: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // Reset promise so next attempt can retry
    console.error('[MongoDB] connection failed:', err.message);
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;