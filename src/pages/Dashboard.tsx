import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Loader2, X, ClipboardList
} from "lucide-react";

// Component Imports
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import AccountSettings from "@/components/dashboard/AccountSettings";
import { AdminNav } from "@/components/dashboard/AdminNav";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { OnboardClient } from "@/components/dashboard/OnboardClient";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ProjectComments } from "@/components/dashboard/ProjectComments";
import { ProjectManagement } from "@/components/dashboard/ProjectManagement";
import WelcomeNameModal from "@/components/dashboard/WelcomeNameModal";
import { CertificateGenerator } from "./components/certificates/CertificateGenerator";

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
  const [notifications, setNotifications] = useState<string[]>([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  // UPDATED: Added 'Awaiting Review' status colors
  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'In Progress': 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    'Awaiting Review': 'bg-purple-500/10 border-purple-500/20 text-purple-500',
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

  const fetchProjects = async (currentUser: any, admin: boolean) => {
    setLoading(true);
    try {
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (!admin) query = query.eq("client_email", currentUser.email);
      
      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error("Fetch projects error:", err.message);
    } finally {
      setLoading(false);
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
    // UPDATED: Clients can now update status if they are approving an "Awaiting Review" project
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

  const handleFileUpload = async (id: string, file: File) => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;
      const filePath = `previews/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // UPDATED: Status now changes to "Awaiting Review" instead of "Completed"
      const { error: dbError } = await supabase
        .from("projects")
        .update({ 
          file_url: publicUrl, 
          status: "Awaiting Review" 
        })
        .eq("id", id);

      if (dbError) throw dbError;
      fetchProjects(user, isAdmin);
    } catch (err: any) {
      console.error("Upload failed:", err.message);
      alert("Error uploading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (id: string) => {
    setOpenCommentsId(openCommentsId === id ? null : id);
    setUnreadCounts({ ...unreadCounts, [id]: 0 });
  };

  const sendComment = async (projectId: string) => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    const { error } = await supabase.from("comments").insert([{
      project_id: projectId,
      is_admin: isAdmin,
      message: newComment,
      user_id: user.id
    }]);
    if (!error) setNewComment("");
    setSendingComment(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
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
    active: projects.filter((p) => p.status === "In Progress" || p.status === "Awaiting Review").length,
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
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/40">
              <ClipboardList className="mx-auto text-muted-foreground mb-4" size={32} />
              <h3 className="text-sm font-bold text-foreground">No Projects Found</h3>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project: any) => (
                <div key={project.id} className="flex flex-col gap-3">
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
                    newComment={newComment}
                    setNewComment={setNewComment}
                    sendingComment={sendingComment}
                    sendComment={sendComment}
                    unreadCounts={unreadCounts}
                    clientEmails={clientEmails}
                    downloadFile={downloadFile}
                    statusColors={statusColors}
                  />
                  {openCommentsId === project.id && (
                    <ProjectComments projectId={project.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
}
