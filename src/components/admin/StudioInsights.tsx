import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, Briefcase, FileText, Search, MessageSquare, Users, Copy, PlusCircle, Trash2
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, ComposedChart, Line
} from 'recharts';

export const StudioInsightsLedger = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  const [formData, setFormData] = useState({
    outreach: 0, responses: 0, clients: 0, 
    date: new Date().toISOString().split('T')[0],
    projects: [{ name: '', revenue: '0.00' }] // Dynamic project array
  });

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
      // Step 1: Fetch parent logs and their child projects
      const { data } = await supabase.from('studio_insights')
        .select(`*, insight_projects (*)`)
        .order('log_date', { ascending: true });
      if (data) setMetrics(data);
    } catch (e) { console.error("Metrics Sync Error", e); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Security Error: Mission identity unconfirmed.");

    // Step 2: Validation
    if (formData.responses > formData.outreach) return alert("Responses cannot exceed Outreach.");
    if (formData.clients > formData.responses) return alert("Clients cannot exceed Responses.");
    if (formData.projects.length === 0 || formData.projects.every(p => p.name.trim() === '')) return alert("Insert at least one valid project.");

    // Step 3: Insert parent log
    const { data: insightLog, error: logError } = await supabase.from('studio_insights').insert([{
      user_id: user.id,
      outreach_sent: formData.outreach, responses_received: formData.responses,
      clients_acquired: formData.clients, period_type: period, log_date: formData.date
    }]).select().single();

    if (logError) return alert(`Database Error (Parent): ${logError.message}`);

    // Step 4: Insert child projects (the dynamic ledger)
    const projectsToInsert = formData.projects.filter(p => p.name.trim() !== '').map(p => ({
        insight_id: insightLog.id, user_id: user.id,
        project_name: p.name.trim(), revenue_earned: parseFloat(p.revenue) || 0.00
    }));

    const { error: projectError } = await supabase.from('insight_projects').insert(projectsToInsert);

    if (!projectError) { 
      setIsLogging(false); fetchMetrics(); 
      // Reset
      setFormData({ outreach: 0, responses: 0, clients: 0, date: new Date().toISOString().split('T')[0], projects: [{ name: '', revenue: '0.00' }] });
    } else { 
      alert(`Database Error (Ledger): ${projectError.message}`); 
    }
  };

  const allProjects = metrics.flatMap(log => log.insight_projects || []);
  const totalRev = allProjects.reduce((acc, p) => acc + Number(p.revenue_earned || 0), 0);
  const totalOut = metrics.reduce((acc, c) => acc + Number(c.outreach_sent || 0), 0);
  const currentMonthProjects = allProjects.filter(p => p.insight_id && p.project_name.length > 0);

  // Modular Stats like inspo image (lots of boxes)
  const dashboardStats = [
    { label: "Revenue Matrix", val: `$${totalRev.toLocaleString()}`, color: "text-blue-400" },
    { label: "Market Outreach", val: totalOut, color: "text-zinc-200" },
    { label: "Total Ledger Entries", val: allProjects.length, color: "text-white" },
    { label: "Avg Ticket Price", val: `$${allProjects.length > 0 ? (totalRev / allProjects.length).toFixed(0) : 0}`, color: "text-blue-500" },
    { label: "Closing Conversion", val: `${metrics.length > 0 ? ((metrics.reduce((acc, c) => acc + c.clients_acquired, 0) / (totalOut || 1)) * 100).toFixed(0) : 0}%`, color: "text-emerald-400" },
    { label: "System Goal (awareness)", val: "$15,000", color: "text-white/20" },
  ];

  const pieData = [
    { name: 'Revenue', value: totalRev, color: '#3b82f6' },
    { name: 'Engagement', value: metrics.reduce((acc, c) => acc + c.responses_received, 0), color: '#1e293b' }
  ];

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#050a15] text-white p-4 md:p-12 pb-32">
      
      {/* HEADER SECTION (Like ref image) */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative z-10">
        <div>
          <h1 className="text-6xl md:text-8xl inspo-title-display text-transparent bg-clip-text bg-gradient-to-r from-white/90 via-blue-200 to-blue-500">
            Analytics Engine
          </h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="w-1.5 h-4 bg-blue-500 rounded animate-pulse" />
             <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.5em]">Sulaiman Graphics Matrix v1.5 [ Ledger ]</p>
          </div>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="relative z-50 bg-[#070e1b] modular-border-neon px-10 py-6 font-black italic shadow-2xl transition-all active:scale-95 hover:bg-blue-600/10">
          <span className="flex items-center gap-4 text-sm tracking-widest uppercase text-white">
            <Plus size={20} className="text-blue-500"/> ACTIVATE LOG PROTOCOL
          </span>
        </button>
      </div>

      {/* MODULAR STATS (lots of boxes) */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
        {dashboardStats.map((s, i) => (
          <div key={i} className="modular-border-neon p-8">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.25em] mb-2">{s.label}</p>
            <h2 className={`text-2xl md:text-4xl font-black italic ${s.color} tracking-tighter`}>{s.val}</h2>
          </div>
        ))}
      </div>

      {/* CHARTS GRID (Refined Vector Styles) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Line Chart like top-right ref */}
        <div className="modular-border-neon p-10 h-[450px]">
          <h3 className="text-xs font-black italic uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
             <Calendar className="text-blue-500" size={18}/> TRAJECTORY MATRIX
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={metrics}>
              <XAxis dataKey="log_date" hide />
              <Tooltip contentStyle={{ backgroundColor: '#070e1b/95', backdropBlur: '12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '15px' }} />
              <Area type="monotone" dataKey="revenue_earned" stroke="transparent" fill="rgba(37,99,235,0.15)" />
              <Line type="monotone" dataKey="revenue_earned" stroke="#3b82f6" strokeWidth={5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Chart like center ref */}
        <div className="modular-border-neon p-10 flex flex-col h-[450px]">
          <h3 className="text-xs font-black italic uppercase tracking-[0.3em] mb-12 self-start">Engagement Matrix</h3>
          <ResponsiveContainer width="100%" height="80%">
             <BarChart data={metrics.slice(-10)}>
               <XAxis dataKey="log_date" hide />
               <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', borderRadius: '15px' }} />
               {/* Neon glowing bars */}
               <Bar dataKey="outreach_sent" fill="#1e293b" radius={[10, 10, 0, 0]} barSize={20} />
               <Bar dataKey="responses_received" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={20}/>
             </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW SECTION: MODULAR RECTANGULAR LEDGER CARDS */}
      <div className="max-w-7xl mx-auto">
          <h3 className="text-xl inspo-title-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-blue-500 mb-10 flex items-center gap-4">
             <Target className="text-blue-500" size={24}/> Project Ledger
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProjects.map((log) => (
              log.project_name.length > 0 && (
                <div key={log.id} className="modular-border-neon p-6 bg-radial-at-t bg-[radial-gradient(100px_at_50%_0%,rgba(37,99,235,0.05)_0%,rgba(37,99,235,0)_100%)]">
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1.5">Sulaiman Graphics Matrix [ledger entry]</p>
                    <h4 className="text-xl font-bold italic text-white tracking-tight mb-3 truncate">{log.project_name}</h4>
                    <span className="text-4xl font-black italic text-blue-400 tracking-tighter leading-none">${Number(log.revenue_earned || 0).toFixed(0)}</span>
                </div>
              )
            ))}
          </div>
      </div>


      {/* 🧩 INPUT PAGE (MODAL) - The LEDGER INPUT Re-Engineering */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#050a15]/98 backdrop-blur-3xl overflow-y-auto">
          <form onSubmit={handleSave} className="modular-border-neon bg-[#0a0f1d] p-8 md:p-16 w-full max-w-4xl relative my-auto scrollbar-thin overflow-y-scroll max-h-[90vh]">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><X size={32}/></button>
            
            <div className="flex items-start gap-4 mb-16">
                 <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <FileText className="text-blue-500" size={32} />
                 </div>
                 <div>
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Log session Matrix</h2>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-2">Data Transmission Protocol // matrix v1.5</p>
                 </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>{p}</button>
                ))}
              </div>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="glass-input w-full font-bold uppercase text-sm" />
            </div>

            {/* THE NEW MODULAR LEDGER INPUTS */}
            <div className="mb-12">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h4 className="text-2xl inspo-title-display text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600">Sync Projects</h4>
                    <button type="button" onClick={() => setFormData({...formData, projects: [...formData.projects, { name: '', revenue: '0.00' }]})}
                        className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">
                        <PlusCircle size={16}/> Add Matrix Row
                    </button>
                </div>
                
                <div className="space-y-4">
                    {formData.projects.map((project, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5">
                            <input type="text" placeholder="Insert project name..." value={project.name}
                                className="w-full md:flex-1 bg-transparent border-b border-white/10 outline-none text-white font-bold text-lg p-2 focus:border-blue-500"
                                onChange={(e) => {
                                    const newProjects = [...formData.projects];
                                    newProjects[index].name = e.target.value;
                                    setFormData({...formData, projects: newProjects});
                                }} />
                            
                            <input type="number" placeholder="0.00" value={project.revenue} step="0.01"
                                className="w-full md:w-40 bg-transparent border-b border-white/10 outline-none text-blue-400 font-black text-3xl tracking-tight p-2 focus:border-blue-500"
                                onChange={(e) => {
                                    const newProjects = [...formData.projects];
                                    newProjects[index].revenue = e.target.value;
                                    setFormData({...formData, projects: newProjects});
                                }} />
                            
                            {formData.projects.length > 1 && (
                                <button type="button" onClick={() => setFormData({...formData, projects: formData.projects.filter((_, i) => i !== index)})}
                                className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 active:scale-95 transition-all"><Trash2 size={16}/></button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Core Funnel Inputs (Slimmed down) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: "Outreach Sent", key: "outreach", icon: Search },
                { label: "Responses", key: "responses", icon: MessageSquare },
                { label: "Clients Acquired", key: "clients", icon: Users }
              ].map((input) => (
                <div key={input.key} className="space-y-3 relative group">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-3">{input.label}</label>
                  <div className="relative">
                    <input.icon size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500" />
                    <input type="number" placeholder="0" className="glass-input w-full pl-16 font-bold text-lg"
                        onChange={(e) => setFormData({...formData, [input.key]: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE PREVIEW FEEDBACK */}
            <div className="mb-10 flex gap-6 p-6 rounded-2xl bg-[#070e1b] border border-blue-500/10">
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">LiveData Feedback Protocol:</span>
                <span className="text-xs font-black text-blue-400">{((formData.responses / (formData.outreach || 1)) * 100).toFixed(0)}% Res-Rate</span>
            0</div>

            <button type="submit" className="w-full bg-blue-600 py-7 rounded-3xl font-black italic tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all uppercase active:scale-[0.98]">
              CONFIRM & SYNC LEDGER DATA
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
