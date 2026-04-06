import { Response } from 'express';

interface SuccessOptions<T> {
  data: T;
  message?: string;
  meta?: object;
  statusCode?: number;
}

interface ErrorOptions {
  code: string;
  message: string;
  details?: unknown[];
  statusCode: number;
}

/**
 * Send a standardised success response.
 */
export function sendSuccess<T>(res: Response, options: SuccessOptions<T>): void {
  const { data, message, meta, statusCode = 200 } = options;

  const body: Record<string, unknown> = {
    success: true,
    data,
  };

  if (message) body.message = message;
  if (meta) body.meta = meta;

  res.status(statusCode).json(body);
}

/**
 * Send a standardised error response.
 */
export function sendError(res: Response, options: ErrorOptions): void {
  const { code, message, details, statusCode } = options;

  const errorBody: Record<string, unknown> = { code, message };
  if (details && details.length > 0) errorBody.details = details;

  res.status(statusCode).json({
    success: false,
    error: errorBody,
    statusCode,
  });
}
