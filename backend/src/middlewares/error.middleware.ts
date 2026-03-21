import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  console.error('Unhandled error:', err);

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(500).json({
    success: false,
    message,
    errors: [],
  });
}
