'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface GradeRow {
  assignmentId: string;
  title: string;
  dueDate: string | null;
  totalMarks: number;
  obtainedMarks: number;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string;
}

export default function StudentCourseGradesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { courseId } = use(params);

  const [courseTitle, setCourseTitle] = useState<string>('Course Grades');
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'student' || user?.status !== 'active') router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'student' && user?.status === 'active' && courseId) {
      fetchGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId]);

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/student/courses/${courseId}/grades`);
      if (res.success && res.data) {
        setGrades(res.data.grades || []);
        if (res.data.course && res.data.course.title) {
          setCourseTitle(res.data.course.title);
        }
      } else {
        throw new Error(res.message || 'Failed to load course grades');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'student') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/student/grades" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          &larr; Back to Enrolled Courses
        </Link>
        
        {loading ? (
          <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
            Loading grades...
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white border border-rose-200 rounded-2xl font-medium text-rose-500 shadow-sm mt-6">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
               <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{courseTitle}</h1>
               <p className="text-slate-500 mt-2 font-medium">Graded Assignments</p>
            </div>

            {grades.length === 0 ? (
               <div className="text-center p-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center">
                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No grades available for this course yet.</h3>
                <p className="text-slate-500 max-w-sm">When instructors grade your assignments, the marks and feedback will appear here.</p>
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Submitted On
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {grades.map((grade) => (
                      <tr key={grade.assignmentId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-slate-900">{grade.title}</div>
                          {grade.dueDate && (
                            <div className="text-xs text-slate-500">Due: {new Date(grade.dueDate).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                          {grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            <span className="text-lg font-black text-emerald-600 leading-none">{grade.obtainedMarks}</span>
                            <span className="text-xs font-bold text-slate-400 leading-none pb-0.5">/{grade.totalMarks}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {grade.feedback ? (
                            <div className="text-sm text-slate-600 line-clamp-2 italic" title={grade.feedback}>"{grade.feedback}"</div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
