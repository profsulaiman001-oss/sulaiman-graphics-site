import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings, X, 
  MessageSquare, Send, ClipboardList, Award, BarChart3, Maximize2, ShieldCheck, ShieldAlert
} from "lucide-react";

// Component Imports
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import AccountSettings from "@/components/dashboard/AccountSettings";
import { AdminForms } from "@/components/dashboard/AdminForms";
import { AdminNav } from "@/components/dashboard/AdminNav";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { OnboardClient } from "@/components/dashboard/OnboardClient";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ProjectComments } from "@/components/dashboard/ProjectComments";
import { ProjectManagement } from "@/components/dashboard/ProjectManagement";
import WelcomeNameModal from "@/components/dashboard/WelcomeNameModal";
import { CertificateGenerator } from "./components/certificates/CertificateGenerator";

// Page Imports for Client Buttons
import Questionnaire from "@/pages/Questionnaire";
import Agreement from "@/pages/Agreement";

// Fixed imports for Admin usage
import Receipt from "./Receipt";
import Invoice from "./Invoice";
import ViewQuestionnaires from "./ViewQuestionnaires"; 

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(true);

  // App Data States
  const [projects, setProjects] = useState<any[]>([]);
  const [clientEmails, setClientEmails] = useState<string[]>([]);
  const [commentsMap, setCommentsMap] = useState<{ [key: string]: any[] }>({});
  const [versionsMap, setVersionsMap] = useState<{ [key: string]: any[] }>({});
  const [mockupsMap, setMockupsMap] = useState<{ [key: string]: any[] }>({}); 
  const [notifications, setNotifications] = useState<string[]>([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  // PREVIEW & RESTRICTION STATES
  const [viewingFile, setViewingFile] = useState<{url: string, name: string, restricted: boolean} | null>(null);

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'In Progress': 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    'Completed': 'bg-green-500/10 border-green-500/20 text-green-500'
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLocation("/login");
        return;
      }
      setUser(user);
      const adminStatus = user.email === "profsulaiman001@gmail.com";
      setIsAdmin(adminStatus);
      fetchProjects(user, adminStatus);
      if (adminStatus) fetchClientEmails();
    };
 
    initializeDashboard();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const newMsg = payload.new;
          if (openCommentsId !== newMsg.project_id) {
            setUnreadCounts(prev => ({
              ...prev,
              [newMsg.project_id]: (prev[newMsg.project_id] || 0) + 1
            }));
          }
          setCommentsMap((prev) => {
            const currentMsgs = prev[newMsg.project_id] || [];
            if (currentMsgs.find(m => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [newMsg.project_id]: [...currentMsgs, newMsg],
            };
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [openCommentsId]);

  const fetchProjects = async (currentUser: any, admin: boolean) => {
    setLoading(true);
    try {
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (!admin) query = query.eq("client_email", currentUser.email);
      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
      
      if (data) {
        data.forEach(project => {
          fetchVersions(project.id);
          fetchMockups(project.id);
          fetchInitialUnreadCount(project.id, admin);
        });
      }
    } catch (err: any) {
      console.error("Fetch projects error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMockups = async (projectId: string) => {
    const { data, error } = await supabase
      .from("project_mockups")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setMockupsMap(prev => ({ ...prev, [projectId]: data }));
    }
  };

  const fetchInitialUnreadCount = async (projectId: string, admin: boolean) => {
    try {
      const { count, error } = await supabase
        .from("comments")
        .select('*', { count: 'exact', head: true })
        .eq("project_id", projectId)
        .eq("is_admin", !admin); 

      if (!error && count !== null) {
        setUnreadCounts(prev => ({ ...prev, [projectId]: count }));
      }
    } catch (err) {
      console.error("Unread count fetch error:", err);
    }
  };

  const fetchVersions = async (projectId: string) => {
    const { data, error } = await supabase
      .from("project_versions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setVersionsMap(prev => ({ ...prev, [projectId]: data }));
    }
  };

  const fetchClientEmails = async () => {
    try {
      const { data: profileData } = await supabase.from("profiles").select("email");
      const { data: projectData } = await supabase.from("projects").select("client_email");
      const combined = Array.from(new Set([
        ...(profileData?.map(p => p.email) || []),
        ...(projectData?.map(p => p.client_email) || [])
      ])).filter(Boolean) as string[];
      setClientEmails(combined);
    } catch (err) {
      console.error("Could not fetch client list:", err);
    }
  };

  const toggleComments = async (id: string) => {
    if (openCommentsId !== id) {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true });
      if (!error && data) {
        setCommentsMap(prev => ({ ...prev, [id]: data }));
      }
    }
    setOpenCommentsId(openCommentsId === id ? null : id);
    setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const sendComment = async (projectId: string) => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    const { error } = await supabase.from("comments").insert([{
      project_id: projectId,
      is_admin: isAdmin,
      message: newComment.trim(),
      user_id: user.id
    }]);
    if (!error) {
      setNewComment("");
    }
    setSendingComment(false);
  };

  // ADMIN TOGGLE: Control Download Access
  const toggleProjectRestriction = async (projectId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("projects")
      .update({ allow_download: !currentStatus })
      .eq("id", projectId);
    
    if (!error) fetchProjects(user, isAdmin);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !isAdmin) return;
    try {
      const { error } = await supabase.from("projects").insert([{
        title: newTitle.trim(),
        client_email: newClient || null,
        status: "Pending",
        user_id: user.id,
        allow_download: false // Default to watermarked/restricted
      }]);
      if (error) throw error;
      setNewTitle("");
      setNewClient("");
      fetchProjects(user, isAdmin);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !isAdmin) return;
    setInviteLoading(true);
    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Invite failed.");
      setClientEmails(prev => Array.from(new Set([...prev, inviteEmail])));
      setInviteEmail("");
      alert(`Invitation sent!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const startEdit = (project: any) => { if(isAdmin) { setEditingId(project.id); setEditTitle(project.title); } };

  const saveEdit = async () => {
    if (!editingId || !isAdmin) return;
    const { error } = await supabase.from("projects").update({ title: editTitle }).eq("id", editingId);
    if (!error) { setEditingId(null); fetchProjects(user, isAdmin); }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
  };

  const assignUser = async (id: string, email: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("projects").update({ client_email: email }).eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !confirm("Delete project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase.from("project_versions").delete().eq("id", versionId);
      if (error) throw error;
      projects.forEach(p => fetchVersions(p.id));
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    if (!isAdmin) return;
    const versionName = prompt("Enter a name for this version (e.g., Draft 1, Final):") || "New Version";
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;
      const filePath = `previews/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
      
      const { error: versionError } = await supabase.from("project_versions").insert([{
        project_id: id,
        file_url: publicUrl,
        version_name: versionName
      }]);
      if (versionError) throw versionError;

      const { error: dbError } = await supabase.from("projects").update({ 
        status: "Completed",
        file_url: publicUrl 
      }).eq("id", id);
      if (dbError) throw dbError;
      
      fetchProjects(user, isAdmin);
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockupUpload = async (id: string, files: FileList) => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `mockup-${id}-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const filePath = `mockups/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
        return supabase.from("project_mockups").insert([{
          project_id: id,
          file_url: publicUrl
        }]);
      });
      await Promise.all(uploadPromises);
      fetchMockups(id);
      alert(`${files.length} mockups uploaded successfully!`);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename || 'design-file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const openProtectedPreview = (url: string, name: string, isRestricted: boolean) => {
    setViewingFile({ url, name, restricted: isRestricted });
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.client_email && p.client_email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "Completed").length,
    active: projects.filter((p) => p.status === "In Progress").length,
    pending: projects.filter((p) => p.status === "Pending").length,
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={24} />
        <p className="text-xs font-medium tracking-wider uppercase">Loading Workspace Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader 
        userEmail={user?.email || "User"}
        notificationsCount={notifications.length}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        SignOutHandler={handleSignOut}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {showWelcome && <WelcomeNameModal onClose={() => setShowWelcome(false)} userName={isAdmin ? "Sulaiman" : "Client"} />}
  
        {isSettingsOpen && <AccountSettings onClose={() => setIsSettingsOpen(false)} userEmail={user?.email} />}

        <div className="mb-8">
           <AnalyticsDashboard stats={stats} COLORS={["#06b6d4", "#3b82f6", "#eab308"]} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <ProjectManagement 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newClient={newClient}
              setNewClient={setNewClient}
              handleCreateProject={handleCreateProject}
              isAdmin={isAdmin} 
            />

            {!isAdmin && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveOverlay('questionnaire')}
                  className="flex items-center justify-center gap-2 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-all text-cyan-400 font-bold text-sm"
                >
                  <ClipboardList size={18} />
                  Fill Questionnaire
                </button>
                <button
                  onClick={() => setActiveOverlay('agreement')}
                  className="flex items-center justify-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all text-blue-400 font-bold text-sm"
                >
                  <Award size={18} />
                  Sign Agreement
                </button>
              </div>
            )}

            {isAdmin && (
              <OnboardClient 
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                handleInviteClient={handleInviteClient}
                loading={inviteLoading}
              />
            )}
          </div>

          {isAdmin && (
            <div>
              <div className="bg-card/30 border border-border/50 p-4 rounded-2xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
                <AdminNav 
                  setLocation={setLocation} 
                  setIsCertOpen={setIsCertOpen} 
                  setActiveOverlay={setActiveOverlay} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">
            {isAdmin ? "Project Status Workspace" : "Your Active Projects"}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: any) => (
              <div key={project.id} className="flex flex-col gap-3">
                {/* Project Card Internalized to handle specific Expand/Restrict UI */}
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <p className="text-xs text-muted-foreground">{project.client_email}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full border font-bold uppercase ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-dashed border-border">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Download Access</span>
                      <button 
                        onClick={() => toggleProjectRestriction(project.id, project.allow_download)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all text-[11px] font-bold ${project.allow_download ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                      >
                        {project.allow_download ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                        {project.allow_download ? "ENABLED" : "RESTRICTED"}
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Designs</p>
                    {versionsMap[project.id]?.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between bg-background p-2 rounded-lg border border-border">
                        <span className="text-xs font-medium truncate max-w-[120px]">{v.version_name}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openProtectedPreview(v.file_url, v.version_name, !project.allow_download)}
                            className="p-2 bg-muted hover:bg-cyan-500/10 hover:text-cyan-400 rounded-md transition-colors"
                          >
                            <Maximize2 size={14} />
                          </button>
                          
                          {(project.allow_download || isAdmin) && (
                            <button 
                              onClick={() => downloadFile(v.file_url, v.version_name)}
                              className="p-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isAdmin && (
                      <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors">
                        <Plus size={14} /> <span className="text-xs font-bold">Upload Version</span>
                        <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(project.id, e.target.files[0])} />
                      </label>
                    )}
                  </div>

                  <ProjectCard 
                    project={project}
                    isAdmin={isAdmin}
                    editingId={editingId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    setEditingId={setEditingId}
                    updateStatus={updateStatus}
                    assignUser={assignUser}
                    handleDelete={handleDelete}
                    handleFileUpload={handleFileUpload}
                    toggleComments={toggleComments}
                    openCommentsId={openCommentsId}
                    comments={commentsMap[project.id] || []}
                    versions={[]} // Versions handled manually above for custom UI
                    mockups={mockupsMap[project.id] || []}
                    handleMockupUpload={handleMockupUpload}
                    handleDeleteVersion={handleDeleteVersion}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    sendingComment={sendingComment}
                    sendComment={sendComment}
                    unreadCounts={unreadCounts}
                    clientEmails={clientEmails}
                    downloadFile={downloadFile}
                    statusColors={statusColors}
                  />
                </div>
                {openCommentsId === project.id && <ProjectComments projectId={project.id} />}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FULL SCREEN EXPAND PREVIEW - WITH WATERMARK & BLOCK DOWNLOAD */}
      <AnimatePresence>
        {viewingFile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10"
            onContextMenu={(e) => viewingFile.restricted && e.preventDefault()}
          >
            <div className="absolute top-5 right-5 flex gap-4">
              {!viewingFile.restricted && (
                <button onClick={() => downloadFile(viewingFile.url, viewingFile.name)} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-full font-bold text-sm">
                  <Download size={18}/> Download
                </button>
              )}
              <button onClick={() => setViewingFile(null)} className="p-3 bg-white/10 hover:bg-red-500/50 text-white rounded-full transition-colors"><X size={24}/></button>
            </div>

            <div className="relative max-w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
              <img 
                src={viewingFile.url} 
                alt="Design Preview" 
                className="max-w-full max-h-full object-contain pointer-events-none select-none" 
              />
              
              {viewingFile.restricted && (
                <div className="absolute inset-0 flex flex-wrap items-center justify-center opacity-[0.08] pointer-events-none select-none overflow-hidden">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span key={i} className="text-white font-black text-5xl -rotate-45 m-12 whitespace-nowrap uppercase tracking-[1em]">
                      SULAIMAN GRAPHICS • PREVIEW ONLY
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-6 text-white/60 text-sm font-medium tracking-wide uppercase">{viewingFile.name}</p>
          </motion.div>
        )}

        {activeOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-card border-x border-border/50 w-full h-full max-w-7xl relative shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-50">
                <h2 className="text-lg font-bold capitalize tracking-tight">{activeOverlay} Details</h2>
                <button onClick={() => setActiveOverlay(null)} className="p-2 bg-muted/50 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar mx-auto w-full max-w-4xl">
                  {activeOverlay === 'receipt' && <Receipt />}
                  {activeOverlay === 'invoice' && <Invoice />}
                  {activeOverlay === 'questionnaires' && <ViewQuestionnaires />}
                  {activeOverlay === 'questionnaire' && <Questionnaire />}
                  {activeOverlay === 'agreement' && <Agreement />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
        </div>
      </footer>
      
      {isCertOpen && <CertificateGenerator onClose={() => setIsCertOpen(false)} />}
    </div>
  );
}
