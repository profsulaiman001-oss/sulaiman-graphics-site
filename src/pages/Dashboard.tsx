import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  /* ================= AUTH ================= */
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
    setNotifications([]);
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
    await fetchNotifications(currentUser.id);

    if (admin) {
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, email");

      setUsers(allUsers || []);
    }

    /* 🔥 REAL-TIME NOTIFICATIONS */
    supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
  };

  /* ================= DATA ================= */
  const fetchProjects = async (userData: any, admin: boolean) => {
    let query = supabase.from("projects").select("*");

    if (!admin) query = query.eq("user_id", userData.id);

    const { data } = await query;
    setProjects(data || []);
    setLoading(false);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
  };

  /* ================= ACTIONS ================= */
  const createNotification = async (userId: string, message: string) => {
    await supabase.from("notifications").insert([
      { user_id: userId, message },
    ]);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("projects").update({ status }).eq("id", id);

    const project = projects.find(p => p.id === id);
    if (project?.assigned_to) {
      createNotification(
        project.assigned_to,
        `Project "${project.title}" updated to ${status}`
      );
    }

    fetchProjects(user, isAdmin);
  };

  const assignUser = async (projectId: string, assignedTo: string) => {
    await supabase
      .from("projects")
      .update({ assigned_to: assignedTo || null })
      .eq("id", projectId);

    const project = projects.find(p => p.id === projectId);

    if (assignedTo) {
      createNotification(
        assignedTo,
        `You were assigned to "${project?.title}"`
      );
    }

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetState();
    window.location.href = "/login";
  };

  /* ================= ANALYTICS ================= */
  const pending = projects.filter(p => p.status === "pending").length;
  const inProgress = projects.filter(p => p.status === "in progress").length;
  const completed = projects.filter(p => p.status === "completed").length;

  const chartData = [
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
    { name: "Completed", value: completed },
  ];

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-2xl font-bold">Sulaiman Graphics</h1>
          <p className="text-blue-400 text-sm">
            Dashboard {isAdmin && "Admin"}
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* 🔔 NOTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              🔔
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">
                  {unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#111] border border-gray-700 rounded-lg p-3">
                {notifications.length === 0 && (
                  <p className="text-gray-400 text-sm">No notifications</p>
                )}

                {notifications.map((n) => (
                  <div key={n.id} className="text-sm mb-2 border-b border-gray-700 pb-2">
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PROFILE */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-blue-600 rounded-full"
          />

          {showMenu && (
            <div className="absolute right-6 top-16 bg-[#111] p-3 rounded-lg">
              <button onClick={handleLogout} className="text-red-400">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE */}
      <div className="mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New project..."
          className="p-2 bg-black border border-gray-600 mr-2"
        />
        <button onClick={handleCreateProject} className="bg-blue-600 px-4">
          Create
        </button>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {chartData.map((c, i) => (
          <div key={i} className="bg-blue-600/10 p-4 rounded">
            {c.name}: {c.value}
          </div>
        ))}
      </div>

      {/* PROJECTS */}
      {projects.map((project) => (
        <div key={project.id} className="bg-[#111] p-4 mb-3 rounded">
          <div className="flex justify-between">
            <span>{project.title}</span>

            <select
              value={project.status}
              onChange={(e) =>
                updateStatus(project.id, e.target.value)
              }
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {isAdmin && (
            <select
              value={project.assigned_to || ""}
              onChange={(e) =>
                assignUser(project.id, e.target.value)
              }
            >
              <option value="">Assign</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
      }
