import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CreditCard, ShieldCheck, DollarSign, ArrowUpRight, Loader2, Receipt } from "lucide-react";

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

  const handlePaystackCheckout = (project: any) => {
    if (!project.amount || project.amount <= 0) {
      alert("No pending invoice balance assigned to this project asset yet.");
      return;
    }

    // Prompt user for payment option (Full or Partial deposit)
    const paymentChoice = prompt(
      `Your total remaining balance is ₦${project.amount.toLocaleString()}.\n\nType "FULL" to pay everything at once, or enter a specific custom amount you wish to deposit right now (e.g., 20000):`,
      "FULL"
    );

    if (!paymentChoice) return;

    let finalAmountToChargeNaira = project.amount;

    if (paymentChoice.trim().toUpperCase() !== "FULL") {
      const customAmount = parseInt(paymentChoice.replace(/[^0-9]/g, ""));
      if (isNaN(customAmount) || customAmount <= 0) {
        alert("Invalid numerical amount entered. Order terminal cancelled.");
        return;
      }
      if (customAmount > project.amount) {
        alert(`You cannot pay more than your remaining balance of ₦${project.amount.toLocaleString()}.`);
        return;
      }
      finalAmountToChargeNaira = customAmount;
    }

    // Paystack processes figures in Kobo subunit strings
    const totalAmountKobo = finalAmountToChargeNaira * 100;

    // @ts-ignore
    const handler = PaystackPop.setup({
      key: "pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE", // Paste your official Paystack Public Key here
      email: userEmail,
      amount: totalAmountKobo,
      currency: "NGN",
      metadata: {
        projectId: project.id,
        projectTitle: project.title,
        isPartialPayment: finalAmountToChargeNaira < project.amount
      },
      callback: async function (response: any) {
        alert(`Payment captured successfully! Reference ID: ${response.reference}`);
        
        // Compute updated pricing metrics array
        const newRemainingBalance = project.amount - finalAmountToChargeNaira;
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
        console.log("Transaction terminal dismissed by user channel.");
      }
    });

    handler.openIframe();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin text-cyan-400 mb-2" size={20} />
        <p className="text-xs font-medium tracking-widest uppercase">Synchronizing Portal Records...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white animate-fadeIn">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/50 to-transparent border border-neutral-800/60 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <CreditCard size={140} />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
            Secure Settlement Terminal
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-3 text-white">
            Payments & FinOps Portal
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Review prices assigned by studio administration, make direct full clearing settlements, or submit deposit milestones seamlessly via our secure channel.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
            <Receipt className="mx-auto text-neutral-600 mb-3" size={28} />
            <p className="text-xs font-medium text-muted-foreground">No active project sheets assigned to your account statement.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-neutral-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Project Asset Sheet
                </span>
                <h4 className="text-sm font-bold text-neutral-200 tracking-tight">{project.title}</h4>
                <p className="text-xs text-muted-foreground">
                  Status Matrix: <span className="text-cyan-400 font-medium">{project.status}</span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-900">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Outstanding Invoice Balance</p>
                  <p className="text-base font-black text-emerald-400 mt-0.5">
                    ₦{project.amount ? project.amount.toLocaleString() : "0"}
                  </p>
                </div>

                <button
                  onClick={() => handlePaystackCheckout(project)}
                  disabled={!project.amount || project.amount <= 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all transform active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
                >
                  Settle Bill
                  <ArrowUpRight size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
