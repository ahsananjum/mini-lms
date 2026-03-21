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
        apiFetch<any>(`/instructor/assignments/${assignmentId}`),
        apiFetch<any>(`/instructor/assignments/${assignmentId}/submissions`)
      ]);

      if (!assignmentRes.success) throw new Error(assignmentRes.message || 'Failed to load assignment');
      const fetchedAssignment = assignmentRes.data?.assignment || assignmentRes.data;
      setAssignment(fetchedAssignment);
      
      if (fetchedAssignment?.course) {
        // Fetch course details for the header
        const courseId = typeof fetchedAssignment.course === 'object' ? fetchedAssignment.course._id : fetchedAssignment.course;
        const courseRes = await apiFetch<any>(`/instructor/courses/${courseId}`);
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
      const res = await apiFetch<any>(`/instructor/submissions/${gradingRow.submission._id}/grade`, {
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
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || !user || user.role !== 'instructor') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href={`/instructor/assignments/${assignmentId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          &larr; Back to Assignment
        </Link>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">Loading submissions...</div>
        ) : error || !assignment ? (
          <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">{error || 'Assignment not found'}</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{assignment.title}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${assignment.gradingType === 'graded' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                    {assignment.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                  </span>
                </div>
                {course && (
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {course.code} • {course.title}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                  {assignment.dueDate && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Due: {new Date(assignment.dueDate).toLocaleString()}
                    </span>
                  )}
                  {assignment.gradingType === 'graded' && assignment.totalMarks && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Total Marks: {assignment.totalMarks}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {assignment.gradingType === 'ungraded' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  <strong>Note:</strong> This is an ungraded assignment. You can review student submissions and files, but this assignment cannot receive marks or formal grading feedback.
                </p>
              </div>
            )}

            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted At</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                    {assignment.gradingType === 'graded' && (
                      <>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500 italic">
                        No enrolled students found for this course.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.submission._id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">{row.student.name}</div>
                          <div className="text-xs text-slate-500">{row.student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.submission.status === 'not_submitted' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Not Submitted</span>
                          )}
                          {row.submission.status === 'submitted' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Submitted</span>
                          )}
                          {row.submission.status === 'graded' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Graded</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {row.submission.submittedAt ? new Date(row.submission.submittedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                           {row.submission.fileUrl ? (
                             <a href={row.submission.fileUrl.startsWith('http') ? row.submission.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${row.submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                               View File
                             </a>
                           ) : '-'}
                        </td>
                        {assignment.gradingType === 'graded' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                               {row.submission.status === 'graded' ? `${row.submission.marks} / ${assignment.totalMarks}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                               {row.submission.status === 'not_submitted' ? (
                                 <span className="text-slate-400 text-xs italic">N/A</span>
                               ) : (
                                 <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => openGradingModal(row)}>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                   <h3 className="text-lg font-bold text-slate-900">
                     Grade Submission
                   </h3>
                   <button onClick={() => setGradingRow(null)} className="text-slate-400 hover:text-slate-600">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                
                <div className="p-6">
                   <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">Student</p>
                      <p className="font-semibold text-slate-900">{gradingRow.student.name} <span className="text-slate-500 text-sm font-normal">({gradingRow.student.email})</span></p>
                      {gradingRow.submission.fileUrl && (
                         <div className="mt-3">
                           <a href={gradingRow.submission.fileUrl.startsWith('http') ? gradingRow.submission.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${gradingRow.submission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                             Download Submission File
                           </a>
                         </div>
                      )}
                   </div>

                   <form onSubmit={handleGradeSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Marks <span className="text-slate-400 font-normal">/ {assignment?.totalMarks}</span></label>
                        <Input 
                           type="number" required min={0} max={assignment?.totalMarks || 100}
                           value={gradeMarks} onChange={e => setGradeMarks(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Feedback (Optional)</label>
                        <textarea 
                           rows={3}
                           className="w-full px-4 py-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                           value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)}
                           placeholder="Great work on..."
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setGradingRow(null)}>Cancel</Button>
                        <Button type="submit" variant="primary">Submit Grade</Button>
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
