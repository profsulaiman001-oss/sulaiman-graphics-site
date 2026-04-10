import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, Users, Target, DollarSign, 
  Plus, Calendar, ArrowUpRight, CheckCircle2 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

export const StudioInsights = () => {
  const [metrics, setMetrics] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [formData, setFormData] = useState({
    outreach: 0,
    responses: 0,
    clients: 0,
    projects: 0,
    revenue: 0
  });

  // 1. DATA FETCHING (Preserving Supabase Logic)
  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('studio_metrics')
      .select('*')
      .order('log_date', { ascending: true });
    if (data) setMetrics(data);
  };

  const handleLogData = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('studio_metrics').insert([{
      outreach_sent: formData.outreach,
      responses_received: formData.responses,
      clients_acquired: formData.clients,
      designs_completed: formData.projects,
      revenue_earned: formData.revenue,
      log_date: new Date().toISOString().split('T')[0]
    }]);
    
    if (!error) {
      setIsLogging(false);
      fetchMetrics();
    }
  };

  // 2. CALCULATIONS (The "Feedback Loop")
  const totalRevenue = metrics.reduce((acc, curr) => acc + Number(curr.revenue_earned), 0);
  const totalProjects = metrics.reduce((acc, curr) => acc + Number(curr.designs_completed), 0);
  const avgConversion = metrics.length > 0 
    ? (metrics.reduce((acc, curr) => acc + (curr.clients_acquired / (curr.responses_received || 1)), 0) / metrics.length * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#050a15] text-white p-6 pb-20 font-sans">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex justify-between items-end mb-10">
        <div>
          <p className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-2">Executive Overview</p>
          <h1 className="text-4xl font-bold italic tracking-tighter">STUDIO PERFORMANCE</h1>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> LOG DAILY WINS
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* STAT CARD: REVENUE */}
        <div className="bg-[#0a0f1d] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} />
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
          <h2 className="text-3xl font-bold text-blue-400">${totalRevenue.toLocaleString()}</h2>
          <div className="flex items-center gap-1 text-emerald-500 text-xs mt-4 font-bold">
            <TrendingUp size={14} /> +12.5% <span className="text-zinc-600 font-medium ml-1">vs last month</span>
          </div>
        </div>

        {/* STAT CARD: PROJECTS */}
        <div className="bg-[#0a0f1d] border border-white/5 p-6 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Projects Finished</p>
          <h2 className="text-3xl font-bold">{totalProjects}</h2>
          <p className="text-zinc-600 text-xs mt-4 font-medium italic">High Quality Output</p>
        </div>

        {/* STAT CARD: CONVERSION */}
        <div className="bg-[#0a0f1d] border border-white/5 p-6 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Closing Rate</p>
          <h2 className="text-3xl font-bold text-emerald-400">{avgConversion}%</h2>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-5 overflow-hidden">
             <div className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" style={{ width: `${avgConversion}%` }} />
          </div>
        </div>

        {/* STAT CARD: OUTREACH */}
        <div className="bg-[#0a0f1d] border border-white/5 p-6 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Market Activity</p>
          <h2 className="text-3xl font-bold text-blue-500">Active</h2>
          <p className="text-zinc-600 text-xs mt-4 font-medium uppercase tracking-tighter">Consistency is Key</p>
        </div>
      </div>

      {/* CHARTS SECTION - Matching the RK Studio Screenshot */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0f1d] border border-white/5 p-8 rounded-[2.5rem] h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="text-blue-500" size={18} /> Revenue History
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="log_date" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Area type="monotone" dataKey="revenue_earned" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MONTHLY TARGETS CARD */}
        <div className="bg-[#0a0f1d] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-6">Monthly Target</h3>
            <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                 <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                   strokeDasharray={502} 
                   strokeDashoffset={502 - (502 * (totalRevenue / 5000))} 
                   strokeLinecap="round"
                   className="text-blue-500 transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
               </svg>
               <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black italic">{(totalRevenue / 5000 * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">To Goal</span>
               </div>
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold">TARGET: $5,000</span>
            <span className="text-xs text-blue-400 font-black">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* INPUT MODAL (Admin Only Logic) */}
      {isLogging && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <form onSubmit={handleLogData} className="bg-[#0a0f1d] border border-blue-500/20 p-8 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
              <Target className="text-blue-500" /> DAILY LOG
            </h2>
            <div className="space-y-4">
              <input type="number" placeholder="Outreach Sent" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, outreach: parseInt(e.target.value)})} />
              <input type="number" placeholder="Responses" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, responses: parseInt(e.target.value)})} />
              <input type="number" placeholder="New Clients" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, clients: parseInt(e.target.value)})} />
              <input type="number" placeholder="Designs Done" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, projects: parseInt(e.target.value)})} />
              <input type="number" placeholder="Revenue ($)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500" onChange={(e)=>setFormData({...formData, revenue: parseInt(e.target.value)})} />
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setIsLogging(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold">CANCEL</button>
              <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20">SAVE DATA</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
