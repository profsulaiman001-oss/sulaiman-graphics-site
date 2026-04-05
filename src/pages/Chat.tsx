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

  const [showIdentityPopup, setShowIdentityPopup] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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

  // 1. FIXED: Let's fetch actual user profiles instead of empty projects!
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['chatClients'],
    queryFn: async () => {
      // NOTE: Update 'profiles' to whatever your Supabase user table is named
      const { data, error } = await supabase
        .from('profiles') 
        .select('email, full_name');
      
      if (error) {
        // Fallback to project emails if profiles table doesn't work for you
        const { data: projData } = await supabase.from('projects').select('client_email');
        const uniqueEmails = Array.from(new Set(projData?.map(p => p.client_email).filter(Boolean)));
        return uniqueEmails.map(email => ({ email, full_name: email }));
      }

      // Filter out admin's own email from list
      return data.filter(u => u.email !== "profsulaiman001@gmail.com");
    },
    enabled: !showIdentityPopup && isAdmin, 
  });

  const [activeClientEmail, setActiveClientEmail] = useState<string | null>(null);

  useEffect(() => {
    if (clients?.length && !activeClientEmail) {
      if (isAdmin) {
        setActiveClientEmail(clients[0].email);
      } else {
        setActiveClientEmail(guestEmail);
      }
    }
  }, [clients, isAdmin, guestEmail]);

  // 2. Fetch messages
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

  // 3. Real-time listener
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
          user_id: guestEmail, // Uses session email as user identification
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

  const filteredClients = clients?.filter((c: any) =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0B0C10] min-h-screen text-gray-100 flex flex-col pt-20 relative">
      
      {/* MODAL POPUP */}
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
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
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
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Enter Chat <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN CHAT INTERFACE */}
      <div className="flex-grow flex h-[calc(100vh-140px)] w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 relative">
        
        {/* LEFT SIDEBAR */}
        <div className={`${isAdmin ? 'flex' : 'hidden'} ${mobileSidebarOpen ? 'flex' : 'hidden md:flex'} absolute inset-y-0 left-0 z-30 md:relative w-full sm:w-80 md:w-1/4 flex-col bg-[#11141A] border border-gray-800 rounded-3xl overflow-hidden`}>
          <div className="p-5 border-b border-gray-800">
            <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Conversations</h1>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {filteredClients?.map((c: any) => {
              const isActive = c.email === activeClientEmail;
              
              return (
                <div 
                  key={c.email}
                  onClick={() => {
                    setActiveClientEmail(c.email);
                    setMobileSidebarOpen(false); 
                  }}
                  className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer ${
                    isActive 
                      ? "bg-gradient-to-r from-cyan-600/10 to-transparent border border-cyan-500/20" 
                      : "hover:bg-[#1A1F29]/50 border border-transparent"
                  }`}
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-700 text-white font-semibold">
                    {getInitials(c.email)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-sm text-gray-100 truncate">{c.full_name || c.email}</h3>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                </div>
              );
            })}
            
            {(!filteredClients || filteredClients.length === 0) && (
              <div className="text-center text-gray-600 mt-5 text-sm">No clients found.</div>
            )}
          </div>
        </div>

        {/* CENTER AREA: THE CHAT */}
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
                        ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-bl-2xl shadow-lg' 
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

          {/* 🚨 FIXED: Input bar without layout breakages */}
          <div className="p-4 border-t border-gray-800 bg-[#11141A]/80">
            <div className="flex items-center gap-2 bg-[#1A1F29] border border-gray-800 rounded-xl px-3 py-2 focus-within:border-cyan-500/50 transition-colors">
              <button className="text-gray-500 hover:text-cyan-500 p-1">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message here..." 
                className="flex-grow bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 min-w-0"
              />
              
              <button 
                onClick={handleSend}
                disabled={sendMessageMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-lg transition-all disabled:opacity-50"
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
