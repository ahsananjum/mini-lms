'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Submission {
  _id: string;
  status: 'not_submitted' | 'submitted' | 'graded';
  fileUrl?: string;
  fileName?: string;
  submittedAt?: string;
  marks?: number;
  feedback?: string;
}

interface SubmissionRow {
  student: Student;
  submission: Submission;
}

interface Assignment {
  _id: string;
  title: string;
  gradingType: 'graded' | 'ungraded';
  totalMarks: number | null;
  dueDate: string;
  course: string;
}

interface Course {
  _id: string;
  title: string;
  code: string;
}

export default function InstructorSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: assignmentId } = use(params);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grading Modal State
  const [gradingRow, setGradingRow] = useState<SubmissionRow | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number | ''>('');
  const [gradeFeedback, setGradeFeedback] = useState('');

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
      const [assignmentRes, submissionsRes] = await Promise.all([
        apiFetch<any>(`/instructor/assignments/${assignmentId}`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/instructor/assignments/${assignmentId}/submissions`) // eslint-disable-line @typescript-eslint/no-explicit-any
      ]);

      if (!assignmentRes.success) throw new Error(assignmentRes.message || 'Failed to load assignment');
      const fetchedAssignment = assignmentRes.data?.assignment || assignmentRes.data;
      setAssignment(fetchedAssignment);
      
      if (fetchedAssignment?.course) {
        // Fetch course details for the header
        const courseId = typeof fetchedAssignment.course === 'object' ? fetchedAssignment.course._id : fetchedAssignment.course;
        const courseRes = await apiFetch<any>(`/instructor/courses/${courseId}`); // eslint-disable-line @typescript-eslint/no-explicit-any
        if (courseRes.success) {
          setCourse(courseRes.data?.course || courseRes.data);
        }
      }

      if (submissionsRes.success) {
        // Backend now returns { assignment, rows } instead of flat array
        const submData = submissionsRes.data;
        setRows(submData?.rows || submData || []);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (row: SubmissionRow) => {
    setGradingRow(row);
    setGradeMarks(row.submission.status === 'graded' && row.submission.marks !== undefined ? row.submission.marks : '');
    setGradeFeedback(row.submission.feedback || '');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingRow || gradeMarks === '') return;

    try {
      const res = await apiFetch<any>(`/instructor/submissions/${gradingRow.submission._id}/grade`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'PATCH',
        body: JSON.stringify({
          marks: Number(gradeMarks),
          feedback: gradeFeedback
        })
      });

      if (res.success) {
        setGradingRow(null);
        fetchData(); // Refresh list to see updated status
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
             <Link href={`/instructor/assignments/${assignmentId}`} className="hover:text-white transition-colors">Assignment</Link>
             <span>/</span>
             <span className="text-white">Submissions</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${assignment?.gradingType === 'graded' ? 'bg-primary/20 text-indigo-200 ring-1 ring-inset ring-primary/40' : 'bg-white/10 text-slate-300 ring-1 ring-inset ring-white/20'}`}>
                   {assignment?.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                 </span>
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-500/40">
                   Due: {assignment && assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : '...'}
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
               <p className="text-xl text-indigo-200/80 mt-3 font-medium max-w-3xl leading-relaxed">
                 {course ? `${course.code} • ${course.title}` : 'Loading...'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading submissions...</div>
        ) : error || !assignment ? (
          <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error || 'Assignment not found'}</div>
        ) : (
          <div className="space-y-8">

            {assignment.gradingType === 'ungraded' && (
              <div className="bg-amber-50/40 border border-amber-200/50 text-amber-800 rounded-2xl p-6 flex items-start gap-3 text-sm shadow-ambient">
                <svg className="w-6 h-6 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="leading-relaxed mt-0.5">
                  <strong className="font-bold">Note:</strong> This is an ungraded assignment. You can review student submissions and files, but this assignment cannot receive marks or formal grading feedback.
                </p>
              </div>
            )}

            <div className="bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/15 rounded-[2rem] overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/10">
                <thead className="bg-surface/50">
                  <tr>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Student Name</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Submitted At</th>
                    <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">File</th>
                    {assignment.gradingType === 'graded' && (
                      <>
                        <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">Marks</th>
                        <th scope="col" className="px-8 py-5 text-right text-xs font-semibold text-on-surface uppercase tracking-wider">Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/10">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center text-sm text-slate-500 italic">
                        No enrolled students found for this course.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.submission._id || idx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-on-surface mb-1">{row.student.name}</div>
                          <div className="text-xs text-slate-500 font-medium">{row.student.email}</div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          {row.submission.status === 'not_submitted' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-surface-container-low text-slate-600 ring-1 ring-inset ring-outline-variant/15">Not Submitted</span>
                          )}
                          {row.submission.status === 'submitted' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">Submitted</span>
                          )}
                          {row.submission.status === 'graded' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Graded</span>
                          )}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                          {row.submission.submittedAt ? new Date(row.submission.submittedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500">
                           {row.submission.fileUrl ? (
                             <a href={row.submission.fileUrl.startsWith('http') ? row.submission.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${row.submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 hover:underline flex items-center gap-1.5 font-bold">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                               View File
                             </a>
                           ) : '-'}
                        </td>
                        {assignment.gradingType === 'graded' && (
                          <>
                            <td className="px-8 py-5 whitespace-nowrap text-base font-bold text-on-surface">
                               {row.submission.status === 'graded' ? `${row.submission.marks} / ${assignment.totalMarks}` : '-'}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                               {row.submission.status === 'not_submitted' ? (
                                 <span className="text-slate-400 text-xs italic font-medium">N/A</span>
                               ) : (
                                 <Button variant="secondary" className="!px-4 !py-1.5 text-xs shadow-sm shadow-ambient" onClick={() => openGradingModal(row)}>
                                   {row.submission.status === 'graded' ? 'Update Grade' : 'Grade'}
                                 </Button>
                               )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        )}

        {/* Grading Modal Overlay */}
        {gradingRow && (
          <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-surface-container-lowest rounded-[2rem] shadow-2xl ring-1 ring-outline-variant/20 w-full max-w-md overflow-hidden">
                <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                   <h3 className="text-xl font-bold text-on-surface">
                     Grade Submission
                   </h3>
                   <button onClick={() => setGradingRow(null)} className="text-slate-400 hover:text-on-surface transition-colors p-2 bg-surface-container-low hover:bg-surface-container-low/50 rounded-xl">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                
                <div className="p-8">
                   <div className="mb-8 bg-surface-container-low/50 p-5 rounded-2xl border border-outline-variant/15">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-2">Student</p>
                      <p className="font-bold text-on-surface text-lg">{gradingRow.student.name}</p>
                      <p className="text-slate-500 text-sm font-medium">{gradingRow.student.email}</p>
                      {gradingRow.submission.fileUrl && (
                         <div className="mt-4">
                           <a href={gradingRow.submission.fileUrl.startsWith('http') ? gradingRow.submission.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${gradingRow.submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 bg-primary/10 px-4 py-2 rounded-xl ring-1 ring-inset ring-primary/20 hover:bg-primary/20 transition-all duration-300">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                             Download File
                           </a>
                         </div>
                      )}
                   </div>

                   <form onSubmit={handleGradeSubmit} className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Marks <span className="text-slate-400 font-normal">/ {assignment?.totalMarks}</span></label>
                        <Input 
                           type="number" required min={0} max={assignment?.totalMarks || 100}
                           value={gradeMarks} onChange={e => setGradeMarks(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Feedback (Optional)</label>
                        <textarea 
                           rows={4}
                           className="w-full px-4 py-3 text-base bg-surface-container-lowest shadow-sm ring-1 ring-inset ring-outline-variant/15 outline-none transition-all duration-300 focus:ring-[4px] focus:ring-primary/40 hover:ring-outline-variant/30 rounded-xl"
                           value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)}
                           placeholder="Great work on..."
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" className="px-6 py-2.5" onClick={() => setGradingRow(null)}>Cancel</Button>
                        <Button type="submit" variant="primary" className="px-6 py-2.5">Submit Grade</Button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
