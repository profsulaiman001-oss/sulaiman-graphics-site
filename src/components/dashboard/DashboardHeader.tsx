import React from 'react';
import { Bell, Settings, LogOut, FolderHeart, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHeaderProps {
  userEmail: string | undefined;
  notificationsCount: number;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  SignOutHandler: () => void;
  notifications: string[];
  clearNotifications: () => void;
  showNotificationDropdown: boolean;
  setShowNotificationDropdown: (open: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement>;
  
  // Navigation Props passed into Header controls
  activeSection: string;
  setActiveSection: (section: string) => void;
  isAdmin: boolean;
}

export function DashboardHeader({
  userEmail,
  notificationsCount,
  isSettingsOpen,
  setIsSettingsOpen,
  SignOutHandler,
  notifications = [],
  clearNotifications,
  showNotificationDropdown,
  setShowNotificationDropdown,
  notificationRef,
  activeSection,
  setActiveSection,
  isAdmin,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* LEFT SIDE: "S" Logo replaced with functional Cyan Navigation Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Projects Workspace Tab Button */}
          <button
            onClick={() => setActiveSection("projects")}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-200 relative ${
              activeSection === "projects"
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "bg-background border-border/50 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/20"
            }`}
          >
            <FolderHeart size={18} />
            {activeSection === "projects" && (
              <motion.div
                layoutId="activeHeaderNav"
                className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Account Settings Tab Button */}
          <button
            onClick={() => setActiveSection("settings")}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-200 relative ${
              activeSection === "settings"
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "bg-background border-border/50 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/20"
            }`}
          >
            <LayoutDashboard size={18} />
            {activeSection === "settings" && (
              <motion.div
                layoutId="activeHeaderNav"
                className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Core App Labels */}
          <div className="ml-1 sm:ml-2">
            <h1 className="font-bold text-xs sm:text-sm tracking-tight text-foreground leading-none">
              Sulaiman Graphics
            </h1>
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              {isAdmin ? "Admin Portal" : "Studio Portal"}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: System Controls & User Configuration Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tighter">Account</span>
            <span className="text-xs font-medium text-foreground">{userEmail || 'Admin'}</span>
          </div>

          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200"
            >
              <Bell size={18} />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              )}
            </button>

            <AnimatePresence>
              {showNotificationDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl z-50 p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Bell size={14} className="text-primary" /> Notifications
                    </span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-muted-foreground hover:text-primary transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div 
                          key={index} 
                          className="p-2.5 bg-muted/30 border border-border/50 rounded-xl text-[10px] text-foreground leading-snug flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                          <span>{notification}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-[10px] italic py-6">
                        No new notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-lg border border-border/50 transition-all duration-200 ${
              isSettingsOpen ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5' : 'text-muted-foreground hover:text-yellow-500 hover:border-yellow-500/30'
            }`}
          >
            <Settings size={18} />
          </button>

          <button 
            onClick={SignOutHandler}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-700/50 text-red-500 bg-background hover:bg-red-600/10 transition-all duration-200 text-xs font-medium shadow-sm active:scale-95"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
