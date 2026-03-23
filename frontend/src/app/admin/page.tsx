'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap, Clock, AlertCircle } from 'lucide-react';

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
      const res = await apiFetch<any>('/admin/dashboard'); // eslint-disable-line @typescript-eslint/no-explicit-any
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
    return <div className="min-h-screen flex items-center justify-center text-slate-500 bg-surface">Loading workspace...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">Admin Control</h1>
            <p className="text-xl text-indigo-200/80 font-medium">Platform overview and user logistics.</p>
          </div>
          <div className="flex gap-4">
             <Link href="/admin/users">
               <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm backdrop-blur-sm">
                 Manage Users
               </button>
             </Link>
             <Link href="/admin/courses">
               <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary hover:bg-primary-container text-white transition-all shadow-sm">
                 Manage Courses
               </button>
             </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {loading ? (
          <div className="text-center p-16 text-slate-500 bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/15 shadow-ambient">
            Loading system data...
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-surface-container-lowest ring-1 ring-error/30 rounded-3xl font-medium text-error shadow-ambient flex items-center justify-center gap-3">
            <AlertCircle className="w-6 h-6" />
            {error}
          </div>
        ) : data && (
          <div className="space-y-8">
            {/* Quick Stats Grid - Lifted to overlap the header */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
              <div className="bg-surface-container-lowest rounded-3xl shadow-ambient ring-1 ring-outline-variant/15 p-6 relative overflow-hidden group">
                <Users className="absolute top-6 right-6 w-8 h-8 text-slate-200 group-hover:text-primary transition-colors duration-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Students</span>
                <div className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface relative z-10">{data.totalStudents}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-3xl shadow-ambient ring-1 ring-outline-variant/15 p-6 relative overflow-hidden group">
                <GraduationCap className="absolute top-6 right-6 w-8 h-8 text-slate-200 group-hover:text-primary transition-colors duration-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Instructors</span>
                <div className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface relative z-10">{data.totalInstructors}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-3xl shadow-ambient ring-1 ring-outline-variant/15 p-6 relative overflow-hidden group">
                <BookOpen className="absolute top-6 right-6 w-8 h-8 text-slate-200 group-hover:text-primary transition-colors duration-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Courses</span>
                <div className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface relative z-10">{data.totalCourses}</div>
              </div>
              <div className="bg-surface-container-lowest rounded-3xl shadow-ambient ring-1 ring-outline-variant/15 p-6 relative overflow-hidden group">
                <Clock className="absolute top-6 right-6 w-8 h-8 text-slate-200 group-hover:text-primary transition-colors duration-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Enrollments</span>
                <div className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-primary relative z-10">{data.totalEnrollments}</div>
              </div>
              
              {/* High Alert Stat if pending users > 0 */}
              <div className={`rounded-3xl shadow-ambient ring-1 p-6 relative overflow-hidden ${data.pendingUsers > 0 ? 'bg-amber-400 ring-amber-500' : 'bg-surface-container-lowest ring-outline-variant/15'}`}>
                <div className="absolute top-[-20%] right-[-10%] w-[100px] h-[100px] bg-white/20 rounded-full blur-[20px] pointer-events-none"></div>
                <span className={`text-xs font-bold uppercase tracking-widest relative z-10 ${data.pendingUsers > 0 ? 'text-amber-900' : 'text-slate-500'}`}>Approvals</span>
                <div className={`mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight relative z-10 ${data.pendingUsers > 0 ? 'text-amber-950' : 'text-slate-400'}`}>
                  {data.pendingUsers}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed: Recent Users & Registration Requests */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden">
                  <div className="px-8 py-8 border-b border-outline-variant/10 bg-surface-container-low/30">
                    <h3 className="text-xl font-bold text-on-surface tracking-tight">Recent Registrations</h3>
                    <p className="text-sm text-slate-500 mt-1">Users that have recently joined the platform.</p>
                  </div>
                  {data.recentUsers && data.recentUsers.length > 0 ? (
                    <ul className="divide-y divide-slate-100/60">
                      {data.recentUsers.map((u) => (
                        <li key={u._id} className="p-6 sm:px-8 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-sm text-slate-500 mt-0.5">{u.email}</div>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              u.role === 'instructor' ? 'bg-amber-100/80 text-amber-800 ring-1 ring-inset ring-amber-500/20' : 
                              u.role === 'admin' ? 'bg-rose-100/80 text-rose-800 ring-1 ring-inset ring-rose-500/20' :
                              'bg-slate-100/80 text-slate-600 ring-1 ring-inset ring-slate-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-12 text-center text-sm font-medium text-slate-500">No recent users found.</div>
                  )}
                </div>
              </div>

              {/* Sidebar: Activity Log */}
              <div className="lg:col-span-1 space-y-8">
                {/* Recent Courses */}
                <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden">
                  <div className="px-6 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
                    <h3 className="font-bold text-on-surface tracking-tight">Recent Courses</h3>
                  </div>
                  {data.recentCourses && data.recentCourses.length > 0 ? (
                    <ul className="divide-y divide-slate-100/60 p-2">
                      {data.recentCourses.map((c) => (
                        <li key={c._id} className="p-4 hover:bg-slate-50/80 rounded-2xl transition-all cursor-default">
                          <div className="font-bold text-slate-900 text-sm tracking-tight">{c.code}</div>
                          <div className="text-sm text-slate-600 truncate mt-1 leading-relaxed" title={c.title}>{c.title}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-sm font-medium text-slate-500">No recent courses.</div>
                  )}
                </div>

                {/* Recent Enrollments */}
                <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden">
                  <div className="px-6 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
                    <h3 className="font-bold text-on-surface tracking-tight">Activity Log</h3>
                  </div>
                  {data.recentEnrollments && data.recentEnrollments.length > 0 ? (
                    <ul className="divide-y divide-slate-100/60 p-2">
                      {data.recentEnrollments.map((e) => (
                        <li key={e._id} className="p-4 hover:bg-slate-50/80 rounded-2xl transition-all cursor-default">
                          <div className="text-sm font-bold text-slate-900">{e.student?.name || 'Unknown Student'}</div>
                          <div className="text-xs text-primary font-semibold mt-1 bg-primary/5 inline-block px-2 py-0.5 rounded-md">
                            Joined {e.course?.code || 'Unknown Course'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-sm font-medium text-slate-500">No recent enrollments.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
