import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

interface AnalyticsDashboardProps {
  stats?: {
    total?: number;
    completed?: number;
    active?: number;
    pending?: number;
    [key: string]: number | undefined;
  };
  chartData?: any[]; // Kept for prop stability, though no longer used for bars
  COLORS?: string[];
}

export function AnalyticsDashboard({ 
  stats, 
  COLORS = ["#06b6d4", "#3b82f6", "#eab308"] 
}: AnalyticsDashboardProps) {
  
  // Safely extract properties with fallback values
  const total = stats?.total ?? 0;
  const completed = stats?.["Completed"] ?? stats?.completed ?? 0;
  const active = stats?.["In Progress"] ?? stats?.active ?? 0;
  const pending = stats?.["Pending"] ?? stats?.pending ?? 0;

  const pieData = [
    { name: "Completed", value: completed },
    { name: "Active", value: active },
    { name: "Pending", value: pending },
  ];

  // Helper to calculate percentage for vertical bars
  const getPercent = (value: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* LEFT CONTAINER: Project Overview (Replaces Revenue Insights) */}
      <div className="lg:col-span-2 bg-card/50 border border-border/50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-500 rounded-full" />
          Project Overview
        </h3>
        
        {/* Three Vertical Columns Layout */}
        <div className="h-[240px] w-full flex items-end justify-around gap-6 px-4">
          
          {/* DONE COLUMN */}
          <div className="flex flex-col items-center flex-1 h-full justify-end group">
            <div className="text-2xl font-black text-cyan-400 mb-2 transition-transform group-hover:scale-110">{completed}</div>
            <div className="w-full max-w-[60px] bg-cyan-500/10 rounded-t-xl relative overflow-hidden flex items-end" style={{ height: '70%' }}>
              <div 
                className="w-full bg-cyan-500 rounded-t-xl transition-all duration-700 ease-out shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                style={{ height: `${getPercent(completed)}%` }}
              />
            </div>
            <div className="text-[10px] font-bold uppercase mt-4 text-muted-foreground tracking-widest">Done</div>
          </div>

          {/* ACTIVE COLUMN */}
          <div className="flex flex-col items-center flex-1 h-full justify-end group">
            <div className="text-2xl font-black text-blue-400 mb-2 transition-transform group-hover:scale-110">{active}</div>
            <div className="w-full max-w-[60px] bg-blue-500/10 rounded-t-xl relative overflow-hidden flex items-end" style={{ height: '70%' }}>
              <div 
                className="w-full bg-blue-500 rounded-t-xl transition-all duration-700 ease-out shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                style={{ height: `${getPercent(active)}%` }}
              />
            </div>
            <div className="text-[10px] font-bold uppercase mt-4 text-muted-foreground tracking-widest">Active</div>
          </div>

          {/* QUEUE COLUMN */}
          <div className="flex flex-col items-center flex-1 h-full justify-end group">
            <div className="text-2xl font-black text-yellow-400 mb-2 transition-transform group-hover:scale-110">{pending}</div>
            <div className="w-full max-w-[60px] bg-yellow-500/10 rounded-t-xl relative overflow-hidden flex items-end" style={{ height: '70%' }}>
              <div 
                className="w-full bg-yellow-500 rounded-t-xl transition-all duration-700 ease-out shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                style={{ height: `${getPercent(pending)}%` }}
              />
            </div>
            <div className="text-[10px] font-bold uppercase mt-4 text-muted-foreground tracking-widest">Queue</div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR: Circular Status & Quick Stats */}
      <div className="space-y-6">
        <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Project Distribution</h3>
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: '1px solid #333', 
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-[9px] text-muted-foreground uppercase font-bold truncate">Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] text-muted-foreground uppercase font-bold truncate">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[9px] text-muted-foreground uppercase font-bold truncate">Queue</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 text-center">
            <CheckCircle className="text-cyan-500 mx-auto mb-1.5" size={16} />
            <div className="text-xl font-bold text-foreground">{completed}</div>
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider truncate">Finished</div>
          </div>
          
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
            <Loader2 className="text-blue-500 mx-auto mb-1.5 animate-spin" size={16} />
            <div className="text-xl font-bold text-foreground">{active}</div>
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider truncate">Active</div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-center">
            <Clock className="text-yellow-500 mx-auto mb-1.5" size={16} />
            <div className="text-xl font-bold text-foreground">{pending}</div>
            <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider truncate">Queue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
