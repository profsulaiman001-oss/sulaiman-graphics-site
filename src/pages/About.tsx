import { ArrowDown, Award, Briefcase, GraduationCap } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/Button";
import { Link } from "wouter";

export default function About() {
  const skills = [
    { name: "Brand Identity", progress: 95 },
    { name: "UI/UX Design", progress: 90 },
    { name: "Motion Graphics", progress: 85 },
    { name: "Typography", progress: 92 },
    { name: "Packaging", progress: 80 },
    { name: "3D Illustration", progress: 75 },
  ];

  const timeline = [
    { year: "2021 - Present", role: "Design Director", company: "Neon Creative Agency", desc: "Leading a team of 5 designers creating global campaigns." },
    { year: "2018 - 2021", role: "Senior Visual Designer", company: "TechNova Inc.", desc: "Spearheaded the rebrand and digital product design overhaul." },
    { year: "2015 - 2018", role: "Graphic Designer", company: "Studio Minimal", desc: "Focus on editorial design, typography, and print layouts." },
  ];

  return (
    <main className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32 items-center">
          <AnimatedSection className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-border/50 bg-card p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 mix-blend-overlay"></div>
              <img 
                src={`${import.meta.env.BASE_URL}images/avatar.png`} 
                alt="Sulaiman Graphics - Profile" 
                className="w-full h-full object-cover rounded-[2.5rem]"
              />
            </div>
            {/* Decorative floaters */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 blur-2xl rounded-full"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 blur-2xl rounded-full"></div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2} className="lg:col-span-7 order-1 lg:order-2">
            <h1 className="font-display font-black text-5xl sm:text-6xl text-foreground mb-6">
              Hi, I'm Sulaiman. <br/>
              A visual storyteller.
            </h1>
            <div className="prose prose-lg prose-invert text-muted-foreground mb-8">
              <p>
                I am a passionate graphic designer with 8+ years of experience crafting visual identities, digital campaigns, and motion graphics that tell compelling brand stories.
              </p>
              <p>
                My approach blends strategic thinking with bold, expressive aesthetics. I believe that good design should not only look beautiful but also solve real business problems and create meaningful connections with audiences.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/contact"><Button>Hire Me</Button></Link>
              <Button variant="outline" onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>
                <ArrowDown size={18} className="mr-2" /> Read More
              </Button>
            </div>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Skills */}
          <AnimatedSection>
            <h3 className="font-display font-bold text-3xl text-foreground mb-8 flex items-center gap-3">
              <Award className="text-primary" /> Core Expertise
            </h3>
            <div className="space-y-6">
              {skills.map((skill, i) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-foreground">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-card rounded-full overflow-hidden border border-border">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.1 * i, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Experience */}
          <AnimatedSection delay={0.2}>
            <h3 className="font-display font-bold text-3xl text-foreground mb-8 flex items-center gap-3">
              <Briefcase className="text-secondary" /> Experience
            </h3>
            <div className="space-y-10 pl-4 border-l-2 border-border/50">
              {timeline.map((item, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute -left-[21px] top-1 h-10 w-10 rounded-full bg-background border-4 border-card flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  </div>
                  <span className="text-sm font-bold tracking-wider text-primary mb-1 block">{item.year}</span>
                  <h4 className="text-xl font-bold text-foreground">{item.role}</h4>
                  <span className="text-muted-foreground font-medium mb-3 block">{item.company}</span>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

      </div>
    </main>
  );
}
