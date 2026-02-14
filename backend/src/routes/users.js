import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUsers } from '../storage/storage.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const users = await getUsers();
    const publicUsers = users.map(({ passwordHash, ...u }) => ({
      id: u.id,
      email: u.email,
      name: u.name,
    }));
    res.json(publicUsers);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
