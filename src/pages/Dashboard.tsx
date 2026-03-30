import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLocation("/login");
      return;
    }

    setUser(user);
    fetchProjects(user);
  };

  const fetchProjects = async (user: any) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    if (!error) {
      setProjects(data || []);
    }

    setLoading(false);
  };

  const handleCreateProject = async () => {
    if (!title.trim()) return;

    setCreating(true);

    const { error } = await supabase.from("projects").insert([
      {
        title: title,
        status: "pending",
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      fetchProjects(user);
    }

    setCreating(false);
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) return;

    const { error } = await supabase
      .from("projects")
      .update({ title: editTitle })
      .eq("id", editingId);

    if (!error) {
      setEditingId(null);
      setEditTitle("");
      fetchProjects(user);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this project?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
    } else {
      fetchProjects(user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-blue-500">
          Client Dashboard
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

      {/* LOADING */}
      {loading && <p className="text-gray-400">Loading...</p>}

      {/* PROJECTS */}
      <div className="space-y-4">
        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-[#111] p-4 rounded flex justify-between items-center"
          >
            {/* LEFT */}
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

            {/* RIGHT */}
            <div className="flex gap-2 items-center">
              <span className="text-blue-400 text-sm">
                {project.status}
              </span>

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
