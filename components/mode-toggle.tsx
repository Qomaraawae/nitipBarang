// components/mode-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setIsAnimating(true);
    setTheme(newTheme);

    // Reset animasi setelah selesai
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const toggleTheme = () => {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme || "system");
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      case "light":
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      default:
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case "dark":
        return "Dark mode (klik untuk System)";
      case "light":
        return "Light mode (klik untuk Dark)";
      default:
        return "System mode (klik untuk Light)";
    }
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={getTooltip()}
      aria-label="Toggle theme"
      className={`relative overflow-hidden transition-all duration-300 ${
        isAnimating
          ? "scale-110 bg-primary/20 border-primary/50"
          : "hover:scale-105"
      }`}
    >
      {/* Animasi background pulse */}
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse" />
      )}

      {/* Ikon dengan animasi */}
      <div className={`relative ${isAnimating ? "icon-transition" : ""}`}>
        {getIcon()}
      </div>

      {/* Indikator tema aktif */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-70" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
