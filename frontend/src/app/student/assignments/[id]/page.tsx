'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface AssignmentData {
  assignment: {
    _id: string;
    course: {
      _id: string;
      title: string;
      code: string;
    };
    title: string;
    description: string;
    dueDate: string;
    gradingType: 'graded' | 'ungraded';
    totalMarks: number | null;
  };
  submission: {
    _id: string;
    status: 'not_submitted' | 'submitted' | 'graded';
    fileUrl?: string;
    fileName?: string;
    submittedAt?: string;
    marks?: number;
    feedback?: string;
    gradedAt?: string;
  } | null;
}

export default function StudentAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: assignmentId } = use(params);

  const [data, setData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'student' || user?.status !== 'active') router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'student' && user?.status === 'active' && assignmentId) {
      fetchAssignment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, assignmentId]);

  const fetchAssignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/student/assignments/${assignmentId}`);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load assignment details.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'You may not have access to this assignment.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Must use credentials: 'include' for the multipart form fetch directly
      const res = await fetch(`/api/student/assignments/${assignmentId}/submission`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        setFile(null); // Clear input
        fetchAssignment(); // Refresh state
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error connecting to server.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !user || user.role !== 'student') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {data?.assignment?.course && (
          <Link href={`/student/courses/${data.assignment.course._id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
            &larr; Back to {data.assignment.course.code}
          </Link>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">
            Loading assignment...
          </div>
        ) : error || !data ? (
           <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-rose-100 mt-6">
            {error || 'Assignment not found'}
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                 <div>
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 border tracking-wider ${data.assignment.gradingType === 'graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                     {data.assignment.gradingType === 'graded' ? 'GRADED ASSIGNMENT' : 'UNGRADED ASSIGNMENT'}
                   </span>
                   <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{data.assignment.title}</h1>
                   <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 font-medium">
                     <div className="bg-slate-100 px-3 py-1 rounded-md text-slate-800">
                       Due: <span className="text-rose-600 font-bold">{new Date(data.assignment.dueDate).toLocaleString()}</span>
                     </div>
                     {data.assignment.gradingType === 'graded' && (
                       <div className="bg-slate-100 px-3 py-1 rounded-md text-slate-800">
                         Total Marks: <span className="font-bold text-slate-900">{data.assignment.totalMarks}</span>
                       </div>
                     )}
                   </div>
                 </div>

                {/* Status Badge */}
                <div className="shrink-0 bg-slate-50 p-4 border border-slate-100 rounded-xl min-w-[200px]">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Submission Status</h3>
                   {(!data.submission || data.submission.status === 'not_submitted') && (
                     <div className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-full">
                       <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                       Not Submitted
                     </div>
                   )}
                   {data.submission?.status === 'submitted' && (
                     <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 w-full">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       Submitted
                     </div>
                   )}
                   {data.submission?.status === 'graded' && (
                     <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                       Graded
                     </div>
                   )}
                </div>
              </div>

              <div className="prose prose-slate max-w-none prose-sm sm:prose-base bg-slate-50 border border-slate-100 p-6 rounded-xl">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Instructions</h4>
                 {data.assignment.description ? (
                   <p className="whitespace-pre-wrap text-slate-700">{data.assignment.description}</p>
                 ) : (
                   <p className="italic text-slate-400">No description provided by instructor.</p>
                 )}
              </div>
            </div>

            {/* Submission Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center gap-3">
                 <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">Your Work</h2>
               </div>
               
               <div className="p-8">
                 {data.assignment.gradingType === 'ungraded' && (
                   <div className="mb-6 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-4 text-sm flex items-start gap-3">
                     <svg className="w-5 h-5 shrink-0 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <p>This is an <strong>ungraded assignment</strong>. Submit your work here, but it will not receive formal marks.</p>
                   </div>
                 )}

                 {/* Current Submission Display */}
                 {data.submission?.fileUrl && (
                   <div className="mb-8 bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <svg className="w-8 h-8 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-900 truncate">{data.submission.fileName}</p>
                          <p className="text-xs text-slate-500">Submitted at {new Date(data.submission.submittedAt!).toLocaleString()}</p>
                        </div>
                     </div>
                     <a href={data.submission.fileUrl.startsWith('http') ? data.submission.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${data.submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                       <Button variant="secondary" className="!px-3 text-xs bg-white">View File</Button>
                     </a>
                   </div>
                 )}

                 {/* Upload form ONLY if not graded */}
                 {data.submission?.status !== 'graded' ? (
                   <form onSubmit={handleUpload} className="space-y-4">
                     <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-2">
                         {data.submission?.fileUrl ? 'Upload a replacement file' : 'Upload your work'}
                       </label>
                       <input 
                         type="file" 
                         required
                         onChange={e => setFile(e.target.files?.[0] || null)}
                         className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                       />
                     </div>
                     <div className="pt-2">
                       <Button type="submit" variant="primary" disabled={uploading || !file}>
                         {uploading ? 'Uploading...' : 'Submit Assignment'}
                       </Button>
                     </div>
                   </form>
                 ) : (
                   /* Grading Results Block */
                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-6">
                      <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-4 border-b border-emerald-200/50 pb-2">Grading Results</h3>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="shrink-0 bg-white border border-emerald-100 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center min-w-[120px]">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Score</span>
                          <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                            {data.submission.marks}
                            <span className="text-lg font-bold text-slate-400">/{data.assignment.totalMarks}</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-white border border-emerald-100 shadow-sm p-4 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">
                           {data.submission.feedback ? (
                             <>
                               <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Feedback</span>
                               {data.submission.feedback}
                             </>
                           ) : (
                             <span className="italic text-slate-400">No written feedback was provided by the instructor.</span>
                           )}
                        </div>
                      </div>
                   </div>
                 )}
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
