import React from 'react';
import { Edit3, Trash2, HardDrive, CheckCircle, Clock, Loader2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  client: string;
  status: 'completed' | 'active' | 'pending';
  progress: number;
  link?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isAdmin: boolean;
  handleStatusChange: (id: string, status: any) => void;
  startEdit: (project: Project) => void;
  handleDelete: (id: string) => void;
  handleUpload: (e: any, id: string) => void;
}

export function ProjectCard({
  project,
  index,
  isAdmin,
  handleStatusChange,
  startEdit,
  handleDelete,
  handleUpload
}: ProjectCardProps) {
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="bg-card/40 border border-border/40 hover:border-border rounded-2xl p-5 transition-all duration-200 group backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`w-2 h-2 rounded-full ${
              project.status === 'completed' ? 'bg-cyan-500' :
              project.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
            }`} />
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              {project.status}
            </span>
          </div>

          <h4 className="font-semibold text-foreground truncate group-hover:text-cyan-400 transition text-sm">
            {project.title}
          </h4>
          
          <p className="text-xs text-muted-foreground mt-1 truncate">
            Client: {project.client || 'Anonymous'}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-background border border-border/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  project.status === 'completed' ? 'bg-cyan-500' :
                  project.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(Math.max(project.progress, 0), 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground min-w-[28px] text-right">
              {project.progress}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {project.link && (
            <a 
              href={project.link}
              target="_blank" 
              rel="noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-cyan-700/60 text-cyan-500 bg-background hover:bg-cyan-600/10 hover:border-cyan-600 transition"
            >
              <Download size={10} />
            </a>
          )}
          
          {isAdmin && (
            <>
              <select 
                value={project.status} 
                onChange={(e) => handleStatusChange(project.id, e.target.value)}
                className="w-7 h-7 text-[10px] p-0 text-center rounded-lg border border-border bg-background hover:border-cyan-500 focus:outline-none appearance-none"
              >
                <option value="completed">✓</option>
                <option value="active">●</option>
                <option value="pending">○</option>
              </select>

              <label className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-foreground hover:border-cyan-500 bg-background cursor-pointer transition relative">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleUpload(e, project.id)} 
                />
                <HardDrive size={10} />
              </label>
              
              <button 
                onClick={() => startEdit(project)} 
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-yellow-700/60 text-yellow-500 bg-background hover:bg-yellow-600/10 hover:border-yellow-600 transition"
              >
                <Edit3 size={10} />
              </button>
              
              <button 
                onClick={() => handleDelete(project.id)} 
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-700/60 text-red-500 bg-background hover:bg-red-600/10 hover:border-red-600 transition"
              >
                <Trash2 size={10} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
