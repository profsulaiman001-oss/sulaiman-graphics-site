import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings, X, 
  MessageSquare, Send, ClipboardList, Award, BarChart3
} from "lucide-react";

// Storage Utility Import
import { uploadToGitHubStorage } from "@/utils/uploader";

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
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Premium Chat Application Page Route Import
import ChatPage from "@/pages/chat.tsx";

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
  const [versionsMap, setVersionsMapState] = useState<{ [key: string]: any[] }>({});
  const [mockupsMap, setMockupsMap] = useState<{ [key: string]: any[] }>({});
  const [notifications, setNotifications] = useState<string[]>([]);

  // UI States
  const [activeSection, setActiveSection] = useState("projects");
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

  // Notification UI States
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

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
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime-comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const newMsg = payload.new;
          const senderLabel = newMsg.is_admin ? "Admin" : "Client";
          const notifyText = `New message from ${senderLabel}: "${newMsg.message.substring(0, 30)}${newMsg.message.length > 30 ? '...' : ''}"`;
          setNotifications(prev => [notifyText, ...prev]);

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

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [openCommentsId]);

  const clearNotifications = () => {
    setNotifications([]);
  };

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
      setVersionsMapState(prev => ({ ...prev, [projectId]: data }));
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !isAdmin) return;
    try {
      const { error } = await supabase.from("projects").insert([{
        title: newTitle.trim(),
        client_email: newClient || null,
        status: "Pending",
        user_id: user.id
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
    const { error = null } = await supabase.from("projects").update({ status }).eq("id", id);
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
    try {
      const { error } = await supabase
        .from("project_versions")
        .delete()
        .eq("id", versionId);
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
      const directCdnUrl = await uploadToGitHubStorage(file, 'deliverables');
      const { error: versionError } = await supabase.from("project_versions").insert([{
        project_id: id,
        file_url: directCdnUrl,
        version_name: versionName
      }]);
      if (versionError) throw versionError;

      const { error: dbError } = await supabase.from("projects").update({ 
        status: "Completed",
        file_url: directCdnUrl 
      }).eq("id", id);
      if (dbError) throw dbError;
      
      fetchProjects(user, isAdmin);
      alert("Deliverable file successfully committed to GitHub Storage array!");
    } catch (err: any) {
      console.error("Upload failed:", err.message);
      alert("Error uploading file to storage array: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockupUpload = async (id: string, files: FileList) => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        const directCdnUrl = await uploadToGitHubStorage(file, 'products');
        return supabase.from("project_mockups").insert([{
          project_id: id,
          file_url: directCdnUrl
        }]);
      });
      await Promise.all(uploadPromises);
      fetchMockups(id);
      alert(`${files.length} mockups uploaded successfully to GitHub storage!`);
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
      window.open(url, '_blank');
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response error during download");
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
      console.error("Secure download sequence fallback triggered:", error);
    }
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

  const COLORS = ["#06b6d4", "#3b82f6", "#eab308"];

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={24} />
        <p className="text-xs font-medium tracking-wider uppercase">Loading Workspace Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative w-full overflow-x-hidden">
      <DashboardHeader 
        userEmail={user?.email || "User"}
        notificationsCount={notifications.length}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        SignOutHandler={handleSignOut}
        notifications={notifications}
        clearNotifications={clearNotifications}
        showNotificationDropdown={showNotificationDropdown}
        setShowNotificationDropdown={setShowNotificationDropdown}
        notificationRef={notificationRef}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAdmin={isAdmin}
      />

      {/* pb-36 padding keeps layout content from getting blocked by floating bottom navigation elements */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl pb-36 w-full">
        {showWelcome && <WelcomeNameModal onClose={() => setShowWelcome(false)} userName={isAdmin ? "Sulaiman" : "Client"} />}
  
        {isSettingsOpen && <AccountSettings onClose={() => setIsSettingsOpen(false)} userEmail={user?.email} />}

        {/* SECTION ONE: PROJECTS HUD */}
        {activeSection === "projects" && (
          <>
            <div className="mb-8">
               <AnalyticsDashboard stats={stats} COLORS={COLORS} />
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

            <div className="mt-12 w-full">
              <h2 className="text-xl font-bold tracking-tight mb-6">
                {isAdmin ? "Project Status Workspace" : "Your Active Projects"}
              </h2>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/40">
                  <ClipboardList className="mx-auto text-muted-foreground mb-4" size={32} />
                  <h3 className="text-sm font-bold text-foreground">No Projects Found</h3>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center items-stretch w-full">
                  {filteredProjects.map((project: any) => (
                    <div key={project.id} className="w-full flex flex-col">
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
                        versions={versionsMap[project.id] || []}
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
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* SECTION TWO: PREMIUM LIVE CUSTOM CHAT PAGE COMPONENT */}
        {activeSection === "chat" && (
          <div className="w-full min-h-[50vh] bg-card/10 border border-border/50 rounded-2xl overflow-hidden p-2">
            <ChatPage />
          </div>
        )}

        {/* SECTION THREE: PAYMENTS HUB */}
        {activeSection === "billing" && (
          <div className="min-h-[50vh] border border-dashed border-border/60 bg-card/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <BarChart3 size={36} className="text-cyan-400 mb-2 animate-pulse" />
            <h3 className="text-base font-bold text-foreground">Ledger & Statements Panel</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Your billing logs, payment tokens, and invoice balance processing sheets are managed securely here.
            </p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {activeOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card border-x border-border/50 w-full h-full max-w-7xl relative shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-50">
                <h2 className="text-lg font-bold capitalize tracking-tight">{activeOverlay} Details</h2>
                <button 
                  onClick={() => setActiveOverlay(null)} 
                  className="p-2 bg-muted/50 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                <div className="mx-auto max-w-4xl">
                  {activeOverlay === 'receipt' && <Receipt />}
                  {activeOverlay === 'invoice' && <Invoice />}
                  {activeOverlay === 'questionnaires' && <ViewQuestionnaires />}
                  {activeOverlay === 'questionnaire' && <Questionnaire />}
                  {activeOverlay === 'agreement' && <Agreement />}
                </div>
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

      {/* BOTTOM FIXED RECTANGULAR NAVIGATION COMPONENT */}
      <DashboardNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isAdmin={isAdmin} 
      />
    </div>
  );
}
