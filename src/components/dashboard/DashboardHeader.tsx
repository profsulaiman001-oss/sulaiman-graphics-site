import React from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardHeaderProps {
  userEmail: string | undefined;
  notificationsCount: number;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  SignOutHandler: () => void;
  // Added notification props
  notifications: string[];
  clearNotifications: () => void;
  showNotificationDropdown: boolean;
  setShowNotificationDropdown: (open: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement>;
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
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50 w-full">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
            S
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-foreground sm:text-base">
              Sulaiman Graphics
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Studio Portal
            </p>
          </div>
        </div>

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
