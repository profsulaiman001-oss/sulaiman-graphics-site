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

// Onboarding
import SetPassword from "@/pages/SetPassword";

// Blog & Content
import CreatePost from "@/pages/CreatePost";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";

// Tools
import Questionnaire from "@/pages/Questionnaire";
import ViewQuestionnaires from "@/pages/ViewQuestionnaires";
import Chat from "@/pages/Chat";
import Assistant from "@/pages/Assistant";
import Agreement from "@/pages/Agreement"; 
import Receipt from "@/pages/Receipt"; 
import Settings from "@/pages/Settings";
import Verify from "@/pages/Verify"; 
/* ── Added the Hub Page Import ── */
import ClientHub from "@/pages/ClientHub"; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

/* PROTECTED ROUTE COMPONENT - NOT TOUCHED */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLocation("/login");
      }
      setLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) setLocation("/login"); 
    });

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
          <Route path="/" component={Home} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/portfolio/:id" component={ProjectDetail} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/contact" component={Contact} />
          <Route path="/set-password" component={SetPassword} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:id" component={BlogPost} />
          
          {/* ── CLIENT HUB TOOLS (Synchronized with Navbar) ── */}
          <Route path="/client-hub" component={ClientHub} />
          <Route path="/questionnaire" component={Questionnaire} />
          <Route path="/chat" component={Chat} />
          <Route path="/assistant" component={Assistant} />
          <Route path="/agreement" component={Agreement} /> 
          <Route path="/verify" component={Verify} />
          
          <Route path="/receipt" component={Receipt} />
          <Route path="/settings" component={Settings} />

          {/* ✅ AUTH ROUTE: REMAINING AS /login */}
          <Route path="/login" component={Login} />

          {/* PROTECTED ROUTES - NOT TOUCHED */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/create-post">
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          </Route>
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

export default function App() {
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
