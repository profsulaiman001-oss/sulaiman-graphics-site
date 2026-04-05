import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Layout Components
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Pages
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";
import ProjectDetail from "@/pages/ProjectDetail";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

// Auth Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

// ── ADDED: Imports for your new Onboarding system ──
import SetPassword from "@/pages/SetPassword";

// ── ✅ ADDED: Import for your brand new posting page ──
import CreatePost from "@/pages/CreatePost";

// ── ✅ ADDED: Imports for your new public blog pages ──
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";

// ── ✅ ADDED: Import for your new Questionnaire page ──
import Questionnaire from "@/pages/Questionnaire";

// ── 🚨 NEW IMPORT: For managing & deleting submissions ──
import ViewQuestionnaires from "@/pages/ViewQuestionnaires";

// ── 💬 NEW IMPORT: For your brand new dedicated Chat page ──
import Chat from "@/pages/Chat";

// ── 🤖 NEW IMPORT: For your AI Assistant page ──
import Assistant from "@/pages/Assistant";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

/* ✅ FIXED PROTECTED ROUTE */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLocation("/login");
      }

      setLoading(false);
    };

    checkSession();

    // 🔥 Listen to auth changes (LOGIN / LOGOUT)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          setLocation("/login");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setLocation]);

  if (loading) return null;

  return <>{children}</>;
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow">
        <Switch>
          {/* PUBLIC ROUTES */}
          <Route path="/" component={Home} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/portfolio/:id" component={ProjectDetail} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/contact" component={Contact} />
          
          {/* ── ADDED: Public endpoint for clients clicking the link ── */}
          <Route path="/set-password" component={SetPassword} />

          {/* ── ✅ ADDED: Public routes for reading blog posts ── */}
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:id" component={BlogPost} />

          {/* ── ✅ ADDED: Public route for the Questionnaire ── */}
          <Route path="/questionnaire" component={Questionnaire} />

          {/* ── 💬 CHAT MOVED OUT: Now accessible to the public, relies on self-identification ── */}
          <Route path="/chat" component={Chat} />

          {/* ── 🤖 NEW PUBLIC ROUTE: AI Virtual Receptionist ── */}
          <Route path="/assistant" component={Assistant} />

          {/* AUTH ROUTES */}
          <Route path="/login" component={Login} />

          {/* PROTECTED ROUTES */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>

          {/* ── ✅ ADDED: Secure route for your posting page ── */}
          <Route path="/create-post">
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          </Route>

          {/* ── 🚨 NEW SECURE ROUTE: For managing questionnaire submissions ── */}
          <Route path="/questionnaires">
            <ProtectedRoute>
              <ViewQuestionnaires />
            </ProtectedRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </div>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
