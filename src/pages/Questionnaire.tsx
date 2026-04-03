import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from " f|ramer-motion";
import { ArrowLeft, ArrowRight, Send, CheckCircle, Loader2, ClipboardList } from "lucide-react";

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

  // PREVENT ENTER KEY AUTO-SUBMIT
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && step < 4) {
      e.preventDefault();
      // If valid, move them to the next step on enter
      const isStep1Valid = step === 1 && formData.client_name && formData.client_email;
      const isStep2Valid = step === 2 && formData.project_type && formData.project_goal;
      
      if (step === 1 && isStep1Valid) nextStep();
      if (step === 2 && isStep2Valid) nextStep();
      if (step === 3) nextStep();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("project_questionnaires") // Keeping this as your database table
        .insert([formData]);

      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      alert("Failed to submit questionnaire: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <motion.div 
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-display font-black mb-2">Awesome! Received.</h2>
          <p className="text-muted-foreground mb-6">Thank you for taking the time to fill this out. I'll review your details and get back to you shortly!</p>
          <button 
            onClick={() => setLocation("/")}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <h1 className="font-display font-black text-lg tracking-tighter text-foreground">
             SULAIMAN <span className="text-primary">GRAPHICS</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <form 
            onSubmit={handleSubmit} 
            onKeyDown={handleKeyDown} 
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl"
          >
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <ClipboardList size={20} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">Let's get to know you</h2>
                    <p className="text-sm text-muted-foreground">Please provide your basic contact details.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.client_name}
                        onChange={(e) => updateField("client_name", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Your Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.client_email}
                        onChange={(e) => updateField("client_email", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Business/Company Name</label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => updateField("business_name", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="Acme Inc. (Optional)"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Project Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1">Project Details</h2>
                    <p className="text-sm text-muted-foreground">Tell me about what we are building or designing.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Project Type *</label>
                      <select
                        required
                        value={formData.project_type}
                        onChange={(e) => updateField("project_type", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                      >
                        <option value="">Select a type...</option>
                        <option value="Logo Design">Logo & Brand Identity</option>
                        <option value="Social Media Graphics">Social Media Graphics</option>
                        <option value="Print Design">Print Design (Flyer, Banner, etc.)</option>
                        <option value="Web Design">Website Design</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">What is the main goal of this project? *</label>
                      <textarea
                        required
                        value={formData.project_goal}
                        onChange={(e) => updateField("project_goal", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition resize-none"
                        rows={3}
                        placeholder="Ex: I need a modern logo to attract younger customers to my new cafe."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Who is your target audience?</label>
                      <input
                        type="text"
                        value={formData.target_audience}
                        onChange={(e) => updateField("target_audience", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="Ex: Small business owners aged 25-40"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Style & Direction */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1">Visual Style</h2>
                    <p className="text-sm text-muted-foreground">Help me understand your aesthetic tastes.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Preferred Colors</label>
                      <input
                        type="text"
                        value={formData.brand_colors}
                        onChange={(e) => updateField("brand_colors", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="Ex: Minimalist black and gold, or ocean blue."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Design Style Keywords</label>
                      <input
                        type="text"
                        value={formData.design_style}
                        onChange={(e) => updateField("design_style", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="Ex: Bold, Corporate, Playful, Luxury"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Inspiration Links</label>
                      <textarea
                        value={formData.reference_links}
                        onChange={(e) => updateField("reference_links", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition resize-none"
                        rows={2}
                        placeholder="Drop links to Pinterest, Behance or websites you love."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Budget & Logistics */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1">Logistics & Submission</h2>
                    <p className="text-sm text-muted-foreground">Almost done! Just a few final details.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Budget Range</label>
                      <input
                        type="text"
                        value={formData.budget_range}
                        onChange={(e) => updateField("budget_range", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="Ex: $500 - $1,000"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Desired Deadline</label>
                      <input
                        type="text"
                        value={formData.deadline}
                        onChange={(e) => updateField("deadline", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition"
                        placeholder="Ex: End of this month"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-semibold uppercase mb-1 block">Anything else I should know?</label>
                      <textarea
                        value={formData.additional_notes}
                        onChange={(e) => updateField("additional_notes", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition resize-none"
                        rows={3}
                        placeholder="Any extra details or questions..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-border flex justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 bg-background border border-border rounded-xl text-sm font-medium hover:bg-muted transition flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!formData.client_name || !formData.client_email)) ||
                    (step === 2 && (!formData.project_type || !formData.project_goal))
                  }
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? "Submitting..." : "Submit Project"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
