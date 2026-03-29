import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const isAuth = localStorage.getItem("auth");
    if (!isAuth) {
      setLocation("/login");
    } else {
      fetchProjects();
    }
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*");

    if (error) {
      console.error("SUPABASE ERROR:", error);
    } else {
      console.log("SUPABASE DATA:", data);
      setProjects(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl text-blue-500 mb-4">
        Client Dashboard
      </h1>

      <div className="space-y-4">
        {projects.map((project: any, index) => (
          <div
            key={index}
            className="bg-[#111] p-4 rounded flex justify-between"
          >
            <span>{project.title}</span>
            <span className="text-blue-400">{project.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
