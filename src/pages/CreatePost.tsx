import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert the new post into our Supabase table
      const { error } = await supabase
        .from("posts")
        .insert([{ title, content, image_url: imageUrl }]);

      if (error) throw error;

      alert("Success! Your post has been published.");
      
      // Send the user back to the dashboard
      setLocation("/dashboard");
    } catch (error: any) {
      alert("Error: " + (error.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-32">
      <h1 className="font-display font-black text-4xl text-foreground mb-8">
        Create a New Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Post Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Behind the Scenes: Rebranding XYZ Agency"
            required
            className="w-full p-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Image URL Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Image URL
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste your image link here"
            className="w-full p-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Tip: You can use a direct link to an image for now!
          </p>
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Story / Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell the story behind your design..."
            required
            rows={10}
            className="w-full p-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/dashboard")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
