import { UserRole, UserStatus } from './enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export {};
