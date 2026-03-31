import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

/* 🔥 PREMIUM UI IMPORTS */
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* 🔥 Premium Icons (Requires installing lucide-react, or you can use emojis) */
import { Edit3, Trash2, Save, XCircle, Plus, MoreVertical } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  /* =========================
     AUTH + SESSION
  ========================== */
  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          resetState();
          setLocation("/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const closeNotifications = () => {
      setShowNotifications(false);
    };

    window.addEventListener("click", closeNotifications);

    return () => {
      window.removeEventListener("click", closeNotifications);
    };
  }, []);
  
  const resetState = () => {
    setUser(null);
    setProjects([]);
  };

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setLocation("/login");
      return;
    }

    const currentUser = data.session.user;
    setUser(currentUser);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", currentUser.id)
      .single();

    const admin = profile?.is_admin || false;
    setIsAdmin(admin);

    await fetchProjects(currentUser, admin);

    if (admin) {
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, email");

      setUsers(allUsers || []);
    }
  };

  /* =========================
     DATA FETCHING
  ========================== */
  const fetchProjects = async (userData: any, admin: boolean) => {
    let query = supabase.from("projects").select("*").order('created_at', { ascending: false });

    if (!admin && userData) {
      query = query.eq("user_id", userData.id);
    }

    const { data } = await query;
    setProjects(data || []);
    setLoading(false);
  };

  /* =========================
     CRUD OPERATIONS
  ========================== */
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("projects").update({ status }).eq("id", id);
    setNotifications(prev => [`Status changed to ${status}`, ...prev]);
    fetchProjects(user, isAdmin);
  };

  const assignUser = async (projectId: string, assignedTo: string) => {
    await supabase
      .from("projects")
      .update({ assigned_to: assignedTo || null })
      .eq("id", projectId);

    fetchProjects(user, isAdmin);
  };

  const handleCreateProject = async () => {
    if (!title.trim() || !user) return;

    setCreating(true);

    await supabase.from("projects").insert([
      {
        title,
        status: "pending",
        user_id: user.id,
      },
    ]);
    setNotifications(prev => ["New project created", ...prev]); 

    setTitle("");
    fetchProjects(user, isAdmin);
    setCreating(false);
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingId) return;

    await supabase
      .from("projects")
      .update({ title: editTitle })
      .eq("id", editingId);

    setEditingId(null);
    setEditTitle("");
    fetchProjects(user, isAdmin);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project permanently?")) return;

    await supabase.from("projects").delete().eq("id", id);
    setNotifications(prev => ["Project deleted", ...prev]);
    fetchProjects(user, isAdmin);
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;

    await supabase.auth.signOut();
    resetState();
    window.location.href = "/login";
  };

  /* =========================
     HELPERS
  ========================== */
  const getUserEmail = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? found.email : "Unassigned";
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  const statusColors = {
    pending: "text-blue-300 bg-blue-500/10 border border-blue-500/30",
    "in progress": "text-yellow-300 bg-yellow-500/10 border border-yellow-500/30",
    completed: "text-green-300 bg-green-500/10 border border-green-500/30",
  };

  if (loading)
    return (
      <div className="text-white min-h-screen flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            Loading dashboard...
        </div>
      </div>
    );

  /* =========================
     ANALYTICS
  ========================== */
  const totalProjects = projects.length;
  const pending = projects.filter(p => p.status === "pending").length;
  const inProgress = projects.filter(p => p.status === "in progress").length;
  const completed = projects.filter(p => p.status === "completed").length;

  const chartData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#080808] to-[#010101] text-white p-4 md:p-12 mt-16">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800 relative z-50">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          Dashboard <span className="text-blue-600">Admin</span>
        </h1>
        
        <div className="flex items-center gap-5">
          {/* 🔔 Notification Bell */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-900 border border-gray-700 relative hover:border-blue-500 transition-colors"
            >
              <motion.span whileTap={{ scale: 1.1 }}>🔔</motion.span>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-[10px] w-4 h-4 flex items-center justify-center font-bold rounded-full border border-black shadow-lg">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 bg-[#111] border border-gray-700 rounded-2xl p-4 z-[999] shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-400">Notifications</h3>
                    <button onClick={() => setNotifications([])} className="text-xs text-blue-500">Clear</button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4 text-center">No new notifications</p>
                ) : (
                  notifications.map((n, i) => (
                    <p key={i} className="text-xs bg-gray-900/40 p-2 rounded border border-gray-800">
                      {n}
                    </p>
                  ))
                )}
                </div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-12 h-12 rounded-full bg-blue-600/10 border-2 border-blue-600 flex items-center justify-center font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-shadow"
            >
              {getInitials(user?.email)}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-60 bg-[#111] border border-gray-700 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
                <div className="px-5 py-4 border-b border-gray-700 text-sm text-gray-300">
                  <div className="font-semibold text-white">Authenticated As:</div>
                  <div className="text-xs break-all">{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-white/5"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3.5 text-red-400 flex items-center gap-3 hover:bg-red-500/10"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE */}
      <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-10 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-500 flex items-center gap-2"><Plus size={20}/> Create New Project</h2>

        <div className="flex gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Brand Identity System, Social Media Ads..."
            className="flex-1 p-4 rounded-xl bg-gray-950/40 border border-gray-800 text-gray-100 placeholder:text-gray-600 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
          />

          <button
            onClick={handleCreateProject}
            disabled={creating}
            className="bg-blue-600 px-8 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"/> : "Add Project"}
          </button>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-6 border-b border-gray-800">
        {[{label:"Total",val:totalProjects},
          {label:"Pending",val:pending},
          {label:"In Progress",val:inProgress},
          {label:"Completed",val:completed}]
        .map((item, i) => (
          <div key={i} className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.1)] hover:scale-[1.03] transition-transform">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
            <h3 className="text-3xl font-extrabold text-blue-400">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <motion.div className="grid md:grid-cols-2 gap-8 mb-12 pb-8 border-b border-gray-800"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-inner">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-6">Project Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#555" tickLine={false} axisLine={false} fontSize={11}/>
              <Tooltip 
                cursor={{ fill: 'rgba(59,130,246,0.05)' }} 
                contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8,8,0,0]} barSize={40}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-inner">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-6">Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} dataKey="value" outerRadius={90} label={{fill: '#888', fontSize: 10}} stroke="#111" strokeWidth={3}>
                <Cell fill="#3b82f6" />
                <Cell fill="#60a5fa" />
                <Cell fill="#93c5fd" />
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 🔥 PREMIUM PROJECTS LIST REDESIGN */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight mb-6">Project Pipeline</h2>
        
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
                  {/* 🔥 Editable input with premium styling */}
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
                
                {/* Custom Styled Status Indicator */}
                <span className={`text-[11px] font-bold px-3 py-1 uppercase rounded-full tracking-wider ${statusColors[project.status]}`}>
                    {project.status}
                </span>
              </div>

              {/* Status Update & Admin Actions Section */}
              <div className="mt-auto pt-5 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3">
                
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

                {/* 🔥 Premium, Colored-Outline Action Buttons */}
                <div className="flex gap-2.5 ml-auto">
                  {editingId === project.id ? (
                    <>
                      <button onClick={saveEdit} className="w-9 h-9 flex items-center justify-center rounded-lg border border-green-700 text-green-500 bg-black hover:bg-green-600/10 hover:border-green-600 transition">
                        <Save size={18}/>
                      </button>
                      <button onClick={() => setEditingId(null)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 text-gray-500 bg-black hover:bg-gray-800 hover:border-gray-600 transition">
                        <XCircle size={18}/>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* YELLOW OUTLINE - ONLY Hover uses background */}
                      <button onClick={() => startEdit(project)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-yellow-700/60 text-yellow-500 bg-black hover:bg-yellow-600/10 hover:border-yellow-600 transition">
                        <Edit3 size={18}/>
                      </button>
                      
                      {/* RED OUTLINE - ONLY Hover uses background */}
                      <button onClick={() => handleDelete(project.id)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-700/60 text-red-500 bg-black hover:bg-red-600/10 hover:border-red-600 transition">
                        <Trash2 size={18}/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SETTINGS (Modal logic unchanged, but styled more premium) */}
      <AnimatePresence>
      {showSettings && (
        <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}>
          <motion.div className="bg-[#111] border border-gray-800 p-10 rounded-3xl w-[90%] max-w-lg shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-extrabold mb-5 text-blue-500 tracking-tighter">Account Settings</h2>
            <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-2xl p-5 mb-8">
                <p className="text-yellow-300 font-medium flex items-center gap-3">
                  ⚠️ This area is under development.
                </p>
                <p className="text-sm text-yellow-100 mt-2">
                  Profile editing and preference features are coming soon. The current dashboard focuses on client and project management.
                </p>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Got it, Close Settings
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
