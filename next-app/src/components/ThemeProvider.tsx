"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// Intercept and silence console warnings/errors about oklch or React 19 script tag FOUC injection in development
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" && 
      (args[0].includes("Encountered a script tag while rendering React component") ||
       args[0].includes("oklch"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" && 
      args[0].includes("oklch")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props} forcedTheme="light" defaultTheme="light" enableSystem={false}>{children}</NextThemesProvider>;
}
