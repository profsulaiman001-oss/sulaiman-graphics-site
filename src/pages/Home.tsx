import { Link } from "wouter";
import { ArrowRight, Star, Users, CheckCircle, Palette, Film, Layers } from "lucide-react";
import { Button } from "@/components/Button";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects, useTestimonials, CATEGORIES } from "@/hooks/use-portfolio";
import { motion } from "framer-motion";

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: testimonials } = useTestimonials();

  return (
    <main className="w-full bg-black text-gray-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background elements - Upgraded to ultra premium glass & glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/90 z-10"></div>
          <img
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
            alt="Abstract dark geometric shapes"
            className="w-full h-full object-cover opacity-20"
          />
          {/* Animated decorative blobs scaled to create massive depth */}
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full filter blur-[120px] animate-pulse z-20"></div>
          <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-blue-900/20 rounded-full filter blur-[150px] animate-pulse delay-1000 z-20"></div>
          <div className="absolute -bottom-32 left-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full filter blur-[100px] animate-pulse delay-2000 z-20"></div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedSection className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800 backdrop-blur-md mb-6 shadow-2xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">
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
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 shadow-lg shadow-blue-600/20 rounded-xl">
                  View My Work <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-gray-800 hover:border-blue-600 text-white font-medium py-3.5 backdrop-blur-sm rounded-xl transition"
                >
                  Get In Touch
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section - Rebuilt into a premium floating dark bar */}
      <section className="py-12 bg-gray-950 border-y border-gray-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-900">
            {[
              {
                icon: <Star className="text-blue-500 mb-4 w-6 h-6" />,
                num: "2+",
                label: "Years Experience",
              },
              {
                icon: <CheckCircle className="text-blue-500 mb-4 w-6 h-6" />,
                num: "50+",
                label: "Projects Completed",
              },
              {
                icon: <Users className="text-blue-500 mb-4 w-6 h-6" />,
                num: "50+",
                label: "Happy Clients",
              },
              {
                icon: <Star className="text-blue-500 mb-4 w-6 h-6" />,
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
                <h3 className="font-display font-black text-4xl sm:text-5xl text-white mb-1">
                  {stat.num}
                </h3>
                <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Profile Picture — Left */}
            <AnimatedSection className="flex justify-center lg:justify-start">
              <div className="relative group">
                {/* Decorative neon ring behind image */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-600 via-transparent to-blue-800 blur-2xl opacity-40 group-hover:opacity-60 transition duration-700"></div>
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
                  <img
                    src={`${import.meta.env.BASE_URL}images/profile.jpg`}
                    alt="Sulaiman Rabiu — Graphic Designer"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700 object-top"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add(
                          "bg-gradient-to-br",
                          "from-blue-900/40",
                          "via-gray-900",
                          "to-black",
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
                {/* Floating badge */}
                <div className="absolute -bottom-5 -right-5 bg-gray-950 border border-gray-800 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-xl">
                  <p className="font-display font-black text-2xl text-blue-500">2+</p>
                  <p className="text-xs text-gray-500 font-medium tracking-wide">Years Exp.</p>
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

              {/* Services list - Modernized into dark glass cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {[
                  {
                    icon: <Palette className="w-5 h-5 text-blue-500" />,
                    title: "Graphic Design",
                    desc: "Flyers, Logos, Social Media Posts",
                  },
                  {
                    icon: <Film className="w-5 h-5 text-blue-500" />,
                    title: "Motion Design",
                    desc: "Animations, Video Ads, Motion Graphics",
                  },
                  {
                    icon: <Layers className="w-5 h-5 text-blue-500" />,
                    title: "Branding",
                    desc: "Identity systems that last",
                  },
                ].map((service, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 p-5 rounded-2xl bg-gray-950 border border-gray-900 hover:border-blue-600/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.05)] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">
                        {service.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/portfolio">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-medium rounded-xl transition">
                    View My Work <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-800 hover:border-blue-600 text-white rounded-xl transition">
                    Get In Touch
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Work — all projects grouped by category */}
      <section className="py-32 bg-black relative overflow-hidden">
        {/* Glowing aura background for featured work */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full filter blur-[150px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">My Projects</p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
                Featured Work
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl font-light">
                A full showcase of my graphic design, motion graphics, and branding projects — crafted to bring brands to life.
              </p>
            </div>
            <Link href="/portfolio">
              <Button variant="outline" className="shrink-0 border-gray-800 hover:border-blue-600 text-white rounded-xl transition">
                Browse Portfolio <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </AnimatedSection>

          {/* Loading skeletons transformed to dark assets */}
          {projectsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-full aspect-[4/3] rounded-3xl bg-gray-950 animate-pulse border border-gray-900"
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
                  {/* Category label */}
                  <AnimatedSection className="flex items-center gap-4 mb-8">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                      {category}
                    </h3>
                    <div className="flex-1 h-px bg-gray-900" />
                    <span className="text-sm text-gray-600 font-medium">
                      {categoryProjects.length}{" "}
                      {categoryProjects.length === 1 ? "project" : "projects"}
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
      <section className="py-32 bg-gray-950 relative overflow-hidden border-t border-gray-900">
        {/* Massive decorative background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden pointer-events-none opacity-[0.02]">
          <span className="font-display font-black text-[20vw] whitespace-nowrap text-white leading-none">
            FEEDBACK
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">Reviews</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
              Client Feedback
            </h2>
            <p className="text-xl text-gray-500 font-light">
              Don't just take my word for it.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((t, i) => (
              <AnimatedSection key={t.id} delay={i * 0.1}>
                <div className="p-8 rounded-3xl bg-black border border-gray-900 hover:border-blue-600/30 transition-all h-full flex flex-col group">
                  <div className="flex gap-1 text-blue-500 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-300 leading-relaxed font-light mb-8 flex-grow">
                    "{t.quote}"
                  </p>
                  <div className="border-t border-gray-900 pt-5 mt-auto">
                    <h4 className="font-bold text-white group-hover:text-blue-500 transition-colors">{t.author}</h4>
                    <p className="text-sm text-gray-600">{t.role}</p>
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
