import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, ShieldCheck, ArrowUpRight, Loader2, 
  Receipt, Wallet, CheckCircle2, AlertCircle, TrendingUp 
} from "lucide-react";

export function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
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

  // Calculate live statistical balances for the top banking layout widgets
  const totalOutstanding = projects.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const completedProjectsCount = projects.filter(p => p.status === "Completed").length;
  const activeProjectsCount = projects.filter(p => p.status === "In Progress" || p.status === "Pending").length;

  const handlePaystackCheckout = (project: any) => {
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
      key: "pk_live_YOUR_LIVE_PUBLIC_KEY_HERE", // Replace with your production key from Paystack Dashboard
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
        const targetStatus = newRemainingBalance <= 0 ? "In Progress" : project.status;

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
    <div className="w-full min-h-screen bg-[#06080c] text-white p-4 md:p-8 font-sans antialiased selection:bg-cyan-500/30">
      
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

      {/* PREMIUM GRADIENT VIRTUAL CARD */}
      <div className="max-w-md mx-auto mb-8 transition-transform duration-300 hover:scale-[1.01]">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-6 shadow-[0_20px_50px_rgba(6,182,212,0.15)] border border-white/20">
          
          {/* Decorative Card Micro-glowing Mesh Overlay */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-4 right-6 text-white/40 text-[10px] font-mono tracking-widest font-bold">
            STATEMENT LEDGER
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Aggregate Net Balance</p>
            <p className="text-3xl font-black tracking-tight text-white font-mono drop-shadow-md">
              ₦{totalOutstanding.toLocaleString()}
            </p>
          </div>

          {/* Simulated Chip and Security Code Space Placement */}
          <div className="mt-8 flex items-center justify-between">
            <div className="w-9 h-7 bg-amber-400/20 backdrop-blur-md rounded-md border border-amber-300/30 flex items-center justify-center">
              <div className="w-5 h-4 border border-amber-300/40 rounded-sm" />
            </div>
            <span className="text-xs font-mono tracking-[0.25em] text-white/90">
              •••• •••• •••• {userEmail ? userEmail.slice(0, 3).toUpperCase() : "SGM"}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px]">
            <div>
              <p className="text-white/60 uppercase font-medium tracking-wider">Account Client</p>
              <p className="font-bold text-white tracking-wide mt-0.5 max-w-[180px] truncate">{userEmail || "Guest User"}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 uppercase font-medium tracking-wider">Active Files</p>
              <p className="font-bold text-white mt-0.5 font-mono">{activeProjectsCount} Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* RE-ARCHITECTED TRANSACTION LIST SYSTEM */}
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Receipt size={14} className="text-cyan-400" />
            Invoice Outstandings
          </h3>
          <span className="text-[10px] bg-[#0e121a] border border-zinc-800 px-2 py-0.5 rounded-md font-mono text-zinc-400">
            {projects.length} Files
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800/80 rounded-2xl bg-[#090b0e]">
            <Receipt className="mx-auto text-zinc-700 mb-3" size={28} />
            <p className="text-xs font-medium text-zinc-500">No invoice bills assigned to this statement sheet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const currentAmt = Number(project.amount) || 0;
              const isCleared = currentAmt <= 0;

              return (
                <div 
                  key={project.id} 
                  className="bg-[#0b0f17] border border-zinc-900/80 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 hover:border-zinc-800 hover:bg-[#0d131f] shadow-sm"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCleared ? "bg-zinc-600" : "bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"}`} />
                      <h4 className="text-xs font-bold text-zinc-100 truncate tracking-tight pr-2">
                        {project.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium font-mono uppercase">
                      REF: {project.id.slice(0, 8).toUpperCase()} • <span className={project.status === "Completed" ? "text-emerald-400" : "text-amber-400"}>{project.status}</span>
                    </p>
                  </div>

                  {/* SETTLEMENT RIGHT ALIGNED BANK ACTIONS */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className={`text-sm font-black font-mono tracking-tight ${
                        isCleared ? "text-zinc-600 line-through" : "text-zinc-100"
                      }`}>
                        ₦{currentAmt.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePaystackCheckout(project)}
                      disabled={isCleared}
                      className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 border ${
                        isCleared
                          ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40"
                          : "bg-white hover:bg-cyan-400 hover:text-black hover:border-cyan-400 text-black border-white active:scale-90"
                      }`}
                      title={isCleared ? "Fully Settled" : "Settle Bill"}
                    >
                      <ArrowUpRight size={16} strokeWidth={2.5} />
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
