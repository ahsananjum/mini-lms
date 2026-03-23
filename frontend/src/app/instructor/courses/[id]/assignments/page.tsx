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
        apiFetch<any>(`/instructor/courses/${courseId}`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/instructor/courses/${courseId}/assignments`) // eslint-disable-line @typescript-eslint/no-explicit-any
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
      const res = await apiFetch<any>(`/instructor/courses/${courseId}/assignments`, { // eslint-disable-line @typescript-eslint/no-explicit-any
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
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const res = await apiFetch<any>(`/instructor/assignments/${assignmentId}`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'DELETE'
      });
      if (res.success) fetchData();
      else alert(res.message);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  if (authLoading || !user || user.role !== 'instructor') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
            <Link href={`/instructor/courses/${courseId}`} className="hover:text-white transition-colors">Course</Link>
            <span>/</span>
            <span className="text-white">Assignments</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Assignments
              </h1>
              <p className="text-xl text-indigo-200/80 mt-3 font-medium max-w-3xl leading-relaxed">
                {course ? `${course.code} • ${course.title}` : 'Loading...' }
              </p>
            </div>
            {!isCreating && (
              <Button variant="secondary" onClick={() => setIsCreating(true)} className="shadow-sm border-transparent bg-white/10 text-white hover:bg-white/20 whitespace-nowrap px-8 h-[48px]">
                Create Assignment
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading assignments...</div>
        ) : error || !course ? (
          <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error || 'Course not found'}</div>
        ) : (
          <div className="space-y-8">

            {isCreating && (
              <form onSubmit={handleCreateAssignment} className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 space-y-6 relative">
                <button type="button" onClick={() => setIsCreating(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-on-surface rounded-xl bg-surface-container-low transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-xl font-bold text-on-surface tracking-tight mb-4">New Assignment</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">Title</label>
                    <Input required placeholder="Assignment Title" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">Due Date</label>
                     <Input required type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                  
                  <div className="space-y-3 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">Assignment Type</label>
                    <div className="flex bg-surface-container-low p-1.5 rounded-xl w-fit ring-1 ring-inset ring-outline-variant/10">
                      <button
                        type="button"
                        onClick={() => setGradingType('graded')}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${gradingType === 'graded' ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/15' : 'text-slate-600 hover:text-on-surface hover:bg-surface-container-low/50'}`}
                      >
                        Graded Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradingType('ungraded')}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${gradingType === 'ungraded' ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/15' : 'text-slate-600 hover:text-on-surface hover:bg-surface-container-low/50'}`}
                      >
                        Ungraded Assignment
                      </button>
                    </div>
                  </div>

                  {gradingType === 'graded' ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Marks</label>
                      <Input required type="number" min={1} value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} />
                    </div>
                  ) : (
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm text-slate-500 italic bg-amber-50/40 p-4 rounded-xl border border-amber-200/50">
                        Ungraded assignments accept submissions but cannot receive marks.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">Description (Optional)</label>
                    <textarea 
                       placeholder="Instructions for students..." rows={4}
                       className="w-full px-4 py-3 text-base bg-surface-container-lowest shadow-sm ring-1 ring-inset ring-outline-variant/15 outline-none transition-all duration-300 focus:ring-[4px] focus:ring-primary/40 hover:ring-outline-variant/30 rounded-xl"
                       value={description} onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button variant="primary" type="submit" className="px-8 py-2.5">Create Assignment</Button>
                </div>
              </form>
            )}

            <div className="bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/15 rounded-[2rem] overflow-hidden">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead className="bg-surface/50">
                  <tr>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Marks</th>
                    <th scope="col" className="px-8 py-5 text-right text-xs font-semibold text-on-surface uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/10">
                  {assignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-sm text-slate-500 italic">
                        No assignments have been created yet.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-surface-container-low/50 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <Link href={`/instructor/assignments/${assignment._id}`} className="font-bold text-primary hover:text-primary/80 hover:underline">
                            {assignment.title}
                          </Link>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${assignment.gradingType === 'graded' ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-surface-container-low text-slate-600 ring-outline-variant/15'}`}>
                            {assignment.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-600">{new Date(assignment.dueDate).toLocaleString()}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-slate-500">
                          {assignment.gradingType === 'graded' ? assignment.totalMarks : '—'}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex justify-end items-center gap-4">
                              <Link href={`/instructor/assignments/${assignment._id}/submissions`} className="inline-flex items-center px-4 py-2 border border-outline-variant/20 text-xs font-bold rounded-lg text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-sm focus:ring-[4px] focus:ring-primary/40">
                                View Submissions
                              </Link>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <Link href={`/instructor/assignments/${assignment._id}`} className="text-slate-500 hover:text-primary px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-surface-container-low transition-colors">
                                  Edit
                                </Link>
                                <button onClick={() => handleDelete(assignment._id)} className="text-slate-500 hover:text-error px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-error/10 transition-colors">
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
