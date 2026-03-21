'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface UserRequest {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

function AdminDashboardContent() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending');
  const [roleFilter, setRoleFilter] = useState<{label: string, value: string}>({ label: 'All', value: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push(ROUTES.PUBLIC.LOGIN);
      }
    }
  }, [user, authLoading, isAuthenticated, router]);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter.value) params.append('role', roleFilter.value);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/registration-requests?${params.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.data.requests);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, searchQuery]);

  // Load requests on filter change
  useEffect(() => {
    if (user?.role === 'admin') {
      loadRequests();
    }
  }, [loadRequests, user]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setWarningMessage(null);
      const res = await fetch(`/api/admin/registration-requests/${id}/${action}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        if (action === 'approve' && data.data?.emailSent === false) {
          setWarningMessage(`User approved but failed to send welcome email to ${data.data.user.email}`);
        }
        await loadRequests();
      } else {
        alert(data.message || `Failed to ${action} request`);
      }
    } catch {
      alert(`Error trying to ${action} request`);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-gray-500">Loading admin privileges...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-8 bg-gray-50">
      <div className="w-full max-w-6xl">
        <PageHeader 
          title="Registration Requests" 
          description="Manage pending account registrations." 
        />
        
        {warningMessage && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
            {warningMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-end gap-5">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Search</label>
              <Input 
                type="text" 
                placeholder="Name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select 
                className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 sm:text-sm transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select 
                className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 sm:text-sm transition-colors"
                value={roleFilter.value}
                onChange={(e) => setRoleFilter({ label: e.target.options[e.target.selectedIndex].text, value: e.target.value })}
              >
                <option value="">All</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            
            <Button variant="secondary" onClick={() => loadRequests()} className="md:w-auto w-full px-6">
              Refresh
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Signup Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading requests...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-rose-500 font-medium">{error}</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No registration requests found matching your filters.</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-medium">{req.name}</span>
                          <span className="text-slate-500 text-xs mt-0.5">{req.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-600 font-medium">{req.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border
                          ${req.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="primary" onClick={() => handleAction(req._id, 'approve')} className="!py-1.5 !px-3 text-xs">Approve</Button>
                            <Button variant="danger" onClick={() => handleAction(req._id, 'reject')} className="!py-1.5 !px-3 text-xs">Reject</Button>
                          </div>
                        )}
                        {req.status !== 'pending' && <span className="text-slate-400 text-xs font-medium">No actions</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminRegistrationRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Page...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
