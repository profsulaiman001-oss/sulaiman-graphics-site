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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLocation("/login");
      return;
    }

    const user = session.user;
    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const admin = profile?.is_admin || false;
    setIsAdmin(admin);

    fetchProjects(user, admin);

    // 🔥 GET ALL USERS (for assignment dropdown)
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

  // 🔥 STATUS
  const updateStatus = async (id: string, status: string) => {
    await supabase.from("projects").update({ status }).eq("id", id);
    fetchProjects(user, isAdmin);
  };

  // 🔥 ASSIGN USER
  const assignUser = async (projectId: string, assignedTo: string) => {
    await supabase
      .from("projects")
      .update({ assigned_to: assignedTo })
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
    setUser(null);
    setProjects([]);
    window.location.href = "/login";
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-blue-500">
          Dashboard {isAdmin && "👑 ADMIN"}
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* CREATE */}
      <div className="bg-[#111] p-4 rounded mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title..."
          className="w-full p-2 mb-3 bg-black border border-gray-700 rounded"
        />

        <button
          onClick={handleCreateProject}
          disabled={creating}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {/* PROJECTS */}
      <div className="space-y-4">
        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-[#111] p-4 rounded flex justify-between items-center"
          >
            <div>
              {editingId === project.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="p-1 bg-black border border-gray-600 rounded"
                />
              ) : (
                <div>{project.title}</div>
              )}

              {/* 🔥 SHOW ASSIGNED USER */}
              <div className="text-xs text-gray-400">
                Assigned to: {project.assigned_to || "None"}
              </div>
            </div>

            <div className="flex gap-2 items-center">

              {/* 🔥 STATUS */}
              <select
                value={project.status}
                onChange={(e) =>
                  updateStatus(project.id, e.target.value)
                }
                className="bg-black border border-gray-600 text-sm rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* 🔥 ASSIGN USER (ADMIN ONLY) */}
              {isAdmin && (
                <select
                  value={project.assigned_to || ""}
                  onChange={(e) =>
                    assignUser(project.id, e.target.value)
                  }
                  className="bg-black border border-gray-600 text-sm rounded px-2 py-1"
                >
                  <option value="">Unassigned</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              )}

              {editingId === project.id ? (
                <button
                  onClick={saveEdit}
                  className="bg-green-500 px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(project)}
                    className="bg-yellow-500 px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-500 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                }
