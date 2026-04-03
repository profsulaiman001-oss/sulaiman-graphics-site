import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Calendar, Loader2 } from "lucide-react";

// Types for TypeScript
interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export default function Blog() {
  const [, setLocation] = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false }); // Newest first

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <h1 className="font-display font-black text-lg tracking-tighter text-foreground">
             SULAIMAN <span className="text-primary">GRAPHICS</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <BookOpen size={22} className="text-primary" />
          </div>
          <h2 className="text-4xl font-display font-black text-foreground mb-3">Latest Articles & Updates</h2>
          <p className="text-muted-foreground text-lg">Insights, tutorials, and behind-the-scenes at Sulaiman Graphics.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
            <p className="text-muted-foreground text-lg mb-2">No articles have been published yet.</p>
            <p className="text-sm text-muted-foreground/70">Check back later or check out the portfolio!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                onClick={() => setLocation(`/blog/${post.id}`)}
                className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all group"
                whileHover={{ y: -5 }}
              >
                {post.image_url ? (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-primary/5 flex items-center justify-center">
                    <BookOpen size={40} className="text-primary/20" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar size={14} />
                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.content}
                  </p>
                  
                  <span className="text-primary text-sm font-semibold group-hover:underline">Read full article →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
