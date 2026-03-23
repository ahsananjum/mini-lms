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
    return null;
  }

  const getActiveState = (path: string, exact: boolean = false) => {
    if (typeof window === 'undefined') return 'border-transparent text-slate-500 hover:text-on-surface';
    const isActive = exact 
      ? window.location.pathname === path 
      : window.location.pathname.startsWith(path);
    return isActive 
      ? 'border-primary text-primary' 
      : 'border-transparent text-slate-500 hover:text-on-surface';
  };

  return (
    <nav className="bg-surface-container-lowest/80 backdrop-blur-[24px] border-b border-outline-variant/15 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-6">
              <span className="font-extrabold text-xl tracking-tight text-primary">Mini LMS</span>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {/* Admin Links */}
              {user.role === 'admin' && (
                <>
                  <Link href="/admin" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/admin', true)}`}>
                    Dashboard
                  </Link>
                  <Link href="/admin/users" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/admin/users')}`}>
                    Users
                  </Link>
                  <Link href="/admin/courses" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/admin/courses')}`}>
                    Courses
                  </Link>
                </>
              )}

              {/* Pending Links */}
              {user.status === 'pending' && (
                <Link href="/pending-approval" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/pending-approval')}`}>
                  Pending Approval
                </Link>
              )}

              {/* Active Student Links */}
              {user.role === 'student' && user.status === 'active' && (
                <>
                  <Link href="/student" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/student', true)}`}>
                    Dashboard
                  </Link>
                  <Link href="/student/courses" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/student/courses')}`}>
                    My Courses
                  </Link>
                  <Link href="/student/grades" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/student/grades')}`}>
                    Grades
                  </Link>
                </>
              )}

              {/* Active Instructor Links */}
              {user.role === 'instructor' && user.status === 'active' && (
                <>
                  <Link href="/instructor" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/instructor', true)}`}>
                    Dashboard
                  </Link>
                  <Link href="/instructor/courses" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/instructor/courses')}`}>
                    My Courses
                  </Link>
                  <Link href="/instructor/submissions" className={`inline-flex items-center px-2 py-2 my-auto border-b-[3px] text-sm font-medium transition-colors ${getActiveState('/instructor/submissions')}`}>
                    Submissions & Grading
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <span className="text-sm font-medium text-slate-600 mr-5 bg-surface-container-low px-4 py-2 rounded-md">
              {user.email} <span className="opacity-60 ml-1 font-normal capitalize tracking-wide">({user.role})</span>
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
