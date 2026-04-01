import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  MapPin,
  Phone,
  Instagram,
  Twitter,
  CheckCircle2,
  Send,
  Bell,
} from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/Button";
import { useSubmitContact, useSubscribe } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ── Schemas ───────────────────────────────────────────────────── */
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ContactValues = z.infer<typeof contactSchema>;
type SubscribeValues = z.infer<typeof subscribeSchema>;

/* ── Constants ─────────────────────────────────────────────────── */
const CONTACT_EMAIL = "profsulaiman001@gmail.com";
const CONTACT_PHONE = "+2349060410369";

// Custom SVG icon component for WhatsApp since Lucide doesn't have it natively
const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/profsulaiman001",
    colorClass: "hover:bg-pink-500 hover:border-pink-500 hover:text-white",
  },
  {
    icon: Twitter,
    label: "X (Twitter)",
    href: "https://x.com/profsulaiman001",
    colorClass: "hover:bg-sky-400 hover:border-sky-400 hover:text-white",
  },
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    href: "https://wa.me/2349060410369?text=Hello%20Sulaiman%20Graphics",
    colorClass: "hover:bg-green-500 hover:border-green-500 hover:text-white",
  },
];

/* ── Subscribe Form ────────────────────────────────────────────── */
function SubscribeForm() {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);
  const subscribeMutation = useSubscribe();

  const form = useForm<SubscribeValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: SubscribeValues) => {
    subscribeMutation.mutate(data.email, {
      onSuccess: () => {
        setSubscribed(true);
        toast({
          title: "You're subscribed!",
          description: "You'll receive design updates and news from Sulaiman Graphics.",
        });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Subscription failed",
          description: err.message || "Please try again.",
        });
      },
    });
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-3 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
        <CheckCircle2 size={16} className="shrink-0" />
        <p className="text-sm font-medium">You're subscribed! We'll be in touch.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-[#141414] border-white/[0.05] focus:border-blue-600/50 text-white focus-visible:ring-0 h-11 rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-11 transition-all duration-300 flex items-center justify-center"
          isLoading={subscribeMutation.isPending}
        >
          <Bell size={14} className="mr-2" />
          Subscribe for Updates
        </Button>
      </form>
    </Form>
  );
}

