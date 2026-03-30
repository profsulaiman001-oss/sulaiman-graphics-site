import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");

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

    console.log("USER ID:", user.id);

    setUser(user);
    fetchProjects(user);
  };

  const fetchProjects = async (user: any) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("SUPABASE ERROR:", error);
    } else {
      setProjects(data || []);
    }
  };

  // 🔥 CREATE PROJECT FUNCTION
  const createProject = async () => {
    if (!user || !title.trim()) return;

    const { error } = await supabase.from("projects").insert([
      {
        title: title,
        status: "Pending",
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("CREATE ERROR:", error);
    } else {
      setTitle("");
      fetchProjects(user); // refresh list
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

      {/* CREATE PROJECT SECTION */}
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
