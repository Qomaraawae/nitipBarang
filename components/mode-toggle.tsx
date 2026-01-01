import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Check, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const [theme, setTheme] = useState<string>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;

    if (
      newTheme === "dark" ||
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-10 w-10 flex items-center justify-center text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="Toggle theme"
          title="Ubah tema"
        >
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <Sun className="h-4 w-4 text-gray-700 dark:text-gray-400" />
            <div className="flex flex-col">
              <span className="font-medium">Terang</span>
            </div>
          </div>
          {theme === "light" && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <Moon className="h-4 w-4 text-gray-700 dark:text-gray-400" />
            <div className="flex flex-col">
              <span className="font-medium">Gelap</span>
            </div>
          </div>
          {theme === "dark" && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-gray-700 dark:text-gray-400" />
            <div className="flex flex-col">
              <span className="font-medium">Sistem</span>
            </div>
          </div>
          {theme === "system" && (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
