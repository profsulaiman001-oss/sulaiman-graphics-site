import { useState, useRef, useEffect } from "react";
import { Settings, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with HTML attribute for the CSS variables we set up
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Gear Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-black/20 transition-colors duration-200 focus:outline-none"
        aria-label="Settings"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Settings size={20} className="text-foreground" />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-card border border-border shadow-lg p-4 z-50"
          >
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-muted-foreground px-1">
                Preferences
              </span>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Theme</span>
                
                {/* Neumorphic Toggle Switch */}
                <div
                  onClick={toggleTheme}
                  className={`relative w-14 h-7 rounded-full cursor-pointer flex items-center p-0.5 transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-[#0f0f11] shadow-[inset_2px_2px_4px_#050505,inset_-2px_-2px_4px_#1c1c22]"
                      : "bg-[#e0e0e0] shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff]"
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-[#1c1c22] shadow-[2px_2px_4px_#0a0a0d,-2px_-2px_4px_#2e2e37] text-blue-400"
                        : "bg-[#e0e0e0] shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff] text-amber-600"
                    }`}
                    style={{
                      marginLeft: theme === "dark" ? "0px" : "28px",
                    }}
                  >
                    {theme === "dark" ? (
                      <Moon size={12} fill="currentColor" />
                    ) : (
                      <Sun size={12} fill="currentColor" />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
          }
