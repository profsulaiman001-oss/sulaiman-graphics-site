import React, { useState, useEffect } from 'react';
import { 
  User, Building, Mail, Camera, Save, CheckCircle, Loader2, 
  Phone, ShieldCheck, Layers, Calendar, Briefcase 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface ClientSettingsProps {
  userEmail: string | undefined;
}

export function ClientAccountSettings({ userEmail }: ClientSettingsProps) {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [stats, setStats] = useState({
    activeContracts: 0,
    deliveredAssets: 0,
    memberSince: "May 2026"
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, business_name, avatar_url, whatsapp')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          setFullName(data.full_name || "");
          setBusinessName(data.business_name || "");
          setWhatsappNumber(data.whatsapp || "");
          setAvatarUrl(data.avatar_url || null);
        }

        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_email', user.email);

        const { count: completedCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_email', user.email)
          .eq('status', 'Completed');

        if (user.created_at) {
          const dateObj = new Date(user.created_at);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          setStats({
            activeContracts: (projectCount || 0) - (completedCount || 0),
            deliveredAssets: completedCount || 0,
            memberSince: formattedDate
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userEmail]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingAvatar(true);
    try {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          email: user.email,
          avatar_url: publicUrl 
        });

    } catch (err: any) {
      alert("Avatar upload failed: " + err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active session found.");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName.trim(),
          business_name: businessName.trim(),
          whatsapp: whatsappNumber.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert("Failed to save profile configurations: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={20} />
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Synchronizing Identity Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto space-y-6 text-left"
    >
      {/* OMNI CHASSIS PREMIUM SURFACE CONTAINER */}
      <div className="bg-[#090d16] border border-white/[0.06] rounded-[28px] overflow-hidden shadow-2xl relative">
        
        {/* IMMERSIVE STUDIO TOP IDENTITY BANNER */}
        <div className="p-6 md:p-8 border-b border-white/[0.04] bg-gradient-to-b from-cyan-950/10 to-transparent relative">
          <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-5 z-10 relative">
            <div className="flex items-center gap-5">
              
              {/* INTERACTIVE PROFILE AVATAR BLOCK */}
              <div className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-[#121824] border border-white/[0.08] shadow-xl shrink-0 flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Studio Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-muted-foreground/40" />
                )}
                <label className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-black uppercase tracking-widest gap-1.5">
                  {isUploadingAvatar ? (
                    <Loader2 size={12} className="animate-spin text-cyan-400" />
                  ) : (
                    <>
                      <Camera size={12} className="text-cyan-400" />
                      <span>Change</span>
                    </>
                  )}
                  <input type="file" accept="image/*" disabled={isUploadingAvatar} className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base font-black tracking-tight text-white">
                    {fullName || "Design Space Partner"}
                  </h1>
                  <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center gap-1 text-cyan-400">
                    <ShieldCheck size={10} className="shrink-0" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Client Tier</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium font-mono tracking-normal">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS TRACKING GRID */}
        <div className="px-6 md:px-8 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="bg-[#0e1321] border border-white/[0.04] p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/5 flex items-center justify-center text-cyan-400 border border-cyan-500/10">
              <Briefcase size={15} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Active Workspace Contracts</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{stats.activeContracts}</span>
            </div>
          </div>

          <div className="bg-[#0e1321] border border-white/[0.04] p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-400 border border-blue-500/10">
              <Layers size={15} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Final Deliveries</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{stats.deliveredAssets}</span>
            </div>
          </div>

          <div className="bg-[#0e1321] border border-white/[0.04] p-4 rounded-xl flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/5 flex items-center justify-center text-purple-400 border border-purple-500/10">
              <Calendar size={15} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Account Active Since</span>
              <span className="text-xs font-black text-white mt-0.5">{stats.memberSince}</span>
            </div>
          </div>
        </div>

        {/* INPUT LAYOUT SUBSTRUCTURE ENGINE */}
        <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN MODULE 1: PROFILE COORDINATOR */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <User size={13} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Account Executive Identification</h3>
              </div>
              
              <div className="space-y-4 bg-[#0c101b] border border-white/[0.04] p-5 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Full Personal Representative Name</label>
                  <div className="relative group">
                    <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#121826] border border-white/[0.06] rounded-xl pl-10 pr-4 h-10 text-xs text-white outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/5 transition-all font-medium placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Direct WhatsApp Mobile Line</label>
                  <div className="relative group">
                    <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="tel" 
                      placeholder="e.g. +234 800 000 0000"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-[#121826] border border-white/[0.06] rounded-xl pl-10 pr-4 h-10 text-xs text-white outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/5 transition-all font-medium placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN MODULE 2: BRAND CONTEXT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Building size={13} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Corporate Business Context</h3>
              </div>
              
              <div className="space-y-4 bg-[#0c101b] border border-white/[0.04] p-5 rounded-2xl h-full flex flex-col justify-start">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Registered Corporation or Brand Name</label>
                  <div className="relative group">
                    <Building size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-blue-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Industries Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-[#121826] border border-white/[0.06] rounded-xl pl-10 pr-4 h-10 text-xs text-white outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/5 transition-all font-medium placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>
                <div className="hidden sm:block text-[10px] text-muted-foreground/40 leading-relaxed pt-2">
                  Providing complete structural coordinates assists in accelerating your branding invoice generations, certification allocations, and mockup design reviews automatically.
                </div>
              </div>
            </div>

          </div>

          {/* SECURE PROTECTED PLATFORM ACCOUNT FOOTER DETAILS */}
          <div className="space-y-2 pt-5 border-t border-white/[0.04]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Core Communications Email ID (Immutable)</label>
            <div className="relative opacity-35 select-none">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
              <input 
                type="email" 
                disabled 
                value={userEmail || ""} 
                className="w-full bg-[#0c101b] border border-white/[0.04] rounded-xl pl-10 pr-4 h-10 text-xs text-muted-foreground/80 font-mono cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* SUBMIT ACTION HUB ROW */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 h-10 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-900 disabled:to-gray-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={13} className="animate-spin text-white" />
              ) : savedSuccess ? (
                <>
                  <CheckCircle size={13} className="text-white animate-pulse" />
                  <span>Configurations Preserved</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Update Space Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </motion.div>
  );
}
