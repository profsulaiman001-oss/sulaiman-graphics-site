import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Search, AlertCircle, ArrowLeft, Loader2, Cpu, Fingerprint } from 'lucide-react';
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

    try {
      const { data, error: dbError } = await supabase
        .from('certificates')
        .select('*')
        .eq('license_id', licenseId.trim())
        .single();

      setTimeout(() => {
        if (dbError || !data) {
          setError(true);
        } else {
          setResult(data);
        }
        setLoading(false);
        setIsScanning(false); 
      }, 1500);

    } catch (err) {
      setLoading(false);
      setIsScanning(false);
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Increased padding-top to pt-24 to fix logo overlap */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-24 pb-12">
        
        <Link href="/client-hub">
          <a className="inline-flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-all mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">Exit Security Terminal</span>
          </a>
        </Link>

        {/* Heading: Normal weight, left aligned, px-2 to prevent cropping */}
        <div className="space-y-6 mb-10 text-left px-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none not-italic">
            Verify <br /> 
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              Authenticity
            </span>
          </h1>
          
          {/* Identity Vault moved below heading */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest">
             <Fingerprint size={12} /> Identity Vault
          </div>

          <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-[300px] border-l-2 border-cyan-500/30 pl-4">
            Access the Sulaiman Graphics encrypted database to validate project intellectual property.
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-[1.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-700"></div>
          <div className="relative">
            <input
              type="text"
              placeholder={`SG-${fullDateString}-XXXX`}
              className="w-full bg-slate-900/80 border border-white/10 p-6 pr-20 rounded-[1.2rem] text-lg font-mono text-cyan-400 outline-none focus:border-cyan-500/50 transition-all backdrop-blur-xl"
              value={licenseId}
              onChange={(e) => setLicenseId(e.target.value.toUpperCase())}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl shadow-lg shadow-cyan-500/20"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search size={24} />}
            </button>
          </div>
        </form>

        <div className="min-h-[300px] relative">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md"
              >
                <motion.div 
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] z-20"
                />
                <Cpu size={40} className="text-cyan-500 animate-pulse mb-4" />
                <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest text-center">
                  <p className="animate-pulse font-bold tracking-[0.2em]">Decrypting Records...</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-cyan-500/30 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl text-left"
              >
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                    <ShieldCheck className="text-cyan-400" size={24} />
                  </div>
                  <span className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-[9px] font-black tracking-widest uppercase rounded-full">
                    Authorized
                  </span>
                </div>

                <div className="space-y-10 relative z-10">
                  <div>
                    <label className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2 block opacity-70">Legal Property Owner</label>
                    <p className="text-3xl font-black tracking-tighter text-white uppercase leading-tight break-words">
                        {result.client_name}
                    </p>
                  </div>
                  
                  {/* Changed to vertical stack to ensure no text is stripped */}
                  <div className="space-y-8 pt-8 border-t border-white/10">
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Project Identity</label>
                      <p className="text-white font-bold text-xl break-words leading-snug">
                          {result.project_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Issue Date</label>
                      <p className="text-white font-bold text-lg tracking-tight">
                        {new Date(result.issue_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 bg-red-500/[0.03] border border-red-500/20 rounded-[2.5rem] text-center backdrop-blur-md"
              >
                <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                <h3 className="text-xl font-black text-red-500 uppercase tracking-tighter">Access Denied</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Record not found in the encrypted vault.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VerifyLicense;
