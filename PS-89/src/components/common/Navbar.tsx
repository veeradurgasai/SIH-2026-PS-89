import React, { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { Language } from "../../i18n/translations";
import { Globe, Menu, X, ArrowRight, UserCircle, LogOut, LayoutDashboard, ShieldCheck, ChevronDown, Trash2 } from "lucide-react";

interface NavbarProps {
  currentView: "public" | "customer" | "worker" | "admin";
  onNavigateView: (view: "public" | "customer" | "worker" | "admin") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigateView }) => {
  const { user, logout, login } = useAuth();
  const { language, setLanguage, t, openAuthModal } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    setMobileMenuOpen(false);
    await logout();
    onNavigateView("public");
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== "public") {
      onNavigateView("public");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "kn", label: "ಕನ್ನಡ" }
  ];

  return (
    <header
      id="shramconnect-navbar"
      className="sticky top-2.5 sm:top-3.5 z-40 px-3 sm:px-6 max-w-7xl mx-auto w-full transition-all duration-300"
    >
      <div
        className={`w-full px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl lg:rounded-full backdrop-blur-xl transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-[#07152b]/95 shadow-xl shadow-blue-950/10 dark:shadow-blue-950/40 border border-slate-200/90 dark:border-blue-500/30"
            : "bg-white/80 dark:bg-[#07152b]/80 shadow-lg shadow-blue-950/5 dark:shadow-blue-950/30 border border-slate-200/80 dark:border-blue-500/20"
        } flex items-center justify-between text-slate-800 dark:text-slate-100`}
      >
        {/* Logo */}
        <div
          className="cursor-pointer shrink-0"
          onClick={() => onNavigateView("public")}
          id="navbar-logo-link"
        >
          <Logo size="md" inverted={false} />
        </div>

        {/* Public Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {t.howItWorks}
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {t.services}
          </button>
          <button
            onClick={() => scrollToSection("for-workers")}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {t.forWorkers}
          </button>
          <button
            onClick={() => scrollToSection("for-cooperatives")}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {t.forCooperatives}
          </button>
          <button
            onClick={() => scrollToSection("trust")}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {t.trust}
          </button>
        </nav>

        {/* Action Controls & Authentication */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle (Prominent in Top Nav) */}
          <ThemeToggle />

          {/* Language Switcher */}
          <div className="relative">
            <button
              id="lang-switcher-btn"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#153457] border border-slate-200 dark:border-[#1E3A5F] rounded-full transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-[#06B6D4]" />
              <span className="hidden sm:inline">{languages.find(l => l.code === language)?.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-[#0F3B66] border border-slate-200 dark:border-[#1E4E7A] rounded-xl shadow-xl py-1 z-50 text-slate-800 dark:text-white">
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      language === l.code
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#144473]"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* If user is logged in */}
          {user ? (
            <div className="flex items-center gap-2.5">
              <NotificationDropdown />

              {/* View Dashboard or Return to Public Button */}
              {currentView === "public" ? (
                <button
                  id="navbar-dashboard-btn"
                  onClick={() => onNavigateView(user.role as any)}
                  className="flex items-center gap-1.5 bg-[#2563EB] text-white hover:bg-blue-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span className="capitalize">{user.role} Portal</span>
                </button>
              ) : (
                <button
                  id="navbar-public-site-btn"
                  onClick={() => onNavigateView("public")}
                  className="flex items-center gap-1.5 bg-[#144473] text-white hover:bg-[#1A528B] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-[#1E4E7A]"
                >
                  <span>← Public Website</span>
                </button>
              )}

              <button
                id="navbar-delete-account-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="Delete Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                id="navbar-logout-btn"
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-[#144473] rounded-lg transition-colors cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* If guest / not logged in */
            <div className="hidden sm:flex items-center gap-2">
              {/* Demo Accounts Quick Dropdown */}
              <div className="relative">
                <button
                  id="navbar-demo-btn"
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/25 border border-amber-300 dark:border-amber-400/30 rounded-full transition-colors cursor-pointer"
                  title={t.demoAccount}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                  <span>{t.demoAccount}</span>
                  <ChevronDown className={`w-3 h-3 text-amber-600 dark:text-amber-300 transition-transform ${demoMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B2544] border border-slate-200 dark:border-[#1E4E7A] rounded-2xl shadow-2xl py-2 z-50 text-slate-800 dark:text-white animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 border-b border-slate-100 dark:border-[#1E4E7A] mb-1 flex items-center justify-between">
                      <span>Quick Demo Access</span>
                      <span className="text-[9px] text-slate-400">1-Click</span>
                    </div>
                    <button
                      id="navbar-demo-customer-opt"
                      onClick={async () => {
                        setDemoMenuOpen(false);
                        const res = await login("demo.customer@example.com", "Shramik@2026", "customer");
                        if (res.success) onNavigateView("customer");
                        else openAuthModal("login", "customer");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#144473] hover:text-blue-600 dark:hover:text-blue-300 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-blue-200">Demo Customer</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Citizen Household</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">Login</span>
                    </button>
                    <button
                      id="navbar-demo-worker-opt"
                      onClick={async () => {
                        setDemoMenuOpen(false);
                        const res = await login("demo.worker@example.com", "Shramik@2026", "worker");
                        if (res.success) onNavigateView("worker");
                        else openAuthModal("login", "worker");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#144473] hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-emerald-200">Demo Worker</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Ravi Kumar (Plumber)</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">Login</span>
                    </button>
                    <button
                      id="navbar-demo-admin-opt"
                      onClick={() => {
                        setDemoMenuOpen(false);
                        openAuthModal("login", "admin");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#144473] hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-indigo-200">Demo Admin</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Bengaluru Central Coop</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">Login</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                id="navbar-login-btn"
                onClick={() => openAuthModal("login")}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                {t.login}
              </button>

              <button
                id="navbar-get-started-btn"
                onClick={() => openAuthModal("register")}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-full shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>{t.getStarted}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-100" />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-[#144473] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 rounded-2xl bg-white/95 dark:bg-[#07152b]/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/25 shadow-2xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dark:text-white">
          <div className="grid grid-cols-1 gap-2 pt-2">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#144473] hover:text-blue-600 dark:hover:text-[#06B6D4] rounded-lg"
            >
              {t.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#144473] hover:text-blue-600 dark:hover:text-[#06B6D4] rounded-lg"
            >
              {t.services}
            </button>
            <button
              onClick={() => scrollToSection("for-workers")}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#144473] hover:text-blue-600 dark:hover:text-[#06B6D4] rounded-lg"
            >
              {t.forWorkers}
            </button>
            <button
              onClick={() => scrollToSection("for-cooperatives")}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#144473] hover:text-blue-600 dark:hover:text-[#06B6D4] rounded-lg"
            >
              {t.forCooperatives}
            </button>
            <button
              onClick={() => scrollToSection("trust")}
              className="text-left px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#144473] hover:text-blue-600 dark:hover:text-[#06B6D4] rounded-lg"
            >
              {t.trust}
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-[#144473] rounded-xl border border-slate-200 dark:border-[#1E4E7A]">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Theme</span>
            <ThemeToggle />
          </div>

          {!user ? (
            <div className="pt-3 border-t border-[#144473] flex flex-col gap-2">
              <div className="p-3 rounded-xl bg-[#144473]/80 border border-[#1E4E7A]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center justify-between">
                  <span>{t.demoAccount} / 1-Click Access</span>
                  <span className="text-[9px] text-slate-300">Quick Login</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      const res = await login("demo.customer@example.com", "Shramik@2026", "customer");
                      if (res.success) onNavigateView("customer");
                      else openAuthModal("login", "customer");
                    }}
                    className="py-2 px-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-center cursor-pointer shadow-xs"
                  >
                    Customer
                  </button>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      const res = await login("demo.worker@example.com", "Shramik@2026", "worker");
                      if (res.success) onNavigateView("worker");
                      else openAuthModal("login", "worker");
                    }}
                    className="py-2 px-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-center cursor-pointer shadow-xs"
                  >
                    Worker
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("login", "admin");
                    }}
                    className="py-2 px-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-center cursor-pointer shadow-xs"
                  >
                    Admin
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="w-full text-center py-2.5 text-sm font-bold text-slate-100 bg-[#144473] hover:bg-[#1A528B] border border-[#1E4E7A] rounded-lg cursor-pointer"
              >
                {t.login}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("register");
                }}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-600 rounded-lg cursor-pointer shadow-xs"
              >
                {t.getStarted}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateView(user.role as any);
                }}
                className="text-sm font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to {user.role} dashboard
              </button>
              <button
                id="navbar-mobile-delete-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowDeleteConfirm(true);
                }}
                className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
              <button
                id="navbar-mobile-logout-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Account Dialog */}
      <DeleteAccountModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
      />
    </header>
  );
};
