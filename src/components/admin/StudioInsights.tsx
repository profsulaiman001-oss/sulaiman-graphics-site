import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, FileText, Search, MessageSquare, 
  Users, PlusCircle, Trash2, Layers, BarChart3, PieChart as PieIcon, 
  TrendingUp, Zap, MousePointer2, Linkedin, Twitter, Instagram, Globe 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis,
  BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  // Updated state for per-platform tracking
  const [formData, setFormData] = useState({
    linkedin: { sent: 0, replies: 0 },
    instagram: { sent: 0, replies: 0 },
    twitter: { sent: 0, replies: 0 },
    referral: 0,
    clients: 0, 
    leadQuality: 3,         
    observations: '',       
    date: new Date().toISOString().split('T')[0],
    projects: [{ name: '', revenue: '0.00', category: 'Logo Design', isMilestone: false }]
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
      // Map platform specific data to DB columns
      linkedin_sent: formData.linkedin.sent,
      linkedin_replies: formData.linkedin.replies,
      instagram_sent: formData.instagram.sent,
      instagram_replies: formData.instagram.replies,
      twitter_sent: formData.twitter.sent,
      twitter_replies: formData.twitter.replies,
      referral_count: formData.referral,
      clients_acquired: formData.clients, 
      lead_quality: formData.leadQuality,   
      notes: formData.observations,         
      period_type: period, 
      log_date: formData.date
    }]).select().single();

    if (logError) return alert(`Database Error: ${logError.message}`);

    const projectsToInsert = formData.projects.filter(p => p.name.trim() !== '').map(p => ({
        insight_id: insightLog.id, user_id: user.id,
        project_name: p.name.trim(), 
        revenue_earned: parseFloat(p.revenue) || 0,
        project_category: p.category,
        is_milestone: p.isMilestone 
    }));

    await supabase.from('insight_projects').insert(projectsToInsert);
    setIsLogging(false); 
    fetchMetrics();
    setFormData({ 
      linkedin: { sent: 0, replies: 0 },
      instagram: { sent: 0, replies: 0 },
      twitter: { sent: 0, replies: 0 },
      referral: 0,
      clients: 0, 
      leadQuality: 3, 
      observations: '', 
      date: new Date().toISOString().split('T')[0], 
      projects: [{ name: '', revenue: '0.00', category: 'Logo Design', isMilestone: false }] 
    });
  };

  const allProjects = metrics.flatMap(log => log.insight_projects || []);
  const totalRev = allProjects.reduce((acc, p) => acc + Number(p.revenue_earned || 0), 0);
  const categories = ['Logo Design', 'Flyer/Poster', 'Branding', 'Social Media', 'UI Design'];
  
  // Platform definitions for UI generation
  const platforms = [
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={14}/>, color: 'text-blue-400' },
    { id: 'instagram', label: 'Instagram', icon: <Instagram size={14}/>, color: 'text-pink-500' },
    { id: 'twitter', label: 'X/Twitter', icon: <Twitter size={14}/>, color: 'text-zinc-400' }
  ];

  const radarData = categories.map(cat => ({
    subject: cat,
    A: allProjects.filter(p => p.project_category === cat).reduce((sum, p) => sum + Number(p.revenue_earned), 0) / 1000,
  }));

  // Chart Logic: Aggregate efficiency per platform
  const sourceBarData = platforms.map(p => {
    const sent = metrics.reduce((acc, curr) => acc + (curr[`${p.id}_sent`] || 0), 0);
    const replies = metrics.reduce((acc, curr) => acc + (curr[`${p.id}_replies`] || 0), 0);
    return { name: p.label, sent, replies };
  });

  const COLORS = ['#3b82f6', '#ec4899', '#6366f1', '#eab308'];

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

        {/* Updated Source Efficiency Chart */}
        <div className="lg:col-span-4 lg:row-span-2 modular-border-neon p-6 bg-[#070e1b]">
          <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4">Fishing Hole Yield</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceBarData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{fill: '#71717a', fontSize: 8, fontWeight: '900'}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0a0f1d', border: '1px solid #1e293b'}}/>
              <Bar dataKey="sent" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={10} />
              <Bar dataKey="replies" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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

        <div className="lg:col-span-4 modular-border-neon p-6 bg-[#070e1b] flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Gross</p>
              <h4 className="text-3xl font-black italic">₦{totalRev.toLocaleString()}</h4>
            </div>
            <Activity className="text-blue-500/20" size={40}/>
        </div>
      </div>

      {/* 🧾 DESIGN STACK LEDGER */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-6 mb-8">
           <Layers className="text-blue-500" size={20}/>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Live Design Stack</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        
        <div className="space-y-3">
          {allProjects.map((proj, i) => (
            <div key={i} className="group w-full flex justify-between items-center bg-[#0a0f1d]/40 border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${proj.is_milestone ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-white/5 border-white/5 text-blue-500'}`}>
                    {proj.is_milestone ? <Target size={16}/> : <MousePointer2 size={16}/>}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold italic text-white/90">{proj.project_name}</h4>
                    <span className="text-[9px] font-black uppercase text-blue-500/60 tracking-[0.2em]">{proj.project_category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
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

      {/* 📝 UPDATED INPUT MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#020617]/98 backdrop-blur-3xl overflow-y-auto">
          <form onSubmit={handleSave} className="bg-[#0a0f1d] border border-blue-500/20 p-8 md:p-14 w-full max-w-5xl rounded-[40px] shadow-2xl relative my-auto">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white"><X size={32}/></button>
            
            <div className="mb-12 flex items-center gap-4">
               <div className="p-4 bg-blue-600/10 rounded-2xl"><Zap className="text-blue-500" size={30}/></div>
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Initialize Log</h2>
            </div>

            {/* Outreach Platform Intelligence Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Outreach Intelligence Matrix</label>
                  <div className="space-y-3">
                     {platforms.map(p => (
                       <div key={p.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all">
                         <div className={`p-3 rounded-2xl bg-white/5 ${p.color}`}>{p.icon}</div>
                         <span className="flex-1 text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                         <div className="flex gap-2">
                           <input type="number" placeholder="Sent" className="w-16 bg-[#050a15] border border-white/5 p-3 rounded-xl text-center font-bold text-blue-500 outline-none"
                             onChange={(e) => setFormData({...formData, [p.id]: {...formData[p.id], sent: parseInt(e.target.value) || 0}})} />
                           <input type="number" placeholder="In" className="w-16 bg-[#050a15] border border-white/10 p-3 rounded-xl text-center font-bold text-green-400 outline-none"
                             onChange={(e) => setFormData({...formData, [p.id]: {...formData[p.id], replies: parseInt(e.target.value) || 0}})} />
                         </div>
                       </div>
                     ))}
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                       <div className="p-3 rounded-2xl bg-white/5 text-yellow-500"><Users size={14}/></div>
                       <span className="flex-1 text-[10px] font-black uppercase tracking-widest">Direct Referrals</span>
                       <input type="number" placeholder="Total" className="w-34 bg-[#050a15] border border-white/5 p-3 rounded-xl text-center font-bold text-yellow-500 outline-none"
                         onChange={(e) => setFormData({...formData, referral: parseInt(e.target.value) || 0})} />
                     </div>
                  </div>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex justify-between">
                      Lead Quality <span>Level {formData.leadQuality}</span>
                    </label>
                    <input type="range" min="1" max="5" value={formData.leadQuality} 
                      className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      onChange={(e) => setFormData({...formData, leadQuality: parseInt(e.target.value)})}/>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block mb-2">Total Converted Clients</label>
                    <input type="number" className="glass-input w-full font-bold text-center text-xl p-4" onChange={(e) => setFormData({...formData, clients: parseInt(e.target.value) || 0})}/>
                  </div>
               </div>
            </div>

            {/* Dynamic Project Stack */}
            <div className="mb-10">
               <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-black italic uppercase text-blue-500">Project Stack</h4>
                <button type="button" onClick={() => setFormData({...formData, projects: [...formData.projects, { name: '', revenue: '0.00', category: 'Logo Design', isMilestone: false }]})} 
                  className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all">+ Add Entry</button>
               </div>
               {formData.projects.map((p, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row gap-3 bg-white/5 p-4 rounded-3xl mb-3 border border-white/5">
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
                    <button type="button" onClick={() => {
                        const next = [...formData.projects];
                        next[idx].isMilestone = !next[idx].isMilestone;
                        setFormData({...formData, projects: next});
                    }} className={`p-3 rounded-xl border transition-all ${p.isMilestone ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' : 'bg-white/5 border-white/5 text-zinc-600'}`}>
                      <Target size={16}/>
                    </button>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 gap-8 mb-12">
               <textarea placeholder="SYSTEM OBSERVATIONS: Technical notes..." 
                className="bg-white/5 border border-white/5 p-6 rounded-3xl h-32 outline-none focus:border-blue-500 transition-all font-mono text-xs text-zinc-400"
                onChange={(e) => setFormData({...formData, observations: e.target.value})}/>
            </div>

            <button type="submit" className="w-full bg-blue-600 py-8 rounded-[25px] font-black italic uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.01]">
              Sync Intelligence Ledger
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
