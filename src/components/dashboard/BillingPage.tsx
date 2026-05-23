import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, ShieldCheck, ArrowUpRight, Loader2, Receipt, 
  Wallet, CheckCircle2, AlertCircle, TrendingUp 
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

  // Safely compute dashboard overview metrics mapping both structural variations
  const totalOutstanding = projects.reduce((sum, p) => {
    const val = p.amount !== undefined && p.amount !== null ? p.amount : (p.price || 0);
    return sum + val;
  }, 0);

  const completedProjectsCount = projects.filter(p => p.status === "Completed").length;
  const activeProjectsCount = projects.filter(p => p.status === "In Progress" || p.status === "Pending").length;

  const handlePaystackCheckout = (project: any) => {
    const accurateAmount = project.amount !== undefined && project.amount !== null ? project.amount : (project.price || 0);

    if (!accurateAmount || accurateAmount <= 0) {
      alert("No pending invoice balance assigned to this project asset yet.");
      return;
    }

    const paymentChoice = prompt(
      `Your total remaining balance is ₦${accurateAmount.toLocaleString()}.\n\nType "FULL" to pay everything at once, or enter a specific custom amount you wish to deposit right now (e.g., 20000):`,
      "FULL"
    );
    if (!paymentChoice) return;

    let finalAmountToChargeNaira = accurateAmount;

    if (paymentChoice.trim().toUpperCase() !== "FULL") {
      const customAmount = parseInt(paymentChoice.replace(/[^0-9]/g, ""));
      if (isNaN(customAmount) || customAmount <= 0) {
        alert("Invalid numerical amount entered. Order terminal cancelled.");
        return;
      }
      if (customAmount > accurateAmount) {
        alert(`You cannot pay more than your remaining balance of ₦${accurateAmount.toLocaleString()}.`);
        return;
      }
      finalAmountToChargeNaira = customAmount;
    }

    const totalAmountKobo = finalAmountToChargeNaira * 100;
    // @ts-ignore
    const handler = PaystackPop.setup({
      key: "pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE", // Replace with your live or test Paystack public key
      email: userEmail,
      amount: totalAmountKobo,
      currency: "NGN",
      metadata: {
        projectId: project.id,
        projectTitle: project.title,
        isPartialPayment: finalAmountToChargeNaira < accurateAmount
      },
      callback: async function (response: any) {
        alert(`Payment captured successfully! Reference ID: ${response.reference}`);
        
        const newRemainingBalance = accurateAmount - finalAmountToChargeNaira;
        const targetStatus = newRemainingBalance <= 0 ? "In Progress" : project.status;

        // Double-write updates across both column options for flawless syncing
        await supabase
          .from("projects")
          .update({ 
            amount: newRemainingBalance,
            price: newRemainingBalance,
            status: targetStatus 
          })
          .eq("id", project.id);
          
        window.location.reload();
      },
      onClose: function () {
        console.log("Transaction terminal dismissed by user channel.");
      }
    });

    handler.openIframe();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="animate-spin text-emerald-400 mb-3" size={24} />
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">Securing Gateway Instance...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-white animate-fadeIn pb-12">
      
      {/* HEADER BAR SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Financial Ledger
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage allocations, clear project invoice balances, and track design production milestones.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-inner">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">PCI-DSS Secure Portal</span>
        </div>
      </div>

      {/* BANKING APP SUMMARY WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 border border-zinc-800/60 p-5 shadow-xl group hover:border-zinc-700/60 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Wallet size={44} />
          </div>
          <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Total Net Outstanding</p>
          <p className="text-2xl font-black tracking-tight text-white mt-2 font-mono">
            ₦{totalOutstanding.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500 font-medium">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>Aggregate account statement</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 border border-zinc-800/60 p-5 shadow-xl group hover:border-zinc-700/60 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan-500 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <CreditCard size={44} />
          </div>
          <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Active Pipelines</p>
          <p className="text-2xl font-black tracking-tight text-white mt-2 font-mono">
            {activeProjectsCount} <span className="text-xs text-zinc-500 font-sans font-normal">Pending setup</span>
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500 font-medium">
            <AlertCircle size={12} className="text-cyan-500" />
            <span>Awaiting creative settlement</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 border border-zinc-800/60 p-5 shadow-xl group hover:border-zinc-700/60 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-zinc-500 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 size={44} />
          </div>
          <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">Settled Projects</p>
          <p className="text-2xl font-black tracking-tight text-white mt-2 font-mono">
            {completedProjectsCount} <span className="text-xs text-zinc-500 font-sans font-normal">Closed files</span>
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500 font-medium">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>Fully paid creative assets</span>
          </div>
        </div>
      </div>

      {/* INVOICE LIST TRACKER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Receipt size={14} className="text-zinc-500" />
            Invoice Statement Sheets
          </h3>
          <span className="text-[10px] font-medium text-zinc-500">{projects.length} Entries found</span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
            <Receipt className="mx-auto text-zinc-700 mb-3" size={32} />
            <p className="text-xs font-medium text-zinc-400">No active project sheets assigned to your account statement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const clientDisplayAmount = project.amount !== undefined && project.amount !== null ? project.amount : (project.price || 0);
              const isPaidOff = clientDisplayAmount <= 0;

              return (
                <div 
                  key={project.id} 
                  className="group bg-gradient-to-r from-zinc-900/90 to-zinc-950/40 border border-zinc-800/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-zinc-700/80 transition-all duration-300 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-glow" />
                      <h4 className="text-sm font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                        {project.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
                      <span className="text-zinc-500">
                        REF: <span className="font-mono text-zinc-400">{project.id.slice(0, 8).toUpperCase()}</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span>
                        Status Matrix:{" "}
                        <span className={`font-bold uppercase tracking-wider text-[10px] ml-0.5 ${
                          project.status === "Completed" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {project.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-800/60">
                    <div className="text-left md:text-right space-y-0.5">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Outstanding Invoice</p>
                      <p className={`text-lg font-black font-mono transition-colors ${
                        isPaidOff ? "text-zinc-500 line-through" : "text-emerald-400"
                      }`}>
                        ₦{clientDisplayAmount.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePaystackCheckout(project)}
                      disabled={isPaidOff}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg ${
                        isPaidOff
                          ? "bg-zinc-900 border border-zinc-800/80 text-zinc-600 cursor-not-allowed shadow-none opacity-40"
                          : "bg-white hover:bg-zinc-100 text-black active:scale-[0.98]"
                      }`}
                    >
                      <span>{isPaidOff ? "Cleared" : "Settle Bill"}</span>
                      {!isPaidOff && <ArrowUpRight size={13} strokeWidth={2.5} className="text-black" />}
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
