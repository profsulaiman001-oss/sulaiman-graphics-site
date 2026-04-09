import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ShieldCheck, FileText, Bot, MessageSquare, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { SettingsDropdown } from "@/components/SettingsDropdown";

// Main navigation links - Login remains untouched
const mainLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about", hash: true },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Blog", path: "/blog" },
  { name: "Login", path: "/login" },
];

// Items strictly for the Client's Hub dropdown
const hubLinks = [
  { name: "Assistant", path: "/assistant", icon: Bot, desc: "24/7 Studio support" },
  { name: "Get Started", path: "/questionnaire", icon: ClipboardList, desc: "Start a new project" },
  { name: "Agreement", path: "/agreement", icon: FileText, desc: "Sign your contract" },
  { name: "Chats", path: "/chat", icon: MessageSquare, desc: "Direct messaging" },
  { name: "Verification", path: "/verify", icon: ShieldCheck, desc: "Verify client license" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setHubOpen(false);
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
            {mainLinks.map((link) => (
              <Link key={link.path} href={link.path} className="relative py-2">
                <span className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === link.path ? "text-primary" : "text-muted-foreground"
                )}>
                  {link.name}
                </span>
              </Link>
            ))}

            {/* Client Hub Dropdown - Added after Blog */}
            <div className="relative group pt-2 pb-2">
              <button 
                onMouseEnter={() => setHubOpen(true)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Client Hub <ChevronDown size={14} className={cn("transition-transform", hubOpen && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {hubOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setHubOpen(false)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-2 overflow-hidden"
                  >
                    {hubLinks.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group/item">
                          <item.icon className="text-muted-foreground group-hover/item:text-primary mt-1" size={18} />
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SettingsDropdown />

            {/* ── UPDATED: Renamed to Contact and removed the button wrapper ── */}
            <Link href="/contact" className="relative py-2">
              <span className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === "/contact" ? "text-primary" : "text-muted-foreground"
              )}>
                Contact
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-3 md:hidden">
            <SettingsDropdown />
            <button className="text-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
              {mainLinks.map((link) => (
                <Link key={link.path} href={link.path} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Client Hub</div>
              {hubLinks.map((link) => (
                <Link key={link.path} href={link.path} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground flex items-center gap-3">
                  <link.icon size={16} /> {link.name}
                </Link>
              ))}

              {/* Mobile Contact Link */}
              <Link href="/contact" className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
