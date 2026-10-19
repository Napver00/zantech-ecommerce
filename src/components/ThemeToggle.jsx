import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ThemeToggle = ({ className, withLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center gap-3 rounded-lg p-2.5 text-gray-300 transition-colors hover:bg-white/5 hover:text-zan-cyan",
        className,
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {withLabel && <span className="text-sm font-medium">{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
};

export default ThemeToggle;
