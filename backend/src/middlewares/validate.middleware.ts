import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      next(ApiError.badRequest('Validation failed', messages));
      return;
    }
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      next(ApiError.badRequest('Invalid query parameters', messages));
      return;
    }
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      next(ApiError.badRequest('Invalid parameters', messages));
      return;
    }
    next();
  };
}
