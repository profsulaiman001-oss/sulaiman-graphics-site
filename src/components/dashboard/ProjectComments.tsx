import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="absolute inset-0 p-3 flex flex-col bg-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discussion</span>
        <button 
          onClick={() => toggleComments(projectId)}
          className="text-muted-foreground hover:text-foreground transition p-1"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2.5 mb-2 pr-1 text-left">
        {comments.length > 0 ? (
          comments.map((msg: any) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.is_admin === isAdmin ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs ${
                msg.is_admin === isAdmin 
                  ? 'bg-cyan-600/10 border border-cyan-500/20 text-foreground' 
                  : 'bg-muted border border-border text-foreground'
              }`}>
                <p className="break-words">{msg.message}</p>
              </div>
              <span className="text-[8px] text-muted-foreground mt-0.5 px-0.5">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <span className="text-[10px] text-muted-foreground">No messages yet. Start the conversation below.</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 items-center mt-auto pt-2 border-t border-border/50">
        <input 
          type="text" 
          placeholder="Type a message..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendComment(projectId);
            }
          }}
          className="flex-1 px-3 py-2 text-[11px] bg-background border border-border/50 rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
        />
        <button 
          onClick={() => sendComment(projectId)}
          disabled={sendingComment || !newComment.trim()}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center"
        >
          {sendingComment ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </motion.div>
  );
}
