const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`[Server] listening on port ${env.port} (${env.nodeEnv})`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('[Unhandled Rejection]', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('[Server] failed to start:', err.message);
    process.exit(1);
  }
}

start();
