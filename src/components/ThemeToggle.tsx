import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Sync with HTML attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-center p-2">
      {/* Outer Neumorphic Track */}
      <div
        onClick={toggleTheme}
        className={`relative w-20 h-10 rounded-full cursor-pointer flex items-center p-1 transition-all duration-500 ${
          theme === "dark"
            ? "bg-[#0f0f11] shadow-[inset_3px_3px_6px_#050505,inset_-3px_-3px_6px_#1c1c22]"
            : "bg-[#e0e0e0] shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff]"
        }`}
      >
        {/* Glowing Indicator Background */}
        <div className="absolute inset-1 flex justify-between items-center px-2 text-xs z-0 pointer-events-none">
          <Moon
            size={14}
            className={`transition-opacity duration-300 ${
              theme === "dark" ? "text-blue-500 opacity-100" : "text-gray-400 opacity-40"
            }`}
            fill={theme === "dark" ? "currentColor" : "none"}
          />
          <Sun
            size={14}
            className={`transition-opacity duration-300 ${
              theme === "light" ? "text-amber-500 opacity-100" : "text-gray-600 opacity-40"
            }`}
            fill={theme === "light" ? "currentColor" : "none"}
          />
        </div>

        {/* Neumorphic Sliding Thumb */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`w-8 h-8 rounded-full z-10 flex items-center justify-center transition-all duration-500 ${
            theme === "dark"
              ? "bg-[#1c1c22] shadow-[3px_3px_6px_#0a0a0d,-3px_-3px_6px_#2e2e37] text-blue-400"
              : "bg-[#e0e0e0] shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] text-amber-600"
          }`}
          style={{
            marginLeft: theme === "dark" ? "0px" : "40px",
          }}
        >
          {theme === "dark" ? (
            <Moon size={14} fill="currentColor" />
          ) : (
            <Sun size={14} fill="currentColor" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
