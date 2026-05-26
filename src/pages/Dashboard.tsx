import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, LogOut, CheckCircle, 
  Clock, Loader2, Plus, HardDrive, Download, Settings, X, 
  MessageSquare, Send, ClipboardList, Award, BarChart3, CreditCard
} from "lucide-react";

// Storage Utility Import
import { uploadToGitHubStorage } from "@/utils/uploader";

// Component Imports
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import AccountSettings from "@/components/dashboard/AccountSettings";
import { AdminForms } from "@/components/dashboard/AdminForms";
import { AdminNav } from "@/components/dashboard/AdminNav";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { OnboardClient } from "@/components/dashboard/OnboardClient";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ProjectComments } from "@/components/dashboard/ProjectComments";
import { ProjectManagement } from "@/components/dashboard/ProjectManagement";
import WelcomeNameModal from "@/components/dashboard/WelcomeNameModal";
import { CertificateGenerator } from "./components/certificates/CertificateGenerator";

// Client Account Setup View Component Import
import { ClientAccountSettings } from "@/components/dashboard/ClientAccountSettings";

// Premium Payments View Import
import { BillingPage } from "@/components/dashboard/BillingPage";

// Dynamic Sub-Modal Overlay Core Frames
import { Receipt } from "./components/overlays/Receipt";
import { Invoice } from "./components/overlays/Invoice";
import { ViewQuestionnaires } from "./components/overlays/ViewQuestionnaires";
import { Questionnaire } from "./components/overlays/Questionnaire";
import { Agreement } from "./components/overlays/Agreement";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("projects");
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  // Live Projects Tracking Repositories State Arrays
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  // Form Management State Controls
  const [formType, setFormType] = useState<string>("invoice");
  const [clientEmail, setClientEmail] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Questionnaire Submission Fields
  const [qClientName, setQClientName] = useState("");
  const [qBusinessName, setQBusinessName] = useState("");
  const [qProjectDescription, setQProjectDescription] = useState("");
  const [qDesignPreferences, setQDesignPreferences] = useState("");

  // Agreement Contract Fields
  const [agClientName, setAgClientName] = useState("");
  const [agScope, setAgScope] = useState("");
  const [agTimeline, setAgTimeline] = useState("");
  const [agTerms, setAgTerms] = useState("");

  // Editing Project States
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editProgress, setEditProgress] = useState(0);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLocation("/auth");
        return;
      }
      setUser(user);

      // Fetch Profile Records
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setIsAdmin(profileData?.role === "admin");

      // Fetch Workspace Project Sheets Allocation
      await refreshProjects(profileData);
      setLoading(false);
    }

    checkUser();
  }, [setLocation]);

  const refreshProjects = async (currentProfile = profile) => {
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (currentProfile?.role !== "admin") {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        query = query.eq("client_email", currentUser.email);
      }
    }
    const { data: projectsData } = await query;
    setProjects(projectsData || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/auth");
  };

  // Master Document Submission Router
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (formType === "invoice") {
        const { error } = await supabase.from("invoices").insert({
          client_email: clientEmail,
          project_title: projectTitle,
          amount: parseFloat(amount),
          notes,
          status: "pending"
        });
        if (error) throw error;
        alert("Invoice generated securely in system logs.");
      } else if (formType === "receipt") {
        const { error } = await supabase.from("receipts").insert({
          client_email: clientEmail,
          project_title: projectTitle,
          amount_paid: parseFloat(amount),
          notes,
          reference: "REC-" + Math.random().toString(36).substr(2, 9).toUpperCase()
        });
        if (error) throw error;
        alert("Receipt registered and issued.");
      }
      
      // Reset State
      setClientEmail("");
      setProjectTitle("");
      setAmount("");
      setNotes("");
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Questionnaire Dynamic Form Pipeline
  const handleQuestionnaireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("questionnaires").insert({
        client_name: qClientName,
        business_name: qBusinessName,
        project_description: qProjectDescription,
        design_preferences: qDesignPreferences,
        client_email: user?.email
      });
      if (error) throw error;
      alert("Design briefing questionnaire transmitted successfully!");
      setQClientName("");
      setQBusinessName("");
      setQProjectDescription("");
      setQDesignPreferences("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Agreement Processing Sheet
  const handleAgreementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("agreements").insert({
        client_name: agClientName,
        scope_of_work: agScope,
        timeline: agTimeline,
        terms: agTerms,
        status: "pending"
      });
      if (error) throw error;
      alert("Legal studio contract posted for verification.");
      setAgClientName("");
      setAgScope("");
      setAgTimeline("");
      setAgTerms("");
    } catch (err: any) {
      alert("Contract error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Administration Project Modification Mechanics
  const startEditing = (project: any) => {
    setEditingProjectId(project.id);
    setEditTitle(project.title);
    setEditStatus(project.status);
    setEditAmount(project.amount || "");
    setEditProgress(project.progress || 0);
    setEditPreviewUrl(project.preview_url || "");
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
  };

  const handleUpdateProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: editTitle,
          status: editStatus,
          amount: editAmount === "" ? null : parseFloat(editAmount),
          progress: editProgress,
          preview_url: editPreviewUrl
        })
        .eq("id", projectId);

      if (error) throw error;
      setEditingProjectId(null);
      await refreshProjects();
      alert("Project metrics updated on live server nodes.");
    } catch (err: any) {
      alert("Failed updating tracking card: " + err.message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you certain you want to purge this graphic assignment board from records?")) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
      await refreshProjects();
    } catch (err: any) {
      alert("Purge sequence failure: " + err.message);
    }
  };

  // Automated Layout Mockup Delivery Assets Direct Upload Handler Hook
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const path = `previews/${projectId}_${Date.now()}_${file.name}`;
      const downloadUrl = await uploadToGitHubStorage(path, file);
      
      setEditPreviewUrl(downloadUrl);
      
      // If we are actively inline editing, save right away to keep synchronization instant
      if (editingProjectId === projectId) {
        const { error } = await supabase
          .from("projects")
          .update({ preview_url: downloadUrl })
          .eq("id", projectId);
        if (error) throw error;
        await refreshProjects();
      }
      
      alert("Asset deployed to storage bucket vector node layout preview.");
    } catch (err: any) {
      console.error(err);
      alert("Asset allocation pipeline crash: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Launching System Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20">
      
      {/* GLOBAL SYSTEM DASHBOARD BRAND HEADER COMPONENT */}
      <DashboardHeader 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isAdmin={isAdmin} 
        handleLogout={handleLogout} 
      />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full"
          >
            {/* MASTER SYSTEM VIEW ROUTER SWITCH CONDITIONAL RENDER SHEET */}
            {isAdmin ? (
              // ADMIN CONTROL ROUTER SWITCH INTERFACE PANEL
              (() => {
                switch (activeSection) {
                  case "projects":
                    return (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                          <div>
                            <h2 className="text-xl font-black tracking-tight text-foreground">Project Management Terminal</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Control live tracking, update asset links, and adjust milestone values.</p>
                          </div>
                          <button 
                            onClick={() => setIsCertOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto shadow-md"
                          >
                            <Award size={14} />
                            <span>Issue Certificate</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {projects.map((project) => (
                            <div key={project.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-border/80">
                              {editingProjectId === project.id ? (
                                // Active Editing View Layout
                                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assignment Label</label>
                                    <input 
                                      type="text" 
                                      value={editTitle} 
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary/50"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pipeline Stage</label>
                                    <select 
                                      value={editStatus} 
                                      onChange={(e) => setEditStatus(e.target.value)}
                                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary/50"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Review">Review</option>
                                      <option value="Completed">Completed</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Milestone Price (₦)</label>
                                    <input 
                                      type="number" 
                                      value={editAmount} 
                                      onChange={(e) => setEditAmount(e.target.value)}
                                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary/50"
                                      placeholder="No outstanding fee"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Progress Node ({editProgress}%)</label>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100"
                                      value={editProgress} 
                                      onChange={(e) => setEditProgress(parseInt(e.target.value))}
                                      className="w-full h-8 accent-primary cursor-pointer bg-transparent"
                                    />
                                  </div>
                                  <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-3">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Direct Image Mockup Core CDN Vector Link</label>
                                    <input 
                                      type="text" 
                                      value={editPreviewUrl} 
                                      onChange={(e) => setEditPreviewUrl(e.target.value)}
                                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="flex-1 bg-muted/60 border border-border/80 hover:bg-muted text-center py-2 px-3 rounded-xl cursor-pointer transition text-xs font-bold flex items-center justify-center gap-1.5">
                                      <Plus size={14} />
                                      <span>{uploadingFile ? "Uploading..." : "Deploy Asset"}</span>
                                      <input type="file" onChange={(e) => handleFileUpload(e, project.id)} disabled={uploadingFile} className="hidden" accept="image/*" />
                                    </label>
                                    <button onClick={() => handleUpdateProject(project.id)} className="p-2 bg-emerald-500 text-neutral-950 rounded-xl hover:opacity-90 transition shadow-md"><Save size={16} /></button>
                                    <button onClick={cancelEditing} className="p-2 bg-muted border border-border rounded-xl hover:bg-card text-muted-foreground transition"><XCircle size={16} /></button>
                                  </div>
                                </div>
                              ) : (
                                // Static Management Row
                                <>
                                  <div className="space-y-1 max-w-xl flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5">
                                      <h3 className="font-black text-sm text-foreground truncate tracking-tight">{project.title}</h3>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold tracking-wider uppercase font-mono border ${
                                        project.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        project.status === "Review" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      }`}>{project.status}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate font-semibold font-mono uppercase">Client Email: {project.client_email}</p>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/80 mt-2">
                                      <span className="font-mono">Progress: {project.progress || 0}%</span>
                                      {project.amount !== null && (
                                        <span className="text-primary font-mono">Ledger Due: ₦{Number(project.amount).toLocaleString()}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-border/60 justify-end w-full lg:w-auto">
                                    <button 
                                      onClick={() => { setSelectedProject(project); setIsCommentsOpen(true); }}
                                      className="p-2 bg-muted/60 hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-bold px-3.5"
                                    >
                                      <MessageSquare size={14} />
                                      <span>Chat Room</span>
                                    </button>
                                    <button onClick={() => startEditing(project)} className="p-2 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition"><Edit3 size={15} /></button>
                                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition"><Trash2 size={15} /></button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case "chat":
                    return (
                      <div className="bg-card border border-border rounded-2xl p-6 text-center py-24 shadow-sm">
                        <MessageSquare className="mx-auto text-muted-foreground/40 mb-4" size={40} />
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-1">Global Discussion Console</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          Select individual project boards from your active pipeline core workspace to engage in live conversations with clients.
                        </p>
                      </div>
                    );
                  case "forms":
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Control Forms Deck Left */}
                        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 space-y-6 h-fit shadow-sm">
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Financial Matrix Terminal</span>
                            <h3 className="text-base font-black tracking-tight mt-0.5">Generate Statements</h3>
                          </div>
                          
                          <div className="flex bg-muted p-1 rounded-xl gap-1">
                            <button onClick={() => setFormType("invoice")} className={`flex-1 text-center py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition ${formType === "invoice" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Invoice</button>
                            <button onClick={() => setFormType("receipt")} className={`flex-1 text-center py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition ${formType === "receipt" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>Receipt</button>
                          </div>

                          <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Client Email</label>
                              <input type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50" placeholder="partner@domain.com" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project Core Assignment Title</label>
                              <input type="text" required value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50" placeholder="e.g. Identity Branding Pack" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Amount Valuation (₦)</label>
                              <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50" placeholder="50000" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Explanatory Statement Ledger Notes</label>
                              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary/50 min-h-[80px]" placeholder="Terms, prints layout count or scope details..." />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full text-center bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-50 shadow-md">
                              {submitting ? "Processing Node Write..." : `Post System ${formType}`}
                            </button>
                          </form>
                        </div>

                        {/* Interactive Overlays Sheets Center-Right Grid */}
                        <div className="lg:col-span-2 space-y-6">
                          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <ClipboardList className="text-primary" size={18} />
                              <h3 className="text-sm font-black uppercase tracking-wider">Archived Design Brief Questionnaires</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">Review incoming layout expectations and creative preference matrices submitted by onboarding platform partners.</p>
                            <button onClick={() => setActiveOverlay('questionnaires')} className="px-4 py-2 bg-muted/60 hover:bg-muted border border-border text-xs font-bold uppercase tracking-wide rounded-xl transition flex items-center gap-2">
                              <span>Open Questionnaire Logs</span>
                              <Download size={13} />
                            </button>
                          </div>

                          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <BarChart3 className="text-primary" size={18} />
                              <h3 className="text-sm font-black uppercase tracking-wider">Studio Agreement Matrices</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">Access legal workflow contracts, signatures logs, operational scope outlines and project parameters data blocks.</p>
                            <button onClick={() => setActiveOverlay('agreement')} className="px-4 py-2 bg-muted/60 hover:bg-muted border border-border text-xs font-bold uppercase tracking-wide rounded-xl transition flex items-center gap-2">
                              <span>Verify Signed Agreements</span>
                              <Download size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  case "onboard":
                    return <OnboardClient />;
                  case "analytics":
                    return <AnalyticsDashboard projects={projects} />;
                  case "settings":
                    return <AccountSettings profile={profile} setProfile={setProfile} />;
                  default:
                    return (
                      <ProjectManagement 
                        projects={projects} 
                        setProjects={setProjects} 
                        setSelectedProject={(p) => { setSelectedProject(p); setIsCommentsOpen(true); }} 
                        setActiveOverlay={setActiveOverlay}
                      />
                    );
                }
              })()
            ) : (
              // 🟢 CLIENT-SIDE ACCOUNT DASHBOARD VIEW CONTROLLER ROUTER MATRIX
              (() => {
                switch (activeSection) {
                  case "projects":
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border/60 pb-4">
                          <div>
                            <h2 className="text-xl font-black tracking-tight text-foreground">Project Pipeline</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Track design iterations, print schedules, and review status updates.</p>
                          </div>
                        </div>

                        {projects.length === 0 ? (
                          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
                            <HardDrive className="mx-auto text-muted-foreground/30 mb-4" size={36} />
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No Project Records Found</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">Once a graphic assignment workspace goes live, its sheet timeline will assemble automatically here.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                              <ProjectCard 
                                key={project.id} 
                                project={project} 
                                isAdmin={false} 
                                onSelectComments={(p) => { setSelectedProject(p); setIsCommentsOpen(true); }}
                                onAction={() => {}}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  case "chat":
                    return (
                      <div className="space-y-6">
                        <div className="border-b border-border/60 pb-4">
                          <h2 className="text-xl font-black tracking-tight text-foreground">Live Chat Room</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Direct design feedback channel linked to your assigned graphics.</p>
                        </div>
                        {projects.length === 0 ? (
                          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
                            <MessageSquare className="mx-auto text-muted-foreground/30 mb-4" size={36} />
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Discussion Board Suspended</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 block px-1 mb-2">Active Channels</span>
                              {projects.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => setSelectedProject(p)}
                                  className={`w-full text-left p-3 rounded-xl transition border text-xs font-bold flex items-center justify-between ${
                                    selectedProject?.id === p.id 
                                      ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                      : "bg-muted/40 border-transparent hover:bg-muted text-foreground/80"
                                  }`}
                                >
                                  <span className="truncate pr-3">{p.title}</span>
                                  <span className="text-[9px] bg-background border border-border/80 text-muted-foreground px-1.5 py-0.5 rounded font-mono shrink-0 uppercase">{p.status}</span>
                                </button>
                              ))}
                            </div>
                            <div className="lg:col-span-2">
                              {selectedProject ? (
                                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                                  <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-wide text-primary truncate pr-4">{selectedProject.title}</h4>
                                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">CHANNEL ID: {selectedProject.id.slice(0,8).toUpperCase()}</span>
                                  </div>
                                  <ProjectComments project={selectedProject} isAdmin={false} />
                                </div>
                              ) : (
                                <div className="text-center py-24 bg-card border border-border rounded-2xl text-muted-foreground shadow-sm">
                                  <Send className="mx-auto text-muted-foreground/20 mb-3 animate-bounce" size={32} />
                                  <p className="text-xs font-bold uppercase tracking-wider">Select a conversation thread on the sidebar to read logs.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  case "payments":
                    return <BillingPage />;
                  // 🟢 FIXED MOUNT MATRIX BLOCK: Catches settings drawer trigger and passes active user email parameter safely
                  case "settings":
                    return <ClientAccountSettings userEmail={user?.email} />;
                  default:
                    return (
                      <div className="space-y-6">
                        <h2 className="text-xl font-black tracking-tight text-foreground">Project Pipeline</h2>
                        {projects.length === 0 ? (
                          <div className="text-center py-20 bg-card border border-border rounded-2xl">
                            <HardDrive className="mx-auto text-muted-foreground/30 mb-4" size={36} />
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No Workspace Sheets Found</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                              <ProjectCard 
                                key={project.id} 
                                project={project} 
                                isAdmin={false} 
                                onSelectComments={(p) => { setSelectedProject(p); setIsCommentsOpen(true); }}
                                onAction={() => {}}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                }
              })()
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* DETACHED COLLAPSIBLE PROJECT COMMENTING DRAWER EXTENSION LAYER */}
      <AnimatePresence>
        {isCommentsOpen && selectedProject && !isAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end"
            onClick={() => setIsCommentsOpen(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-full max-w-md bg-card border-l border-border h-full flex flex-col p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="min-w-0 pr-4">
                  <h3 className="text-sm font-black truncate tracking-tight">{selectedProject.title}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold font-mono tracking-wider mt-0.5">Review Feedback Interface</p>
                </div>
                <button 
                  onClick={() => setIsCommentsOpen(false)} 
                  className="p-1.5 bg-muted/60 hover:bg-muted border border-border/80 text-muted-foreground hover:text-foreground rounded-lg transition-all active:scale-90"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <ProjectComments project={selectedProject} isAdmin={false} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY LAYOUT RENDER ENGINE SYSTEM MATRIX CONTROL */}
      <AnimatePresence>
        {activeOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setActiveOverlay(null)}
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-card border border-border w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-50">
                <h2 className="text-lg font-bold capitalize tracking-tight">{activeOverlay} Details</h2>
                <button 
                  onClick={() => setActiveOverlay(null)} 
                  className="p-2 bg-muted/50 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                <div className="mx-auto max-w-4xl">
                  {activeOverlay === 'receipt' && <Receipt />}
                  {activeOverlay === 'invoice' && <Invoice />}
                  {activeOverlay === 'questionnaires' && <ViewQuestionnaires />}
                  {activeOverlay === 'questionnaire' && <Questionnaire />}
                  {activeOverlay === 'agreement' && <Agreement />}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-border py-6 mt-auto pb-12 md:pb-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
        </div>
      </footer>
      
      {isCertOpen && <CertificateGenerator onClose={() => setIsCertOpen(false)} />}
    </div>
  );
}
