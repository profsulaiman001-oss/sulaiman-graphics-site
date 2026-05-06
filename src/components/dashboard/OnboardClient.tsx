import React from 'react';
import { Mail, UserCheck, Loader2 } from 'lucide-react';

interface OnboardClientProps {
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  handleInviteClient: (e: React.FormEvent) => void;
  loading: boolean;
}

export function OnboardClient({
  inviteEmail,
  setInviteEmail,
  handleInviteClient,
  loading,
}: OnboardClientProps) {
  return (
    <div className="bg-card/40 border border-border/40 p-5 rounded-2xl backdrop-blur-sm mt-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <UserCheck size={16} className="text-cyan-500" /> Onboard Client
      </h3>
      
      <form onSubmit={handleInviteClient} className="flex flex-col gap-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Client email address to onboard..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-background border border-border/50 rounded-xl focus:outline-none focus:border-cyan-500 text-foreground"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !inviteEmail}
          className="w-full bg-background border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-500 font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            'Send Invitation'
          )}
        </button>
      </form>
    </div>
  );
}
