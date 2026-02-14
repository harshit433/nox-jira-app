import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, saveUsers, getSessions, saveSessions } from '../storage/storage.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    const users = await getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: `user-${uuidv4()}`,
      email: email.toLowerCase(),
      passwordHash: password,
      name: name.trim(),
    };

    users.push(newUser);
    await saveUsers(users);
    const sessions = await getSessions();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    sessions.push({
      id: uuidv4(),
      token,
      userId: newUser.id,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      expiresAt: expiresAt.toISOString(),
    });

    await saveSessions(sessions);

    res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessions = await getSessions();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    sessions.push({
      id: uuidv4(),
      token,
      userId: user.id,
      user: { id: user.id, email: user.email, name: user.name },
      expiresAt: expiresAt.toISOString(),
    });

    await saveSessions(sessions);

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Signin failed' });
  }
});

router.post('/signout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    const sessions = await getSessions();
    const filtered = sessions.filter((s) => s.token !== token);
    await saveSessions(filtered);
  }

  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const sessions = await getSessions();
  const session = sessions.find((s) => s.token === token);

  if (!session || new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  res.json({ user: session.user });
});

export default router;
