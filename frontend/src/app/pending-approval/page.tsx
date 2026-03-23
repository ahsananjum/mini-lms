'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { Clock } from 'lucide-react';
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
    return <div className="p-16 text-center text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 sm:p-8 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest p-10 sm:p-14 rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 text-center">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Approval Needed</h1>
          <p className="text-sm text-slate-500">Your account is being reviewed</p>
        </div>
        
        <div className="mt-12">
          <EmptyState 
            icon={Clock}
            title="Account under review"
            description={`Your account (${user.email}) has been created successfully as a ${user.role} but is waiting for admin approval. You will be notified via email once approved.`}
          />
        </div>
        
        <p className="text-slate-400 text-sm mt-12 border-t border-outline-variant/15 pt-8">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
