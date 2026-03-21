'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: courseId } = use(params);

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  
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
      fetchCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, modulesRes, announcementsRes, assignmentsRes] = await Promise.all([
        apiFetch<any>(`/student/courses/${courseId}`),
        apiFetch<any>(`/student/courses/${courseId}/modules`),
        apiFetch<any>(`/student/courses/${courseId}/announcements`),
        apiFetch<any>(`/student/courses/${courseId}/assignments`)
      ]);

      if (!courseRes.success) throw new Error(courseRes.message || 'Failed to load course details');
      
      setCourse(courseRes.data?.course || courseRes.data);
      if (modulesRes.success) setModules(modulesRes.data || []);
      if (announcementsRes.success) setAnnouncements(announcementsRes.data || []);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data || []);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'You may not be enrolled in this course.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'student') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/student/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          &larr; Back to My Courses
        </Link>

        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">
            Loading course content...
          </div>
        ) : error || !course ? (
           <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-rose-100 mt-6">
            {error || 'Course not found'}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header & Instructor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 font-mono mb-4 border border-indigo-100">
                    {course.code}
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">{course.title}</h1>
                  <p className="text-lg text-slate-600 max-w-3xl">{course.description}</p>
                </div>
                
                <div className="shrink-0 bg-slate-50 p-5 rounded-xl border border-slate-100 min-w-[240px]">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{course.instructor?.name}</div>
                      <div className="text-xs text-slate-500">{course.instructor?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Modules & Materials */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Course Content
                </h2>
                
                {modules.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl border-dashed">
                    No modules published yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((mod, i) => (
                      <div key={mod._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">Module {i + 1}: {mod.title}</h3>
                          {mod.description && <p className="text-sm text-slate-600">{mod.description}</p>}
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                          {(!mod.materials || mod.materials.length === 0) ? (
                            <div className="px-6 py-4 text-sm text-slate-400 italic">No materials available.</div>
                          ) : (
                            mod.materials.map((mat: any) => (
                              <div key={mat._id} className="px-6 py-4 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 bg-indigo-100 text-indigo-600 p-2 rounded-lg shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-900">{mat.title}</h4>
                                    {mat.description && <p className="text-xs text-slate-500 mt-1">{mat.description}</p>}
                                  </div>
                                </div>
                                <a href={mat.fileUrl.startsWith('http') ? mat.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${mat.fileUrl}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100">
                                  View File
                                </a>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Assignments & Announcements */}
              <div className="space-y-8">
                
                {/* Assignments */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Assignments
                  </h2>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {assignments.length === 0 ? (
                      <div className="p-6 text-sm text-slate-500 text-center italic">No assignments yet.</div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {assignments.map(assn => (
                          <li key={assn._id} className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{assn.title}</h3>
                              <span className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${assn.gradingType === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {assn.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(assn.dueDate).toLocaleDateString()}
                              </span>
                              {assn.gradingType === 'graded' && (
                                <span className="font-semibold text-slate-700">• {assn.totalMarks} Marks</span>
                              )}
                            </div>
                            <Link href={`/student/assignments/${assn._id}`} className="block">
                              <Button variant="secondary" className="w-full justify-center !text-xs !py-1.5 shadow-sm border-slate-200">
                                View Assignment &rarr;
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                {/* Announcements */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    Announcements
                  </h2>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {announcements.length === 0 ? (
                      <div className="p-6 text-sm text-slate-500 text-center italic">No announcements.</div>
                    ) : (
                      <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                        {announcements.map(ann => (
                          <li key={ann._id} className="p-5">
                            <h3 className="font-bold text-slate-900 text-sm mb-1">{ann.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{new Date(ann.createdAt).toLocaleDateString()}</p>
                            <div className="text-sm text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100 whitespace-pre-wrap">{ann.message}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
