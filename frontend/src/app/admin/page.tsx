'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface AdminDashboardData {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  pendingUsers: number;
  recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string }[];
  recentCourses: { _id: string; title: string; code: string; createdAt: string }[];
  recentEnrollments: { _id: string; student: { name: string; email: string }; course: { title: string; code: string }; createdAt: string }[];
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'admin') router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>('/admin/dashboard');
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

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-2">Platform overview and recent system activity.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/admin/users">
               <Button variant="secondary" className="shadow-sm">Manage Users</Button>
             </Link>
             <Link href="/admin/courses">
               <Button variant="primary" className="shadow-sm">Manage Courses</Button>
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
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.totalStudents}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructors</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.totalInstructors}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Courses</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{data.totalCourses}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollments</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-indigo-600">{data.totalEnrollments}</div>
              </div>
              <div className="bg-amber-50 rounded-xl shadow-sm ring-1 ring-amber-200/80 p-5">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Users</span>
                <div className="mt-2 text-3xl font-bold tracking-tight text-amber-600">{data.pendingUsers}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Users */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Users</h3>
                </div>
                {data.recentUsers && data.recentUsers.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentUsers.map((u) => (
                      <li key={u._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{u.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${u.role === 'instructor' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No users found</div>
                )}
              </div>

              {/* Recent Courses */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Courses</h3>
                </div>
                {data.recentCourses && data.recentCourses.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentCourses.map((c) => (
                      <li key={c._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="font-semibold text-slate-900 text-sm">{c.code}</div>
                        <div className="text-sm text-slate-600 truncate mt-0.5" title={c.title}>{c.title}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No courses found</div>
                )}
              </div>

              {/* Recent Enrollments */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-1">
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Enrollments</h3>
                </div>
                {data.recentEnrollments && data.recentEnrollments.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentEnrollments.map((e) => (
                      <li key={e._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                        <div className="text-sm font-semibold text-slate-900">{e.student?.name || 'Unknown Student'}</div>
                        <div className="text-xs text-indigo-600 font-medium mt-0.5">Enrolled in {e.course?.code || 'Unknown Course'}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No enrollments found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
