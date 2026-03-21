'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  status: 'active' | 'rejected';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'admin') router.push(ROUTES.PUBLIC.LOGIN);
    }
  }, [user, authLoading, isAuthenticated, router]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response: any = await apiFetch(`/admin/users?${params.toString()}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      setUsers(response.data?.users || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAction = async (id: string, action: 'activate' | 'reject' | 'delete') => {
    try {
      let response: any;
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
          return;
        }
        response = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      } else {
        const newStatus = action === 'activate' ? 'active' : 'rejected';
        response = await apiFetch(`/admin/users/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
      }

      if (!response.success) {
        throw new Error(response.message || `Failed to ${action} user`);
      }
      
      await loadUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.message || `An error occurred while trying to ${action} user`);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-4 sm:p-8 bg-slate-50 relative">
      <div className="w-full max-w-7xl relative z-10">
        <PageHeader 
          title="User Management" 
          description="Manage active and rejected student and instructor accounts." 
        />
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden mt-6">
          
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-end gap-5">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Search</label>
              <Input 
                type="text" 
                placeholder="Name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select 
                className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 sm:text-sm transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select 
                className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 sm:text-sm transition-colors"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            
            <Button variant="secondary" onClick={() => loadUsers()} className="md:w-auto w-full px-6">
              Search
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
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading users...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-rose-500 font-medium">{error}</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users found matching your filters.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-medium">{u.name}</span>
                          <span className="text-slate-500 text-xs mt-0.5">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize text-slate-600 font-medium">{u.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border
                          ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            u.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <div className="flex gap-2">
                          {u.status === 'active' && (
                            <Button variant="danger" onClick={() => handleAction(u._id, 'reject')} className="!py-1.5 !px-3 text-xs bg-amber-600 hover:bg-amber-700 border-transparent focus:ring-amber-500 text-white">Reject</Button>
                          )}
                          {u.status === 'rejected' && (
                            <Button variant="primary" onClick={() => handleAction(u._id, 'activate')} className="!py-1.5 !px-3 text-xs bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white border-transparent">Activate</Button>
                          )}
                          <Button variant="danger" onClick={() => handleAction(u._id, 'delete')} className="!py-1.5 !px-3 text-xs !bg-rose-100 hover:!bg-rose-200 !text-rose-700 !border-transparent">Delete</Button>
                        </div>
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
