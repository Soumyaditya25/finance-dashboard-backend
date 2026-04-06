import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getMe } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

/**
 * POST /api/auth/register
 * Admin-only (enforced at route level). Creates a new user account.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, token } = await registerUser(req.body);
    sendSuccess(res, {
      data: { user, token },
      message: 'Account created successfully',
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Public. Returns JWT token on valid credentials.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, token } = await loginUser(req.body);
    sendSuccess(res, {
      data: { user, token },
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Authenticated. Returns the current user's profile.
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getMe(req.user!.id);
    sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Authenticated. JWT is stateless — client must discard the token.
 * Backend acknowledges the logout with a 200.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, {
    data: null,
    message: 'Logged out successfully. Please discard your token on the client.',
  });
}
