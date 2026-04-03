import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, ImagePlus, CheckCircle, FileText } from "lucide-react";

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);

      // 1. Check file size (Limit to 5MB max)
      const maxFileSize = 5 * 1024 * 1024;
      if (file.size > maxFileSize) {
        alert("File is too large! Please pick an image under 5MB.");
        setUploadingImage(false);
        return;
      }

      // 2. Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type! Please upload a PNG, JPG, or WEBP image.");
        setUploadingImage(false);
        return;
      }

      // Create a clean filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the live public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      setImageUrl(publicUrl);
      setImageName(file.name);

    } catch (error: any) {
      alert("Error uploading image: " + (error.message || error));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please provide both a title and content for your post!");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("posts")
        .insert([{
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl // This will be empty if they didn't upload an image
        }]);

      if (error) throw error;
      
      alert("Post created successfully!");
      setLocation("/dashboard"); // Take you back to your dashboard after saving

    } catch (error: any) {
      alert("Failed to create post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <h1 className="font-display font-black text-lg tracking-tighter text-foreground">
             SULAIMAN <span className="text-primary">GRAPHICS</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 flex justify-center items-center">
        <motion.div 
          className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <FileText size={22} className="text-primary" />
            </div>
            <h2 className="text-2xl font-display font-black text-foreground mb-1">Create A New Post</h2>
            <p className="text-sm text-muted-foreground">Share an update, tutorial, or announcement with your clients.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title Input */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Post Title</label>
              <input
                type="text"
                placeholder="Ex: How to request revisions efficiently"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Post Content</label>
              <textarea
                placeholder="Write your post details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground resize-none"
              />
            </div>

            {/* Image Uploader */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Featured Image</label>
              
              <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
                imageUrl 
                  ? "border-green-500/50 bg-green-500/5" 
                  : "border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5"
              }`}>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploadingImage}
                />
                
                {uploadingImage ? (
                  <div className="flex flex-col items-center">
                    <Loader2 size={24} className="animate-spin text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">Uploading image to server...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle size={24} className="text-green-500 mb-2" />
                    <span className="text-sm font-semibold text-foreground">Image ready!</span>
                    <span className="text-xs text-muted-foreground max-w-[250px] truncate mt-0.5">{imageName}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImagePlus size={24} className="text-muted-foreground mb-2" />
                    <span className="text-sm font-semibold text-foreground">Click to upload image</span>
                    <span className="text-xs text-muted-foreground mt-0.5">PNG, JPG or WEBP (Max 5MB)</span>
                  </div>
                )}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3">
              <button 
                type="button"
                onClick={() => setLocation("/dashboard")}
                className="flex-1 bg-background border border-border hover:bg-muted text-foreground font-medium text-sm px-4 py-3 rounded-xl transition"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 bg-primary hover:opacity-90 disabled:bg-primary/50 text-white font-semibold text-sm px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
}
