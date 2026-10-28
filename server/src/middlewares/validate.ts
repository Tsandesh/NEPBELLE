import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';

interface Schemas { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }

export const validate = (schemas: Schemas): RequestHandler => (req, _res, next) => {
  for (const part of ['params', 'query', 'body'] as const) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(new AppError(422, 'VALIDATION_ERROR', 'Validation failed', result.error.flatten().fieldErrors));
    }
    (req as any)[part] = result.data; // Express 4: assign coerced values back
  }
  next();
};
