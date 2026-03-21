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
      const res = await apiFetch<any>('/instructor/submissions/overview');
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
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Submissions & Grading</h1>
        <p className="text-slate-500 mt-2 mb-8">Overview of all graded assignments across your courses.</p>

        {loading ? (
          <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white border border-rose-200 rounded-2xl font-medium text-rose-500 shadow-sm">
            <p>{error}</p>
            <button onClick={fetchOverview} className="mt-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-medium transition-colors">
              Try Again
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Graded Assignments</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{data.summary.gradedAssignmentsCount}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 flex items-center justify-between bg-amber-50/10">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Grading</p>
                  <p className="mt-1 text-3xl font-black text-amber-600">{data.summary.pendingGradingCount}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {data.assignments.length === 0 ? (
               <div className="text-center p-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center">
                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No graded assignments found</h3>
                <p className="text-slate-500 max-w-sm mb-6">You don't have any graded assignments yet. Create one in your courses to start receiving submissions.</p>
                <Link href="/instructor/courses" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition lg:rounded-lg">
                  Go to Courses
                </Link>
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Assignment Details
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                          Progress
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Pending
                        </th>
                        <th scope="col" className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {data.assignments.map((assignment) => (
                        <tr key={assignment.assignmentId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-900 mb-1">{assignment.assignmentTitle}</div>
                            <div className="text-xs font-medium text-indigo-600 mb-2">
                              {assignment.courseCode} • {assignment.courseTitle}
                            </div>
                            <div className="flex space-x-4 text-xs text-slate-500">
                              <span className="flex items-center">
                                <svg className="min-w-4 h-4 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <svg className="min-w-4 h-4 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Marks: {assignment.totalMarks}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
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
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {assignment.pendingGradingCount > 0 ? (
                              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold border border-amber-200">
                                {assignment.pendingGradingCount} to grade
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                All Graded
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/instructor/assignments/${assignment.assignmentId}/submissions`} className="inline-flex items-center px-3 py-2 border border-slate-200 text-sm leading-4 font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm">
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
