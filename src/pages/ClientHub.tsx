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
  Sparkles
} from "lucide-react";

const tools = [
  {
    title: "Get Started",
    desc: "Launch your creative journey. Fill the questionnaire to kickstart your project.",
    icon: <ClipboardList className="w-6 h-6" />,
    href: "/questionnaire",
    color: "from-blue-600 to-indigo-600"
  },
  {
    title: "Agreement",
    desc: "Professional transparency. Review and finalize your project contracts.",
    icon: <Scale className="w-6 h-6" />,
    href: "/agreement",
    color: "from-slate-700 to-slate-900"
  },
  {
    title: "Design Assistant",
    desc: "AI-Powered creativity. Brainstorm ideas with our custom intelligence.",
    icon: <Bot className="w-6 h-6" />,
    href: "/assistant",
    color: "from-blue-900 to-blue-700"
  },
  {
    title: "Client Chat",
    desc: "Real-time collaboration. Direct access to your dedicated design lead.",
    icon: <MessageSquare className="w-6 h-6" />,
    href: "/chat",
    color: "from-indigo-900 to-blue-900"
  },
  {
    title: "Verification",
    desc: "Trust & Security. Authenticate your license ID for premium access.",
    icon: <ShieldCheck className="w-6 h-6" />,
    href: "/verify",
    color: "from-blue-800 to-indigo-900"
  },
];

export default function ClientHub() {
  return (
    <div className="relative min-h-screen bg-[#050a15] overflow-hidden pt-32 pb-20 px-6">
      {/* ── PREMIUM BACKGROUND ACCENTS ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-900/20 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
            <Sparkles size={14} /> Client Executive Suite
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase italic">
            Client<span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto font-medium text-lg leading-relaxed">
            Your exclusive gateway to premium design services, AI tools, and project management.
          </p>
        </motion.div>

        {/* ── TOOL GRID ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, i) => (
            <Link key={i} href={tool.href}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent cursor-pointer"
              >
                <div className="relative h-full p-8 bg-[#0a0f1d]/90 backdrop-blur-xl rounded-[2.4rem] border border-white/5 group-hover:border-blue-500/50 transition-all duration-500 shadow-2xl overflow-hidden">
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-900/40 text-white`}>
                    {tool.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    {tool.desc}
                  </p>
                  
                  <div className="flex items-center text-blue-500 font-black text-xs uppercase tracking-widest">
                    Enter Tool <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── PREMIUM DASHBOARD CARD ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24 relative overflow-hidden p-[1px] rounded-[3rem] bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-900 shadow-2xl shadow-blue-900/20"
        >
          <div className="bg-[#050a15] rounded-[2.9rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-left max-w-lg">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase leading-none">
                Project <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Management</span>
              </h3>
              <p className="text-gray-400 font-medium">
                Active partner? Access your real-time project dashboard, deliverables, and asset vault.
              </p>
            </div>
            
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-white rounded-2xl font-black text-blue-900 flex items-center gap-3 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <LayoutDashboard size={22} className="group-hover:rotate-12 transition-transform" />
                <span className="uppercase tracking-tighter">Enter Dashboard</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
        }
