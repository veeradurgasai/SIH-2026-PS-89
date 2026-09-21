import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";
export type TransitionType = "sunset" | "sunrise" | null;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
  transitionType: TransitionType;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sc_theme");
        if (saved === "dark" || saved === "light") return saved;
      } catch (e) {
        console.error("Failed to read theme preference", e);
      }
    }
    return "light";
  });

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionType, setTransitionType] = useState<TransitionType>(null);

  // Sync with DOM attribute and class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    try {
      localStorage.setItem("sc_theme", theme);
    } catch (e) {
      console.error("Failed to save theme preference", e);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme === theme) return;
    const type: TransitionType = newTheme === "dark" ? "sunset" : "sunrise";
    setTransitionType(type);
    setIsTransitioning(true);
    setThemeState(newTheme);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionType(null);
    }, 850);

    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
        isTransitioning,
        transitionType,
      }}
    >
      {children}
      {/* Ambient Sunrise / Sunset Non-Blocking Horizon Glow Layer */}
      {isTransitioning && transitionType && (
        <div
          className={`fixed inset-0 pointer-events-none z-[9999] overflow-hidden ${
            transitionType === "sunset"
              ? "theme-transition-sunset"
              : "theme-transition-sunrise"
          }`}
          aria-hidden="true"
        />
      )}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
