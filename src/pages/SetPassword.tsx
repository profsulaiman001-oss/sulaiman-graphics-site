import { useState } from "react";
import { useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/Button";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SetPassword() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // This automatically updates the password of the user clicking the email link
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password set successfully! Redirecting..." });
      
      // Send them to the dashboard or login after a brief pause
      setTimeout(() => {
        setLocation("/login");
      }, 2000);

    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <h1 className="font-display font-black text-3xl tracking-tighter text-foreground mb-2">
          WELCOME<span className="text-primary">.</span>PORTAL
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Create a secure password to access your client dashboard.
        </p>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label htmlFor="pass" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              New Password
            </label>
            <input
              id="pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full p-3 bg-[#0f0f11] border border-border rounded-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Create Account"}
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
