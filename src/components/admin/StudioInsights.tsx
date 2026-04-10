import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Info, Target, TargetIcon,
  Search, MessageSquare, Briefcase, DollarSign
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, Legend, CartesianGrid
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  const [formData, setFormData] = useState({
    outreach: 0, responses: 0, clients: 0, projects: 0, revenue: 0, notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    const { data } = await supabase.from('studio_metrics').select('*').order('log_date', { ascending: true });
    if (data) setMetrics(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.responses > formData.outreach) return alert("Responses > Outreach.");
    if (formData.clients > formData.responses) return alert("Clients > Responses.");

    const { error } = await supabase.from('studio_metrics').insert([{
      outreach_sent: formData.outreach, responses_received: formData.responses,
      clients_acquired: formData.clients, designs_completed: formData.projects,
      revenue_earned: formData.revenue, notes: formData.notes,
      period_type: period, log_date: formData.date
    }]);

    if (!error) { setIsLogging(false); fetchMetrics(); } else { alert(error.message); }
  };

  // --- ANALYTICS CALCULATIONS (The Feedback System) ---
  const stats = {
    totalRev: metrics.reduce((acc, c) => acc + Number(c.revenue_earned || 0), 0),
    totalOut: metrics.reduce((acc, c) => acc + Number(c.outreach_sent || 0), 0),
    avgResRate: ((metrics.reduce((acc, c) => acc + (c.responses_received / (c.outreach_sent || 1)), 0) / (metrics.length || 1)) * 100).toFixed(1),
    conversion: ((metrics.reduce((acc, c) => acc + (c.clients_acquired / (c.responses_received || 1)), 0) / (metrics.length || 1)) * 100).toFixed(1)
  };

  // Safe division to prevent errors
  const funnel = {
    out2res: metrics.reduce((acc, c) => acc + c.outreach_sent, 0) || 1,
    res2cli: metrics.reduce((acc, c) => acc + c.responses_received, 0) || 1,
  };

  const pieData = [
    { name: 'Responses', value: metrics.reduce((acc, c) => acc + c.responses_received, 0) },
    { name: 'No Reply', value: metrics.reduce((acc, c) => acc + (c.outreach_sent - c.responses_received), 0) }
  ];

  return (
    <div className="min-h-screen bg-[#050a15] text-white p-4 md:p-12 pb-32 selection:bg-blue-500/30">
      
      {/* 📊 OUTPUT PAGE: THE ULTIMATE DASHBOARD */}
      <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white/90 via-blue-200 to-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            ANALYTICS ENGINE
          </h1>
          <div className="flex items-center gap-2 mt-3">
             <div className="w-1 h-3 bg-blue-500 rounded animate-pulse" />
             <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.5em]">Sulaiman Graphics Data Matrix (v1.2)</p>
          </div>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="group relative bg-[#070e1b] border border-blue-500/30 px-10 py-6 rounded-[2.5rem] font-black italic transition-all active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-blue-600/10">
          <div className="absolute inset-x-5 inset-y-2 border-l border-r border-blue-500/10" />
          <span className="flex items-center gap-4 text-sm tracking-widest uppercase">
            <Target size={20} className="text-blue-500"/> ACTIVATE LOG PROTOCOL
          </span>
        </button>
      </div>

      {/* SUMMARY CARDS: Minimalist & Clean */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: "Revenue Matrix", val: `$${stats.totalRev.toLocaleString()}`, color: "text-blue-400" },
          { label: "Closing Conversion", val: `${stats.conversion}%`, color: "text-emerald-400" },
          { label: "Market Outreach", val: stats.totalOut.toLocaleString(), color: "text-zinc-200" },
          { label: "Avg Response", val: `${stats.avgResRate}%`, color: "text-blue-500" }
        ].map((s, i) => (
          <div key={i} className="bg-[#0a0f1d]/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-radial-at-t bg-[radial-gradient(100px_at_50%_0%,rgba(37,99,235,0.05)_0%,rgba(37,99,235,0)_100%)] pointer-events-none"/>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.25em] mb-2">{s.label}</p>
            <h2 className={`text-3xl md:text-5xl font-black italic ${s.color} tracking-tighter leading-tight`}>{s.val}</h2>
          </div>
        ))}
      </div>

      {/* CHARTS GRID: Refined Vector Styles */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Line Chart: Premium Glass Trajectory */}
        <div className="lg:col-span-2 premium-border-blue bg-[#0a0f1d]/60 p-10 h-[450px]">
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
                cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '6 6' }}
                contentStyle={{ backgroundColor: '#070e1b/95', backdropBlur: '12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', fontWeight: 'bold' }} 
              />
              <Area type="monotone" dataKey="revenue_earned" stroke="#2563eb" strokeWidth={5} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="outreach_sent" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Market Funnel Breakdown (Like ref image) */}
        <div className="premium-border-blue bg-[#0a0f1d]/60 p-10 flex flex-col h-[450px]">
          <h3 className="text-xs font-black italic uppercase tracking-[0.3em] mb-12 self-start">Engagement Funnel</h3>
          <ResponsiveContainer width="100%" height="80%">
             <BarChart data={metrics.slice(-10)} barGap={4}>
               <XAxis dataKey="log_date" hide />
               <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', borderRadius: '15px' }} />
               {/* Neon glowing bars */}
               <Bar dataKey="outreach_sent" fill="#1e293b" radius={[10, 10, 0, 0]} />
               <Bar dataKey="responses_received" fill="#3b82f6" radius={[10, 10, 0, 0]} />
             </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center mt-6">Outreach (Gray) vs Responses (Blue)</p>
        </div>
      </div>

      {/* REVENUE HISTORY TABLE (Premium history) */}
      <div className="max-w-7xl mx-auto premium-border-blue bg-[#0a0f1d]/60 p-10">
          <h3 className="text-xs font-black italic uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
             <Briefcase className="text-blue-500" size={18}/> Historic Logs
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
            {metrics.map((log, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:border-blue-500/20">
                <span className="text-xs font-mono text-zinc-500">{log.log_date}</span>
                <span className="text-xs font-black tracking-widest uppercase text-blue-400">{log.period_type} LOG</span>
                <span className="text-lg font-black text-white">${Number(log.revenue_earned || 0).toLocaleString()}</span>
                <span className="text-emerald-500 font-bold text-xs">{((log.clients_acquired / (log.responses_received || 1)) * 100).toFixed(0)}% Conversion</span>
              </div>
            ))}
          </div>
      </div>


      {/* 🧩 INPUT PAGE (MODAL) - Matching Premium Aesthetic */}
      <AnimatePresence>
        {isLogging && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#050a15]/98 backdrop-blur-3xl overflow-y-auto">
            <motion.form initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} 
              className="premium-border-blue bg-[#0a0f1d] p-8 md:p-16 rounded-[4rem] w-full max-w-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative my-auto">
              <button type="button" onClick={() => setIsLogging(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><X size={32}/></button>
              
              <div className="flex items-start gap-4 mb-16">
                 <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <Activity className="text-blue-500" size={32} />
                 </div>
                 <div>
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Log performance</h2>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-2">Data Transmission Node // Matrix v1.2</p>
                 </div>
              </div>

              {/* Period & Date */}
              <div className="grid grid-cols-2 gap-5 mb-10">
                {[
                  { icon: Target, label: "Period", value: period },
                  { icon: Calendar, label: "Date", value: formData.date }
                ].map((input) => (
                  <div key={input.label} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                     <input.icon className="text-blue-500" size={24} />
                     <div>
                        <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{input.label}</label>
                        <p className="text-sm font-black tracking-widest uppercase">{input.value}</p>
                     </div>
                  </div>
                ))}
              </div>

              {/* Core Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {[
                  { label: "Outreach Sent", key: "outreach", icon: Search },
                  { label: "Responses", key: "responses", icon: MessageSquare },
                  { label: "Clients Acquired", key: "clients", icon: Users },
                  { label: "Projects Completed", key: "projects", icon: Briefcase }
                ].map((input) => (
                  <div key={input.key} className="space-y-3 relative group">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-3">{input.label}</label>
                    <div className="relative">
                       <input.icon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500" />
                       <input type="number" className="w-full bg-white/5 p-6 pl-16 rounded-[1.8rem] border border-white/5 outline-none focus:border-blue-500 font-bold text-lg" placeholder="0"
                         onChange={(e)=>setFormData({...formData, [input.key]: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Input */}
              <div className="mb-10 p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
                <label className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] ml-3 font-bold">Revenue Earned Protocol ($)</label>
                <input type="number" placeholder="0.00" className="w-full bg-transparent p-6 rounded-[1.5rem] outline-none text-blue-400 font-black text-5xl tracking-tighter" 
                    onChange={(e)=>setFormData({...formData, revenue: parseFloat(e.target.value) || 0})} />
              </div>

              {/* Duplicate Feature (Removed text button, kept functionality logic) */}
              {metrics.length > 0 && (
                <button type="button" onClick={() => {
                  const last = metrics[metrics.length - 1];
                  setFormData({...formData, outreach: last.outreach_sent, responses: last.responses_received, clients: last.clients_acquired, projects: last.designs_completed, revenue: last.revenue_earned})
                }} className="mb-10 text-xs font-bold text-zinc-600 hover:text-white transition-colors">
                  [ Duplicate Last Performance Matrix? ]
                </button>
              )}

              {/* Notes */}
              <div className="mb-10">
                <textarea rows={4} className="w-full bg-white/5 p-6 rounded-3xl border border-white/5 outline-none focus:border-blue-500 text-sm" 
                  placeholder="Insert Data context / observations / strategy notes..." onChange={(e)=>setFormData({...formData, notes: e.target.value})} />
              </div>

              {/* Live Preview Bar (Like ref image) */}
              <div className="mb-10 flex gap-6 p-6 rounded-2xl bg-[#070e1b] border border-blue-500/10">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">LiveData Feedback Protocol:</span>
                  <span className="text-xs font-black text-blue-400">{((formData.responses / (formData.outreach || 1)) * 100).toFixed(0)}% Res-Rate</span>
                  <span className="text-xs font-black text-emerald-400">{((formData.clients / (formData.responses || 1)) * 100).toFixed(0)}% Closing-Rate</span>
              </div>

              <button type="submit" className="w-full bg-blue-600 py-7 rounded-3xl font-black italic tracking-[0.2em] shadow-[0_15px_60px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all uppercase active:scale-[0.98]">
                CONFIRM & SYNC SESSION DATA
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
