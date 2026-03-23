'use client';

import { Clock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/lib/constants';

export default function PendingApprovalPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.PUBLIC.LOGIN);
      } else if (user?.status !== 'pending') {
        if (user?.role === 'student') router.push(ROUTES.PROTECTED.STUDENT);
        else if (user?.role === 'instructor') router.push(ROUTES.PROTECTED.INSTRUCTOR);
        else if (user?.role === 'admin') router.push(ROUTES.PROTECTED.ADMIN);
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !user || user.status !== 'pending') {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 bg-surface">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-surface">
      <div className="w-full max-w-xl bg-surface-container-lowest p-10 sm:p-16 rounded-[2.5rem] shadow-ambient ring-1 ring-outline-variant/15 text-center relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-amber-500"></div>

        <div className="mb-10 flex justify-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center shadow-inner ring-1 ring-amber-500/10">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3">Approval Needed</h1>
          <p className="text-base text-slate-500 max-w-md mx-auto leading-relaxed">
            Your account request is currently in the queue. Our administrative team will review your registration shortly.
          </p>
        </div>
        
        <div className="mt-8 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 inline-flex flex-col items-center">
            <Clock className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-on-surface text-lg">Status: Pending</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-[280px]">
              Registered as <span className="font-semibold text-primary capitalize">{user.role}</span> with <span className="font-semibold text-slate-700">{user.email}</span>
            </p>
        </div>
        
        <p className="text-slate-400 text-sm mt-12 border-t border-outline-variant/15 pt-8 font-medium">
          You will receive an email notification once your access is granted.
        </p>
      </div>
    </div>
  );
}
