import React from 'react';
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
    size: "md:col-span-2 lg:col-span-1"
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
        {/* ── REFINED HEADER (Left Aligned, No Italics) ── */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-left mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 uppercase leading-none">
            Client<span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Hub</span>
          </h1>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8 backdrop-blur-md">
            <Sparkles size={12} /> Client Executive Suite
          </div>

          <p className="text-zinc-400 max-w-xl font-medium text-lg leading-relaxed border-l-2 border-white/5 pl-6">
            Your exclusive gateway to <span className="text-white">premium design services</span> and AI-powered management.
          </p>
        </motion.div>

        {/* ── BENTO GRID (Clean Titles) ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <Link key={i} href={tool.href}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`group relative p-[1px] rounded-[2.5rem] overflow-hidden cursor-pointer ${tool.size}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-cyan-500/50 transition-all duration-500" />
                
                <div className="relative h-full p-8 bg-[#0a0f1d]/80 backdrop-blur-2xl rounded-[2.4rem] border border-white/5 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-8 shadow-2xl text-white`}>
                    {tool.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
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

        {/* ── PREMIUM PROJECT PORTAL (Redesigned) ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
          <div className="relative bg-slate-950/50 border border-white/10 rounded-[3rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden backdrop-blur-xl">
            
            <div className="text-left max-w-lg relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-cyan-500" />
                <span className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em]">Existing Partners</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                Access Project <span className="text-cyan-400">Dashboard</span>
              </h3>
              <p className="text-zinc-400 font-medium text-base">
                Already have an active project? Sign in to track progress, download your final assets, and manage deliverables.
              </p>
            </div>
            
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-slate-900 border border-white/10 rounded-2xl font-black text-white flex items-center gap-4 shadow-2xl transition-all hover:border-cyan-500/50"
              >
                <LayoutDashboard size={20} className="text-cyan-400 group-hover:rotate-6 transition-transform" />
                <span className="uppercase tracking-[0.1em] text-sm">Enter Portal</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
