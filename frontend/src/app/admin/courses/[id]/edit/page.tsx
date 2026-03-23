'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  
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
      loadCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<any>(`/admin/courses/${id}`); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch course');
      }
      
      const course = response.data?.course;
      if (course) {
        setTitle(course.title || '');
        setCode(course.code || '');
        setDescription(course.description || '');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching the course. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !description.trim()) {
      setError('Title, code, and description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch<any>(`/admin/courses/${id}`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'PATCH',
        body: JSON.stringify({ title, code, description }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update course');
      }

      router.push('/admin/courses');
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while updating the course');
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
            <span className="text-white">Edit</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Edit Course</h1>
          <p className="text-xl text-indigo-200/80 mt-2 font-medium">Update the course title, code, or description.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant/10 bg-surface-container-low/30">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Course Settings</h2>
          </div>
          
          <div className="p-8">
            {loading ? (
               <div className="py-12 text-center text-slate-500">Loading course data...</div>
            ) : error && !title ? (
              <div className="py-8 text-center text-rose-500 font-medium">{error}</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-700">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-bold text-slate-700 tracking-wide uppercase mb-2">
                      Course Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Introduction to Computer Science"
                      className="bg-surface border-slate-200/60 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-sm font-bold text-slate-700 tracking-wide uppercase mb-2">
                      Course Code
                    </label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. CS101"
                      className="bg-surface border-slate-200/60 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-bold text-slate-700 tracking-wide uppercase mb-2">
                      Course Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-slate-200/60 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-colors text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter a comprehensive description..."
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-outline-variant/10">
                  <Link href="/admin/courses">
                    <Button variant="secondary" type="button" className="px-6 shadow-sm">
                      Cancel
                    </Button>
                  </Link>
                  <Button variant="primary" type="submit" disabled={submitting || loading} className="px-8 shadow-sm">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
