'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface StudentDashboardData {
  enrolledCoursesCount: number;
  pendingAssignmentsCount: number;
  submittedAssignmentsCount: number;
  gradedAssignmentsCount: number;
  recentAnnouncements: { _id: string; title: string; courseTitle: string; createdAt: string }[];
  recentGrades: { _id: string; assignmentTitle: string; courseTitle: string; marks: number; totalMarks: number; gradedAt: string }[];
}

export default function StudentDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'student' || user?.status !== 'active') router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'student' && user?.status === 'active') {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; message?: string; data?: StudentDashboardData }>('/student/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load dashboard data');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'student') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">
              Welcome back, {user.email}
            </h1>
            <p className="text-slate-500 mt-2">Here is your current progress and recent updates.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
             <Link href="/student/courses" className="flex-1 sm:flex-none">
               <Button variant="secondary" className="w-full shadow-sm text-sm px-6 py-2.5">My Courses</Button>
             </Link>
             <Link href="/student/grades" className="flex-1 sm:flex-none">
               <Button variant="primary" className="w-full shadow-sm text-sm px-6 py-2.5">View Grades</Button>
             </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-16 text-slate-500 bg-surface-container-lowest rounded-[2rem] ring-1 ring-outline-variant/15 shadow-ambient">
            Loading dashboard data...
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-surface-container-lowest ring-1 ring-error/30 rounded-[2rem] font-medium text-error shadow-ambient">
            {error}
          </div>
        ) : data && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">Enrolled Courses</span>
                <div className="mt-3 text-4xl font-black tracking-tighter text-on-surface relative z-10">{data.enrolledCoursesCount}</div>
              </div>
              <div className="bg-amber-50/40 rounded-[2rem] shadow-ambient ring-1 ring-amber-200/50 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-24 h-24 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest relative z-10">Pending Tasks</span>
                <div className="mt-3 text-4xl font-black tracking-tighter text-amber-700 relative z-10">{data.pendingAssignmentsCount}</div>
              </div>
              <div className="bg-primary/5 rounded-[2rem] shadow-ambient ring-1 ring-primary/10 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest relative z-10">Submitted</span>
                <div className="mt-3 text-4xl font-black tracking-tighter text-primary relative z-10">{data.submittedAssignmentsCount}</div>
              </div>
              <div className="bg-emerald-50/50 rounded-[2rem] shadow-ambient ring-1 ring-emerald-600/20 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest relative z-10">Graded</span>
                <div className="mt-3 text-4xl font-black tracking-tighter text-emerald-700 relative z-10">{data.gradedAssignmentsCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Announcements */}
              <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden col-span-1 flex flex-col h-full">
                <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center">
                  <h3 className="text-lg font-bold text-on-surface">Recent Announcements</h3>
                </div>
                {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/10 flex-1">
                    {data.recentAnnouncements.map((a) => (
                      <li key={a._id} className="p-6 hover:bg-surface-container-low/50 transition-colors">
                        <div className="font-bold text-on-surface text-base mb-1">{a.title}</div>
                        <div className="text-xs text-primary font-bold tracking-wide uppercase">{a.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-12 text-center text-sm text-slate-500 font-medium italic flex-1 flex items-center justify-center">No recent announcements</div>
                )}
              </div>

              {/* Recent Grades */}
              <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden col-span-1 flex flex-col h-full">
                <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center">
                  <h3 className="text-lg font-bold text-on-surface">Recent Grades</h3>
                </div>
                {data.recentGrades && data.recentGrades.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/10 flex-1">
                    {data.recentGrades.map((g) => (
                      <li key={g._id} className="p-6 hover:bg-surface-container-low/50 transition-colors flex justify-between items-center">
                        <div>
                          <div className="font-bold text-on-surface text-base mb-1">{g.assignmentTitle}</div>
                          <div className="text-xs text-slate-500 font-medium">{g.courseTitle}</div>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl ring-1 ring-inset ring-emerald-600/20 shadow-sm">
                          <span className="text-base font-black text-emerald-700 tracking-tight">{g.marks}</span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">/{g.totalMarks}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-12 text-center text-sm text-slate-500 font-medium italic flex-1 flex items-center justify-center">No recent grades</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
