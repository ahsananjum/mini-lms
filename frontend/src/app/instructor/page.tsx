'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface InstructorDashboardData {
  assignedCoursesCount: number;
  totalModulesCount: number;
  totalMaterialsCount: number;
  totalAssignmentsCount: number;
  ungradedSubmissionsCount: number;
  recentMaterials: { _id: string; title: string; courseTitle: string; createdAt: string }[];
  recentAnnouncements: { _id: string; title: string; courseTitle: string; createdAt: string }[];
  recentAssignments: { _id: string; title: string; courseTitle: string; createdAt: string }[];
}

interface OverviewData {
  summary: {
    gradedAssignmentsCount: number;
    pendingGradingCount: number;
  };
}

export default function InstructorDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'instructor' || user?.status !== 'active') router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'instructor' && user?.status === 'active') {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, overviewRes] = await Promise.all([
         apiFetch<{ success: boolean; message?: string; data?: InstructorDashboardData }>('/instructor/dashboard'),
         apiFetch<{ success: boolean; message?: string; data?: OverviewData }>('/instructor/submissions/overview').catch(() => ({ success: false, data: null }))
      ]);
      
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load dashboard data');
      }

      if (overviewRes && overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'instructor') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Instructor Dashboard</h1>
            <p className="text-slate-500 mt-2">Overview of your courses, materials, and pending grading.</p>
          </div>
          <div>
             <Link href="/instructor/courses">
               <Button variant="primary" className="shadow-sm">View My Courses</Button>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Assigned Courses</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.assignedCoursesCount}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Total Modules</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.totalModulesCount}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Materials</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.totalMaterialsCount}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Assignments</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.totalAssignmentsCount}</div>
              </div>
              <div className="bg-amber-50/40 rounded-[1.5rem] shadow-ambient ring-1 ring-amber-200/50 p-6">
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest">Ungraded</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-amber-600">{data.ungradedSubmissionsCount}</div>
              </div>
            </div>

            {/* Grading Card Section */}
            {overview && (
              <div className="bg-primary/5 rounded-[2rem] shadow-ambient ring-1 ring-primary/20 p-8 flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-on-surface">Submissions & Grading</h2>
                  <p className="text-slate-500 mt-1">
                    You have <strong className="text-primary">{overview.summary.pendingGradingCount}</strong> pending items across {overview.summary.gradedAssignmentsCount} graded assignments.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Link href="/instructor/submissions">
                    <Button variant="primary" className="shadow-sm">Open Grading</Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Materials */}
              <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden col-span-1">
                <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
                  <h3 className="font-semibold text-on-surface tracking-wide">Recent Materials</h3>
                </div>
                {data.recentMaterials && data.recentMaterials.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/10">
                    {data.recentMaterials.map((m) => (
                      <li key={m._id} className="p-6 hover:bg-surface-container-low/50 transition-colors">
                        <div className="font-semibold text-on-surface text-sm">{m.title}</div>
                        <div className="text-xs text-primary font-medium mt-0.5">{m.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-10 text-center text-sm text-slate-400">No materials yet</div>
                )}
              </div>

              {/* Recent Announcements */}
              <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden col-span-1">
                <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
                  <h3 className="font-semibold text-on-surface tracking-wide">Recent Announcements</h3>
                </div>
                {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/10">
                    {data.recentAnnouncements.map((a) => (
                      <li key={a._id} className="p-6 hover:bg-surface-container-low/50 transition-colors">
                        <div className="font-semibold text-on-surface text-sm">{a.title}</div>
                        <div className="text-xs text-primary font-medium mt-0.5">{a.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-10 text-center text-sm text-slate-400">No announcements found</div>
                )}
              </div>

              {/* Recent Assignments */}
              <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden col-span-1">
                <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
                  <h3 className="font-semibold text-on-surface tracking-wide">Recent Assignments</h3>
                </div>
                {data.recentAssignments && data.recentAssignments.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/10">
                    {data.recentAssignments.map((a) => (
                      <li key={a._id} className="p-6 hover:bg-surface-container-low/50 transition-colors">
                        <div className="font-semibold text-on-surface text-sm">{a.title}</div>
                        <div className="text-xs text-primary font-medium mt-0.5">{a.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-10 text-center text-sm text-slate-400">No assignments found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
