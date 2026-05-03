import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

import AnalyticsSection from "../components/dashboard/AnalyticsSection";
import ProjectCard from "../components/dashboard/ProjectCard";
import NamePromptModal from "../components/dashboard/NamePromptModal";
import SettingsModal from "../components/dashboard/SettingsModal";
import NotificationsDropdown from "../components/dashboard/NotificationsDropdown";
import QuickActions from "../components/dashboard/QuickActions";

import { Project, Comment } from "@/types/dashboard";   // We'll create this later

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [fullName, setFullName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});

  // Your existing functions will go here (I'll provide them in next messages)

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocation("/login");
      return;
    }
    setUser(user);
    const adminStatus = user.email === "profsulaiman001@gmail.com";
    setIsAdmin(adminStatus);

    fetchProfile(user.id);
    fetchProjects(user, adminStatus);
  };

  // ... (I will give you the rest of the functions shortly)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AnimatePresence>
        {showNamePrompt && (
          <NamePromptModal 
            fullName={fullName}
            setFullName={setFullName}
            onSave={() => {}} // We'll implement later
          />
        )}
      </AnimatePresence>

      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        {/* Header content with Notifications */}
        <NotificationsDropdown 
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="font-display font-black text-3xl sm:text-4xl">
          {fullName ? `Hello, ${fullName}!` : "Hello, Client!"}
        </h1>

        {projects.length > 0 && <AnalyticsSection projects={projects} />}

        {isAdmin && <QuickActions />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id}
              project={project}
              isAdmin={isAdmin}
              openCommentsId={openCommentsId}
              comments={comments}
              unreadCounts={unreadCounts}
              // handlers will be passed
            />
          ))}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        isAdmin={isAdmin}
      />

      {isCertOpen && <CertificateGenerator onClose={() => setIsCertOpen(false)} />}
    </div>
  );
}
