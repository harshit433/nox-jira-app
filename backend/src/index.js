import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import issuesRoutes from './routes/issues.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Nox Jira API running at http://localhost:${PORT}`);
});
