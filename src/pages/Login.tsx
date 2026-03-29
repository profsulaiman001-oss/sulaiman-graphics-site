import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[#111] p-6 rounded-lg w-full max-w-sm"
      >
        <h2 className="text-xl mb-4 text-center text-blue-500">
          Client Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 bg-black border border-gray-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 bg-black border border-gray-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
