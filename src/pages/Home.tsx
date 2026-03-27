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
{/* Hero Section /}
<section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
{/ Background elements /}
<div className="absolute inset-0 z-0">
<div className="absolute inset-0 bg-background z-10 opacity-70"></div>
<img
src={${import.meta.env.BASE_URL}images/hero-abstract.png}
alt="Abstract dark geometric shapes"
className="w-full h-full object-cover"
/>
{/ Animated decorative blobs */}
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
            <Button  
              size="lg"  
              variant="outline"  
              className="w-full sm:w-auto bg-background/50 backdrop-blur-sm"  
            >  
              Get In Touch  
            </Button>  
          </Link>  
        </div>  
      </AnimatedSection>  
    </div>  
  </section>  

  {/* Stats Section */}  
  <section className="py-20 bg-card border-y border-border">  
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50">  
        {[  
          {  
            icon: <Star className="text-primary mb-4 w-8 h-8" />,  
            num: "2+",  
            label: "Years Experience",  
          },  
          {  
            icon: <CheckCircle className="text-secondary mb-4 w-8 h-8" />,  
            num: "50+",  
            label: "Projects Completed",  
          },  
          {  
            icon: <Users className="text-accent mb-4 w-8 h-8" />,  
            num: "50+",  
            label: "Happy Clients",  
          },  
          {  
            icon: <Star className="text-primary mb-4 w-8 h-8" />,  
            num: "12",  
            label: "Design Awards",  
          },  
        ].map((stat, i) => (  
          <AnimatedSection  
            key={i}  
            delay={i * 0.1}  
            className="flex flex-col items-center text-center px-4"  
          >  
            {stat.icon}  
            <h3 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-2">  
              {stat.num}  
            </h3>  
            <p className="text-muted-foreground font-medium">  
              {stat.label}  
            </p>  
          </AnimatedSection>  
        ))}  
      </div>  
    </div>  
  </section>  

  {/* About Section */}  
  <section id="about" className="py-32">  
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">  

        {/* Profile Picture — Left */}  
        <AnimatedSection className="flex justify-center lg:justify-start">  
          <div className="relative">  
            {/* Decorative ring behind image */}  
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 blur-xl opacity-60"></div>  
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">  
              <img  
                src={`${import.meta.env.BASE_URL}images/profile.jpg`}  
                alt="Sulaiman Rabiu — Graphic Designer"  
                className="w-full h-full object-cover"  
                onError={(e) => {  
                  const target = e.currentTarget;  
                  target.style.display = "none";  
                  const parent = target.parentElement;  
                  if (parent) {  
                    parent.classList.add(  
                      "bg-gradient-to-br",  
                      "from-primary/40",  
                      "via-secondary/30",  
                      "to-accent/40",  
                      "flex",  
                      "items-center",  
                      "justify-center"  
                    );  
                    parent.innerHTML =  
                      '<span class="font-display font-black text-6xl text-white/80">SR</span>';  
                  }  
                }}  
              />  
            </div>  
            {/* Floating badge */}  
            <div className="absolute -bottom-5 -right-5 bg-card border border-border rounded-2xl px-5 py-3 shadow-xl">  
              <p className="font-display font-black text-2xl text-primary">2+</p>  
              <p className="text-xs text-muted-foreground font-medium">Years of Experience</p>  
            </div>  
          </div>  
        </AnimatedSection>  

        {/* Text content — Right */}  
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

          {/* Services list */}  
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">  
            {[  
              {  
                icon: <Palette className="w-6 h-6 text-primary" />,  
                title: "Graphic Design",  
                desc: "Flyers, Logos, Social Media Posts",  
              },  
              {  
                icon: <Film className="w-6 h-6 text-secondary" />,  
                title: "Motion Design",  
                desc: "Animations, Video Ads, Motion Graphics",  
              },  
              {  
                icon: <Layers className="w-6 h-6 text-accent" />,  
                title: "Branding",  
                desc: "Identity systems that last",  
              },  
            ].map((service, i) => (  
              <div  
                key={i}  
                className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors"  
              >  
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">  
                  {service.icon}  
                </div>  
                <div>  
                  <h4 className="font-bold text-foreground text-sm mb-1">  
                    {service.title}  
                  </h4>  
                  <p className="text-xs text-muted-foreground leading-relaxed">  
                    {service.desc}  
                  </p>  
                </div>  
              </div>  
            ))}  
          </div>  

          <div className="flex flex-col sm:flex-row gap-4 mt-2">  
            <Link href="/portfolio">  
              <Button size="lg" className="w-full sm:w-auto">  
                View My Work <ArrowRight className="ml-2 w-5 h-5" />  
              </Button>  
            </Link>  
            <Link href="/contact">  
              <Button size="lg" variant="outline" className="w-full sm:w-auto">  
                Get In Touch  
              </Button>  
            </Link>  
          </div>  
        </AnimatedSection>  
      </div>  
    </div>  
  </section>  

  {/* Featured Work — all projects grouped by category */}  
  <section className="py-32">  
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
      {/* Section header */}  
      <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">  
        <div>  
          <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">  
            Featured Work  
          </h2>  
          <p className="text-xl text-muted-foreground max-w-2xl">  
            A full showcase of my graphic design, motion graphics, and branding projects — crafted to bring brands to life.  
          </p>  
        </div>  
        <Link href="/portfolio">  
          <Button variant="outline" className="shrink-0">  
            Browse Portfolio <ArrowRight className="ml-2 w-4 h-4" />  
          </Button>  
        </Link>  
      </AnimatedSection>  

      {/* Loading skeletons */}  
      {projectsLoading && (  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">  
          {[1, 2, 3, 4, 5, 6].map((i) => (  
            <div  
              key={i}  
              className="w-full aspect-[4/3] rounded-3xl bg-card animate-pulse border border-border"  
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
            <div key={category} className="mb-20 last:mb-0">  
              {/* Category label */}  
              <AnimatedSection className="flex items-center gap-4 mb-8">  
                <h3 className="font-display font-black text-2xl sm:text-3xl text-foreground">  
                  {category}  
                </h3>  
                <div className="flex-1 h-px bg-border" />  
                <span className="text-sm text-muted-foreground font-medium">  
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
  <section className="py-32 bg-card relative overflow-hidden border-t border-border">  
    {/* Decorative background text */}  
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden pointer-events-none opacity-5">  
      <span className="font-display font-black text-[20vw] whitespace-nowrap text-foreground leading-none">  
        TESTIMONIALS  
      </span>  
    </div>  

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">  
      <AnimatedSection className="text-center mb-20">  
        <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">  
          Client Feedback  
        </h2>  
        <p className="text-xl text-muted-foreground">  
          Don't just take my word for it.  
        </p>  
      </AnimatedSection>  

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">  
        {testimonials?.map((t, i) => (  
          <AnimatedSection key={t.id} delay={i * 0.1}>  
            <div className="p-8 rounded-3xl bg-background border border-border h-full flex flex-col">  
              <div className="flex gap-1 text-primary mb-6">  
                {[1, 2, 3, 4, 5].map((star) => (  
                  <Star key={star} size={20} fill="currentColor" />  
                ))}  
              </div>  
              <p className="text-lg text-foreground leading-relaxed mb-8 flex-grow">  
                "{t.quote}"  
              </p>  
              <div>  
                <h4 className="font-bold text-foreground">{t.author}</h4>  
                <p className="text-sm text-muted-foreground">{t.role}</p>  
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
