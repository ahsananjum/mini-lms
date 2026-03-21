import { apiFetch } from './api';
import { AuthState, AuthUser, LoginResponse, SignupResponse } from '@/types/auth';
import { LoginFormData, SignupFormData } from './validators';
import { ROUTES } from './constants';

export async function login(data: LoginFormData): Promise<LoginResponse> {
  return await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    data,
  });
}

export async function signup(data: SignupFormData): Promise<SignupResponse> {
  return await apiFetch<SignupResponse>('/auth/signup', {
    method: 'POST',
    data,
  });
}

export async function logout(): Promise<{ success: boolean; message: string }> {
  return await apiFetch<{ success: boolean; message: string }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe(): Promise<{ success: boolean; data?: { user: AuthUser } }> {
  return await apiFetch<{ success: boolean; data?: { user: AuthUser } }>('/auth/me', {
    method: 'GET',
  });
}

export function getRedirectPath(role: string, status: string): string {
  if (status === 'pending') {
    return ROUTES.PROTECTED.PENDING_APPROVAL;
  }
  
  if (role === 'admin') {
    return ROUTES.PROTECTED.ADMIN;
  }
  
  if (role === 'student') {
    return ROUTES.PROTECTED.STUDENT;
  }
  
  if (role === 'instructor') {
    return ROUTES.PROTECTED.INSTRUCTOR;
  }
  
  return ROUTES.PUBLIC.LOGIN;
}
