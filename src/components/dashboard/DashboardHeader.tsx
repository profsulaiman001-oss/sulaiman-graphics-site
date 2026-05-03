import React from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail: string | undefined;
  notificationsCount: number;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  SignOutHandler: () => void;
}

export function DashboardHeader({
  userEmail,
  notificationsCount,
  isSettingsOpen,
  setIsSettingsOpen,
  SignOutHandler,
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

          <div className="relative">
            <button className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200">
              <Bell size={18} />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              )}
            </button>
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
