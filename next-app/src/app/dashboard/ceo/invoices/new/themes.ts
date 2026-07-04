export type ThemeConfig = {
  id: string;
  name: string;
  layout: "classic" | "modern" | "zenith" | "swipe" | "eztax";
  colors: {
    primaryText: string;     // Primary headers, brand text
    secondaryText: string;   // Secondary text
    accentText: string;      // Accent colors
    borderMain: string;      // Main borders
    borderLight: string;     // Light borders
    bgHeader: string;        // Table header backgrounds
    bgAccent: string;        // Accent backgrounds
  };
};

export const INVOICE_TEMPLATES: ThemeConfig[] = [
  // CLASSIC TEMPLATES
  {
    id: "classic_default",
    name: "Corporate Classic (B&W)",
    layout: "classic",
    colors: {
      primaryText: "text-black",
      secondaryText: "text-slate-500",
      accentText: "text-black",
      borderMain: "border-black",
      borderLight: "border-black/20",
      bgHeader: "bg-transparent",
      bgAccent: "bg-transparent",
    }
  },
  {
    id: "classic_navy",
    name: "Classic Navy",
    layout: "classic",
    colors: {
      primaryText: "text-blue-950",
      secondaryText: "text-blue-700",
      accentText: "text-blue-800",
      borderMain: "border-blue-950",
      borderLight: "border-blue-900/20",
      bgHeader: "bg-blue-50/50",
      bgAccent: "bg-blue-50/50",
    }
  },
  {
    id: "classic_emerald",
    name: "Classic Emerald",
    layout: "classic",
    colors: {
      primaryText: "text-emerald-950",
      secondaryText: "text-emerald-700",
      accentText: "text-emerald-800",
      borderMain: "border-emerald-950",
      borderLight: "border-emerald-900/20",
      bgHeader: "bg-emerald-50/50",
      bgAccent: "bg-emerald-50/50",
    }
  },
  {
    id: "classic_burgundy",
    name: "Classic Burgundy",
    layout: "classic",
    colors: {
      primaryText: "text-rose-950",
      secondaryText: "text-rose-700",
      accentText: "text-rose-800",
      borderMain: "border-rose-950",
      borderLight: "border-rose-900/20",
      bgHeader: "bg-rose-50/50",
      bgAccent: "bg-rose-50/50",
    }
  },
  // MODERN TEMPLATES
  {
    id: "modern_default",
    name: "Modern Minimalist (Neutral)",
    layout: "modern",
    colors: {
      primaryText: "text-slate-900",
      secondaryText: "text-slate-500",
      accentText: "text-slate-800",
      borderMain: "border-slate-900",
      borderLight: "border-slate-200",
      bgHeader: "bg-slate-50",
      bgAccent: "bg-transparent",
    }
  },
  {
    id: "modern_ocean",
    name: "Modern Ocean",
    layout: "modern",
    colors: {
      primaryText: "text-blue-900",
      secondaryText: "text-blue-600",
      accentText: "text-blue-700",
      borderMain: "border-blue-900",
      borderLight: "border-blue-200",
      bgHeader: "bg-blue-50",
      bgAccent: "bg-blue-50/50",
    }
  },
  {
    id: "modern_forest",
    name: "Modern Forest",
    layout: "modern",
    colors: {
      primaryText: "text-green-900",
      secondaryText: "text-green-600",
      accentText: "text-green-700",
      borderMain: "border-green-900",
      borderLight: "border-green-200",
      bgHeader: "bg-green-50",
      bgAccent: "bg-green-50/50",
    }
  },
  {
    id: "modern_sunset",
    name: "Modern Sunset",
    layout: "modern",
    colors: {
      primaryText: "text-amber-900",
      secondaryText: "text-amber-600",
      accentText: "text-amber-700",
      borderMain: "border-amber-900",
      borderLight: "border-amber-200",
      bgHeader: "bg-amber-50",
      bgAccent: "bg-amber-50/50",
    }
  },
  {
    id: "modern_amethyst",
    name: "Modern Amethyst",
    layout: "modern",
    colors: {
      primaryText: "text-purple-900",
      secondaryText: "text-purple-600",
      accentText: "text-purple-700",
      borderMain: "border-purple-900",
      borderLight: "border-purple-200",
      bgHeader: "bg-purple-50",
      bgAccent: "bg-purple-50/50",
    }
  },
  {
    id: "modern_rose",
    name: "Modern Rose",
    layout: "modern",
    colors: {
      primaryText: "text-pink-900",
      secondaryText: "text-pink-600",
      accentText: "text-pink-700",
      borderMain: "border-pink-900",
      borderLight: "border-pink-200",
      bgHeader: "bg-pink-50",
      bgAccent: "bg-pink-50/50",
    }
  },
  // PROFESSIONAL GST TEMPLATES
  {
    id: "zenith_corporate",
    name: "Zenith Corporate (Blue/Grey)",
    layout: "zenith",
    colors: {
      primaryText: "text-[#1c3c5a]", // Deep navy/slate header text
      secondaryText: "text-slate-600",
      accentText: "text-[#2a5b84]", // Secondary blue accent
      borderMain: "border-[#6a92b2]", // Light blue borders
      borderLight: "border-slate-200",
      bgHeader: "bg-[#2a5b84]", // Table header background (Dark blue)
      bgAccent: "bg-slate-100", // Light grey striping
    }
  },
  {
    id: "swipe_formal",
    name: "Formal Tax Invoice (B&W)",
    layout: "swipe",
    colors: {
      primaryText: "text-black",
      secondaryText: "text-gray-700",
      accentText: "text-black",
      borderMain: "border-black",
      borderLight: "border-gray-300",
      bgHeader: "bg-gray-100",
      bgAccent: "bg-transparent",
    }
  },
  {
    id: "eztax_vibrant",
    name: "EZTax Vibrant (Red/Blue)",
    layout: "eztax",
    colors: {
      primaryText: "text-[#1e3a8a]", // Navy blue headers
      secondaryText: "text-slate-700",
      accentText: "text-[#e11d48]", // Vibrant red accents (circles/totals)
      borderMain: "border-slate-300",
      borderLight: "border-slate-200",
      bgHeader: "bg-[#f1f5f9]", // Light slate background for headers
      bgAccent: "bg-[#fff1f2]", // Very light red/pink for total rows
    }
  }
];
