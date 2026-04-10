import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, 
  Search, MessageSquare, Briefcase, Users 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period] = useState('daily');
  
  const [formData, setFormData] = useState({
    outreach: 0, responses: 0, clients: 0, projects: 0, revenue: 0, notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
      const { data } = await supabase.from('studio_metrics').select('*').order('log_date', { ascending: true });
      if (data) setMetrics(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.responses > formData.outreach) return alert("Responses cannot exceed Outreach.");
    
    const { error } = await supabase.from('studio_metrics').insert([{
      outreach_sent: formData.outreach, responses_received: formData.responses,
      clients_acquired: formData.clients, designs_completed: formData.projects,
      revenue_earned: formData.revenue, notes: formData.notes,
      period_type: period, log_date: formData.date
    }]);

    if (!error) { 
      setIsLogging(false); 
      fetchMetrics(); 
    } else { 
      alert(`Database Error: ${error.message}`); 
    }
  };

  // --- SAFE CALCULATIONS ---
  const stats = {
    totalRev: metrics.reduce((acc, c) => acc + Number(c.revenue_earned || 0), 0),
    totalOut: metrics.reduce((acc, c) => acc + Number(c.outreach_sent || 0), 0),
    conversion: metrics.length > 0 
      ? ((metrics.reduce((acc, c) => acc + (c.clients_acquired / (c.responses_received || 1)), 0) / metrics.length) * 100).toFixed(1) 
      : "0.0",
    avgResRate: metrics.length > 0 
      ? ((metrics.reduce((acc, c) => acc + (c.responses_received / (c.outreach_sent || 1)), 0) / metrics.length) * 100).toFixed(1) 
      : "0.0"
  };

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#050a15] text-white p-4 md:p-12 pb-32 selection:bg-blue-500/30">
      
      {/* 📊 HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
        <div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
            ANALYTICS ENGINE
          </h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="w-1.5 h-4 bg-blue-500 rounded animate-pulse" />
             <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.5em]">Sulaiman Graphics Matrix v1.2</p>
          </div>
        </div>
        
        {/* Fixed Z-Index for Desktop Interaction */}
        <button 
          onClick={() => setIsLogging(true)} 
          className="relative z-50 bg-[#070e1b] border border-blue-500/30 px-10 py-6 rounded-[2.5rem] font-black italic transition-all active:scale-95 hover:bg-blue-600/10 shadow-2xl"
        >
          <span className="flex items-center gap-4 text-sm tracking-widest uppercase text-white">
            <Plus size={20} className="text-blue-500"/> ACTIVATE LOG PROTOCOL
          </span>
        </button>
      </div>

      {/* 🃏 SUMMARY CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: "Revenue Matrix", val: `$${stats.totalRev.toLocaleString()}`, color: "text-blue-400" },
          { label: "Closing Rate", val: `${stats.conversion}%`, color: "text-emerald-400" },
          { label: "Market Outreach", val: stats.totalOut.toLocaleString(), color: "text-zinc-200" },
          { label: "Avg Response", val: `${stats.avgResRate}%`, color: "text-blue-500" }
        ].map((s, i) => (
          <div key={i} className="premium-border-blue p-8 md:p-10">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.25em] mb-2">{s.label}</p>
            <h2 className={`text-3xl md:text-5xl font-black italic ${s.color} tracking-tighter`}>{s.val}</h2>
          </div>
        ))}
      </div>

      {/* 📈 CHARTS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 premium-border-blue p-10 h-[450px]">
          <h3 className="text-xs font-black italic uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
             <Calendar className="text-blue-500" size={18}/> Performance Timeline
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="log_date" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#070e1b', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }} 
              />
              <Area type="monotone" dataKey="revenue_earned" stroke="#2563eb" strokeWidth={4} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="premium-border-blue p-10 flex flex-col h-[450px]">
          <h3 className="text-xs font-black italic uppercase tracking-[0.3em] mb-12">Engagement Funnel</h3>
          <ResponsiveContainer width="100%" height="80%">
             <BarChart data={metrics.slice(-7)}>
               <XAxis dataKey="log_date" hide />
               <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', borderRadius: '15px' }} />
               <Bar dataKey="outreach_sent" fill="#1e293b" radius={[10, 10, 0, 0]} />
               <Bar dataKey="responses_received" fill="#3b82f6" radius={[10, 10, 0, 0]} />
             </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🧩 LOGGING MODAL (Safe Version - No Motion required) */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#050a15]/95 backdrop-blur-2xl overflow-y-auto">
          <form 
            onSubmit={handleSave} 
            className="premium-border-blue bg-[#0a0f1d] p-8 md:p-16 w-full max-w-3xl relative animate-in fade-in zoom-in duration-300"
          >
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white"><X size={32}/></button>
            
            <div className="flex items-start gap-4 mb-12">
               <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                  <Activity className="text-blue-500" size={32} />
               </div>
               <div>
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Log Session</h2>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Data Matrix Node // Sync Protocol</p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Outreach", key: "outreach", icon: Search },
                { label: "Responses", key: "responses", icon: MessageSquare },
                { label: "Clients", key: "clients", icon: Users },
                { label: "Projects", key: "projects", icon: Briefcase }
              ].map((input) => (
                <div key={input.key} className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">{input.label}</label>
                  <input 
                    type="number" 
                    className="glass-input w-full font-bold" 
                    placeholder="0"
                    onChange={(e) => setFormData({...formData, [input.key]: parseInt(e.target.value) || 0})}
                  />
                </div>
              ))}
            </div>

            <div className="mb-10 p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Revenue Earned ($)</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full bg-transparent outline-none text-blue-400 font-black text-6xl tracking-tighter" 
                placeholder="0.00"
                onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value) || 0})} 
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 py-7 rounded-3xl font-black italic tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all uppercase">
              CONFIRM & SYNC SESSION
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
