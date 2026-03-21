import { UserRole, UserStatus } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export {};
