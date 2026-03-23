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

interface GradesResponse {
  success: boolean;
  message?: string;
  data?: {
    course: { title: string };
    grades: GradeRow[];
  };
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
      const res = await apiFetch<GradesResponse>(`/student/courses/${courseId}/grades`);
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
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/student/grades" className="text-sm font-medium text-primary hover:text-primary/80 mb-6 inline-block">
          &larr; Back to Enrolled Courses
        </Link>
        
        {loading ? (
          <div className="text-center p-16 text-slate-500 bg-surface-container-lowest rounded-[2rem] ring-1 ring-outline-variant/15 shadow-ambient mt-6">
            Loading grades...
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-surface-container-lowest ring-1 ring-error/30 rounded-[2rem] font-medium text-error shadow-ambient mt-6">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 p-10">
               <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">{courseTitle}</h1>
               <p className="text-slate-500 mt-3 text-lg font-medium">Graded Assignments</p>
            </div>

            {grades.length === 0 ? (
               <div className="text-center p-20 bg-surface-container-lowest ring-1 ring-outline-variant/15 rounded-[2rem] shadow-ambient flex flex-col items-center">
                <svg className="w-16 h-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-xl font-bold text-on-surface tracking-tight mb-3">No grades available for this course yet.</h3>
                <p className="text-slate-500 max-w-sm font-medium">When instructors grade your assignments, the marks and feedback will appear here.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/15 rounded-[2rem] overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-outline-variant/10">
                  <thead className="bg-surface/50">
                    <tr>
                      <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Assignment
                      </th>
                      <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                        Submitted On
                      </th>
                      <th scope="col" className="px-8 py-5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Score
                      </th>
                      <th scope="col" className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-container-lowest divide-y divide-outline-variant/10">
                    {grades.map((grade) => (
                      <tr key={grade.assignmentId} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-base font-bold text-on-surface mb-1">{grade.title}</div>
                          {grade.dueDate && (
                            <div className="text-xs text-slate-500 font-medium">Due: {new Date(grade.dueDate).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-medium hidden sm:table-cell">
                          {grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-xl ring-1 ring-inset ring-emerald-600/20 shadow-sm">
                            <span className="text-xl font-black text-emerald-700 leading-none tracking-tight">{grade.obtainedMarks}</span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase leading-none pb-0.5 mt-1">/{grade.totalMarks}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 hidden md:table-cell">
                          {grade.feedback ? (
                            <div className="text-sm font-medium text-slate-600 line-clamp-2 italic" title={grade.feedback}>&quot;{grade.feedback}&quot;</div>
                          ) : (
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">None</span>
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
