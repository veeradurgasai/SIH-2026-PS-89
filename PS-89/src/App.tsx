import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { LandingPage } from "./components/public/LandingPage";
import { CustomerDashboard } from "./components/customer/CustomerDashboard";
import { WorkerDashboard } from "./components/worker/WorkerDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AuthModal } from "./components/auth/AuthModal";
import { EmergencyModal } from "./components/customer/EmergencyModal";
import { ThemeBackground } from "./components/common/ThemeBackground";
import { ServiceCategory, UserRole } from "./types";

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const { setSelectedCategoryForBooking, openAuthModal } = useApp();

  const [currentView, setCurrentView] = useState<"public" | "customer" | "worker" | "admin">("public");

  // Disable browser automatic scroll restoration to ensure always starting at top
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Force scroll strictly to top when opening the page and on every view redirect
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollToTop();
    const t1 = setTimeout(scrollToTop, 20);
    const t2 = setTimeout(scrollToTop, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentView]);

  // Keep view aligned with authentication state
  useEffect(() => {
    if (currentView !== "public") {
      if (!user) {
        setCurrentView("public");
      } else if (user.role !== currentView) {
        setCurrentView(user.role as any);
      }
    }
  }, [user, currentView]);

  const handleSelectCategoryFromLanding = (cat: ServiceCategory) => {
    setSelectedCategoryForBooking(cat);
    if (!user) {
      openAuthModal("login", "customer");
    } else if (user.role === "customer") {
      setCurrentView("customer");
    }
  };

  const handleRoleSuccess = (role: UserRole) => {
    setCurrentView(role as any);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 font-['Manrope',sans-serif] transition-colors duration-300 relative">
      {/* Universal Responsive Theme Background for Light and Dark Modes */}
      <ThemeBackground />

      {/* Pristine Brand Navbar */}
      <Navbar currentView={currentView} onNavigateView={setCurrentView} />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === "public" && (
          <LandingPage
            onSelectCategory={handleSelectCategoryFromLanding}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === "customer" && user?.role === "customer" && <CustomerDashboard />}

        {currentView === "worker" && user?.role === "worker" && <WorkerDashboard />}

        {currentView === "admin" && user?.role === "admin" && <AdminDashboard />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal onSuccessRole={handleRoleSuccess} />
      <EmergencyModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
