import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { 
  Edit3, Trash2, Save, XCircle, Bell, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings 
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Recharts colors
  const COLORS = ["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }
    setUser(user);
    
    // Simple admin check based on email
    const adminStatus = user.email === "profsulaiman001@gmail.com";
    setIsAdmin(adminStatus);
    
    fetchProjects(user, adminStatus);
    
    if (adminStatus) {
      fetchUsers();
    }

    // Realtime subscription for notifications
    const channel = supabase
      .channel('schema-db-changes')
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

  const fetchProjects = async (currentUser: any, admin: boolean) => {
    try {
      setLoading(true);
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
      
      // If not admin, only show projects assigned to this user
      if (!admin) {
        query = query.eq("assigned_to", currentUser.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // In a real app, you'd have a profiles table. 
    // This is a fallback to show assigned emails.
    const { data } = await supabase.from("projects").select("assigned_to");
    const uniqueIds = [...new Set(data?.map(p => p.assigned_to).filter(Boolean))];
    
    // Creating mock user objects for the dropdown based on what's in the DB
    setUsers(uniqueIds.map(id => ({ id, email: id === "profsulaiman001@gmail.com" ? "profsulaiman001@gmail.com" : "client@example.com" })));
  };

  // CRUD Operations
  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { error } = await supabase.from("projects").insert([{
        title: newTitle,
        status: "pending",
        assigned_to: newClient || null
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

  const assignUser = async (projectId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ assigned_to: userId || null })
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

  // 📁 FILE UPLOAD LOGIC
  const handleFileUpload = async (projectId: string, file: File) => {
    try {
      setLoading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Update the projects table
      const { error: updateError } = await supabase
        .from('projects')
        .update({ file_url: publicUrl })
        .eq('id', projectId);

      if (updateError) throw updateError;

      setNotifications(prev => ["Design file uploaded successfully!", ...prev]);
      fetchProjects(user, isAdmin);
    } catch (error: any) {
      alert(error.message || "Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get short email display
  const getUserEmail = (id: string) => {
    if (!id) return "Unassigned";
    if (id === "profsulaiman001@gmail.com") return "profsulaiman001@gmail.com";
    return "client@example.com";
  };

  // Chart Data preparation
  const getChartData = () => {
    const pending = projects.filter((p: any) => p.status === "pending").length;
    const inProgress = projects.filter((p: any) => p.status === "in progress").length;
    const completed = projects.filter((p: any) => p.status === "completed").length;

    return [
      { name: "Pending", value: pending },
      { name: "In Progress", value: inProgress },
      { name: "Completed", value: completed }
    ];
  };

  const statusColors: any = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "in progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20"
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl tracking-tighter bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              SULAIMAN GRAPHICS
            </h1>
            <span className="text-xs bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800 text-gray-500 font-medium">
              {isAdmin ? "Admin Portal" : "Client Portal"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 hover:border-blue-600 transition relative">
                <Bell size={18} className="text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {notifications.length > 0 && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-950 border border-gray-800 rounded-xl p-3 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                  <h4 className="font-semibold text-sm mb-2 border-b border-gray-900 pb-1">Notifications</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notifications.map((note, i) => (
                      <p key={i} className="text-xs text-gray-400 flex items-start gap-1">
                        <span className="text-blue-500">•</span> {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ⚙️ Restored Settings Button */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 border border-gray-800 hover:border-blue-600 transition text-gray-400 hover:text-white">
              <Settings size={18} />
            </button>

            <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 py-1.5 pl-3 pr-1.5 rounded-full">
              <span className="text-xs font-medium text-gray-400 max-w-[120px] truncate">
                {user?.email}
              </span>
              <button 
                onClick={handleSignOut}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        
        {/* Analytics Section - Only show if projects exist */}
        {projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Stat Cards */}
            <div className="md:col-span-1 grid grid-cols-2 gap-4">
              <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
                <span className="text-3xl font-bold text-white mt-2">{projects.length}</span>
              </div>
              <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-yellow-500/70 font-medium uppercase tracking-wider">Pending</span>
                <span className="text-3xl font-bold text-yellow-500 mt-2">
                  {projects.filter((p: any) => p.status === "pending").length}
                </span>
              </div>
              <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-blue-500/70 font-medium uppercase tracking-wider">Active</span>
                <span className="text-3xl font-bold text-blue-500 mt-2">
                  {projects.filter((p: any) => p.status === "in progress").length}
                </span>
              </div>
              <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-xs text-green-500/70 font-medium uppercase tracking-wider">Done</span>
                <span className="text-3xl font-bold text-green-500 mt-2">
                  {projects.filter((p: any) => p.status === "completed").length}
                </span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-4 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-4 h-[160px] flex items-center justify-center">
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
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Create Project - Admin Only */}
        {isAdmin && (
          <div className="bg-gray-950/50 border border-gray-900 rounded-2xl p-5 mb-8">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span> Quick Create Project
            </h2>
            <form onSubmit={createProject} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Project Title (e.g., Brand Identity)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
              />
              
              <select
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                className="bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition text-gray-400"
              >
                <option value="">Assign to Client (Optional)</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} /> Create
              </button>
            </form>
          </div>
        )}

        {/* Project Grid */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg">Active Projects</h2>
          {loading && <Loader2 size={18} className="text-blue-500 animate-spin" />}
        </div>

        {projects.length === 0 && !loading ? (
          <div className="text-center py-16 bg-gray-950/20 border border-gray-900 border-dashed rounded-3xl">
            <div className="text-gray-600 text-sm mb-2">No projects found.</div>
            <p className="text-xs text-gray-700">When projects are created or assigned, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project: any, index) => (
              <motion.div 
                key={project.id} 
                className="bg-gray-950/40 backdrop-blur border border-gray-800 rounded-3xl p-6 flex flex-col gap-5 hover:border-blue-600/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)] transition-all group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {editingId === project.id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="p-3 rounded-lg w-full bg-black/60 border border-blue-600 focus:ring-1 focus:ring-blue-600 text-white font-medium mb-1"
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-semibold text-lg tracking-tight line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                    )}
                    <p className="text-xs text-gray-600 tracking-wide break-all mt-1 flex items-center gap-1.5">
                      👤 {getUserEmail(project.assigned_to)}
                    </p>
                  </div>
                  
                  <span className={`text-[11px] font-bold px-3 py-1 uppercase rounded-full tracking-wider border ${statusColors[project.status]}`}>
                      {project.status}
                  </span>
                </div>

                {/* 📁 FILE ATTACHMENT SECTION (VIEW & DOWNLOAD SIMULTANEOUS ACTION) */}
                <div className="bg-black/40 border border-gray-900 rounded-xl p-3 flex items-center justify-between gap-3">
                  {project.file_url ? (
                    <>
                      <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle size={12} /> Design ready
                      </span>
                      <button 
                        onClick={async () => {
                          // 1. Open preview in a new tab
                          window.open(project.file_url, '_blank');

                          // 2. State trigger for user context awareness
                          setNotifications(prev => ["Downloading your design file... Check your browser downloads!", ...prev]);

                          // 3. Trigger the background download to physical storage
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
                        className="text-xs bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg border border-blue-600/30 transition-colors font-semibold flex items-center gap-1"
                      >
                        <Download size={12} /> View & Download
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-600 italic flex items-center gap-1">
                      <Clock size={12} /> No files attached yet
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-5 border-t border-gray-800/50 flex flex-wrap justify-between items-center gap-3">
                  
                  <div className="flex gap-2">
                      <select
                          value={project.status}
                          onChange={(e) => updateStatus(project.id, e.target.value)}
                          className="bg-black border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:border-blue-600 transition"
                      >
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                      </select>

                      {isAdmin && (
                          <select
                          value={project.assigned_to || ""}
                          onChange={(e) => assignUser(project.id, e.target.value)}
                          className="bg-black border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-1.5 focus:border-blue-600 transition"
                          >
                          <option value="">Client Assign</option>
                          {users.map((u: any) => (
                              <option key={u.id} value={u.id}>{u.email}</option>
                          ))}
                          </select>
                      )}
                  </div>

                  <div className="flex gap-2.5 ml-auto">
                    {editingId === project.id ? (
                      <>
                        <button onClick={saveEdit} className="w-9 h-9 flex items-center justify-center rounded-lg border border-green-700 text-green-500 bg-black hover:bg-green-600/10 hover:border-green-600 transition">
                          <Save size={16}/>
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 bg-black hover:bg-gray-800 hover:border-gray-600 transition">
                          <XCircle size={16}/>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Only Admin can see the upload file button */}
                        {isAdmin && (
                          <label className="w-9 h-9 flex items-center justify-center rounded-lg border border-blue-700/60 text-blue-500 bg-black hover:bg-blue-600/10 hover:border-blue-600 transition cursor-pointer">
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
                        
                        <button onClick={() => startEdit(project)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-yellow-700/60 text-yellow-500 bg-black hover:bg-yellow-600/10 hover:border-yellow-600 transition">
                          <Edit3 size={16}/>
                        </button>
                        
                        <button onClick={() => handleDelete(project.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-700/60 text-red-500 bg-black hover:bg-red-600/10 hover:border-red-600 transition">
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

      <footer className="border-t border-gray-900 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-gray-700">
          © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
        </div>
      </footer>
    </div>
  );
                                            }
