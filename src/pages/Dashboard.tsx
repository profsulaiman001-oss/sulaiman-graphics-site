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
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setLocation("/login");
      return;
    }

    const user = data.session.user;
    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const admin = profile?.is_admin || false;
    setIsAdmin(admin);

    fetchProjects(user, admin);

    // 🔥 GET USERS FOR ASSIGNMENT
    if (admin) {
      const { data: allUsers, error } = await supabase
        .from("profiles")
        .select("id, email");

      console.log("USERS:", allUsers, error);

      setUsers(allUsers || []);
    }
  };

  const fetchProjects = async (user: any, admin: boolean) => {
    let query = supabase.from("projects").select("*");

    if (!admin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    console.log("PROJECTS:", data, error);

    setProjects(data || []);
    setLoading(false);
  };

  // 🔥 STATUS UPDATE
  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("STATUS ERROR:", error);
    }

    fetchProjects(user, isAdmin);
  };

  // 🔥 ASSIGN USER (FIXED)
  const assignUser = async (projectId: string, assignedTo: string) => {
    console.log("Assigning:", projectId, assignedTo);

    const { data, error } = await supabase
      .from("projects")
      .update({
        assigned_to: assignedTo || null, // ✅ handle unassigned
      })
      .eq("id", projectId)
      .select();

    console.log("ASSIGN RESULT:", data);
    console.log("ASSIGN ERROR:", error);

    if (!error) {
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

    if (error) {
      console.error("CREATE ERROR:", error);
    }

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

    const { error } = await supabase
      .from("projects")
      .update({ title: editTitle })
      .eq("id", editingId);

    if (error) {
      console.error("UPDATE ERROR:", error);
    }

    setEditingId(null);
    setEditTitle("");
    fetchProjects(user, isAdmin);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
    }

    fetchProjects(user, isAdmin);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProjects([]);
    window.location.href = "/login";
  };

  // 🔥 GET USER EMAIL FROM ID
  const getUserEmail = (id: string) => {
    const found = users.find((u) => u.id === id);
    return found ? found.email : "Unassigned";
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

              {/* ✅ FIXED DISPLAY */}
              <div className="text-xs text-gray-400">
                Assigned to:{" "}
                {project.assigned_to
                  ? getUserEmail(project.assigned_to)
                  : "Unassigned"}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {/* STATUS */}
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

              {/* ASSIGN */}
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
