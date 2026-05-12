import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Search, AlertCircle, ArrowLeft, Loader2, Cpu, Terminal, Fingerprint } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyLicense = () => {
  const [licenseId, setLicenseId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(false);

  const currentYear = new Date().getFullYear();
  const fullDateString = `${currentYear}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId) return;

    setLoading(true);
    setIsScanning(true);
    setError(false);
    setResult(null);

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
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 overflow-hidden relative font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 md:py-24">
        
        <Link href="/client-hub">
          <a className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-all mb-12 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">Exit Security Terminal</span>
          </a>
        </Link>

        <div className="space-y-6 mb-12 relative text-left">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
             <Fingerprint size={12} /> Identity Vault
           </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter italic uppercase leading-[0.9]">
            Verify <br /> 
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              Authenticity
            </span>
          </h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm border-l-2 border-cyan-500/30 pl-4">
            Access the Sulaiman Graphics encrypted database to validate project intellectual property and license credentials.
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleVerify} className="relative mb-16 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-700"></div>
          <div className="relative">
            <input
              type="text"
              placeholder={`SG-${fullDateString}-XXXX`}
              className="w-full bg-slate-900/50 border border-white/10 p-7 pr-24 rounded-[1.5rem] text-xl font-mono text-cyan-400 outline-none focus:border-cyan-500/50 transition-all backdrop-blur-2xl shadow-inner"
              value={licenseId}
              onChange={(e) => setLicenseId(e.target.value.toUpperCase())}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-cyan-900/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
            </button>
          </div>
        </form>

        <div className="min-h-[300px] relative">
          <AnimatePresence mode="wait">
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md"
              >
                {/* Laser Scan Line */}
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,1)] z-20"
                />
                <Cpu size={48} className="text-cyan-500 animate-pulse mb-6" />
                <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest text-center space-y-2">
                  <p className="animate-pulse font-bold">Decrypting Records...</p>
                  <p className="opacity-50">Handshaking with SG-Vault-Server</p>
                </div>
              </motion.div>
            )}

            {result && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/40 border border-cyan-500/30 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl text-left"
              >
                <div className="absolute -top-10 -right-10 opacity-5">
                   <ShieldCheck size={240} className="text-cyan-500" />
                </div>

                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                    <ShieldCheck className="text-cyan-400" size={32} />
                  </div>
                  <div className="text-right">
                    <span className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                      Authorized Original
                    </span>
                  </div>
                </div>

                <div className="space-y-10 relative z-10">
                  <div>
                    <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-3 block italic opacity-80">Legal Property Owner</label>
                    <p className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-md">
                      {result.client_name}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/10">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Project Assignment</label>
                      <p className="text-white font-bold text-lg tracking-tight">{result.project_name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Issue Timestamp</label>
                      <p className="text-white font-bold text-lg tracking-tight">
                        {new Date(result.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && !isScanning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 p-12 bg-red-500/[0.03] border border-red-500/20 rounded-[2.5rem] text-center backdrop-blur-md"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                   <AlertCircle className="text-red-500" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-red-500 uppercase italic tracking-tighter">Access Denied</h3>
                  <p className="text-sm text-zinc-500 mt-3 font-medium max-w-xs mx-auto">
                    This License ID was not found in our encrypted records. Please verify the credentials.
                  </p>
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
