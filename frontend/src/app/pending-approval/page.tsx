'use client';

import { PageHeader } from '@/components/ui/PageHeader';
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
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center">
        <PageHeader title="Pending Approval" />
        
        <EmptyState 
          icon={Clock}
          title="Account under review"
          description={`Your account (${user.email}) has been created successfully as a ${user.role} but is waiting for admin approval. You will be notified via email once approved.`}
        />
        
        <p className="text-slate-500 text-sm mt-8 border-t border-slate-100 pt-6">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
