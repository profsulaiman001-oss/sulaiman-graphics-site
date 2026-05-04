import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, Bell, LogOut, CheckCircle, 
  Clock, Loader2, HardDrive, Download, Settings, X, UserCheck, MessageSquare, FileText
} from "lucide-react";

import { CertificateGenerator } from "./components/certificates/CertificateGenerator";
import { ProjectManagement } from "../components/dashboard/ProjectManagement";
import { OnboardClient } from "../components/dashboard/OnboardClient";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { ProjectComments } from "../components/dashboard/ProjectComments";
import { AnalyticsDashboard } from "../components/dashboard/AnalyticsDashboard";
import { AdminNav as AdminNavbar } from "../components/dashboard/AdminNav";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState([]);
  const [clientEmails, setClientEmails] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [fullName, setFullName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [submittingName, setSubmittingName] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  
  // Comments states
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const COLORS = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a"];

  useEffect(() => {
    checkUser();
    
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }
    setUser(user);
    const adminStatus = user.email === "profsulaiman001@gmail.com";
    setIsAdmin(adminStatus);
    
    fetchProfile(user.id);
    fetchProjects(user, adminStatus);
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
             const oldStatus = payload.old.status;
             const newStatus = payload.new.status;
  
             if (oldStatus !== newStatus) {
                setNotifications(prev => [`Project "${payload.new.title}" status updated to ${newStatus}`, ...prev]);
             }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new.message, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    if (data && data.full_name) {
      setFullName(data.full_name);
    } else if (!isAdmin) {
      setShowNamePrompt(true);
    }
  };

  const saveProfileName = async () => {
    if (!fullName.trim()) return;
    setSubmittingName(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName.trim(), updated_at: new Date() });
      if (error) throw error;
      setShowNamePrompt(false);
    } catch (error: any) {
      alert("Error saving name: " + error.message);
    } finally {
      setSubmittingName(false);
    }
  };

  const fetchProjects = async (currentUser: any, admin: boolean) => {
    try {
      setLoading(true);
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      
      if (!admin) {
        query = query.eq("client_email", currentUser.email);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const projectsData = data || [];
      setProjects(projectsData);
      
      const uniqueEmails = [
        ...new Set(projectsData.map((p: any) => p.client_email).filter(Boolean))
      ] as string[];
      setClientEmails(uniqueEmails);

      if (projectsData.length > 0) {
        fetchUnreadCounts(projectsData.map((p: any) => p.id), admin);
      }

    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async (projectIds: string[], admin: boolean) => {
    const { data, error } = await supabase
      .from("comments")
      .select("project_id, is_admin")
      .in("project_id", projectIds)
      .eq("is_read", false);
    if (!error && data) {
      const counts: {[key: string]: number} = {};
      data.forEach((msg: any) => {
        const isUnreadForMe = admin ? !msg.is_admin : msg.is_admin;
        
        if (isUnreadForMe) {
          counts[msg.project_id] = (counts[msg.project_id] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    }
  };

  const fetchComments = async (projectId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setComments(data);
    }
  };

  const markMessagesAsRead = async (projectId: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ is_read: true })
      .eq("project_id", projectId)
      .eq("is_read", false)
      .eq("is_admin", !isAdmin);
    if (!error) {
      setUnreadCounts(prev => ({ ...prev, [projectId]: 0 }));
    }
  };

  const toggleComments = (projectId: string) => {
    if (openCommentsId === projectId) {
      setOpenCommentsId(null);
      setComments([]);
    } else {
      setOpenCommentsId(projectId);
      fetchComments(projectId);
      markMessagesAsRead(projectId);
    }
  };

  useEffect(() => {
    const commentsChannel = supabase
      .channel('realtime-comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const newMsg = payload.new;
          
          if (openCommentsId === newMsg.project_id) {
            setComments(prev => [...prev, newMsg]);
            markMessagesAsRead(newMsg.project_id);
          } else {
            const isTargetedToMe = isAdmin ? !newMsg.is_admin : newMsg.is_admin;
            if (isTargetedToMe) {
              setUnreadCounts(prev => ({
                ...prev,
                [newMsg.project_id]: (prev[newMsg.project_id] || 0) + 1
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [openCommentsId, isAdmin]);

  const sendComment = async (projectId: string) => {
    if (!newComment.trim() || !user) return;
    
    setSendingComment(true);
    const { error } = await supabase
      .from("comments")
      .insert([{
        project_id: projectId,
        user_id: user.id,
        message: newComment.trim(),
        is_admin: isAdmin,
        is_read: false
      }]);
    if (!error) {
      setNewComment("");
      fetchComments(projectId);
    }
    setSendingComment(false);
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) {
      alert("Please provide both a project title and a client email!");
      return;
    }

    try {
      const { error } = await supabase.from("projects").insert([{
        title: newTitle.trim(),
        status: "Pending",
        client_email: newClient.trim(),
        user_id: user.id
      }]);
      if (error) throw error;
      
      setNewTitle("");
      setNewClient("");
      setNotifications(prev => ["Project created successfully!", ...prev]);
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert("Database error: " + error.message);
    }
  };

  const handleOnboardClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
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
      setClientEmails(prev => [...new Set([...prev, inviteEmail])]);
      setInviteEmail("");
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setInviting(false);
    }
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ title: editTitle })
        .eq("id", editingId);
      if (error) throw error;
      setEditingId(null);
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const updateStatus = async (projectId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status })
        .eq("id", projectId);
      if (error) throw error;
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const assignUser = async (projectId: string, email: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ client_email: email })
        .eq("id", projectId);
      if (error) throw error;
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  const handleFileUpload = async (projectId: string, file: File) => {
    try {
      setLoading(true);
      const maxFileSize = 5 * 1024 * 1024;

      if (file.size > maxFileSize) {
        alert("File is too large! Please keep files under 5MB to save storage space.");
        setLoading(false);
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type! Please upload only PNG, JPG, WEBP, or PDF files.");
        setLoading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      const targetProject = projects.find((p: any) => p.id === projectId);
      const { error: updateError } = await supabase
        .from('projects')
        .update({ file_url: publicUrl })
        .eq('id', projectId);

      if (updateError) throw updateError;

      if (targetProject && (targetProject as any).client_email) {
        try {
          await fetch('/api/send-design-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientEmail: (targetProject as any).client_email,
              projectTitle: (targetProject as any).title,
              fileUrl: publicUrl
            })
          });
        } catch (emailErr) {
          console.error("Email failed to trigger, but file saved successfully.");
        }
      }

      setNotifications(prev => ["Design file uploaded and client notified!", ...prev]);
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert(error.message || "Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const pending = projects.filter((p: any) => p.status?.toLowerCase() === "pending").length;
    const inProgress = projects.filter((p: any) => p.status?.toLowerCase() === "in progress").length;
    const completed = projects.filter((p: any) => p.status?.toLowerCase() === "completed").length;
    return [
      { name: "Pending", value: pending },
      { name: "In Progress", value: inProgress },
      { name: "Completed", value: completed }
    ];
  };

  const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "In Progress": "bg-blue-500/10 text-primary border-blue-500/20",
    Completed: "bg-green-500/10 text-green-500 border-green-500/20"
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank');
    }
  };

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.client_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AnimatePresence>
        {showNamePromptModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             {/* Modal contents */}
          </div>
        )}
      </AnimatePresence>

      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-xl tracking-tighter text-foreground">
              SULAIMAN <span className="text-primary">GRAPHICS</span>
            </h1>
            <span className="text-xs bg-background border border-border px-2 py-0.5 rounded-full text-muted-foreground font-medium">
              {isAdmin ? "Admin Portal" : "Client Portal"}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:border-primary transition relative text-muted-foreground hover:text-foreground"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotificationDropdown && (
                  <>
                    <motion.div 
                      className="fixed inset-0 bg-black/60 z-40 md:hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotificationDropdown(false)}
                    />
                    <motion.div 
                      className="fixed bottom-0 left-0 right-0 w-full bg-card border-t border-border rounded-t-2xl p-4 shadow-2xl z-50 md:absolute md:top-auto md:bottom-auto md:left-auto md:right-0 md:mt-2 md:w-64 md:border md:rounded-xl md:p-3"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="w-12 h-1 bg-border rounded-full mx-auto mb-3 md:hidden"></div>
                      <div className="flex justify-between items-center mb-2 border-b border-border pb-1">
                        <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                        <button 
                          onClick={() => setShowNotificationDropdown(false)}
                          className="text-xs text-muted-foreground hover:text-foreground md:hidden"
                        >
                          Close
                        </button>
                      </div>

                      <div className="space-y-2 max-h-64 md:max-h-40 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((note, i) => (
                            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1 p-1.5 hover:bg-background rounded-md transition-colors">
                              <span className="text-primary">•</span> {note}
                            </p>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic text-center py-2">
                            No notifications yet
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:border-primary transition text-muted-foreground hover:text-foreground"
            >
              <Settings size={18} />
            </button>

            <div className="flex items-center gap-2 bg-background border border-border py-1.5 pl-3 pr-1.5 rounded-full max-w-[200px] sm:max-w-none">
              <span className="text-xs font-medium text-muted-foreground truncate flex-shrink min-w-0">
                {user?.email}
              </span>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setLocation("/login");
                }}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-primary hover:opacity-90 text-white transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div 
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-display font-black text-foreground flex items-center gap-2">
                  <Settings size={20} className="text-primary" /> Account Settings
                </h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border hover:border-red-500 transition text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase mb-1 block">Account Email</label>
                  <div className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground">
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase mb-1 block">Role</label>
                  <div className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-primary font-medium">
                    {isAdmin ? "Administrator" : "Client Account"}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between gap-3">
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1 bg-background border border-border hover:bg-muted text-foreground font-medium text-sm px-4 py-3 rounded-xl transition"
                  >
                    Close
                  </button>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setLocation("/login");
                    }}
                    className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500 text-red-500 hover:text-white font-medium text-sm px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground">
            {fullName ? `Hello, ${fullName}!` : "Hello, Client!"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here is the latest status of your active design projects.</p>
        </div>

        {projects.length > 0 && (
          <AnalyticsDashboard
            projectsLength={projects.length}
            pendingCount={projects.filter((p: any) => p.status?.toLowerCase() === "pending").length}
            inProgressCount={projects.filter((p: any) => p.status?.toLowerCase() === "in progress").length}
            completedCount={projects.filter((p: any) => p.status?.toLowerCase() === "completed").length}
            getChartData={getChartData}
            COLORS={COLORS}
          />
        )}

        {isAdmin && <AdminNavbar />}

        <ProjectManagement 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newClient={newClient}
          setNewClient={setNewClient}
          handleCreateProject={createProject}
          isAdmin={isAdmin}
        />

        {isAdmin && (
          <OnboardClient
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            handleInviteClient={handleOnboardClient}
            loading={inviting}
          />
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={32} className="animate-spin mb-4 text-primary" />
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Create a project or onboard a client to get started." : "Your active design projects will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project: any) => (
              <div key={project.id} className="relative bg-card border border-border rounded-2xl overflow-hidden aspect-square flex flex-col justify-between">
                
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                  <div className="flex-1 min-w-0">
                    {editingId === project.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-background border border-border rounded-md px-1.5 py-0.5 text-xs focus:border-primary outline-none transition text-foreground w-full max-w-[120px]"
                        />
                        <button onClick={saveEdit} className="text-primary hover:text-primary/80">
                          <Save size={12} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400">
                          <XCircle size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-foreground truncate block">{project.title}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground block truncate mt-0.5">{project.client_email}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[project.status] || "bg-card text-foreground"}`}>
                    {project.status}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {openCommentsId === project.id ? (
                      <ProjectComments
                        projectId={project.id}
                        openCommentsId={openCommentsId}
                        comments={comments}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        sendingComment={sendingComment}
                        sendComment={sendComment}
                        toggleComments={toggleComments}
                        isAdmin={isAdmin}
                      />
                    ) : (
                      <motion.div 
                        className="flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border ${
                          project.status === "Completed" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                          project.status === "In Progress" ? "bg-blue-500/10 border-blue-500/20 text-primary" :
                          "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                        }`}>
                          {project.status === "Completed" ? <CheckCircle size={28} /> : <Clock size={28} />}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-2 max-w-[180px]">
                          Created on {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-3 bg-muted/20 border-t border-border mt-auto">
                  <div className="flex flex-col gap-2">
                    {project.file_url ? (
                      <div className="flex gap-1.5 w-full">
                        <button 
                          onClick={() => downloadFile(project.file_url, `${project.title}-design`)}
                          className="flex-1 h-7 flex items-center justify-center gap-1 rounded-lg bg-primary hover:opacity-90 text-white font-medium text-[10px] transition"
                        >
                          <Download size={10} />
                          Download
                        </button>
                      </div>
                    ) : (
                      !isAdmin && (
                        <div className="w-full text-center text-muted-foreground text-[10px] italic py-1.5">
                          Waiting for assets...
                        </div>
                      )
                    )}

                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => toggleComments(project.id)}
                        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium relative"
                      >
                        <MessageSquare size={12} />
                        Messages
                        {unreadCounts[project.id] > 0 && (
                          <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                            {unreadCounts[project.id]}
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <select
                            value={project.client_email || ""}
                            onChange={(e) => assignUser(project.id, e.target.value)}
                            className="bg-background border border-border rounded-lg px-1.5 py-1 text-[10px] focus:border-primary outline-none transition text-muted-foreground max-w-[100px]"
                          >
                            <option value="">Assign Email</option>
                            {clientEmails.map((email: string) => (
                              <option key={email} value={email}>{email}</option>
                            ))}
                          </select>
                        )}
                        
                        {isAdmin && (
                          <select
                            value={project.status}
                            onChange={(e) => updateStatus(project.id, e.target.value)}
                            className="bg-background border border-border rounded-lg px-1.5 py-1 text-[10px] focus:border-primary outline-none transition text-muted-foreground"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">Active</option>
                            <option value="Completed">Done</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 pt-1 justify-end">
                      {project.file_url ? (
                        <div className="text-[9px] text-green-500 flex items-center gap-0.5 flex-1 truncate">
                          <CheckCircle size={8} /> File Uploaded
                        </div>
                      ) : (
                        <div className="text-[9px] text-muted-foreground flex items-center gap-0.5 flex-1 truncate">
                          <Clock size={8} /> No files yet
                        </div>
                      )}
                      
                      {isAdmin && (
                        <>
                          <label className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary/40 text-primary bg-background hover:bg-primary/10 hover:border-primary transition cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload(project.id, e.target.files[0]);
                                }
                              }}
                            />
                            <HardDrive size={10} />
                          </label>
                          <button onClick={() => startEdit(project)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-yellow-700/60 text-yellow-500 bg-background hover:bg-yellow-600/10 hover:border-yellow-600 transition">
                            <Edit3 size={10}/>
                          </button>
                          <button onClick={() => handleDelete(project.id)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-700/60 text-red-500 bg-background hover:bg-red-600/10 hover:border-red-600 transition">
                            <Trash2 size={10}/>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
