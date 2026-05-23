import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, ShieldCheck, ArrowUpRight, Loader2, 
  Receipt, Wallet, CheckCircle2, AlertCircle, Sparkles, Activity
} from "lucide-react";

export function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Inject Paystack Inline script dynamically to guarantee initialization
    const scriptId = "paystack-popup-script";
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.id = scriptId;
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        console.log("Paystack secure engine mounted successfully.");
      };
      script.onerror = () => {
        console.error("Failed to fetch Paystack checkout framework dependencies.");
      };
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }

    // Fetch account project tracking data sheets from Supabase
    async function getBillingData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserEmail(user.email || "");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_email", user.email)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }
    getBillingData();
  }, []);

  // Compute live values for dashboard analytics
  const totalOutstanding = projects.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const completedProjectsCount = projects.filter(p => p.status === "Completed").length;
  const activeProjectsCount = projects.filter(p => p.status === "In Progress" || p.status === "Pending").length;

  const handlePaystackCheckout = (project: any) => {
    // Verify script availability before processing window object frames
    // @ts-ignore
    if (!scriptLoaded || typeof PaystackPop === "undefined") {
      alert("Secure checkout channel initialization is finishing. Please click the button again in 2 seconds.");
      return;
    }

    // Paste your real pk_live_... or pk_test_... key inside these quotes below
    const paystackKey = "pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE"; 

    // Prevent running if the template string is still set to placeholder text
    if (paystackKey === "pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE") {
      alert("Configuration Incomplete: Please grab your Live Public Key from dashboard.paystack.com and replace 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE' in your code!");
      return;
    }

    const paymentAmount = Number(project.amount) || 0;

    if (paymentAmount <= 0) {
      alert("This project ledger does not have any outstanding balance due.");
      return;
    }

    const paymentChoice = prompt(
      `Outstanding Project Balance: ₦${paymentAmount.toLocaleString()}\n\nType "FULL" to make complete clearance, or type a custom amount to make a deposit milestone (e.g. 15000):`,
      "FULL"
    );
    if (!paymentChoice) return;

    let finalAmountToChargeNaira = paymentAmount;

    if (paymentChoice.trim().toUpperCase() !== "FULL") {
      const customAmount = parseInt(paymentChoice.replace(/[^0-9]/g, ""), 10);
      if (isNaN(customAmount) || customAmount <= 0) {
        alert("Invalid numeral amount specified. Terminal closed.");
        return;
      }
      if (customAmount > paymentAmount) {
        alert(`Transaction Denied: Deposit cannot exceed the remaining balance of ₦${paymentAmount.toLocaleString()}.`);
        return;
      }
      finalAmountToChargeNaira = customAmount;
    }

    const totalAmountKobo = finalAmountToChargeNaira * 100;
    
    // @ts-ignore
    const handler = PaystackPop.setup({
      key: paystackKey, 
      email: userEmail,
      amount: totalAmountKobo,
      currency: "NGN",
      metadata: {
        projectId: project.id,
        projectTitle: project.title,
        isPartialPayment: finalAmountToChargeNaira < paymentAmount
      },
      callback: async function (response: any) {
        alert(`Payment Authenticated! Reference ID: ${response.reference}`);
        
        const newRemainingBalance = paymentAmount - finalAmountToChargeNaira;
        const targetStatus = newRemainingBalance <= 0 ? "Completed" : project.status;

        await supabase
          .from("projects")
          .update({ 
            amount: newRemainingBalance,
            status: targetStatus 
          })
          .eq("id", project.id);
          
        window.location.reload();
      },
      onClose: function () {
        console.log("Secure transaction channel aborted by customer.");
      }
    });

    handler.openIframe();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[#06080c] min-h-screen text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-4" size={28} />
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Securing Ledger Link...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#06080c] text-white p-4 md:p-8 font-sans antialiased selection:bg-cyan-500/30 pb-16">
      
      {/* MOBILE BANK HEADER SUB-BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-cyan-400">Sulaiman Graphics Pay</span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
            Digital Account Wallet
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-[#0e121a] border border-zinc-800/60 px-3 py-1.5 rounded-full self-start sm:self-auto shadow-lg">
          <ShieldCheck size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Live Secure Gateway</span>
        </div>
      </div>

      {/* THREE-COLUMN STATS AND CARD GRID SETUP */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* PREMIUM GRADIENT VIRTUAL CARD */}
        <div className="lg:col-span-2 transition-transform duration-300 hover:scale-[1.005]">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-6 shadow-xl border border-zinc-800/80 h-full flex flex-col justify-between min-h-[200px]">
            
            {/* Ambient Card Branding Accents */}
            <div className="absolute -right-6 -bottom-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest drop-shadow">Aggregate Net Balance</p>
                <p className="text-3xl font-black tracking-tight text-white font-mono drop-shadow-md">
                  ₦{totalOutstanding.toLocaleString()}
                </p>
              </div>
              <span className="text-[9px] font-mono tracking-widest font-black text-zinc-500 bg-zinc-900/60 border border-zinc-800/60 px-2 py-0.5 rounded-md">
                STATEMENT LEDGER
              </span>
            </div>

            {/* Simulated Chip and Security Code Space Placement */}
            <div className="mt-6 flex items-center justify-between">
              <div className="w-9 h-7 bg-amber-400/10 backdrop-blur-md rounded-md border border-amber-400/30 flex items-center justify-center">
                <div className="w-5 h-3 border border-amber-400/20 rounded-sm" />
              </div>
              <span className="text-xs font-mono tracking-[0.25em] text-zinc-300 drop-shadow">
                •••• •••• •••• {userEmail ? userEmail.slice(0, 3).toUpperCase() : "SGM"}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px]">
              <div>
                <p className="text-zinc-500 uppercase font-bold tracking-wider">Account Client</p>
                <p className="font-bold text-zinc-200 tracking-wide mt-0.5 max-w-[240px] truncate">{userEmail || "Guest User"}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 uppercase font-bold tracking-wider">Gateway Link</p>
                <p className="font-bold text-emerald-400 mt-0.5 font-mono flex items-center gap-1 justify-end">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" /> Verified
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LOGICAL ANALYTICAL PANEL BAR */}
        <div className="bg-[#0b0f17] border border-zinc-900/80 rounded-[24px] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Analytics</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto">
            <div className="bg-[#06080c] p-3 rounded-xl border border-zinc-900">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Active Orders</p>
              <p className="text-xl font-black font-mono text-white mt-1">{activeProjectsCount}</p>
            </div>
            <div className="bg-[#06080c] p-3 rounded-xl border border-zinc-900">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Fully Settled</p>
              <p className="text-xl font-black font-mono text-emerald-400 mt-1">{completedProjectsCount}</p>
            </div>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900 p-2.5 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/5 rounded-lg border border-cyan-500/10 text-cyan-400 shrink-0">
              <Sparkles size={12} />
            </div>
            <p className="text-[9px] text-zinc-400 leading-snug">
              Milestone payments allow you to fund ongoing print runs or layout edits securely.
            </p>
          </div>
        </div>

      </div>

      {/* RE-ARCHITECTED TRANSACTION LIST SYSTEM */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Receipt size={14} className="text-cyan-400" />
            Invoice Outstandings
          </h3>
          <span className="text-[10px] bg-[#0e121a] border border-zinc-800 px-2 py-0.5 rounded-md font-mono text-zinc-400">
            {projects.length} Files Total
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800/80 rounded-2xl bg-[#090b0e]">
            <Receipt className="mx-auto text-zinc-700 mb-3" size={28} />
            <p className="text-xs font-medium text-zinc-500">No invoice bills assigned to this statement sheet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((project) => {
              const currentAmt = Number(project.amount) || 0;
              const isCleared = currentAmt <= 0;

              return (
                <div 
                  key={project.id} 
                  className="bg-[#0b0f17] border border-zinc-900/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-zinc-800/60 hover:bg-[#0d131f] shadow-sm relative group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCleared ? "bg-zinc-600" : "bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]"}`} />
                      <h4 className="text-xs font-bold text-zinc-100 truncate tracking-tight pr-2">
                        {project.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium font-mono uppercase">
                      REF: {project.id.slice(0, 8).toUpperCase()} • <span className={project.status === "Completed" ? "text-emerald-400" : "text-amber-400"}>{project.status}</span>
                    </p>
                  </div>

                  {/* SETTLEMENT RIGHT ALIGNED BANK ACTIONS */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-900 shrink-0">
                    <div className="text-left sm:text-right">
                      <p className={`text-sm font-black font-mono tracking-tight ${
                        isCleared ? "text-zinc-600 line-through" : "text-cyan-400"
                      }`}>
                        ₦{currentAmt.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePaystackCheckout(project)}
                      disabled={isCleared}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-200 border ${
                        isCleared
                          ? "bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-40"
                          : "bg-cyan-500 border-cyan-500 text-black hover:bg-transparent hover:text-cyan-400 active:scale-95"
                      }`}
                    >
                      <CreditCard size={11} />
                      <span>{isCleared ? "Settled" : "Pay Now"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
