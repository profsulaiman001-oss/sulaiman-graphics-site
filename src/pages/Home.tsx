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

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background z-10 opacity-70"></div>

          <img
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
            className="w-full h-full object-cover"
            alt="hero"
          />
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4">
          <AnimatedSection>
            <h1 className="text-6xl font-black mb-6">
              Sulaiman <span className="text-gradient">Graphics</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Professional graphic and brand designer.
            </p>

            <Link href="/portfolio">
              <Button>
                View My Work <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center gap-8">

          <div>
            <h3 className="text-4xl font-black">2+</h3>
            <p>Years Experience</p>
          </div>

          <div>
            <h3 className="text-4xl font-black">50+</h3>
            <p>Projects Completed</p>
          </div>

          <div>
            <h3 className="text-4xl font-black">50+</h3>
            <p>Happy Clients</p>
          </div>

          <div>
            <h3 className="text-4xl font-black">12</h3>
            <p>Design Awards</p>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">

          <AnimatedSection>
            <img
              src={`${import.meta.env.BASE_URL}images/profile.jpg`}
              className="rounded-3xl"
              alt="profile"
            />
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <h2 className="text-5xl font-black mb-6">
              Hello! I'm Sulaiman Rabiu
            </h2>

            <p className="text-lg text-muted-foreground mb-6">
              Graphic and motion designer creating bold visuals.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div><Palette /> Graphic Design</div>
              <div><Film /> Motion Design</div>
              <div><Layers /> Branding</div>
            </div>
          </AnimatedSection>

        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto">

          <AnimatedSection>
            <h2 className="text-4xl font-black mb-10">Featured Work</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 bg-card">
        <div className="max-w-7xl mx-auto">

          <AnimatedSection>
            <h2 className="text-4xl font-black mb-10">Client Feedback</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials?.map((t) => (
              <div key={t.id}>
                <p>"{t.quote}"</p>
                <h4>{t.author}</h4>
              </div>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
              }
