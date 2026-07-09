"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import IconButton from "@/components/icon-button/IconButton";

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <IconButton
      size="icon"
      label="Theme toggle"
      title="Toggle theme"
      onClick={toggleTheme}
      className="bg-foreground rounded-full text-background hover:bg-foreground"
    >
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all! dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all! dark:rotate-0 dark:scale-100" />
    </IconButton>
  );
};

export default ThemeToggle;
