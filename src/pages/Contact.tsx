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
    <main className="w-full bg-[#050505] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background - Kept your specific asset but applied the rich dashboard gradient blending */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-[#050505]/80 to-[#050505] z-10"></div>
          <img
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
            alt="Abstract dark geometric shapes"
            className="w-full h-full object-cover"
          />
          {/* Subtle atmospheric glow directly inspired by glowing dashboard metrics */}
          <div className="absolute top-1/4 -left-32 w-80 h-80 bg-blue-600/10 rounded-full filter blur-[100px] z-20"></div>
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-900/15 rounded-full filter blur-[100px] z-20"></div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedSection className="max-w-4xl">
            {/* Pill Badge - Dashboard style */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d0d0d]/80 border border-white/[0.05] backdrop-blur-md mb-6 shadow-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                Available for new projects
              </span>
            </div>

            <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl tracking-tighter leading-[1.05] mb-6 text-white">
              Sulaiman <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Graphics.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-2xl leading-relaxed font-light">
              I am a professional graphic and brand designer focused on creating bold, high-impact visuals that elevate brands and communicate clear, compelling identities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/portfolio">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 shadow-lg shadow-blue-600/20 rounded-xl transition-all duration-300 flex items-center justify-center">
                  View My Work <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-[#0d0d0d]/60 border border-white/[0.05] hover:border-blue-600/50 hover:bg-[#141414] text-white font-semibold py-3.5 backdrop-blur-sm rounded-xl transition-all duration-300"
                >
                  Get In Touch
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section - Re-engineered to feel exactly like a Dashboard Analytic Bar */}
      <section className="py-12 bg-[#090909]/90 border-y border-white/[0.03] backdrop-blur-sm relative shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/[0.05]">
            {[
              {
                icon: <Star className="text-blue-500 mb-4 w-5 h-5" />,
                num: "2+",
                label: "Years Experience",
              },
              {
                icon: <CheckCircle className="text-blue-500 mb-4 w-5 h-5" />,
                num: "50+",
                label: "Projects Completed",
              },
              {
                icon: <Users className="text-blue-500 mb-4 w-5 h-5" />,
                num: "50+",
                label: "Happy Clients",
              },
              {
                icon: <Star className="text-blue-500 mb-4 w-5 h-5" />,
                num: "100%",
                label: "Satisfaction Rate",
              },
            ].map((stat, i) => (
              <AnimatedSection
                key={i}
                delay={i * 0.1}
                className="flex flex-col items-center text-center px-4"
              >
                {stat.icon}
                <h3 className="font-display font-black text-4xl text-white mb-1">
                  {stat.num}
                </h3>
                <p className="text-gray-600 text-xs font-semibold tracking-wider uppercase">
                  {stat.label}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Profile Picture — Dashboard Framed */}
            <AnimatedSection className="flex justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-600/10 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition duration-700"></div>
                
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden border border-white/[0.05] bg-[#0d0d0d] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <img
                    src={`${import.meta.env.BASE_URL}images/profile.jpg`}
                    alt="Sulaiman Rabiu — Graphic Designer"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 object-top"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add(
                          "bg-gradient-to-br",
                          "from-blue-900/40",
                          "via-[#111]",
                          "to-[#050505]",
                          "flex",
                          "items-center",
                          "justify-center"
                        );
                        parent.innerHTML =
                          '<span class="font-display font-black text-6xl text-blue-500/80">SR</span>';
                      }
                    }}
                  />
                </div>
                {/* Micro badge in Dashboard style */}
                <div className="absolute -bottom-4 -right-4 bg-[#0d0d0d]/90 border border-white/[0.05] backdrop-blur-md rounded-xl px-4 py-2 shadow-2xl">
                  <p className="font-display font-black text-xl text-blue-500">2+</p>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Years Exp.</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Text content — Right */}
            <AnimatedSection delay={0.15} className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
                  About Me
                </p>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-white leading-tight mb-6">
                  Hello! I'm{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Sulaiman Rabiu</span>
                </h2>
                <p className="text-lg text-gray-400 font-light leading-relaxed">
                  I'm a passionate graphic designer and motion designer. I create bold, colorful designs that capture attention and tell a story.
                </p>
              </div>

              {/* Services list — Converted to Dashboard Widget grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {[
                  {
                    icon: <Palette className="w-4 h-4 text-blue-500" />,
                    title: "Graphic Design",
                    desc: "Flyers, Logos, Social Posts",
                  },
                  {
                    icon: <Film className="w-4 h-4 text-blue-500" />,
                    title: "Motion Design",
                    desc: "Animations, Video Ads, Graphics",
                  },
                  {
                    icon: <Layers className="w-4 h-4 text-blue-500" />,
                    title: "Branding",
                    desc: "Identity systems that last",
                  },
                ].map((service, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 p-5 rounded-xl bg-[#0d0d0d]/80 border border-white/[0.03] hover:border-blue-600/30 hover:bg-[#141414] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#141414] border border-white/[0.05] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">
                        {service.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-light">
                        {service.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/portfolio">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center">
                    View My Work <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-[#0d0d0d]/60 border border-white/[0.05] hover:border-blue-600 text-white font-semibold rounded-xl transition-all duration-300">
                    Get In Touch
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="py-32 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">My Projects</p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
                Featured Work
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl font-light">
                A full showcase of my graphic design, motion graphics, and branding projects — crafted to bring brands to life.
              </p>
            </div>
            <Link href="/portfolio">
              <Button variant="outline" className="shrink-0 bg-[#0d0d0d]/60 border border-white/[0.05] hover:border-blue-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center">
                Browse Portfolio <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </AnimatedSection>

          {/* Loading skeletons transformed to match Dashboard placeholders */}
          {projectsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-full aspect-[4/3] rounded-xl bg-[#0d0d0d] animate-pulse border border-white/[0.03]"
                />
              ))}
            </div>
          )}

          {/* Projects grouped by category */}
          {!projectsLoading &&
            CATEGORIES.map((category) => {
              const categoryProjects = projects?.filter(
                (p) => p.category === category
              );
              if (!categoryProjects?.length) return null;
              return (
                <div key={category} className="mb-24 last:mb-0">
                  {/* Category label - Dashboard styled separation line */}
                  <AnimatedSection className="flex items-center gap-4 mb-8">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                      {category}
                    </h3>
                    <div className="flex-1 h-px bg-white/[0.03]" />
                    <span className="text-xs text-gray-700 font-semibold uppercase tracking-wider">
                      {categoryProjects.length}{" "}
                      {categoryProjects.length === 1 ? "item" : "items"}
                    </span>
                  </AnimatedSection>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryProjects.map((project, i) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#090909]/60 backdrop-blur-sm relative overflow-hidden border-t border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">Reviews</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
              Client Feedback
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Don't just take my word for it.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((t, i) => (
              <AnimatedSection key={t.id} delay={i * 0.1}>
                <div className="p-8 rounded-xl bg-[#0d0d0d]/80 border border-white/[0.03] hover:border-blue-600/30 transition-all duration-500 h-full flex flex-col group cursor-pointer">
                  <div className="flex gap-1 text-blue-500 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-400 leading-relaxed font-light mb-8 flex-grow">
                    "{t.quote}"
                  </p>
                  <div className="border-t border-white/[0.03] pt-5 mt-auto">
                    <h4 className="font-bold text-white group-hover:text-blue-500 transition-colors duration-300">{t.author}</h4>
                    <p className="text-xs text-gray-700 font-semibold tracking-wide uppercase mt-0.5">{t.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
                    }
