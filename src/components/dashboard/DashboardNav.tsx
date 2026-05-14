import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderCanvas, 
  CreditCard, 
  Settings, 
  MessageSquare,
  ClipboardCheck
} from "lucide-react";

interface NavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAdmin: boolean;
}

export function DashboardNav({ activeSection, setActiveSection, isAdmin }: NavProps) {
  const navItems = [
    { id: 'projects', label: 'Projects', icon: LayoutDashboard },
    { id: 'agreements', label: 'Contracts', icon: ClipboardCheck },
    { id: 'billing', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] flex items-center gap-1 shadow-2xl shadow-black/50"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="relative px-4 py-3 flex flex-col items-center gap-1 group transition-all"
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-primary/20 rounded-2xl border border-primary/30"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
              
              <Icon 
                size={20} 
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-primary' : 'text-white/40 group-hover:text-white/70'
                }`} 
              />
              
              <span className={`relative z-10 text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-white/20 group-hover:text-white/40'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
