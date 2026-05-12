import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react"; // Removed ShoppingBag import
import { cn } from "@/lib/utils";
import { SettingsDropdown } from "@/components/SettingsDropdown";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about", hash: true },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Shop", path: "/shop" }, 
  { name: "Blog", path: "/blog" },
  { name: "Client Hub", path: "/client-hub", special: false },
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
          ? "py-4 bg-[#02040a]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" 
          : "py-8 bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* FIXED: Removed italic and changed dot to text-cyan-400 */}
              <span className="relative text-xl md:text-2xl font-black tracking-tighter uppercase text-white not-italic">
                Sulaiman
                <span className="mx-0.5 text-cyan-400 group-hover:animate-pulse">.</span>
                Graphics
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
          {links.map((link) => {
            const isActive = !link.hash && (location === link.path);
            return (
              <Link key={link.path} href={link.path}>
                <a className={cn(
                  "relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  isActive 
                    ? "text-white" 
                    : "text-gray-400 hover:text-white"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="navTab"
                      className="absolute inset-0 bg-blue-600 shadow-lg shadow-blue-900/40 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </a>
              </Link>
            );
          })}
          
          <div className="ml-2 pl-2 border-l border-white/10 h-6 flex items-center">
             <SettingsDropdown />
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden flex items-center gap-4">
          <SettingsDropdown />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white shadow-xl"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-full left-4 right-4 mt-4 bg-[#02040a] border border-white/10 rounded-[2rem] shadow-2xl p-4 md:hidden overflow-hidden"
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
                      "flex items-center justify-between px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300",
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
        )}
      </AnimatePresence>
    </header>
  );
}
