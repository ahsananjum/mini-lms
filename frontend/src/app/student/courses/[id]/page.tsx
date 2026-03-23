'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface Material {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
}

interface ModuleData {
  _id: string;
  title: string;
  description: string;
  materials: Material[];
}

interface AssignmentData {
  _id: string;
  title: string;
  dueDate: string;
  gradingType: 'graded' | 'ungraded';
  totalMarks: number | null;
}

interface AnnouncementData {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface CourseData {
  _id: string;
  title: string;
  code: string;
  description: string;
  instructor?: { name: string; email: string };
}

interface CourseResponse {
  success: boolean;
  message?: string;
  data?: { course?: CourseData } | CourseData;
}

interface ModuleListResponse {
  success: boolean;
  message?: string;
  data?: ModuleData[];
}

interface AnnouncementListResponse {
  success: boolean;
  message?: string;
  data?: AnnouncementData[];
}

interface AssignmentListResponse {
  success: boolean;
  message?: string;
  data?: AssignmentData[];
}

export default function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id: courseId } = use(params);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  
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
        apiFetch<CourseResponse>(`/student/courses/${courseId}`),
        apiFetch<ModuleListResponse>(`/student/courses/${courseId}/modules`),
        apiFetch<AnnouncementListResponse>(`/student/courses/${courseId}/announcements`),
        apiFetch<AssignmentListResponse>(`/student/courses/${courseId}/assignments`)
      ]);

      if (!courseRes.success) throw new Error(courseRes.message || 'Failed to load course details');
      
      setCourse(('course' in (courseRes.data || {}) ? (courseRes.data as { course: CourseData }).course : (courseRes.data as CourseData)) || null);
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
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/student/courses" className="text-sm font-medium text-primary hover:text-primary/80 mb-6 inline-block">
          &larr; Back to My Courses
        </Link>

        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">
            Loading course content...
          </div>
        ) : error || !course ? (
           <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">
            {error || 'Course not found'}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header & Instructor Info */}
            <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary mb-6 ring-1 ring-inset ring-primary/20">
                    {course.code}
                  </span>
                  <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">{course.title}</h1>
                  <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">{course.description}</p>
                </div>
                
                <div className="shrink-0 bg-surface-container-low/50 p-6 rounded-[1.5rem] ring-1 ring-outline-variant/15 min-w-[260px] shadow-sm">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Instructor</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary font-bold text-xl ring-1 ring-outline-variant/15 shadow-sm">
                      {course.instructor?.name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{course.instructor?.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{course.instructor?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Modules & Materials */}
              <div className="lg:col-span-2 space-y-8">
                <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Course Content
                </h2>
                
                {modules.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-surface-container-lowest ring-1 ring-outline-variant/15 rounded-[2rem] border-dashed shadow-ambient">
                    No modules published yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modules.map((mod, i) => (
                      <div key={mod._id} className="bg-surface-container-lowest ring-1 ring-outline-variant/15 rounded-[2rem] overflow-hidden shadow-ambient">
                        <div className="p-8 bg-surface/50 border-b border-outline-variant/10">
                          <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">Module {i + 1}: {mod.title}</h3>
                          {mod.description && <p className="text-sm text-slate-500">{mod.description}</p>}
                        </div>
                        
                        <div className="divide-y divide-outline-variant/10">
                          {(!mod.materials || mod.materials.length === 0) ? (
                            <div className="px-8 py-6 text-sm text-slate-400 italic">No materials available.</div>
                          ) : (
                            mod.materials.map((mat: Material) => (
                              <div key={mat._id} className="px-8 py-5 flex items-start sm:items-center justify-between gap-4 hover:bg-surface-container-low/50 transition-colors group">
                                <div className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                                  <div className="mt-1 bg-primary/10 text-primary p-2.5 rounded-xl shrink-0 ring-1 ring-inset ring-primary/20 shadow-sm group-hover:scale-105 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-on-surface">{mat.title}</h4>
                                    {mat.description && <p className="text-xs text-slate-500 mt-1">{mat.description}</p>}
                                  </div>
                                </div>
                                <a href={mat.fileUrl.startsWith('http') ? mat.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${mat.fileUrl}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-all duration-300 ring-1 ring-inset ring-primary/20 hover:ring-primary shadow-sm">
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
                  <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Assignments
                  </h2>
                  <div className="bg-surface-container-lowest ring-1 ring-outline-variant/15 rounded-[2rem] shadow-ambient overflow-hidden">
                    {assignments.length === 0 ? (
                      <div className="p-8 text-sm text-slate-500 text-center italic">No assignments yet.</div>
                    ) : (
                      <ul className="divide-y divide-outline-variant/10">
                        {assignments.map(assn => (
                          <li key={assn._id} className="p-6 hover:bg-surface-container-low/50 transition-colors">
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <h3 className="font-bold text-on-surface leading-tight text-base">{assn.title}</h3>
                              <span className={`inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${assn.gradingType === 'graded' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-surface-container-low text-slate-600 ring-outline-variant/15'}`}>
                                {assn.gradingType === 'graded' ? 'Graded' : 'Ungraded'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 mb-5">
                              <span className="inline-flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-md text-slate-700 ring-1 ring-inset ring-outline-variant/10">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(assn.dueDate).toLocaleDateString()}
                              </span>
                              {assn.gradingType === 'graded' && (
                                <span className="font-bold text-slate-700 mx-1">• {assn.totalMarks} Marks</span>
                              )}
                            </div>
                            <Link href={`/student/assignments/${assn._id}`} className="block">
                              <Button variant="secondary" className="w-full justify-center !text-xs !py-2 shadow-sm border-outline-variant/20 hover:bg-primary/5 hover:border-primary/30 transition-colors hover:text-primary font-bold uppercase tracking-wider rounded-xl">
                                View Assignment
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
                  <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    Announcements
                  </h2>
                  <div className="bg-surface-container-lowest ring-1 ring-outline-variant/15 rounded-[2rem] shadow-ambient overflow-hidden">
                    {announcements.length === 0 ? (
                      <div className="p-8 text-sm text-slate-500 text-center italic">No announcements.</div>
                    ) : (
                      <ul className="divide-y divide-outline-variant/10 max-h-[500px] overflow-y-auto">
                        {announcements.map(ann => (
                          <li key={ann._id} className="p-6">
                            <h3 className="font-bold text-on-surface text-base mb-1">{ann.title}</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">{new Date(ann.createdAt).toLocaleDateString()}</p>
                            <div className="text-sm shadow-inner text-slate-700 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 whitespace-pre-wrap leading-relaxed">{ann.message}</div>
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
