import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

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

  const fetchProjects = async (userData: any, admin: boolean) => {
    let query = supabase.from("projects").select("*");

    if (!admin && userData) {
      query = query.eq("user_id", userData.id);
    }

    const { data } = await query;
    setProjects(data || []);
    setLoading(false);
  };

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
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const getUserEmail = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? found.email : "Unassigned";
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  if (loading)
    return <div className="text-white p-6 text-center">Loading...</div>;

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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050505] to-[#0a0a0a] text-white px-4 py-6 md:px-10">

      {/* 🔥 HEADER FIXED */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-xl font-bold tracking-wide">
            <span className="text-white">SULAIMAN</span>
            <span className="text-blue-500">.GRAPHICS</span>
          </h1>

          <p className="text-xs text-gray-400 mt-1">
            Dashboard {isAdmin && "• Admin"}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold shadow-lg"
          >
            {getInitials(user?.email)}
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0d0d0d] border border-gray-700 rounded-xl shadow-xl z-50">
              <div className="px-4 py-3 text-sm text-gray-400 border-b border-gray-700">
                {user?.email}
              </div>

              <button
                onClick={() => setShowSettings(true)}
                className="w-full text-left px-4 py-3 hover:bg-white/5"
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-10 backdrop-blur-lg shadow-lg">
        <h2 className="text-blue-400 mb-3 font-semibold">Create Project</h2>

        <div className="flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title..."
            className="flex-1 p-3 rounded-lg bg-black/60 border border-gray-700 focus:border-blue-500 outline-none"
          />

          <button
            onClick={handleCreateProject}
            className="bg-blue-600 px-6 rounded-lg hover:bg-blue-700"
          >
            {creating ? "..." : "Create"}
          </button>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[{label:"Total",val:totalProjects},
          {label:"Pending",val:pending},
          {label:"In Progress",val:inProgress},
          {label:"Completed",val:completed}]
        .map((item, i) => (
          <div key={i} className="bg-gradient-to-br from-blue-600/10 to-blue-900/10 border border-blue-500/20 rounded-2xl p-4 shadow-md">
            <p className="text-xs text-gray-400">{item.label}</p>
            <h3 className="text-2xl font-bold text-blue-400">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <motion.div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm text-gray-400 mb-4">Project Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm text-gray-400 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} dataKey="value" outerRadius={80}>
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
          <div key={project.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-md">
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

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-80 border border-gray-700">
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
