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
         apiFetch<any>('/instructor/dashboard'),
         apiFetch<any>('/instructor/submissions/overview').catch(() => ({ success: false })) // fail gracefully if endpoint doesn't exist yet
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
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Instructor Dashboard</h1>
            <p className="text-slate-500 mt-2">Overview of your courses, materials, and pending grading.</p>
          </div>
          <div>
             <Link href="/instructor/courses">
               <Button variant="primary" className="shadow-sm">View My Courses</Button>
             </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
            Loading dashboard data...
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white border border-rose-200 rounded-2xl font-medium text-rose-500 shadow-sm">
            {error}
          </div>
        ) : data && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Courses</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.assignedCoursesCount}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Modules</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.totalModulesCount}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.totalMaterialsCount}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.totalAssignmentsCount}</div>
              </div>
              <div className="bg-amber-50/50 rounded-xl shadow-sm ring-1 ring-amber-200/80 p-5">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Ungraded</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-amber-600">{data.ungradedSubmissionsCount}</div>
              </div>
            </div>

            {/* Grading Card Section */}
            {overview && (
              <div className="bg-indigo-50/50 rounded-2xl shadow-sm ring-1 ring-indigo-200/60 p-8 flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Submissions & Grading</h2>
                  <p className="text-slate-500 mt-1">
                    You have <strong className="text-indigo-600">{overview.summary.pendingGradingCount}</strong> pending items across {overview.summary.gradedAssignmentsCount} graded assignments.
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
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Materials</h3>
                </div>
                {data.recentMaterials && data.recentMaterials.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentMaterials.map((m) => (
                      <li key={m._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="font-semibold text-slate-900 text-sm">{m.title}</div>
                        <div className="text-xs text-indigo-600 font-medium mt-0.5">{m.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No materials yet</div>
                )}
              </div>

              {/* Recent Announcements */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Announcements</h3>
                </div>
                {data.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentAnnouncements.map((a) => (
                      <li key={a._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="font-semibold text-slate-900 text-sm">{a.title}</div>
                        <div className="text-xs text-indigo-600 font-medium mt-0.5">{a.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No announcements found</div>
                )}
              </div>

              {/* Recent Assignments */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Assignments</h3>
                </div>
                {data.recentAssignments && data.recentAssignments.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentAssignments.map((a) => (
                      <li key={a._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="font-semibold text-slate-900 text-sm">{a.title}</div>
                        <div className="text-xs text-indigo-600 font-medium mt-0.5">{a.courseTitle}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No assignments found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
