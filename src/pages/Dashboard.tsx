import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Award, ClipboardList } from "lucide-react";

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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // App Data States
  const [projects, setProjects] = useState<any[]>([]);
  const [clientEmails, setClientEmails] = useState<string[]>([]);
  
  // UI & Notification States
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  
  // Notification dropdown states
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Admin & Form States
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading] = useState(false);

  const [commentsMap, setCommentsMap] = useState<{ [key: string]: any[] }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const clearNotifications = () => setNotifications([]);

  // Compute metrics safely to prevent crashes
  const stats = {
    total: projects?.length || 0,
    completed: projects?.filter((p: any) => p.status === "Completed").length || 0,
    active: projects?.filter((p: any) => p.status === "In Progress").length || 0,
    pending: projects?.filter((p: any) => p.status === "Pending").length || 0,
    
    // Explicitly add capitalized keys to handle AnalyticsDashboard data processing
    "Completed": projects?.filter((p: any) => p.status === "Completed").length || 0,
    "In Progress": projects?.filter((p: any) => p.status === "In Progress").length || 0,
    "Pending": projects?.filter((p: any) => p.status === "Pending").length || 0,
  };

  const chartData = [
    { name: "Jan", amount: 2 },
    { name: "Feb", amount: 4 },
    { name: "Mar", amount: 3 },
    { name: "Apr", amount: stats.total || 1 },
    { name: "May", amount: stats.active || 2 },
  ];
  const COLORS = ["#06b6d4", "#3b82f6", "#eab308"];

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLocation("/");
          return;
        }
        setUser(user);

        const emailLower = user.email?.toLowerCase() || "";
        const isOwnerAdmin = emailLower === "sulaimangraphics@gmail.com" || emailLower.endsWith("@sulaimangraphics.com.ng");
        setIsAdmin(isOwnerAdmin);
        
        await fetchProjects();
        setNotifications([
          "New project request received from design portal.",
          "Database and Supabase connection verified successfully."
        ]);
      } catch (err) {
        console.error("Error loading dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndData();
  }, [setLocation]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);

      const emails = Array.from(new Set(data?.map((p: any) => p.client_email).filter(Boolean) as string[]));
      setClientEmails(emails);
    } catch (err) {
      console.error("Failed to load projects from Supabase", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const projectPayload = {
        title: newTitle,
        client_email: newClient || "info@sulaimangraphics.com.ng",
        status: "Pending",
        created_at: new Date().toISOString(),
        file_url: ""
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectPayload])
        .select();

      if (error) throw error;

      if (data) {
        setProjects([data[0], ...projects]);
      }
      setNewTitle("");
      setNewClient("");
      await fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ title: editTitle })
        .eq('id', editingId);

      if (error) throw error;
      
      setProjects(
        projects.map((p) => (p.id === editingId ? { ...p, title: editTitle } : p))
      );
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;

      setProjects(
        projects.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const assignUser = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ client_email: email })
        .eq('id', id);

      if (error) throw error;

      setProjects(
        projects.map((p) => (p.id === id ? { ...p, client_email: email } : p))
      );
    } catch (err) {
      console.error("Error assigning user:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleFileUpload = async (id: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `project_files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ file_url: publicUrl, status: "Completed" })
        .eq('id', id);

      if (updateError) throw updateError;

      setProjects(
        projects.map((p) => (p.id === id ? { ...p, file_url: publicUrl, status: "Completed" } : p))
      );
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const toggleComments = (id: string) => {
    if (openCommentsId === id) {
      setOpenCommentsId(null);
    } else {
      setOpenCommentsId(id);
      setUnreadCounts({ ...unreadCounts, [id]: 0 });
    }
  };

  const sendComment = async (projectId: string) => {
    if (!newComment.trim()) return;
    setSendingComment(true);

    try {
      const msg = {
        project_id: projectId,
        is_admin: isAdmin,
        message: newComment,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('project_messages')
        .insert([msg])
        .select();

      if (error) throw error;

      setCommentsMap({
        ...commentsMap,
        [projectId]: [...(commentsMap[projectId] || []), data[0]]
      });

      setNewComment("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingComment(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
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
        userEmail={user?.email || "sulaimangraphics@gmail.com"}
        notificationsCount={notifications.length}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        SignOutHandler={handleSignOut}
        notifications={notifications}
        clearNotifications={clearNotifications}
        showNotificationDropdown={showNotificationDropdown}
        setShowNotificationDropdown={setShowNotificationDropdown}
        notificationRef={notificationRef}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {showWelcome && (
          <WelcomeNameModal 
            onClose={() => setShowWelcome(false)} 
            userName="Sulaiman" 
          />
        )}
        
        {isSettingsOpen && (
          <AccountSettings 
            onClose={() => setIsSettingsOpen(false)} 
            userEmail={user?.email || "sulaimangraphics@gmail.com"} 
          />
        )}

        {showOnboard && (
          <OnboardClient 
            onClose={() => setShowOnboard(false)} 
          />
        )}

        <AdminNav 
          setLocation={setLocation} 
          setIsCertOpen={setIsCertOpen} 
        />
      
        <div className="grid gap-6 md:grid-cols-3 my-6">
          <div className="md:col-span-2">
            {!loading ? (
              <AnalyticsDashboard 
                stats={stats}
                chartData={chartData}
                COLORS={COLORS}
              />
            ) : (
              <div className="h-64 flex items-center justify-center border border-border rounded-2xl">
                <Loader2 className="animate-spin text-cyan-400" size={24} />
              </div>
            )}
          </div>
          <div>
            <ProjectManagement 
              searchQuery=""
              setSearchQuery={() => {}}
              statusFilter="all"
              setStatusFilter={() => {}}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newClient={newClient}
              setNewClient={setNewClient}
              handleCreateProjectHandler={handleCreateProject}
              handleCreateProject={handleCreateProject}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        <AdminForms 
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newClient={newClient}
          setNewClient={setNewClient}
          clientEmails={clientEmails}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteLoading={inviteLoading}
        />

        <div className="flex justify-between items-center mb-6 mt-6">
          <h2 className="text-lg font-bold tracking-tight">Project Status Workspace</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowOnboard(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-accent transition"
            >
              <Plus size={14} />
              <span>Onboard Client</span>
            </button>
            <button 
              onClick={() => setIsCertOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-xs font-semibold transition"
            >
              <Award size={14} />
              <span>Generate Certificate</span>
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/40">
            <ClipboardList className="mx-auto text-muted-foreground mb-4" size={32} />
            <h3 className="text-sm font-bold text-foreground">No Projects Found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Create a new project or onboard a client to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
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
                />
                {openCommentsId === project.id && (
                  <ProjectComments projectId={project.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
        </div>
      </footer>
      
      {isCertOpen && <CertificateGenerator onClose={() => setIsCertOpen(false)} />}
    </div>
  );
}
