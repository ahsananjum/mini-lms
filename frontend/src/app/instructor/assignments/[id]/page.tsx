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
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {assignment && (
          <Link href={`/instructor/courses/${assignment.course}/assignments`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
            &larr; Back to Assignments
          </Link>
        )}
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">Loading assignment...</div>
        ) : error || !assignment ? (
          <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">{error || 'Assignment not found'}</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                 <div className="p-8">
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                     <div>
                       <div className="flex items-center gap-3 mb-3">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.gradingType === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                           {assignment.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                         </span>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                           Due: {new Date(assignment.dueDate).toLocaleString()}
                         </span>
                         {assignment.gradingType === 'graded' && (
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                             {assignment.totalMarks} Marks
                           </span>
                         )}
                       </div>
                       <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{assignment.title}</h1>
                     </div>
                     <div className="flex gap-3 whitespace-nowrap">
                       <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Details</Button>
                     </div>
                   </div>
                   
                   <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-100">
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-xl font-bold text-slate-900">Student Submissions</h3>
                  <p className="text-slate-500 mt-1">Review student work{assignment.gradingType === 'graded' ? ', assign grades,' : ''} and provide feedback.</p>
               </div>
               <Link href={`/instructor/assignments/${assignment._id}/submissions`}>
                  <Button variant="primary">View {assignment.gradingType === 'graded' ? '& Grade ' : ''}Submissions</Button>
               </Link>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
