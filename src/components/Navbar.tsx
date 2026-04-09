import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { SettingsDropdown } from "@/components/SettingsDropdown";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about", hash: true },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "Client Hub", path: "/client-hub", special: true }, // ✨ Marked as special
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
                    "relative text-sm font-bold uppercase tracking-widest transition-all duration-300 py-2",
                    isActive ? "text-blue-500" : "text-gray-400 hover:text-white",
                    link.special && "text-blue-400 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  )}>
                    <span className="flex items-center gap-2">
                      {link.special && <Sparkles size={12} className="animate-pulse" />}
                      {link.name}
                    </span>
                    {isActive && !link.special && (
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
            
            <Link href="/contact">
              <Button size="sm" className="rounded-full px-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-tighter transition-transform active:scale-95">
                Let's Talk
              </Button>
            </Link>
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

      {/* Mobile Nav Overlay - THE PREMIUM TOUCH */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 bg-[#0a0f1d]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 md:hidden overflow-hidden"
          >
            {/* Background design elements for mobile menu */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />
            
            <div className="flex flex-col space-y-2 relative z-10">
              {links.map((link) => {
                const isActive = !link.hash && (location === link.path);
                
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-300",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                        : link.special
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span>{link.name}</span>
                    {isActive && <motion.div layoutId="mobileDot" className="w-2 h-2 bg-white rounded-full" />}
                    {link.special && !isActive && <Sparkles size={16} className="text-blue-500" />}
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <Link href="/contact">
                <Button className="w-full py-6 rounded-2xl bg-white text-blue-900 font-black uppercase tracking-widest text-xs">
                  Start a Project
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
              }
