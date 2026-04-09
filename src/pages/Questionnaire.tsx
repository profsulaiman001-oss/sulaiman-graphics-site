import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Send, CheckCircle, Loader2, ClipboardList, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Questionnaire() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    business_name: "",
    project_type: "",
    project_goal: "",
    target_audience: "",
    brand_colors: "",
    design_style: "",
    reference_links: "",
    budget_range: "",
    deadline: "",
    additional_notes: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const isStep1Valid = step === 1 && formData.client_name && formData.client_email;
      const isStep2Valid = step === 2 && formData.project_type && formData.project_goal;
      if (step === 1 && isStep1Valid) nextStep();
      if (step === 2 && isStep2Valid) nextStep();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("project_questionnaires").insert([formData]);
      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      alert("Failed to submit: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050a15] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        <motion.div 
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <CheckCircle size={40} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Project Brief Received</h2>
          <p className="text-gray-400 mb-8 font-medium">I've received your details. Expect a professional response in your inbox shortly.</p>
          <button 
            type="button"
            onClick={() => setLocation("/")}
            className="w-full bg-white text-blue-900 font-black py-4 rounded-2xl hover:bg-blue-50 transition-all uppercase tracking-widest text-xs"
          >
            Back to Studio
          </button>
        </motion.div>
      </div>
    );
  }

  const InputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300";
  const LabelStyle = "text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3 block ml-1";

  return (
    <div className="min-h-screen bg-[#050a15] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-900/10 blur-[100px] rounded-full" />

      <header className="border-b border-white/5 bg-[#050a15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => setLocation("/client-hub")} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-tighter text-sm">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Exit Hub
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-500" />
            <span className="font-black text-lg tracking-tighter uppercase italic">Project <span className="text-blue-600">Brief</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Progress Section */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-blue-500 font-black text-3xl italic tracking-tighter">0{step}</span>
                <span className="text-gray-600 font-bold text-sm ml-2 uppercase tracking-widest">/ Step</span>
              </div>
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 italic">
                {Math.round((step / 4) * 100)}% Synchronized
              </span>
            </div>
            <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" initial={{ width: 0 }} animate={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <ClipboardList size={120} />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">The Basics</h2>
                    <p className="text-gray-400 font-medium">Identity and contact authentication.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className={LabelStyle}>Full Name *</label>
                      <input type="text" required value={formData.client_name} onChange={(e) => updateField("client_name", e.target.value)} className={InputStyle} placeholder="Sulaiman ..." />
                    </div>
                    <div>
                      <label className={LabelStyle}>Email Address *</label>
                      <input type="email" required value={formData.client_email} onChange={(e) => updateField("client_email", e.target.value)} className={InputStyle} placeholder="hello@studio.com" />
                    </div>
                    <div>
                      <label className={LabelStyle}>Brand/Company</label>
                      <input type="text" value={formData.business_name} onChange={(e) => updateField("business_name", e.target.value)} className={InputStyle} placeholder="Optional" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Project Scope</h2>
                    <p className="text-gray-400 font-medium">Define the creative requirements.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className={LabelStyle}>Service Type *</label>
                      <select required value={formData.project_type} onChange={(e) => updateField("project_type", e.target.value)} className={cn(InputStyle, "appearance-none cursor-pointer")}>
                        <option value="" className="bg-[#0a0f1d]">Select Category...</option>
                        <option value="Logo Design" className="bg-[#0a0f1d]">Identity & Branding</option>
                        <option value="Social Media" className="bg-[#0a0f1d]">Digital Assets</option>
                        <option value="Motion" className="bg-[#0a0f1d]">Motion Graphics</option>
                      </select>
                    </div>
                    <div>
                      <label className={LabelStyle}>Mission Statement *</label>
                      <textarea required value={formData.project_goal} onChange={(e) => updateField("project_goal", e.target.value)} className={cn(InputStyle, "min-h-[120px] resize-none")} placeholder="Describe the ultimate goal..." />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Steps 3 and 4 follow the same pattern... */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Visual DNA</h2>
                    <p className="text-gray-400 font-medium">Defining the aesthetic direction.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className={LabelStyle}>Preferred Palette</label>
                      <input type="text" value={formData.brand_colors} onChange={(e) => updateField("brand_colors", e.target.value)} className={InputStyle} placeholder="Ex: Deep Blue & Silver" />
                    </div>
                    <div>
                      <label className={LabelStyle}>Design Keywords</label>
                      <input type="text" value={formData.design_style} onChange={(e) => updateField("design_style", e.target.value)} className={InputStyle} placeholder="Ex: Brutalist, Minimal, Luxury" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Logistics</h2>
                    <p className="text-gray-400 font-medium">Final delivery parameters.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className={LabelStyle}>Investment Range</label>
                      <input type="text" value={formData.budget_range} onChange={(e) => updateField("budget_range", e.target.value)} className={InputStyle} placeholder="Ex: $1k - $5k" />
                    </div>
                    <div>
                      <label className={LabelStyle}>Deadline</label>
                      <input type="text" value={formData.deadline} onChange={(e) => updateField("deadline", e.target.value)} className={InputStyle} placeholder="DD/MM/YYYY" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="group px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button type="button" onClick={nextStep} disabled={(step === 1 && (!formData.client_name || !formData.client_email)) || (step === 2 && (!formData.project_type || !formData.project_goal))} className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-blue-500 disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-2">
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="px-10 py-4 bg-white text-blue-900 rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? "Transmitting..." : "Initiate Project"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
