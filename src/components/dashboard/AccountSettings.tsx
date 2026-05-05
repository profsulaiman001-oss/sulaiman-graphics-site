import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, LogOut } from "lucide-react";

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isAdmin: boolean;
  handleSignOut: () => void;
}

export default function AccountSettings({
  isOpen,
  onClose,
  userEmail,
  isAdmin,
  handleSignOut,
}: AccountSettingsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-display font-black text-foreground flex items-center gap-2">
                <Settings size={20} className="text-primary" /> Account Settings
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border hover:border-red-500 transition text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase mb-1 block">Account Email</label>
                <div className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground">
                  {userEmail}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase mb-1 block">Role</label>
                <div className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-primary font-medium">
                  {isAdmin ? "Administrator" : "Client Account"}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 bg-background border border-border hover:bg-muted text-foreground font-medium text-sm px-4 py-3 rounded-xl transition"
                >
                  Close
                </button>
                
                <button 
                  onClick={handleSignOut}
                  className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500 text-red-500 hover:text-white font-medium text-sm px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
