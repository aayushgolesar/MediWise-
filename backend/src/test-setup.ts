import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';

// Load .env file for tests
dotenv.config();

/**
 * Global test setup for Vitest
 * Connects to MongoDB Atlas for testing (same as production)
 * Cleans up after all tests complete
 */
beforeAll(async () => {
  // Use the configured MONGODB_URI from .env (production Atlas)
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured in .env');
  }
  
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB_NAME || 'mediwise',
  });

  console.log('✅ Test MongoDB connected:', mongoose.connection.host);
});

beforeEach(async () => {
  // Don't clear collections to preserve migrated data for tests
});

afterAll(async () => {
  // Disconnect Mongoose
  await mongoose.disconnect();
  
  console.log('✅ Test MongoDB disconnected');
});