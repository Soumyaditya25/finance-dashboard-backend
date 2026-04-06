import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { UserStatus } from '../types/enums';

/**
 * Middleware: Verify Bearer JWT, load user from DB, check ACTIVE status.
 * Attaches the user object to req.user on success.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided. Use Authorization: Bearer <token>');
    }

    const token = authHeader.slice(7);

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('User account no longer exists');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw AppError.unauthorized('Your account has been deactivated. Contact an administrator.');
    }

    // Attach the user to the request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as import('../types/enums').UserRole,
      status: user.status as import('../types/enums').UserStatus,
    };

    next();
  } catch (err) {
    next(err);
  }
}
