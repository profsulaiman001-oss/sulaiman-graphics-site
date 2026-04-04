import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Smile, 
  FolderOpen, 
  CheckCircle2, 
  ExternalLink
} from "lucide-react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  // 1. Fetch all active projects for the sidebar
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, profiles(full_name)');
      
      if (error) throw error;
      return data;
    }
  });

  // Track which project chat is currently open
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (projects?.length && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects]);

  // Find the active project object for showing names/details in the UI
  const activeProject = projects?.find(p => p.id === activeProjectId);

  // 2. Fetch the actual chat messages for the selected project
  const { data: chatMessages } = useQuery({
    queryKey: ['messages', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return [];
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', activeProjectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeProjectId,
  });

  // 3. Set up a real-time listener for instant messages!
  useEffect(() => {
    if (!activeProjectId) return;

    const channel = supabase
      .channel('realtime_chat')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `project_id=eq.${activeProjectId}` 
      }, () => {
        // Optimistically update the UI!
        queryClient.invalidateQueries({ queryKey: ['messages', activeProjectId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeProjectId, queryClient]);

  // 4. Function to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('comments')
        .insert([{
          project_id: activeProjectId,
          user_id: userData.user?.id,
          message: messageText,
          is_admin: true 
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['messages', activeProjectId] });
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  return (
    <div className="bg-[#0B0C10] min-h-screen text-gray-100 flex flex-col">
      <div className="flex-grow flex h-[calc(100vh-140px)] w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6">
        
        {/* ==================== LEFT SIDEBAR: CLIENT LIST ==================== */}
        <div className="hidden md:flex w-1/4 flex-col bg-[#11141A]/60 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Conversations</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {projects?.map((project: any) => {
              const isActive = project.id === activeProjectId;
              const clientName = project.profiles?.full_name || "Client";
              
              return (
                <div 
                  key={project.id}
                  onClick={() => setActiveProjectId(project.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-cyan-600/10 to-transparent border border-cyan-500/20" 
                      : "hover:bg-[#1A1F29]/50 border border-transparent hover:border-gray-800"
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-700 font-semibold text-white">
                      {clientName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-medium text-sm text-gray-100 truncate">{clientName}</h3>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{project.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== CENTER AREA: THE CHAT ==================== */}
        <div className="flex-grow flex flex-col bg-[#11141A]/60 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden">
          {/* Top Navbar for the current chat */}
          <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#11141A]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center font-bold text-black">
                {activeProject?.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || "C"}
              </div>
              <div>
                <h2 className="font-semibold text-gray-100">{activeProject?.profiles?.full_name || "Select a client"}</h2>
                <p className="text-xs text-cyan-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Active Now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-[#1A1F29] rounded-xl border border-gray-800 text-gray-400 hover:text-gray-200 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-[#1A1F29] rounded-xl border border-gray-800 text-gray-400 hover:text-gray-200 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Scrolling Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {chatMessages?.map((msg: any) => {
              const isMe = msg.is_admin;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={msg.id}
                  className={`flex items-end gap-3 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                    isMe ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-black font-bold' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isMe ? 'SG' : (activeProject?.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'C')}
                  </div>
                  <div className={isMe ? 'text-right' : ''}>
                    <div className={`p-4 rounded-t-2xl text-sm leading-relaxed ${
                      isMe 
                        ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-bl-2xl shadow-lg shadow-cyan-900/10' 
                        : 'bg-[#1A1F29] border border-gray-800 text-gray-200 rounded-br-2xl'
                    }`}>
                      {msg.message}
                    </div>
                    <span className={`text-[11px] text-gray-600 mt-1 flex items-center gap-1 ${isMe ? 'justify-end mr-1' : 'ml-1'}`}>
                      {formattedTime} {isMe && <CheckCircle2 className="w-3 h-3 text-cyan-500" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Message Input Bar */}
          <div className="p-5 border-top border-gray-800 bg-[#11141A]/80">
            <div className="flex items-center gap-3 bg-[#1A1F29] border border-gray-800 rounded-2xl p-2.5 focus-within:border-cyan-500/50 transition-colors">
              <button className="p-2 text-gray-500 hover:text-cyan-500 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message here..." 
                className="flex-grow bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600"
              />
              <button className="p-2 text-gray-500 hover:text-cyan-500 transition-colors hidden sm:block">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold h-10 w-10 flex items-center justify-center rounded-xl transition-all shadow-lg shadow-cyan-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT SIDEBAR: PROJECT OVERVIEW ==================== */}
        <div className="hidden xl:flex w-1/4 flex-col bg-[#11141A]/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-5 overflow-y-auto">
          <h2 className="font-semibold text-lg text-gray-100 mb-5">Project Details</h2>
          
          <div className="bg-[#1A1F29] border border-gray-800 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Active Phase</span>
              <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-medium">
                {activeProject?.status || "Loading..."}
              </span>
            </div>
            <h3 className="font-semibold text-gray-100 mb-1">{activeProject?.title || "Project Name"}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Shared Files</span>
              <button className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center gap-0.5">
                View all <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#1A1F29]/50 hover:bg-[#1A1F29] border border-gray-800 rounded-xl cursor-pointer transition-colors">
              <div className="w-9 h-9 bg-cyan-500/10 text-cyan-500 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">Moodboard_v1.pdf</p>
                <p className="text-[10px] text-gray-600">4.2 MB • Oct 24</p>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
