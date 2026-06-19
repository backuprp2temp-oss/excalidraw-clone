import { useEffect } from "react";
import { useStore } from "../store/appStore";

export function useTheme() {
  const theme = useStore((s) => s.appState.theme);

  useEffect(() => {
    const root = document.documentElement;
    const themeVars =
      theme === "dark"
        ? {
            "--color-surface": "#121212",
            "--color-surface-low": "#1a1a1a",
            "--color-surface-high": "#2a2a2a",
            "--color-text": "#e0e0e0",
            "--color-text-muted": "#9ca3af",
            "--color-accent": "#8b87f5",
            "--color-grid": "rgba(255,255,255,0.08)",
            "--color-selection": "rgba(139, 135, 245, 0.2)",
            "--color-handle": "#1a1a1a",
            "--color-handle-border": "#8b87f5",
          }
        : {
            "--color-surface": "#ffffff",
            "--color-surface-low": "#f5f5f5",
            "--color-surface-high": "#eeeeee",
            "--color-text": "#1a1a1a",
            "--color-text-muted": "#6b7280",
            "--color-accent": "#6965db",
            "--color-grid": "rgba(0,0,0,0.08)",
            "--color-selection": "rgba(105, 101, 219, 0.2)",
            "--color-handle": "#ffffff",
            "--color-handle-border": "#6965db",
          };

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    document.body.style.background = themeVars["--color-surface"];
    document.body.style.color = themeVars["--color-text"];
  }, [theme]);

  return theme;
}
