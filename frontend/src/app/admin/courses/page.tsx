'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface CourseRow {
  _id: string;
  title: string;
  code: string;
  instructor?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminCoursesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'admin') router.push(ROUTES.PUBLIC.LOGIN);
    }
  }, [user, authLoading, isAuthenticated, router]);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      const response = await apiFetch<{ success: boolean; message?: string; data?: { courses: CourseRow[] } }>(`/admin/courses?${params.toString()}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch courses');
      }
      setCourses(response.data?.courses || []);
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) {
      return;
    }
    try {
      const response = await apiFetch<{ success: boolean; message?: string; data?: unknown }>(`/admin/courses/${id}`, { method: 'DELETE' });
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete course');
      }
      await loadCourses(); // Refresh
    } catch (err: unknown) {
      alert((err as Error).message || 'An error occurred while trying to delete the course');
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2 text-indigo-200/80 font-medium">
              <Link href="/admin" className="hover:text-white transition-colors">Admin Control</Link>
              <span>/</span>
              <span className="text-white">Courses</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Curriculum</h1>
            <p className="text-xl text-indigo-200/80 mt-2 font-medium">Manage standard courses and enrollments.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/30 flex flex-col md:flex-row md:items-end gap-5 justify-between">
            <div className="flex flex-col md:flex-row gap-5 items-end flex-grow">
              <div className="w-full md:w-1/2">
                <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Search Curriculum</label>
                <Input 
                  type="text" 
                  placeholder="Course title or reference code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadCourses()}
                />
              </div>
              <Button variant="secondary" onClick={() => loadCourses()} className="md:w-auto w-full px-8 h-[48px]">
                Search
              </Button>
            </div>
            
            <div className="pt-4 md:pt-0">
              <Link href="/admin/courses/new">
                <Button variant="primary" className="whitespace-nowrap px-8 h-[48px] shadow-sm">
                  + Create Course
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="min-w-full">
              <thead className="border-b border-outline-variant/10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Course Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Code</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Instructor</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Created Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">Loading curriculum...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-rose-500 font-medium">{error}</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No courses found matching your search.</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course._id} className="hover:bg-surface-container-low/50 transition-colors group/row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-on-surface font-bold tracking-tight">{course.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-200/50">{course.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course.instructor ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shadow-inner border border-indigo-100">
                              {course.instructor.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-900 font-medium">{course.instructor.name}</span>
                              <span className="text-slate-400 text-xs">{course.instructor.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-500/20">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(course.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Link href={`/admin/courses/${course._id}/edit`}>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Edit</button>
                        </Link>
                        <Link href={`/admin/courses/${course._id}/instructor`}>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">Staffing</button>
                        </Link>
                        <Link href={`/admin/courses/${course._id}/students`}>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Roster</button>
                        </Link>
                        <button onClick={() => handleDelete(course._id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors ml-1">Drop</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
