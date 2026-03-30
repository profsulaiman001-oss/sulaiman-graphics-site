import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
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

    return () => {
      listener.subscription.unsubscribe();
    };
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

  // 🔥 NEW: STATUS UPDATE FUNCTION
  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("STATUS ERROR:", error);
    } else {
      fetchProjects(user, isAdmin);
    }
  };

  const handleCreateProject = async () => {
    if (!title.trim() || !user) return;

    setCreating(true);

    const { error } = await supabase.from("projects").insert([
      {
        title,
        status: "pending",
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      fetchProjects(user, isAdmin);
    }

    setCreating(false);
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim() || !editingId) return;

    const { error } = await supabase
      .from("projects")
      .update({ title: editTitle })
      .eq("id", editingId);

    if (!error) {
      setEditingId(null);
      setEditTitle("");
      fetchProjects(user, isAdmin);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchProjects(user, isAdmin);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProjects([]);
    window.location.href = "/login";
  };

  if (loading) {
    return <p className="text-white p-6">Loading...</p>;
  }

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

      {/* USER */}
      {user && (
        <p className="text-gray-400 mb-4 text-sm">
          Logged in as: {user.email}
        </p>
      )}

      {/* CREATE */}
      <div className="bg-[#111] p-4 rounded mb-6">
        <h2 className="text-lg mb-3 text-blue-400">
          Create New Project
        </h2>

        <input
          type="text"
          placeholder="Project title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-black border border-gray-700"
        />

        <button
          onClick={handleCreateProject}
          disabled={creating}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          {creating ? "Creating..." : "Create Project"}
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
                <span>{project.title}</span>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {/* 🔥 STATUS CONTROL */}
              {isAdmin ? (
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
              ) : (
                <span className="text-blue-400 text-sm">
                  {project.status}
                </span>
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
