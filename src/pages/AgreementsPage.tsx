import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Trash2, Download, FileText, User, Calendar, Loader2, ChevronLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AgreementsPage() {
  const [, setLocation] = useLocation();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
            <button 
              onClick={() => setLocation("/dashboard")}
              className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white"
            >
              <ChevronLeft size={28} />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="text-purple-500" /> Client Agreements
              </h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Sulaiman Graphics Database</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search clients or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#11141A] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 w-full md:w-64"
            />
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="text-purple-500 animate-spin" size={40} />
            <p className="text-gray-500 animate-pulse">Accessing secure records...</p>
          </div>
        ) : filteredAgreements.length === 0 ? (
          <div className="bg-[#11141A] border border-dashed border-gray-800 rounded-3xl py-20 text-center">
            <FileText className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No agreements matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAgreements.map((ag) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={ag.id} 
                className="bg-[#11141A] border border-gray-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-gray-900 p-4 rounded-xl group-hover:bg-purple-500/10 transition">
                    <User className="text-gray-400 group-hover:text-purple-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{ag.client_name}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar size={14} /> {new Date(ag.signed_at).toLocaleDateString()} — {ag.project_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 mt-4 md:mt-0 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-cyan-400 font-mono text-lg font-black">
                      {ag.currency}{ag.project_price}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Full Ownership Rights</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.print()}
                      className="p-3 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition border border-transparent hover:border-cyan-400/20"
                      title="Download PDF"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => deleteAgreement(ag.id)}
                      className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
                      title="Delete Record"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
