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
      const res = await apiFetch<any>('/student/courses');
      if (res.success && res.data) {
        // The API returns { courses: [...] } based on standard backend list shape
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-slate-500 mt-1">Courses you are currently enrolled in.</p>
          </div>
        </div>

        {loading ? (
           <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 mt-6">Loading courses...</div>
        ) : error ? (
           <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 mt-6">{error}</div>
        ) : courses.length === 0 ? (
           <div className="p-16 text-center bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 mt-6 flex flex-col items-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-500 max-w-sm">You are not enrolled in any courses at the moment. Please contact your administrator if you believe this is a mistake.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white flex flex-col h-full ring-1 ring-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:ring-indigo-300 transition-all group overflow-hidden">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 font-mono tracking-tight shrink-0 ring-1 ring-inset ring-indigo-700/10">
                      {course.code}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">
                    {course.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div className="text-sm text-slate-600 font-medium truncate">
                      {course.instructor?.name}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 mt-auto">
                  <Link href={`/student/courses/${course._id}`} className="block w-full">
                    <Button variant="secondary" className="w-full justify-center bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors">
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
