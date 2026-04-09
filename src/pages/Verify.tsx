import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Search, AlertCircle, ArrowLeft, Loader2, Cpu, Terminal, Fingerprint } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyLicense = () => {
  const [licenseId, setLicenseId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // New state for terminal feel
  const [error, setError] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId) return;

    setLoading(true);
    setIsScanning(true); // Start the "scan" animation
    setError(false);
    setResult(null);

    // Artificial delay to make the "security scan" feel real
    setTimeout(async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('certificates')
          .select('*')
          .eq('license_id', licenseId.trim())
          .single();

        if (dbError || !data) {
          setError(true);
        } else {
          setResult(data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
        setIsScanning(false);
      }
    }, 1500); // 1.5s of "Processing" time for premium feel
  };

  return (
    <div className="min-h-screen bg-[#050a15] text-white selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* ── PREMIUM TERMINAL BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full" />
        {/* Digital Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        
        <Link href="/client-hub">
          <a className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-all mb-16 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">Exit Security Terminal</span>
          </a>
        </Link>

        <div className="space-y-4 mb-12 relative">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-widest mb-2">
             <Fingerprint size={12} /> Identity Vault
           </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
            Verify <br /> <span className="text-blue-600">Authenticity</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm">
            Access the Sulaiman Graphics encrypted database to validate project intellectual property.
          </p>
        </div>

        {/* ── THE SCANNER INPUT ── */}
        <form onSubmit={handleVerify} className="relative mb-16 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
          <div className="relative">
            <input
              type="text"
              placeholder="SG-2026-XXXX"
              className="w-full bg-[#0a0f1d] border border-white/10 p-7 pr-24 rounded-[2rem] text-xl font-mono text-blue-400 outline-none focus:border-blue-500/50 transition-all backdrop-blur-xl"
              value={licenseId}
              onChange={(e) => setLicenseId(e.target.value.toUpperCase())}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
            </button>
          </div>
        </form>

        {/* ── RESULTS & TERMINAL LOGS ── */}
        <div className="min-h-[300px] relative">
          
          <AnimatePresence mode="wait">
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden"
              >
                {/* Scanning Bar Animation */}
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,1)] z-20"
                />
                <Cpu size={48} className="text-blue-600 animate-pulse mb-6" />
                <div className="font-mono text-[10px] text-blue-400 uppercase tracking-widest text-center space-y-2">
                  <p className="animate-pulse">Connecting to Secure Server...</p>
                  <p className="opacity-50">Checking IP Rights for {licenseId}</p>
                </div>
              </motion.div>
            )}

            {result && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0f1d] border border-blue-500/30 rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Terminal size={120} className="text-blue-500" />
                </div>

                <div className="flex items-center justify-between mb-10">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <ShieldCheck className="text-blue-500" size={32} />
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-blue-600 text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      Authorized Original
                    </span>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 block italic">Legal Property Owner</label>
                    <p className="text-4xl font-black tracking-tighter text-white uppercase italic">{result.client_name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-10 pt-8 border-t border-white/5">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Project ID</label>
                      <p className="text-white font-bold text-lg">{result.project_name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Authentication Date</label>
                      <p className="text-white font-bold text-lg">{new Date(result.issue_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 p-12 bg-red-500/[0.02] border border-red-500/20 rounded-[2.5rem] text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                   <AlertCircle className="text-red-500" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-500 uppercase italic tracking-tighter">Access Denied</h3>
                  <p className="text-sm text-zinc-500 mt-2 font-medium">This License ID was not found in our encrypted records. Ensure the code matches your certificate exactly.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VerifyLicense;
