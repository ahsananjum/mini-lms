'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-4 sm:p-8 bg-slate-50 relative">
      <div className="w-full max-w-3xl relative z-10">
        <div className="mb-6">
          <Link href="/admin/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            &larr; Back to Courses
          </Link>
        </div>
        
        {course ? (
            <PageHeader 
              title={`Manage Instructor - ${course.code}`} 
              description={course.title} 
            />
        ) : (
            <PageHeader 
              title="Manage Instructor" 
              description="Assign or remove an instructor for this course." 
            />
        )}
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
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
