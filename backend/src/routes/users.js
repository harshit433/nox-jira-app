import { Router } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
      .select('email name')
      .lean();

    const formatted = users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

export default router;
