import mongoose from 'mongoose';
import { logger } from '../lib/logger.js';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const err = new Error('MONGODB_URI environment variable is required');
    logger.error('MongoDB connection failed', { error: err.message });
    throw err;
  }

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed', { error: err.message });
    throw err;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('MongoDB disconnect error', { error: err.message });
  }
}
