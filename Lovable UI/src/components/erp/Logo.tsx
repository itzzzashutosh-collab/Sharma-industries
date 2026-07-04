import logoMark from "@/assets/sharma-logo-mark.png.asset.json";
import logoLight from "@/assets/sharma-logo-light.png.asset.json";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Brand logo that adapts to the active theme.
 * - `auto`: dark wordmark on light backgrounds, light wordmark on dark backgrounds.
 * - `light`: always the white wordmark (use on navy/dark surfaces like the sidebar).
 */
export function Logo({
  variant = "auto",
  className,
}: {
  variant?: "auto" | "light";
  className?: string;
}) {
  const { theme } = useTheme();
  const src =
    variant === "light"
      ? logoLight.url
      : theme === "dark"
        ? logoLight.url
        : logoMark.url;

  return (
    <img
      src={src}
      alt="Sharma Industries"
      className={cn("w-auto object-contain select-none", className)}
      draggable={false}
    />
  );
}
