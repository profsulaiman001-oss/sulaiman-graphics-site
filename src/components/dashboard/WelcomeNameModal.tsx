import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Loader2 } from "lucide-react";

interface WelcomeNameModalProps {
  showNamePrompt: boolean;
  fullName: string;
  setFullName: (name: string) => void;
  saveProfileName: () => void;
  submittingName: boolean;
}

export default function WelcomeNameModal({
  showNamePrompt,
  fullName,
  setFullName,
  saveProfileName,
  submittingName,
}: WelcomeNameModalProps) {
  return (
    <AnimatePresence>
      {showNamePrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div 
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <UserCheck size={24} className="text-primary" />
              </div>
              <h2 className="text-xl font-display font-black text-foreground mb-1">Welcome to Your Portal</h2>
              <p className="text-sm text-muted-foreground">Let's personalize your experience. What is your name?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground"
                  autoFocus
                />
              </div>

              <button 
                onClick={saveProfileName}
                disabled={!fullName.trim() || submittingName}
                className="w-full bg-primary hover:opacity-90 disabled:bg-primary/50 text-white font-semibold text-sm px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {submittingName ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Save & Continue"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
