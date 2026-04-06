import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

// Shape of user returned in responses (never includes passwordHash)
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function stripPassword(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  passwordHash: string;
}): SafeUser {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

/**
 * Register a new user account.
 * By design decision: registration is Admin-only in all routes.
 * This service itself can be called from the admin-gated route.
 */
export async function registerUser(data: RegisterInput): Promise<{ user: SafeUser; token: string }> {
  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw AppError.conflict(`An account with email '${data.email}' already exists`);
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role ?? 'VIEWER',
    },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user: stripPassword(user), token };
}

/**
 * Authenticate a user by email + password and return a JWT.
 */
export async function loginUser(data: LoginInput): Promise<{ user: SafeUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  // Use a generic message to avoid user enumeration
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await comparePassword(data.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'ACTIVE') {
    throw AppError.unauthorized('Your account has been deactivated. Contact an administrator.');
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user: stripPassword(user), token };
}

/**
 * Return the current authenticated user profile.
 */
export async function getMe(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound('User');
  }
  return stripPassword(user);
}
