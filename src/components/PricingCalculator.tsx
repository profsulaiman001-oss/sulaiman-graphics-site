import { useState } from "react";
import { Link } from "wouter";
import { Check, ArrowRight, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/Button";

const services = [
  {
    id: "logo",
    name: "Logo Design",
    description: "Custom logo concept with color palette",
    basePrice: 15000,
  },
  {
    id: "brand",
    name: "Brand Identity Design",
    description: "Full brand guidelines, variations, and icons",
    basePrice: 40000,
  },
  {
    id: "flyer",
    name: "Flyer Design",
    description: "Single flyer with custom layout and typography",
    basePrice: 10000,
  },
  {
    id: "social",
    name: "Social Media Design",
    description: "Branded post design (Discount at 5+ posts)",
    basePrice: 5000,
  },
  {
    id: "motion",
    name: "Motion Graphics",
    description: "15-30s animated video or promo ad",
    basePrice: 25000,
  },
];

export function PricingCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
      if (!quantities[id]) {
        setQuantities({ ...quantities, [id]: 1 });
      }
    }
  };

  const updateQuantity = (id: string, amount: number) => {
    const current = quantities[id] || 1;
    const next = Math.max(1, current + amount);
    setQuantities({ ...quantities, [id]: next });
  };

  // Advanced calculation with your 5 posts for ₦20,000 discount rule
  const calculateTotal = () => {
    return selectedServices.reduce((acc, id) => {
      const service = services.find((s) => s.id === id);
      const qty = quantities[id] || 1;
      
      if (!service) return acc;

      if (id === "social") {
        const discountedSets = Math.floor(qty / 5);
        const remainingSingles = qty % 5;
        const socialTotal = (discountedSets * 20000) + (remainingSingles * 5000);
        return acc + socialTotal;
      }

      return acc + (service.basePrice * qty);
    }, 0);
  };

  const total = calculateTotal();

  return (
    <div className="w-full bg-[#0d0d0d]/80 backdrop-blur-md border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* ── LEFT: Selector Area ── */}
        <div className="lg:col-span-8 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
              Quote Builder
            </span>
            <h3 className="font-display font-bold text-3xl text-foreground mb-2">
              Estimate Your Project
            </h3>
            <p className="text-muted-foreground font-light text-sm">
              Select the assets you need and adjust quantities to see an estimated total.
            </p>
          </div>

          <div className="space-y-4">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const qty = quantities[service.id] || 1;

              return (
                <div
                  key={service.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 gap-4 cursor-pointer ${
                    isSelected
                      ? "bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                      : "bg-[#050505] border-border hover:border-white/[0.1]"
                  }`}
                  onClick={() => toggleService(service.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? "bg-primary border-primary text-white" : "border-border text-transparent"
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{service.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-semibold text-foreground">
                      ₦{service.basePrice.toLocaleString()} {service.id === "social" ? <span className="text-muted-foreground font-normal text-xs">/post</span> : ""}
                    </span>

                    {isSelected && (
                      <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                          onClick={() => updateQuantity(service.id, -1)}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-foreground">
                          {qty}
                        </span>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                          onClick={() => updateQuantity(service.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Summary Checkout Area ── */}
        <div className="lg:col-span-4 bg-[#050505]/50 border-t lg:border-t-0 lg:border-l border-border p-6 md:p-8 flex flex-col justify-between relative">
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart size={16} className="text-primary" />
              <h4 className="font-display font-bold text-lg text-foreground">Summary</h4>
            </div>

            {selectedServices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm font-light">
                No services selected.
              </div>
            )}

            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {selectedServices.map((id) => {
                  const s = services.find((srv) => srv.id === id);
                  const qty = quantities[id] || 1;
                  if (!s) return null;

                  let cost = s.basePrice * qty;
                  if (id === "social") {
                    const discountedSets = Math.floor(qty / 5);
                    const remainingSingles = qty % 5;
                    cost = (discountedSets * 20000) + (remainingSingles * 5000);
                  }

                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground font-light">
                        {s.name} <span className="text-muted-foreground/60">× {qty}</span>
                      </span>
                      <span className="text-foreground font-medium">₦{cost.toLocaleString()}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative z-10 border-t border-border pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <motion.span 
                key={total}
                initial={{ scale: 1.1, color: "#3b82f6" }}
                animate={{ scale: 1, color: "#ffffff" }}
                className="text-2xl font-display font-black"
              >
                ₦{total.toLocaleString()}
              </motion.span>
            </div>

            <Link href={`/contact?subject=Custom Package Quote&total=${total}`}>
              <Button 
                className="w-full"
                disabled={total === 0}
              >
                Request Quote
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
            
            <p className="text-[10px] text-muted-foreground text-center mt-3 font-light leading-relaxed">
              *Final pricing may vary depending on project complexity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
    }
