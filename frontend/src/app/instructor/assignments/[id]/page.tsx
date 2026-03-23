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
  course: string;
  title: string;
  description: string;
  dueDate: string;
  gradingType: 'graded' | 'ungraded';
  totalMarks: number | null;
  createdAt: string;
}

export default function InstructorAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: assignmentId } = use(params);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(100);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'instructor' || user?.status !== 'active') router.push('/instructor');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'instructor' && user?.status === 'active' && assignmentId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, assignmentId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/instructor/assignments/${assignmentId}`); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (res.success && res.data?.assignment) {
        const agn = res.data.assignment;
        setAssignment(agn);
        
        // Populate edit form
        setTitle(agn.title);
        setDescription(agn.description);
        
        // Format date for datetime-local input
        if (agn.dueDate) {
          const date = new Date(agn.dueDate);
          const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setDueDate(formatted);
        }
        setTotalMarks(agn.totalMarks || 100);
      } else {
        throw new Error(res.message || 'Failed to load assignment');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    
    try {
      const res = await apiFetch<any>(`/instructor/assignments/${assignmentId}`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'PATCH',
        body: JSON.stringify({
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          totalMarks: assignment?.gradingType === 'graded' ? Number(totalMarks) : null
        })
      });

      if (res.success) {
        setIsEditing(false);
        fetchData();
      } else {
        alert(res.message);
      }
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

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
             <Link href={assignment ? `/instructor/courses/${assignment.course}/assignments` : '/instructor/courses'} className="hover:text-white transition-colors">Assignments</Link>
             <span>/</span>
             <span className="text-white">Details</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${assignment?.gradingType === 'graded' ? 'bg-primary/20 text-indigo-200 ring-1 ring-inset ring-primary/40' : 'bg-white/10 text-slate-300 ring-1 ring-inset ring-white/20'}`}>
                   {assignment?.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                 </span>
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-500/40">
                   Due: {assignment ? new Date(assignment.dueDate).toLocaleString() : '...'}
                 </span>
                 {assignment?.gradingType === 'graded' && (
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-500/40">
                     {assignment?.totalMarks} Marks
                   </span>
                 )}
               </div>
               <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                 {assignment ? assignment.title : 'Assignment Details'}
               </h1>
            </div>
            {!isEditing && (
               <Button variant="secondary" onClick={() => setIsEditing(true)} className="shadow-sm border-transparent bg-white/10 text-white hover:bg-white/20 whitespace-nowrap px-8 h-[48px]">
                 Edit Details
               </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading assignment...</div>
        ) : error || !assignment ? (
          <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error || 'Assignment not found'}</div>
        ) : (
          <div className="space-y-8">
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden">
               {isEditing ? (
                 <form onSubmit={handleUpdate} className="p-8 space-y-6">
                   <div className="flex justify-between items-center mb-2">
                     <h2 className="text-xl font-bold text-slate-900">Edit Assignment</h2>
                     <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 font-medium text-sm">Cancel</button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                       <label className="text-sm font-medium text-slate-700">Type (Read-only)</label>
                       <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                         {assignment.gradingType === 'graded' ? 'Graded Assignment' : 'Ungraded Assignment'}
                       </div>
                     </div>
                     <div className="space-y-1">
                       <label className="text-sm font-medium text-slate-700">Title</label>
                       <Input required placeholder="Assignment Title" value={title} onChange={e => setTitle(e.target.value)} />
                     </div>
                     
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Due Date</label>
                        <Input required type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                     </div>
                     {assignment.gradingType === 'graded' ? (
                       <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-700">Total Marks</label>
                         <Input required type="number" min={1} value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} />
                       </div>
                     ) : (
                       <div className="space-y-1 flex items-end">
                         <p className="text-xs text-slate-500 italic mb-2">Total Marks cannot be set for ungraded tasks.</p>
                       </div>
                     )}
                     <div className="space-y-1 md:col-span-2">
                       <label className="text-sm font-medium text-slate-700">Description</label>
                       <textarea 
                          placeholder="Instructions for students..." rows={5}
                          className="w-full px-4 py-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          value={description} onChange={e => setDescription(e.target.value)}
                       />
                     </div>
                   </div>
                   <div className="pt-2 flex justify-end gap-3">
                     <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                     <Button variant="primary" type="submit">Save Changes</Button>
                   </div>
                 </form>
               ) : (
                 <div className="p-10">
                   <div className="prose prose-slate max-w-none bg-surface-container-low/50 p-8 rounded-[1.5rem] border border-outline-variant/10">
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Instructions</h3>
                     {assignment.description ? (
                       <p className="whitespace-pre-wrap text-slate-700">{assignment.description}</p>
                     ) : (
                       <p className="italic text-slate-400">No description provided.</p>
                     )}
                   </div>
                 </div>
               )}
            </div>

            {/* Submissions Card */}
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-xl font-bold text-on-surface">Student Submissions</h3>
                  <p className="text-slate-500 mt-1 text-lg">Review student work{assignment.gradingType === 'graded' ? ', assign grades,' : ''} and provide feedback.</p>
               </div>
               <Link href={`/instructor/assignments/${assignment._id}/submissions`}>
                  <Button variant="primary" className="px-8 h-[48px] whitespace-nowrap">View {assignment.gradingType === 'graded' ? '& Grade ' : ''}Submissions</Button>
               </Link>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
