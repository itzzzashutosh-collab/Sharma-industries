"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// Intercept and silence console warnings/errors about oklch or React 19 script tag FOUC injection in development
if (typeof window !== "undefined") {
  const isOklchOrFoucError = (args: any[]) => {
    return args.some(arg => {
      if (!arg) return false;
      const str = typeof arg === "string" ? arg : (arg.message || arg.stack || String(arg));
      return typeof str === "string" && (
        str.toLowerCase().includes("oklch") ||
        str.toLowerCase().includes("oklab") ||
        str.toLowerCase().includes("unsupported color function") ||
        str.includes("Encountered a script tag while rendering React component")
      );
    });
  };

  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (isOklchOrFoucError(args)) return;
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (isOklchOrFoucError(args)) return;
    originalWarn.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props} forcedTheme="light" defaultTheme="light" enableSystem={false}>{children}</NextThemesProvider>;
}
