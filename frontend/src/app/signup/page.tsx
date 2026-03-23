import { PageHeader } from '@/components/ui/PageHeader';
import { SignupForm } from '@/components/forms/SignupForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-slate-50 relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50/20 to-slate-50 pointer-events-none" />
      
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 relative z-10">
        <div className="mb-2 flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 mb-6">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
        </div>
        <div className="text-center">
          <PageHeader title="Create account" description="Join to access your courses." />
        </div>
        
        <Suspense fallback={<div>Loading form...</div>}>
          <SignupForm />
        </Suspense>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
