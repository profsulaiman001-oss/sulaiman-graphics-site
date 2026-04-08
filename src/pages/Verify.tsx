import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Search, AlertCircle, ArrowLeft, Loader2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const VerifyLicense = () => {
  const [licenseId, setLicenseId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseId) return;

    setLoading(true);
    setError(false);
    setResult(null);

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
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-widest uppercase">Back to Studio</span>
        </Link>

        <div className="space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">
            VERIFY <span className="text-blue-500">AUTHENTICITY</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            Enter a professional license ID to validate the ownership and intellectual property rights of a Sulaiman Graphics asset.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleVerify} className="relative mb-12">
          <input
            type="text"
            placeholder="SG-2026-XXXX"
            className="w-full bg-zinc-900/50 border border-zinc-800 p-6 pr-20 rounded-3xl text-xl font-mono text-blue-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all backdrop-blur-md"
            value={licenseId}
            onChange={(e) => setLicenseId(e.target.value.toUpperCase())}
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
          </button>
        </form>

        {/* Results Area */}
        <div className="min-h-[200px]">
          {result && (
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-blue-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-500/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-blue-500/10 p-4 rounded-2xl">
                  <ShieldCheck className="text-blue-500" size={32} />
                </div>
                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
                  Verified Original
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Legal Owner</label>
                  <p className="text-3xl font-bold tracking-tight text-white">{result.client_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-zinc-800">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Project</label>
                    <p className="text-zinc-200 font-medium">{result.project_name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Issued</label>
                    <p className="text-zinc-200 font-medium">{new Date(result.issue_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-4 p-6 bg-red-500/5 border border-red-500/20 rounded-3xl animate-in shake duration-500">
              <AlertCircle className="text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-red-500">License Not Found</p>
                <p className="text-sm text-zinc-500">The ID entered does not match our records. Please verify the code or contact support.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyLicense;
