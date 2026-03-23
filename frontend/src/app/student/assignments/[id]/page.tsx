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

interface AssignmentResponse {
  success: boolean;
  message?: string;
  data?: AssignmentData;
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
      const res = await apiFetch<AssignmentResponse>(`/student/assignments/${assignmentId}`);
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
    } catch (err: unknown) {
      alert((err as Error).message || 'Error connecting to server.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !user || user.role !== 'student') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
             {data?.assignment?.course && (
               <>
                 <Link href={`/student/courses/${data.assignment.course?._id}`} className="hover:text-white transition-colors">{data.assignment.course?.code}</Link>
                 <span>/</span>
               </>
             )}
             <span className="text-white">Assignment</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${data?.assignment?.gradingType === 'graded' ? 'bg-primary/20 text-indigo-200 ring-1 ring-inset ring-primary/40' : 'bg-white/10 text-slate-300 ring-1 ring-inset ring-white/20'}`}>
                   {data?.assignment?.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                 </span>
                 {data?.assignment?.dueDate && (
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-500/40">
                     Due: {new Date(data.assignment.dueDate).toLocaleString()}
                   </span>
                 )}
                 {data?.assignment?.gradingType === 'graded' && data?.assignment?.totalMarks && (
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-500/40">
                     {data.assignment.totalMarks} Marks
                   </span>
                 )}
               </div>
               <h1 className="text-4xl font-extrabold text-white tracking-tight">
                 {data?.assignment ? data.assignment.title : 'Assignment Details'}
               </h1>
            </div>
            
            {/* Status Badge in Dark Pattern */}
            <div className="shrink-0 bg-white/5 backdrop-blur-md p-6 rounded-[1.5rem] ring-1 ring-white/20 min-w-[220px] shadow-sm">
               <h3 className="text-[10px] font-bold text-indigo-200/60 uppercase tracking-widest mb-3">Submission Status</h3>
               {(!data?.submission || data?.submission.status === 'not_submitted') && (
                 <div className="inline-flex items-center gap-3 text-sm font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl ring-1 ring-amber-500/50 shadow-sm w-full">
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse ring-4 ring-amber-500/20"></div>
                   Not Submitted
                 </div>
               )}
               {data?.submission?.status === 'submitted' && (
                 <div className="inline-flex items-center gap-3 text-sm font-bold text-indigo-200 bg-primary/20 px-4 py-2 rounded-xl ring-1 ring-primary/40 shadow-sm w-full">
                   <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                   Submitted
                 </div>
               )}
               {data?.submission?.status === 'graded' && (
                 <div className="inline-flex items-center gap-3 text-sm font-bold text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-xl ring-1 ring-emerald-500/40 shadow-sm w-full">
                   <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                   Graded
                 </div>
               )}
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">
            Loading assignment...
          </div>
        ) : error || !data ? (
           <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">
            {error || 'Assignment not found'}
          </div>
        ) : (
          <div className="space-y-8">

              <div className="prose prose-slate max-w-none prose-sm sm:prose-base bg-surface-container-low/50 ring-1 ring-outline-variant/10 p-8 rounded-[1.5rem]">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Instructions</h4>
                 {data.assignment?.description ? (
                   <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">{data.assignment.description}</p>
                 ) : (
                   <p className="italic text-slate-400 font-medium">No description provided by instructor.</p>
                 )}
              </div>

            {/* Submission Section */}
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden">
               <div className="bg-surface/50 border-b border-outline-variant/10 px-10 py-6 flex items-center gap-4">
                 <div className="bg-primary/10 text-primary p-2.5 rounded-xl ring-1 ring-primary/20 shadow-sm">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <h2 className="text-xl font-bold text-on-surface tracking-tight">Your Work</h2>
               </div>
               
               <div className="p-10">
                 {data.assignment?.gradingType === 'ungraded' && (
                   <div className="mb-8 bg-amber-50/40 shadow-ambient ring-1 ring-amber-200/50 text-amber-800 rounded-2xl p-6 text-sm flex items-start gap-4">
                     <svg className="w-6 h-6 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <p className="leading-relaxed text-base pt-0.5">This is an <strong>ungraded assignment</strong>. Submit your work here, but it will not receive formal marks.</p>
                   </div>
                 )}

                 {/* Current Submission Display */}
                 {data.submission?.fileUrl && (
                   <div className="mb-8 bg-surface-container-low/50 ring-1 ring-outline-variant/15 p-6 rounded-2xl flex items-center justify-between gap-6 shadow-sm border border-outline-variant/5">
                     <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-3 bg-surface-container-lowest rounded-xl shadow-sm ring-1 ring-outline-variant/10 shrink-0">
                          <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="truncate">
                          <p className="text-base font-bold text-on-surface truncate">{data.submission.fileName}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Submitted at {new Date(data.submission.submittedAt!).toLocaleString()}</p>
                        </div>
                     </div>
                     <a href={data.submission.fileUrl.startsWith('http') ? data.submission.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${data.submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-white ring-1 ring-outline-variant/20 shadow-sm hover:shadow-md hover:ring-primary/40 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-primary transition-all duration-300">
                       View File
                     </a>
                   </div>
                 )}

                 {/* Upload form ONLY if not graded */}
                 {data.submission?.status !== 'graded' ? (
                   <form onSubmit={handleUpload} className="space-y-6">
                     <div>
                       <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                         {data.submission?.fileUrl ? 'Upload a replacement file' : 'Upload your work'}
                       </label>
                       <input 
                         type="file" 
                         required
                         onChange={e => setFile(e.target.files?.[0] || null)}
                         className="block w-full text-sm text-slate-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:uppercase file:tracking-wider file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 border border-outline-variant/20 rounded-[1.25rem] bg-surface-container-low/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer p-1"
                       />
                     </div>
                     <div className="pt-4">
                       <Button type="submit" variant="primary" disabled={uploading || !file} className="w-full sm:w-auto px-8 py-3 font-semibold text-sm">
                         {uploading ? 'Uploading...' : 'Submit Assignment'}
                       </Button>
                     </div>
                   </form>
                 ) : (
                   /* Grading Results Block */
                   <div className="bg-emerald-50/50 ring-1 ring-emerald-600/20 rounded-[1.5rem] p-8 mt-8 shadow-ambient">
                      <h3 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-6 border-b border-emerald-200/50 pb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Grading Results
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-8">
                        <div className="shrink-0 bg-surface-container-lowest ring-1 ring-emerald-600/10 shadow-sm p-6 rounded-2xl flex flex-col items-center justify-center min-w-[140px] text-center border-b-4 border-b-emerald-500">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Score</span>
                          <div className="text-5xl font-black text-emerald-600 tracking-tighter">
                            {data.submission.marks}
                            <span className="text-xl font-bold text-slate-300">/{data.assignment?.totalMarks}</span>
                          </div>
                        </div>
                        <div className="flex-1 bg-surface-container-lowest ring-1 ring-emerald-600/10 shadow-sm p-8 rounded-2xl text-base text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                           {data.submission.feedback ? (
                             <>
                               <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Feedback</span>
                               {data.submission.feedback}
                             </>
                           ) : (
                             <span className="italic text-slate-400 font-normal">No written feedback was provided by the instructor.</span>
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
