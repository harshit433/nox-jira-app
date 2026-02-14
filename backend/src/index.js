import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './db/connection.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { statelessHandler } from 'express-mcp-handler';
import { createMcpServer } from './mcp/server.js';
import authRoutes from './routes/auth.js';
import issuesRoutes from './routes/issues.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/users', usersRoutes);

app.post('/mcp', statelessHandler(createMcpServer, {
  onError: (err) => logger.error('MCP error', { error: err.message }),
}));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      logger.info(`Nox Jira API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
