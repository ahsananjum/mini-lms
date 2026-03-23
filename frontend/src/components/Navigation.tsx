'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function Navigation() {
  const { isAuthenticated, user, logoutClient } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    logoutClient();
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
    return null; // Do not show navigation on public pages like login/signup for simplicity
  }

  return (
    <nav className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl tracking-tight text-indigo-600">Mini LMS</span>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {/* Admin Links */}
              {user.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname === '/admin'
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/users')
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/courses"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/courses')
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Courses
                  </Link>
                </>
              )}

              {/* Pending Links */}
              {user.status === 'pending' && (
                <Link
                  href="/pending-approval"
                  className="border-indigo-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Pending Approval
                </Link>
              )}

              {/* Active Student Links */}
              {user.role === 'student' && user.status === 'active' && (
                <>
                  <Link
                    href="/student"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname === '/student'
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/student/courses"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname.startsWith('/student/courses')
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/student/grades"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname.startsWith('/student/grades')
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Grades
                  </Link>
                </>
              )}

              {/* Active Instructor Links */}
              {user.role === 'instructor' && user.status === 'active' && (
                <>
                  <Link
                    href="/instructor"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname === '/instructor'
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/instructor/courses"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname.startsWith('/instructor/courses')
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/instructor/submissions"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      typeof window !== 'undefined' && window.location.pathname.startsWith('/instructor/submissions')
                        ? 'border-indigo-600 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    Submissions & Grading
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <span className="text-sm font-medium text-slate-600 mr-5 bg-slate-50 px-3 py-1.5 rounded-full ring-1 ring-inset ring-slate-200">
              {user.email} <span className="opacity-70 ml-1 font-normal capitalize">({user.role})</span>
            </span>
            <Button onClick={handleLogout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
