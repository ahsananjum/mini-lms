'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  gradingType: 'graded' | 'ungraded';
  totalMarks: number | null;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  code: string;
}

export default function InstructorAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: courseId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [gradingType, setGradingType] = useState<'graded' | 'ungraded'>('graded');
  const [totalMarks, setTotalMarks] = useState<number>(100);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'instructor' || user?.status !== 'active') router.push('/instructor');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'instructor' && user?.status === 'active' && courseId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, assignmentsRes] = await Promise.all([
        apiFetch<any>(`/instructor/courses/${courseId}`),
        apiFetch<any>(`/instructor/courses/${courseId}/assignments`)
      ]);

      if (!courseRes.success) throw new Error(courseRes.message || 'Failed to load course');
      setCourse(courseRes.data?.course || courseRes.data);
      
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data || []);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    
    try {
      const res = await apiFetch<any>(`/instructor/courses/${courseId}/assignments`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          gradingType,
          totalMarks: gradingType === 'graded' ? Number(totalMarks) : null
        })
      });

      if (res.success) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setGradingType('graded');
        setTotalMarks(100);
        setIsCreating(false);
        fetchData();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const res = await apiFetch<any>(`/instructor/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      if (res.success) fetchData();
      else alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || !user || user.role !== 'instructor') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href={`/instructor/courses/${courseId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          &larr; Back to Course
        </Link>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">Loading assignments...</div>
        ) : error || !course ? (
          <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">{error || 'Course not found'}</div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
                <p className="text-slate-500 mt-1">{course.code} • {course.title}</p>
              </div>
              {!isCreating && (
                <Button variant="primary" onClick={() => setIsCreating(true)}>
                  Create Assignment
                </Button>
              )}
            </div>

            {isCreating && (
              <form onSubmit={handleCreateAssignment} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 relative">
                <button type="button" onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-lg font-bold text-slate-900 mb-4">New Assignment</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input required placeholder="Assignment Title" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-sm font-medium text-slate-700">Due Date</label>
                     <Input required type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Assignment Type</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                      <button
                        type="button"
                        onClick={() => setGradingType('graded')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${gradingType === 'graded' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Graded Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradingType('ungraded')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${gradingType === 'ungraded' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Ungraded Assignment
                      </button>
                    </div>
                  </div>

                  {gradingType === 'graded' ? (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Total Marks</label>
                      <Input required type="number" min={1} value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} />
                    </div>
                  ) : (
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                        Ungraded assignments accept submissions but cannot receive marks.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
                    <textarea 
                       placeholder="Instructions for students..." rows={3}
                       className="w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                       value={description} onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button variant="primary" type="submit">Create Assignment</Button>
                </div>
              </form>
            )}

            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500 italic">
                        No assignments have been created yet.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/instructor/assignments/${assignment._id}`} className="font-semibold text-indigo-600 hover:text-indigo-900 hover:underline">
                            {assignment.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${assignment.gradingType === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                            {assignment.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{new Date(assignment.dueDate).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {assignment.gradingType === 'graded' ? assignment.totalMarks : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex justify-end items-center gap-3">
                              <Link href={`/instructor/assignments/${assignment._id}/submissions`} className="text-indigo-600 hover:text-indigo-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium">
                                View Submissions
                              </Link>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <Link href={`/instructor/assignments/${assignment._id}`} className="text-slate-500 hover:text-indigo-600 px-2 py-1 text-xs font-medium">
                                  Edit
                                </Link>
                                <button onClick={() => handleDelete(assignment._id)} className="text-slate-500 hover:text-rose-600 px-2 py-1 text-xs font-medium">
                                  Delete
                                </button>
                              </div>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
