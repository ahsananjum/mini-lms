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
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-indigo-200/80 font-medium">
              <span className="text-white">Instructor Workspace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Welcome back, Instructor</h1>
            <p className="text-xl text-indigo-200/80 mt-2 font-medium">Overview of your courses, materials, and pending grading.</p>
          </div>
          <div className="flex gap-4">
             <Link href="/instructor/courses">
               <Button variant="secondary" className="shadow-sm border-transparent bg-white/10 text-white hover:bg-white/20">View My Courses</Button>
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
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
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Courses</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.assignedCoursesCount}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Modules</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.totalModulesCount}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Materials</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.totalMaterialsCount}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assignments</span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-on-surface">{data.totalAssignmentsCount}</div>
              </div>
              <div className="bg-amber-50 rounded-[1.5rem] shadow-ambient ring-1 ring-amber-200/60 p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-amber-500/10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                </div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest relative z-10 flex items-center gap-2">
                    Ungraded
                    {data.ungradedSubmissionsCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                </span>
                <div className="mt-3 text-4xl font-extrabold tracking-tight text-amber-600 relative z-10">{data.ungradedSubmissionsCount}</div>
              </div>
            </div>

            {/* Grading Card Section */}
            {overview && (
              <div className="bg-indigo-900 rounded-[2rem] shadow-ambient ring-1 ring-indigo-950/20 p-8 flex flex-col sm:flex-row justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent mix-blend-overlay z-0 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Submissions & Grading</h2>
                  <p className="text-indigo-200/90 mt-1 font-medium">
                    You have <strong className="text-white text-lg">{overview.summary.pendingGradingCount}</strong> pending items across {overview.summary.gradedAssignmentsCount} graded assignments.
                  </p>
                </div>
                <div className="mt-6 sm:mt-0 relative z-10 w-full sm:w-auto">
                  <Link href="/instructor/submissions">
                    <Button variant="primary" className="shadow-[0_0_20px_rgba(79,70,229,0.3)] bg-white text-indigo-900 hover:bg-indigo-50 w-full sm:w-auto px-8 h-[48px]">Open Grading</Button>
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
