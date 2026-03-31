import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

/* 🔥 PREMIUM UI IMPORTS */
import { motion } from "framer-motion";
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
    let query = supabase.from("projects").select("*");

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
    if (!confirm("Delete this project?")) return;

    await supabase.from("projects").delete().eq("id", id);
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

  if (loading)
    return (
      <div className="text-white p-6 text-center animate-pulse">
        Loading dashboard...
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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#111] text-white p-4 md:p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 relative">
        <h1 className="text-3xl font-bold">
          Dashboard {isAdmin && <span className="text-blue-500">Admin</span>}
        </h1>

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold hover:scale-110 transition"
          >
            {getInitials(user?.email)}
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#111] border border-gray-700 rounded-xl shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300">
                {user?.email}
              </div>

              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/10"
              >
                ⚙️ Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 mb-8">
        <h2 className="text-lg mb-3 text-blue-400">Create Project</h2>

        <div className="flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title..."
            className="flex-1 p-3 rounded-lg bg-black/60 border border-gray-700 focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleCreateProject}
            className="bg-blue-600 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            {creating ? "..." : "Create"}
          </button>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{label:"Total",val:totalProjects},
          {label:"Pending",val:pending},
          {label:"In Progress",val:inProgress},
          {label:"Completed",val:completed}]
        .map((item, i) => (
          <div key={i} className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 hover:scale-105 transition">
            <p className="text-sm text-gray-400">{item.label}</p>
            <h3 className="text-2xl font-bold text-blue-400">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <motion.div className="grid md:grid-cols-2 gap-6 mb-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm text-gray-400 mb-4">Project Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-sm text-gray-400 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value" outerRadius={80} label>
                <Cell fill="#3b82f6" />
                <Cell fill="#60a5fa" />
                <Cell fill="#93c5fd" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* PROJECTS */}
      <div className="grid gap-6">
        {projects.map((project: any) => (
          <div key={project.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-xs text-gray-400">
                  {getUserEmail(project.assigned_to)}
                </p>
              </div>

              <select
                value={project.status}
                onChange={(e) => updateStatus(project.id, e.target.value)}
                className="bg-black border border-gray-600 rounded px-2"
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-between">
              {isAdmin && (
                <select
                  value={project.assigned_to || ""}
                  onChange={(e) => assignUser(project.id, e.target.value)}
                  className="bg-black border border-gray-600 rounded px-2"
                >
                  <option value="">Assign</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </select>
              )}

              <div className="flex gap-2">
                {editingId === project.id ? (
                  <button onClick={saveEdit} className="bg-green-500 px-3 rounded">Save</button>
                ) : (
                  <>
                    <button onClick={() => startEdit(project)} className="bg-yellow-500 px-3 rounded">Edit</button>
                    <button onClick={() => handleDelete(project.id)} className="bg-red-500 px-3 rounded">Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SETTINGS */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-80">
            <h2 className="text-lg mb-4">Settings</h2>
            <p className="text-sm text-gray-400 mb-4">
              More features coming soon...
            </p>
            <button
              onClick={() => setShowSettings(false)}
              className="bg-blue-500 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  }
