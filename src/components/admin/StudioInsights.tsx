import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, Users, Target, DollarSign, 
  Plus, Calendar, ArrowUpRight, CheckCircle2, X 
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

  // 1. DATA FETCHING
  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('studio_metrics')
      .select('*')
      .order('log_date', { ascending: true });
    
    if (error) {
      console.error("Error fetching metrics:", error);
    } else if (data) {
      setMetrics(data);
    }
  };

  const handleLogData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Using explicit column names from your database schema
    const { error } = await supabase.from('studio_metrics').insert([{
      outreach_sent: formData.outreach,
      responses_received: formData.responses,
      clients_acquired: formData.clients,
      designs_completed: formData.projects,
      revenue_earned: formData.revenue,
      log_date: new Date().toISOString().split('T')[0]
    }]);
    
    if (error) {
      alert("Error saving data: " + error.message);
    } else {
      setIsLogging(false);
      fetchMetrics(); // Refresh charts immediately
      // Reset form
      setFormData({ outreach: 0, responses: 0, clients: 0, projects: 0, revenue: 0 });
    }
  };

  // 2. CALCULATIONS
  const totalRevenue = metrics.reduce((acc, curr) => acc + Number(curr.revenue_earned || 0), 0);
  const totalProjects = metrics.reduce((acc, curr) => acc + Number(curr.designs_completed || 0), 0);
  
  // Calculate Closing Rate safely to avoid divide by zero
  const totalResponses = metrics.reduce((acc, curr) => acc + Number(curr.responses_received || 0), 0);
  const totalClients = metrics.reduce((acc, curr) => acc + Number(curr.clients_acquired || 0), 0);
  const avgConversion = totalResponses > 0 
    ? ((totalClients / totalResponses) * 100).toFixed(1) 
    : "0";

  return (
    <div className="min-h-screen bg-[#050a15] text-white p-4 md:p-8 pb-24 font-sans selection:bg-blue-500/30">
      {/* HEADER SECTION - Fixed for Mobile overlap */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
        <div>
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Executive Overview</p>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">STUDIO PERFORMANCE</h1>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20"
        >
          <Plus size={20} /> LOG DAILY WINS
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-[#0a0f1d] border border-white/5 p-5 md:p-8 rounded-[2rem] relative overflow-hidden group">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
          <h2 className="text-2xl md:text-4xl font-black text-blue-400">${totalRevenue.toLocaleString()}</h2>
          <div className="flex items-center gap-1 text-emerald-500 text-[10px] mt-4 font-bold">
            <TrendingUp size={12} /> +12.5% <span className="text-zinc-600 font-medium">vs last month</span>
          </div>
        </div>

        <div className="bg-[#0a0f1d] border border-white/5 p-5 md:p-8 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Projects Done</p>
          <h2 className="text-2xl md:text-4xl font-black">{totalProjects}</h2>
          <p className="text-zinc-600 text-[10px] mt-4 font-medium italic">High Quality</p>
        </div>

        <div className="bg-[#0a0f1d] border border-white/5 p-5 md:p-8 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Closing Rate</p>
          <h2 className="text-2xl md:text-4xl font-black text-emerald-400">{avgConversion}%</h2>
          <div className="w-full bg-white/5 h-1 rounded-full mt-5 overflow-hidden">
             <div className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" style={{ width: `${Math.min(Number(avgConversion), 100)}%` }} />
          </div>
        </div>

        <div className="bg-[#0a0f1d] border border-white/5 p-5 md:p-8 rounded-[2rem]">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Market Activity</p>
          <h2 className="text-2xl md:text-4xl font-black text-blue-500">Active</h2>
          <p className="text-zinc-600 text-[10px] mt-4 font-black uppercase tracking-widest">Consistent</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0f1d] border border-white/5 p-6 md:p-10 rounded-[2.5rem] h-[400px]">
          <h3 className="font-black italic text-lg flex items-center gap-3 mb-8 uppercase tracking-widest">
            <Calendar className="text-blue-500" size={20} /> Revenue History
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="log_date" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontWeight: 'bold' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="revenue_earned" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MONTHLY TARGETS CARD */}
        <div className="bg-[#0a0f1d] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between items-center">
          <h3 className="font-black italic text-lg self-start uppercase tracking-widest">Monthly Target</h3>
          <div className="relative h-56 w-56 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-white/5" />
               <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="14" fill="transparent" 
                 strokeDasharray={597} 
                 strokeDashoffset={597 - (597 * Math.min((totalRevenue / 5000), 1))} 
                 strokeLinecap="round"
                 className="text-blue-600 transition-all duration-1000 shadow-[0_0_30px_rgba(37,99,235,0.4)]" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black italic">{(Math.min((totalRevenue / 5000) * 100, 100)).toFixed(0)}%</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">To Goal</span>
             </div>
          </div>
          <div className="w-full bg-blue-600/10 p-5 rounded-2xl flex items-center justify-between border border-blue-500/20">
            <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">Target: $5,000</span>
            <span className="text-[10px] text-blue-500 font-black animate-pulse">LIVE TRACKING</span>
          </div>
        </div>
      </div>

      {/* INPUT MODAL - Enhanced for accuracy */}
      {isLogging && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#050a15]/95 backdrop-blur-xl">
          <div className="bg-[#0a0f1d] border border-blue-500/30 p-8 rounded-[3rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsLogging(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3 text-blue-500">
               DAILY WINS
            </h2>
            
            <form onSubmit={handleLogData} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Cold Outreach</label>
                <input type="number" placeholder="0" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500 font-bold" 
                  onChange={(e)=>setFormData({...formData, outreach: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Responses</label>
                <input type="number" placeholder="0" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500 font-bold" 
                  onChange={(e)=>setFormData({...formData, responses: parseInt(e.target.value) || 0})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">New Clients</label>
                  <input type="number" placeholder="0" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500 font-bold" 
                    onChange={(e)=>setFormData({...formData, clients: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 tracking-widest">Designs</label>
                  <input type="number" placeholder="0" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none focus:border-blue-500 font-bold" 
                    onChange={(e)=>setFormData({...formData, projects: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest font-bold">Revenue Earned ($)</label>
                <input type="number" placeholder="0.00" className="w-full bg-blue-600/10 p-5 rounded-2xl border border-blue-500/40 outline-none focus:border-blue-500 text-blue-400 font-black text-xl" 
                  onChange={(e)=>setFormData({...formData, revenue: parseFloat(e.target.value) || 0})} />
              </div>

              <div className="flex gap-4 mt-8">
                <button type="submit" className="w-full bg-blue-600 py-5 rounded-2xl font-black italic tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all uppercase">
                  Save Performance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
