import { useSyncExternalStore } from "react";

const KEY = "zt-theme";
const listeners = new Set();

const read = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("light") ? "light" : "dark";

export const setTheme = (theme) => {
  const root = document.documentElement;
  // Animate colours only for the switch itself, not on every hover.
  root.classList.add("theme-transition");
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#ffffff" : "#0b0f19");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode — theme just won't persist */
  }
  window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  listeners.forEach((l) => l());
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Current theme ("dark" | "light") and a toggle, shared by every component.
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, read, () => "dark");
  return { theme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") };
};
