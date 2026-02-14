import { Session } from '../models/Session.js';
import { UnauthorizedError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const session = await Session.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      logger.warn('Auth failed: invalid or expired token');
      throw new UnauthorizedError('Invalid or expired session');
    }

    req.user = session.user;
    req.sessionId = session._id.toString();
    next();
  } catch (err) {
    next(err);
  }
}
