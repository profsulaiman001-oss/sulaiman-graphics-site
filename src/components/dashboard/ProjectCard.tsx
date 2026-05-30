import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Edit3, Trash2, Save, XCircle, CheckCircle, Clock, Loader2, Download, 
  MessageSquare, HardDrive, Send, Plus, Smartphone, Image as ImageIcon, X 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProjectCardProps {
  project: any;
  isAdmin: boolean;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editPrice?: string | number;
  setEditPrice?: (val: string) => void;
  startEdit: (project: any) => void;
  saveEdit: () => void;
  setEditingId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void;
  assignUser: (id: string, email: string) => void;
  handleDelete: (id: string) => void;
  handleFileUpload: (id: string, file: File) => void;
  toggleComments: (id: string) => void;
  openCommentsId: string | null;
  comments: any[];
  versions: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  sendingComment: boolean;
  sendComment: (id: string) => void;
  unreadCounts: { [key: string]: number };
  clientEmails: string[];
  downloadFile: (url: string, filename: string) => void;
  statusColors: { [key: string]: string };
  mockups: any[];
  handleMockupUpload: (id: string, files: FileList) => void;
  handleDeleteVersion: (versionId: string) => void;
}

export function ProjectCard({
  project,
  isAdmin,
  editingId,
  setEditingId,
  updateStatus,
  assignUser,
  handleDelete,
  toggleComments,
  openCommentsId,
  comments,
  versions,
  newComment,
  setNewComment,
  sendingComment,
  sendComment,
  unreadCounts,
  clientEmails,
  downloadFile,
  statusColors,
  mockups = [], 
  handleDeleteVersion
}: ProjectCardProps) {

  const [showGallery, setShowGallery] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [isUploadingMockup, setIsUploadingMockup] = useState(false);
  
  // Dynamic self-handling fields to ensure smooth typing actions
  const [localTitle, setLocalTitle] = useState(project.title || "");
  const [localAmount, setLocalAmount] = useState(project.amount !== undefined && project.amount !== null ? project.amount : "0");
  
  // Track the currently viewed revision image context via swipe index tracking
  const [currentVersionUrl, setCurrentVersionUrl] = useState(project.file_url || "");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Synchronize field states if data properties refresh from root queries
  useEffect(() => {
    setLocalTitle(project.title || "");
    setLocalAmount(project.amount !== undefined && project.amount !== null ? project.amount : "0");
    setCurrentVersionUrl(project.file_url || "");
  }, [project]);

  const getProgress = (status: string) => {
    if (status === "Completed") return 100;
    if (status === "In Progress") return 65;
    return 25;
  };

  const handleInlineSave = async () => {
    setIsSaving(true);
    try {
      const parsedAmount = localAmount === "" ? 0 : parseInt(localAmount.toString().replace(/[^0-9]/g, ""));
      const { error } = await supabase
        .from("projects")
        .update({
          title: localTitle,
          amount: parsedAmount
        })
        .eq("id", project.id);
      if (error) throw error;
      
      setEditingId(null);
      window.location.reload();
    } catch (err: any) {
      alert("Error saving properties: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSupabaseVersionUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingVersion(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${project.id}/${Date.now()}_version.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-files")
        .getPublicUrl(fileName);

      const { error: versionError } = await supabase
        .from("project_versions")
        .insert({
          project_id: project.id,
          version_name: `Revision v${(versions?.length || 0) + 1}`,
          file_url: publicUrl
        });
      if (versionError) throw versionError;

      const { error: projectUpdateError } = await supabase
        .from("projects")
        .update({ file_url: publicUrl })
        .eq("id", project.id);
      if (projectUpdateError) throw projectUpdateError;

      alert("Design asset version saved safely into your storage bucket!");
      window.location.reload();
    } catch (err: any) {
      alert("Version storage upload configuration error: " + err.message);
    } finally {
      setIsUploadingVersion(false);
    }
  };

  const handleSupabaseMockupUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsUploadingMockup(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${project.id}/mockup_${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(fileName, file, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("project-files")
          .getPublicUrl(fileName);

        const { error: mockupError } = await supabase
          .from("project_mockups")
          .insert({
            project_id: project.id,
            file_url: publicUrl
          });
        if (mockupError) throw mockupError;
      }

      alert("Premium presentation mockups successfully saved to your storage bucket!");
      window.location.reload();
    } catch (err: any) {
      alert("Mockup storage handling configuration failure: " + err.message);
    } finally {
      setIsUploadingMockup(false);
    }
  };

  // Logic to process swipe behaviors across design revision files
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX || !versions || versions.length <= 1) return;
    
    const minSwipeDistance = 50;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Find currently active revision index mapping
    const currentIndex = versions.findIndex(v => v.file_url === currentVersionUrl);
    
    if (isLeftSwipe) {
      // Advance to next design revision item in chronological array
      const nextIndex = currentIndex + 1;
      if (nextIndex < versions.length) {
        setCurrentVersionUrl(versions[nextIndex].file_url);
      }
    } else if (isRightSwipe) {
      // Recede to previous design revision item in chronological array
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        setCurrentVersionUrl(versions[prevIndex].file_url);
      }
    }

    // Clear position references safely
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Determine current display identity matching selected file layout path
  const activeVersionObj = versions?.find(v => v.file_url === currentVersionUrl);
  const activeVersionLabel = activeVersionObj ? activeVersionObj.version_name : "Latest Preview";

  const displayValue = Number(project.amount) || 0;

  return (
    <motion.div 
      className="bg-card border border-border/60 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER ROW CONFIGURATOR */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
        <div className="flex-1 min-w-0">
          {editingId === project.id ? (
            <div className="flex flex-col gap-1.5 w-full max-w-[160px]">
              <input
                type="text"
                autoFocus
                placeholder="Project Title"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="bg-background border border-border rounded-md px-2 py-1 text-xs focus:border-primary outline-none text-white w-full"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Price Amount"
                  value={localAmount}
                  onChange={(e) => setLocalAmount(e.target.value)}
                  className="bg-background border border-border rounded-md px-2 py-1 text-xs focus:border-primary outline-none text-white w-full"
                />
                <button 
                  onClick={handleInlineSave} 
                  disabled={isSaving}
                  className="text-primary hover:text-primary/80 transition-colors shrink-0 p-1"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                </button>
                <button onClick={() => setEditingId(null)} className="text-red-500 shrink-0 p-1"><XCircle size={14} /></button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-bold text-xs text-foreground truncate">{project.title}</span>
              <span className="text-[9px] text-muted-foreground truncate">{project.client_email || "Unassigned"}</span>
              <span className="text-[10px] text-cyan-400 font-mono mt-0.5 font-bold">
                ₦{displayValue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusColors[project.status] || "bg-card"}`}>
          {project.status}
        </span>
      </div>

      {/* PREVIEW CONTAINER STAGE */}
      <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden bg-muted/5">
        <AnimatePresence mode="wait">
          {openCommentsId === project.id ? (
            <motion.div 
              className="absolute inset-0 p-3 flex flex-col bg-card z-20"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex-1 overflow-y-auto space-y-3 mb-2 pr-1 custom-scrollbar text-left">
                {comments.length > 0 ? (
                  comments.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col ${msg.is_admin === isAdmin ? 'items-end' : 'items-start'}`}>
                      <span className="text-[7px] font-bold text-muted-foreground mb-0.5 uppercase tracking-tighter">
                        {msg.is_admin ? "Sulaiman Graphics" : "Client"}
                      </span>
                      <div className={`p-2 rounded-2xl max-w-[90%] text-[10px] leading-snug shadow-sm ${
                        msg.is_admin === isAdmin ? 'bg-primary text-white' : 'bg-muted border border-border text-foreground'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[7px] text-muted-foreground mt-0.5 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] italic">No messages yet.</div>
                )}
              </div>
              
              <div className="flex gap-1.5 border-t border-border pt-2">
                <input
                  type="text"
                  placeholder="Reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendComment(project.id)}
                  className="flex-1 bg-background border border-border rounded-lg px-3 text-[10px] text-white outline-none focus:border-primary transition-all"
                />
                <button onClick={() => sendComment(project.id)} disabled={sendingComment || !newComment.trim()} className="bg-primary text-white w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50">
                  {sendingComment ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center p-4 w-full h-full select-none cursor-pointer" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {currentVersionUrl ? (
                <div className="relative group w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl">
                  <img 
                    src={currentVersionUrl} 
                    onClick={() => setShowFullPreview(true)}
                    className="max-h-[180px] w-auto object-contain rounded-lg shadow-xl transition-transform duration-500 group-hover:scale-105" 
                    alt="Preview" 
                  />
                  {versions && versions.length > 1 && (
                    <div className="mt-2 text-[8px] bg-muted px-2 py-0.5 rounded-full font-mono text-muted-foreground tracking-tight select-none">
                      ← Swipe to switch ({activeVersionLabel}) →
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner bg-primary/10 text-primary`}>
                    <Clock size={28} className="animate-pulse" />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    Production
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* METRICS TRACKING AND REVISIONS */}
      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Project Status</span>
          <span className="text-[8px] font-bold text-primary">{getProgress(project.status)}%</span>
        </div>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }} 
            animate={{ width: `${getProgress(project.status)}%` }} 
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* VERSION HISTORY BLOCK */}
        {versions && versions.length > 0 && (
          <div className="mt-4 border-t border-border/30 pt-3">
            <h4 className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <HardDrive size={10} />
              Design Revisions
            </h4>
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
              {versions.map((v: any) => (
                <div 
                  key={v.id} 
                  onClick={() => setCurrentVersionUrl(v.file_url)}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer group ${
                    currentVersionUrl === v.file_url 
                      ? 'bg-primary/10 border-primary/40' 
                      : 'bg-card/50 border-border/30 hover:border-primary/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-foreground truncate max-w-[120px]">{v.version_name}</span>
                    <span className="text-[7px] text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm("Delete this design version?")) {
                            handleDeleteVersion(v.id);
                          }
                        }}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadFile(v.file_url, `${project.title}-${v.version_name}`);
                      }}
                      className="p-1.5 bg-muted/50 rounded-md group-hover:bg-primary/20 group-hover:text-primary transition-colors"
                    >
                      <Download size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER CONTROLS ROW */}
      <div className="p-4 bg-muted/5 border-t border-border">
        <div className="flex flex-col gap-3">
          
          <div className="flex flex-col gap-2">
            {mockups.length > 0 ? (
              <button 
                onClick={() => setShowGallery(true)}
                className="w-full h-8 flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-[10px] hover:bg-cyan-500/20 transition-all"
              >
                <Smartphone size={12} /> View {mockups.length} Premium Mockups
              </button>
            ) : isAdmin && (
              <label className="w-full h-8 flex items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-500/30 text-cyan-500/60 hover:text-cyan-500 text-[9px] cursor-pointer">
                {isUploadingMockup ? (
                  <Loader2 size={12} className="animate-spin text-cyan-400" />
                ) : (
                  <>
                    <ImageIcon size={12} /> Upload Mockups
                  </>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  disabled={isUploadingMockup}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleSupabaseMockupUpload(e.target.files);
                    }
                  }} 
                />
              </label>
            )}
          </div>

          {versions && versions.length > 0 ? (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadFile(currentVersionUrl, `${project.title}-${activeVersionLabel}`);
              }}
              className="w-full h-8 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Download size={12} /> Open & Download {activeVersionLabel} Assets
            </button>
          ) : !isAdmin && (
            <div className="w-full text-center text-muted-foreground text-[9px] py-2 border border-dashed border-border rounded-xl font-medium uppercase tracking-tight">
              Design production in progress...
            </div>
          )}

          {isAdmin && (
            <label className="w-full h-8 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-[10px] font-bold text-muted-foreground hover:text-primary">
              {isUploadingVersion ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <>
                  <Plus size={14} /> Upload New Version
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf" 
                disabled={isUploadingVersion}
                onChange={(e) => e.target.files && handleSupabaseVersionUpload(e.target.files[0])} 
              />
            </label>
          )}

          <div className="flex justify-between items-center">
            <button 
              onClick={() => toggleComments(project.id)} 
              className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary/80 font-bold transition-all relative"
            >
              <MessageSquare size={13} />
              Messages
              {unreadCounts[project.id] > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-card">
                  {unreadCounts[project.id]}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <>
                  <select 
                    value={project.client_email || ""} 
                    onChange={(e) => assignUser(project.id, e.target.value)}
                    className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] text-white outline-none max-w-[100px]"
                  >
                    <option value="">Assign</option>
                    {clientEmails.map(email => <option key={email} value={email}>{email}</option>)}
                  </select>
                  <select 
                    value={project.status} 
                    onChange={(e) => updateStatus(project.id, e.target.value)}
                    className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">Active</option>
                    <option value="Completed">Done</option>
                  </select>
                  <button 
                    onClick={() => {
                      setLocalTitle(project.title || "");
                      setLocalAmount(project.amount !== undefined && project.amount !== null ? project.amount : "0");
                      setEditingId(project.id);
                    }} 
                    className="p-1.5 rounded-lg border border-border text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                  >
                    <Edit3 size={12}/>
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={12}/></button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL PREVIEW MODAL (LIGHTBOX FOR COMPONENT VERSIONS) */}
      <AnimatePresence>
        {showFullPreview && currentVersionUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col p-4 justify-between"
            onClick={() => setShowFullPreview(false)}
          >
            <div className="flex justify-between items-center w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">{project.title}</h3>
                <p className="text-cyan-400 font-mono text-[10px] mt-0.5">{activeVersionLabel}</p>
              </div>
              <button 
                onClick={() => setShowFullPreview(false)} 
                className="p-2 bg-white/10 rounded-full text-white active:scale-90 transition-all"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-2 max-w-4xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
              <img 
                src={currentVersionUrl} 
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/5" 
                alt="Premium Full View"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 pb-4" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => downloadFile(currentVersionUrl, `${project.title}-${activeVersionLabel}`)}
                className="w-full sm:w-auto px-6 h-10 bg-primary rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
              >
                <Download size={14} /> Download This Version
              </button>
              <p className="text-center text-white/20 text-[8px] uppercase tracking-[0.2em] font-bold">
                Premium Production Asset • Sulaiman Graphics
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL GALLERY MODAL CONTAINER */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4"
          >
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-white font-bold text-sm tracking-tight">{project.title} - Mockup Showcase</h3>
               <button onClick={() => setShowGallery(false)} className="p-2 bg-white/10 rounded-full text-white active:scale-90 transition-all"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pb-20">
              {mockups.map((m, index) => (
                <div key={m.id} className="relative group max-w-4xl mx-auto">
                  <img 
                    src={m.file_url} 
                    className="w-full h-auto rounded-3xl shadow-2xl border border-white/5" 
                    alt={`Mockup ${index + 1}`} 
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {isAdmin && (
                      <button 
                        onClick={async () => {
                          if(confirm("Delete this mockup?")) {
                            await supabase.from("project_mockups").delete().eq("id", m.id);
                            alert("Mockup deleted.");
                          }
                        }}
                        className="bg-red-500/20 backdrop-blur-md p-3 rounded-full text-red-500 border border-red-500/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => downloadFile(m.file_url, `${project.title}-mockup-${index + 1}`)}
                      className="bg-cyan-500 p-4 rounded-full text-white shadow-xl active:scale-95 transition-all flex items-center gap-2 font-bold"
                    >
                      <Download size={20} /> <span className="text-xs">Save to Phone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold py-6">
              Exclusive Visualization by Sulaiman Graphics
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
