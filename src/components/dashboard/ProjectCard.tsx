import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Edit3, Trash2, Save, XCircle, CheckCircle, Clock, Loader2, Download, 
  MessageSquare, HardDrive, Send, Plus, Smartphone, Image as ImageIcon, X 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProjectCardProps {
  project: any;
  isAdmin: boolean;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editPrice?: string | number;
  setEditPrice?: (val: string) => void;
  startEdit: (project: any) => void;
  saveEdit: () => void;
  setEditingId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void;
  assignUser: (id: string, email: string) => void;
  handleDelete: (id: string) => void;
  handleFileUpload: (id: string, file: File) => void;
  toggleComments: (id: string) => void;
  openCommentsId: string | null;
  comments: any[];
  versions: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  sendingComment: boolean;
  sendComment: (id: string) => void;
  unreadCounts: { [key: string]: number };
  clientEmails: string[];
  downloadFile: (url: string, filename: string) => void;
  statusColors: { [key: string]: string };
  mockups: any[];
  handleMockupUpload: (id: string, files: FileList) => void;
  handleDeleteVersion: (versionId: string) => void;
}

export function ProjectCard({
  project,
  isAdmin,
  editingId,
  setEditingId,
  updateStatus,
  assignUser,
  handleDelete,
  toggleComments,
  openCommentsId,
  comments,
  versions,
  newComment,
  setNewComment,
  sendingComment,
  sendComment,
  unreadCounts,
  clientEmails,
  downloadFile,
  statusColors,
  mockups = [], 
  handleDeleteVersion
}: ProjectCardProps) {

  const [showGallery, setShowGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [isUploadingMockup, setIsUploadingMockup] = useState(false);
  
  // Independent dynamic self-handling fields to completely ensure smooth typing actions
  const [localTitle, setLocalTitle] = useState(project.title || "");
  const [localAmount, setLocalAmount] = useState(project.amount !== undefined && project.amount !== null ? project.amount : "0");

  // Synchronize field states if data properties refresh from root queries
  useEffect(() => {
    setLocalTitle(project.title || "");
    setLocalAmount(project.amount !== undefined && project.amount !== null ? project.amount : "0");
  }, [project]);

  const getProgress = (status: string) => {
    if (status === "Completed") return 100;
    if (status === "In Progress") return 65;
    return 25;
  };

  const getStatusBadgeStyles = (status: string) => {
    if (status === "Completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
    }
    if (status === "In Progress") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
    }
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const handleInlineSave = async () => {
    setIsSaving(true);
    try {
      const parsedAmount = localAmount === "" ? 0 : parseInt(localAmount.toString().replace(/[^0-9]/g, ""));
      // Updates exclusively write to 'amount' to avoid column mismatch cache faults
      const { error } = await supabase
        .from("projects")
        .update({
          title: localTitle,
          amount: parsedAmount
        })
        .eq("id", project.id);

      if (error) throw error;
      
      setEditingId(null);
      window.location.reload();
    } catch (err: any) {
      alert("Error saving properties: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct Supabase storage bucket processing path for New Design Versions
  const handleSupabaseVersionUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingVersion(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${project.id}/${Date.now()}_version.${fileExt}`;

      // Push file straight to your project-files bucket destination
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Extract public URL asset pathway from the bucket directly
      const { data: { publicUrl } } = supabase.storage
        .from("project-files")
        .getPublicUrl(fileName);

      // Create tracking instance reference inside project_versions database table
      const { error: versionError } = await supabase
        .from("project_versions")
        .insert({
          project_id: project.id,
          version_name: `Revision v${(versions?.length || 0) + 1}`,
          file_url: publicUrl
        });

      if (versionError) throw versionError;

      // Automatically assign the newly added item to the project's primary preview column
      const { error: projectUpdateError } = await supabase
        .from("projects")
        .update({ file_url: publicUrl })
        .eq("id", project.id);

      if (projectUpdateError) throw projectUpdateError;

      alert("Design asset version saved safely into your storage bucket!");
      window.location.reload();
    } catch (err: any) {
      alert("Version storage upload configuration error: " + err.message);
    } finally {
      setIsUploadingVersion(false);
    }
  };

  // Direct Supabase storage bucket multi-upload processing path for Premium Presentation Mockups
  const handleSupabaseMockupUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsUploadingMockup(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${project.id}/mockup_${Date.now()}_${i}.${fileExt}`;

        // Upload loop for multiple files directly targeting the bucket partition path
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("project-files")
          .getPublicUrl(fileName);

        // Store public reference path directly within the project_mockups relation records
        const { error: mockupError } = await supabase
          .from("project_mockups")
          .insert({
            project_id: project.id,
            file_url: publicUrl
          });

        if (mockupError) throw mockupError;
      }

      alert("Premium presentation mockups successfully saved to your storage bucket!");
      window.location.reload();
    } catch (err: any) {
      alert("Mockup storage handling configuration failure: " + err.message);
    } finally {
      setIsUploadingMockup(false);
    }
  };

  const displayValue = Number(project.amount) || 0;

  return (
    <motion.div 
      className="bg-[#0b121f]/90 backdrop-blur-md border border-[#1e293b]/80 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl hover:border-primary/40 transition-all duration-500 relative group/card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* GLOWING GRADIENT EFFECT ACCENT */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />

      {/* HEADER ROW CONFIGURATOR */}
      <div className="p-5 border-b border-[#1e293b]/60 flex justify-between items-center bg-gradient-to-b from-[#0f172a]/40 to-transparent">
        <div className="flex-1 min-w-0 pr-3">
          {editingId === project.id ? (
            <div className="flex flex-col gap-2 w-full max-w-[180px]">
              <input
                type="text"
                autoFocus
                placeholder="Project Title"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-1.5 text-xs focus:border-primary outline-none text-white w-full shadow-inner transition-colors"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Price Amount"
                  value={localAmount}
                  onChange={(e) => setLocalAmount(e.target.value)}
                  className="bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-1.5 text-xs focus:border-primary outline-none text-white w-full shadow-inner transition-colors"
                />
                <button 
                  onClick={handleInlineSave} 
                  disabled={isSaving}
                  className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all shrink-0 p-2 rounded-xl"
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                </button>
                <button 
                  onClick={() => setEditingId(null)} 
                  className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all shrink-0 p-2 rounded-xl"
                >
                  <XCircle size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-sm tracking-tight text-white group-hover/card:text-primary transition-colors duration-300 truncate">{project.title}</span>
              <span className="text-[10px] font-medium text-slate-400 truncate">{project.client_email || "Unassigned"}</span>
              <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-mono font-bold mt-1">
                ₦{displayValue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 shrink-0 ${getStatusBadgeStyles(project.status)}`}>
          {project.status === "In Progress" ? "Active" : project.status === "Completed" ? "Done" : project.status}
        </span>
      </div>

      {/* PREVIEW CONTAINER STAGE */}
      <div className="flex-1 min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden p-4 bg-[#070c14]/40">
        <AnimatePresence mode="wait">
          {openCommentsId === project.id ? (
            <motion.div 
              className="absolute inset-0 p-4 flex flex-col bg-[#0b121f] z-20"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar text-left">
                {comments.length > 0 ? (
                  comments.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col ${msg.is_admin === isAdmin ? 'items-end' : 'items-start'}`}>
                      <span className="text-[8px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                        {msg.is_admin ? "Sulaiman Graphics" : "Client"}
                      </span>
                      <div className={`px-3.5 py-2 rounded-2xl max-w-[85%] text-[11px] leading-relaxed shadow-md ${
                        msg.is_admin === isAdmin 
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-none' 
                          : 'bg-[#1e293b]/70 border border-[#334155]/40 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[7px] text-slate-500 mt-1 opacity-70 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-1.5 italic">
                    <MessageSquare size={16} className="text-slate-600 opacity-60" />
                    <span>No messages yet.</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 border-t border-[#1e293b]/60 pt-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendComment(project.id)}
                  className="flex-1 bg-[#070c14] border border-[#1e293b] rounded-xl px-3.5 text-xs text-white outline-none focus:border-primary/80 transition-all placeholder:text-slate-600 shadow-inner"
                />
                <button 
                  onClick={() => sendComment(project.id)} 
                  disabled={sendingComment || !newComment.trim()} 
                  className="bg-primary hover:bg-primary/90 text-white w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
                >
                  {sendingComment ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center w-full h-full relative" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {project.file_url ? (
                <div className="relative group/img w-full h-full flex items-center justify-center rounded-2xl overflow-hidden p-1">
                  <img 
                    src={project.file_url} 
                    className="max-h-[210px] w-auto object-contain rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/img:scale-[1.03] border border-[#1e293b]/40" 
                    alt="Preview" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner bg-primary/5 border border-primary/10 text-primary">
                    <Clock size={30} className="animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] bg-[#1e293b]/40 border border-[#334155]/30 px-3 py-1 rounded-full">
                    Production
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* METRICS TRACKING AND REVISIONS */}
      <div className="px-5 py-3 bg-[#090f1a]/50">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Progress</span>
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 font-mono">{getProgress(project.status)}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#141f32] rounded-full overflow-hidden p-[1px] border border-[#1e293b]/30">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
            initial={{ width: 0 }} 
            animate={{ width: `${getProgress(project.status)}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* VERSION HISTORY BLOCK */}
        {versions && versions.length > 0 && (
          <div className="mt-4 border-t border-[#1e293b]/40 pt-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
              <HardDrive size={11} className="text-primary" />
              Design Revisions
            </h4>
            <div className="space-y-2 max-h-[110px] overflow-y-auto custom-scrollbar pr-0.5">
              {versions.map((v: any) => (
                <div 
                  key={v.id} 
                  className="flex items-center justify-between bg-[#0e1726]/60 p-2.5 rounded-xl border border-[#1e293b]/50 group/row hover:border-primary/30 hover:bg-[#111c2e] transition-all duration-300"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px] group-hover/row:text-white transition-colors">{v.version_name}</span>
                    <span className="text-[9px] font-medium text-slate-500 mt-0.5 font-mono">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          if(confirm("Delete this design version?")) {
                            handleDeleteVersion(v.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadFile(v.file_url, `${project.title}-${v.version_name}`);
                      }}
                      className="p-1.5 bg-[#141f32] text-slate-400 border border-[#1e293b] rounded-lg group-hover/row:border-primary/20 group-hover/row:bg-primary/10 group-hover/row:text-primary transition-all"
                    >
                      <Download size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER CONTROLS ROW */}
      <div className="p-5 bg-[#0b121f] border-t border-[#1e293b]/60 mt-auto">
        <div className="flex flex-col gap-3.5">
          
          <div className="flex flex-col gap-2">
            {mockups.length > 0 ? (
              <button 
                onClick={() => setShowGallery(true)}
                className="w-full h-9 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 shadow-md active:scale-[0.98]"
              >
                <Smartphone size={13} className="animate-pulse" /> View {mockups.length} Premium Mockups
              </button>
            ) : isAdmin && (
              <label className="w-full h-9 flex items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/20 bg-cyan-500/[0.02] text-cyan-400/60 hover:text-cyan-400 hover:border-cyan-500/40 text-[11px] font-semibold cursor-pointer transition-all duration-300">
                {isUploadingMockup ? (
                  <Loader2 size={13} className="animate-spin text-cyan-400" />
                ) : (
                  <>
                    <ImageIcon size={13} /> Upload Mockups
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  disabled={isUploadingMockup}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleSupabaseMockupUpload(e.target.files);
                    }
                  }} 
                />
              </label>
            )}
          </div>

          {versions && versions.length > 0 ? (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadFile(versions[0].file_url, `${project.title}-latest`);
              }}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <Download size={13} /> Open & Download Latest Assets
            </button>
          ) : !isAdmin && (
            <div className="w-full text-center text-slate-500 text-[10px] py-2.5 border border-dashed border-[#1e293b] rounded-xl font-semibold uppercase tracking-wider bg-[#070c14]/30">
              Design production in progress...
            </div>
          )}

          {isAdmin && (
            <label className="w-full h-9 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#334155] bg-[#0e1726]/40 hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-300 cursor-pointer text-xs font-bold text-slate-400 hover:text-primary">
              {isUploadingVersion ? (
                <Loader2 size={13} className="animate-spin text-primary" />
              ) : (
                <>
                  <Plus size={13} /> Upload New Version
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf" 
                disabled={isUploadingVersion}
                onChange={(e) => e.target.files && handleSupabaseVersionUpload(e.target.files[0])} 
              />
            </label>
          )}

          <div className="flex justify-between items-center border-t border-[#1e293b]/40 pt-3.5 mt-0.5">
            <button 
              onClick={() => toggleComments(project.id)} 
              className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-bold transition-all relative px-1 py-0.5"
            >
              <MessageSquare size={14} />
              <span>Messages</span>
              {unreadCounts[project.id] > 0 && (
                <span className="absolute -top-1.5 -right-3 min-w-[15px] h-[15px] px-1 bg-red-500 text-white text-[8px] font-mono rounded-full flex items-center justify-center border-2 border-[#0b121f]">
                  {unreadCounts[project.id]}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <select 
                    value={project.client_email || ""} 
                    onChange={(e) => assignUser(project.id, e.target.value)}
                    className="bg-[#070c14] border border-[#1e293b] rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-300 outline-none max-w-[105px] focus:border-primary/40 transition-colors cursor-pointer"
                  >
                    <option value="">Assign</option>
                    {clientEmails.map(email => <option key={email} value={email}>{email}</option>)}
                  </select>
                  
                  <select 
                    value={project.status} 
                    onChange={(e) => updateStatus(project.id, e.target.value)}
                    className="bg-[#070c14] border border-[#1e293b] rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-300 outline-none focus:border-primary/40 transition-colors cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">Active</option>
                    <option value="Completed">Done</option>
                  </select>
                  
                  <button 
                    onClick={() => {
                      setLocalTitle(project.title || "");
                      setLocalAmount(project.amount !== undefined && project.amount !== null ? project.amount : "0");
                      setEditingId(project.id);
                    }} 
                    className="p-2 rounded-xl border border-[#1e293b] bg-[#070c14] text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all shadow-sm"
                  >
                    <Edit3 size={13}/>
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(project.id)} 
                    className="p-2 rounded-xl border border-[#1e293b] bg-[#070c14] text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-sm"
                  >
                    <Trash2 size={13}/>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL GALLERY MODAL CONTAINER */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-5"
          >
            <div className="flex justify-between items-center mb-6 max-w-5xl w-full mx-auto">
               <h3 className="text-white font-bold text-base tracking-tight">{project.title} <span className="text-cyan-400 font-medium text-xs ml-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md">Mockup Showcase</span></h3>
               <button 
                 onClick={() => setShowGallery(false)} 
                 className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white active:scale-90 transition-all border border-white/5"
               >
                 <X size={22}/>
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-10 custom-scrollbar pb-24">
              {mockups.map((m, index) => (
                <div key={m.id} className="relative group/galleryItem max-w-4xl mx-auto">
                  <img 
                    src={m.file_url} 
                    className="w-full h-auto rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/5" 
                    alt={`Mockup ${index + 1}`} 
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute bottom-5 right-5 flex gap-2.5 opacity-90 group-hover/galleryItem:opacity-100 transition-opacity">
                    {isAdmin && (
                      <button 
                        onClick={async () => {
                          if(confirm("Delete this mockup?")) {
                            await supabase.from("project_mockups").delete().eq("id", m.id);
                            alert("Mockup deleted.");
                          }
                        }}
                        className="bg-red-500/20 backdrop-blur-md p-3.5 rounded-full text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => downloadFile(m.file_url, `${project.title}-mockup-${index + 1}`)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 p-4 rounded-full text-white shadow-2xl active:scale-95 transition-all flex items-center gap-2 font-bold"
                    >
                      <Download size={18} /> <span className="text-xs pr-1">Save to Phone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none pt-12 pb-6">
              <p className="text-center text-white/20 text-[10px] uppercase tracking-[0.3em] font-bold">
                Exclusive Visualization by Sulaiman Graphics
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
