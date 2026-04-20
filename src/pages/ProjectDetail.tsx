import { useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ExternalLink, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/Button";
import { useProject, useProjects } from "@/hooks/use-portfolio";

/* ─── Helpers ────────────────────────────────────────────────── */
function assetUrl(path: string) {
  // Fix: If it's already a full Supabase/HTTP link, don't prepend the base URL 
  if (path.startsWith('http')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

/* ─── Single gallery image with graceful fallback ───────────── */
function GalleryImage({
  src,
  alt,
  gradient,
  index,
  isTallFormat, 
}: {
  src: string;
  alt: string;
  gradient: string;
  index: number;
  isTallFormat: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
      className={`w-full ${
        isTallFormat ? "aspect-[4/5]" : "aspect-square"
      } rounded-2xl overflow-hidden relative group bg-card border border-border`}
    >
      {!failed ? (
        <img
          src={assetUrl(src)}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3`}
        >
          <ImageOff size={32} className="text-white/30" />
          <span className="text-white/30 text-xs font-medium select-none">Image unavailable</span>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Hero Banner ────────────────────────────────────────────── */
function HeroBanner({
  src,
  gradient,
  category,
  title,
  isTallFormat, 
}: {
  src?: string;
  gradient: string;
  category: string;
  title: string;
  isTallFormat: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <AnimatedSection 
      className={`w-full ${
        isTallFormat ? "aspect-[4/5] md:aspect-[3/2]" : "aspect-[21/9]"
      } rounded-[2rem] overflow-hidden relative mb-16`}
    >
      {showImage ? (
        <>
          <img
            src={assetUrl(src!)}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
        <span className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-medium uppercase tracking-wider mb-6">
          {category}
        </span>
        <h1 className="font-display font-black text-5xl md:text-7xl text-white drop-shadow-lg max-w-4xl">
          {title}
        </h1>
      </div>
    </AnimatedSection>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ProjectDetail() {
  const [, params] = useRoute("/portfolio/:id");
  const projectId = params?.id || "";

  const { data: project, isLoading, isError } = useProject(projectId);
  const { data: allProjects } = useProjects();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display font-bold text-4xl mb-4 text-foreground">
          Project Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/portfolio">
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  const currentIndex = allProjects?.findIndex((p) => p.id === project.id) ?? -1;
  const nextProject =
    allProjects && currentIndex !== -1
      ? allProjects[(currentIndex + 1) % allProjects.length]
      : null;

  const isTallFormat = project.category === "Flyer Design" || project.category === "Webinar Design";
  const heroSrc = project.images?.[0] ?? project.image;
  const galleryImages: string[] = project.images ?? (project.image ? [project.image] : []);
  const hasVideo = !!project.video;

  return (
    <main className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/portfolio"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 font-medium"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to projects
        </Link>

        {/* ── Hero Banner ── */}
        <HeroBanner
          src={heroSrc}
          gradient={project.gradient}
          category={project.category}
          title={project.title}
          isTallFormat={isTallFormat} 
        />

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left — description + media */}
          <div className="lg:col-span-8 space-y-12">

            <AnimatedSection delay={0.2}>
              <h2 className="font-display font-bold text-3xl mb-6 text-foreground">
                The Challenge
              </h2>
              <div className="prose prose-lg prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{project.fullDescription}</p>
              </div>
            </AnimatedSection>

            {/* ── Video player (Motion Graphics) ── */}
            {hasVideo && (
              <AnimatedSection delay={0.25}>
                <h2 className="font-display font-bold text-3xl mb-6 text-foreground">
                  Watch the Ad
                </h2>
                <div className="rounded-2xl overflow-hidden border border-border bg-black aspect-video flex items-center justify-center">
                  <video
                    key={project.video}
                    src={assetUrl(project.video)}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={project.image ? assetUrl(project.image) : undefined}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                </div>
              </AnimatedSection>
            )}

            {/* ── Image gallery ── */}
            {galleryImages.length > 0 && (
              <AnimatedSection delay={0.3}>
                <h2 className="font-display font-bold text-3xl mb-6 text-foreground">
                  Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {galleryImages.map((src, i) => (
                    <GalleryImage
                      key={src + i}
                      src={src}
                      alt={`${project.title} — image ${i + 1}`}
                      gradient={project.gradient}
                      index={i}
                      isTallFormat={isTallFormat} 
                    />
                  ))}
                </div>
              </AnimatedSection>
            )}

          </div>

          {/* Right — project meta sidebar */}
          <div className="lg:col-span-4">
            <AnimatedSection
              delay={0.35}
              className="bg-card border border-border rounded-3xl p-8 sticky top-32"
            >
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Client
                  </h4>
                  <p className="text-lg font-medium text-foreground">{project.client}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Category
                  </h4>
                  <p className="text-lg font-medium text-foreground">{project.category}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Tools Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1 bg-background border border-border rounded-lg text-sm text-foreground"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Link href="/contact">
                    <Button className="w-full">
                      Hire Me for Similar Work <ExternalLink size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          </div>

        </div>

        {/* ── Next Project ── */}
        {nextProject && (
          <AnimatedSection delay={0.4} className="mt-32 pt-16 border-t border-border text-center">
            <p className="text-muted-foreground font-medium mb-4 uppercase tracking-widest text-sm">
              Next Project
            </p>
            <Link href={`/portfolio/${nextProject.id}`} className="group inline-block">
              <h2 className="font-display font-black text-4xl sm:text-6xl text-foreground group-hover:text-primary transition-colors">
                {nextProject.title}
              </h2>
              <div className="mt-6 inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-border group-hover:border-primary group-hover:bg-primary text-foreground group-hover:text-primary-foreground transition-all">
                <ArrowLeft size={20} className="rotate-180" />
              </div>
            </Link>
          </AnimatedSection>
        )}

      </div>
    </main>
  );
}
