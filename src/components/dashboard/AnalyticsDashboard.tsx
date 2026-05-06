import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { CheckCircle2, Clock, AlertCircle, BarChart2 } from "lucide-react";

export function AnalyticsDashboard({ stats, chartData, COLORS }: { stats: any; chartData: any[]; COLORS: string[] }) {
  // Safely read properties to prevent "Cannot read properties of undefined" errors
  const completed = stats?.["Completed"] ?? 0;
  const inProgress = stats?.["In Progress"] ?? 0;
  const pending = stats?.["Pending"] ?? 0;
  const total = stats?.total ?? 0;

  return (
    <div className="grid gap-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Projects</p>
              <h3 className="text-2xl font-bold mt-2">{total}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <BarChart2 size={20} />
            </div>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completed</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-400">{completed}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">In Progress</p>
              <h3 className="text-2xl font-bold mt-2 text-blue-400">{inProgress}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending</p>
              <h3 className="text-2xl font-bold mt-2 text-amber-400">{pending}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>
        </Card>

      </div>

      {/* Chart Section */}
      <div className="border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl p-6">
        <h4 className="text-sm font-bold mb-4 tracking-tight">Project Pipeline</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
