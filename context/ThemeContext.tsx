"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// ==========================================
// TYPES
// ==========================================

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark"; // The actual applied theme (system resolves to light/dark)
}

// ==========================================
// CONTEXT CREATION
// ==========================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // 1. Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (storedTheme) {
      setThemeState(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("system");
    }
  }, []);

  // 2. Apply theme to the DOM and update resolved theme
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");

    let currentResolved: "light" | "dark" = "light";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      currentResolved = systemTheme;
    } else {
      currentResolved = theme;
    }

    root.classList.add(currentResolved);
    setResolvedTheme(currentResolved);
    localStorage.setItem("theme", theme);

  }, [theme, mounted]);

  // 3. Listen for system theme changes (if user is using "system" mode)
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const newTheme = mediaQuery.matches ? "dark" : "light";
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
        setResolvedTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  // Wrapper for setTheme to ensure type safety and localStorage sync
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent hydration mismatch by returning children without theme logic until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}