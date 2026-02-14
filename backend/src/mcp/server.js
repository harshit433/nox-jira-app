import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';
import { logger } from '../lib/logger.js';

async function addCommentHandler(args) {
  if (!args?.issueId || !mongoose.Types.ObjectId.isValid(args.issueId)) {
    return { content: [{ type: 'text', text: 'Error: Invalid issue ID' }], isError: true };
  }
  if (!args?.text?.trim()) {
    return { content: [{ type: 'text', text: 'Error: Comment text is required' }], isError: true };
  }
  const issue = await Issue.findById(args.issueId);
  if (!issue) {
    return { content: [{ type: 'text', text: 'Error: Issue not found' }], isError: true };
  }
  const comment = {
    _id: new mongoose.Types.ObjectId(),
    text: args.text.trim(),
    authorEmail: args.authorEmail,
    timestamp: new Date(),
  };
  issue.comments.push(comment);
  await issue.save();
  logger.info('MCP add_comment', { issueId: args.issueId });
  return { content: [{ type: 'text', text: 'Comment added successfully' }] };
}

async function createIssueHandler(args) {
  if (!args?.title?.trim()) {
    return { content: [{ type: 'text', text: 'Error: Title is required' }], isError: true };
  }
  if (!args?.owner?.trim()) {
    return { content: [{ type: 'text', text: 'Error: Owner email is required' }], isError: true };
  }
  const prefix = 'NOX';
  let uniqueId;
  let attempts = 0;
  while (attempts < 10) {
    const num = Math.floor(1000 + Math.random() * 9000);
    uniqueId = prefix + '-' + num;
    const existing = await Issue.findOne({ uniqueId });
    if (!existing) break;
    attempts++;
  }
  if (!uniqueId) uniqueId = prefix + '-' + Date.now().toString(36).slice(-4);
  const issue = await Issue.create({
    uniqueId,
    title: args.title.trim(),
    description: (args.description || '').trim(),
    assignee: args.assignee || null,
    owner: args.owner.trim(),
    status: args.status || 'todo',
    comments: [],
  });
  logger.info('MCP create_issue', { uniqueId: issue.uniqueId });
  return {
    content: [{ type: 'text', text: 'Issue ' + issue.uniqueId + ' created. ID: ' + issue._id }],
  };
}

