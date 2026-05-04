import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';

interface ProjectManagementProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newClient: string;
  setNewClient: (val: string) => void;
  handleCreateProject: (e: React.FormEvent) => void;
  isAdmin: boolean;
}

export function ProjectManagement({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  newTitle,
  setNewTitle,
  newClient,
  setNewClient,
  handleCreateProject,
  isAdmin
}: ProjectManagementProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card/40 border border-border/40 p-4 rounded-2xl backdrop-blur-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border/50 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-background border border-border/50 rounded-xl focus:outline-none focus:border-cyan-500 text-foreground appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Project Form for Admin */}
      {isAdmin && (
        <form onSubmit={handleCreateProject} className="bg-card/40 border border-border/40 p-5 rounded-2xl backdrop-blur-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Add New Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-2">Project Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Brand Identity"
                className="w-full px-4 py-2.5 text-xs bg-background border border-border/50 rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-2">Client Name</label>
              <input
                type="text"
                required
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="e.g. Client Name"
                className="w-full px-4 py-2.5 text-xs bg-background border border-border/50 rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Plus size={16} /> Create Project
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
