import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react"; 

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Try to log them in first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 2. If it fails because the user doesn't exist, SIGN THEM UP!
    if (error && (error.message.includes("Invalid login credentials") || error.message.includes("User not found"))) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        alert("Failed to create account: " + signUpError.message);
        setLoading(false);
        return;
      }

      alert("Account created successfully! Welcome to your portal.");
      setLocation("/dashboard");
      setLoading(false);
      return;
    }

    // 3. If there was a different error (like a network issue), show it
    if (error) {
      alert("Login failed: " + error.message);
      setLoading(false);
      return;
    }

    // 4. If login was successful, proceed to dashboard
    if (data.session) {
      setLocation("/dashboard");
    } else {
      alert("Login successful but no session found.");
    }

    setLoading(false);
  };

  return (
    // Replaced hardcoded bg-black with the global bg-background variable
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      
      {/* Background aesthetic blobs using your primary glow variable */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl -z-10 animate-pulse delay-1000"></div>

      {/* Header Branding */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display font-black text-2xl tracking-tighter text-foreground mb-1">
          SULAIMAN <span className="text-primary">GRAPHICS</span>
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Design Portal</p>
      </motion.div>

      {/* Replaced bg-gray-950/40 and border-gray-800 with standard card variables */}
      <motion.div 
        className="w-full max-w-sm bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative z-10"
        initial={{ opacity: 0, scale:0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg font-bold mb-6 text-center text-foreground">
          Client Login / Setup
        </h2>

        {/* Form handling auto-signup too! */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase mb-1.5 block tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase mb-1.5 block tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Action Button mapped to bg-primary and glowing dropshadow removed for clean card design */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 disabled:bg-primary/50 disabled:text-white/50 text-white font-semibold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <LogIn size={16} /> Login or Setup
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground font-medium">
            Having issues? <span className="text-primary cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-center text-xs text-muted-foreground font-medium">
        © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
      </footer>
    </div>
  );
            }
