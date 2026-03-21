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

export default function NewCoursePage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'admin') router.push(ROUTES.PUBLIC.LOGIN);
    }
  }, [user, authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !description.trim()) {
      setError('Title, code, and description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response: any = await apiFetch('/admin/courses', {
        method: 'POST',
        body: JSON.stringify({ title, code, description }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create course');
      }

      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the course');
      setSubmitting(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-4 sm:p-8 bg-slate-50 relative">
      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-6">
          <Link href="/admin/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            &larr; Back to Courses
          </Link>
        </div>
        
        <PageHeader 
          title="Create New Course" 
          description="Fill out the details below to initialize a new course." 
        />
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-50/80 border border-rose-100 rounded-lg text-sm font-medium text-rose-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
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
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
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
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Course Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-colors text-slate-900 placeholder:text-slate-400"
                placeholder="Enter a comprehensive description..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Link href="/admin/courses">
                <Button variant="secondary" type="button" className="px-6">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" type="submit" disabled={submitting} className="px-8 shadow-sm">
                {submitting ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
