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
  const [isAdmin, setIsAdmin] = useState(true); 
  const [loading, setLoading] = useState(true);
  
  // App Data States
  const [projects, setProjects] = useState<any[]>([
    { 
      id: "1", 
      title: "Brand Identity", 
      client_email: "client@sulaimangraphics.com.ng", 
      status: "In Progress", 
      created_at: new Date().toISOString(), 
      file_url: "" 
    },
    { 
      id: "2", 
      title: "Packaging Mockup", 
      client_email: "info@sulaimangraphics.com.ng", 
      status: "Completed", 
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(), 
      file_url: "" 
    }
  ]);

  const [clientEmails] = useState<string[]>([
    "client@sulaimangraphics.com.ng",
    "info@sulaimangraphics.com.ng",
    "hello@example.com"
  ]);

  const [commentsMap, setCommentsMap] = useState<{ [key: string]: any[] }>({
    "1": [
      {
        id: "m1",
        project_id: "1",
        is_admin: false,
        message: "Hi, I have sent the brand assets. Let me know when you start.",
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "m2",
        project_id: "1",
        is_admin: true,
        message: "Received! Working on the initial layout design now.",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({ "1": 1 });

  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [notifications, setNotifications] = useState<string[]>([
    "Project request received from dashboard portal.",
    "System data initialized and ready."
  ]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'In Progress': 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    'Completed': 'bg-green-500/10 border-green-500/20 text-green-500'
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser({ email: "sulaimangraphics@gmail.com", id: "user-test" });
        setIsAdmin(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.client_email?.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleSignOut = async () => setLocation("/");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const createdProject = {
      id: Date.now().toString(),
      title: newTitle,
      client_email: newClient || "info@sulaimangraphics.com.ng",
      status: "Pending",
      created_at: new Date().toISOString(),
      file_url: ""
    };
    setProjects([...projects, createdProject]);
    setNewTitle("");
    setNewClient("");
  };

  // RESTORED: Functional onboarding logic using your original /api/onboard endpoint
  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send portal invite.");
      }

      setNotifications(prev => [result.message, ...prev]);
      setInviteEmail(""); 
      alert(`Invitation successfully sent to ${inviteEmail}`);

    } catch (err: any) {
      console.error("Onboarding error:", err);
      alert(err.message || "An error occurred while sending the invite.");
    } finally {
      setInviteLoading(false);
    }
  };

  const startEdit = (project: any) => { setEditingId(project.id); setEditTitle(project.title); };
  const saveEdit = () => {
    if (!editingId) return;
    setProjects(projects.map((p) => (p.id === editingId ? { ...p, title: editTitle } : p)));
    setEditingId(null);
    setEditTitle("");
  };

  const updateStatus = (id: string, status: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const assignUser = (id: string, email: string) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, client_email: email } : p)));
  };

  const handleDelete = (id: string) => setProjects(projects.filter((p) => p.id !== id));

  const handleFileUpload = (id: string, file: File) => {
    const fakeUrl = URL.createObjectURL(file);
    setProjects(projects.map((p) => (p.id === id ? { ...p, file_url: fakeUrl, status: "Completed" } : p)));
  };

  const toggleComments = (id: string) => {
    setOpenCommentsId(openCommentsId === id ? null : id);
    setUnreadCounts({ ...unreadCounts, [id]: 0 });
  };

  const sendComment = (projectId: string) => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    const msg = {
      id: Date.now().toString(),
      project_id: projectId,
      is_admin: isAdmin,
      message: newComment,
      created_at: new Date().toISOString()
    };
    setCommentsMap({ ...commentsMap, [projectId]: [...(commentsMap[projectId] || []), msg] });
    setNewComment("");
    setSendingComment(false);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
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
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {showWelcome && <WelcomeNameModal onClose={() => setShowWelcome(false)} userName="Sulaiman" />}
        {isSettingsOpen && <AccountSettings onClose={() => setIsSettingsOpen(false)} userEmail={user?.email} />}

        {/* 1, 2, 3: STATS & CHARTS */}
        <div className="mb-8">
           <AnalyticsDashboard stats={stats} chartData={chartData} COLORS={COLORS} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Management Tools */}
          <div className="md:col-span-2 space-y-6">
            {/* 4 & 5: SEARCH & ADD NEW PROJECT */}
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

            {/* Layout Preserved: Onboard Client box positioned directly below Project Management */}
            <OnboardClient 
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              handleInviteClient={handleInviteClient}
              loading={inviteLoading}
            />
          </div>

          {/* Right Column: Quick Buttons & Navigation */}
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

        {/* Hidden Admin Forms logic */}
        <div className="mt-4 opacity-0 pointer-events-none h-0">
            <AdminForms 
            newTitle={newTitle} setNewTitle={setNewTitle}
            newClient={newClient} setNewClient={setNewClient}
            clientEmails={clientEmails} inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail} inviteLoading={inviteLoading}
          />
        </div>

        {/* 8: PROJECT CARDS FOR CLIENTS */}
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
