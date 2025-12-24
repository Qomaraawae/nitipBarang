"use client";

import { ReactNode } from "react";

interface ThemeWrapperProps {
  children: ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  return (
    <div className="theme-transition min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}