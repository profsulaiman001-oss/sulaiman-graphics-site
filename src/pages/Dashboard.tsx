import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { 
  Edit3, Trash2, Save, XCircle, Bell, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings, X, Mail, UserCheck, MessageSquare, Send, FileText, ClipboardList
} from "lucide-react";

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

  const [fullName, setFullName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [submittingName, setSubmittingName] = useState(false);

  // Comments states
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});

  // Fixed: State for mobile-friendly notification drawer and a click-outside listener
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // ── ✅ ADDED: State for Questionnaires (Admin Only) ──
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false);

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

    // ── ✅ ADDED: Fetch questionnaires if admin ──
    if (adminStatus) {
      fetchQuestionnaires();
    }

    // Fixed: Real-time notifications for status changes and inserts
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

  // ── ✅ ADDED: Fetch Questionnaire Submissions ──
  const fetchQuestionnaires = async () => {
    try {
      setLoadingQuestionnaires(true);
      const { data, error } = await supabase
        .from("questionnaires")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestionnaires(data || []);
    } catch (error: any) {
      console.error("Error fetching questionnaires:", error.message);
    } finally {
      setLoadingQuestionnaires(false);
    }
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
        title: newTitle,
        status: "Pending",
        client_email: newClient
      }]);

      if (error) throw error;
      
      setNewTitle("");
      setNewClient("");
      setNotifications(prev => ["Project created successfully!", ...prev]);
      fetchProjects(user, isAdmin);

    } catch (error: any) {
      alert(error.message);
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

  const handleClientApproval = async (projectId: string, decision: 'Approved' | 'Revision Requested') => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ client_approval: decision })
        .eq("id", projectId);

      if (error) throw error;
      
      const noteMessage = decision === 'Approved' 
        ? "🎉 Project approved by client!" 
        : "✍️ Client requested revisions.";
        
      setNotifications(prev => [noteMessage, ...prev]);
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

      // 1. LIMIT FILE SIZE (5MB max)
      const maxFileSize = 5 * 1024 * 1024;

      if (file.size > maxFileSize) {
        alert("File is too large! Please keep files under 5MB to save storage space.");
        setLoading(false);
        return;
      }

      // 2. LIMIT FILE TYPES
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

      // Find the project object to get the client email and title
      const targetProject = projects.find((p: any) => p.id === projectId);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ file_url: publicUrl })
        .eq('id', projectId);

      if (updateError) throw updateError;

      // 3. TRIGGER AUTOMATED EMAIL
      if (targetProject && targetProject.client_email) {
        try {
          await fetch('/api/send-design-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientEmail: targetProject.client_email,
              projectTitle: targetProject.title,
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      <AnimatePresence>
        {showNamePrompt && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <motion.div 
              className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <UserCheck size={24} className="text-primary" />
                </div>
                <h2 className="text-xl font-display font-black text-foreground mb-1">Welcome to Your Portal</h2>
                <p className="text-sm text-muted-foreground">Let's personalize your experience. What is your name?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground"
                    autoFocus
                  />
                </div>

                <button 
                  onClick={saveProfileName}
                  disabled={!fullName.trim() || submittingName}
                  className="w-full bg-primary hover:opacity-90 disabled:bg-primary/50 text-white font-semibold text-sm px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {submittingName ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Save & Continue"
                  )}
                </button>
              </div>
            </motion.div>
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
            
            {/* FIXED: Dynamic Sliding Drawer for Mobile Screen Widths */}
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
                    {/* Mobile Dimmed Backdrop */}
                    <motion.div 
                      className="fixed inset-0 bg-black/60 z-40 md:hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotificationDropdown(false)}
                    />

                    {/* Bottom Drawer on mobile, Dropdown box on desktop */}
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
                onClick={handleSignOut}
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
                    onClick={handleSignOut}
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
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
            <div className="md:col-span-1 grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                <span className="text-3xl font-display font-black text-foreground mt-2">{projects.length}</span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-yellow-500/70 font-medium uppercase tracking-wider">Pending</span>
                <span className="text-3xl font-display font-black text-yellow-500 mt-2">
                  {projects.filter((p: any) => p.status?.toLowerCase() === "pending").length}
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-primary font-medium uppercase tracking-wider">Active</span>
                <span className="text-3xl font-display font-black text-primary mt-2">
                  {projects.filter((p: any) => p.status?.toLowerCase() === "in progress").length}
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-green-500/70 font-medium uppercase tracking-wider">Done</span>
                <span className="text-3xl font-display font-black text-green-500 mt-2">
                  {projects.filter((p: any) => p.status?.toLowerCase() === "completed").length}
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#000', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%" cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#000', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ✅ ADDED BUTTON HERE AS REQUESTED */}
        {isAdmin && (
          <div className="mb-8">
            <button
              onClick={() => setLocation("/create-post")}
              className="bg-primary hover:opacity-90 text-white font-semibold text-sm px-5 py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Create A New Post
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Quick Create Project
              </h2>
              <form onSubmit={createProject} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Project Title (e.g., Brand Identity)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground"
                />
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-muted-foreground"
                  >
                    <option value="">Assign to Client</option>
                    {clientEmails.map((email: string) => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="bg-primary hover:opacity-90 text-white font-medium text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} /> Create
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Onboard New Client
              </h2>
              <form onSubmit={handleOnboardClient} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Client Email Address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition text-foreground flex-1"
                />
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-background border border-border hover:border-green-500 hover:text-green-500 text-muted-foreground font-medium text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {inviting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {inviting ? "Sending..." : "Send Secure Portal Invite"}
                </button>
              </form>
            </div>
            
          </div>
        )}

        {/* ── ✅ ADDED: Questionnaire Submissions Section (Admin Only) ── */}
        {isAdmin && (
          <div className="mb-8 bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Questionnaire Submissions
              </h2>
              {loadingQuestionnaires && <Loader2 size={14} className="text-primary animate-spin" />}
            </div>

            {questionnaires.length === 0 && !loadingQuestionnaires ? (
              <div className="text-center py-6 bg-background rounded-xl border border-dashed border-border">
                <p className="text-xs text-muted-foreground">No submissions found yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {questionnaires.map((form) => (
                  <div key={form.id} className="bg-background border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground truncate max-w-[200px]">
                          {form.business_name || form.client_name || "New Lead"}
                        </h3>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {new Date(form.created_at).toLocaleDateString()} at {new Date(form.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 uppercase rounded-full tracking-wider border bg-blue-500/10 text-primary border-blue-500/20">
                        New Form
                      </span>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto bg-card p-3 rounded-lg border border-border/50 text-xs text-muted-foreground">
                      {/* Flexibly render stored object keys except system ones */}
                      {Object.entries(form).map(([key, val]) => {
                        if (['id', 'created_at'].includes(key)) return null;
                        return (
                          <div key={key} className="flex flex-col border-b border-border/30 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0">
                            <span className="font-semibold text-foreground uppercase text-[9px] tracking-wider mb-0.5">{key.replace(/_/g, ' ')}:</span>
                            <span className="break-words leading-tight">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-black text-xl text-foreground">Active Projects</h2>
          {loading && <Loader2 size={18} className="text-primary animate-spin" />}
        </div>

        {projects.length === 0 && !loading ? (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-3xl">
            <div className="text-muted-foreground text-sm mb-2">No projects found.</div>
            <p className="text-xs text-muted-foreground">When projects are created or assigned, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any, index) => (
              <motion.div 
                key={project.id} 
                className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)] transition-all group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {editingId === project.id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="p-3 rounded-lg w-full bg-background border border-primary focus:ring-1 focus:ring-primary text-foreground font-medium mb-1"
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-bold text-lg tracking-tight line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    )}
                    <p className="text-xs text-muted-foreground tracking-wide break-all mt-1 flex items-center gap-1.5">
                      👤 {project.client_email || "Unassigned"}
                    </p>
                  </div>
                  
                  <span className={`text-[11px] font-bold px-3 py-1 uppercase rounded-full tracking-wider border ${statusColors[project.status] || statusColors["Pending"]}`}>
                      {project.status}
                  </span>
                </div>

                {/* FIXED: Premium client approval & download box */}
                <div className="bg-background border border-border rounded-xl p-3 flex flex-col gap-3">
                  {project.file_url ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle size={12} /> Design ready
                        </span>
                        <button 
                          onClick={async () => {
                            window.open(project.file_url, '_blank');
                            setNotifications(prev => ["Downloading your design file... Check your browser downloads!", ...prev]);

                            try {
                              const response = await fetch(project.file_url);
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              
                              const link = document.createElement('a');
                              link.href = blobUrl;
                              
                              const fileName = project.file_url.split('/').pop() || 'design-file';
                              link.download = fileName; 
                              
                              document.body.appendChild(link);
                              link.click();
                              
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(blobUrl);
                            } catch (error) {
                              console.error("Background physical save failed, but tab opened.");
                            }
                          }}
                          className="text-xs bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg border border-primary/30 transition-colors font-semibold flex items-center gap-1"
                        >
                          <Download size={12} /> View & Download
                        </button>
                      </div>

                      <div className="border-t border-border/50 pt-2 mt-1">
                        {project.client_approval === 'Approved' ? (
                          <div className="text-center py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-xs font-bold flex items-center justify-center gap-1">
                             <CheckCircle size={12} /> Project Approved
                          </div>
                        ) : project.client_approval === 'Revision Requested' ? (
                          <div className="text-center py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs font-bold flex items-center justify-center gap-1">
                             <Edit3 size={12} /> Revisions Requested
                          </div>
                        ) : !isAdmin ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleClientApproval(project.id, 'Revision Requested')}
                              className="text-xs bg-background hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-500 py-2 rounded-lg border border-border hover:border-yellow-500/30 transition-colors font-semibold"
                            >
                              Request Changes
                            </button>
                            <button
                              onClick={() => handleClientApproval(project.id, 'Approved')}
                              className="text-xs bg-primary hover:opacity-90 text-white py-2 rounded-lg transition-opacity font-semibold"
                            >
                              Approve Project
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-1.5 bg-muted rounded-lg text-muted-foreground text-xs font-medium">
                            Waiting for client review
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                      <Clock size={12} /> No files attached yet
                    </span>
                  )}
                </div>

                {/* Collapsible Interactive Comments Area */}
                <div className="border-t border-border pt-4">
                  <button 
                    onClick={() => toggleComments(project.id)}
                    className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <MessageSquare size={14} /> 
                      {openCommentsId === project.id ? "Hide Discussion" : "Request Changes / Chat"}
                    </span>
                    
                    {unreadCounts[project.id] > 0 && openCommentsId !== project.id ? (
                      <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center justify-center animate-pulse">
                        {unreadCounts[project.id]} new
                      </span>
                    ) : (
                      <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded-full">
                        Tap to open
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {openCommentsId === project.id && (
                      <motion.div 
                        className="mt-3 space-y-3"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="max-h-40 overflow-y-auto space-y-2 bg-background/50 p-2 rounded-lg border border-border">
                          {comments.length === 0 ? (
                            <div className="text-[11px] text-muted-foreground text-center py-2">No messages yet. Start the thread below!</div>
                          ) : (
                            comments.map((msg) => (
                              <div 
                                key={msg.id} 
                                className={`p-2 rounded-lg text-xs max-w-[85%] ${
                                  msg.is_admin 
                                    ? "bg-primary/10 border border-primary/20 ml-auto text-foreground" 
                                    : "bg-muted border border-border text-foreground"
                                }`}
                              >
                                <div className="flex justify-between items-center gap-2 mb-0.5">
                                  <span className={`font-bold text-[10px] uppercase ${msg.is_admin ? "text-primary" : "text-muted-foreground"}`}>
                                    {msg.is_admin ? "Sulaiman" : "Client"}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="leading-snug">{msg.message}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Type a message..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendComment(project.id)}
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
                          />
                          <button
                            onClick={() => sendComment(project.id)}
                            disabled={sendingComment || !newComment.trim()}
                            className="bg-primary hover:opacity-90 disabled:opacity-50 w-9 h-9 flex items-center justify-center rounded-lg text-white transition-colors"
                          >
                            {sendingComment ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Send size={12} />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex flex-wrap justify-between items-center gap-3">
                  <div className="flex gap-2 flex-wrap">
                        <select
                          value={project.status}
                          onChange={(e) => updateStatus(project.id, e.target.value)}
                          className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:border-primary transition"
                      >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                      </select>

                      {isAdmin && (
                          <select
                          value={project.client_email || ""}
                          onChange={(e) => assignUser(project.id, e.target.value)}
                          className="bg-background border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:border-primary transition"
                          >
                            <option value="">Client Assign</option>
                          {clientEmails.map((email: string) => (
                              <option key={email} value={email}>{email}</option>
                          ))}
                          </select>
                      )}
                  </div>

                  <div className="flex gap-2.5 ml-auto">
                    {editingId === project.id ? (
                      <>
                        <button onClick={saveEdit} className="w-9 h-9 flex items-center justify-center rounded-lg border border-green-700 text-green-500 bg-background hover:bg-green-600/10 hover:border-green-600 transition">
                          <Save size={16}/>
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground bg-background hover:bg-card hover:border-border transition">
                          <XCircle size={16}/>
                        </button>
                      </>
                    ) : (
                      <>
                        {isAdmin && (
                          <label className="w-9 h-9 flex items-center justify-center rounded-lg border border-blue-700/60 text-primary bg-background hover:bg-primary/10 hover:border-primary transition cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload(project.id, e.target.files[0]);
                                }
                              }}
                            />
                            <HardDrive size={16} />
                          </label>
                        )}
                        
                        <button onClick={() => startEdit(project)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-yellow-700/60 text-yellow-500 bg-background hover:bg-yellow-600/10 hover:border-yellow-600 transition">
                          <Edit3 size={16}/>
                        </button>
                        
                        <button onClick={() => handleDelete(project.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-700/60 text-red-500 bg-background hover:bg-red-600/10 hover:border-red-600 transition">
                          <Trash2 size={16}/>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
