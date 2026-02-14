import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { getIssues, saveIssues } from '../storage/storage.js';
import { ISSUE_STATUSES } from '../config/constants.js';

const router = Router();
router.use(requireAuth);

function generateIssueId() {
  const prefix = 'NOX';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

router.get('/', async (req, res) => {
  try {
    const issues = await getIssues();
    res.json(issues);
  } catch (err) {
    console.error('Get issues error:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const issues = await getIssues();
    const issue = issues.find((i) => i.id === req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (err) {
    console.error('Get issue error:', err);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, assignee, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const issues = await getIssues();
    const uniqueId = generateIssueId();

    const newIssue = {
      id: `issue-${uuidv4()}`,
      uniqueId,
      title: title.trim(),
      description: (description || '').trim(),
      assignee: assignee || null,
      owner: req.user.email,
      status: ISSUE_STATUSES.includes(status) ? status : 'todo',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    issues.push(newIssue);
    await saveIssues(issues);

    res.status(201).json(newIssue);
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, assignee, status } = req.body;
    const issues = await getIssues();
    const index = issues.findIndex((i) => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = issues[index];

    if (title !== undefined) issue.title = title.trim();
    if (description !== undefined) issue.description = description.trim();
    if (assignee !== undefined) issue.assignee = assignee || null;
    if (status !== undefined && ISSUE_STATUSES.includes(status)) {
      issue.status = status;
    }

    issue.updatedAt = new Date().toISOString();
    await saveIssues(issues);

    res.json(issue);
  } catch (err) {
    console.error('Update issue error:', err);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const issues = await getIssues();
    const filtered = issues.filter((i) => i.id !== req.params.id);

    if (filtered.length === issues.length) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    await saveIssues(filtered);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete issue error:', err);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const issues = await getIssues();
    const index = issues.findIndex((i) => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const comment = {
      id: `comment-${uuidv4()}`,
      text: text.trim(),
      authorEmail: req.user.email,
      timestamp: new Date().toISOString(),
    };

    issues[index].comments.push(comment);
    issues[index].updatedAt = new Date().toISOString();
    await saveIssues(issues);

    res.status(201).json(comment);
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const issues = await getIssues();
    const index = issues.findIndex((i) => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const commentIndex = issues[index].comments.findIndex(
      (c) => c.id === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    issues[index].comments.splice(commentIndex, 1);
    issues[index].updatedAt = new Date().toISOString();
    await saveIssues(issues);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
