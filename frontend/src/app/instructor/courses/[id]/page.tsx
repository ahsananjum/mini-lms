'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface Course { _id: string; title: string; code: string; description: string; }
interface Material { _id: string; title: string; description: string; fileName: string; fileUrl: string; createdAt: string; }
interface Module { _id: string; title: string; description: string; order: number; materials: Material[]; }
interface Announcement { _id: string; title: string; message: string; createdAt: string; updatedAt: string; }

export default function InstructorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms State
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [editModuleId, setEditModuleId] = useState<string | null>(null);
  
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [editAnnId, setEditAnnId] = useState<string | null>(null);

  // Material Upload State per Module
  const [uploadState, setUploadState] = useState<{ [moduleId: string]: { title: string, desc: string, file: File | null } }>({});

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push(ROUTES.PUBLIC.LOGIN);
      else if (user?.role !== 'instructor' || user?.status !== 'active') router.push('/instructor');
    }
  }, [user, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === 'instructor' && user?.status === 'active' && id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, modulesRes, anntsRes] = await Promise.all([
        apiFetch<any>(`/instructor/courses/${id}`),
        apiFetch<any>(`/instructor/courses/${id}/modules`),
        apiFetch<any>(`/instructor/courses/${id}/announcements`)
      ]);

      if (!courseRes.success) throw new Error(courseRes.message || 'Failed to load course');
      setCourse(courseRes.data?.course || courseRes.data);
      
      if (modulesRes.success) setModules(modulesRes.data || []);
      if (anntsRes.success) setAnnouncements(anntsRes.data || []);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  // --- MODULE ACTIONS ---
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    try {
      const res = await apiFetch<any>(`/instructor/courses/${id}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title: newModuleName, description: newModuleDesc })
      });
      if (res.success) {
        setNewModuleName('');
        setNewModuleDesc('');
        fetchData();
      } else alert(res.message);
    } catch (err: any) { alert(err.message); }
  };

  const handleEditModule = async (moduleId: string, title: string, description: string) => {
    try {
      const res = await apiFetch<any>(`/instructor/modules/${moduleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, description })
      });
      if (res.success) {
        setEditModuleId(null);
        fetchData();
      } else alert(res.message);
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its materials?')) return;
    try {
      const res = await apiFetch<any>(`/instructor/modules/${moduleId}`, { method: 'DELETE' });
      if (res.success) fetchData();
      else alert(res.message);
    } catch (err: any) { alert(err.message); }
  };

  // --- MATERIAL ACTIONS ---
  const handleUploadMaterial = async (moduleId: string, e: React.FormEvent) => {
    e.preventDefault();
    const state = uploadState[moduleId];
    if (!state?.title || !state?.file) return alert('Title and file are required');
    
    const formData = new FormData();
    formData.append('title', state.title);
    if (state.desc) formData.append('description', state.desc);
    formData.append('file', state.file);

    try {
      // Use credentials: 'include' so the HTTP-only cookie is sent automatically
      const res = await fetch(`/api/instructor/modules/${moduleId}/materials`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setUploadState({ ...uploadState, [moduleId]: { title: '', desc: '', file: null } });
        fetchData();
        // Reset file input via ID
        const fileInput = document.getElementById(`file-${moduleId}`) as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err: any) { alert(typeof err === 'string' ? err : err.message || 'Upload failed'); }
  };

  const handleDeleteMaterial = async (materialId: string) => {
      if (!confirm('Delete this material?')) return;
      try {
        const res = await apiFetch<any>(`/instructor/materials/${materialId}`, { method: 'DELETE' });
        if (res.success) fetchData();
        else alert(res.message);
      } catch (err: any) { alert(err.message); }
  };

  // --- ANNOUNCEMENT ACTIONS ---
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnMessage.trim()) return;
    try {
      const res = await apiFetch<any>(`/instructor/courses/${id}/announcements`, {
        method: 'POST',
        body: JSON.stringify({ title: newAnnTitle, message: newAnnMessage })
      });
      if (res.success) {
        setNewAnnTitle('');
        setNewAnnMessage('');
        fetchData();
      } else alert(res.message);
    } catch (err: any) { alert(err.message); }
  };

  const handleEditAnn = async (annId: string, title: string, message: string) => {
    try {
      const res = await apiFetch<any>(`/instructor/announcements/${annId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, message })
      });
      if (res.success) {
        setEditAnnId(null);
        fetchData();
      } else alert(res.message);
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteAnn = async (annId: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await apiFetch<any>(`/instructor/announcements/${annId}`, { method: 'DELETE' });
      if (res.success) fetchData();
      else alert(res.message);
    } catch (err: any) { alert(err.message); }
  };


  if (authLoading || !user || user.role !== 'instructor') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/instructor/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6 inline-block">
          &larr; Back to My Courses
        </Link>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">Loading course...</div>
        ) : error || !course ? (
          <div className="p-8 text-center text-rose-500 font-medium bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">{error || 'Course not found'}</div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 font-mono mb-4 ring-1 ring-inset ring-indigo-700/10">
                  {course.code}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">{course.title}</h1>
                <p className="text-lg text-slate-600 max-w-3xl">{course.description}</p>
              </div>
              
              <Link href={`/instructor/courses/${course._id}/assignments`}>
                <Button variant="primary" className="whitespace-nowrap">
                  Manage Assignments
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Modules & Materials */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold text-slate-900">Course Content (Modules)</h2>
                </div>

                {/* Create Module Form */}
                <form onSubmit={handleCreateModule} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                   <div className="w-full">
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Module Title</label>
                     <Input required value={newModuleName} onChange={e => setNewModuleName(e.target.value)} placeholder="e.g. Week 1: Introduction" />
                   </div>
                   <div className="w-full">
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                     <Input value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} placeholder="Overview of topics..." />
                   </div>
                   <Button variant="primary" type="submit" className="whitespace-nowrap pb-2.5">Add Module</Button>
                </form>

                {/* Modules List */}
                {modules.length === 0 ? (
                  <div className="bg-white p-12 text-center border border-slate-200 rounded-xl shadow-sm text-slate-500 italic">No modules created yet.</div>
                ) : (
                  <div className="space-y-6">
                    {modules.map((mod) => (
                      <div key={mod._id} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        {editModuleId === mod._id ? (
                           <div className="p-6 bg-slate-50 border-b border-slate-200">
                             <h3 className="text-sm font-semibold mb-3 text-slate-700">Edit Module</h3>
                             <div className="space-y-4">
                               <Input defaultValue={mod.title} id={`edit-mod-title-${mod._id}`} />
                               <Input defaultValue={mod.description} id={`edit-mod-desc-${mod._id}`} />
                               <div className="flex gap-2">
                                 <Button variant="primary" onClick={() => {
                                    const t = (document.getElementById(`edit-mod-title-${mod._id}`) as HTMLInputElement).value;
                                    const d = (document.getElementById(`edit-mod-desc-${mod._id}`) as HTMLInputElement).value;
                                    handleEditModule(mod._id, t, d);
                                 }}>Save</Button>
                                 <Button variant="secondary" onClick={() => setEditModuleId(null)}>Cancel</Button>
                               </div>
                             </div>
                           </div>
                        ) : (
                           <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-start group">
                             <div>
                                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10 flex items-center justify-center text-xs font-bold">{mod.order}</span>
                                  {mod.title}
                                </h3>
                                {mod.description && <p className="text-slate-600 mt-2 text-sm ml-9">{mod.description}</p>}
                             </div>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => setEditModuleId(mod._id)}>Edit</Button>
                                <Button variant="danger" className="!px-3 !py-1 text-xs !bg-rose-100 !text-rose-700 hover:!bg-rose-200" onClick={() => handleDeleteModule(mod._id)}>Delete</Button>
                             </div>
                           </div>
                        )}
                        
                        {/* Materials Section inside Module */}
                        <div className="p-6">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-9">Learning Materials</h4>
                          
                          {mod.materials?.length > 0 ? (
                            <ul className="ml-9 mb-6 space-y-3">
                              {mod.materials.map(mat => (
                                <li key={mat._id} className="flex justify-between items-start p-4 rounded-lg border border-slate-100 bg-white hover:border-slate-300 transition-colors group">
                                  <div className="flex gap-3">
                                    <div className="mt-1">
                                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                      <a href={mat.fileUrl.startsWith('http') ? mat.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${mat.fileUrl}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline">{mat.title}</a>
                                      {mat.description && <p className="text-sm text-slate-500 mt-0.5">{mat.description}</p>}
                                      <p className="text-xs text-slate-400 mt-1">{mat.fileName} • Uploaded {new Date(mat.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <button onClick={() => handleDeleteMaterial(mat._id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500 italic ml-9 mb-6">No materials uploaded yet.</p>
                          )}

                          {/* Upload Material Form */}
                          <form onSubmit={(e) => handleUploadMaterial(mod._id, e)} className="ml-9 p-4 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                             <h4 className="text-xs font-semibold text-slate-700 mb-3">Upload Material</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                               <Input 
                                  placeholder="Document Title *" required 
                                  value={uploadState[mod._id]?.title || ''}
                                  onChange={e => setUploadState({...uploadState, [mod._id]: {...uploadState[mod._id], title: e.target.value}})}
                                  className="!py-1.5 !text-sm"
                               />
                               <Input 
                                  placeholder="Short Description (Optional)" 
                                  value={uploadState[mod._id]?.desc || ''}
                                  onChange={e => setUploadState({...uploadState, [mod._id]: {...uploadState[mod._id], desc: e.target.value}})}
                                  className="!py-1.5 !text-sm"
                               />
                             </div>
                             <div className="flex items-center gap-3">
                               <input 
                                  type="file" id={`file-${mod._id}`} required
                                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
                                  onChange={e => setUploadState({...uploadState, [mod._id]: {...uploadState[mod._id], file: e.target.files?.[0] || null}})}
                               />
                               <Button variant="primary" type="submit" className="!py-1.5 !px-4 text-sm whitespace-nowrap">Upload</Button>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-2">Max 10MB. Allowed: pdf, doc, docx, ppt, pptx, txt, zip, png, jpg, jpeg</p>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Announcements */}
              <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
                 
                 {/* Create Announcement */}
                 <form onSubmit={handleCreateAnnouncement} className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-slate-200 flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-slate-700">Post New Announcement</h3>
                    <Input required placeholder="Announcement Title" value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} />
                    <textarea 
                       required placeholder="Write your message here..." rows={4}
                       className="w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                       value={newAnnMessage} onChange={e => setNewAnnMessage(e.target.value)}
                    />
                    <Button variant="primary" type="submit">Post Announcement</Button>
                 </form>

                 {/* Announcements List */}
                 {announcements.length === 0 ? (
                    <div className="bg-white p-8 text-center border border-slate-200 rounded-xl shadow-sm text-slate-500 italic">No announcements posted yet.</div>
                 ) : (
                    <div className="space-y-4">
                      {announcements.map((ann) => (
                         <div key={ann._id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
                            {editAnnId === ann._id ? (
                               <div className="space-y-3">
                                 <Input defaultValue={ann.title} id={`edit-ann-title-${ann._id}`} />
                                 <textarea 
                                    defaultValue={ann.message} id={`edit-ann-msg-${ann._id}`} rows={3}
                                    className="w-full px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                 />
                                 <div className="flex gap-2">
                                    <Button variant="primary" className="!py-1 text-sm" onClick={() => {
                                       const t = (document.getElementById(`edit-ann-title-${ann._id}`) as HTMLInputElement).value;
                                       const m = (document.getElementById(`edit-ann-msg-${ann._id}`) as HTMLInputElement).value;
                                       handleEditAnn(ann._id, t, m);
                                    }}>Save</Button>
                                    <Button variant="secondary" className="!py-1 text-sm" onClick={() => setEditAnnId(null)}>Cancel</Button>
                                 </div>
                               </div>
                            ) : (
                               <>
                                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditAnnId(ann._id)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50 transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteAnn(ann._id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded bg-slate-50 hover:bg-rose-50 transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                 </div>
                                 <h4 className="font-bold text-slate-900 pr-16">{ann.title}</h4>
                                 <p className="text-xs text-slate-400 mb-3 mt-1">
                                    {new Date(ann.createdAt).toLocaleDateString()} {ann.updatedAt !== ann.createdAt && '(Edited)'}
                                 </p>
                                 <p className="text-sm text-slate-600 whitespace-pre-wrap">{ann.message}</p>
                               </>
                            )}
                         </div>
                      ))}
                    </div>
                 )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
