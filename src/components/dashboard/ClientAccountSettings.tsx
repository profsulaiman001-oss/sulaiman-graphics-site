import React, { useState, useEffect } from 'react';
import { 
  User, Building, Mail, Camera, Save, CheckCircle, Loader2, 
  Phone, Paintbrush, ShieldCheck, Layers, Calendar, Briefcase 
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
  const [brandColor, setBrandColor] = useState("#00ffff");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Decorative mock data insights to make the premium interface feel populated
  const [stats, setStats] = useState({
    activeContracts: 0,
    deliveredAssets: 0,
    memberSince: "May 2026"
  });

  // Load profile data from Supabase on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user data profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, business_name, avatar_url, whatsapp, brand_color')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          setFullName(data.full_name || "");
          setBusinessName(data.business_name || "");
          setWhatsappNumber(data.whatsapp || "");
          setBrandColor(data.brand_color || "#00ffff");
          setAvatarUrl(data.avatar_url || null);
        }

        // Pull active metric tallies to populate the premium stat insight indicators
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

  // Handle premium avatar picture uploading via your native project-files storage bucket
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingAvatar(true);
    try {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;

      // Upload file directly into your native project-files bucket path
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Extract the publicly accessible direct asset URL link
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Save directly into profile database table record
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
      if (!user) throw new Error("No active authentication token session found.");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName.trim(),
          business_name: businessName.trim(),
          whatsapp: whatsappNumber.trim(),
          brand_color: brandColor,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert("Failed to preserve configuration details: " + err.message);
    } {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={24} />
        <p className="text-xs uppercase tracking-widest font-medium opacity-70">Synchronizing Identity Vault...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl mx-auto space-y-6 text-left"
    >
      {/* PREMIUM GLASS CONTAINER SURFACE BLOCK */}
      <div className="bg-gradient-to-b from-card to-card/40 border border-border/60 rounded-3xl overflow-hidden shadow-xl relative">
        
        {/* TOP INTERACTIVE HUB DISPLAY BANNER GRAPHIC */}
        <div className="h-32 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-background border-b border-border/30 relative overflow-hidden flex items-end p-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00ffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 z-10 translate-y-2">
            <div className="flex items-center gap-4">
              
              {/* IMAGE SELECTION AVATAR NODE */}
              <div className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0 bg-black flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-muted-foreground/50" />
                )}
                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-bold gap-1 uppercase tracking-wider">
                  {isUploadingAvatar ? (
                    <Loader2 size={14} className="animate-spin text-cyan-400" />
                  ) : (
                    <>
                      <Camera size={14} className="text-cyan-400" />
                      <span>Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" disabled={isUploadingAvatar} className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>

              <div className="flex flex-col">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  {fullName || "Design Space Partner"}
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium font-mono">{userEmail}</p>
              </div>
            </div>

            {/* HIGH-END BRAND IDENTITY VERIFIED BADGE */}
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-1.5 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.05)] self-end sm:self-center">
              <ShieldCheck size={12} className="shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-wider">Verified Studio Partner</span>
            </div>
          </div>
        </div>

        {/* METRIC ACCOUNT SNAPSHOT SUMMARY INSIGHT GRID */}
        <div className="pt-10 px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border/30 pb-6 bg-muted/5">
          <div className="bg-background/40 border border-border/40 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Briefcase size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Active Projects</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{stats.activeContracts}</span>
            </div>
          </div>

          <div className="bg-background/40 border border-border/40 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
              <Layers size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Completed Designs</span>
              <span className="text-sm font-black text-white font-mono mt-0.5">{stats.deliveredAssets}</span>
            </div>
          </div>

          <div className="bg-background/40 border border-border/40 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 shadow-inner">
              <Calendar size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Contract Duration</span>
              <span className="text-xs font-black text-white mt-0.5">{stats.memberSince}</span>
            </div>
          </div>
        </div>

        {/* INPUT PROFILES ACTION CONFIGURATOR FORM */}
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SUBSECTION BLOCK 1: PERSONAL CREDENTIAL IDENTITY */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <User size={12} /> Contact Coordinator Profile
              </h3>
              
              <div className="space-y-4 bg-background/20 border border-border/30 p-4 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground block">Full Legal Representative Name</label>
                  <div className="relative group">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground block">Active WhatsApp Connection (For Briefings)</label>
                  <div className="relative group">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="tel" 
                      placeholder="e.g. +234 800 000 0000"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUBSECTION BLOCK 2: COMPANY AND CORPORATE BRAND METADATA */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                <Building size={12} /> Corporate Brand Identity
              </h3>
              
              <div className="space-y-4 bg-background/20 border border-border/30 p-4 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground block">Registered Business/Company Name</label>
                  <div className="relative group">
                    <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Corporation"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground block">Primary Brand Signature Accent Color</label>
                  <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-2.5">
                    <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border/60 shrink-0 shadow-sm transition-transform active:scale-90">
                      <input 
                        type="color" 
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="absolute inset-0 w-full h-full scale-150 cursor-pointer p-0 border-none bg-transparent"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white uppercase font-bold font-mono tracking-wider">{brandColor}</span>
                      <span className="text-[8px] text-muted-foreground font-medium flex items-center gap-0.5"><Paintbrush size={8}/> Personalizes project canvas accents</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ISOLATED LOCKED ATTRIBUTE FOOTER ROW */}
          <div className="space-y-1.5 pt-4 border-t border-border/30">
            <label className="text-[10px] font-bold text-muted-foreground block">System Registered Communication Address</label>
            <div className="relative opacity-40 select-none">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="email" 
                disabled 
                value={userEmail || ""} 
                className="w-full bg-background/50 border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-muted-foreground font-medium cursor-not-allowed outline-none font-mono"
              />
            </div>
          </div>

          {/* ACTION SUBMIT CONTAINER BUTTON */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin text-white" />
              ) : savedSuccess ? (
                <>
                  <CheckCircle size={14} className="text-white animate-bounce" />
                  <span>Space Configurations Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Space Workspace Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </motion.div>
  );
}
