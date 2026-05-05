import { Plus } from "lucide-react";

interface AdminFormsProps {
  isAdmin: boolean;
  createProject: (e: React.FormEvent) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newClient: string;
  setNewClient: (val: string) => void;
  clientEmails: string[];
}

export function AdminForms({
  isAdmin,
  createProject,
  newTitle,
  setNewTitle,
  newClient,
  setNewClient,
  clientEmails,
}: AdminFormsProps) {
  if (!isAdmin) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-8 max-w-2xl">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Quick Create Project
      </h2>
      <form onSubmit={createProject} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Project Title (e.g., Brand Identity)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground"
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-muted-foreground"
          >
            <option value="">Assign to Client</option>
            {clientEmails.map((email: string) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
          
          <button
            type="submit"
            className="bg-primary hover:opacity-90 text-white font-medium text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </form>
    </div>
  );
}
