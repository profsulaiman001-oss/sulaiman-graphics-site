import { CheckCircle2, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/Button";
import { Link } from "wouter";

/* ── Service pricing data ──────────────────────────────────────── */
const services = [
  {
    id: "logo",
    title: "Logo Design",
    price: "₦15,000",
    priceSub: "per logo",
    gradient: "from-blue-600/20 to-cyan-500/10",
    accent: "text-blue-400",
    ring: "border-blue-500/30",
    featured: false,
    features: [
      "Custom Logo Concept",
      "Colour Palette & Typography Suggestions",
      "2 Revisions",
    ],
  },
  {
    id: "brand",
    title: "Brand Identity Design",
    price: "₦40,000",
    priceSub: "complete package",
    gradient: "from-indigo-600/30 to-blue-500/20",
    accent: "text-indigo-400",
    ring: "border-indigo-500/60",
    featured: true,
    features: [
      "Full Brand Guidelines",
      "Logo Variations",
      "Colour Palette & Typography",
      "Brand Voice & Visual Identity",
      "Custom Icons & Graphics",
      "3 Revisions",
    ],
  },
  {
    id: "flyer",
    title: "Flyer Design",
    price: "₦10,000",
    priceSub: "per flyer",
    gradient: "from-sky-600/20 to-blue-500/10",
    accent: "text-sky-400",
    ring: "border-sky-500/30",
    featured: false,
    features: [
      "Single Flyer Design",
      "Custom Layout & Typography",
      "High-Quality Images & Graphics",
      "2 Revisions",
    ],
  },
  {
    id: "social",
    title: "Social Media Design",
    price: "₦5,000",
    priceSub: "per post · or ₦20,000 for 5 posts",
    gradient: "from-cyan-600/20 to-teal-500/10",
    accent: "text-cyan-400",
    ring: "border-cyan-500/30",
    featured: false,
    features: [
      "Branded Post Design for Instagram, Facebook, X",
      "Custom Graphics & Typography",
      "2 Revisions per Post",
    ],
  },
  {
    id: "motion",
    title: "Motion Graphics",
    price: "₦25,000",
    priceSub: "15–30s · ₦40,000 for 30–60s",
    gradient: "from-blue-700/30 to-indigo-600/20",
    accent: "text-blue-300",
    ring: "border-blue-500/30",
    featured: false,
    features: [
      "Animated Video or Promo Ad",
      "Branded Visuals & Typography",
      "Sound / Music",
      "2 Revisions",
    ],
  },
];

/* ── Process steps ─────────────────────────────────────────────── */
const process = [
  { step: "01", title: "Brief",    desc: "We discuss your goals, brand, target audience, and timeline." },
  { step: "02", title: "Concept",  desc: "I develop initial concepts and share a creative direction." },
  { step: "03", title: "Design",   desc: "Crafting the final visuals with your feedback at every stage." },
  { step: "04", title: "Delivery", desc: "Final files handed over in all required formats, print-ready." },
];

export default function Services() {
  return (
    <main className="pt-32 pb-28 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
            Services & Pricing
          </span>
          <h1 className="font-display font-black text-5xl sm:text-6xl text-foreground mb-5">
            What I Offer
          </h1>
          <p className="text-lg text-muted-foreground">
            Transparent, fixed pricing for every service — no hidden fees. Get exactly what your brand needs.
          </p>
        </AnimatedSection>

        {/* ── Pricing Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {services.map((svc, i) => (
            <AnimatedSection key={svc.id} delay={i * 0.07}>
              <div
                className={`relative h-full flex flex-col rounded-3xl border bg-gradient-to-br ${svc.gradient} ${svc.ring} p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 ${
                  svc.featured ? "ring-2 ring-indigo-500/60 shadow-xl shadow-indigo-500/10" : ""
                }`}
              >
                {svc.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-1.5 rounded-full shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {/* Title + Price */}
                <div className="mb-6">
                  <h3 className={`font-display font-black text-2xl mb-3 ${svc.featured ? "text-foreground" : "text-foreground/90"}`}>
                    {svc.title}
                  </h3>
                  <div className="flex items-end gap-2 flex-wrap">
                    <span className={`font-display font-black text-4xl leading-none ${svc.accent}`}>
                      {svc.price}
                    </span>
                  </div>
                  {svc.priceSub && (
                    <p className="text-muted-foreground text-sm mt-1.5">{svc.priceSub}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mb-6" />

                {/* Features */}
                <ul className="space-y-3 flex-grow mb-8">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <CheckCircle2 size={16} className={`${svc.accent} shrink-0 mt-0.5`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/contact">
                  <Button
                    className="w-full"
                    variant={svc.featured ? "default" : "outline"}
                  >
                    Get Started <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* ── Process ── */}
        <AnimatedSection className="mb-20">
          <h2 className="font-display font-black text-4xl text-center text-foreground mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p, i) => (
              <div
                key={p.step}
                className="bg-card border border-border rounded-2xl p-7 hover:border-primary/40 transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 text-7xl font-black text-primary/5 select-none leading-none pr-3 pt-2 group-hover:text-primary/10 transition-colors">
                  {p.step}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mb-4">
                  {i + 1}
                </div>
                <h4 className="font-display font-bold text-xl text-foreground mb-2">{p.title}</h4>
                <p className="text-muted-foreground text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ── CTA Banner ── */}
        <AnimatedSection>
          <div className="bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30 rounded-[2.5rem] p-10 md:p-16 text-center">
            <h2 className="font-display font-black text-4xl md:text-5xl text-foreground mb-4">
              Ready to elevate your brand?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Let's discuss your project and build something great together. No obligation, just a conversation.
            </p>
            <Link href="/contact">
              <Button size="lg">
                Start a Project <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>

      </div>
    </main>
  );
}
