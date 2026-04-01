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
      <div className="flex items-center gap-3 text-green-400 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4">
        <CheckCircle2 size={20} className="shrink-0" />
        <p className="text-sm font-medium">You're subscribed — thanks! We'll be in touch.</p>
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
                  className="bg-background border-border focus-visible:ring-primary h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          isLoading={subscribeMutation.isPending}
        >
          <Bell size={16} className="mr-2" />
          Subscribe for Updates
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          No spam, ever. Unsubscribe anytime.
        </p>
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
    <main className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <AnimatedSection className="max-w-3xl mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
            Get in Touch
          </span>
          <h1 className="font-display font-black text-5xl sm:text-7xl text-foreground mb-6 leading-none">
            Let's Work <br />
            <span className="text-primary">Together.</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Have a project in mind? Fill out the form and I'll get back to you within 24 hours.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── LEFT: Info + Subscribe ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Contact card */}
            <AnimatedSection delay={0.1} className="bg-card border border-border p-8 rounded-3xl">
              <h3 className="font-bold text-xl text-foreground mb-6">Contact Info</h3>

              <div className="space-y-6">
                {[
                  { icon: Mail,    label: "Email",    value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, accent: "bg-primary/10 text-primary" },
                  { icon: Phone,   label: "Phone",    value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}`,    accent: "bg-secondary/10 text-secondary" },
                  { icon: MapPin,  label: "Location", value: "Nigeria",     href: null,                      accent: "bg-accent/10 text-accent" },
                ].map(({ icon: Icon, label, value, href, accent }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${accent}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-foreground hover:text-primary transition-colors break-all">
                          {value}
                        </a>
                      ) : (
                        <p className="text-foreground">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Socials */}
              <div className="mt-8 pt-8 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Follow on Social
                </h4>
                <div className="flex flex-wrap gap-3">
                  {socials.map(({ icon: Icon, label, href, colorClass }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-foreground transition-all duration-200 ${colorClass}`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Subscribe card */}
            <AnimatedSection delay={0.2} className="bg-card border border-border p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <Bell size={18} className="text-primary" />
                <h3 className="font-bold text-xl text-foreground">Stay Updated</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-5">
                Subscribe to get design tips, project spotlights, and exclusive updates delivered straight to your inbox.
              </p>
              <SubscribeForm />
            </AnimatedSection>

            {/* Map placeholder */}
            <AnimatedSection
              delay={0.25}
              className="w-full h-52 bg-card border border-border rounded-3xl overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')] bg-cover bg-center opacity-20 grayscale transition-all duration-500 group-hover:opacity-40 group-hover:grayscale-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 animate-bounce">
                  <MapPin className="text-primary-foreground" size={20} />
                </div>
                <span className="text-sm font-medium text-foreground/70">Nigeria</span>
              </div>
            </AnimatedSection>
          </div>

          {/* ── RIGHT: Contact form ── */}
          <div className="lg:col-span-7">
            <AnimatedSection delay={0.3} className="bg-card border border-border p-8 md:p-10 rounded-[2.5rem]">

              {sent ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center text-center min-h-[400px] gap-6">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-3xl text-foreground mb-3">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Your message has been delivered to{" "}
                      <span className="text-primary font-medium">{CONTACT_EMAIL}</span>. I'll be in touch within 24 hours.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  <div className="mb-8">
                    <h2 className="font-display font-bold text-3xl text-foreground mb-2">Send a Message</h2>
                    <p className="text-sm text-muted-foreground">
                      All messages go directly to{" "}
                      <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
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
                              <FormLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Your Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="bg-background border-border focus-visible:ring-primary h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  className="bg-background border-border focus-visible:ring-primary h-12"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Subject</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Logo Design Inquiry"
                                className="bg-background border-border focus-visible:ring-primary h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell me about your project — what do you need, timeline, budget, etc."
                                className="bg-background border-border focus-visible:ring-primary min-h-[160px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-2"
                        isLoading={submitMutation.isPending}
                      >
                        <Send size={16} className="mr-2" />
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
