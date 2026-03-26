import { Link } from "wouter";
import { ArrowUpRight, Instagram, Twitter } from "lucide-react";
import { Button } from "./Button";

/* Real social links */
const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/profsulaiman001" },
  { icon: Twitter,   label: "X / Twitter", href: "https://x.com/profsulaiman001" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display font-black text-3xl tracking-tighter text-foreground">
                SULAIMAN<span className="text-primary">.</span>GRAPHICS
              </span>
            </Link>
            <p className="text-muted-foreground text-lg max-w-sm mb-8">
              Creativity without limits. Crafting bold visuals that elevate brands and capture attention.
            </p>
            <div className="flex items-center gap-4">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { label: "Portfolio", path: "/portfolio" },
                { label: "About",     path: "/#about" },
                { label: "Services",  path: "/services" },
                { label: "Contact",   path: "/contact" },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link
                    href={path}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight
                      size={14}
                      className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">
              Subscribe for design tips and project updates.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <Button className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
