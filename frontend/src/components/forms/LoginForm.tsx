'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginFormData } from '@/lib/validators';
import { login, getRedirectPath } from '@/lib/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      const response = await login(data);
      if (response.success && response.data?.user) {
        await refreshUser(); // Update global auth state
        const path = getRedirectPath(response.data.user.role, response.data.user.status);
        router.push(path);
      } else {
        setGlobalError(response.message || 'Login failed.');
      }
    } catch (error: unknown) {
      setGlobalError((error as Error).message || 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {globalError && (
        <div className="p-3.5 text-sm font-medium text-rose-800 bg-rose-50 border border-rose-200/60 rounded-lg">
          {globalError}
        </div>
      )}

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...register('password')}
        error={errors.password?.message}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
        Log in
      </Button>
    </form>
  );
}
