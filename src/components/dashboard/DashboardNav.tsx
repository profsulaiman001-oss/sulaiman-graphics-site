import React from 'react';
import { LayoutDashboard, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAdmin: boolean;
}

export function DashboardNav({ activeSection, setActiveSection, isAdmin }: NavProps) {
  const navItems = [
    { id: 'projects', label: 'Projects', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat Room', icon: MessageSquare },
    { id: 'billing', label: 'Account', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm bg-card/90 backdrop-blur-xl border border-border/60 rounded-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 relative flex-1 ${
                isActive ? 'text-cyan-400 font-bold' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomNavPill"
                  className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <Icon size={18} className={isActive ? "scale-110 text-cyan-400" : "scale-100 transition-transform duration-200"} />
              <span className="text-[10px] mt-1 tracking-tight uppercase font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
                                                                                                      }
