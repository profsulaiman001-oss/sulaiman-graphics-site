import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Smile, 
  CheckCircle2, 
  Menu,
  ArrowLeft,
  User,
  Mail,
  ArrowRight
} from "lucide-react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  // ── 🆕 POPUP STATE LOGIC ──
  const [showIdentityPopup, setShowIdentityPopup] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if they already logged in via popup previously in this session
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("chat_email");
    const savedName = sessionStorage.getItem("chat_name");
    
    if (savedEmail && savedName) {
      setGuestEmail(savedEmail);
      setGuestName(savedName);
      setShowIdentityPopup(false);
      
      if (savedEmail === "profsulaiman001@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setMobileSidebarOpen(false);
      }
    }
  }, []);

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;

    // Save to session storage so they don't have to fill it again if they refresh
    sessionStorage.setItem("chat_email", guestEmail.trim());
    sessionStorage.setItem("chat_name", guestName.trim());

    if (guestEmail.trim() === "profsulaiman001@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setMobileSidebarOpen(false);
    }
    
    setShowIdentityPopup(false);
  };

  // 1. Fetch unique clients from the projects table (Just like your dashboard dropdown!)
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['chatClients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('client_email');
      
      if (error) throw error;

      const uniqueEmails = Array.from(
        new Set(data.map(p => p.client_email).filter(Boolean))
      );
      
      return uniqueEmails;
    },
    enabled: !showIdentityPopup, 
  });

  const [activeClientEmail, setActiveClientEmail] = useState<string | null>(null);

  useEffect(() => {
    if (clients?.length && !activeClientEmail) {
      if (isAdmin) {
        setActiveClientEmail(clients[0]);
      } else {
        setActiveClientEmail(guestEmail);
      }
    }
  }, [clients, isAdmin, guestEmail]);

  // 2. Fetch messages between you and the selected client
  const { data: chatMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeClientEmail],
    queryFn: async () => {
      if (!activeClientEmail) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', activeClientEmail) 
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeClientEmail,
  });

  // 3. Set up real-time listener
  useEffect(() => {
    if (!activeClientEmail) return;

    const channel = supabase
      .channel(`realtime_chat_${activeClientEmail}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `project_id=eq.${activeClientEmail}` 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', activeClientEmail] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeClientEmail, queryClient]);

  // 4. Function to send a message (FIXED)
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const { error } = await supabase
        .from('comments')
        .insert([{
          project_id: activeClientEmail, 
          user_id: guestEmail, // 🚀 Use email as the fallback ID to satisfy the non-null constraint
          message: messageText,
          is_admin: isAdmin 
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['messages', activeClientEmail] });
    }
  });

  const handleSend = () => {
    if (!message.trim() || !activeClientEmail) return;
    sendMessageMutation.mutate(message);
  };

  const getInitials = (email: string) => {
    if (!email) return "CL";
    return email.substring(0, 2).toUpperCase();
  };

  const filteredClients = clients?.filter((email: string) =>
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!showIdentityPopup && clientsLoading) {
    return <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-white">Loading chat room...</div>;
  }

  return (
    <div className="bg-[#0B0C10] min-h-screen text-gray-100 flex flex-col pt-20 relative">
      
      {/* ── 🆕 MODAL POPUP FOR NAME & EMAIL ── */}
      {showIdentityPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0C10]/90 backdrop-blur-md">
          <div className="bg-[#11141A] border border-gray-800 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Welcome to Chat</h2>
              <p className="text-sm text-gray-500">Please introduce yourself to continue</p>
            </div>

            <form onSubmit={handleIdentitySubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
              >
                Enter Chat <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MAIN CHAT INTERFACE ── */}
      <div className="flex-grow flex h-[calc(100vh-140px)] w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 relative">
        
        {/* ==================== LEFT SIDEBAR: CLIENT LIST ==================== */}
        <div className={`${isAdmin ? 'flex' : 'hidden'} ${mobileSidebarOpen ? 'flex' : 'hidden md:flex'} absolute inset-y-0 left-0 z-30 md:relative w-full sm:w-80 md:w-1/4 flex-col bg-[#11141A] backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden transition-all duration-300`}>
          <div className="p-5 border-b border-gray-800">
            <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Conversations</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {filteredClients?.map((email: string) => {
              const isActive = email === activeClientEmail;
              
              return (
                <div 
                  key={email}
                  onClick={() => {
                    setActiveClientEmail(email);
                    setMobileSidebarOpen(false); 
                  }}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-cyan-600/10 to-transparent border border-cyan-500/20" 
                      : "hover:bg-[#1A1F29]/50 border border-transparent hover:border-gray-800"
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-700 font-semibold text-white">
                      {getInitials(email)}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-sm text-gray-100 truncate">{email}</h3>
                    <p className="text-xs text-gray-500 truncate">Client Account</p>
                  </div>
                </div>
              );
            })}
            
            {filteredClients?.length === 0 && (
              <div className="text-center text-gray-600 mt-5 text-sm">No clients found.</div>
            )}
          </div>
        </div>

        {/* ==================== CENTER AREA: THE CHAT ==================== */}
        <div className="flex-grow flex flex-col bg-[#11141A]/60 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#11141A]/80">
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button 
                  className="md:hidden p-2 hover:bg-[#1A1F29] rounded-xl text-gray-400"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  {mobileSidebarOpen ? <ArrowLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
              
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center font-bold text-black">
                {getInitials(activeClientEmail || "C")}
              </div>
              <div>
                <h2 className="font-semibold text-gray-100 truncate max-w-[150px] sm:max-w-none">
                  {isAdmin ? activeClientEmail : "Sulaiman Graphics"}
                </h2>
                <p className="text-xs text-cyan-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Active Now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-[#1A1F29] rounded-xl border border-gray-800 text-gray-400 hover:text-gray-200 transition-colors hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-[#1A1F29] rounded-xl border border-gray-800 text-gray-400 hover:text-gray-200 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {chatMessages?.map((msg: any) => {
              const isMe = isAdmin ? msg.is_admin : !msg.is_admin;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={msg.id}
                  className={`flex items-end gap-3 max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                    isMe ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-black font-bold' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isMe ? (isAdmin ? 'SG' : 'ME') : (isAdmin ? 'C' : 'SG')}
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
            
            {chatMessages?.length === 0 && (
              <div className="text-center text-gray-600 mt-10">No messages yet. Send a greeting!</div>
            )}
          </div>

          <div className="p-5 border-t border-gray-800 bg-[#11141A]/80">
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
                disabled={sendMessageMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold h-10 w-10 flex items-center justify-center rounded-xl transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                  }
