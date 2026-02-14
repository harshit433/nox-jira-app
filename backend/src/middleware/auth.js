import { getSessions } from '../storage/storage.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const sessions = await getSessions();
  const session = sessions.find((s) => s.token === token);

  if (!session || new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  req.user = session.user;
  req.sessionId = session.id;
  next();
}
