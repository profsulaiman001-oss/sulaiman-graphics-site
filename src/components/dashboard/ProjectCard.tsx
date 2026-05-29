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
  mockups?: any[];
  handleMockupUpload?: (id: string, files: FileList) => void;
  handleDeleteVersion?: (id: string) => void;
  refreshWorkspace?: () => void;
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
  handleDeleteVersion,
  refreshWorkspace
}: ProjectCardProps) {
  const [localProjectPrice, setLocalProjectPrice] = useState<string | number>("");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [activeMockupFullscreen, setActiveMockupFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (project && project.amount !== undefined) {
      setLocalProjectPrice(project.amount);
    }
  }, [project]);

  const handlePriceUpdateSubmit = async () => {
    if (!project?.id || !isAdmin) return;
    setIsUpdatingPrice(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ amount: Number(localProjectPrice) || 0 })
        .eq("id", project.id);
      if (error) throw error;
      if (refreshWorkspace) refreshWorkspace();
      alert("Project budget updated successfully!");
    } catch (err: any) {
      alert("Failed to change budget: " + err.message);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-all h-full pb-6"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <div>
        <div className="flex justify-between items-start mb-4 gap-2">
          {editingId === project.id ? (
            <div className="flex gap-2 w-full max-w-[70%]">
              <input 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border border-border px-3 py-1.5 rounded-xl text-xs w-full focus:outline-none focus:border-cyan-500 text-foreground font-semibold"
              />
              <button onClick={saveEdit} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                <Save size={14} />
              </button>
              <button onClick={() => setEditingId(null)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                <XCircle size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-1 max-w-[70%]">
              <h3 className="font-bold text-sm tracking-tight text-foreground group-hover:text-cyan-400 transition-colors duration-300">
                {project.title}
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Clock size={10} />
                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[project.status] || 'bg-muted text-muted-foreground'}`}>
              {project.status}
            </span>
            {isAdmin && (
              <button 
                onClick={() => handleDelete(project.id)}
                className="p-1.5 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-3 bg-background/50 border border-border/40 p-3 rounded-xl mb-4 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Client Designation</span>
              <select 
                value={project.client_email || ""} 
                onChange={(e) => assignUser(project.id, e.target.value)}
                className="bg-card border border-border px-2.5 py-1.5 rounded-lg text-xs font-medium w-full text-foreground focus:outline-none focus:border-cyan-500"
              >
                <option value="">Unassigned Account Link</option>
                {clientEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Progress Status Selector</span>
              <div className="flex gap-1.5">
                {['Pending', 'In Progress', 'Completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(project.id, status)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex-1 border transition-all ${project.status === status ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 scale-102' : 'bg-card border-border/50 text-muted-foreground hover:bg-background'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Project Budget / Pricing (₦)</span>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={localProjectPrice} 
                  onChange={(e) => setLocalProjectPrice(e.target.value)}
                  placeholder="Enter budget value amount"
                  className="bg-card border border-border px-2 py-1 rounded-lg text-xs w-full text-foreground font-semibold focus:outline-none"
                />
                <button 
                  onClick={handlePriceUpdateSubmit}
                  disabled={isUpdatingPrice}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition-colors flex items-center justify-center min-w-[65px]"
                >
                  {isUpdatingPrice ? <Loader2 size={12} className="animate-spin" /> : "Update"}
                </button>
              </div>
            </div>

            <button 
              onClick={() => startEdit(project)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-[10px] rounded-lg transition-colors border border-border/30"
            >
              <Edit3 size={12} /> Rename Workspace Title
            </button>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center bg-background/30 px-3 py-2 rounded-xl border border-border/30 text-xs">
            <span className="text-muted-foreground font-medium">Accounting Value:</span>
            <span className="font-extrabold text-cyan-400">₦{(Number(project.amount) || 0).toLocaleString()}</span>
          </div>

          {versions && versions.length > 0 && (
            <div className="bg-background/40 border border-border/40 rounded-xl p-3 space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Available Assets & History ({versions.length})</span>
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {versions.map((v: any) => (
                  <div key={v.id} className="flex justify-between items-center bg-card/60 p-2 rounded-lg border border-border/40 hover:border-cyan-500/20 group/version transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground truncate max-w-[140px]">{v.version_name}</span>
                      <span className="text-[9px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isAdmin && handleDeleteVersion && (
                        <button 
                          onClick={() => handleDeleteVersion(v.id)}
                          className="p-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 opacity-0 group-hover/version:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      )}
                      <button 
                        onClick={() => downloadFile(v.file_url, `${project.title}-${v.version_name}`)}
                        className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors flex items-center justify-center"
                      >
                        <Download size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mockups && mockups.length > 0 && (
            <button 
              onClick={() => setActiveMockupFullscreen(true)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/10 hover:to-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all text-left text-xs group/mockbtn"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover/mockbtn:scale-105 transition-transform">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Interactive Mockups</h4>
                  <p className="text-[10px] text-muted-foreground font-medium">Review asset visualization drafts ({mockups.length})</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider group-hover/mockbtn:bg-cyan-500/20 transition-colors">View</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mt-auto">
        <button
          onClick={() => toggleComments(project.id)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-border/80 bg-background/40 hover:bg-background/80 rounded-xl font-bold text-xs text-foreground transition-all duration-300 relative group/msgbtn"
        >
          <MessageSquare size={14} className="text-muted-foreground group-hover/msgbtn:text-cyan-400 transition-colors" />
          Project Activity Panel
          {unreadCounts[project.id] > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md border-2 border-background">
              {unreadCounts[project.id]}
            </span>
          )}
        </button>

        {isAdmin ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="flex items-center justify-center gap-1.5 p-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-colors shadow-lg shadow-cyan-500/10 text-center select-none active:scale-98">
              <Plus size={14} /> Deliver Asset
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(project.id, e.target.files[0])} 
              />
            </label>
            <label className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-500/10 text-center select-none active:scale-98">
              <ImageIcon size={14} /> Add Mockup
              <input 
                type="file" 
                multiple
                className="hidden" 
                onChange={(e) => e.target.files && handleMockupUpload && handleMockupUpload(project.id, e.target.files)} 
              />
            </label>
          </div>
        ) : (
          project.file_url && (
            <button
              onClick={() => downloadFile(project.file_url, `${project.title}-final-delivery`)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-cyan-500/10 transition-all duration-300 transform active:scale-98"
            >
              <Download size={14} /> Open & Download Latest Assets
            </button>
          )
        )}
      </div>

      <AnimatePresence>
        {openCommentsId === project.id && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full border-t border-border/60 mt-4 pt-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <span>●</span> Discussion stream logs
              </h4>
            </div>

            <div className="max-h-[180px] overflow-y-auto space-y-2.5 mb-3 p-2 bg-background/50 rounded-xl border border-border/40 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-6 font-medium italic">No dynamic log telemetry history established.</p>
              ) : (
                comments.map((c: any) => (
                  <div key={c.id} className={`flex flex-col max-w-[85%] ${c.is_admin === isAdmin ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <div className={`p-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${c.is_admin === isAdmin ? "bg-cyan-500 text-white rounded-br-none" : "bg-card border border-border/80 text-foreground rounded-bl-none"}`}>
                      <p>{c.message}</p>
                    </div>
                    <span className="text-[8px] text-muted-foreground font-semibold mt-1 px-1">
                      {c.is_admin ? "Sulaiman (Admin)" : "Client Portal"} • {new Date(c.created_at).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Submit message payload text..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendComment(project.id)}
                className="flex-1 bg-background border border-border/80 px-3 py-2 rounded-xl text-xs text-foreground font-medium focus:outline-none focus:border-cyan-500 placeholder:text-muted-foreground"
              />
              <button
                onClick={() => sendComment(project.id)}
                disabled={sendingComment}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {sendingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMockupFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[99] flex flex-col justify-between p-4 backdrop-blur-md"
          >
            <div className="flex justify-between items-center py-2 px-1 border-b border-white/10">
              <div>
                <h3 className="text-white text-sm font-black tracking-tight">{project.title}</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Interactive Multi-Mockup Viewport Matrix</p>
              </div>
              <button 
                onClick={() => setActiveMockupFullscreen(false)}
                className="p-3 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-full transition-all border border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-8 space-y-12 max-w-2xl mx-auto w-full custom-scrollbar">
              {mockups.map((m: any, index: number) => (
                <div key={m.id} className="relative bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col group/imgview">
                  <div className="p-3 bg-white/5 border-b border-white/5 text-white/50 text-[10px] font-bold flex justify-between items-center">
                    <span>VISUAL RESTRUCTURING ARCHETYPE #{index + 1}</span>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white font-mono">
                      {new Date(m.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                  <img 
                    src={m.file_url} 
                    alt={`Preview Mockup draft presentation sequential layout`}
                    className="w-full object-contain max-h-[70vh] bg-black"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600";
                    }}
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
