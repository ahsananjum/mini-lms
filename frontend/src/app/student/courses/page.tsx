'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface CourseListDetail {
  _id: string;
  title: string;
  code: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
  };
}

export default function StudentCoursesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseListDetail[]>([]);
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
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ success: boolean; message?: string; data?: { courses?: CourseListDetail[] } | CourseListDetail[] }>('/student/courses');
      if (res.success && res.data) {
        // The API returns { courses: [...] } based on standard backend list shape
        const data = res.data;
        setCourses(('courses' in data ? (data as { courses: CourseListDetail[] }).courses : data as CourseListDetail[]) || []);
      } else {
        throw new Error(res.message || 'Failed to load courses');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'student') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                My Courses
              </h1>
              <p className="text-xl text-indigo-200/80 mt-3 font-medium max-w-3xl leading-relaxed">
                Courses you are currently enrolled in.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

        {loading ? (
           <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading courses...</div>
        ) : error ? (
           <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error}</div>
        ) : courses.length === 0 ? (
           <div className="p-20 text-center bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6 flex flex-col items-center">
            <svg className="w-20 h-20 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-bold text-on-surface mb-3 tracking-tight">No courses yet</h3>
            <p className="text-slate-500 max-w-md mx-auto font-medium">You are not enrolled in any courses at the moment. Please contact your administrator if you believe this is a mistake.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course._id} className="bg-surface-container-lowest flex flex-col h-full ring-1 ring-outline-variant/15 rounded-[2rem] shadow-ambient hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/20 transition-all duration-300 group overflow-hidden">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6 gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      {course.code}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-slate-500 mb-8 flex-1 line-clamp-3 leading-relaxed">
                    {course.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-auto pt-6 border-t border-outline-variant/10">
                    <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-sm shrink-0 ring-1 ring-outline-variant/15">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Instructor</div>
                      <div className="text-sm text-on-surface font-semibold truncate leading-none">
                        {course.instructor?.name}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-5 bg-surface-container-low/50 border-t border-outline-variant/10 mt-auto">
                  <Link href={`/student/courses/${course._id}`} className="block w-full">
                    <Button variant="secondary" className="w-full justify-center bg-surface-container-lowest hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm py-2.5 text-sm font-semibold">
                      Open Course
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