/* ── Main Contact Page ─────────────────────────────────────────── */
export default function Contact() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const submitMutation = useSubmitContact();

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (data: ContactValues) => {
    submitMutation.mutate(data, {
      onSuccess: () => {
        setSent(true);
        form.reset();
        toast({
          title: "Message sent!",
          description: "I'll get back to you as soon as possible.",
        });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Send failed",
          description: err.message || "Something went wrong. Please try again.",
        });
      },
    });
  };

  return (
    <main className="pt-32 pb-24 min-h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Subtle atmospheric glow directly inspired by glowing dashboard metrics */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full filter blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full filter blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Hero ── */}
        <AnimatedSection className="max-w-3xl mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-500 mb-4">
            Get in Touch
          </span>
          <h1 className="font-display font-black text-6xl sm:text-7xl text-white mb-6 leading-none">
            Let's Work <br />
            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Together.</span>
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl leading-relaxed">
            Have a project in mind? Fill out the form below or reach out via my socials, and let's create something extraordinary.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── LEFT: Info + Subscribe ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Contact card - Dashboard Widget Style */}
            <AnimatedSection delay={0.1} className="bg-[#0d0d0d]/80 backdrop-blur-sm border border-white/[0.05] p-6 rounded-xl shadow-2xl">
              <h3 className="font-bold text-lg text-white mb-6">Contact Info</h3>

              <div className="space-y-5">
                {[
                  { icon: Mail,    label: "Email",    value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, accent: "bg-[#141414] border-white/[0.05] text-blue-500" },
                  { icon: Phone,   label: "Phone",    value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}`,    accent: "bg-[#141414] border-white/[0.05] text-blue-500" },
                  { icon: MapPin,  label: "Location", value: "Nigeria",     href: null,                      accent: "bg-[#141414] border-white/[0.05] text-blue-500" },
                ].map(({ icon: Icon, label, value, href, accent }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${accent}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-white hover:text-blue-500 font-light text-sm transition-colors break-all">
                          {value}
                        </a>
                      ) : (
                        <p className="text-white font-light text-sm">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Socials */}
              <div className="mt-6 pt-6 border-t border-white/[0.03]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-4">
                  Connect on Socials
                </h4>
                <div className="flex flex-wrap gap-3">
                  {socials.map(({ icon: Icon, label, href, colorClass }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141414] border border-white/[0.03] text-white hover:shadow-lg transition-all duration-300 ${colorClass}`}
                    >
                      <Icon size={12} />
                      <span className="text-xs font-medium">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Subscribe card - Dashboard Widget Style */}
            <AnimatedSection delay={0.2} className="bg-[#0d0d0d]/80 backdrop-blur-sm border border-white/[0.05] p-6 rounded-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Bell size={16} className="text-blue-500" />
                <h3 className="font-bold text-lg text-white">Stay Updated</h3>
              </div>
              <p className="text-gray-500 text-xs font-light mb-4 leading-relaxed">
                Subscribe to get design tips, project spotlights, and exclusive updates delivered straight to your inbox.
              </p>
              <SubscribeForm />
            </AnimatedSection>

            {/* Decorative dashboard callout box */}
            <AnimatedSection
              delay={0.25}
              className="w-full p-6 bg-[#0d0d0d]/40 backdrop-blur-sm border border-white/[0.03] rounded-xl overflow-hidden relative group"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full filter blur-2xl group-hover:bg-blue-600/20 transition-all duration-500"></div>
              <h4 className="font-display font-black text-xl text-white mb-1.5 relative z-10">Available Worldwide</h4>
              <p className="text-xs text-gray-600 font-light leading-relaxed relative z-10">
                Operating remotely from Nigeria but helping clients across the globe scale their visuals and brand footprint.
              </p>
            </AnimatedSection>
          </div>

          {/* ── RIGHT: Contact form ── */}
          <div className="lg:col-span-7">
            <AnimatedSection delay={0.3} className="bg-[#0d0d0d]/80 backdrop-blur-sm border border-white/[0.05] p-8 md:p-10 rounded-xl shadow-2xl">

              {sent ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center text-center min-h-[400px] gap-6">
                  <div className="w-16 h-16 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm font-light mx-auto leading-relaxed">
                      Your message has been delivered to{" "}
                      <span className="text-blue-500 font-medium">{CONTACT_EMAIL}</span>. I'll be in touch within 24 hours.
                    </p>
                  </div>
                  <Button variant="outline" className="border-white/[0.05] hover:border-blue-600 text-white rounded-xl h-11" onClick={() => setSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  <div className="mb-8">
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Send a Message</h2>
                    <p className="text-xs text-gray-700 font-semibold uppercase tracking-wider">
                      All messages go directly to{" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-500 hover:underline">
                        {CONTACT_EMAIL}
                      </a>
                    </p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Your Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="bg-[#141414] border-white/[0.05] focus:border-blue-600/50 text-white focus-visible:ring-0 h-11 rounded-xl"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  className="bg-[#141414] border-white/[0.05] focus:border-blue-600/50 text-white focus-visible:ring-0 h-11 rounded-xl"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Inquiry about Motion Design"
                                className="bg-[#141414] border-white/[0.05] focus:border-blue-600/50 text-white focus-visible:ring-0 h-11 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell me about your project — timeline, goals, deliverables..."
                                className="bg-[#141414] border-white/[0.05] focus:border-blue-600/50 text-white focus-visible:ring-0 min-h-[140px] resize-y rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-11 transition-all duration-300 flex items-center justify-center"
                        isLoading={submitMutation.isPending}
                      >
                        <Send size={14} className="mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </AnimatedSection>
          </div>
        </div>
      </div>
    </main>
  );
        }
