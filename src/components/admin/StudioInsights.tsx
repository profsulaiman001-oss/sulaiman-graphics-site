import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, 
  Search, MessageSquare, Briefcase, Users, FileText, Copy, TrendingUp
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, ComposedChart, Line
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

  // --- THE PROTECTED HANDLE SAVE ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Get Authenticated User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Session expired. Please log in again.");

    // 2. Logic Validations
    if (formData.responses > formData.outreach) return alert("Responses cannot exceed Outreach.");
    if (formData.clients > formData.responses) return alert("Clients cannot exceed Responses.");

    // 3. Data Sync
    const { error } = await supabase.from('studio_metrics').insert([{
      user_id: user.id,
      outreach_sent: formData.outreach, 
      responses_received: formData.responses,
      clients_acquired: formData.clients, 
      designs_completed: formData.projects,
      revenue_earned: formData.revenue, 
      notes: formData.notes,
      period_type: period, 
      log_date: formData.date
    }]);

    if (!error) { 
      setIsLogging(false); 
      fetchMetrics(); 
      setFormData({ outreach: 0, responses: 0, clients: 0, projects: 0, revenue: 0, notes: "", date: new Date().toISOString().split('T')[0] });
    } else { 
      alert(`Database Error: ${error.message}`); 
    }
  };

  // --- CHART DATA PROCESSING ---
  const stats = {
    totalRev: metrics.reduce((acc, c) => acc + Number(c.revenue_earned || 0), 0),
    totalOut: metrics.reduce((acc, c) => acc + Number(c.outreach_sent || 0), 0),
    avgConv: metrics.length > 0 ? ((metrics.reduce((acc, c) => acc + (c.clients_acquired / (c.responses_received || 1)), 0) / metrics.length) * 100).toFixed(1) : "0"
  };

  const pieData = [
    { name: 'Responses', value: metrics.reduce((acc, c) => acc + c.responses_received, 0), color: '#3b82f6' },
    { name: 'No Reply', value: metrics.reduce((acc, c) => acc + (c.outreach_sent - c.responses_received), 0), color: '#1e293b' }
  ];

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#050a15] text-white p-4 md:p-12 pb-32">
      
      {/* 📊 DASHBOARD HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
        <div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
            ANALYTICS ENGINE
          </h1>
          <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.5em] mt-4">Sulaiman Graphics Matrix v1.2</p>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="z-50 bg-[#070e1b] border border-blue-500/30 px-10 py-6 rounded-[2.5rem] font-black italic hover:bg-blue-600/10 transition-all shadow-2xl">
          <span className="flex items-center gap-4 text-sm tracking-widest uppercase"><Plus size={20} className="text-blue-500"/> ACTIVATE LOG PROTOCOL</span>
        </button>
      </div>

      {/* 🃏 SUMMARY CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: "Revenue Matrix", val: `$${stats.totalRev.toLocaleString()}`, color: "text-blue-400" },
          { label: "Market Outreach", val: stats.totalOut.toLocaleString(), color: "text-zinc-200" },
          { label: "Conv. Rate", val: `${stats.avgConv}%`, color: "text-emerald-400" },
          { label: "System Status", val: "OPERATIONAL", color: "text-blue-500" }
        ].map((s, i) => (
          <div key={i} className="premium-border-blue p-8">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <h2 className={`text-3xl font-black italic ${s.color} tracking-tighter`}>{s.val}</h2>
          </div>
        ))}
      </div>

      {/* 📈 COMPREHENSIVE CHARTS SUITE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* LINE GRAPH: Revenue Growth */}
        <div className="premium-border-blue p-8 h-[400px]">
          <h3 className="text-[10px] font-black italic uppercase tracking-widest mb-8">Revenue Trajectory (Line)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={metrics}>
              <XAxis dataKey="log_date" hide />
              <Tooltip contentStyle={{ backgroundColor: '#070e1b', borderRadius: '15px', border: 'none' }} />
              <Area type="monotone" dataKey="revenue_earned" stroke="#3b82f6" strokeWidth={4} fill="rgba(59,130,246,0.1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART: Outreach vs Responses */}
        <div className="premium-border-blue p-8 h-[400px]">
          <h3 className="text-[10px] font-black italic uppercase tracking-widest mb-8">Engagement Funnel (Bar)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={metrics.slice(-10)}>
              <XAxis dataKey="log_date" hide />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#070e1b', borderRadius: '15px' }} />
              <Bar dataKey="outreach_sent" fill="#1e293b" radius={[5, 5, 0, 0]} />
              <Bar dataKey="responses_received" fill="#3b82f6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART: Success Distribution */}
        <div className="premium-border-blue p-8 h-[400px] flex flex-col items-center">
          <h3 className="text-[10px] font-black italic uppercase tracking-widest mb-4 self-start">Market Capture (Pie)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* HISTOGRAM-STYLE: Revenue Distribution */}
        <div className="premium-border-blue p-8 h-[400px]">
          <h3 className="text-[10px] font-black italic uppercase tracking-widest mb-8">Performance Distribution (Histogram)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={metrics}>
              <CartesianGrid stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="log_date" hide />
              <Bar dataKey="revenue_earned" fill="#3b82f620" barSize={40} />
              <Line type="step" dataKey="revenue_earned" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🧩 DATA ENTRY MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#050a15]/98 backdrop-blur-3xl overflow-y-auto">
          <form onSubmit={handleSave} className="premium-border-blue bg-[#0a0f1d] p-8 md:p-12 w-full max-w-4xl animate-in zoom-in duration-300">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X size={24}/></button>
            
            <div className="mb-10">
              <h2 className="text-3xl font-black italic uppercase text-white">Log Matrix</h2>
              <p className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Syncing {period} data: {formData.date}</p>
            </div>

            {/* DATE & PERIOD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>{p}</button>
                ))}
              </div>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="glass-input w-full font-bold uppercase text-sm" />
            </div>

            {/* CORE INPUTS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Outreach", key: "outreach", icon: Search },
                { label: "Responses", key: "responses", icon: MessageSquare },
                { label: "Clients", key: "clients", icon: Users },
                { label: "Projects", key: "projects", icon: Briefcase }
              ].map((input) => (
                <div key={input.key} className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">{input.label}</label>
                  <input type="number" className="glass-input w-full font-bold" placeholder="0" value={formData[input.key]}
                    onChange={(e) => setFormData({...formData, [input.key]: parseInt(e.target.value) || 0})} />
                </div>
              ))}
            </div>

            {/* REVENUE & NOTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
                <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Revenue ($)</label>
                <input type="number" step="0.01" className="w-full bg-transparent outline-none text-blue-400 font-black text-5xl tracking-tighter" placeholder="0.00" value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Observations</label>
                <textarea rows={4} className="glass-input w-full resize-none text-sm" placeholder="Insert notes..." value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="mb-10 flex gap-6 p-6 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Feedback:</span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{((formData.responses / (formData.outreach || 1)) * 100).toFixed(0)}% Response Rate</span>
            </div>

            <button type="submit" className="w-full bg-blue-600 py-7 rounded-3xl font-black italic tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all uppercase">
              CONFIRM & SYNC SESSION DATA
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
