import { useState, useEffect } from "react"; // Added useEffect
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, ImagePlus, CheckCircle, FileText, Trash2, Clock } from "lucide-react"; // Added Trash2 and Clock

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [posts, setPosts] = useState<any[]>([]); // State for post history
  const [fetchingPosts, setFetchingPosts] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");

  // --- NEW: FETCH POST HISTORY ---
  const fetchPosts = async () => {
    setFetchingPosts(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setPosts(data);
    setFetchingPosts(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // --- NEW: HANDLE DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      
      // Update local state to remove the post
      setPosts(posts.filter(post => post.id !== id));
      alert("Post deleted successfully.");
    } catch (error: any) {
      alert("Error deleting post: " + error.message);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const maxFileSize = 5 * 1024 * 1024;
      if (file.size > maxFileSize) {
        alert("File is too large! Please pick an image under 5MB.");
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type!");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
      setImageName(file.name);

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please provide both a title and content!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .insert([{
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl
        }]);

      if (error) throw error;
      
      alert("Post created successfully!");
      // Reset form and refresh list instead of redirecting immediately
      setTitle("");
      setContent("");
      setImageUrl("");
      setImageName("");
      fetchPosts(); 
    } catch (error: any) {
      alert("Failed to create post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="font-display font-black text-lg tracking-tighter text-foreground uppercase italic">
             SULAIMAN <span className="text-primary">GRAPHICS</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* LEFT SIDE: CREATE FORM */}
        <motion.div 
          className="bg-card border border-border rounded-2xl p-6 shadow-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary/20">
              <FileText size={22} className="text-primary" />
            </div>
            <h2 className="text-2xl font-display font-black text-foreground mb-1 uppercase italic">Create A New Post</h2>
            <p className="text-sm text-muted-foreground">Publish an update to your design ecosystem.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 block">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 block">Post Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 block">Featured Image (1920x1080)</label>
              <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${imageUrl ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/50"}`}>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} disabled={uploadingImage} />
                {uploadingImage ? <Loader2 className="animate-spin text-primary" /> : imageUrl ? <CheckCircle className="text-green-500" /> : <ImagePlus className="text-muted-foreground" />}
                <span className="text-xs mt-2 font-bold">{imageUrl ? "Image Ready" : "Upload Cover Page"}</span>
              </label>
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <button type="submit" disabled={loading || uploadingImage} className="w-full bg-primary hover:opacity-90 text-white font-bold text-sm py-4 rounded-xl transition flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "PUBLISHING..." : "PUBLISH TO BLOG"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* RIGHT SIDE: POST HISTORY & MANAGEMENT */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-primary" />
            <h3 className="font-display font-black uppercase italic text-lg tracking-tight">Post Management</h3>
          </div>

          <div className="space-y-4">
            {fetchingPosts ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" /> Loading history...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-sm">
                No posts found. Your history will appear here.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="text-xs font-bold text-primary uppercase tracking-tighter">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <h4 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs uppercase italic">{post.title}</h4>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </main>
    </div>
  );
}
