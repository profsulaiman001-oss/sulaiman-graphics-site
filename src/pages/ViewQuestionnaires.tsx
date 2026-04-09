import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Loader2, ClipboardList } from "lucide-react";

export default function ViewQuestionnaires() {
  const [, setLocation] = useLocation();
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openQuestionnaireId, setOpenQuestionnaireId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "profsulaiman001@gmail.com") {
      setLocation("/login");
      return;
    }
    fetchQuestionnaires();
  };

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_questionnaires")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestionnaires(data || []);
    } catch (error: any) {
      console.error("Error fetching questionnaires:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this questionnaire?")) return;

    try {
      setDeletingId(id);
      
      // Send hard delete instruction to remote Supabase database table
      const { error } = await supabase
        .from("project_questionnaires")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Remove it from current visual state array safely
      setQuestionnaires(prev => prev.filter(item => item.id !== id));
      
    } catch (error: any) {
      alert("Error deleting questionnaire: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleQuestionnaire = (id: string) => {
    setOpenQuestionnaireId(openQuestionnaireId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation("/dashboard")} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:border-primary transition text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-display font-black text-xl tracking-tighter text-foreground">
              QUESTIONNAIRE <span className="text-primary">SUBMISSIONS</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 size={32} className="animate-spin mb-4 text-primary" />
            <p>Loading questionnaires...</p>
          </div>
        ) : questionnaires.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <ClipboardList size={40} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-1">No questionnaires yet</h3>
            <p className="text-sm text-muted-foreground">Responses will appear here when clients fill the form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questionnaires.map((q) => (
              <div key={q.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div 
                  className="p-5 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-muted/30 transition"
                  onClick={() => toggleQuestionnaire(q.id)}
                >
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="font-bold text-foreground">{q.client_name || "Unknown Client"}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span>{q.client_email}</span>
                      {q.project_type && <span>Project: <span className="text-foreground font-medium">{q.project_type}</span></span>}
                      <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(q.id);
                      }}
                      disabled={deletingId === q.id}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-500 hover:text-red-500 transition"
                    >
                      {deletingId === q.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                    <span className="text-xs font-semibold text-primary">
                      {openQuestionnaireId === q.id ? "Hide Details" : "View Details"}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {openQuestionnaireId === q.id && (
                    <motion.div 
                      className="border-t border-border p-5 bg-background/50"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                        {[
                          { label: "Business Name", value: q.business_name },
                          { label: "Project Goal", value: q.project_goal },
                          { label: "Target Audience", value: q.target_audience },
                          { label: "Design Style", value: q.design_style },
                          { label: "Brand Colors", value: q.brand_colors },
                          { label: "References/Links", value: q.reference_links },
                          { label: "Budget Range", value: q.budget_range },
                          { label: "Deadline", value: q.deadline },
                          { label: "Additional Notes", value: q.additional_notes }
                        ].map((field, idx) => field.value && (
                          <div key={idx} className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">{field.label}</span>
                            <p className="text-foreground">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
    }
