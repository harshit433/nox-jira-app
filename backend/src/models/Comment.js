import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.timestamp = ret.timestamp?.toISOString?.() || ret.timestamp;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Comment = commentSchema;
