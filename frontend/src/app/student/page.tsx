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
      const res = await apiFetch<any>('/student/dashboard');
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
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.email}
            </h1>
            <p className="text-slate-500 mt-2">Here is your current progress and recent updates.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/student/courses">
               <Button variant="secondary" className="shadow-sm">My Courses</Button>
             </Link>
             <Link href="/student/grades">
               <Button variant="primary" className="shadow-sm">View Grades</Button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Courses</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.enrolledCoursesCount}</div>
              </div>
              <div className="bg-rose-50/50 rounded-xl shadow-sm ring-1 ring-rose-200/80 p-5">
                <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Pending Assignments</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-rose-600">{data.pendingAssignmentsCount}</div>
              </div>
              <div className="bg-indigo-50/50 rounded-xl shadow-sm ring-1 ring-indigo-200/60 p-5">
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Submitted</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-indigo-600">{data.submittedAssignmentsCount}</div>
              </div>
              <div className="bg-emerald-50/50 rounded-xl shadow-sm ring-1 ring-emerald-200/80 p-5">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Graded</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">{data.gradedAssignmentsCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <div className="p-8 text-center text-sm text-slate-400">No recent announcements</div>
                )}
              </div>

              {/* Recent Grades */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Grades</h3>
                </div>
                {data.recentGrades && data.recentGrades.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentGrades.map((g) => (
                      <li key={g._id} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{g.assignmentTitle}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{g.courseTitle}</div>
                        </div>
                        <div className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md ring-1 ring-inset ring-emerald-700/10">
                          <span className="text-sm font-bold text-emerald-700">{g.marks}</span>
                          <span className="text-[10px] font-bold text-emerald-500">/{g.totalMarks}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No recent grades</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
