import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, FileText, Search, MessageSquare, 
  Users, PlusCircle, Trash2, Layers, BarChart3, PieChart as PieIcon, 
  TrendingUp, Zap, MousePointer2
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis,
  BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  const [formData, setFormData] = useState({
    outreach: 0, responses: 0, clients: 0, 
    date: new Date().toISOString().split('T')[0],
    projects: [{ name: '', revenue: '0.00', category: 'Logo Design' }]
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

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Execute Delete Protocol? This data will be purged.")) return;
    const { error } = await supabase.from('insight_projects').delete().eq('id', projectId);
    if (!error) fetchMetrics();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Security Error: Identity unconfirmed.");
    
    const { data: insightLog, error: logError } = await supabase.from('studio_insights').insert([{
      user_id: user.id,
      outreach_sent: formData.outreach, responses_received: formData.responses,
      clients_acquired: formData.clients, period_type: period, log_date: formData.date
    }]).select().single();

    if (logError) return alert(`Database Error: ${logError.message}`);

    const projectsToInsert = formData.projects.filter(p => p.name.trim() !== '').map(p => ({
        insight_id: insightLog.id, user_id: user.id,
        project_name: p.name.trim(), revenue_earned: parseFloat(p.revenue) || 0,
        project_category: p.category
    }));

    await supabase.from('insight_projects').insert(projectsToInsert);
    setIsLogging(false); 
    fetchMetrics();
    setFormData({ outreach: 0, responses: 0, clients: 0, date: new Date().toISOString().split('T')[0], projects: [{ name: '', revenue: '0.00', category: 'Logo Design' }] });
  };

  const allProjects = metrics.flatMap(log => log.insight_projects || []);
  const totalRev = allProjects.reduce((acc, p) => acc + Number(p.revenue_earned || 0), 0);
  const categories = ['Logo Design', 'Flyer/Poster', 'Branding', 'Social Media', 'UI Design'];

  const radarData = categories.map(cat => ({
    subject: cat,
    A: allProjects.filter(p => p.project_category === cat).reduce((sum, p) => sum + Number(p.revenue_earned), 0) / 1000,
  }));

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#020617] text-white p-4 md:p-12 pb-32 font-sans selection:bg-blue-500">
      
      {/* 🚀 HEADER */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-blue-500/50"/>
            <span className="text-blue-500 font-black text-[9px] tracking-[0.6em] uppercase">Sulaiman Graphics Terminal</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.75] text-white/90">
            Design <span className="text-blue-600">Studio</span>
          </h1>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="group bg-blue-600 px-12 py-7 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/20">
          <span className="relative flex items-center gap-4 text-[11px] font-black italic tracking-[0.3em] uppercase text-white">
            <PlusCircle size={20}/> New Project Log
          </span>
        </button>
      </div>

      {/* 🧩 MOSAIC BENTO GRID */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 auto-rows-[180px] gap-4 mb-10">
        
        {/* Main Trajectory */}
        <div className="lg:col-span-8 lg:row-span-3 modular-border-neon p-8 bg-[#070e1b]/80 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500"/> Revenue Velocity (₦)
            </h3>
            <div className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20 animate-pulse">LIVE_FEED</div>
          </div>
          <div className="h-[80%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="nairaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <Tooltip contentStyle={{backgroundColor: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px'}} />
                <Area type="monotone" dataKey="responses_received" stroke="#3b82f6" fill="url(#nairaGlow)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Radar */}
        <div className="lg:col-span-4 lg:row-span-2 modular-border-neon p-6 bg-[#070e1b]">
          <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2">Service Portfolio</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 8, fontWeight: '900'}} />
              <Radar name="Rev" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Outreach Heatmap */}
        <div className="lg:col-span-4 lg:row-span-1 modular-border-neon p-5 bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex justify-between mb-4">
             <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Outreach Heat</h3>
             <Zap size={12} className="text-yellow-500"/>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} className={`h-3 rounded-sm ${i < metrics.length ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-white/5 hover:bg-white/10'}`} />
            ))}
          </div>
          <p className="text-[8px] font-bold text-zinc-600 mt-4 uppercase tracking-widest">30-Day Activity Pulse</p>
        </div>

        {/* Sparkline & Stats */}
        <div className="lg:col-span-4 modular-border-neon p-6 bg-[#070e1b] flex items-center justify-between">
           <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Gross</p>
              <h4 className="text-3xl font-black italic">₦{totalRev.toLocaleString()}</h4>
           </div>
           <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={metrics}>
                    <Line type="monotone" dataKey="responses_received" stroke="#3b82f6" strokeWidth={2} dot={false} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 🧾 DESIGN STACK LEDGER */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-6 mb-8">
           <Layers className="text-blue-500" size={20}/>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Live Design Stack</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
           <div className="text-[10px] font-mono text-zinc-600">Total Entries: {allProjects.length}</div>
        </div>
        
        <div className="space-y-3">
          {allProjects.map((proj, i) => (
            <div key={i} className="group w-full flex flex-col md:flex-row justify-between items-center bg-[#0a0f1d]/40 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-blue-500">
                    <MousePointer2 size={16}/>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold italic text-white/90">{proj.project_name}</h4>
                    <span className="text-[9px] font-black uppercase text-blue-500/60 tracking-[0.2em]">{proj.project_category}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-10 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Revenue Alpha</p>
                    <div className="text-3xl font-black italic text-white tracking-tighter">₦{Number(proj.revenue_earned).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleDeleteProject(proj.id)} className="p-3 bg-red-500/5 text-zinc-800 hover:text-red-500 rounded-lg transition-all">
                    <Trash2 size={20}/>
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📝 INPUT MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-2xl">
          <form onSubmit={handleSave} className="bg-[#0a0f1d] border border-blue-500/20 p-8 md:p-14 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] relative">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white"><X size={32}/></button>
            
            <div className="mb-12 flex items-center gap-4">
               <div className="p-4 bg-blue-600/10 rounded-2xl"><Zap className="text-blue-500" size={30}/></div>
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Log Design Session</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
               <input type="date" value={formData.date} className="glass-input w-full font-bold uppercase" onChange={(e) => setFormData({...formData, date: e.target.value})} />
               <div className="flex bg-white/5 p-1 rounded-2xl">
                  {['daily', 'weekly', 'monthly'].map(p => (
                    <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${period === p ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>{p}</button>
                  ))}
               </div>
            </div>

            <div className="mb-10">
               <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black italic uppercase text-blue-500">Project Stack</h4>
                <button type="button" onClick={() => setFormData({...formData, projects: [...formData.projects, { name: '', revenue: '0.00', category: 'Logo Design' }]})} className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full">+ Add Row</button>
               </div>
               {formData.projects.map((p, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row gap-3 bg-white/5 p-4 rounded-3xl mb-3">
                    <input placeholder="Job Title" className="flex-1 bg-transparent p-2 outline-none text-white font-bold"
                      onChange={(e) => {
                        const next = [...formData.projects];
                        next[idx].name = e.target.value;
                        setFormData({...formData, projects: next});
                      }} />
                    <select className="bg-[#050a15] p-3 rounded-xl text-[10px] font-bold uppercase text-blue-400 border border-white/5"
                      onChange={(e) => {
                        const next = [...formData.projects];
                        next[idx].category = e.target.value;
                        setFormData({...formData, projects: next});
                      }}>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input placeholder="₦0.00" className="w-full md:w-32 bg-transparent p-2 outline-none text-white font-black text-xl"
                       onChange={(e) => {
                        const next = [...formData.projects];
                        next[idx].revenue = e.target.value;
                        setFormData({...formData, projects: next});
                      }} />
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
               {[{l: 'Outreach', k: 'outreach'}, {l: 'Replies', k: 'responses'}, {l: 'Converted', k: 'clients'}].map(item => (
                 <div key={item.k}>
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block text-center">{item.l}</label>
                    <input type="number" className="glass-input w-full font-bold text-center text-xl" onChange={(e) => setFormData({...formData, [item.k]: parseInt(e.target.value) || 0})}/>
                 </div>
               ))}
            </div>

            <button type="submit" className="w-full bg-blue-600 py-8 rounded-[25px] font-black italic uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20">
              Initialize Data Transmission
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
