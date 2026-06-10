import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { connectDB } from './config/db';
import { seedChallenges } from './config/seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database (MongoDB Atlas or MongoMemoryServer fallback)
    await connectDB();

    // Seed challenges if database is empty
    await seedChallenges();

    // Start listening
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` EcoPilot AI Express server started successfully!`);
      console.log(` Running on port: ${PORT}`);
      console.log(` Health check URL: http://localhost:${PORT}/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start EcoPilot AI backend server:', error);
    process.exit(1);
  }
};

startServer();
