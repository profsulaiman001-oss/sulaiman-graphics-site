import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
  editTitle,
  setEditTitle,
  startEdit,
  saveEdit,
  setEditingId,
  updateStatus,
  assignUser,
  handleDelete,
  handleFileUpload,
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
  handleMockupUpload,
  handleDeleteVersion
}: ProjectCardProps) {

  const [showGallery, setShowGallery] = useState(false);

  const getProgress = (status: string) => {
    if (status === "Completed") return 100;
    if (status === "In Progress") return 65;
    return 25;
  };

  return (
    <motion.div 
      className="bg-card border border-border/60 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
        <div className="flex-1 min-w-0">
          {editingId === project.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border border-border rounded-md px-2 py-1 text-xs focus:border-primary outline-none text-white w-full max-w-[150px]"
              />
              <button onClick={saveEdit} className="text-primary hover:text-primary/80 transition-colors"><Save size={14} /></button>
              <button onClick={() => setEditingId(null)} className="text-red-500"><XCircle size={14} /></button>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-bold text-xs text-foreground truncate">{project.title}</span>
              <span className="text-[9px] text-muted-foreground truncate">{project.client_email || "Unassigned"}</span>
            </div>
          )}
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusColors[project.status] || "bg-card"}`}>
          {project.status}
        </span>
      </div>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden bg-muted/5">
        <AnimatePresence mode="wait">
          {openCommentsId === project.id ? (
            <motion.div 
              className="absolute inset-0 p-3 flex flex-col bg-card z-20"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex-1 overflow-y-auto space-y-3 mb-2 pr-1 custom-scrollbar text-left">
                {comments.length > 0 ? (
                  comments.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col ${msg.is_admin === isAdmin ? 'items-end' : 'items-start'}`}>
                      <span className="text-[7px] font-bold text-muted-foreground mb-0.5 uppercase tracking-tighter">
                        {msg.is_admin ? "Sulaiman Graphics" : "Client"}
                      </span>
                      <div className={`p-2 rounded-2xl max-w-[90%] text-[10px] leading-snug shadow-sm ${
                        msg.is_admin === isAdmin ? 'bg-primary text-white' : 'bg-muted border border-border text-foreground'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[7px] text-muted-foreground mt-0.5 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] italic">No messages yet.</div>
                )}
              </div>
              
              <div className="flex gap-1.5 border-t border-border pt-2">
                <input
                  type="text"
                  placeholder="Reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendComment(project.id)}
                  className="flex-1 bg-background border border-border rounded-lg px-3 text-[10px] text-white outline-none focus:border-primary transition-all"
                />
                <button onClick={() => sendComment(project.id)} disabled={sendingComment || !newComment.trim()} className="bg-primary text-white w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50">
                  {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div className="flex flex-col items-center justify-center p-4 w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {project.file_url ? (
                <div className="relative group w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                  <img 
                    src={project.file_url} 
                    className="max-h-[200px] w-auto object-contain rounded-lg shadow-xl transition-transform duration-500 group-hover:scale-105" 
                    alt="Preview" 
                  />
                </div>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner bg-primary/10 text-primary`}>
                    <Clock size={28} className="animate-pulse" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    Production
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PROGRESS & REVISIONS */}
      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Project Status</span>
          <span className="text-[8px] font-bold text-primary">{getProgress(project.status)}%</span>
        </div>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }} 
            animate={{ width: `${getProgress(project.status)}%` }} 
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* VERSION HISTORY LIST WITH ADMIN DELETE */}
        {versions && versions.length > 0 && (
          <div className="mt-4 border-t border-border/30 pt-3">
            <h4 className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <HardDrive size={10} />
              Design Revisions
            </h4>
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
              {versions.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between bg-card/50 p-2 rounded-lg border border-border/30 group hover:border-primary/30 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-foreground truncate max-w-[120px]">{v.version_name}</span>
                    <span className="text-[7px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          if(confirm("Delete this design version?")) {
                            handleDeleteVersion(v.id);
                          }
                        }}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadFile(v.file_url, `${project.title}-${v.version_name}`);
                      }}
                      className="p-1.5 bg-muted/50 rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors"
                    >
                      <Download size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-muted/5 border-t border-border">
        <div className="flex flex-col gap-3">
          
          <div className="flex flex-col gap-2">
            {mockups.length > 0 ? (
              <button 
                onClick={() => setShowGallery(true)}
                className="w-full h-8 flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-[10px] hover:bg-cyan-500/20 transition-all"
              >
                <Smartphone size={12} /> View {mockups.length} Premium Mockups
              </button>
            ) : isAdmin && (
              <label className="w-full h-8 flex items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/30 text-cyan-500/60 hover:text-cyan-500 text-[9px] cursor-pointer">
                <ImageIcon size={12} /> Upload Mockups
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMockupUpload(project.id, e.target.files);
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
              className="w-full h-8 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Download size={12} /> Open & Download Latest Assets
            </button>
          ) : !isAdmin && (
            <div className="w-full text-center text-muted-foreground text-[9px] py-2 border border-dashed border-border rounded-xl font-medium uppercase tracking-tight">
              Design production in progress...
            </div>
          )}

          {isAdmin && (
            <label className="w-full h-8 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-[10px] font-bold text-muted-foreground hover:text-primary">
              <Plus size={14} /> Upload New Version
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files && handleFileUpload(project.id, e.target.files[0])} />
            </label>
          )}

          <div className="flex justify-between items-center">
            <button 
              onClick={() => toggleComments(project.id)} 
              className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 font-bold transition-all relative"
            >
              <MessageSquare size={13} />
              Messages
              {unreadCounts[project.id] > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-card">
                  {unreadCounts[project.id]}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <>
                  <select 
                    value={project.client_email || ""} 
                    onChange={(e) => assignUser(project.id, e.target.value)}
                    className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] text-white outline-none max-w-[100px]"
                  >
                    <option value="">Assign</option>
                    {clientEmails.map(email => <option key={email} value={email}>{email}</option>)}
                  </select>
                  <select 
                    value={project.status} 
                    onChange={(e) => updateStatus(project.id, e.target.value)}
                    className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">Active</option>
                    <option value="Completed">Done</option>
                  </select>
                  <button onClick={() => startEdit(project)} className="p-1.5 rounded-lg border border-border text-yellow-500 hover:bg-yellow-500/10 transition-colors"><Edit3 size={12}/></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={12}/></button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN GALLERY OVERLAY */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4"
          >
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-white font-bold text-sm tracking-tight">{project.title} - Mockup Showcase</h3>
               <button onClick={() => setShowGallery(false)} className="p-2 bg-white/10 rounded-full text-white active:scale-90 transition-all"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pb-20">
              {mockups.map((m, index) => (
                <div key={m.id} className="relative group max-w-4xl mx-auto">
                  <img 
                    src={m.file_url} 
                    className="w-full h-auto rounded-3xl shadow-2xl border border-white/5" 
                    alt={`Mockup ${index + 1}`} 
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {isAdmin && (
                      <button 
                        onClick={async () => {
                          if(confirm("Delete this mockup?")) {
                            await supabase.from("project_mockups").delete().eq("id", m.id);
                            alert("Mockup deleted.");
                          }
                        }}
                        className="bg-red-500/20 backdrop-blur-md p-3 rounded-full text-red-500 border border-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => downloadFile(m.file_url, `${project.title}-mockup-${index + 1}`)}
                      className="bg-cyan-500 p-4 rounded-full text-white shadow-xl active:scale-95 transition-all flex items-center gap-2 font-bold"
                    >
                      <Download size={20} /> <span className="text-xs">Save to Phone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold py-6">
              Exclusive Visualization by Sulaiman Graphics
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
