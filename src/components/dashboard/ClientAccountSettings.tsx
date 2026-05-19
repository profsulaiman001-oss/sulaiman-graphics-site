import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Camera, Save, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { uploadToGitHubStorage } from '@/utils/uploader';

interface ClientSettingsProps {
  userEmail: string | undefined;
}

export function ClientAccountSettings({ userEmail }: ClientSettingsProps) {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load profile data from Supabase on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, business_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setFullName(data.full_name || "");
          setBusinessName(data.business_name || "");
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Handle uploading the logo to your GitHub Storage array and previewing it
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      // Re-using your robust storage array uploader pipeline
      const directCdnUrl = await uploadToGitHubStorage(file, 'avatars');
      setAvatarUrl(directCdnUrl);
    } catch (err) {
      alert("Failed to upload image asset.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save or Update information inside Supabase Row Profiles
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated session found");

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: userEmail,
          full_name: fullName.trim(),
          business_name: businessName.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Database Synchronization Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={20} />
        <p className="text-[10px] tracking-widest uppercase font-bold">Fetching Brand Environment...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-32 animate-fadeIn"
    >
      <div className="bg-card/40 border border-border/60 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Your Custom Studio Space</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Personalize your account details and business identity settings below.
          </p>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          
          {/* PROFILE AVATAR MEDIA SLOT */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-border/40">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/40 bg-muted/40 flex items-center justify-center overflow-hidden shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-cyan-500 text-black rounded-full shadow-lg hover:bg-cyan-400 cursor-pointer transition active:scale-90">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Space Branding Logo</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">JPG or PNG formats accepted.</p>
            </div>
          </div>

          {/* INFORMATION FORM GRIDS */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground block">Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Sulaiman" 
                  className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-cyan-500/50 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground block">Business Name</label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Agency/Brand Ltd" 
                  className="w-full bg-background border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-cyan-500/50 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground block">System Registered Email</label>
            <div className="relative opacity-60">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="email" 
                disabled 
                value={userEmail || ""} 
                className="w-full bg-muted border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* ACTION SUBMIT CONTAINER BUTTON */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : savedSuccess ? (
              <>
                <CheckCircle size={15} />
                <span>Space Configurations Saved!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
