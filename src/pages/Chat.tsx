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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function checkUserIdentity() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setGuestEmail(user.email || "");
        setGuestName(user.email?.split("@")[0] || "User");
        setShowIdentityPopup(false);
        if (user.email === "profsulaiman001@gmail.com") {
          setIsAdmin(true);
          setMobileSidebarOpen(true);
        } else {
          setIsAdmin(false);
          setActiveClientEmail("profsulaiman001@gmail.com");
          setMobileSidebarOpen(false);
        }
      }
    }
    checkUserIdentity();
  }, []);

  useEffect(() => {
    if (!activeClientEmail) return;
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", activeClientEmail] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeClientEmail, queryClient]);

  // Recording timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (audioBlob.size > 0) {
          await handleAudioUpload(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphome standard peripherals:", err);
      alert("Could not initialize microphone access. Please verify system level access bounds.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const audioFile = new File([audioBlob], `voice_note_${Date.now()}.wav`, { type: 'audio/wav' });
      const publicUrl = await uploadToGitHubStorage(audioFile);
      
      sendMessageMutation.mutate({
        text: "[Voice Message 🎙️]",
        fileUrl: publicUrl,
        fileType: "audio"
      });
    } catch (error: any) {
      console.error("Audio recording payload transmission fault:", error);
      alert("Failed to submit recorded voice note track: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const { data: clientsList = [], isLoading: loadingClients } = useQuery({
    queryKey: ["chatClients"],
    queryFn: async () => {
      const { data: messagesData, error: msgError } = await supabase
        .from("messages")
        .select("sender_email, receiver_email")
        .or(`sender_email.eq.profsulaiman001@gmail.com,receiver_email.eq.profsulaiman001@gmail.com`);

      if (msgError) throw msgError;

      const interactionEmails = new Set<string>();
      messagesData?.forEach((m) => {
        if (m.sender_email !== "profsulaiman001@gmail.com") interactionEmails.add(m.sender_email);
        if (m.receiver_email !== "profsulaiman001@gmail.com") interactionEmails.add(m.receiver_email);
      });

      const { data: profilesData } = await supabase.from("profiles").select("email");
      profilesData?.forEach((p) => {
        if (p.email !== "profsulaiman001@gmail.com") interactionEmails.add(p.email);
      });

      return Array.from(interactionEmails).map((email) => ({ email }));
    },
    enabled: isAdmin,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeClientEmail],
    queryFn: async () => {
      if (!activeClientEmail || !guestEmail) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_email.eq.${guestEmail},receiver_email.eq.${activeClientEmail}),and(sender_email.eq.${activeClientEmail},receiver_email.eq.${guestEmail})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClientEmail && !!guestEmail,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, fileUrl, fileType }: { text: string; fileUrl?: string; fileType?: string }) => {
      if (!guestEmail || !activeClientEmail) throw new Error("Missing active communication endpoints");
      const { error } = await supabase.from("messages").insert([
        {
          sender_email: guestEmail,
          receiver_email: activeClientEmail,
          message: text,
          file_url: fileUrl || null,
          file_type: fileType || null,
          sender_name: guestName || guestEmail.split("@")[0],
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeClientEmail] });
    },
    onError: (err: any) => {
      alert("Failed to deliver message payload: " + err.message);
    },
  });

  const handleSend = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if (!message.trim()) return;
    sendMessageMutation.mutate({ text: message.trim() });
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadToGitHubStorage(file);
      let detectedType = "file";
      if (file.type.startsWith("image/")) detectedType = "image";
      else if (file.type.startsWith("video/")) detectedType = "video";
      else if (file.type.startsWith("audio/")) detectedType = "audio";

      sendMessageMutation.mutate({
        text: `[Shared Attachment Asset: ${file.name}]`,
        fileUrl: publicUrl,
        fileType: detectedType
      });
    } catch (err: any) {
      alert("Asset pipeline storage delivery fault: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeClientEmail] });
      setActiveMenuId(null);
    },
  });

  const filteredClients = clientsList.filter((c) =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showIdentityPopup && !guestEmail) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#070b12] px-4">
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
              <Mail className="text-cyan-400 w-5 h-5" /> Communication Hub Authentication
            </h3>
            <p className="text-xs text-gray-400">Establish standard credentials metadata mapping context</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Ex. Alawiyya"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-[#070b12] border border-gray-800 text-sm p-2.5 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider block mb-1">Your Account Email</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-[#070b12] border border-gray-800 text-sm p-2.5 rounded-xl text-white outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (!guestName.trim() || !guestEmail.trim()) {
                  alert("Provide valid identity configuration arguments.");
                  return;
                }
                setShowIdentityPopup(false);
                if (guestEmail === "profsulaiman001@gmail.com") {
                  setIsAdmin(true);
                  setMobileSidebarOpen(true);
                } else {
                  setIsAdmin(false);
                  setActiveClientEmail("profsulaiman001@gmail.com");
                  setMobileSidebarOpen(false);
                }
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-xs py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              Initialize Chat Stream <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* LOCK INTERFACE CONTAINER FOR VERTICAL FLEX COMPONENT */
    <div className="h-full w-full bg-[#070b12] flex overflow-hidden rounded-2xl border border-gray-800 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* SIDEBAR NAVIGATION PANEL */}
      {isAdmin && (
        <div
          className={`${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-72 bg-[#0b1324] border-r border-gray-800 flex flex-col z-30 transition-transform duration-300 ease-in-out h-full`}
        >
          {/* SEARCH BAR AT TOP */}
          <div className="p-4 border-b border-gray-800/60 flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Menu className="text-cyan-400 w-4 h-4" /> Active Communications
              </h2>
              <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#070b12] border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* INTERNAL CLIENT LIST (SCROLL CONTENT) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {loadingClients ? (
              <div className="flex items-center justify-center py-8 text-xs text-gray-500 gap-1.5">
                <Loader2 className="animate-spin text-cyan-400 w-4 h-4" /> Querying active streams...
              </div>
            ) : filteredClients.length === 0 ? (
              <p className="text-[11px] text-gray-500 text-center py-8 font-medium">No active chat channels verified.</p>
            ) : (
              filteredClients.map((c) => {
                const isActive = activeClientEmail === c.email;
                return (
                  <button
                    key={c.email}
                    onClick={() => {
                      setActiveClientEmail(c.email);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${
                      isActive
                        ? "bg-cyan-500/10 border-cyan-500/30 text-white shadow-lg"
                        : "bg-transparent border-transparent text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "bg-cyan-500 text-black font-bold" : "bg-gray-800 text-gray-400"}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-gray-200 truncate">{c.email.split("@")[0]}</p>
                      <p className="text-[10px] text-gray-500 truncate">{c.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ADD CONVERSATION AT BOTTOM CONTROL VIEWPORT */}
          <div className="p-3 border-t border-gray-800/60 flex-shrink-0 bg-[#070b12]">
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="client@domain.com"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="flex-1 bg-[#0f172a] border border-gray-800 text-xs px-2.5 py-2 rounded-lg text-white outline-none focus:border-cyan-500 placeholder-gray-600 font-medium"
              />
              <button
                onClick={() => {
                  if (!newClientEmail.trim() || !newClientEmail.includes("@")) {
                    alert("Provide valid email structure values.");
                    return;
                  }
                  setActiveClientEmail(newClientEmail.trim());
                  setNewClientEmail("");
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-black p-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                title="Initialize Client Tunnel Link"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT INTERACTIVE LOG ENVIRONMENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#070b12] to-[#0a1120]">
        {activeClientEmail ? (
          <>
            {/* VIEWPORT STREAM HEADER LOGIC */}
            <div className="p-4 border-b border-gray-800/60 bg-[#0b1324] flex items-center justify-between flex-shrink-0 z-10">
              <div className="flex items-center gap-3 truncate">
                {isAdmin && (
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden p-1.5 bg-gray-800 text-gray-300 rounded-lg hover:text-white"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                )}
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-black font-black text-xs shadow-md">
                  {activeClientEmail.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-black text-gray-200 tracking-tight truncate">{activeClientEmail}</h4>
                  <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Connection Tunnel Active
                  </p>
                </div>
              </div>
            </div>

            {/* MESSAGE INTERFACES STREAM ENVIRONMENT (SCROLL CONTAINER) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {loadingMessages ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500 gap-2 font-medium">
                  <Loader2 className="animate-spin text-cyan-400 w-4 h-4" /> Syncing conversation telemetry matrix...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
                  <Mail className="w-8 h-8 text-gray-600" />
                  <p className="text-xs text-gray-400 font-bold">Secure Tunnel Handshake Established</p>
                  <p className="text-[10px] text-gray-500 max-w-[200px]">Send an asset delivery dispatch metadata link or communication message to initialize context logs.</p>
                </div>
              ) : (
                messages.map((m: any) => {
                  const isMe = m.sender_email === guestEmail;
                  const showMenu = activeMenuId === m.id;
                  
                  return (
                    <div key={m.id} className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"} animate-fadeIn relative group`}>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-sm relative ${
                        isMe 
                          ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-black font-semibold rounded-tr-none" 
                          : "bg-[#0f172a] border border-gray-800 text-gray-200 rounded-tl-none"
                      }`}>
                        
                        {/* Render File/Attachment Attachment Assets If Present */}
                        {m.file_url && (
                          <div className="mb-2 p-2 bg-black/20 rounded-xl border border-white/5 space-y-2">
                            {m.file_type === "image" ? (
                              <img src={m.file_url} alt="Shared attachment illustration asset" className="max-w-full rounded-lg max-h-48 object-cover" />
                            ) : m.file_type === "audio" ? (
                              <audio src={m.file_url} controls className="max-w-full accent-cyan-400 text-xs h-8" />
                            ) : (
                              <div className="flex items-center gap-2 p-1 text-inherit">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="text-[11px] font-bold truncate max-w-[120px]">External Document File</span>
                              </div>
                            )}
                            <button 
                              onClick={() => window.open(m.file_url, '_blank')}
                              className="w-full py-1 bg-black/40 hover:bg-black/60 rounded text-[10px] font-bold flex items-center justify-center gap-1 text-inherit transition-colors"
                            >
                              <Download className="w-3 h-3" /> Fetch Asset Deliverable
                            </button>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap break-words">{m.message}</p>

                        {/* Options drop menu trigger */}
                        {isMe && (
                          <button 
                            onClick={() => setActiveMenuId(showMenu ? null : m.id)}
                            className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {showMenu && (
                          <div className="absolute right-0 top-full mt-1 bg-[#0f172a] border border-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                            <button 
                              onClick={() => deleteMessageMutation.mutate(m.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10 font-bold transition-colors w-full text-left"
                            >
                              <Trash2 className="w-3 h-3" /> Scrub Log Entry
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-[8px] text-gray-500 font-bold mt-1 px-1 flex items-center gap-1 select-none">
                        {new Date(m.created_at).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                        {isMe && <CheckCircle2 className="w-2 h-2 text-cyan-400" />}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* INTERACTIVE COMPOSER PANEL (FIXED BASELINE AT THE ABSOLUTE BOTTOM) */}
            <div className="p-4 border-t border-gray-800/60 bg-[#0b1324] flex-shrink-0 z-10">
              <div className="flex items-center gap-2 max-w-4xl mx-auto relative">
                
                <button
                  onClick={handleFileUploadClick}
                  disabled={uploading}
                  className="p-2.5 bg-[#0f172a] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-cyan-400 rounded-xl transition-all flex-shrink-0 disabled:opacity-40"
                  title="Upload Document Artifact"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </button>

                <div className="flex-1 bg-[#0f172a] border border-gray-800 rounded-xl flex items-center px-3 py-1.5 min-w-0 transition-all focus-within:border-cyan-500/50">
                  {isRecording ? (
                    <div className="flex items-center justify-between w-full text-xs text-red-400 font-bold animate-pulse py-1">
                      <div className="flex items-center gap-2">
                        <Square className="w-3 h-3 fill-red-500 text-red-500 cursor-pointer" onClick={stopRecording} />
                        <span>Capturing Live Audio Stream Telemetry...</span>
                      </div>
                      <span className="font-mono text-gray-300">{formatDuration(recordingDuration)}</span>
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
                      disabled={sendMessageMutation.isPending || uploading || (!message.trim() && !isRecording)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 disabled:grayscale"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-40">
            <User className="w-12 h-12 text-gray-600 mb-2" />
            <p className="text-sm font-black text-white uppercase tracking-wider">No Channel Instance Engaged</p>
            <p className="text-xs text-gray-400 max-w-xs">Select or register an active user profile node from the tracking sidebar index stream parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
