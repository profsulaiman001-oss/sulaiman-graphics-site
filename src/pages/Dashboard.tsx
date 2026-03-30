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

    if (error) {
      console.error(error);
    } else {
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

    if (error) {
      console.error("CREATE ERROR:", error);
    } else {
      setTitle("");
      fetchProjects(user); // refresh list
    }

    setCreating(false);
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

      {/* CREATE PROJECT */}
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
      {loading && (
        <p className="text-gray-400">Loading projects...</p>
      )}

      {/* PROJECT LIST */}
      <div className="space-y-4">
        {projects.length === 0 && !loading && (
          <p className="text-gray-500">
            No projects yet.
          </p>
        )}

        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-[#111] p-4 rounded flex justify-between"
          >
            <span>{project.title}</span>
            <span className="text-blue-400">
              {project.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
