'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signupSchema, SignupFormData } from '@/lib/validators';
import { signup } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function SignupForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setGlobalError(null);
    try {
      const response = await signup(data);
      if (response.success) {
        // Redirect to login with success parameterized message or just bare redirect
        router.push('/login?registered=true');
      } else {
        setGlobalError(response.message || 'Signup failed.');
      }
    } catch (error: any) {
      setGlobalError(error.message || 'An unexpected error occurred.');
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
        label="Full Name"
        type="text"
        placeholder="John Doe"
        {...register('name')}
        error={errors.name?.message}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <Select
        label="Account Role"
        options={[
          { label: 'Student', value: 'student' },
          { label: 'Instructor', value: 'instructor' },
        ]}
        {...register('role')}
        error={errors.role?.message}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...register('password')}
        error={errors.password?.message}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
}
