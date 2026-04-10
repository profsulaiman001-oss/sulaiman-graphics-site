import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsDropdown } from "@/components/SettingsDropdown";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about", hash: true },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "Client Hub", path: "/client-hub", special: false }, // ✨ Box removed
  { name: "Contact", path: "/contact" },
  { name: "Login", path: "/login" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Closes menu and ensures it doesn't block interactions on new pages
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-[#050a15]/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="relative z-10 group">
            <span className="font-display font-black text-2xl tracking-tighter text-white group-hover:text-blue-500 transition-colors">
              SULAIMAN<span className="text-blue-600">.</span>GRAPHICS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const isActive = !link.hash && (location === link.path || (link.path !== "/" && location.startsWith(link.path)));
              
              return (
                <Link key={link.path} href={link.path}>
                  <a className={cn(
                    "relative text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 py-2",
                    isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
                  )}>
                    {link.name}
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                      />
                    )}
                  </a>
                </Link>
              );
            })}

            <div className="w-px h-6 bg-white/10 mx-2" />
            <SettingsDropdown />
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
             <SettingsDropdown />
            <button 
              className="text-white p-2 bg-white/5 rounded-xl border border-white/10 transition-colors active:bg-white/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop to catch clicks and close menu */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-full left-4 right-4 mt-2 bg-[#0a0f1d]/98 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-4 md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-1 relative z-10">
                {links.map((link) => {
                  const isActive = !link.hash && (location === link.path);
                  
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300",
                        isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span>{link.name}</span>
                      {isActive && <motion.div layoutId="mobileDot" className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
                  }
