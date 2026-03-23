import { SignupForm } from '@/components/forms/SignupForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-8 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest p-10 sm:p-14 rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15">
        <div className="mb-8 flex justify-center">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Create account</h1>
          <p className="text-sm text-slate-500">Join to access your courses.</p>
        </div>
        
        <Suspense fallback={<div className="text-center text-sm text-slate-500 py-8">Loading form...</div>}>
          <SignupForm />
        </Suspense>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-container font-semibold transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
