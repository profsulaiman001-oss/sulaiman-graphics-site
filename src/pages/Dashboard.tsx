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

  // 🔔 NOTIFICATIONS
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (message: string) => {
    const newNotif = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  /* ========================= */
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

    if (!admin) {
      query = query.eq("user_id", userData.id);
    }

    const { data } = await query;
    setProjects(data || []);
    setLoading(false);
  };

  /* ========================= CRUD ========================= */

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("projects").update({ status }).eq("id", id);
    addNotification(`Project status updated to "${status}"`);
    fetchProjects(user, isAdmin);
  };

  const assignUser = async (projectId: string, assignedTo: string) => {
    await supabase
      .from("projects")
      .update({ assigned_to: assignedTo || null })
      .eq("id", projectId);

    addNotification("Project assigned successfully");
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

    addNotification(`New project "${title}" created`);

    setTitle("");
    fetchProjects(user, isAdmin);
    setCreating(false);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingId) return;

    await supabase
      .from("projects")
      .update({ title: editTitle })
      .eq("id", editingId);

    addNotification("Project updated");

    setEditingId(null);
    setEditTitle("");
    fetchProjects(user, isAdmin);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;

    await supabase.from("projects").delete().eq("id", id);

    addNotification("Project deleted");

    fetchProjects(user, isAdmin);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  /* ========================= HELPERS ========================= */

  const getUserEmail = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? found.email : "Unassigned";
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  /* ========================= ANALYTICS ========================= */

  const total = projects.length;
  const pending = projects.filter(p => p.status === "pending").length;
  const inProgress = projects.filter(p => p.status === "in progress").length;
  const completed = projects.filter(p => p.status === "completed").length;

  const chartData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold tracking-wide">
            SULAIMAN<span className="text-blue-500">.GRAPHICS</span>
          </h1>
          <p className="text-sm text-gray-400">
            Dashboard {isAdmin && "• Admin"}
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* 🔔 NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-xl"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-[#111] border border-gray-700 rounded-xl p-3 z-50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Notifications</span>
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-red-400"
                  >
                    Clear
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="text-sm mb-2 border-b border-gray-700 pb-2">
                      <p>{n.message}</p>
                      <span className="text-xs text-gray-500">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* PROFILE */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center"
          >
            {getInitials(user?.email)}
          </button>

          {/* MENU */}
          {showMenu && (
            <div className="absolute right-6 top-16 bg-[#111] border border-gray-700 rounded-xl w-48">
              <button
                onClick={() => setShowSettings(true)}
                className="block w-full text-left px-4 py-3 hover:bg-white/10"
              >
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title..."
          className="flex-1 p-3 bg-black border border-gray-700 rounded"
        />
        <button
          onClick={handleCreateProject}
          className="bg-blue-600 px-5 rounded"
        >
          Create
        </button>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[["Total", total], ["Pending", pending], ["In Progress", inProgress], ["Completed", completed]]
          .map(([label, val]) => (
            <div key={label} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
              <p className="text-sm text-gray-400">{label}</p>
              <h2 className="text-xl text-blue-400">{val}</h2>
            </div>
          ))}
      </div>

      {/* PROJECTS */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <div>
                <h3>{project.title}</h3>
                <p className="text-xs text-gray-400">
                  {getUserEmail(project.assigned_to)}
                </p>
              </div>

              <select
                value={project.status}
                onChange={(e) => updateStatus(project.id, e.target.value)}
                className="bg-black border border-gray-600 rounded"
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
                  className="bg-black border border-gray-600 rounded"
                >
                  <option value="">Assign</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </select>
              )}

              <div className="flex gap-2">
                <button onClick={() => setEditingId(project.id)} className="bg-yellow-500 px-3 rounded">Edit</button>
                <button onClick={() => handleDelete(project.id)} className="bg-red-500 px-3 rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SETTINGS */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-80">
            <h2>Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="bg-blue-500 px-4 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
