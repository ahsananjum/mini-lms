import { PageHeader } from '@/components/ui/PageHeader';
import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 sm:p-8 bg-slate-50 relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">
        <PageHeader title="Log in" description="Please log in to your account." />
        
        <Suspense fallback={<div>Loading form...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
