'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

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
      const response = await apiFetch<{ success: boolean; message?: string; data?: { users: UserRow[] } }>(`/admin/users?${params.toString()}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      setUsers(response.data?.users || []);
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching users');
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
      let response: { success: boolean; message?: string; data?: unknown };
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
    } catch (err: unknown) {
      alert((err as Error).message || `An error occurred while trying to ${action} user`);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2 text-indigo-200/80 font-medium">
              <Link href="/admin" className="hover:text-white transition-colors">Admin Control</Link>
              <span>/</span>
              <span className="text-white">Users</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Directory</h1>
            <p className="text-xl text-indigo-200/80 mt-2 font-medium">Manage active and pending registrations.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col overflow-hidden">
          
          <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/30 flex flex-col md:flex-row md:items-end gap-5">
            <div className="w-full md:w-1/3">
              <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Search Directory</label>
              <Input 
                type="text" 
                placeholder="Name or email address..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Account Status</label>
              <select 
                className="block w-full rounded-xl border-0 py-3 px-4 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant/20 outline-none transition-all duration-300 bg-surface focus:ring-2 focus:ring-primary/40 hover:ring-outline-variant/40"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected / Pending</option>
              </select>
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">Assigned Role</label>
              <select 
                className="block w-full rounded-xl border-0 py-3 px-4 text-on-surface shadow-sm ring-1 ring-inset ring-outline-variant/20 outline-none transition-all duration-300 bg-surface focus:ring-2 focus:ring-primary/40 hover:ring-outline-variant/40"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            
            <Button variant="secondary" onClick={() => loadUsers()} className="md:w-auto w-full px-8 h-[48px]">
              Apply Filters
            </Button>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="min-w-full">
              <thead className="border-b border-outline-variant/10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">System Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Joined Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">Loading directory...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-rose-500 font-medium">{error}</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">No records found matching these filters.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shadow-inner border border-slate-200/50">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-on-surface font-bold tracking-tight">{u.name}</span>
                            <span className="text-slate-500 text-xs mt-0.5">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                          u.role === 'instructor' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-500/20' : 
                          'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : u.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                          <span className="text-slate-700 font-medium capitalize">{u.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          {u.status === 'active' && (
                            <button onClick={() => handleAction(u._id, 'reject')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">Revoke</button>
                          )}
                          {u.status === 'rejected' && (
                            <button onClick={() => handleAction(u._id, 'activate')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Approve</button>
                          )}
                          <button onClick={() => handleAction(u._id, 'delete')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors">Delete</button>
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
