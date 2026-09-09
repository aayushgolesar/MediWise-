import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas (or the in-memory server during tests).
 * Call this once at server startup before starting the HTTP server.
 */
export async function connectDB(): Promise<void> {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error('FATAL: MONGODB_URI environment variable is not set.');
  }

  if (mongoose.connection.readyState >= 1) {
    // Already connected (e.g. hot-reload or test re-use)
    return;
  }

  await mongoose.connect(mongodbUri, {
    dbName: process.env.MONGODB_DB_NAME ?? 'mediwise',
    serverSelectionTimeoutMS: 10_000,
  });

  console.log('✅ MongoDB connected:', mongoose.connection.host);
}

export default mongoose;
