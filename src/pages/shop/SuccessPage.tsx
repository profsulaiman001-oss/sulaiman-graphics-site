import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Download, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Order Confirmed</h2>
        <p className="text-zinc-500 text-sm mb-8">
          Your creative assets are being prepared. A license verification ID and download link will be sent to your email shortly.
        </p>

        <div className="space-y-3">
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Access Downloads
          </button>
          
          <button 
            onClick={() => setLocation("/shop")}
            className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl font-black uppercase italic tracking-widest transition-all text-xs flex items-center justify-center gap-2"
          >
            Return to Store <ArrowRight size={14} />
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <Mail size={12} /> Support: sulaimangraphics.com.ng
        </div>
      </motion.div>
    </div>
  );
}
