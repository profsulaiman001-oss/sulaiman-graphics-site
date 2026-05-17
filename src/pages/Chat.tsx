import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadToGitHubStorage } from "@/utils/uploader.ts"; 
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  CheckCircle2, 
  Menu,
  ArrowLeft,
  User,
  Mail,
  ArrowRight,
  UserPlus,
  Loader2,
  Trash2,
  FileText,
  Download,
  Mic,
  Square
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

  const [newClientEmail, setNewClientEmail] = useState("");
  const [activeClientEmail, setActiveClientEmail] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("chat_email");
    const savedName = sessionStorage.getItem("chat_name");
    
    if (savedEmail && savedName) {
      const formattedEmail = savedEmail.trim().toLowerCase();
      setGuestEmail(formattedEmail);
      setGuestName(savedName);
      setShowIdentityPopup(false);
      
      if (formattedEmail === "profsulaiman001@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setMobileSidebarOpen(false);
        setActiveClientEmail("profsulaiman001@gmail.com"); 
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;

    const formattedEmail = guestEmail.trim().toLowerCase();
    sessionStorage.setItem("chat_email", formattedEmail);
    sessionStorage.setItem("chat_name", guestName.trim());

    setGuestEmail(formattedEmail);
    setGuestName(guestName.trim());

    if (formattedEmail === "profsulaiman001@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setMobileSidebarOpen(false);
      setActiveClientEmail("profsulaiman001@gmail.com"); 
    }
    
    setShowIdentityPopup(false);
  };

  const { data: clients } = useQuery({
    queryKey: ['chatClients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_clients') 
        .select('email')
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data;
    },
    enabled: !showIdentityPopup && isAdmin, 
  });

  useEffect(() => {
    if (isAdmin && clients?.length && !activeClientEmail) {
      setActiveClientEmail(clients[0].email);
    }
  }, [clients, isAdmin, activeClientEmail]);

  const addClientMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('chat_clients')
        .insert([{ email }]);
      
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatClients'] });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (email: string) => {
      const savedEmail = sessionStorage.getItem("chat_email");
      if (savedEmail !== "profsulaiman001@gmail.com") {
        throw new Error("Unauthorized: Only the admin can delete clients.");
      }

      const { error } = await supabase
        .from('chat_clients')
        .delete()
        .eq('email', email);
      
      if (error) throw error;
    },
    onSuccess: (_, deletedEmail) => {
      queryClient.invalidateQueries({ queryKey: ['chatClients'] });
      if (activeClientEmail === deletedEmail) {
        setActiveClientEmail(null);
      }
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete client.");
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error, count } = await supabase
        .from('chat_messages')
        .delete({ count: 'exact' })
        .eq('id', messageId);
      
      if (error) throw error;
      
      if (count === 0) {
        throw new Error("Database processed request but message was not removed. Double check your RLS policy permissions.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeClientEmail] });
    },
    onError: (error: any) => {
      console.error("Supabase Deletion Failure:", error);
      alert(error.message || "Failed to clear target message block.");
    }
  });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newClientEmail.trim().toLowerCase();
    if (!email) return;
    
    addClientMutation.mutate(email);
    setActiveClientEmail(email);
    setNewClientEmail("");
  };

  const { data: chatMessages } = useQuery({
    queryKey: ['messages', activeClientEmail],
    queryFn: async () => {
      if (!activeClientEmail || !guestEmail) return [];
      
      const adminEmail = "profsulaiman001@gmail.com";
      const userOne = guestEmail.trim().toLowerCase();
      const userTwo = isAdmin ? activeClientEmail.trim().toLowerCase() : adminEmail;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_email.eq."${userOne}",receiver_email.eq."${userTwo}"),and(sender_email.eq."${userTwo}",receiver_email.eq."${userOne}")`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeClientEmail && !!guestEmail,
  });

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (!guestEmail) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_messages' 
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['messages', activeClientEmail] });
        queryClient.invalidateQueries({ queryKey: ['chatClients'] });

        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as any;
          if (newMessage.receiver_email === guestEmail) {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play().catch(() => {});
            document.title = "🔴 New Message!";
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestEmail, activeClientEmail, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const adminEmail = "profsulaiman001@gmail.com";
      const sender = guestEmail.trim().toLowerCase();
      const receiver = isAdmin ? activeClientEmail?.trim().toLowerCase() : adminEmail;

      if (!receiver) throw new Error("No receiver specified.");
      
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          sender_email: sender,
          receiver_email: receiver,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    
    if (e instanceof File) {
      file = e;
    } else {
      file = e.target.files?.[0];
    }

    if (!file || !activeClientEmail) return;

    try {
      setUploading(true);
      const downloadUrl = await uploadToGitHubStorage(file);
      
      if (!downloadUrl) {
        throw new Error("Failed to receive download URL from storage server.");
      }

      sendMessageMutation.mutate(downloadUrl);

    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file to storage. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Voice Note Recorder Controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const voiceFile = new File([audioBlob], `voicenote_${Date.now()}.webm`, { type: "audio/webm" });
        
        // Directly route the voice file payload straight to your GitHub cloud storage logic
        await handleFileUpload(voiceFile);
        
        // Kill audio tracks to cleanly free system microphone hardware access
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone hardware access denied:", err);
      alert("Could not access microphone. Please enable permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "CL";
    return email.substring(0, 2).toUpperCase();
  };

  const filteredClients = clients?.filter((c: any) =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isImageMessage = (text: string) => {
    if (!text || typeof text !== "string" || !text.startsWith("http")) return false;
    const lowerText = text.toLowerCase().split('?')[0];
    return (
      lowerText.endsWith(".png") || 
      lowerText.endsWith(".jpg") || 
      lowerText.endsWith(".jpeg") || 
      lowerText.endsWith(".gif") || 
      lowerText.endsWith(".webp") ||
      lowerText.includes("image")
    );
  };

  const isAudioMessage = (text: string) => {
    if (!text || typeof text !== "string" || !text.startsWith("http")) return false;
    const lowerText = text.toLowerCase().split('?')[0];
    return (
      lowerText.endsWith(".webm") ||
      lowerText.endsWith(".mp3") ||
      lowerText.endsWith(".wav") ||
      lowerText.endsWith(".ogg") ||
      lowerText.includes("voicenote")
    );
  };

  const isLinkMessage = (text: string) => {
    if (!text || typeof text !== "string") return false;
    return text.startsWith("http");
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.split('?')[0];
    } catch {
      return "Download File Attachment";
    }
  };

  const handleDownloadFile = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.setAttribute("download", getFileNameFromUrl(url));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-[#0B0C10] text-gray-100 flex flex-col pt-20 z-[40] overflow-hidden">
      
      <input 
        type="file" 
        accept="*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {showIdentityPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0C10]/95 backdrop-blur-md p-4">
          <div className="bg-[#11141A] border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
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
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                Enter Chat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex-grow flex h-full min-h-0 w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-6 relative overflow-hidden">
        
        {isAdmin && (
          <div className={`${mobileSidebarOpen ? 'flex' : 'hidden md:flex'} absolute inset-y-0 left-0 z-[45] md:relative w-full sm:w-80 md:w-1/4 flex-col bg-[#11141A] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl`}>
            <div className="p-5 flex-shrink-0 border-b border-gray-800">
              <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Conversations</h1>
              
              <form onSubmit={handleAddClient} className="flex gap-2 mb-4">
                <input 
                  type="email" 
                  placeholder="Type client email..." 
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="flex-grow bg-[#1A1F29] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-gray-200 focus:outline-none focus:border-cyan-500/30 transition-colors"
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2.5 rounded-xl text-black hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </form>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1A1F29] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/30 transition-colors"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {filteredClients?.map((c: any) => {
                const isActive = c.email === activeClientEmail;
                return (
                  <div 
                    key={c.email}
                    onClick={() => {
                      setActiveClientEmail(c.email);
                      setMobileSidebarOpen(false); 
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer group transition-all ${
                      isActive ? "bg-gradient-to-r from-cyan-600/10 to-transparent border border-cyan-500/20" : "hover:bg-[#1A1F29]/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-700 text-white font-semibold">
                        {getInitials(c.email)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm text-gray-100 truncate">{c.email}</h3>
                        <p className="text-[10px] text-gray-500 truncate">Click to message</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${c.email}?`)) deleteClientMutation.mutate(c.email);
                        }}
                        className="text-gray-600 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredClients?.length === 0 && (
                <div className="text-center py-10">
                  <User className="w-10 h-10 text-gray-800 mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-gray-600">No clients found</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-grow flex flex-col bg-[#11141A]/60 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden h-full shadow-2xl">
          
          <div className="flex-shrink-0 p-5 border-b border-gray-800 flex justify-between items-center bg-[#11141A]/80 z-10">
            <div className="flex items-center gap-3 min-w-0">
              {isAdmin && (
                <button 
                  className="md:hidden p-2.5 hover:bg-[#1A1F29] rounded-xl text-gray-400 border border-gray-800"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  {mobileSidebarOpen ? <ArrowLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center font-bold text-black shadow-lg shadow-cyan-500/20 flex-shrink-0">
                {isAdmin ? getInitials(activeClientEmail || "C") : "SG"}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-100 truncate text-sm sm:text-base">
                  {isAdmin ? activeClientEmail : "Sulaiman Graphics"}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <p className="text-[10px] sm:text-xs text-cyan-500 font-medium uppercase tracking-wider">Active Now</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="hidden sm:flex p-2.5 hover:bg-[#1A1F29] rounded-xl border border-gray-800 text-gray-400 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-[#1A1F29] rounded-xl border border-gray-800 text-gray-400 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto min-h-0 p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            {chatMessages?.map((msg: any) => {
              const isMe = msg.sender_email === guestEmail;
              const formattedTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isImage = isImageMessage(msg.message);
              const isAudio = isAudioMessage(msg.message);
              const isFile = isLinkMessage(msg.message) && !isImage && !isAudio;

              return (
                <div 
                  key={msg.id}
                  className={`flex items-end gap-3 max-w-[90%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-md ${
                    isMe ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-black' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isMe ? (isAdmin ? 'SG' : 'ME') : (isAdmin ? 'C' : 'SG')}
                  </div>
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}>
                    <div 
                      className={`relative transition-all duration-200 ${
                        isMe 
                          ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl rounded-tr-none' 
                          : 'bg-[#1A1F29] border border-gray-800 text-gray-200 rounded-2xl rounded-tl-none'
                      } ${isImage ? 'p-1.5' : 'px-4 py-3'} shadow-xl`}
                    >
                      {isImage ? (
                        <div className="relative group/img overflow-hidden rounded-xl">
                          <img 
                            src={msg.message} 
                            alt="Attachment" 
                            className="max-w-full sm:max-w-sm rounded-xl object-cover max-h-72 hover:scale-[1.02] transition-transform cursor-pointer"
                            onClick={() => window.open(msg.message, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 window.open(msg.message, '_blank');
                               }}
                               className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-colors"
                               title="View Full Size"
                             >
                               <ArrowRight className="w-5 h-5 -rotate-45" />
                             </button>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDownloadFile(msg.message);
                               }}
                               className="p-2.5 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 transition-colors"
                               title="Download Image"
                             >
                               <Download className="w-5 h-5" />
                             </button>
                          </div>
                        </div>
                      ) : isAudio ? (
                        <div className="p-1 min-w-[240px] sm:min-w-[280px]">
                          <audio 
                            src={msg.message} 
                            controls 
                            className="w-full h-9 rounded-lg accent-cyan-500 custom-audio-player"
                          />
                        </div>
                      ) : isFile ? (
                        <div 
                          onClick={() => handleDownloadFile(msg.message)}
                          className="flex items-center gap-3 w-64 sm:w-72 bg-black/20 border border-white/5 p-3 rounded-xl cursor-pointer select-none hover:bg-black/40 transition-all group/file"
                        >
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-400 border border-cyan-500/20 group-hover/file:bg-cyan-500/20 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-grow">
                            <p className="text-xs font-semibold truncate text-gray-200">
                              {getFileNameFromUrl(msg.message)}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Click to view / download</p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover/file:text-cyan-400 group-hover/file:bg-white/10 transition-all">
                            <Download className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      )}

                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
                        {(isMe || isAdmin) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this message permanently?")) {
                                deleteMessageMutation.mutate(msg.id);
                              }
                            }}
                            className="p-2 bg-[#1A1F29] border border-gray-800 rounded-lg text-gray-500 hover:text-red-500 hover:border-red-500/30 shadow-md transition-all"
                            title="Delete Message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-gray-600 font-medium">{formattedTime}</span>
                      {isMe && <CheckCircle2 className="w-3 h-3 text-cyan-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {chatMessages?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
                <Mail className="w-16 h-16 mb-4" />
                <p className="text-sm font-medium">No messages yet. Start a conversation!</p>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4 flex-shrink-0" />
          </div>

          <div className="flex-shrink-0 p-4 md:p-5 border-t border-gray-800 bg-[#11141A]/80 z-10">
            <div className="flex items-center gap-3 bg-[#1A1F29] border border-gray-800 rounded-2xl px-4 py-2.5 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || isRecording}
                className="text-gray-500 hover:text-cyan-500 p-1 disabled:opacity-30 transition-colors flex-shrink-0"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>
              
              ={isRecording ? (
                <div className="flex-grow flex items-center justify-between px-2 text-sm text-red-500 font-medium animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Recording voice note...
                  </div>
                  <button 
                    onClick={stopRecording}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                    title="Stop and Send"
                  >
                    <Square className="w-3.5 h-3.5 fill-red-500" />
                  </button>
                </div>
              ) : (
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..." 
                  className="flex-grow bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 min-w-0 py-1"
                />
              )}
              
              {!message.trim() && !isRecording && (
                <button
                  onClick={startRecording}
                  disabled={uploading}
                  className="text-gray-500 hover:text-cyan-400 p-1 transition-colors flex-shrink-0 disabled:opacity-30"
                  title="Record Voice Note"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
              
              {(message.trim() || isRecording) && (
                <button 
                  onClick={handleSend}
                  disabled={sendMessageMutation.isPending || uploading || !message.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
