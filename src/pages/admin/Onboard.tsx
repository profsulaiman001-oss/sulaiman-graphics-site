import { useState } from "react";
import { Button } from "@/components/Button";
import { createClient } from "@supabase/supabase-js";

// Initialize standard client (safe for frontend)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function OnboardClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Call your live Edge function!
      const { data, error } = await supabase.functions.invoke('invite-client', {
        body: { email: email },
      });

      if (error) throw error;

      setMessage({ type: "success", text: `Success! Invite sent to ${email}` });
      setEmail("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send invite." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <h1 className="font-display font-black text-3xl tracking-tighter text-foreground mb-2">
          ONBOARD<span className="text-primary">.</span>CLIENT
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Type your client's email below. They will receive an official portal invite.
        </p>

        <form onSubmit={handleOnboard} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Client Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="mt-1 w-full p-3 bg-[#0f0f11] border border-border rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Inviting..." : "Send Secure Invite"}
          </Button>

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === "success" 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
