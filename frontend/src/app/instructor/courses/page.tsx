'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
}

export default function InstructorCoursesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'instructor') router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.status !== 'active') router.push('/pending-approval');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'instructor' && user?.status === 'active') {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ success: boolean; message?: string; data?: { courses: Course[] } }>('/instructor/courses');
      if (response.success) {
        setCourses(response.data?.courses || []);
      } else {
        setError(response.message || 'Failed to fetch your courses');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch your courses');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'instructor' || user.status !== 'active') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
            <Link href="/instructor" className="hover:text-white transition-colors">Instructor</Link>
            <span>/</span>
            <span className="text-white">Assigned Courses</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">My Courses</h1>
          <p className="text-xl text-indigo-200/80 mt-2 font-medium">Manage content and announcements for the courses you are teaching.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        
        {loading ? (
           <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading courses...</div>
        ) : error ? (
           <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error}</div>
        ) : courses.length === 0 ? (
           <div className="p-20 text-center bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">
               <div className="w-16 h-16 mx-auto bg-surface-container-low rounded-[1.25rem] ring-1 ring-outline-variant/10 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-slate-400 strokeWidth-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
               </div>
               <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-3">No courses assigned yet.</h3>
               <p className="text-base text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">You will see your courses here once an administrator assigns them to you.</p>
           </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {courses.map((course) => (
                <div key={course._id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden flex flex-col hover:shadow-lg hover:ring-outline-variant/30 transition-all duration-300">
                   <div className="p-8 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary font-mono ring-1 ring-inset ring-primary/20">
                           {course.code}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-on-surface mb-3 line-clamp-2">{course.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">{course.description}</p>
                   </div>
                   <div className="px-8 py-5 bg-surface-container-low/30 border-t border-outline-variant/10 mt-auto">
                      <Link href={`/instructor/courses/${course._id}`} className="block w-full">
                         <Button variant="primary" className="w-full justify-center">
                            Manage Course
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
