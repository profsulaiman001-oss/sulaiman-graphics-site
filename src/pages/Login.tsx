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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Auto-Signup logic
    if (error && (error.message.includes("Invalid login credentials") || error.message.includes("User not found"))) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        alert("Account Error: " + signUpError.message);
        setLoading(false);
        return;
      }

      alert("Welcome! Account created successfully.");
      window.location.href = "/dashboard"; // ✅ HARD REDIRECT
      return;
    }

    if (error) {
      alert("Login failed: " + error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // ✅ HARD REDIRECT: This ensures the browser reloads the app 
      // and the ProtectedRoute correctly sees the new session.
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-900/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/5 rounded-full filter blur-3xl -z-10 animate-pulse delay-1000"></div>

      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display font-black text-2xl tracking-tighter text-foreground mb-1 text-blue-900">
          SULAIMAN <span className="text-primary">GRAPHICS</span>
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Design Portal</p>
      </motion.div>

      <motion.div 
        className="w-full max-w-sm bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative z-10"
        initial={{ opacity: 0, scale:0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg font-bold mb-6 text-center text-foreground">
          Client Login / Setup
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase mb-1.5 block tracking-wider text-blue-800">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase mb-1.5 block tracking-wider text-blue-800">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/50 text-white font-semibold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-lg"
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
            Having issues? <span className="text-blue-900 cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-center text-xs text-muted-foreground font-medium">
        © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
      </footer>
    </div>
  );
        }
