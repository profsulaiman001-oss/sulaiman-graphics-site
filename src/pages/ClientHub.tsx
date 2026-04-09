import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldCheck, MessageSquare, Scale, Bot, ArrowRight, ClipboardList, LayoutDashboard } from "lucide-react";

const tools = [
  {
    title: "Get Started",
    desc: "Fill out the project questionnaire so we can start your design process.",
    icon: <ClipboardList className="text-blue-900" />,
    href: "/questionnaire",
  },
  {
    title: "Agreement",
    desc: "Review and sign your project contracts and service terms.",
    icon: <Scale className="text-blue-900" />,
    href: "/agreement",
  },
  {
    title: "Design Assistant",
    desc: "AI-powered help for your creative ideas and project brainstorming.",
    icon: <Bot className="text-blue-900" />,
    href: "/assistant",
  },
  {
    title: "Client Chat",
    desc: "Direct communication line with the Sulaiman Graphics team.",
    icon: <MessageSquare className="text-blue-900" />,
    href: "/chat",
  },
  {
    title: "Verification",
    desc: "Verify your license ID to authenticate your professional status.",
    icon: <ShieldCheck className="text-blue-900" />,
    href: "/verify",
  },
];

export default function ClientHub() {
  return (
    <div className="py-20 px-6 max-w-5xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-black tracking-tighter text-blue-900 mb-4 uppercase">Client Hub</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
          Access your professional design suite. Start a new project, sign documents, or verify your credentials below.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <Link key={i} href={tool.href}>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="p-8 bg-card border border-border rounded-3xl cursor-pointer hover:shadow-xl transition-all group relative"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-900">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{tool.desc}</p>
              <div className="flex items-center text-blue-900 font-bold text-sm">
                Open Tool <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Access Dashboard Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 p-10 bg-blue-900 rounded-[2rem] text-white text-center shadow-2xl"
      >
        <h3 className="text-2xl font-bold mb-3">Project Management</h3>
        <p className="text-blue-100 mb-8 text-sm max-w-md mx-auto">
          Already have an active project? Log in to your secure dashboard to view progress and assets.
        </p>
        <Link href="/login">
          <button className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
            <LayoutDashboard size={20} /> Access Dashboard
          </button>
        </Link>
      </motion.div>
    </div>
  );
            }
