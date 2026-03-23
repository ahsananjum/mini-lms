import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-container rounded-2xl shadow-sm mb-6 ring-1 ring-primary/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">Welcome back</h1>
            <p className="text-base text-slate-500 font-medium tracking-wide">Enter your details to access your workspace.</p>
          </div>
          
          <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-3xl shadow-ambient ring-1 ring-outline-variant/20">
            <Suspense fallback={<div className="text-center text-sm text-slate-500 py-8">Loading form...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-10 text-center text-sm text-slate-600 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-container font-bold tracking-wide transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
              Sign up today
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 border-l border-white/10">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-primary-container/40 mix-blend-overlay z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-50"></div>

        <div className="relative z-10 flex flex-col items-start justify-center p-24 h-full w-full max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest bg-white/10 text-white/90 ring-1 ring-inset ring-white/20 uppercase">
              Curated Learning
            </span>
          </div>
          <h2 className="text-4xl leading-tight font-extrabold text-white mb-6">
            Empowering the next generation of academic excellence.
          </h2>
          <p className="text-lg text-indigo-100/80 max-w-md leading-relaxed">
            A seamless, structured environment for students and instructors to track progress, submit assignments, and curate knowledge.
          </p>
        </div>
      </div>
    </div>
  );
}
