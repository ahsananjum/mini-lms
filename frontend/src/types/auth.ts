import { UserRole, UserStatus } from './user';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  status: UserStatus;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
  };
}
