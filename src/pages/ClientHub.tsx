import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ShieldCheck, 
  MessageSquare, 
  Scale, 
  Bot, 
  ArrowRight, 
  ClipboardList, 
  LayoutDashboard,
  Sparkles,
  Fingerprint
} from "lucide-react";

const tools = [
  {
    title: "Get Started",
    desc: "Launch your creative journey. Fill the questionnaire to kickstart your project.",
    icon: <ClipboardList className="w-6 h-6" />,
    href: "/questionnaire",
    color: "from-cyan-500 to-blue-600",
    size: "col-span-1"
  },
  {
    title: "Agreement",
    desc: "Professional transparency. Review and finalize your project contracts.",
    icon: <Scale className="w-6 h-6" />,
    href: "/agreement",
    color: "from-blue-600 to-indigo-600",
    size: "col-span-1"
  },
  {
    title: "Design Assistant",
    desc: "AI-Powered creativity. Brainstorm ideas with our custom intelligence vault.",
    icon: <Bot className="w-6 h-6" />,
    href: "/assistant",
    color: "from-cyan-400 via-blue-500 to-indigo-600",
    size: "md:col-span-2 lg:col-span-1" // Featured size
  },
  {
    title: "Client Chat",
    desc: "Real-time collaboration. Direct access to your dedicated design lead.",
    icon: <MessageSquare className="w-6 h-6" />,
    href: "/chat",
    color: "from-blue-500 to-cyan-500",
    size: "col-span-1"
  },
  {
    title: "Verification",
    desc: "Trust & Security. Authenticate your license ID for premium access.",
    icon: <ShieldCheck className="w-6 h-6" />,
    href: "/verify",
    color: "from-indigo-600 to-blue-700",
    size: "col-span-1"
  },
];

export default function ClientHub() {
  return (
    <div className="relative min-h-screen bg-[#020617] overflow-hidden pt-32 pb-20 px-6 font-sans">
      
      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <Sparkles size={14} className="animate-pulse" /> Client Executive Suite
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-none">
            Client<span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">Hub</span>
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed border-t border-white/5 pt-6">
            Your exclusive gateway to <span className="text-white">premium design services</span>, <span className="text-cyan-400">AI-powered tools</span>, and real-time project management.
          </p>
        </motion.div>

        {/* ── BENTO GRID ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <Link key={i} href={tool.href}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`group relative p-[1px] rounded-[2.5rem] overflow-hidden cursor-pointer ${tool.size}`}
              >
                {/* Border Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-cyan-500/50 group-hover:to-blue-600/50 transition-all duration-500" />
                
                <div className="relative h-full p-8 bg-[#0a0f1d]/80 backdrop-blur-2xl rounded-[2.4rem] border border-white/5 overflow-hidden flex flex-col">
                  
                  {/* Subtle Background Icon Decoration */}
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 group-hover:scale-110 transform">
                    {tool.icon && React.cloneElement(tool.icon as React.ReactElement, { size: 140 })}
                  </div>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-8 shadow-2xl shadow-cyan-900/40 text-white ring-4 ring-white/5`}>
                    {tool.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-3 italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-10 font-medium">
                    {tool.desc}
                  </p>
                  
                  <div className="mt-auto flex items-center text-cyan-500 font-black text-[10px] uppercase tracking-[0.2em]">
                    Enter Tool <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── PROJECT MANAGEMENT FOOTER ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-950 border border-white/10 rounded-[3rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden">
            
            {/* Design Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="text-left max-w-lg relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-cyan-500" />
                <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em]">Partner Portal</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase italic leading-[0.9] tracking-tighter">
                Project <br /> 
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Management</span>
              </h3>
              <p className="text-zinc-400 font-medium text-lg border-l-2 border-white/10 pl-6">
                Active partner? Access your real-time project dashboard, deliverables, and asset vault.
              </p>
            </div>
            
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-12 py-6 bg-white rounded-[1.5rem] font-black text-slate-900 flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                <LayoutDashboard size={24} className="relative z-10 group-hover:rotate-6 transition-transform text-blue-600" />
                <span className="relative z-10 uppercase tracking-tighter text-lg italic">Enter Dashboard</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
