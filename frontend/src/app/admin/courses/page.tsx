'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] p-4 sm:p-8 bg-surface relative">
      <div className="w-full max-w-7xl relative z-10">
        <PageHeader 
          title="Courses Management" 
          description="Manage standard courses, assign instructors, and handle student enrollments." 
        />
        
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col overflow-hidden mt-6">
          <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/30 flex flex-col md:flex-row md:items-end gap-5 justify-between">
            <div className="flex flex-col md:flex-row gap-5 items-end flex-grow">
              <div className="w-full md:w-1/2">
                <label className="block text-xs uppercase tracking-widest font-medium text-slate-500 mb-2">Search Courses</label>
                <Input 
                  type="text" 
                  placeholder="Course title or code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadCourses()}
                />
              </div>
              <Button variant="secondary" onClick={() => loadCourses()} className="md:w-auto w-full px-6 whitespace-nowrap">
                Search
              </Button>
            </div>
            
            <div className="pt-4 md:pt-0">
              <Link href="/admin/courses/new">
                <Button variant="primary" className="whitespace-nowrap px-6 shadow-sm">
                  + Create Course
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant/10">
              <thead className="bg-surface/50">
                <tr>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Code</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Instructor</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Created Date</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/10 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading courses...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-rose-500 font-medium">{error}</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No courses found matching your filters.</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-on-surface font-medium">{course.title}</span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-slate-600 font-medium">{course.code}</td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {course.instructor ? (
                          <div className="flex flex-col">
                            <span className="text-on-surface">{course.instructor.name}</span>
                            <span className="text-slate-400 text-xs">{course.instructor.email}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-slate-500">
                        {new Date(course.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-right space-x-2 flex justify-end">
                        <Link href={`/admin/courses/${course._id}/edit`}>
                          <Button variant="secondary" className="!py-1.5 !px-3 text-xs">Edit</Button>
                        </Link>
                        <Link href={`/admin/courses/${course._id}/instructor`}>
                          <Button variant="secondary" className="!py-1.5 !px-3 text-xs">Instructor</Button>
                        </Link>
                        <Link href={`/admin/courses/${course._id}/students`}>
                          <Button variant="secondary" className="!py-1.5 !px-3 text-xs">Students</Button>
                        </Link>
                        <Button variant="danger" onClick={() => handleDelete(course._id)} className="!py-1.5 !px-3 text-xs !bg-rose-100 hover:!bg-rose-200 !text-rose-700 !border-transparent">Delete</Button>
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
