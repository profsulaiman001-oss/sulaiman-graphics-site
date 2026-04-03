import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Loader2, Share2 } from "lucide-react";

interface Post {
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function BlogPost() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/blog/:id");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!params?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setPost(data);
        
        // --- GOOGLE SEO MAGIC ---
        if (data) {
          document.title = `${data.title} | Sulaiman Graphics`;
          // Note: Full standard meta tags (like description and OG images) are best handled on the server side (SSR). 
          // However, updating the DOM title here still provides great value for single page app crawling.
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params?.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">The article you are looking for does not exist or has been deleted.</p>
        <button onClick={() => setLocation("/blog")} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition">
          <ArrowLeft size={16} /> Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/blog")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Blog
          </button>
          
          <h1 className="font-display font-black text-lg tracking-tighter text-foreground">
             SULAIMAN <span className="text-primary">GRAPHICS</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-1">
        <motion.article 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span>•</span>
              <span>By Sulaiman</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-black text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition text-foreground font-medium"
            >
              <Share2 size={12} /> Share this article
            </button>
          </div>

          {/* Featured Image */}
          {post.image_url && (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border mb-8 bg-card">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-invert max-w-none">
            {/* Split content by newlines and map to paragraphs for clean display */}
            {post.content.split('\n').map((paragraph, index) => (
              paragraph.trim() !== '' ? (
                <p key={index} className="text-muted-foreground text-lg mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ) : <br key={index} />
            ))}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
