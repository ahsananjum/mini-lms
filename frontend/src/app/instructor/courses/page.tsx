'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHeader } from '@/components/ui/PageHeader';
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
      const response: any = await apiFetch('/instructor/courses');
      if (response.success) {
        setCourses(response.data?.courses || []);
      } else {
        setError(response.message || 'Failed to fetch your courses');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your courses');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'instructor' || user.status !== 'active') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] p-4 sm:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full">
        <PageHeader 
          title="My Courses" 
          description="Manage content and announcements for the courses you are teaching." 
        />
        
        {loading ? (
           <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">Loading courses...</div>
        ) : error ? (
           <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">{error}</div>
        ) : courses.length === 0 ? (
           <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">
               <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
               </div>
               <h3 className="text-lg font-semibold text-slate-900 mb-2">No courses assigned yet.</h3>
               <p className="text-slate-500 mb-6">You will see your courses here once an administrator assigns them to you.</p>
           </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                   <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 font-mono">
                           {course.code}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-6">{course.description}</p>
                   </div>
                   <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 mt-auto">
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
