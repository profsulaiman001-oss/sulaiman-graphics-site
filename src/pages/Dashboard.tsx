import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
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
    } else {
      console.error(error);
    }
  };

  // 🔥 CREATE
  const createProject = async () => {
    if (!user || !title.trim()) return;

    const { error } = await supabase.from("projects").insert([
      {
        title: title,
        status: "Pending",
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      fetchProjects(user);
    }
  };

  // 🔥 DELETE
  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchProjects(user);
    }
  };

  // 🔥 START EDIT
  const startEdit = (project: any) => {
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  // 🔥 SAVE EDIT
  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    const { error } = await supabase
      .from("projects")
      .update({ title: editTitle })
      .eq("id", id);

    if (!error) {
      setEditingId(null);
      setEditTitle("");
      fetchProjects(user);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl text-blue-500 mb-2">
        Client Dashboard
      </h1>

      {user && (
        <p className="text-gray-400 mb-4 text-sm">
          Logged in as: {user.email}
        </p>
      )}

      {/* CREATE */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter project title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 bg-[#111] border border-gray-700 rounded w-full"
        />
        <button
          onClick={createProject}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* PROJECT LIST */}
      <div className="space-y-4">
        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-[#111] p-4 rounded flex justify-between items-center"
          >
            <div className="w-full">
              {/* EDIT MODE */}
              {editingId === project.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="px-2 py-1 bg-black border border-gray-600 rounded w-full"
                />
              ) : (
                <p>{project.title}</p>
              )}

              <p className="text-blue-400 text-sm">
                {project.status}
              </p>
            </div>

            <div className="flex gap-2 ml-4">
              {editingId === project.id ? (
                <button
                  onClick={() => saveEdit(project.id)}
                  className="bg-green-500 px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => startEdit(project)}
                  className="bg-yellow-500 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => deleteProject(project.id)}
                className="bg-red-500 px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
