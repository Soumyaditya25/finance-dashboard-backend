import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/enums';
import { AppError } from '../utils/AppError';

/**
 * Factory middleware for role-based access control.
 * Usage: router.get('/users', authenticate, authorize(UserRole.ADMIN), handler)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        ),
      );
    }

    next();
  };
}
