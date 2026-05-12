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
  const [selectedAg, setSelectedAg] = useState<any | null>(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setLoading(true);
    // Changed signed_at to created_at to match your database schema
    const { data, error } = await supabase
      .from("client_agreements")
      .select("*")
      .order("created_at", { ascending: false });

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
    (ag.client_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (ag.project_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation("/dashboard")}
              className="p-2 hover:bg-gray-800 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                Client Agreements
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage and view signed contracts</p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search client or project..."
              className="w-full bg-[#111] border border-gray-800 rounded-xl py-2 pl-10 pr-4 focus:border-cyan-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
          </div>
        ) : filteredAgreements.length === 0 ? (
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-12 text-center">
            <FileText className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-400 font-medium">No agreements found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgreements.map((ag) => (
              <motion.div 
                layoutId={ag.id}
                key={ag.id}
                className="bg-[#111] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition group cursor-pointer relative"
                onClick={() => setSelectedAg(ag)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-cyan-500/10 p-2 rounded-lg">
                    <ShieldCheck className="text-cyan-500" size={20} />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAgreement(ag.id);
                    }}
                    className="text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="font-bold text-lg mb-1 truncate">{ag.project_name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <User size={14} />
                  <span className="truncate">{ag.client_name}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-cyan-500 font-bold">{ag.currency}{ag.project_price}</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                    <Calendar size={10} />
                    {new Date(ag.created_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Agreement Modal */}
      <AnimatePresence>
        {selectedAg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-[#0f0f0f] border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col relative shadow-2xl">
              <button 
                onClick={() => setSelectedAg(null)}
                className="absolute right-6 top-6 text-gray-500 hover:text-white z-10"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto p-8 md:p-12 print:p-0 print:bg-white print:text-black">
                <div id="agreement-content" className="space-y-8 text-gray-300 print:text-black">
                  <div className="text-center">
                    <h2 className="text-3xl font-black text-white tracking-tighter print:text-black">SULAIMAN.GRAPHICS</h2>
                    <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mt-1">Design & Digital Media Agreement</p>
                    <p className="text-xs text-gray-600 mt-4">Date Signed: {new Date(selectedAg.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  <div className="h-px bg-gray-800 w-full print:bg-gray-200" />

                  <p className="text-sm leading-relaxed">
                    This agreement is made between <span className="text-white font-bold print:text-black">{selectedAg.client_name}</span> (The Client) and <span className="text-white font-bold print:text-black">Sulaiman Graphics</span> (The Designer).
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-bold mb-2 uppercase text-[10px] tracking-widest text-cyan-500 print:text-black">1. Scope of Work</h3>
                      <p className="text-sm">The Designer agrees to produce visual assets for <span className="text-white font-semibold print:text-black">"{selectedAg.project_name}"</span>. The specific deliverables included are: <span className="text-white print:text-black">{selectedAg.scope}</span>. Any additional assets requested outside of this list will require a separate quote.</p>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-2 uppercase text-[10px] tracking-widest text-cyan-500 print:text-black">2. Payment & File Delivery</h3>
                      <p className="text-sm">The total fee for this project is <span className="text-white font-bold print:text-black">{selectedAg.currency}{selectedAg.project_price}</span>. A 50% non-refundable deposit is required before work begins. The remaining 50% balance is due upon project completion. Final high-resolution files (PNG, JPG, Vector, or MP4) will be delivered only after the final invoice is paid in full.</p>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-2 uppercase text-[10px] tracking-widest text-cyan-500 print:text-black">3. Revisions</h3>
                      <p className="text-sm">The Designer provides up to 2 rounds of revisions on the chosen concepts. A revision constitutes minor adjustments to color, typography, or layout. Complete redesigns or concept changes after approval will result in extra fees.</p>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-2 uppercase text-[10px] tracking-widest text-cyan-500 print:text-black">4. Ownership & Usage</h3>
                      <p className="text-sm">Upon final payment, full ownership and commercial rights to the final approved designs are transferred to the Client. The Designer retains the right to display the completed assets in their portfolio for marketing purposes.</p>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-800 print:border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl w-full">
                      <ShieldCheck className="text-cyan-500" size={32} />
                      <div>
                        <p className="text-[10px] uppercase text-gray-500">Digitally Signed By</p>
                        <p className="font-serif italic text-2xl text-white print:text-black">{selectedAg.signature}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.print()} 
                      className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition shrink-0 print:hidden"
                    >
                      <Download size={18}/> Save PDF
                    </button>
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