function createMcpServer() {
  const server = new McpServer({
    name: 'nox-jira-mcp',
    version: '1.0.0',
  });

  server.registerTool(
    'fetch_issues',
    {
      description: 'Fetch all issues from the Kanban board. Optionally filter by status (todo, in_progress, done).',
      inputSchema: z.object({
        status: z.enum(['todo', 'in_progress', 'done']).optional().describe('Filter by status'),
      }),
    },
    async (args) => {
      try {
        const filter = args?.status ? { status: args.status } : {};
        const issues = await Issue.find(filter).sort({ updatedAt: -1 }).lean();
        const formatted = issues.map((i) => ({
          id: i._id.toString(),
          uniqueId: i.uniqueId,
          title: i.title,
          description: i.description,
          assignee: i.assignee,
          owner: i.owner,
          status: i.status,
          commentsCount: (i.comments || []).length,
          createdAt: i.createdAt?.toISOString?.(),
          updatedAt: i.updatedAt?.toISOString?.(),
        }));
        return {
          content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
        };
      } catch (err) {
        logger.error('MCP fetch_issues error', { error: err.message });
        return { content: [{ type: 'text', text: 'Error: ' + err.message }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_issue',
    {
      description: 'Get a single issue by its ID (MongoDB ObjectId).',
      inputSchema: z.object({
        issueId: z.string().describe('The issue ID (MongoDB ObjectId)'),
      }),
    },
    async (args) => {
      try {
        if (!args?.issueId || !mongoose.Types.ObjectId.isValid(args.issueId)) {
          return { content: [{ type: 'text', text: 'Error: Invalid issue ID' }], isError: true };
        }
        const issue = await Issue.findById(args.issueId).lean();
        if (!issue) {
          return { content: [{ type: 'text', text: 'Error: Issue not found' }], isError: true };
        }
        const formatted = {
          id: issue._id.toString(),
          uniqueId: issue.uniqueId,
          title: issue.title,
          description: issue.description,
          assignee: issue.assignee,
          owner: issue.owner,
          status: issue.status,
          comments: (issue.comments || []).map((c) => ({
            id: c._id?.toString?.(),
            text: c.text,
            authorEmail: c.authorEmail,
            timestamp: c.timestamp?.toISOString?.(),
          })),
          createdAt: issue.createdAt?.toISOString?.(),
          updatedAt: issue.updatedAt?.toISOString?.(),
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
        };
      } catch (err) {
        logger.error('MCP get_issue error', { error: err.message });
        return { content: [{ type: 'text', text: 'Error: ' + err.message }], isError: true };
      }
    }
  );

  server.registerTool(
    'modify_issue',
    {
      description: 'Modify an existing issue. Update title, description, assignee, and/or status.',
      inputSchema: z.object({
        issueId: z.string().describe('The issue ID (MongoDB ObjectId)'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        assignee: z.string().nullable().optional().describe('Assignee email or null to unassign'),
        status: z.enum(['todo', 'in_progress', 'done']).optional().describe('New status'),
      }),
    },
    async (args) => {
      try {
        if (!args?.issueId || !mongoose.Types.ObjectId.isValid(args.issueId)) {
          return { content: [{ type: 'text', text: 'Error: Invalid issue ID' }], isError: true };
        }
        const issue = await Issue.findById(args.issueId);
        if (!issue) {
          return { content: [{ type: 'text', text: 'Error: Issue not found' }], isError: true };
        }
        if (args.title !== undefined) issue.title = args.title.trim();
        if (args.description !== undefined) issue.description = args.description.trim();
        if (args.assignee !== undefined) issue.assignee = args.assignee;
        if (args.status !== undefined) issue.status = args.status;
        await issue.save();
        logger.info('MCP modify_issue', { issueId: args.issueId });
        return {
          content: [{ type: 'text', text: 'Issue ' + issue.uniqueId + ' updated successfully.' }],
        };
      } catch (err) {
        logger.error('MCP modify_issue error', { error: err.message });
        return { content: [{ type: 'text', text: 'Error: ' + err.message }], isError: true };
      }
    }
  );

  server.registerTool(
    'add_comment',
    {
      description: 'Add a comment to an issue. Requires issue ID and comment text.',
      inputSchema: z.object({
        issueId: z.string().describe('The issue ID (MongoDB ObjectId)'),
        text: z.string().describe('The comment text'),
        authorEmail: z.string().describe('Email of the comment author'),
      }),
    },
    async (args) => {
      try {
        return await addCommentHandler(args);
      } catch (err) {
        logger.error('MCP add_comment error', { error: err.message });
        return { content: [{ type: 'text', text: 'Error: ' + err.message }], isError: true };
      }
    }
  );

  server.registerTool(
    'create_issue',
    {
      description: 'Create a new issue. Requires title and owner email.',
      inputSchema: z.object({
        title: z.string().describe('Issue title'),
        description: z.string().optional().describe('Issue description'),
        assignee: z.string().nullable().optional().describe('Assignee email'),
        status: z.enum(['todo', 'in_progress', 'done']).optional().describe('Initial status'),
        owner: z.string().describe('Email of the issue owner (creator)'),
      }),
    },
    async (args) => {
      try {
        return await createIssueHandler(args);
      } catch (err) {
        logger.error('MCP create_issue error', { error: err.message });
        return { content: [{ type: 'text', text: 'Error: ' + err.message }], isError: true };
      }
    }
  );

  return server;
}

export { createMcpServer };
