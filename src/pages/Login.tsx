import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple demo login
    if (email === "client@sulaiman.com" && password === "123456") {
      localStorage.setItem("auth", "true");
      setLocation("/dashboard");
    } else {
      alert("Invalid credentials");
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
