import React from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, X } from 'lucide-react';

interface ProjectCommentsProps {
  projectId: string;
  openCommentsId: string | null;
  comments: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  sendingComment: boolean;
  sendComment: (projectId: string) => void;
  toggleComments: (projectId: string) => void;
  isAdmin: boolean;
}

export function ProjectComments({
  projectId,
  openCommentsId,
  comments,
  newComment,
  setNewComment,
  sendingComment,
  sendComment,
  toggleComments,
  isAdmin
}: ProjectCommentsProps) {
  if (openCommentsId !== projectId) return null;

  return (
    <motion.div
      className="absolute inset-0 p-3 flex flex-col bg-card z-30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Studio Discussion</span>
        <button onClick={() => toggleComments(projectId)} className="text-muted-foreground hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1 custom-scrollbar">
        {comments.length > 0 ? (
          comments.map((msg: any) => (
            <div key={msg.id} className={`flex flex-col ${msg.is_admin === isAdmin ? 'items-end' : 'items-start'}`}>
              <span className="text-[7px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">
                {msg.is_admin ? "Sulaiman Graphics" : "Client"}
              </span>
              {/* UPDATED: Rectangular with Fillets (rounded-xl) */}
              <div className={`max-w-[85%] rounded-xl px-3 py-2.5 text-[11px] leading-relaxed shadow-sm ${
                msg.is_admin === isAdmin 
                  ? 'bg-cyan-600 text-white rounded-tr-none' 
                  : 'bg-muted border border-border/50 text-foreground rounded-tl-none'
              }`}>
                {msg.message}
              </div>
              <span className="text-[7px] text-muted-foreground mt-1 opacity-70">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] italic">No messages yet.</div>
        )}
      </div>
      
      <div className="flex gap-2 items-center pt-3 border-t border-border/20">
        <input 
          type="text" 
          placeholder="Reply to project..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendComment(projectId)}
          /* FIXED: Studio Dark Input Style */
          className="flex-1 px-4 py-2 text-[11px] bg-[#0d0d0d] border border-border/40 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
        />
        <button 
          onClick={() => sendComment(projectId)}
          disabled={sendingComment || !newComment.trim()}
          className="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center disabled:opacity-50"
        >
          {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        </button>
      </div>
    </motion.div>
  );
}
