import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AnalyticsSectionProps {
  projects: any[];
}

const COLORS = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e3a8a"];

export default function AnalyticsSection({ projects }: AnalyticsSectionProps) {
  const getChartData = () => {
    const pending = projects.filter((p: any) => p.status?.toLowerCase() === "pending").length;
    const inProgress = projects.filter((p: any) => p.status?.toLowerCase() === "in progress").length;
    const completed = projects.filter((p: any) => p.status?.toLowerCase() === "completed").length;

    return [
      { name: "Pending", value: pending },
      { name: "In Progress", value: inProgress },
      { name: "Completed", value: completed }
    ];
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
      <div className="md:col-span-1 grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
          <span className="text-3xl font-display font-black text-foreground mt-2">{projects.length}</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-yellow-500/70 font-medium uppercase tracking-wider">Pending</span>
          <span className="text-3xl font-display font-black text-yellow-500 mt-2">
            {projects.filter((p: any) => p.status?.toLowerCase() === "pending").length}
          </span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-primary font-medium uppercase tracking-wider">Active</span>
          <span className="text-3xl font-display font-black text-primary mt-2">
            {projects.filter((p: any) => p.status?.toLowerCase() === "in progress").length}
          </span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-green-500/70 font-medium uppercase tracking-wider">Done</span>
          <span className="text-3xl font-display font-black text-green-500 mt-2">
            {projects.filter((p: any) => p.status?.toLowerCase() === "completed").length}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getChartData()}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#000', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 h-[160px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={getChartData()} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
              {getChartData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#000', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
