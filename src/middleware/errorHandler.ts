import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Operational errors — known, expected errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      statusCode: err.statusCode,
    });
    return;
  }

  // Zod validation errors (in case they bubble up without the validate middleware)
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'One or more fields failed validation',
        details,
      },
      statusCode: 422,
    });
    return;
  }

  // Handle Prisma known errors
  if (
    err !== null &&
    typeof err === 'object' &&
    'code' in err
  ) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };

    if (prismaErr.code === 'P2002') {
      // Unique constraint violation
      const field = prismaErr.meta?.target?.[0] ?? 'field';
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `A record with this ${field} already exists`,
        },
        statusCode: 409,
      });
      return;
    }

    if (prismaErr.code === 'P2025') {
      // Record not found
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
        },
        statusCode: 404,
      });
      return;
    }
  }

  // SyntaxError from JSON parse failures
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON in request body',
      },
      statusCode: 400,
    });
    return;
  }

  // Unexpected / programming errors — log full error in dev
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(env.NODE_ENV === 'development' && {
        details: [(err as Error)?.message ?? String(err)],
      }),
    },
    statusCode: 500,
  });
}
