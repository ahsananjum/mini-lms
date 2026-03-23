'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Course {
  _id: string;
  title: string;
  code: string;
}

export default function StudentGradesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
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
      // The backend returns the list of courses with grades for this endpoint now
      const res = await apiFetch<{ success: boolean; message?: string; data?: { courses: Course[] } | Course[] }>('/student/grades');
      if (res.success && res.data) {
        setCourses(('courses' in res.data ? (res.data as { courses: Course[] }).courses : res.data as Course[]) || []);
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
    <div className="min-h-[calc(100vh-80px)] bg-surface pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-8">
          Grades
        </h1>

        {loading ? (
           <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading courses...</div>
        ) : error ? (
           <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error}</div>
        ) : courses.length === 0 ? (
           <div className="p-20 text-center bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6 flex flex-col items-center">
            <svg className="w-16 h-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <h3 className="text-xl font-bold text-on-surface mb-3 tracking-tight">No courses found</h3>
            <p className="text-slate-500 max-w-sm font-medium">You do not have any enrolled courses to view grades for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/20 transition-all duration-300 group">
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      {course.code}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface tracking-tight mb-4 group-hover:text-primary transition-colors">{course.title}</h3>
                  <div className="mt-auto pt-8">
                    <Link href={`/student/grades/${course._id}`} className="block w-full">
                      <Button variant="secondary" className="w-full justify-center bg-surface-container-low hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm py-2.5 text-sm font-semibold">
                        View Grades
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
