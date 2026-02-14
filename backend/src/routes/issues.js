import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Issue } from '../models/Issue.js';
import { logger } from '../lib/logger.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { ISSUE_STATUSES } from '../config/constants.js';

const router = Router();
router.use(requireAuth);

async function generateUniqueId() {
  const prefix = 'NOX';
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const uniqueId = `${prefix}-${num}`;
    const existing = await Issue.findOne({ uniqueId });
    if (!existing) return uniqueId;
    attempts++;
  }

  return `${prefix}-${Date.now().toString(36).slice(-4)}`;
}

router.get('/', async (req, res, next) => {
  try {
    const issues = await Issue.find().sort({ updatedAt: -1 }).lean();
    const formatted = issues.map((i) => ({
      ...i,
      id: i._id.toString(),
      createdAt: i.createdAt?.toISOString?.(),
      updatedAt: i.updatedAt?.toISOString?.(),
      comments: (i.comments || []).map((c) => ({
        ...c,
        id: c._id?.toString?.(),
        timestamp: c.timestamp?.toISOString?.(),
      })),
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new NotFoundError('Issue');
    }

    const issue = await Issue.findById(req.params.id).lean();

    if (!issue) {
      throw new NotFoundError('Issue');
    }

    const formatted = {
      ...issue,
      id: issue._id.toString(),
      createdAt: issue.createdAt?.toISOString?.(),
      updatedAt: issue.updatedAt?.toISOString?.(),
      comments: (issue.comments || []).map((c) => ({
        ...c,
        id: c._id?.toString?.(),
        timestamp: c.timestamp?.toISOString?.(),
      })),
    };

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, assignee, status } = req.body;

    if (!title || !title.trim()) {
      throw new ValidationError('Title is required');
    }

    const uniqueId = await generateUniqueId();

    const issue = await Issue.create({
      uniqueId,
      title: title.trim(),
      description: (description || '').trim(),
      assignee: assignee || null,
      owner: req.user.email,
      status: ISSUE_STATUSES.includes(status) ? status : 'todo',
      comments: [],
    });

    logger.info('Issue created', {
      issueId: issue._id.toString(),
      uniqueId: issue.uniqueId,
      owner: req.user.email,
    });

    const doc = issue.toJSON();
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, assignee, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new NotFoundError('Issue');
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      throw new NotFoundError('Issue');
    }

    if (title !== undefined) issue.title = title.trim();
    if (description !== undefined) issue.description = description.trim();
    if (assignee !== undefined) issue.assignee = assignee || null;
    if (status !== undefined && ISSUE_STATUSES.includes(status)) {
      issue.status = status;
    }

    await issue.save();

    logger.info('Issue updated', { issueId: issue._id.toString(), uniqueId: issue.uniqueId });

    res.json(issue.toJSON());
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new NotFoundError('Issue');
    }

    const result = await Issue.findByIdAndDelete(req.params.id);

    if (!result) {
      throw new NotFoundError('Issue');
    }

    logger.info('Issue deleted', { issueId: req.params.id });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      throw new ValidationError('Comment text is required');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new NotFoundError('Issue');
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      throw new NotFoundError('Issue');
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      text: text.trim(),
      authorEmail: req.user.email,
      timestamp: new Date(),
    };

    issue.comments.push(comment);
    await issue.save();

    logger.info('Comment added', {
      issueId: issue._id.toString(),
      commentId: comment._id.toString(),
    });

    res.status(201).json({
      id: comment._id.toString(),
      text: comment.text,
      authorEmail: comment.authorEmail,
      timestamp: comment.timestamp.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Issue');
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new NotFoundError('Comment');
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      throw new NotFoundError('Issue');
    }

    const commentIndex = issue.comments.findIndex(
      (c) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      throw new NotFoundError('Comment');
    }

    issue.comments.splice(commentIndex, 1);
    await issue.save();

    logger.info('Comment deleted', { issueId: id, commentId });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
