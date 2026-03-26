import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/hooks/use-portfolio";

const filters = ["All", "Branding", "Flyer Design", "Motion Graphics", "Social Media Design", "Product Design", "Webinar Design"];

export default function Portfolio() {
  const { data: projects, isLoading } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = projects?.filter(p => 
    activeFilter === "All" ? true : p.category === activeFilter
  ) || [];

  return (
    <main className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <AnimatedSection className="max-w-3xl mb-16">
          <h1 className="font-display font-black text-5xl sm:text-6xl text-foreground mb-6">Selected Works</h1>
          <p className="text-xl text-muted-foreground">
            A showcase of digital experiences, visual identities, and creative solutions crafted for forward-thinking brands.
          </p>
        </AnimatedSection>

        {/* Filter Bar */}
        <AnimatedSection delay={0.1} className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <div className="flex gap-3 whitespace-nowrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full aspect-[4/3] rounded-3xl bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </AnimatePresence>
            
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                No projects found in this category.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
