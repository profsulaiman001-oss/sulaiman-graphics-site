import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import type { Project } from "@/hooks/use-portfolio";

/**
 * Strips a leading slash and prepends BASE_URL so paths work whether
 * the app is served at "/" or a sub-path.
 */
function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const [imgError, setImgError] = useState(false);

  const hasVideo = !!project.video;
  const hasImage = !!project.image && !imgError;
  /* Show gradient if there's neither a video nor a usable image */
  const showGradient = !hasVideo && !hasImage;

  /* Check if this project falls under Flyer Design */
  const isFlyer = project.category === "Flyer Design";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-colors"
    >
      {/* Full-card link sits above everything except the video controls */}
      {!hasVideo && (
        <Link href={`/portfolio/${project.id}`} className="absolute inset-0 z-20">
          <span className="sr-only">View {project.title}</span>
        </Link>
      )}

      {/* ── MEDIA AREA ─────────────────────────────────────────── */}
      {/* Dynamic Aspect Ratio Applied Here: 
          If it's a flyer, it uses aspect-[4/5]. 
          For everything else (Social Media, Product), it uses a clean aspect-square (1:1).
      */}
      <div 
        className={`relative w-full ${
          isFlyer ? "aspect-[4/5]" : "aspect-square"
        } overflow-hidden bg-muted`}
      >

        {/* VIDEO — shown for Motion Graphics when a video path is provided */}
        {/* MODIFIED: Reads direct URL and disables preloading to save bandwidth */}
        {hasVideo && (
          <video
            src={project.video}
            className="w-full h-full object-cover"
            controls
            preload="none"
            poster={project.image ? assetUrl(project.image) : undefined}
          />
        )}

        {/* IMAGE — shown when there's no video but there is an image */}
        {!hasVideo && hasImage && (
          <img
            src={assetUrl(project.image!)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}

        {/* GRADIENT PLACEHOLDER — shown when neither video nor image is available */}
        {showGradient && (
          <div
            className={`w-full h-full bg-gradient-to-br ${project.gradient} flex items-end p-6`}
          >
            {/* Faint watermark title */}
            <span className="font-display font-black text-3xl text-white/20 leading-none select-none">
              {project.title}
            </span>
          </div>
        )}

        {/* "Motion" badge for motion-graphics cards without a video */}
        {!hasVideo && project.category === "Motion Graphics" && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
            <Play size={12} fill="currentColor" />
            Motion
          </div>
        )}

        {/* Hover overlay (only when not video — video has its own controls) */}
        {!hasVideo && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
              <ArrowUpRight size={28} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* ── INFO AREA ──────────────────────────────────────────── */}
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            {project.category}
          </span>
        </div>
        <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>

        {/* Detail link — shown separately when it's a video card */}
        {hasVideo && (
          <Link
            href={`/portfolio/${project.id}`}
            className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-semibold hover:underline"
          >
            View Details <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
    </motion.div>
  );
        }
