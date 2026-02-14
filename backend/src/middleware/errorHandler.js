import mongoose from 'mongoose';
import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value - resource already exists';
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  logger.error('Request error', {
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
}
