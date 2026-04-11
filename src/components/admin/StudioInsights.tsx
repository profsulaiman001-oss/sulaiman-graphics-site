import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, PlusCircle, Trash2, Layers, 
  Zap, MousePointer2, Linkedin, Twitter, Instagram, Star, Search 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis,
  BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  const [formData, setFormData] = useState({
    linkedin: { sent: 0, replies: 0 },
    instagram: { sent: 0, replies: 0 },
    twitter: { sent: 0, replies: 0 },
    referral: 0,
    clients: 0, 
    leadQuality: 3,         
    observations: '',       
    date: new Date().toISOString().split('T')[0],
    projects: [{ name: '', revenue: '', category: 'Logo Design', isMilestone: false }]
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

  const handleAddProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: '', revenue: '', category: 'Logo Design', isMilestone: false }]
    });
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...formData.projects];
    newProjects[index][field] = value;
    setFormData({ ...formData, projects: newProjects });
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Execute Delete Protocol?")) return;
    const { error } = await supabase.from('insight_projects').delete().eq('id', projectId);
    if (!error) fetchMetrics();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to sync data.");
    
    const { data: insightLog, error: logError } = await supabase.from('studio_insights').insert([{
      user_id: user.id,
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

    if (logError) return alert(`Log Error: ${logError.message}`);

    const projectsToInsert = formData.projects
      .filter(p => p.name.trim() !== '')
      .map(p => ({
        insight_id: insightLog.id, 
        user_id: user.id,
        project_name: p.name.trim(), 
        revenue_earned: parseFloat(p.revenue) || 0,
        project_category: p.category,
        is_milestone: p.isMilestone 
      }));

    if (projectsToInsert.length > 0) {
      await supabase.from('insight_projects').insert(projectsToInsert);
    }

    setIsLogging(false); 
    fetchMetrics();
    setFormData({ 
      linkedin: { sent: 0, replies: 0 }, instagram: { sent: 0, replies: 0 },
      twitter: { sent: 0, replies: 0 }, referral: 0, clients: 0, 
      leadQuality: 3, observations: '', date: new Date().toISOString().split('T')[0], 
      projects: [{ name: '', revenue: '', category: 'Logo Design', isMilestone: false }] 
    });
  };

  const allProjects = metrics.flatMap(log => log.insight_projects || []);
  const totalRev = allProjects.reduce((acc, p) => acc + Number(p.revenue_earned || 0), 0);
  const categories = ['Logo Design', 'Flyer/Poster', 'Branding', 'Social Media', 'UI Design'];
  
  const platforms = [
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={14}/>, color: 'text-blue-400' },
    { id: 'instagram', label: 'Instagram', icon: <Instagram size={14}/>, color: 'text-pink-500' },
    { id: 'twitter', label: 'X/Twitter', icon: <Twitter size={14}/>, color: 'text-zinc-400' }
  ];

  const pulseData = metrics.map(m => {
    const totalS = (m.linkedin_sent || 0) + (m.instagram_sent || 0) + (m.twitter_sent || 0);
    const totalR = (m.linkedin_replies || 0) + (m.instagram_replies || 0) + (m.twitter_replies || 0);
    return { date: m.log_date, rate: totalS > 0 ? (totalR / totalS) * 100 : 0 };
  });

  const sourceBarData = platforms.map(p => ({
    name: p.label,
    sent: metrics.reduce((acc, curr) => acc + (curr[`${p.id}_sent`] || 0), 0),
    replies: metrics.reduce((acc, curr) => acc + (curr[`${p.id}_replies`] || 0), 0)
  }));

  const radarData = categories.map(cat => ({
    subject: cat,
    A: allProjects.filter(p => p.project_category === cat).reduce((sum, p) => sum + Number(p.revenue_earned), 0) / 1000,
  }));

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#020617] text-white p-4 md:p-12 pb-32 font-sans selection:bg-blue-500 uppercase overflow-x-hidden">
      
      {/* 🚀 HEADER - Scaled for Mobile */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-8 md:w-12 bg-blue-500/50"/>
            <span className="text-blue-500 font-black text-[8px] md:text-[9px] tracking-[0.4em] md:tracking-[0.6em]">Sulaiman Graphics Terminal</span>
          </div>
          <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter leading-[0.85] md:leading-[0.75] text-white/90">
            Design <span className="text-blue-600">Studio</span>
          </h1>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="w-full lg:w-auto group bg-blue-600 px-8 md:px-12 py-5 md:py-7 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-blue-600/20">
          <span className="relative flex items-center justify-center gap-4 text-[10px] md:text-[11px] font-black italic tracking-[0.2em] md:tracking-[0.3em] text-white">
            <PlusCircle size={18}/> New Project Log
          </span>
        </button>
      </div>

      {/* 🧩 DASHBOARD BENTO - Grid rows auto-min on mobile */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 auto-rows-min lg:auto-rows-[160px] gap-4 mb-10">
        
        <div className="lg:col-span-9 lg:row-span-1 modular-border-neon p-6 bg-[#070e1b] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
           <div className="min-w-[120px]">
              <h3 className="text-[9px] font-black tracking-[0.4em] text-blue-500 mb-1">Efficiency Pulse</h3>
              <span className="text-3xl md:text-4xl font-black italic">{pulseData[pulseData.length-1]?.rate.toFixed(0) || 0}%</span>
           </div>
           <div className="h-24 md:h-full w-full flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={pulseData}>
                 <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-3 lg:row-span-1 modular-border-neon p-6 bg-blue-600 flex items-center justify-between min-h-[100px]">
            <div>
              <p className="text-[9px] font-black text-white/60 tracking-widest mb-1">Total Gross</p>
              <h4 className="text-2xl md:text-3xl font-black italic text-white">₦{totalRev.toLocaleString()}</h4>
            </div>
            <Activity className="text-white/40 animate-pulse" size={28}/>
        </div>

        <div className="lg:col-span-5 lg:row-span-3 modular-border-neon p-6 md:p-8 bg-[#070e1b]/80 min-h-[300px]">
          <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 mb-6 flex items-center gap-2">
            <Search size={14} className="text-blue-500"/> Outreach Yield Matrix
          </h3>
          <div className="h-[220px] md:h-[85%]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceBarData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fill: '#71717a', fontSize: 9, fontWeight: '900'}} width={70} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0a0f1d', border: 'none'}}/>
                <Bar dataKey="sent" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="replies" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 lg:row-span-3 modular-border-neon p-6 md:p-8 bg-[#070e1b]/80 min-h-[300px]">
          <h3 className="text-[10px] font-black tracking-[0.4em] text-zinc-500 mb-4 uppercase">Service Portfolio Mix</h3>
          <div className="h-[250px] md:h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 8, fontWeight: '900'}} />
                <Radar name="Rev" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 lg:row-span-3 modular-border-neon p-6 bg-[#070e1b] min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[9px] font-black tracking-[0.4em] text-zinc-600 uppercase">Revenue Velocity</h3>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="h-[150px] md:h-[80%] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <Area type="monotone" dataKey="responses_received" stroke="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🧾 LIVE STACK LIST - Vertical on mobile */}
      <div className="max-w-[1600px] mx-auto px-2 md:px-0">
        <div className="flex items-center gap-6 mb-8">
           <Layers className="text-blue-500 shrink-0" size={20}/>
           <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Live Design Stack</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
          {allProjects.map((proj, i) => (
            <div key={i} className="group flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#0a0f1d]/40 border border-white/5 p-5 md:p-6 rounded-2xl hover:border-blue-500/30 transition-all gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${proj.is_milestone ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-white/5 border-white/5 text-blue-500'}`}>
                    {proj.is_milestone ? <Star size={16}/> : <MousePointer2 size={16}/>}
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold italic text-white/90 truncate max-w-[180px] md:max-w-none">{proj.project_name}</h4>
                    <span className="text-[8px] md:text-[9px] font-black text-blue-500/60 tracking-[0.2em]">{proj.project_category}</span>
                  </div>
                </div>
                <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-6 md:gap-10 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                   <div className="text-2xl md:text-3xl font-black italic text-white tracking-tighter">₦{Number(proj.revenue_earned).toLocaleString()}</div>
                   <button onClick={() => handleDeleteProject(proj.id)} className="p-3 bg-red-500/5 text-zinc-800 hover:text-red-500 rounded-lg"><Trash2 size={18}/></button>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📝 CORRECTED MODAL - Scrollable and Statically positioned on mobile */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-start md:items-center justify-center p-0 md:p-4 bg-[#020617]/98 backdrop-blur-3xl overflow-y-auto">
          <form onSubmit={handleSave} className="bg-[#0a0f1d] border-t md:border border-blue-500/20 p-6 md:p-14 w-full max-w-6xl md:rounded-[40px] shadow-2xl relative min-h-screen md:min-h-0">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-zinc-600 hover:text-white"><X size={28}/></button>
            
            <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 gap-6">
               <div className="flex items-center gap-4 text-white">
                 <Zap className="text-blue-500" size={24}/>
                 <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">Initialize Log</h2>
               </div>

               <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                    <Calendar size={14} className="text-blue-500 mr-3" />
                    <input type="date" value={formData.date} className="bg-transparent text-[10px] font-bold outline-none text-zinc-300 uppercase w-full" onChange={(e)=>setFormData({...formData, date: e.target.value})}/>
                  </div>
                  <div className="flex bg-black p-1 rounded-2xl border border-white/5 overflow-x-auto">
                    {['daily', 'weekly', 'monthly'].map(p => (
                      <button key={p} type="button" onClick={()=>setPeriod(p)} className={`flex-1 px-4 py-2 rounded-xl text-[8px] font-black tracking-[0.1em] uppercase whitespace-nowrap ${period===p ? 'bg-blue-600 text-white' : 'text-zinc-600'}`}>{p}</button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-10">
               <div className="space-y-4 md:space-y-6">
                  <label className="text-[9px] md:text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">Outreach Intelligence</label>
                  <div className="grid grid-cols-1 gap-3">
                     {platforms.map(p => (
                       <div key={p.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                         <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-2xl bg-white/5 ${p.color}`}>{p.icon}</div>
                           <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                         </div>
                         <div className="flex gap-2 flex-1 sm:justify-end">
                           <input type="number" placeholder="SENT" className="flex-1 sm:w-24 bg-[#050a15] border border-white/5 p-3 rounded-xl text-center font-bold text-blue-500 outline-none" onChange={(e) => setFormData({...formData, [p.id]: {...formData[p.id], sent: parseInt(e.target.value) || 0}})} />
                           <input type="number" placeholder="REPLY" className="flex-1 sm:w-24 bg-[#050a15] border border-white/10 p-3 rounded-xl text-center font-bold text-green-400 outline-none" onChange={(e) => setFormData({...formData, [p.id]: {...formData[p.id], replies: parseInt(e.target.value) || 0}})} />
                         </div>
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] md:text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">Project Manifest</label>
                    <button type="button" onClick={handleAddProject} className="text-blue-500 flex items-center gap-2 text-[9px] font-bold tracking-widest hover:bg-blue-500/10 px-3 py-2 rounded-xl transition-all">
                      <Plus size={14}/> Add Row
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[350px] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {formData.projects.map((project, idx) => (
                      <div key={idx} className="flex flex-col gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 relative">
                        <input 
                          type="text" placeholder="Project Name" 
                          className="w-full bg-[#050a15] border border-white/5 p-4 rounded-2xl font-bold text-sm outline-none uppercase"
                          value={project.name} onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <select 
                            className="bg-[#050a15] border border-white/5 p-4 rounded-2xl font-black text-[10px] uppercase outline-none"
                            value={project.category} onChange={(e) => handleProjectChange(idx, 'category', e.target.value)}
                          >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <div className="relative">
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-500">₦</span>
                             <input 
                              type="number" placeholder="PRICE" 
                              className="w-full bg-blue-600/10 border border-blue-500/20 pl-10 pr-4 py-4 rounded-2xl font-black text-blue-500 outline-none text-sm"
                              value={project.revenue} onChange={(e) => handleProjectChange(idx, 'revenue', e.target.value)}
                             />
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleProjectChange(idx, 'isMilestone', !project.isMilestone)}
                          className={`absolute top-2 right-2 p-2 rounded-xl border transition-all ${project.isMilestone ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg scale-105' : 'bg-white/5 border-white/10 text-zinc-700'}`}
                        >
                          <Star size={14} fill={project.isMilestone ? "currentColor" : "none"}/>
                        </button>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 py-6 md:py-8 rounded-2xl md:rounded-[25px] font-black italic tracking-widest text-xs md:text-sm shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all uppercase mt-6 mb-12 md:mb-0">
              Sync Studio Intelligence
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
