import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, Calendar, Activity, X, Target, PlusCircle, Trash2, Layers, 
  Zap, MousePointer2, Linkedin, Twitter, Instagram, Star, Search, Brain, Gauge, Palette, BarChart3, TrendingUp, Users, Share2
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis,
  BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [period, setPeriod] = useState('daily');
  
  const [formData, setFormData] = useState({
    linkedin: { sent: 0, replies: 0 },
    instagram: { sent: 0, replies: 0 },
    twitter: { sent: 0, replies: 0 },
    referral: 0, // Referrals box
    clients: 0,  // Clients box
    leadQuality: 3,         
    observations: '',       
    date: new Date().toISOString().split('T')[0],
    projects: [{ name: '', revenue: '', category: 'Logo Design', isMilestone: false }],
    complexity: { strategy: 35, engineering: 45, refinement: 20 },
    styleMix: { minimalist: 30, futuristic: 40, corporate: 30 },
    efficiency: { concept: 20, production: 55, feedback: 15, optimization: 10 }
  });

  const CHART_COLORS = [
    { fill: '#00D2FF', glow: 'shadow-blue-900/40' },
    { fill: '#10b981', glow: 'shadow-green-900/40' },
    { fill: '#f59e0b', glow: 'shadow-orange-900/40' },
    { fill: '#ff0055', glow: 'shadow-pink-900/40' },
    { fill: '#9D00FF', glow: 'shadow-purple-900/40' },
  ];

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
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', revenue: '', category: 'Logo Design', isMilestone: false }]
    }));
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
      projects: [{ name: '', revenue: '', category: 'Logo Design', isMilestone: false }],
      complexity: { strategy: 35, engineering: 45, refinement: 20 },
      styleMix: { minimalist: 30, futuristic: 40, corporate: 30 },
      efficiency: { concept: 20, production: 55, feedback: 15, optimization: 10 }
    });
  };

  const allProjects = metrics.flatMap(log => log.insight_projects || []);
  const totalRev = allProjects.reduce((acc, p) => acc + Number(p.revenue_earned || 0), 0);
  
  // UPDATED CATEGORIES
  const categories = ['Logo Design', 'Flyer/Poster', 'Branding', 'Social Media', 'Product Design'];
  
  const pulseData = metrics.map(m => {
    const totalS = (m.linkedin_sent || 0) + (m.instagram_sent || 0) + (m.twitter_sent || 0);
    const totalR = (m.linkedin_replies || 0) + (m.instagram_replies || 0) + (m.twitter_replies || 0);
    return { date: m.log_date, rate: totalS > 0 ? (totalR / totalS) * 100 : 0 };
  });

  // REACTIVE DATA SOURCE FOR BAR CHART (Updates as you type)
  const sourceBarData = [
    { name: 'LinkedIn', sent: formData.linkedin.sent, replies: formData.linkedin.replies },
    { name: 'Instagram', sent: formData.instagram.sent, replies: formData.instagram.replies },
    { name: 'X/Twitter', sent: formData.twitter.sent, replies: formData.twitter.replies }
  ];

  const radarData = categories.map(cat => ({
    subject: cat,
    A: allProjects.filter(p => p.project_category === cat).reduce((sum, p) => sum + Number(p.revenue_earned), 0) / 1000,
  }));

  const complexityPie = [
    { name: 'Strat', value: Number(formData.complexity.strategy) },
    { name: 'Eng', value: Number(formData.complexity.engineering) },
    { name: 'Refine', value: Number(formData.complexity.refinement) }
  ];

  const stylePie = [
    { name: 'Min', value: Number(formData.styleMix.minimalist) },
    { name: 'Fut', value: Number(formData.styleMix.futuristic) },
    { name: 'Corp', value: Number(formData.styleMix.corporate) }
  ];

  const efficiencyPie = [
    { name: 'Cpt', value: Number(formData.efficiency.concept) },
    { name: 'Prod', value: Number(formData.efficiency.production) },
    { name: 'Feed', value: Number(formData.efficiency.feedback) },
    { name: 'Opt', value: Number(formData.efficiency.optimization) }
  ];

  return (
    <div className="navbar-safe-pt min-h-screen bg-[#020617] text-white p-4 md:p-12 pb-32 font-sans uppercase overflow-x-hidden">
      
      {/* HEADER */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-blue-500/50"/>
            <span className="text-blue-500 font-black text-[9px] tracking-[0.6em]">Sulaiman Graphics Terminal</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none text-white/90">
            Studio <span className="text-blue-600">Intelligence</span>
          </h1>
        </div>
        
        <button onClick={() => setIsLogging(true)} className="w-full lg:w-auto bg-blue-600 px-10 py-6 rounded-2xl active:scale-95 shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-colors">
          <span className="flex items-center justify-center gap-4 text-[11px] font-black italic tracking-[0.3em]">
            <PlusCircle size={18}/> Initialize Log
          </span>
        </button>
      </div>

      {/* DASHBOARD BENTO */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        
        <div className="lg:col-span-3 modular-border-neon p-5 bg-blue-600 flex flex-col justify-center rounded-xl">
          <p className="text-[8px] font-black text-white/60 tracking-widest mb-1">Live Revenue</p>
          <h4 className="text-3xl font-black italic">₦{totalRev.toLocaleString()}</h4>
        </div>

        <div className="lg:col-span-9 modular-border-neon p-5 bg-[#070e1b] flex items-center gap-6 rounded-xl">
           <div>
              <h3 className="text-[8px] font-black tracking-widest text-blue-500">Efficiency</h3>
              <span className="text-2xl font-black italic">{pulseData[pulseData.length-1]?.rate.toFixed(0) || 0}%</span>
           </div>
           <div className="h-16 w-full">
             <ResponsiveContainer><LineChart data={pulseData}><Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer>
           </div>
        </div>

        {/* PIE MATRIX */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Complexity", icon: Brain, data: complexityPie, primaryValue: formData.complexity.engineering + "%", colorIndex: 0 },
            { title: "Style Mix", icon: Palette, data: stylePie, primaryValue: formData.styleMix.futuristic + "%", colorIndex: 2 },
            { title: "Design Cycle", icon: Gauge, data: efficiencyPie, primaryValue: formData.efficiency.production + "%", colorIndex: 3 }
          ].map((chart, idx) => (
            <div key={idx} className="modular-border-neon p-5 bg-[#070e1b]/80 flex flex-col items-center rounded-2xl">
              <h3 className="text-[9px] font-black tracking-widest text-zinc-500 mb-2 flex items-center gap-2 uppercase"><chart.icon size={14}/> {chart.title}</h3>
              <div className="h-36 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chart.data} innerRadius={40} outerRadius={55} paddingAngle={6} dataKey="value">
                      {chart.data.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[(i + chart.colorIndex) % CHART_COLORS.length].fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{fontSize: '10px', background: '#000', border: 'none', color: '#fff'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                   <p className="text-2xl font-black italic tracking-tighter text-white">{chart.primaryValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OUTREACH & PORTFOLIO */}
        <div className="lg:col-span-6 modular-border-neon p-6 bg-[#070e1b]/80 h-[260px] rounded-2xl">
          <h3 className="text-[9px] font-black tracking-widest text-zinc-500 mb-4 uppercase flex items-center gap-2"><TrendingUp size={14}/> Outreach Yield Matrix</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={sourceBarData} layout="vertical">
              <YAxis dataKey="name" type="category" tick={{fill: '#71717a', fontSize: 8}} width={60} />
              <Bar dataKey="sent" fill="#1e293b" barSize={10} radius={4} />
              <Bar dataKey="replies" fill="#3b82f6" barSize={10} radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-6 modular-border-neon p-6 bg-[#070e1b]/80 h-[260px] rounded-2xl">
          <h3 className="text-[9px] font-black tracking-widest text-zinc-500 mb-4 uppercase flex items-center gap-2"><BarChart3 size={14}/> Portfolio Analysis focus</h3>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 7}} />
              <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROJECT STACK */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <Layers className="text-blue-500" size={18}/>
           <h2 className="text-xl font-black italic tracking-tighter uppercase">Live Project Stack</h2>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allProjects.map((proj, i) => (
            <div key={i} className="flex justify-between items-center bg-[#0a0f1d]/40 border border-white/5 p-4 rounded-xl hover:border-blue-500/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${proj.is_milestone ? 'text-yellow-500 bg-yellow-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                    {proj.is_milestone ? <Star size={14} fill="currentColor"/> : <MousePointer2 size={14}/>}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold italic truncate max-w-[150px]">{proj.project_name}</h4>
                    <span className="text-[7px] font-black text-blue-500/60 tracking-widest">{proj.project_category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-lg font-black italic tracking-tighter">₦{Number(proj.revenue_earned).toLocaleString()}</div>
                   <button onClick={() => handleDeleteProject(proj.id)} className="text-zinc-700 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOG MODAL */}
      {isLogging && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-xl overflow-y-auto">
          <form onSubmit={handleSave} className="bg-[#0a0f1d] border border-blue-500/20 p-8 w-full max-w-6xl rounded-[30px] shadow-2xl relative">
            <button type="button" onClick={() => setIsLogging(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24}/></button>
            
            <div className="flex items-center gap-4 mb-8 text-blue-500">
               <Zap size={20}/>
               <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Initialize Intelligence Matrix</h2>
            </div>

            <div className="absolute top-8 right-16 flex flex-col md:flex-row items-end md:items-center gap-3">
              <div className="flex items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                <Calendar size={13} className="text-blue-500 mr-3" />
                <input type="date" value={formData.date} className="bg-transparent text-[9px] font-bold outline-none text-zinc-300 uppercase w-full" onChange={(e)=>setFormData({...formData, date: e.target.value})}/>
              </div>
              <div className="flex bg-black p-1 rounded-xl border border-white/5 overflow-x-auto">
                {['daily', 'weekly', 'monthly'].map(p => (
                  <button key={p} type="button" onClick={()=>setPeriod(p)} className={`flex-1 px-4 py-1.5 rounded-lg text-[8px] font-black tracking-[0.1em] uppercase whitespace-nowrap ${period===p ? 'bg-blue-600 text-white' : 'text-zinc-600'}`}>{p}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 mt-10">
              {/* Column 1: Outreach */}
              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-500 tracking-widest uppercase">Outreach Intelligence</label>
                {['linkedin', 'instagram', 'twitter'].map(id => (
                  <div key={id} className="grid grid-cols-3 gap-3 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs capitalize font-bold">{id}</span>
                    <input type="number" placeholder="SENT" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-blue-500 outline-none" onChange={(e)=>setFormData({...formData, [id]: {...formData[id], sent: parseInt(e.target.value) || 0}})} />
                    <input type="number" placeholder="REPLY" className="bg-slate-950 border border-slate-800 p-2 rounded text-xs focus:border-blue-500 outline-none" onChange={(e)=>setFormData({...formData, [id]: {...formData[id], replies: parseInt(e.target.value) || 0}})} />
                  </div>
                ))}
                {/* NEW: REFERRALS BOX */}
                <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Share2 size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase">Referrals</span>
                  </div>
                  <input type="number" value={formData.referral} onChange={(e)=>setFormData({...formData, referral: parseInt(e.target.value) || 0})} className="w-16 bg-slate-950 border border-slate-800 p-2 rounded text-xs text-center outline-none" />
                </div>
              </div>

              {/* Column 2: Intelligence Matrix */}
              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-500 tracking-widest uppercase">Intelligence Matrix (%)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <p className="text-[10px] text-blue-400 font-bold">COMPLEXITY</p>
                    <input type="number" value={formData.complexity.strategy} onChange={(e)=>setFormData({...formData, complexity: {...formData.complexity, strategy: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-green-400 font-bold">STYLE MIX</p>
                    <input type="number" value={formData.styleMix.futuristic} onChange={(e)=>setFormData({...formData, styleMix: {...formData.styleMix, futuristic: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-purple-400 font-bold">EFFICIENCY</p>
                    <input type="number" value={formData.efficiency.production} onChange={(e)=>setFormData({...formData, efficiency: {...formData.efficiency, production: e.target.value}})} className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-[10px]" />
                  </div>
                </div>
                {/* NEW: CLIENTS ACQUIRED BOX */}
                <div className="bg-green-600/5 p-4 rounded-xl border border-green-500/10 flex justify-between items-center mt-6">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase">Clients Acquired</span>
                  </div>
                  <input type="number" value={formData.clients} onChange={(e)=>setFormData({...formData, clients: parseInt(e.target.value) || 0})} className="w-16 bg-slate-950 border border-slate-800 p-2 rounded text-xs text-center outline-none font-bold text-green-500" />
                </div>
              </div>

              {/* Column 3: Project Manifest */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[9px] font-black text-zinc-500 tracking-widest uppercase">Project Manifest</label>
                   <button type="button" onClick={handleAddProject} className="text-blue-500 text-[10px] font-black flex items-center gap-1 hover:text-white transition-colors"><PlusCircle size={14}/> ADD ROW</button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <input type="text" placeholder="PROJECT NAME" value={proj.name} onChange={(e)=>handleProjectChange(idx, 'name', e.target.value)} className="w-full bg-transparent border-b border-slate-800 pb-1 outline-none text-sm font-bold uppercase" />
                      <div className="flex gap-4 items-center">
                        <select className="bg-transparent text-xs text-slate-400 outline-none uppercase font-bold flex-1" value={proj.category} onChange={(e)=>handleProjectChange(idx, 'category', e.target.value)}>
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500 font-black text-xs">₦</span>
                          <input type="number" placeholder="PRICE" value={proj.revenue} onChange={(e)=>handleProjectChange(idx, 'revenue', e.target.value)} className="bg-transparent border-b border-slate-800 w-20 outline-none text-xs text-white font-bold" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 py-6 rounded-2xl font-black italic text-xs tracking-[0.2em] uppercase shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all hover:bg-blue-500 mt-4">
              Sync Studio Intelligence
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
