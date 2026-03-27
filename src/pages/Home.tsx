import { Link } from "wouter";
import { ArrowRight, Star, Users, CheckCircle, Palette, Film, Layers } from "lucide-react";
import { Button } from "@/components/Button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects, useTestimonials, CATEGORIES } from "@/hooks/use-portfolio";

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: testimonials } = useTestimonials();

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background z-10 opacity-70"></div>

          {/* FIXED IMAGE PATH */}
          <img
            src="/hero-abstract.png"
            alt="Abstract dark geometric shapes"
            className="w-full h-full object-cover"
          />

          {/* Animated decorative blobs */}
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob z-20"></div>
          <div className="absolute top-1/3 -right-64 w-96 h-96 bg-secondary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 z-20"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 z-20"></div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedSection className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-foreground">
                Available for new projects
              </span>
            </div>

            <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tighter leading-[1.1] mb-6 text-foreground">
              Sulaiman <br className="hidden sm:block" />
              <span className="text-gradient">Graphics.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              I am a professional graphic and brand designer focused on creating bold, high-impact visuals that elevate brands and communicate clear, compelling identities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/portfolio">
                <Button size="lg" className="w-full sm:w-auto">
                  View My Work <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                  Get In Touch
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Profile Picture */}
            <AnimatedSection className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 blur-xl opacity-60"></div>

                {/* FIXED IMAGE PATH */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img
                    src="/profile.jpg"
                    alt="Sulaiman Rabiu — Graphic Designer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-5 -right-5 bg-card border border-border rounded-2xl px-5 py-3 shadow-xl">
                  <p className="font-display font-black text-2xl text-primary">2+</p>
                  <p className="text-xs text-muted-foreground font-medium">Years of Experience</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Text content remains unchanged */}
            <AnimatedSection delay={0.15} className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                  About Me
                </p>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground leading-tight mb-6">
                  Hello! I'm{" "}
                  <span className="text-gradient">Sulaiman Rabiu</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm a passionate graphic designer and motion designer. I create bold, colorful designs that capture attention and tell a story.
                </p>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>
    </main>
  );
}
