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
      const res = await apiFetch<any>('/student/grades');
      if (res.success && res.data) {
        setCourses(res.data.courses || res.data);
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
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Grades
        </h1>

        {loading ? (
          <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
            Loading courses...
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white border border-rose-200 rounded-2xl font-medium text-rose-500 shadow-sm">
            {error}
          </div>
        ) : courses.length === 0 ? (
           <div className="text-center p-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500 max-w-sm">You do not have any enrolled courses to view grades for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 font-mono border border-indigo-100">
                      {course.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                  <div className="mt-auto pt-6">
                    <Link href={`/student/grades/${course._id}`} className="block w-full">
                      <Button variant="primary" className="w-full justify-center">
                        View Grades &rarr;
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
