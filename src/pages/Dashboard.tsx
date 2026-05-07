import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings, X, 
  MessageSquare, Send, ClipboardList, Award, BarChart3
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

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'In Progress': 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    'Completed': 'bg-green-500/10 border-green-500/20 text-green-500'
  };

  // 1. Initialize Auth and Fetch Data
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
      fetchClientEmails(); // Modified to fetch permanent data
    };
    initializeDashboard();
  }, []);

  // 2. Fetch Projects from Supabase
  const fetchProjects = async (currentUser: any, admin: boolean) => {
    setLoading(true);
    try {
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      
      if (!admin) {
        query = query.eq("client_email", currentUser.email);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error("Fetch projects error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. SURGICAL FIX: Fetch list from both tables to ensure persistence
  const fetchClientEmails = async () => {
    try {
      // Get emails from registered profiles
      const { data: profileData } = await supabase.from("profiles").select("email");
      
      // Get emails from projects (catches emails assigned but not yet registered)
      const { data: projectData } = await supabase.from("projects").select("client_email");
      
      const profileEmails = profileData?.map(p => p.email) || [];
      const projectEmails = projectData?.map(p => p.client_email) || [];
      
      // Combine, filter out nulls, and remove duplicates
      const allEmails = Array.from(new Set([...profileEmails, ...projectEmails])).filter(Boolean) as string[];
      setClientEmails(allEmails);
    } catch (err) {
      console.error("Could not fetch permanent client list:", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
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
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Invite failed.");

      setNotifications(prev => [result.message, ...prev]);
      
      // Immediately update local state for smooth UX
      setClientEmails(prev => Array.from(new Set([...prev, inviteEmail])));
      
      setInviteEmail(""); 
      alert(`Invitation sent! ${inviteEmail} can now be assigned to projects.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const startEdit = (project: any) => { setEditingId(project.id); setEditTitle(project.title); };
  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("projects").update({ title: editTitle }).eq("id", editingId);
    if (!error) { setEditingId(null); fetchProjects(user, isAdmin); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
  };

  const assignUser = async (id: string, email: string) => {
    const { error } = await supabase.from("projects").update({ client_email: email }).eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
  };

  const handleFileUpload = async (id: string, file: File) => {
    const fakeUrl = URL.createObjectURL(file);
    const { error } = await supabase.from("projects").update({ file_url: fakeUrl, status: "Completed" }).eq("id", id);
    if (!error) fetchProjects(user, isAdmin);
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
    if (!error) {
      setNewComment("");
    }
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
    active: projects.filter((p) => p.status === "In Progress").length,
    pending: projects.filter((p) => p.status === "Pending").length,
  };

  const chartData = [
    { name: "Jan", amount: 2 },
    { name: "Feb", amount: 4 },
    { name: "Mar", amount: 3 },
    { name: "Apr", amount: stats.total || 1 },
    { name: "May", amount: stats.active || 2 },
  ];
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
        userEmail={user?.email || "sulaimangraphics@gmail.com"}
        notificationsCount={notifications.length}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        SignOutHandler={handleSignOut}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {showWelcome && <WelcomeNameModal onClose={() => setShowWelcome(false)} userName="Sulaiman" />}
        {isSettingsOpen && <AccountSettings onClose={() => setIsSettingsOpen(false)} userEmail={user?.email} />}

        <div className="mb-8">
           <AnalyticsDashboard stats={stats} chartData={chartData} COLORS={COLORS} />
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

            <OnboardClient 
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              handleInviteClient={handleInviteClient}
              loading={inviteLoading}
            />
          </div>

          <div>
            <div className="bg-card/30 border border-border/50 p-4 rounded-2xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
              <button 
                onClick={() => setIsCertOpen(true)} 
                className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-xs font-bold transition mb-6"
              >
                <Award size={16} /> <span>Generate Certificate</span>
              </button>

              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-bold border-t border-border pt-4">Studio Tools</p>
              <AdminNav />
            </div>
          </div>
        </div>

        <div className="mt-4 opacity-0 pointer-events-none h-0">
            <AdminForms 
            newTitle={newTitle} setNewTitle={setNewTitle}
            newClient={newClient} setNewClient={setNewClient}
            clientEmails={clientEmails} inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail} inviteLoading={inviteLoading}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">Project Status Workspace</h2>
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

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
        </div>
      </footer>
      
      {isCertOpen && <CertificateGenerator onClose={() => setIsCertOpen(false)} />}
    </div>
  );
}
