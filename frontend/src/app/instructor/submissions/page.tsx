'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface GradingOverviewAssignment {
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  dueDate: string;
  totalMarks: number;
  enrolledStudentsCount: number;
  submittedCount: number;
  gradedCount: number;
  pendingGradingCount: number;
}

interface OverviewData {
  summary: {
    gradedAssignmentsCount: number;
    pendingGradingCount: number;
  };
  assignments: GradingOverviewAssignment[];
}

export default function InstructorSubmissionsOverview() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'instructor' || user?.status !== 'active') router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'instructor' && user?.status === 'active') {
      fetchOverview();
    }
  }, [user]);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>('/instructor/submissions/overview'); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || 'Failed to load submissions overview');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'instructor') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Submissions & Grading</h1>
        <p className="text-slate-500 mt-2 mb-8">Overview of all graded assignments across your courses.</p>

        {loading ? (
          <div className="text-center p-16 text-slate-500 bg-surface-container-lowest rounded-[2rem] ring-1 ring-outline-variant/15 shadow-ambient animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-surface-container-lowest ring-1 ring-error/30 rounded-[2rem] font-medium text-error shadow-ambient">
            <p>{error}</p>
            <button onClick={fetchOverview} className="mt-4 px-6 py-2.5 bg-error/10 text-error rounded-xl hover:bg-error/20 font-medium transition-colors">
              Try Again
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-ambient ring-1 ring-outline-variant/15 p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">Graded Assignments</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-on-surface">{data.summary.gradedAssignmentsCount}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-inset ring-primary/20">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="bg-amber-50/40 rounded-[1.5rem] shadow-ambient ring-1 ring-amber-200/50 p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-700">Pending Grading</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-amber-600">{data.summary.pendingGradingCount}</p>
                </div>
                <div className="p-4 bg-amber-100 rounded-2xl ring-1 ring-inset ring-amber-700/10">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {data.assignments.length === 0 ? (
               <div className="text-center p-20 bg-surface-container-lowest ring-1 ring-outline-variant/15 rounded-[2rem] shadow-ambient flex flex-col items-center mt-6">
                <div className="w-16 h-16 mx-auto bg-surface-container-low rounded-[1.25rem] ring-1 ring-outline-variant/10 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-slate-400 strokeWidth-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-3 tracking-tight">No graded assignments found</h3>
                <p className="text-base text-slate-500 max-w-sm mb-8 leading-relaxed">You don&apos;t have any graded assignments yet. Create one in your courses to start receiving submissions.</p>
                <Link href="/instructor/courses" className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-medium rounded-xl shadow-ambient hover:shadow-lg focus:ring-[4px] focus:ring-primary/40 transition-all">
                  Go to Courses
                </Link>
              </div>
            ) : (
              <div className="bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/15 rounded-[2rem] overflow-hidden mt-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-outline-variant/10">
                    <thead className="bg-surface/50">
                      <tr>
                        <th scope="col" className="px-8 py-5 text-left text-xs font-semibold text-on-surface uppercase tracking-wider">
                          Assignment Details
                        </th>
                        <th scope="col" className="px-8 py-5 text-center text-xs font-semibold text-on-surface uppercase tracking-wider hidden sm:table-cell">
                          Progress
                        </th>
                        <th scope="col" className="px-8 py-5 text-center text-xs font-semibold text-on-surface uppercase tracking-wider">
                          Pending
                        </th>
                        <th scope="col" className="px-8 py-5 font-semibold text-on-surface uppercase tracking-wider">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/10">
                      {data.assignments.map((assignment) => (
                        <tr key={assignment.assignmentId} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-base font-bold text-on-surface mb-1">{assignment.assignmentTitle}</div>
                            <div className="text-xs font-medium text-primary mb-2">
                              {assignment.courseCode} • {assignment.courseTitle}
                            </div>
                            <div className="flex space-x-4 text-xs text-slate-500">
                              <span className="flex items-center">
                                <svg className="min-w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <svg className="min-w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Marks: {assignment.totalMarks}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap hidden sm:table-cell">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center space-x-3 text-sm">
                                <div className="flex flex-col items-center">
                                  <span className="font-bold text-slate-700">{assignment.submittedCount}</span>
                                  <span className="text-xs text-slate-500">Submitted</span>
                                </div>
                                <div className="text-slate-300">/</div>
                                <div className="flex flex-col items-center">
                                  <span className="font-bold text-slate-700">{assignment.enrolledStudentsCount}</span>
                                  <span className="text-xs text-slate-500">Enrolled</span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 max-w-[120px]">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${assignment.enrolledStudentsCount > 0 ? Math.min(100, (assignment.submittedCount / assignment.enrolledStudentsCount) * 100) : 0}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-center">
                            {assignment.pendingGradingCount > 0 ? (
                              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-amber-50/50 text-amber-700 text-xs font-bold border border-amber-200/50 ring-1 ring-inset ring-amber-500/10">
                                {assignment.pendingGradingCount} to grade
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-inset ring-emerald-600/20">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                All Graded
                              </div>
                            )}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/instructor/assignments/${assignment.assignmentId}/submissions`} className="inline-flex items-center px-5 py-2.5 border border-outline-variant/20 text-sm font-semibold rounded-lg text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-colors shadow-sm focus:ring-[4px] focus:ring-primary/40">
                              View Submissions
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
