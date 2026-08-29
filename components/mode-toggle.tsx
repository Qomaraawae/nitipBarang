"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Check, Monitor, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mencegah hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme change dengan animasi
  const handleThemeChange = (newTheme: string) => {
    if (newTheme === theme) return;

    setIsAnimating(true);
    setTheme(newTheme);

    // Hapus state animasi setelah selesai
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Tampilkan placeholder saat belum mounted
  if (!mounted) {
    return (
      <button
        className="h-10 w-10 flex items-center justify-center text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        aria-label="Toggle theme"
        title="Ubah tema"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            h-10 w-10 flex items-center justify-center 
            text-gray-800 hover:text-gray-900 
            dark:text-gray-300 dark:hover:text-white 
            transition-all duration-300 relative
            hover:scale-110 active:scale-95
            ${isAnimating ? "animate-pulse" : ""}
          `}
          aria-label="Toggle theme"
          title="Ubah tema"
        >
          {/* Background glow effect */}
          <span
            className={`
            absolute inset-0 rounded-full 
            bg-linear-to-r from-blue-500/20 to-purple-500/20 
            transition-all duration-500
            ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"}
          `}
          />

          {/* Icon Sun - muncul di light mode */}
          <Sun
            className={`
              h-5 w-5 transition-all duration-500 absolute
              ${
                isDark
                  ? "scale-0 rotate-180 opacity-0"
                  : "scale-100 rotate-0 opacity-100"
              }
            `}
          />

          {/* Icon Moon - muncul di dark mode */}
          <Moon
            className={`
              h-5 w-5 transition-all duration-500 absolute
              ${
                isDark
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-0 -rotate-180 opacity-0"
              }
            `}
          />

          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 group-hover:scale-110 transition-transform duration-200">
              <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Terang</span>
            </div>
          </div>
          {theme === "light" && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-in fade-in zoom-in duration-200" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-200">
              <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Gelap</span>
            </div>
          </div>
          {theme === "dark" && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-in fade-in zoom-in duration-200" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-700/30 group-hover:scale-110 transition-transform duration-200">
              <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Sistem</span>
              <span className="text-xs text-muted-foreground">
                Ikuti perangkat
              </span>
            </div>
          </div>
          {theme === "system" && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-in fade-in zoom-in duration-200" />
          )}
        </DropdownMenuItem>

        {/* Divider dengan efek */}
        <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

        {/* Info kecil */}
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Tema saat ini:{" "}
            <span className="font-medium capitalize">{resolvedTheme}</span>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
