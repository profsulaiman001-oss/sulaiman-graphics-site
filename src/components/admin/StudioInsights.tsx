import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, FileText, Search, MessageSquare, Users, PlusCircle, Trash2, Layers, BarChart3, PieChart as PieIcon, TrendingUp
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis,
  BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line, CartesianGrid
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  const [formData, setFormData] = useState({
    outreach: 0, responses: 0, clients: 0, 
    date: new Date().toISOString().split('T')[0],
    projects: [{ name: '', revenue: '0.00' }]
  });

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
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
    if (formData.responses > formData.outreach) return alert("Responses cannot exceed Outreach.");
    if (formData.projects.length === 0 || formData.projects.every(p => p.name.trim() === '')) return alert("Insert at least one valid project.");

    const { data: insightLog, error: logError } = await supabase.from('studio_insights').insert([{
      user_id: user.id,
      outreach_sent: formData.outreach, responses_received: formData.responses,
      clients_acquired: formData.clients, period_type: period, log_date: formData.date
    }]).select().single();

    if (logError) return alert(`Database Error (Parent): ${logError.message}`);

    const projectsToInsert = formData.projects.filter(p => p.name.trim() !== '').map(p => ({
        insight_id: insightLog.id, user_id: user.id,
        project_name: p.name.trim(), revenue_earned: parseFloat(p.revenue) || 0.00
    }));

    const { error: projectError } = await supabase.from('insight_projects').insert(projectsToInsert);

    if (!projectError) { 
      setIsLogging(false); fetchMetrics(); 
      setFormData({ outreach: 0, responses: 0, clients: 0, date: new Date().toISOString().split('T')[0], projects: [{ name: '', revenue: '0.00' }] });
    }
  };

  const allProjects = metrics.flatMap(log => log.insight_projects || []);
  const totalRev = allProjects.reduce((acc, p) => acc + Number(p.revenue_earned || 0), 0);
  const totalOut = metrics.reduce((acc, c) => acc + Number(c.outreach_sent || 0), 0);

  const pieData = [
    { name: 'Revenue', value: totalRev, color: '#3b82f6' },
    { name: 'Remaining', value: Math.max(0, 15000 - totalRev), color: 'rgba(255,255,255,0.05)' }
  ];

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#050a15] text-white p-4 md:p-12 pb-32">
      
      {/* 🚀 ELITE HEADER */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-12 bg-blue-500"/>
            <span className="text-blue-500 font-black text-[10px] tracking-[0.5em] uppercase">System Intelligence Active</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white/90">
            Analytics <span className="text-blue-600">Engine</span>
          </h1>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="group relative overflow-hidden bg-blue-600 px-12 py-8 rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
          <span className="relative flex items-center gap-4 text-sm font-black italic tracking-[0.2em] uppercase">
            <PlusCircle size={24}/> Initialize Log Protocol
          </span>
        </button>
      </div>

      {/* 🧩 THE COMPLEX BENTO GRID */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        
        {/* TOP LEFT: Massive Trajectory Area (8 Cols) */}
        <div className="lg:col-span-8 modular-border-neon p-8 min-h-[500px] flex flex-col bg-gradient-to-b from-blue-500/5 to-transparent">
          <div className="flex justify-between items-center mb-10">
            <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
              <TrendingUp className="text-blue-500" size={16}/> Revenue Trajectory [Complex Mode]
            </h3>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-500 uppercase">Live_Stream</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="log_date" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip contentStyle={{backgroundColor: '#0a0f1d', border: 'none', borderRadius: '16px'}} />
              <Area type="monotone" dataKey="outreach_sent" stroke="#1e293b" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="responses_received" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TOP RIGHT: The Matrix Core (4 Cols) */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
          <div className="modular-border-neon p-8 flex flex-col items-center justify-center bg-[#070e1b]">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Market Capture</h3>
             <div className="relative w-full aspect-square max-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius="70%" outerRadius="90%" paddingAngle={8} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black italic leading-none">${totalRev.toLocaleString()}</span>
                   <span className="text-[9px] font-bold text-zinc-500 uppercase mt-2">Total Gross</span>
                </div>
             </div>
          </div>
          <div className="modular-border-neon p-8 bg-[#0a0f1d]/40">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Closing conversion</h3>
            <div className="flex items-end gap-4">
               <h2 className="text-6xl font-black italic text-emerald-400 leading-none">
                 {metrics.length > 0 ? ((metrics.reduce((acc, c) => acc + c.clients_acquired, 0) / (totalOut || 1)) * 100).toFixed(0) : 0}%
               </h2>
               <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{width: '41%'}} />
               </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Engagement Histogram (Full width or split) */}
        <div className="lg:col-span-12 modular-border-neon p-10 h-[300px]">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Performance distribution (Histogram)</h3>
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                 <Bar dataKey="outreach_sent" fill="rgba(255,255,255,0.03)" radius={[5, 5, 0, 0]} />
                 <Bar dataKey="responses_received" fill="#3b82f6" radius={[5, 5, 0, 0]} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* 🧾 THE STACKED LEDGER ROWS (Full-Width Rectangles) */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 mb-8">
           <Layers className="text-blue-500" size={24}/>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Live Project Stack</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
           <span className="text-[10px] font-mono text-zinc-600">{allProjects.length} Entries Detected</span>
        </div>
        
        <div className="space-y-3">
          {allProjects.map((log, i) => (
            log.project_name.length > 0 && (
              <div key={i} className="group w-full flex flex-col md:flex-row justify-between items-center bg-[#0a0f1d]/40 border border-white/5 p-6 md:px-12 rounded-2xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <span className="text-[10px] font-mono text-blue-500/50">ENTRY_00{i+1}</span>
                  <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                  <h4 className="text-2xl font-bold italic tracking-tight text-white/90">{log.project_name}</h4>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto md:gap-16 mt-4 md:mt-0">
                  <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Revenue Alpha</span>
                     <span className="text-4xl font-black italic text-blue-400 tracking-tighter">${Number(log.revenue_earned || 0).toLocaleString()}</span>
                  </div>
                  <button className="p-3 bg-red-500/5 text-zinc-700 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* THE INPUT MODAL (No changes to your working logic, just cleaner UI) */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#050a15]/98 backdrop-blur-3xl overflow-y-auto">
          <form onSubmit={handleSave} className="modular-border-neon bg-[#0a0f1d] p-8 md:p-16 w-full max-w-4xl relative my-auto scrollbar-none overflow-y-auto max-h-[95vh]">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><X size={32}/></button>
            
            <div className="flex items-start gap-4 mb-16">
                 <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <FileText className="text-blue-500" size={32} />
                 </div>
                 <div>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Data Matrix Node</h2>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.4em] mt-2">Synchronizing with core ledger</p>
                 </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}>{p}</button>
                ))}
              </div>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="glass-input w-full font-bold uppercase text-sm" />
            </div>

            <div className="mb-12">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h4 className="text-2xl font-black italic uppercase text-blue-400">Project Stack</h4>
                    <button type="button" onClick={() => setFormData({...formData, projects: [...formData.projects, { name: '', revenue: '0.00' }]})}
                        className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">
                        <PlusCircle size={16}/> New Matrix Row
                    </button>
                </div>
                
                <div className="space-y-4">
                    {formData.projects.map((project, index) => (
                        <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-blue-500/20">
                            <input type="text" placeholder="Project name..." value={project.name}
                                className="w-full md:flex-1 bg-transparent border-b border-white/10 outline-none text-white font-bold text-lg p-2 focus:border-blue-500"
                                onChange={(e) => {
                                    const newProjects = [...formData.projects];
                                    newProjects[index].name = e.target.value;
                                    setFormData({...formData, projects: newProjects});
                                }} />
                            <input type="number" placeholder="0.00" value={project.revenue} step="0.01"
                                className="w-full md:w-40 bg-transparent border-b border-white/10 outline-none text-blue-400 font-black text-3xl p-2 focus:border-blue-500"
                                onChange={(e) => {
                                    const newProjects = [...formData.projects];
                                    newProjects[index].revenue = e.target.value;
                                    setFormData({...formData, projects: newProjects});
                                }} />
                            {formData.projects.length > 1 && (
                                <button type="button" onClick={() => setFormData({...formData, projects: formData.projects.filter((_, i) => i !== index)})}
                                className="p-3 text-red-500/30 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: "Outreach Sent", key: "outreach", icon: Search },
                { label: "Responses", key: "responses", icon: MessageSquare },
                { label: "Clients Acquired", key: "clients", icon: Users }
              ].map((input) => (
                <div key={input.key} className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-3">{input.label}</label>
                  <input type="number" placeholder="0" className="glass-input w-full font-bold text-lg"
                        onChange={(e) => setFormData({...formData, [input.key]: parseInt(e.target.value) || 0})} />
                </div>
              ))}
            </div>

            <button type="submit" className="w-full bg-blue-600 py-8 rounded-3xl font-black italic tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all uppercase">
              Confirm Matrix Transmission
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
