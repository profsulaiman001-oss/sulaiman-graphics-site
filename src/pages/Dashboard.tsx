import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const isAuth = localStorage.getItem("auth");

    if (!isAuth) {
      setLocation("/login");
      return;
    }

    fetchProjects();
  }, [setLocation]);

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

      <div className="space-y
