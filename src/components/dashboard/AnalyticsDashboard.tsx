import React from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
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
  chartData?: any[];
  COLORS?: string[];
}

export function AnalyticsDashboard({ 
  stats, 
  chartData = [], 
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2 bg-card/50 border border-border/50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-500 rounded-full" />
          Revenue Insights
        </h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#888', fontSize: 10}} 
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="amount" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card/50 border border-border/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Project Status</h3>
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
                <Tooltip />
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
              <span className="text-[9px] text-muted-foreground uppercase font-bold truncate">Pending</span>
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
