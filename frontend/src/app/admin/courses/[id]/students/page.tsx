'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Enrollment {
  _id: string; // enrollment id
  student: User;
  enrolledAt: string;
}

interface Course {
  _id: string;
  title: string;
  code: string;
}

export default function CourseStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeStudents, setActiveStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'admin') router.push(ROUTES.PUBLIC.LOGIN);
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'admin' && id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, enrollmentsRes, studentsRes] = await Promise.all([
        apiFetch<any>(`/admin/courses/${id}`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/admin/courses/${id}/enrollments`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/admin/users?role=student&status=active`) // eslint-disable-line @typescript-eslint/no-explicit-any
      ]);

      if (!courseRes.success) throw new Error(courseRes.message || 'Failed to fetch course');
      if (!enrollmentsRes.success) throw new Error(enrollmentsRes.message || 'Failed to fetch enrollments');
      if (!studentsRes.success) throw new Error(studentsRes.message || 'Failed to fetch students');
      
      setCourse(courseRes.data?.course);
      setEnrollments(enrollmentsRes.data?.enrollments || []);
      
      const enrolledIds = new Set(
          (enrollmentsRes.data?.enrollments || []).map((e: Enrollment) => e.student._id)
      );

      const allActiveStudents = studentsRes.data?.users || [];
      const unenrolledStudents = allActiveStudents.filter((student: User) => !enrolledIds.has(student._id));
      setActiveStudents(unenrolledStudents);
      setSelectedStudentId('');

    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudentId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const response = await apiFetch<any>(`/admin/courses/${id}/enrollments`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'POST',
        body: JSON.stringify({ studentId: selectedStudentId }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to enroll student');
      }

      await fetchData();
    } catch (err: unknown) {
      setFormError((err as Error).message || 'An error occurred while enrolling the student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the course?')) {
        return;
    }
    
    try {
      const response = await apiFetch<any>(`/admin/courses/${id}/enrollments/${studentId}`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'DELETE'
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to remove student');
      }

      await fetchData();
    } catch (err: unknown) {
      alert((err as Error).message || 'An error occurred while removing the student');
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/courses" className="hover:text-white transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-white">Roster</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {course ? `Roster: ${course.code}` : 'Manage Students'}
          </h1>
          <p className="text-xl text-indigo-200/80 mt-2 font-medium">
            {course ? course.title : 'Enroll or remove students from this course.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-slate-500">Loading data...</div>
          ) : error && !course ? (
            <div className="p-8 text-center text-rose-500 font-medium">{error}</div>
          ) : (
            <div className="flex flex-col">
                
              {/* Enrollment Form */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Enroll New Student</h3>
                
                {formError && (
                  <div className="p-3 mb-4 bg-rose-50/80 border border-rose-100 rounded-lg text-sm font-medium text-rose-600">
                    {formError}
                  </div>
                )}

                {activeStudents.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No unenrolled active students available.</p>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-2/3">
                            <label htmlFor="student" className="sr-only">Select Student</label>
                            <select 
                                id="student"
                                className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 sm:text-sm transition-colors"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="" disabled>-- Select a student --</option>
                                {activeStudents.map(student => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button 
                            variant="primary" 
                            disabled={submitting || !selectedStudentId}
                            onClick={handleEnroll}
                            className="w-full sm:w-auto px-8 py-2"
                        >
                            Enroll
                        </Button>
                    </div>
                )}
              </div>

              {/* Table of Enrolled Students */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 text-sm">
                    {enrollments.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No students are currently enrolled in this course.</td></tr>
                    ) : (
                      enrollments.map((enr) => (
                        <tr key={enr._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-slate-900 font-medium">{enr.student.name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{enr.student.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {new Date(enr.enrolledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <Button 
                              variant="danger" 
                              onClick={() => handleRemove(enr.student._id)} 
                              className="!py-1.5 !px-3 text-xs !bg-rose-100 hover:!bg-rose-200 !text-rose-700 !border-transparent"
                            >
                                Remove
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
