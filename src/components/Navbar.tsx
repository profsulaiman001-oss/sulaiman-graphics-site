import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
/* ── Added the import for your new Settings Dropdown ── */
import { SettingsDropdown } from "@/components/SettingsDropdown";

// 🔥 UPDATED: Added Agreement & Assistant, reduced footprint!
const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about", hash: true },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "Agreement", path: "/agreement" }, // 👈 📄 Added your contract generator!
  { name: "Assistant", path: "/assistant" }, 
  { name: "Get Started", path: "/questionnaire" },
  { name: "Chat", path: "/chat" },           
  { name: "Contact", path: "/contact" },
  { name: "Login", path: "/login" },
  { name: "Settings", path: "/settings" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
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
              const isActive =
                !link.hash &&
                (location === link.path ||
                  (link.path !== "/" && location.startsWith(link.path)));

              const isAboutActive = link.hash && location === "/";

              if (link.hash) {
                return (
                  <a key={link.path} href={link.path} className="relative py-2">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isAboutActive
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.name}
                    </span>
                  </a>
                );
              }

              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className="relative py-2"
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* ── Settings Dropdown Inserted Here (Icon fallback) ── */}
            <div className="ml-2">
              <SettingsDropdown />
            </div>

            <Link href="/contact">
              <Button size="sm">Let's Talk</Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              className="relative z-10 text-foreground p-2"
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-2xl p-4 md:hidden"
          >
            {/* 🛠️ Fixed: Kept spacing at space-y-1 to keep it tight */}
            <div className="flex flex-col space-y-1">
              {links.map((link) => {
                const isActive =
                  !link.hash &&
                  (location === link.path ||
                    (link.path !== "/" && location.startsWith(link.path)));

                if (link.hash) {
                  return (
                    <a
                      key={link.path}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      // 🛠️ Fixed: Reduced py-2 to py-1.5 and text-base to text-sm
                      className="px-4 py-1.5 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    // 🛠️ Fixed: Reduced py-2 to py-1.5 and text-base to text-sm
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    {link.name}
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
