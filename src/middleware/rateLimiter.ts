import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

/**
 * Rate limiter for authentication endpoints.
 * Max 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please try again after 15 minutes.',
      statusCode: 429,
    });
  },
});
