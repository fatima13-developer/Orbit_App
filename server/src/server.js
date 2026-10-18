import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import Post from './models/Post.model.js';
import { seedData } from './seed/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demo data if database is currently empty
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      console.log('Database empty. Automatically seeding demo content for instant browsing...');
      await seedData(false);
    }

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Orbit Server is running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Closing HTTP server and database connections...`);
      server.close(async () => {
        await closeDB();
        console.log('Server shut down cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();
