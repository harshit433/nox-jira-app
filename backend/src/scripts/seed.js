import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../db/connection.js';
import { User } from '../models/User.js';
import { logger } from '../lib/logger.js';
import { HARDCODED_USERS } from '../config/constants.js';

async function seed() {
  try {
    await connectDatabase();

    for (const u of HARDCODED_USERS) {
      const existing = await User.findOne({ email: u.email.toLowerCase() });
      if (existing) {
        logger.info('User already exists', { email: u.email });
        continue;
      }

      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({
        email: u.email.toLowerCase(),
        passwordHash,
        name: u.name,
      });
      logger.info('Created user', { email: u.email });
    }

    logger.info('Seed completed successfully');
  } catch (err) {
    logger.error('Seed failed', { error: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seed();
