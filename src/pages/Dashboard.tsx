import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAuth = localStorage.getItem("auth");
    if (!isAuth) {
      setLocation("/login");
    }
  }, []);

  const projects = [
    { name: "Logo Design", status: "In Progress" },
    { name: "Flyer Design", status: "Completed" },
    { name: "Brand Identity", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl text-blue-500 mb-4">
        Client Dashboard
      </h1>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-[#111] p-4 rounded flex justify-between"
          >
            <span>{project.name}</span>
            <span className="text-blue-400">{project.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
