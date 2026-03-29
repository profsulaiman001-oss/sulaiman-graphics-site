import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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

// 👉 NEW
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  const isAuth = localStorage.getItem("auth");

  if (!isAuth) {
    setLocation("/login");
    return null;
  }

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

          {/* 👉 NEW ROUTES */}
          <Route path="/login" component={Login} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </div>

      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/2349060410369?text=Hello%20Sulaiman%20Graphics"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 1000,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
          alt="WhatsApp"
          style={{ width: "28px", height: "28px" }}
        />
      </a>
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
