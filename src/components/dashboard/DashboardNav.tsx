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
      {/* PINNED INLINE NAVIGATION TRIGGER - HIGH VISIBILITY GRADIENT GLOW */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center text-black active:scale-95 transition-all border border-cyan-300/40 group relative flex-shrink-0"
      >
        <span className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <Layers size={18} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* AMBIENT BLACK INSULATING OVERLAY */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />

            {/* PREMIUM SIDEBAR CONTROL DRAWER - SOLID TRUE BLACK BACKGROUND */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 180 }}
              className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-black border-r border-neutral-900 z-[201] flex flex-col justify-between p-6 shadow-[10px_0_50px_rgba(0,0,0,0.9)]"
            >
              <div>
                {/* DRAWER TOP BAR CONTROLLER */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs font-black tracking-widest text-white uppercase">
                      Navigation
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* ORIGINAL DESIGN HIGH-CONTRAST PROFILE INFOBAR BRANDING */}
                <div className="mb-8 relative overflow-hidden">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Identity Anchor" 
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-black border border-neutral-800">
                          U
                        </div>
                      )}
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-white text-black rounded-md p-0.5 shadow-lg">
                          <Shield size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white truncate uppercase tracking-wide">
                        {profile?.full_name || "Synchronizing..."}
                      </h4>
                      <p className="text-xs font-bold text-neutral-400 truncate uppercase tracking-wider">
                        {profile?.business_name || (isAdmin ? "Master Admin" : "Studio Partner")}
                      </p>
                    </div>
                  </div>

                  {/* Operational Tier Label Badge */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-neutral-500 uppercase">Tier:</span>
                    <span className="text-[10px] font-black tracking-widest text-white uppercase bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                      {isAdmin ? "Root Administrator" : "Verified Client"}
                    </span>
                  </div>
                </div>

                {/* MODERNIZE HIGH-END INTERACTIVE LINK GRID */}
                <div className="space-y-2">
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
                        className={`w-full text-left p-4 rounded-xl flex items-center justify-between group transition-all ${
                          isSelected 
                            ? "bg-white text-black font-black shadow-lg" 
                            : "hover:bg-neutral-900 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <IconComponent 
                            size={20} 
                            className={isSelected ? "text-black" : "text-neutral-400 group-hover:text-white"} 
                          />
                          <span className="text-sm uppercase tracking-widest font-black">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight 
                          size={16} 
                          className={`transform transition-transform ${
                            isSelected ? "text-black translate-x-0" : "text-neutral-600 group-hover:translate-x-1 group-hover:text-white"
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DRAWER SIGNATURE FOOTER */}
              <div className="pt-4 border-t border-neutral-900 text-[10px] tracking-widest uppercase font-black text-neutral-600">
                Sulaiman Graphics Studio
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
