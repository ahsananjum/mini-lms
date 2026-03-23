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
        apiFetch<any>(`/instructor/courses/${id}`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/instructor/courses/${id}/modules`), // eslint-disable-line @typescript-eslint/no-explicit-any
        apiFetch<any>(`/instructor/courses/${id}/announcements`) // eslint-disable-line @typescript-eslint/no-explicit-any
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
      const res = await apiFetch<any>(`/instructor/courses/${id}/modules`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'POST',
        body: JSON.stringify({ title: newModuleName, description: newModuleDesc })
      });
      if (res.success) {
        setNewModuleName('');
        setNewModuleDesc('');
        fetchData();
      } else alert(res.message);
    } catch (err: unknown) { alert((err as Error).message); }
  };

  const handleEditModule = async (moduleId: string, title: string, description: string) => {
    try {
      const res = await apiFetch<any>(`/instructor/modules/${moduleId}`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'PATCH',
        body: JSON.stringify({ title, description })
      });
      if (res.success) {
        setEditModuleId(null);
        fetchData();
      } else alert(res.message);
    } catch (err: unknown) { alert((err as Error).message); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its materials?')) return;
    try {
      const res = await apiFetch<any>(`/instructor/modules/${moduleId}`, { method: 'DELETE' }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (res.success) fetchData();
      else alert(res.message);
    } catch (err: unknown) { alert((err as Error).message); }
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
    } catch (err: unknown) { alert(typeof err === 'string' ? err : (err as Error).message || 'Upload failed'); }
  };

  const handleDeleteMaterial = async (materialId: string) => {
      if (!confirm('Delete this material?')) return;
      try {
        const res = await apiFetch<any>(`/instructor/materials/${materialId}`, { method: 'DELETE' }); // eslint-disable-line @typescript-eslint/no-explicit-any
        if (res.success) fetchData();
        else alert(res.message);
      } catch (err: unknown) { alert((err as Error).message); }
  };

  // --- ANNOUNCEMENT ACTIONS ---
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnMessage.trim()) return;
    try {
      const res = await apiFetch<any>(`/instructor/courses/${id}/announcements`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'POST',
        body: JSON.stringify({ title: newAnnTitle, message: newAnnMessage })
      });
      if (res.success) {
        setNewAnnTitle('');
        setNewAnnMessage('');
        fetchData();
      } else alert(res.message);
    } catch (err: unknown) { alert((err as Error).message); }
  };

  const handleEditAnn = async (annId: string, title: string, message: string) => {
    try {
      const res = await apiFetch<any>(`/instructor/announcements/${annId}`, { // eslint-disable-line @typescript-eslint/no-explicit-any
        method: 'PATCH',
        body: JSON.stringify({ title, message })
      });
      if (res.success) {
        setEditAnnId(null);
        fetchData();
      } else alert(res.message);
    } catch (err: unknown) { alert((err as Error).message); }
  };

  const handleDeleteAnn = async (annId: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await apiFetch<any>(`/instructor/announcements/${annId}`, { method: 'DELETE' }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (res.success) fetchData();
      else alert(res.message);
    } catch (err: unknown) { alert((err as Error).message); }
  };


  if (authLoading || !user || user.role !== 'instructor') return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-slate-900 border-b border-white/10 pt-16 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/20 to-transparent mix-blend-overlay z-0"></div>
        <div className="absolute top-[0%] left-[-10%] w-[40%] h-[150%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4 text-indigo-200/80 font-medium">
            <Link href="/instructor/courses" className="hover:text-white transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-white">{course ? course.code : 'Details'}</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {course ? course.title : 'Course Details'}
              </h1>
              <p className="text-xl text-indigo-200/80 mt-3 font-medium max-w-3xl leading-relaxed">
                {course ? course.description : 'Loading course information...'}
              </p>
            </div>
            {course && (
              <Link href={`/instructor/courses/${course._id}/assignments`}>
                <Button variant="secondary" className="shadow-sm border-transparent bg-white/10 text-white hover:bg-white/20 whitespace-nowrap px-8 h-[48px]">
                  Manage Assignments
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {loading ? (
          <div className="p-16 text-center text-slate-500 bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 mt-6">Loading course...</div>
        ) : error || !course ? (
          <div className="p-12 text-center text-error font-medium bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-error/30 mt-6">{error || 'Course not found'}</div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Modules & Materials */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold tracking-tight text-on-surface">Course Content (Modules)</h2>
                </div>

                {/* Create Module Form */}
                <form onSubmit={handleCreateModule} className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col sm:flex-row gap-5 items-start sm:items-end">
                   <div className="w-full">
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">New Module Title</label>
                     <Input required value={newModuleName} onChange={e => setNewModuleName(e.target.value)} placeholder="e.g. Week 1: Introduction" />
                   </div>
                   <div className="w-full">
                     <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Description (Optional)</label>
                     <Input value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} placeholder="Overview of topics..." />
                   </div>
                   <Button variant="primary" type="submit" className="whitespace-nowrap px-8">Add Module</Button>
                </form>

                {/* Modules List */}
                {modules.length === 0 ? (
                  <div className="bg-surface-container-lowest p-16 text-center shadow-ambient ring-1 ring-outline-variant/15 rounded-[2rem] text-slate-500 italic">No modules created yet.</div>
                ) : (
                  <div className="space-y-6">
                    {modules.map((mod) => (
                      <div key={mod._id} className="bg-surface-container-lowest rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 overflow-hidden">
                        {editModuleId === mod._id ? (
                           <div className="p-8 bg-surface-container-low/30 border-b border-outline-variant/10">
                             <h3 className="text-sm font-semibold mb-4 text-on-surface">Edit Module</h3>
                             <div className="space-y-4">
                               <Input defaultValue={mod.title} id={`edit-mod-title-${mod._id}`} />
                               <Input defaultValue={mod.description} id={`edit-mod-desc-${mod._id}`} />
                               <div className="flex gap-3 mt-4">
                                 <Button variant="primary" onClick={() => {
                                    const t = (document.getElementById(`edit-mod-title-${mod._id}`) as HTMLInputElement).value;
                                    const d = (document.getElementById(`edit-mod-desc-${mod._id}`) as HTMLInputElement).value;
                                    handleEditModule(mod._id, t, d);
                                 }}>Save Changes</Button>
                                 <Button variant="secondary" onClick={() => setEditModuleId(null)}>Cancel</Button>
                               </div>
                             </div>
                           </div>
                        ) : (
                           <div className="p-8 bg-surface-container-low/30 border-b border-outline-variant/10 flex justify-between items-start group">
                             <div>
                                <h3 className="text-xl font-bold text-on-surface flex items-center gap-4">
                                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 flex items-center justify-center text-sm font-bold">{mod.order}</span>
                                  {mod.title}
                                </h3>
                                {mod.description && <p className="text-slate-500 mt-2 text-base ml-12 leading-relaxed">{mod.description}</p>}
                             </div>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" className="!px-4 !py-1.5 text-xs" onClick={() => setEditModuleId(mod._id)}>Edit</Button>
                                <Button variant="danger" className="!px-4 !py-1.5 text-xs" onClick={() => handleDeleteModule(mod._id)}>Delete</Button>
                             </div>
                           </div>
                        )}
                        
                        {/* Materials Section inside Module */}
                        <div className="p-8">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6 ml-12">Learning Materials</h4>
                          
                          {mod.materials?.length > 0 ? (
                            <ul className="ml-12 mb-8 space-y-4">
                              {mod.materials.map(mat => (
                                <li key={mat._id} className="flex justify-between items-start p-5 rounded-2xl ring-1 ring-outline-variant/15 bg-surface-container-lowest hover:ring-outline-variant/30 hover:shadow-sm transition-all duration-300 group">
                                  <div className="flex gap-4">
                                    <div className="mt-1">
                                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                      <a href={mat.fileUrl.startsWith('http') ? mat.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${mat.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-primary hover:underline">{mat.title}</a>
                                      {mat.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{mat.description}</p>}
                                      <p className="text-xs text-slate-400 mt-2 font-medium">{mat.fileName} • Uploaded {new Date(mat.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <button onClick={() => handleDeleteMaterial(mat._id)} className="text-slate-400 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-surface-container-low rounded-xl">
                                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500 italic ml-12 mb-8">No materials uploaded yet.</p>
                          )}

                          {/* Upload Material Form */}
                          <form onSubmit={(e) => handleUploadMaterial(mod._id, e)} className="ml-12 p-6 bg-surface-container-low/50 rounded-2xl ring-1 ring-outline-variant/20 border-dashed border">
                             <h4 className="text-sm font-bold text-on-surface mb-4">Upload Material</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                               <Input 
                                  placeholder="Document Title *" required 
                                  value={uploadState[mod._id]?.title || ''}
                                  onChange={e => setUploadState({...uploadState, [mod._id]: {...uploadState[mod._id], title: e.target.value}})}
                               />
                               <Input 
                                  placeholder="Short Description (Optional)" 
                                  value={uploadState[mod._id]?.desc || ''}
                                  onChange={e => setUploadState({...uploadState, [mod._id]: {...uploadState[mod._id], desc: e.target.value}})}
                               />
                             </div>
                             <div className="flex items-center gap-4">
                               <input 
                                  type="file" id={`file-${mod._id}`} required
                                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
                                  onChange={e => setUploadState({...uploadState, [mod._id]: {...uploadState[mod._id], file: e.target.files?.[0] || null}})}
                               />
                               <Button variant="primary" type="submit" className="px-8 whitespace-nowrap">Upload</Button>
                             </div>
                             <p className="text-xs text-slate-400 mt-4">Max 10MB. Allowed: pdf, doc, docx, ppt, pptx, txt, zip, png, jpg, jpeg</p>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Announcements */}
              <div className="space-y-6">
                 <h2 className="text-2xl font-bold tracking-tight text-on-surface">Announcements</h2>
                 
                 {/* Create Announcement */}
                 <form onSubmit={handleCreateAnnouncement} className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 flex flex-col gap-5">
                    <h3 className="text-base font-bold text-on-surface">Post New Announcement</h3>
                    <Input required placeholder="Announcement Title" value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} />
                    <textarea 
                       required placeholder="Write your message here..." rows={5}
                       className="w-full px-4 py-3 text-base bg-surface-container-lowest shadow-sm ring-1 ring-inset ring-outline-variant/15 outline-none transition-all duration-300 focus:ring-[4px] focus:ring-primary/40 hover:ring-outline-variant/30 rounded-xl"
                       value={newAnnMessage} onChange={e => setNewAnnMessage(e.target.value)}
                    />
                    <Button variant="primary" type="submit" className="w-full justify-center">Post Announcement</Button>
                 </form>

                 {/* Announcements List */}
                 {announcements.length === 0 ? (
                    <div className="bg-surface-container-lowest p-10 text-center shadow-ambient ring-1 ring-outline-variant/15 rounded-[2rem] text-slate-500 italic">No announcements posted yet.</div>
                 ) : (
                    <div className="space-y-4">
                      {announcements.map((ann) => (
                         <div key={ann._id} className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-ambient ring-1 ring-outline-variant/15 relative group">
                            {editAnnId === ann._id ? (
                               <div className="space-y-4">
                                 <Input defaultValue={ann.title} id={`edit-ann-title-${ann._id}`} />
                                 <textarea 
                                    defaultValue={ann.message} id={`edit-ann-msg-${ann._id}`} rows={4}
                                    className="w-full px-4 py-3 text-base bg-surface-container-lowest shadow-sm ring-1 ring-inset ring-outline-variant/15 outline-none transition-all duration-300 focus:ring-[4px] focus:ring-primary/40 hover:ring-outline-variant/30 rounded-xl"
                                 />
                                 <div className="flex gap-3">
                                    <Button variant="primary" className="!py-2" onClick={() => {
                                       const t = (document.getElementById(`edit-ann-title-${ann._id}`) as HTMLInputElement).value;
                                       const m = (document.getElementById(`edit-ann-msg-${ann._id}`) as HTMLInputElement).value;
                                       handleEditAnn(ann._id, t, m);
                                    }}>Save Changes</Button>
                                    <Button variant="secondary" className="!py-2" onClick={() => setEditAnnId(null)}>Cancel</Button>
                                 </div>
                               </div>
                            ) : (
                               <>
                                 <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditAnnId(ann._id)} className="p-2 text-slate-400 hover:text-primary rounded-xl bg-surface-container-low hover:bg-primary/10 transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteAnn(ann._id)} className="p-2 text-slate-400 hover:text-error rounded-xl bg-surface-container-low hover:bg-error/10 transition-colors">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                 </div>
                                 <h4 className="text-lg font-bold text-on-surface pr-16">{ann.title}</h4>
                                 <p className="text-xs text-primary font-medium mb-4 mt-2">
                                    {new Date(ann.createdAt).toLocaleDateString()} {ann.updatedAt !== ann.createdAt && '(Edited)'}
                                 </p>
                                 <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
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
