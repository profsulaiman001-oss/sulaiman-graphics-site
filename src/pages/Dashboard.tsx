import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      console.error("SUPABASE ERROR:", error);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
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
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* USER INFO */}
      {user && (
        <p className="text-gray-400 mb-4 text-sm">
          Logged in as: {user.email}
        </p>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Loading projects...</p>
      )}

      {/* PROJECTS */}
      <div className="space-y-4">
        {projects.length === 0 && !loading && (
          <p className="text-gray-500">
            No projects found.
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
