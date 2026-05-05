import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit3, Trash2, Save, XCircle, CheckCircle, Clock, Loader2, Download, 
  MessageSquare, HardDrive, Send 
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
  newCommentIcon?: any; // To allow for icon customization if needed
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
  return (
    <motion.div 
      key={project.id}
      className="bg-card border border-border rounded-2xl overflow-hidden aspect-square flex flex-col justify-between"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
        <div className="flex-1 min-w-0">
          {editingId === project.id ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-background border border-border rounded-md px-1.5 py-0.5 text-xs focus:border-primary outline-none transition text-foreground w-full max-w-[120px]"
              />
              <button onClick={saveEdit} className="text-primary hover:text-primary/80">
                <Save size={12} />
              </button>
              <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-400">
                <XCircle size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground truncate block">{project.title}</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground block truncate mt-0.5">{project.client_email}</span>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[project.status] || "bg-card text-foreground"}`}>
          {project.status}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {openCommentsId === project.id ? (
            <motion.div 
              className="absolute inset-0 p-3 flex flex-col bg-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1 overflow-y-auto space-y-3 mb-2 pr-1 custom-scrollbar text-left">
                {comments.length > 0 ? (
                  comments.map((msg: any) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.is_admin === isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[8px] font-semibold text-muted-foreground mb-0.5">
                        {msg.is_admin ? "Sulaiman Graphics" : "Client"}
                      </span>
                      <div 
                        className={`p-1.5 rounded-lg max-w-[85%] text-[10px] leading-snug break-words ${
                          msg.is_admin === isAdmin 
                            ? 'bg-primary text-white' 
                            : 'bg-muted border border-border text-foreground'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[7px] text-muted-foreground mt-0.5">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-[10px] italic py-2">
                    No messages yet. Start chatting!
                  </div>
                )}
              </div>
              
              <div className="flex gap-1 border-t border-border pt-2 bg-card">
                {isAdmin && (
                  <label className="w-6 h-6 flex items-center justify-center rounded-lg border border-border text-muted-foreground bg-background hover:bg-muted transition cursor-pointer flex-shrink-0">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(project.id, e.target.files[0]);
                        }
                      }}
                    />
                    <HardDrive size={10} />
                  </label>
                )}
                
                <input
                  type="text"
                  placeholder="Type here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendComment(project.id)}
                  className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-[10px] outline-none text-foreground min-w-0 h-6 focus:border-primary"
                />
                <button
                  onClick={() => sendComment(project.id)}
                  disabled={sendingComment || !newComment.trim()}
                  className="bg-primary hover:opacity-90 disabled:opacity-50 text-white font-medium text-[10px] w-6 h-6 rounded-lg transition flex items-center justify-center flex-shrink-0"
                >
                  {sendingComment ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border ${
                project.status === "Completed" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                project.status === "In Progress" ? "bg-blue-500/10 border-blue-500/20 text-primary" :
                "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
              }`}>
                {project.status === "Completed" ? <CheckCircle size={28} /> : <Clock size={28} />}
              </div>
              
              <div className="text-[10px] text-muted-foreground line-clamp-2 max-w-[180px]">
                Created on {new Date(project.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 bg-muted/20 border-t border-border mt-auto">
        <div className="flex flex-col gap-2">
          {project.file_url ? (
            <div className="flex gap-1.5 w-full">
              <button 
                onClick={() => downloadFile(project.file_url, `${project.title}-design`)}
                className="flex-1 h-7 flex items-center justify-center gap-1 rounded-lg bg-primary hover:opacity-90 text-white font-medium text-[10px] transition"
              >
                <Download size={10} />
                Download Assets
              </button>
            </div>
          ) : (
            !isAdmin && (
              <div className="w-full text-center text-muted-foreground text-[10px] italic py-1.5">
                Waiting for assets to be uploaded...
              </div>
            )
          )}

          <div className="flex justify-between items-center">
            <button 
              onClick={() => toggleComments(project.id)}
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium relative"
            >
              <MessageSquare size={12} />
              Messages
              {unreadCounts[project.id] > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {unreadCounts[project.id]}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <select
                  value={project.client_email || ""}
                  onChange={(e) => assignUser(project.id, e.target.value)}
                  className="bg-background border border-border rounded-lg px-1.5 py-1 text-[10px] focus:border-primary outline-none transition text-muted-foreground max-w-[100px]"
                >
                  <option value="">Assign Email</option>
                  {clientEmails.map((email: string) => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
              )}
              
              {isAdmin && (
                <select
                  value={project.status}
                  onChange={(e) => updateStatus(project.id, e.target.value)}
                  className="bg-background border border-border rounded-lg px-1.5 py-1 text-[10px] focus:border-primary outline-none transition text-muted-foreground"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">Active</option>
                  <option value="Completed">Done</option>
                </select>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-1 pt-1 justify-end">
              {project.file_url ? (
                <div className="text-[9px] text-green-500 flex items-center gap-0.5 flex-1 truncate">
                  <CheckCircle size={8} /> File Uploaded
                </div>
              ) : (
                <div className="text-[9px] text-muted-foreground flex items-center gap-0.5 flex-1 truncate">
                  <Clock size={8} /> No files yet
                </div>
              )}
              
              <>
                <label className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary/40 text-primary bg-background hover:bg-primary/10 hover:border-primary transition cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(project.id, e.target.files[0]);
                      }
                    }}
                  />
                  <HardDrive size={10} />
                </label>
                
                <button onClick={() => startEdit(project)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-yellow-700/60 text-yellow-500 bg-background hover:bg-yellow-600/10 hover:border-yellow-600 transition">
                  <Edit3 size={10}/>
                </button>
                
                <button onClick={() => handleDelete(project.id)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-700/60 text-red-500 bg-background hover:bg-red-600/10 hover:border-red-600 transition">
                  <Trash2 size={10}/>
                </button>
              </>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
