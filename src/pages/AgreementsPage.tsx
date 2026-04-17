import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Trash2, Download, FileText, User, Calendar, Loader2, ChevronLeft, Search, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgreementsPage() {
  const [, setLocation] = useLocation();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAg, setSelectedAg] = useState<any | null>(null); // State for the full view

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_agreements")
      .select("*")
      .order("signed_at", { ascending: false });

    if (!error) setAgreements(data || []);
    setLoading(false);
  };

  const deleteAgreement = async (id: string) => {
    if (window.confirm("Delete this agreement permanently?")) {
      const { error } = await supabase.from("client_agreements").delete().eq("id", id);
      if (!error) fetchAgreements();
    }
  };

  const filteredAgreements = agreements.filter(ag => 
    ag.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ag.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/dashboard")} className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white">
              <ChevronLeft size={28} />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="text-purple-500" /> Client Agreements
              </h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Database Records</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#11141A] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 w-full md:w-64"
            />
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="text-purple-500 animate-spin" size={40} /></div>
        ) : (
          <div className="grid gap-4">
            {filteredAgreements.map((ag) => (
              <div key={ag.id} className="bg-[#11141A] border border-gray-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between hover:border-purple-500/30 transition-all cursor-pointer" onClick={() => setSelectedAg(ag)}>
                <div className="flex items-center gap-5">
                  <div className="bg-gray-900 p-4 rounded-xl text-purple-500"><User size={24} /></div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{ag.client_name}</h4>
                    <p className="text-sm text-gray-500">{ag.project_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-cyan-400 font-mono font-black">{ag.currency}{ag.project_price}</p>
                    <p className="text-[10px] text-gray-600 uppercase italic">Click to view full</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteAgreement(ag.id); }} className="p-3 text-gray-500 hover:text-red-500 transition"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FULL AGREEMENT OVERLAY --- */}
      <AnimatePresence>
        {selectedAg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex justify-center overflow-y-auto p-4 md:p-10">
            <div className="w-full max-w-4xl relative">
              <button onClick={() => setSelectedAg(null)} className="fixed top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-[110]"><X size={24}/></button>
              
              <div className="bg-[#11141A] border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl text-gray-300 print:bg-white print:text-black">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-8 mb-8">
                  <div>
                    <h1 className="font-black text-2xl tracking-tighter text-white">SULAIMAN<span className="text-cyan-500">.</span>GRAPHICS</h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase">Design & Digital Media Agreement</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Date Signed</p>
                    <p className="text-sm font-medium text-white">{new Date(selectedAg.signed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-8 text-sm leading-relaxed">
                  <p>This agreement is made between <span className="text-white font-bold">{selectedAg.client_name}</span> (The Client) and <span className="text-white font-bold">Sulaiman Graphics</span> (The Designer).</p>
                  
                  <div>
                    <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">1. Scope of Work</h3>
                    <p>The Designer agrees to produce visual assets for <span className="text-white">"{selectedAg.project_name}"</span>. Specific deliverables: <span className="text-white">{selectedAg.scope}</span>.</p>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">2. Payment & Delivery</h3>
                    <p>The total fee is <span className="text-cyan-400 font-bold">{selectedAg.currency}{selectedAg.project_price}</span>. Final high-resolution files will be delivered only after the final invoice is paid in full.</p>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-widest">3. Ownership</h3>
                    <p>Upon final payment, full ownership and commercial rights to the final approved designs are transferred to the Client.</p>
                  </div>

                  {/* Signature Box */}
                  <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl w-full">
                      <ShieldCheck className="text-cyan-500" size={32} />
                      <div>
                        <p className="text-[10px] uppercase text-gray-500">Digitally Signed By</p>
                        <p className="font-serif italic text-xl text-white">{selectedAg.signature}</p>
                      </div>
                    </div>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition shrink-0"><Download size={18}/> Save as PDF</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
