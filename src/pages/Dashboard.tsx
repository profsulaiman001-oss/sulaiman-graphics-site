import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

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
      (event, session) => {
        if (!session) {
          setUser(null);
          setProjects([]);
          setLocation("/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setLocation("/login");
      return;
    }

    const user = data.session.user;
    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const admin = profile?.is_admin || false;
    setIsAdmin(admin);

    fetchProjects(user, admin);

    if (admin) {
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, email");

      setUsers(allUsers || []);
    }
  };

  const fetchProjects = async (user: any, admin: boolean) => {
    let query = supabase.from("projects").select("*");

    if (!admin) {
      query = query.eq("user_id", user.id);
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
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    await supabase.auth.signOut();
    setUser(null);
    setProjects([]);
    window.location.href = "/login";
  };

  const getUserEmail = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? found.email : "Unassigned";
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

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
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold"
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
            className="flex-1 p-3 rounded-lg bg-black/60 border border-gray-700"
          />

          <button
            onClick={handleCreateProject}
            className="bg-blue-600 px-6 rounded-lg"
          >
            {creating ? "..." : "Create"}
          </button>
        </div>
      </div>

      {/* PROJECTS */}
      <div className="grid gap-6">
        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-xs text-gray-400">
                  {getUserEmail(project.assigned_to)}
                </p>
              </div>

              <select
                value={project.status}
                onChange={(e) =>
                  updateStatus(project.id, e.target.value)
                }
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
                  onChange={(e) =>
                    assignUser(project.id, e.target.value)
                  }
                  className="bg-black border border-gray-600 rounded px-2"
                >
                  <option value="">Assign</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex gap-2">
                {editingId === project.id ? (
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 px-3 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(project)}
                      className="bg-yellow-500 px-3 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      className="bg-red-500 px-3 rounded"
                    >
                      Delete
                    </button>
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
