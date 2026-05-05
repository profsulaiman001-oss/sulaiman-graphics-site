import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, Bell, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings, X, Mail, 
  UserCheck, MessageSquare, ShoppingBag, Send, FileText, 
  ClipboardList, Receipt as ReceiptIcon, Award, BarChart3
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
  
  // Analytics & Additional State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

  // Admin & Editing States
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  // UI & Notification States
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);

  const statusColors: { [key: string]: string } = {
    'Pending': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'In Progress': 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    'Completed': 'bg-green-500/10 border-green-500/20 text-green-500'
  };

  // Derived stats
  const completedProjects = projects.filter((p) => p.status === "Completed");
  const activeProjects = projects.filter((p) => p.status === "In Progress");
  const pendingProjects = projects.filter((p) => p.status === "Pending");

  const stats = {
    total: projects.length,
    completed: completedProjects.length,
    active: activeProjects.length,
    pending: pendingProjects.length,
  };

  const chartData = [
    { name: "Jan", amount: 0 },
    { name: "Feb", amount: 0 },
    { name: "Mar", amount: 0 },
    { name: "Apr", amount: 0 },
    { name: "May", amount: 0 },
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
        setIsAdmin(user.email?.toLowerCase().includes("admin") || true); 
       
        // Populate initial mock data
        setProjects([]);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  // Event Handlers for Management
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewTitle("");
    setNewClient("");
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const saveEdit = async () => {
    setEditingId(null);
  };

  const updateStatus = async (id: string, status: string) => {
    // Update state operations
  };

  const assignUser = async (id: string, email: string) => {
    // Assign user operations
  };

  const handleDelete = async (id: string) => {
    // Delete operation logic
  };

  const handleFileUpload = async (id: string, file: File) => {
    // File upload logic
  };

  const toggleComments = (id: string) => {
    setOpenCommentsId(openCommentsId === id ? null : id);
  };

  const sendComment = async (id: string) => {
    setSendingComment(true);
    // Send comment logic
    setNewComment("");
    setSendingComment(false);
  };

  const downloadFile = (url: string, filename: string) => {
    // Downloading assets logic
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
        userEmail={user?.email}
        notificationsCount={notifications.length}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        SignOutHandler={handleSignOut}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {showWelcome && (
          <WelcomeNameModal 
            onClose={() => setShowWelcome(false)} 
            userName={user?.email || 'Designer'} 
          />
        )}
        
        {isSettingsOpen && (
          <AccountSettings 
            onClose={() => setIsSettingsOpen(false)} 
            userEmail={user?.email} 
          />
        )}

        {showOnboard && (
          <OnboardClient 
            onClose={() => setShowOnboard(false)} 
          />
        )}

        <AdminNav />
      
        <div className="grid gap-6 md:grid-cols-3 my-6">
          <div className="md:col-span-2">
            <AnalyticsDashboard 
              stats={stats}
              chartData={chartData}
              COLORS={COLORS}
            />
          </div>
          <div>
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
                  comments={comments}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  sendingComment={sendingComment}
                  sendComment={sendComment}
                  unreadCounts={unreadCounts}
                  clientEmails={clientEmails}
                  downloadFile={downloadFile}
                  statusColors={statusColors}
                />
                <ProjectComments projectId={project.id} />
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
