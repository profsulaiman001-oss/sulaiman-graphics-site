import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Shield, Moon, Sun } from "lucide-react";

export default function Settings() {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState("profile");
  // State to track dark mode toggle
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold mb-2 text-primary">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, preferences, and account security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left Sidebar Navigation */}
          <div className="space-y-2 col-span-1">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-white"
              }`}
            >
              <User className="h-4 w-4" /> Profile
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "notifications" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-white"
              }`}
            >
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "security" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" /> Security
            </button>
          </div>

          {/* Right Main Content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            
            {/* PROFILE TAB CONTENT */}
            {activeTab === "profile" && (
              <>
                <Card className="border-border bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>This is how clients will see your information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                        SG
                      </div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase font-bold">Display Name</label>
                        <div className="px-3 py-2 bg-background border border-border rounded-md text-sm">Sulaiman Graphics</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase font-bold">Email Address</label>
                        <div className="px-3 py-2 bg-background border border-border rounded-md text-sm text-muted-foreground">admin@sulaimangraphics.com</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Interface Preferences</CardTitle>
                    <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Dark Mode</p>
                        <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className={!darkMode ? "bg-white text-black" : ""}
                      >
                        {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 fill-amber-500 text-amber-500" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* NOTIFICATIONS TAB CONTENT */}
            {activeTab === "notifications" && (
              <Card className="border-border bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your email alert preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Notification settings will appear here.</p>
                </CardContent>
              </Card>
            )}

            {/* SECURITY TAB CONTENT */}
            {activeTab === "security" && (
              <Card className="border-border bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password and secure your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Security settings will appear here.</p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
