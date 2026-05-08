import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, CheckCircle, Clock, Loader2, Download, 
  MessageSquare, HardDrive, Send, thumbsUp, RotateCcw
} from "lucide-react";

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
  newComment: string;
  setNewComment: (val: string) => void;
  sendingComment: boolean;
  sendComment: (id: string) => void;
  unreadCounts: { [key: string]: number };
  clientEmails: string[];
  downloadFile: (url: string, filename: string) => void;
  statusColors: { [key: string]: string };
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
  newComment,
  setNewComment,
  sendingComment,
  sendComment,
  unreadCounts,
  clientEmails,
  downloadFile,
  statusColors,
}: ProjectCardProps) {

  // Updated Progress Logic to include "Awaiting Review"
  const getProgress = (status: string) => {
    if (status === "Completed") return 100;
    if (status === "Awaiting Review") return 85;
    if (status === "In Progress") return 65;
    return 25;
  };

  return (
    <motion.div 
      key={project.id}
      className="bg-card border border-border/60 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
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
                className="bg-background border border-border rounded-md px-2 py-1 text-xs focus:border-primary outline-none text-foreground w-full max-w-[150px]"
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
      <div className="flex-1 min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden bg-muted/5">
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
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] italic">No messages yet.</div>
                )}
              </div>
              
              <div className="flex gap-1.5 border-t border-border pt-2">
                {isAdmin && (
                  <label className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted cursor-pointer transition-colors">
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files && handleFileUpload(project.id, e.target.files[0])} />
                    <HardDrive size={12} className="text-muted-foreground" />
                  </label>
                )}
                <input
                  type="text"
                  placeholder="Reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendComment(project.id)}
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 text-[10px] outline-none focus:border-primary transition-all"
                />
                <button onClick={() => sendComment(project.id)} disabled={sendingComment || !newComment.trim()} className="bg-primary text-white w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50">
                  {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div className="flex flex-col items-center justify-center p-4 w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {project.file_url ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img src={project.file_url} className="max-h-full max-w-full object-contain rounded-lg shadow-xl" alt="Preview" />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                    <CheckCircle className="text-primary" size={30} />
                  </div>
                </div>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
                    project.status === "Completed" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                  }`}>
                    {project.status === "Completed" ? <CheckCircle size={28} /> : <Clock size={28} className="animate-pulse" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    {project.status === "Completed" ? "Approved" : "In Production"}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PROGRESS BAR */}
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
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-muted/5 border-t border-border">
        <div className="flex flex-col gap-3">
          
          {/* CLIENT APPROVAL VIEW */}
          {!isAdmin && project.status === "Awaiting Review" ? (
            <div className="flex flex-col gap-2">
              <span className="text-[8px] font-bold text-center text-purple-500 uppercase tracking-widest">Design Awaiting Approval</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateStatus(project.id, "Completed")}
                  className="h-8 flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-[10px] transition-all shadow-md active:scale-95"
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button 
                  onClick={() => toggleComments(project.id)}
                  className="h-8 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] transition-all active:scale-95"
                >
                  <RotateCcw size={12} /> Revision
                </button>
              </div>
            </div>
          ) : project.file_url ? (
            <button 
              onClick={() => downloadFile(project.file_url, `${project.title}-design`)}
              className="w-full h-8 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Download size={12} /> Download Final Assets
            </button>
          ) : !isAdmin && (
            <div className="w-full text-center text-muted-foreground text-[9px] py-2 border border-dashed border-border rounded-xl font-medium uppercase tracking-tight">
              Design production in progress...
            </div>
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
                    className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] outline-none max-w-[80px] text-muted-foreground"
                  >
                    <option value="">Assign</option>
                    {clientEmails.map(email => <option key={email} value={email}>{email}</option>)}
                  </select>
                  <select 
                    value={project.status} 
                    onChange={(e) => updateStatus(project.id, e.target.value)}
                    className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] outline-none text-muted-foreground"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">Active</option>
                    <option value="Awaiting Review">Review</option>
                    <option value="Completed">Done</option>
                  </select>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={12}/></button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
