import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, MessageCircle } from "lucide-react";

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

    if (error) {
      alert("Login failed: " + error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      setLocation("/dashboard");
    } else {
      alert("Login successful but no session found.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gray-100 relative overflow-hidden">
      
      {/* Background aesthetic blobs for that premium depth */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-700/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/10 rounded-full filter blur-3xl -z-10 animate-pulse delay-1000"></div>

      {/* Header Branding */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent mb-1">
          SULAIMAN GRAPHICS
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Design Portal</p>
      </motion.div>

      {/* Glassmorphic Login Card */}
      <motion.div 
        className="w-full max-w-sm bg-gray-950/40 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-6 text-center text-white">
          Client Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase mb-1.5 block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-600">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm text-white placeholder-gray-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase mb-1.5 block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-600">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm text-white placeholder-gray-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-blue-300/50 text-white font-medium text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-600/10"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <LogIn size={16} /> Login
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-600">
            Forgot your password? <span className="text-blue-500 cursor-pointer hover:underline">Contact Support</span>
          </p>
        </div>
      </motion.div>

      {/* Floating WhatsApp Support Button from your screenshot */}
      <motion.a
        href="https://wa.me/+2349060410369" // 👈 Put your WhatsApp number here!
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 transition-transform hover:scale-105 active:scale-95 z-50"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <MessageCircle size={28} fill="white" />
      </motion.a>

      <footer className="absolute bottom-6 text-center text-xs text-gray-700">
        © {new Date().getFullYear()} Sulaiman Graphics. All rights reserved.
      </footer>
    </div>
  );
              }
