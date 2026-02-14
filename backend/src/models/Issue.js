import mongoose from 'mongoose';
import { Comment } from './Comment.js';

const ISSUE_STATUSES = ['todo', 'in_progress', 'done'];

const issueSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    assignee: {
      type: String,
      default: null,
    },
    owner: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      default: 'todo',
    },
    comments: [Comment],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt?.toISOString?.();
        ret.updatedAt = ret.updatedAt?.toISOString?.();
        ret.comments = (ret.comments || []).map((c) => ({
          id: c._id?.toString?.(),
          text: c.text,
          authorEmail: c.authorEmail,
          timestamp: c.timestamp?.toISOString?.(),
        }));
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

issueSchema.index({ status: 1 });
issueSchema.index({ owner: 1 });
issueSchema.index({ assignee: 1 });

export const Issue = mongoose.model('Issue', issueSchema);
