import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  X, Briefcase, MessageSquare, CreditCard, 
  User, Shield, Layers, ChevronRight, Sparkles 
} from "lucide-react";

interface DashboardNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAdmin: boolean;
}

export function DashboardNav({ activeSection, setActiveSection, isAdmin }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<{
    full_name: string | null;
    business_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, business_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    }

    fetchProfileData();
  }, [isOpen]);

  const navigationItems = [
    { id: "projects", label: "Project Core", icon: Briefcase, desc: "Active workspace matrices" },
    { id: "chat", label: "Live Nexus", icon: MessageSquare, desc: "Secure operational channel" },
    { id: "billing", label: "Ledger Desk", icon: CreditCard, desc: "Statements & balances" },
  ];

  return (
    <>
      {/* PINNED INLINE NAVIGATION TRIGGER - FLUID PADDING FRAME */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center text-black active:scale-95 transition-all border border-cyan-300/30 group relative flex-shrink-0"
      >
        <span className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <Layers size={18} className="animate-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* AMBIENT GLASS BACKDROP OVERLAY */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[200]"
            />

            {/* PREMIUM SIDEBAR CONTROL DRAWER - ANCHORED LEFT */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 180 }}
              className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-neutral-950/95 border-r border-cyan-500/10 z-[201] flex flex-col justify-between p-6 shadow-[5px_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            >
              <div>
                {/* DRAWER TOP BAR CONTROLLER */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-bold tracking-widest text-cyan-400/80 uppercase">System Navigation</span>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-muted-foreground hover:text-white hover:border-neutral-700 active:scale-90 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* ADVANCED PROFILE BRANDING HUB ELEMENT */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-neutral-900/80 to-neutral-900/20 border border-neutral-800/60 mb-8 relative overflow-hidden group shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Sparkles size={40} className="text-cyan-400" />
                  </div>
                  
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="relative">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Identity Anchor" 
                          className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-cyan-400">
                          <User size={20} />
                        </div>
                      )}
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black rounded-md p-0.5 border border-neutral-950 shadow-lg">
                          <Shield size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate tracking-tight">
                        {profile?.full_name || "Synchronizing Profile..."}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        {profile?.business_name || (isAdmin ? "Master Administration" : "Studio Partner")}
                      </p>
                    </div>
                  </div>

                  {/* Status metadata pill */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Access Clearance</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold tracking-wider uppercase ${isAdmin ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {isAdmin ? "Root Admin" : "Verified Client"}
                    </span>
                  </div>
                </div>

                {/* MODERNIZE HIGH-END INTERACTIVE LINK GRID */}
                <div className="space-y-2.5">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all relative ${
                          isSelected 
                            ? "bg-gradient-to-r from-cyan-950/40 to-neutral-900 border border-cyan-500/30 text-cyan-400 shadow-[0_4px_20px_rgba(0,0,0,0.4)]" 
                            : "bg-neutral-900/30 hover:bg-neutral-900/80 border border-transparent hover:border-neutral-800 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected ? "bg-cyan-500/10 text-cyan-400" : "bg-neutral-900 text-muted-foreground group-hover:text-white group-hover:bg-neutral-800"
                          }`}>
                            <IconComponent size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold tracking-tight">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground/70 truncate group-hover:text-muted-foreground transition-colors">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight 
                          size={14} 
                          className={`transform transition-transform duration-300 ${
                            isSelected ? "text-cyan-400 translate-x-0" : "text-muted-foreground/30 group-hover:translate-x-1 group-hover:text-muted-foreground"
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRAWER SIGNATURE FOOTER */}
              <div className="pt-4 border-t border-neutral-900 flex flex-col gap-1 text-[10px] tracking-widest uppercase font-bold text-neutral-600">
                <span>Sulaiman Graphics Studio</span>
                <span className="text-[9px] font-medium tracking-normal text-neutral-700 text-left lowercase font-mono">v2.4.0 // node_stable</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
