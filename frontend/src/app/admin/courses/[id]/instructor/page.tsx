'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
  code: string;
  instructor?: User;
}

export default function CourseInstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'admin') router.push(ROUTES.PUBLIC.LOGIN);
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'admin' && id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, instructorsRes] = await Promise.all([
        apiFetch<any>(`/admin/courses/${id}`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/admin/users?role=instructor&status=active`) // eslint-disable-line @typescript-eslint/no-explicit-any
      ]);

      if (!courseRes.success) throw new Error(courseRes.message || 'Failed to fetch course');
      if (!instructorsRes.success) throw new Error(instructorsRes.message || 'Failed to fetch instructors');
      
      const fetchedCourse = courseRes.data?.course;
      setCourse(fetchedCourse);
      setInstructors(instructorsRes.data?.users || []);
      
      if (fetchedCourse?.instructor) {
        setSelectedInstructorId(fetchedCourse.instructor._id);
      } else {
        setSelectedInstructorId('');
      }

    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (instructorId: string | null) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch<any>(`/admin/courses/${id}/instructor`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'PATCH',
        body: JSON.stringify({ instructorId }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update instructor');
      }

      await fetchData(); // Refresh data to show changes
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while updating the instructor');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/courses" className="hover:text-white transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-white">Staffing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {course ? `Staffing: ${course.code}` : 'Manage Instructor'}
          </h1>
          <p className="text-xl text-indigo-200/80 mt-2 font-medium">
            {course ? course.title : 'Assign or remove an instructor for this course.'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-slate-500">Loading data...</div>
          ) : error && !course ? (
            <div className="p-8 text-center text-rose-500 font-medium">{error}</div>
          ) : (
            <div className="p-6 md:p-8 space-y-8">
              
              {error && (
                <div className="p-4 bg-rose-50/80 border border-rose-100 rounded-lg text-sm font-medium text-rose-600">
                  {error}
                </div>
              )}

              {/* Current Status card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Instructor</h3>
                    {course?.instructor ? (
                        <div>
                            <p className="text-lg font-medium text-slate-900">{course.instructor.name}</p>
                            <p className="text-slate-500">{course.instructor.email}</p>
                        </div>
                    ) : (
                        <p className="text-lg font-medium text-slate-900 italic">Unassigned</p>
                    )}
                </div>
                {course?.instructor && (
                   <Button 
                    variant="danger" 
                    onClick={() => handleUpdate(null)} 
                    disabled={submitting}
                    className="!bg-rose-100 hover:!bg-rose-200 !text-rose-700 !border-transparent px-4"
                  >
                     {submitting ? 'Removing...' : 'Remove'}
                   </Button>
                )}
              </div>

              {/* Assignment Form */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Assign New Instructor</h3>
                
                {instructors.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No active instructors available. Go to the Users page to create and activate some.</p>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full flex-grow">
                            <label htmlFor="instructor" className="sr-only">Select Instructor</label>
                            <select 
                                id="instructor"
                                className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 sm:text-sm transition-colors"
                                value={selectedInstructorId}
                                onChange={(e) => setSelectedInstructorId(e.target.value)}
                            >
                                <option value="" disabled>-- Select an instructor --</option>
                                {instructors.map(inst => (
                                    <option key={inst._id} value={inst._id}>
                                        {inst.name} ({inst.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button 
                            variant="primary" 
                            disabled={submitting || !selectedInstructorId || selectedInstructorId === course?.instructor?._id}
                            onClick={() => handleUpdate(selectedInstructorId)}
                            className="w-full sm:w-auto px-8"
                        >
                            Assign
                        </Button>
                    </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
