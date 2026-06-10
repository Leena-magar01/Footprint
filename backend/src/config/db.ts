import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log('Connecting to MongoDB via URI...');
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully.');
    } else {
      console.log('No MONGODB_URI specified. Starting MongoMemoryServer (In-Memory Fallback)...');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to In-Memory MongoDB at:', uri);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log('In-Memory MongoDB stopped.');
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};
