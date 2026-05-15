import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  ClipboardCheck,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface NavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAdmin: boolean;
}

export function DashboardNav({ activeSection, setActiveSection, isAdmin }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'projects', label: 'Projects', icon: LayoutDashboard },
    { id: 'agreements', label: 'Contracts', icon: ClipboardCheck },
    { id: 'billing', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* FLOATING HAMBURGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[110] w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-black active:scale-90 transition-transform md:top-6 md:right-6 md:bottom-auto"
      >
        <Menu size={24} strokeWidth={3} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[120]"
            />

            {/* SLIDE-OUT SIDEBAR */}
            <motion.nav 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[130] w-[280px] bg-card border-l border-border shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-black text-xl tracking-tighter text-primary">MENU</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-primary text-black font-bold' 
                          : 'hover:bg-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-sm uppercase tracking-widest font-black">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-border/50 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Sulaiman Graphics Studio v2.0
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
