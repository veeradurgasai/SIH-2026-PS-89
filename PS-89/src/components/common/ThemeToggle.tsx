import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "pill" | "compact";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "", variant = "pill" }) => {
  const { theme, toggleTheme, isDark, isTransitioning, transitionType } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      title={`Switch to ${isDark ? "Light Mode (Sunrise)" : "Dark Mode (Sunset)"}`}
      className={`relative inline-flex items-center select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-300 ${
        isDark
          ? "bg-[#0B1F3A] border border-[#1E3A5F] hover:border-cyan-500/50"
          : "bg-slate-100 border border-slate-200 hover:border-blue-300"
      } ${
        variant === "compact"
          ? "w-14 h-8 rounded-full p-0.5"
          : "w-16 h-8 rounded-full p-1"
      } ${className}`}
    >
      {/* Background Track Icons */}
      <div className="w-full flex items-center justify-between px-1.5 pointer-events-none">
        <Sun
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            !isDark
              ? "text-amber-500 opacity-0 scale-75"
              : "text-slate-400 hover:text-amber-400 opacity-60 scale-90"
          }`}
        />
        <Moon
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark
              ? "text-cyan-300 opacity-0 scale-75"
              : "text-slate-400 hover:text-blue-500 opacity-60 scale-90"
          }`}
        />
      </div>

      {/* Sliding Active Indicator Thumb */}
      <div
        className={`absolute top-1 bottom-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ease-out shadow-xs pointer-events-none ${
          isDark
            ? "translate-x-8 bg-[#102A46] text-cyan-300 border border-cyan-400/40 shadow-cyan-900/30"
            : "translate-x-0 bg-white text-amber-500 border border-slate-200 shadow-slate-300"
        } ${isTransitioning ? "scale-110" : "scale-100"}`}
      >
        {isDark ? (
          <Moon
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              transitionType === "sunset" ? "rotate-[-20deg] scale-110" : ""
            }`}
          />
        ) : (
          <Sun
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              transitionType === "sunrise" ? "rotate-45 scale-110" : ""
            }`}
          />
        )}
      </div>

      {/* Screen Reader Label */}
      <span className="sr-only">
        {isDark ? "Dark mode active. Switch to light." : "Light mode active. Switch to dark."}
      </span>
    </button>
  );
};
