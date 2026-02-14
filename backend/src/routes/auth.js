import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { logger } from '../lib/logger.js';
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from '../lib/errors.js';

const router = Router();
const SESSION_EXPIRY_DAYS = 7;

function getExpiresAt() {
  return new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new ValidationError('Email, password and name are required');
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
    });

    const token = uuidv4();
    const expiresAt = getExpiresAt();

    await Session.create({
      token,
      userId: user._id,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      expiresAt,
    });

    logger.info('User signed up', { email: user.email, userId: user._id.toString() });

    res.status(201).json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await User.findByEmail(email);

    if (!user) {
      logger.warn('Signin failed: user not found', { email });
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      logger.warn('Signin failed: invalid password', { email });
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = uuidv4();
    const expiresAt = getExpiresAt();

    await Session.create({
      token,
      userId: user._id,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      expiresAt,
    });

    logger.info('User signed in', { email: user.email, userId: user._id.toString() });

    res.json({
      token,
      user: { id: user._id.toString(), email: user.email, name: user.name },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/signout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const result = await Session.deleteOne({ token });
      if (result.deletedCount > 0) {
        logger.info('User signed out', { token: token.slice(0, 8) + '...' });
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Not authenticated');
    }

    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid or expired session');
    }

    res.json({ user: session.user });
  } catch (err) {
    next(err);
  }
});

export default router;
