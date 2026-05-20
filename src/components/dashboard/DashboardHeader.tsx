import React from 'react';
import { Bell, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardNav } from './DashboardNav';

interface DashboardHeaderProps {
  userEmail: string | undefined;
  notificationsCount: number;
  SignOutHandler: () => void;
  notifications: string[];
  clearNotifications: () => void;
  showNotificationDropdown: boolean;
  setShowNotificationDropdown: (open: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement>;
  isAdmin: boolean;
  
  // Triggers Profile Sidebar Panel Display inside Main Wrapper Layout
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Added Props to pass down into nested Menu Component Inline
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function DashboardHeader({
  userEmail,
  notificationsCount,
  SignOutHandler,
  notifications = [],
  clearNotifications,
  showNotificationDropdown,
  setShowNotificationDropdown,
  notificationRef,
  isAdmin,
  isSettingsOpen,
  setIsSettingsOpen,
  activeSection,
  setActiveSection,
}: DashboardHeaderProps) {

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* LEFT SIDE: INLINE NAVBAR BUTTON & STUDIO TITLES */}
        <div className="flex items-center gap-4 transition-all">
          <DashboardNav 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            isAdmin={isAdmin} 
          />
          <div className="flex flex-col">
            {/* Ultra-thick, bold, high-contrast typography with clean letter spacing */}
            <span className="text-base md:text-xl font-black uppercase tracking-normal text-white">
              Sulaiman Graphics
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: INTERACTIVE ACTIONS DECK */}
        <div className="flex items-center gap-3">
          
          {/* REALTIME SYSTEM NOTIFICATION DROPDOWN */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2.5 bg-card/40 hover:bg-card border border-border/60 hover:border-neutral-700 rounded-xl text-muted-foreground hover:text-foreground transition-all relative group"
            >
              <Bell size={18} className="group-hover:rotate-12 transition-transform" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {showNotificationDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-80 bg-neutral-950 border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                >
                  <div className="p-3 border-b border-border/60 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Activity Logs</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] text-cyan-400 font-bold hover:underline"
                      >
                        Clear Matrix
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground font-medium">
                        No operational updates logged.
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div key={index} className="p-2.5 rounded-xl bg-card/30 border border-border/40 text-[11px] text-neutral-300 font-medium leading-relaxed">
                          {notif}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PROFILE CONTROL TOGGLE ACCENTS */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2.5 rounded-xl border transition-all text-muted-foreground hover:text-foreground ${
              isSettingsOpen 
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                : "bg-card/40 border-border/60 hover:border-neutral-700 hover:bg-card"
            }`}
          >
            <Settings size={18} />
          </button>

          {/* DISCONNECT SECURE SIGN OUT TERMINAL */}
          <button
            onClick={SignOutHandler}
            className="flex items-center gap-2 px-3 py-2 bg-red-950/20 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl transition-all text-xs font-bold"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Disconnect</span>
          </button>
          
        </div>
      </div>
    </header>
  );
}
