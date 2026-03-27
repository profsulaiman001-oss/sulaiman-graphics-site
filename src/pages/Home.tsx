import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/hooks/use-portfolio";

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useProjects();

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background z-10 opacity-70"></div>

          <img
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
            alt="Abstract dark geometric shapes"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedSection className="max-w-4xl">
            <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl mb-6 text-foreground">
              Sulaiman <br className="hidden sm:block" />
              <span className="text-gradient">Graphics.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl">
              I am a professional graphic and brand designer focused on creating bold visuals.
            </p>

            <div className="flex gap-4">
              <Link href="/portfolio">
                <Button size="lg">
                  View My Work <ArrowRight className="ml-2 w-5 h-5" />
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

            {/* Image */}
            <AnimatedSection>
              <img
                src={`${import.meta.env.BASE_URL}images/profile.jpg`}
                alt="Sulaiman Rabiu"
                className="rounded-3xl w-full h-full object-cover"
              />
            </AnimatedSection>

            {/* Text */}
            <AnimatedSection delay={0.15}>
              <h2 className="text-4xl font-bold mb-4">
                Hello! I'm <span className="text-gradient">Sulaiman Rabiu</span>
              </h2>

              <p className="text-muted-foreground mb-6">
                I'm a passionate graphic and motion designer.
              </p>

              {/* Portfolio Preview */}
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  Featured Work
                </h3>

                {projectsLoading && (
                  <p className="text-muted-foreground">Loading projects...</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects?.slice(0, 2).map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} />
                  ))}
                </div>

                <div className="mt-6">
                  <Link href="/portfolio">
                    <Button variant="outline">
                      View Full Portfolio <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

            </AnimatedSection>

          </div>
        </div>
      </section>
    </main>
  );
      }
