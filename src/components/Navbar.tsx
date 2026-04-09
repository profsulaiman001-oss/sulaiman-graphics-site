import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { SettingsDropdown } from "@/components/SettingsDropdown";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about", hash: true },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
  { name: "Login", path: "/login" },
];

const clientTools = [
  { name: "Get Started", path: "/questionnaire" },
  { name: "Agreement", path: "/agreement" },
  { name: "Design Assistant", path: "/assistant" },
  { name: "Client Chat", path: "/chat" },
  { name: "Verification", path: "/verify" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopDropdownOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-background/80 backdrop-blur-md border-border py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="relative z-10 group">
            <span className="font-display font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
              SULAIMAN<span className="text-primary">.</span>GRAPHICS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((link) => {
              const isActive = !link.hash && (location === link.path || (link.path !== "/" && location.startsWith(link.path)));
              
              if (link.hash) {
                return (
                  <a key={link.path} href={link.path} className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary">
                    {link.name}
                  </a>
                );
              }

              return (
                <Link key={link.path} href={link.path} className={cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary" : "text-muted-foreground")}>
                  {link.name}
                </Link>
              );
            })}

            {/* ── CLEANED UP: Client Hub Dropdown ── */}
            <div 
              className="relative"
              onMouseEnter={() => setDesktopDropdownOpen(true)}
              onMouseLeave={() => setDesktopDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-bold text-blue-900 hover:text-primary transition-colors">
                Client Hub <ChevronDown size={14} className={cn("transition-transform", desktopDropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {desktopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-48 bg-card border border-border rounded-2xl shadow-xl p-2 mt-2 overflow-hidden"
                  >
                    {clientTools.map((tool) => (
                      <Link key={tool.path} href={tool.path}>
                        <a className="block px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-all">
                          {tool.name}
                        </a>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SettingsDropdown />

            <Link href="/contact">
              <Button size="sm">Let's Talk</Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button className="relative z-10 text-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-2xl p-4 md:hidden overflow-y-auto max-h-[80vh]"
          >
            <div className="flex flex-col space-y-1">
              {links.map((link) => (
                <Link key={link.path} href={link.path} className={cn("px-4 py-2 rounded-xl text-sm font-medium", location === link.path ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-border my-2 mx-4" />
              <p className="px-4 text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-1">Client Tools</p>
              
              {clientTools.map((tool) => (
                <Link key={tool.path} href={tool.path} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-blue-50 hover:text-blue-900">
                  {tool.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
