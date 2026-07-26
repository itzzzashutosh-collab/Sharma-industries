"use client";

import React, {
  useState,
  useRef,
  useTransition,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  Paintbrush,
  Eraser,
  RotateCcw,
  RotateCw,
  Upload,
  Eye,
  Sparkles,
  Grid,
  Palette,
  X,
  Check,
  Search,
  Plus,
  Minus,
  FileText,
  Download,
  Share2,
  Heart,
  Clock,
  Sliders,
  Layers,
  SlidersHorizontal,
  Sun,
  Moon,
  CloudSun,
  Wand2,
  Scissors,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Shuffle,
  Star,
  TrendingUp,
  Building2,
  Home,
  LayoutGrid,
  Columns2,
  PanelLeftOpen,
  Info,
  ArrowRight,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  Shield,
  CheckCircle2,
  Triangle,
  Square,
  Circle,
  Lasso,
} from "lucide-react";
import { saveColorDesign, createDealerQuotation } from "../../actions";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Customer { id: string; name: string; phone?: string; }
interface Product { id: string; name: string; mrp: number; }
interface Props { customers: Customer[]; products: Product[]; }

type Tool = "paint" | "erase" | "brush" | "polygon" | "magic";
type LightMode = "day" | "golden" | "dusk" | "night";
type CompareMode = "slider" | "sidebyside" | "fade";
type ActivePanel = "colours" | "textures" | "wallpapers" | "stencils" | "calculator" | "ai";

interface WallpaperItem {
  id: string;
  name: string;
  category: string;
  pattern: string;
  baseColor: string;
  accentColor: string;
}

interface StencilItem {
  id: string;
  name: string;
  category: string;
  svgPath: string;
  previewColor: string;
}

interface Swatch {
  code: string;
  name: string;
  hex: string;
  category: SwatchCategory;
  collection: string;
  finish: string;
  gloss: "matte" | "satin" | "semi-gloss" | "gloss" | "high-gloss";
  goesWellWith: string[];
  pricePerLitre: number;
}

type SwatchCategory =
  | "Exterior WeatherShield"
  | "Interior Royale Silk"
  | "Royale Accents"
  | "Earthy Heritage"
  | "Pastels & Whites"
  | "Modern Urban"
  | "Rustic Naturals"
  | "Luxury Collection";

interface TextureItem {
  id: string;
  name: string;
  code: string;
  category: string;
  previewHex: string;
  opacity: number;
  scale: number;
  rotation: number;
  depth: number;
  roughness: number;
}

interface HistoryEntry { maskData: ImageData; label: string; }

interface WallZone {
  id: string;
  label: string;
  polygon: { x: number; y: number }[];
  swatchCode: string | null;
  textureId: string | null;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

interface AITheme {
  name: string;
  description: string;
  icon: React.ReactNode;
  swatches: { zone: string; code: string }[];
  mood: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARMA INDUSTRIES — OFFICIAL SWATCH CATALOGUE (Extended)
// ─────────────────────────────────────────────────────────────────────────────
const SWATCHES: Swatch[] = [
  // Exterior WeatherShield
  { code: "SI-1024", name: "Emerald Royale",     hex: "#065f46", category: "Exterior WeatherShield", collection: "Royale Exterior", finish: "High Sheen", gloss: "semi-gloss", pricePerLitre: 420, goesWellWith: ["SI-4092","SI-3304","SI-3081"] },
  { code: "SI-7015", name: "Thar Sandstone",     hex: "#c2410c", category: "Exterior WeatherShield", collection: "Heritage Shield", finish: "Rustic Granite", gloss: "matte", pricePerLitre: 380, goesWellWith: ["SI-3304","SI-3081","SI-4092"] },
  { code: "SI-5012", name: "Alpine Breeze",      hex: "#0284c7", category: "Exterior WeatherShield", collection: "Royale Exterior", finish: "High Sheen", gloss: "semi-gloss", pricePerLitre: 400, goesWellWith: ["SI-4092","SI-9905","SI-6612"] },
  { code: "SI-5501", name: "Monsoon Mist",       hex: "#64748b", category: "Exterior WeatherShield", collection: "Weathershield Pro", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 360, goesWellWith: ["SI-4092","SI-6612","SI-6020"] },
  { code: "SI-4060", name: "Shillong Pine",      hex: "#14532d", category: "Exterior WeatherShield", finish: "Rustic Granite", collection: "Heritage Shield", gloss: "matte", pricePerLitre: 390, goesWellWith: ["SI-3304","SI-4092","SI-6612"] },
  // Interior Royale Silk
  { code: "SI-1105", name: "Royal Velvet Purple", hex: "#581c87", category: "Interior Royale Silk", collection: "Royale Velvet", finish: "Royal Velvet", gloss: "satin", pricePerLitre: 480, goesWellWith: ["SI-3304","SI-4092","SI-8814"] },
  { code: "SI-9905", name: "Deccan Olive",       hex: "#3f6212", category: "Interior Royale Silk", collection: "Nature's Palette", finish: "Soft Silk", gloss: "satin", pricePerLitre: 450, goesWellWith: ["SI-4092","SI-3304","SI-5012"] },
  { code: "SI-8044", name: "Nilgiri Fog",        hex: "#475569", category: "Interior Royale Silk", collection: "Modern Silk", finish: "Soft Silk", gloss: "satin", pricePerLitre: 440, goesWellWith: ["SI-4092","SI-6612","SI-6020"] },
  // Royale Accents
  { code: "SI-3081", name: "Rajasthani Gold",    hex: "#d97706", category: "Royale Accents", collection: "Gold Series", finish: "Metallic Sparkle", gloss: "high-gloss", pricePerLitre: 520, goesWellWith: ["SI-1024","SI-7015","SI-4092"] },
  { code: "SI-9002", name: "Crimson Spice",      hex: "#991b1b", category: "Royale Accents", collection: "Bold & Vivid", finish: "Metallic Sparkle", gloss: "high-gloss", pricePerLitre: 510, goesWellWith: ["SI-6020","SI-6612","SI-4092"] },
  { code: "SI-8814", name: "Jaipur Rose",        hex: "#9f1239", category: "Royale Accents", collection: "Heritage Accents", finish: "Royal Velvet", gloss: "satin", pricePerLitre: 490, goesWellWith: ["SI-1105","SI-4092","SI-3304"] },
  { code: "SI-2040", name: "Coral Dusk",         hex: "#be123c", category: "Royale Accents", collection: "Bold & Vivid", finish: "Gloss Finish", gloss: "gloss", pricePerLitre: 495, goesWellWith: ["SI-4092","SI-6612","SI-6020"] },
  // Earthy Heritage
  { code: "SI-2209", name: "Terracotta Earth",   hex: "#9a3412", category: "Earthy Heritage", collection: "Earth Tones", finish: "Rustic Granite", gloss: "matte", pricePerLitre: 370, goesWellWith: ["SI-7015","SI-3081","SI-3304"] },
  { code: "SI-4408", name: "Malabar Teak",       hex: "#78350f", category: "Earthy Heritage", collection: "Wood & Earth", finish: "Soft Silk", gloss: "satin", pricePerLitre: 385, goesWellWith: ["SI-3304","SI-2209","SI-7015"] },
  { code: "SI-7703", name: "Sunset Ochre",       hex: "#b45309", category: "Earthy Heritage", collection: "Earth Tones", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 365, goesWellWith: ["SI-3304","SI-1024","SI-2209"] },
  { code: "SI-3050", name: "Saffron Spice",      hex: "#ea580c", category: "Earthy Heritage", collection: "Indian Spice", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 355, goesWellWith: ["SI-4092","SI-3304","SI-6612"] },
  // Pastels & Whites
  { code: "SI-4092", name: "Kashmiri Pearl",     hex: "#f5f5f4", category: "Pastels & Whites", collection: "Pure White", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 340, goesWellWith: ["SI-8044","SI-1024","SI-6020"] },
  { code: "SI-3304", name: "Vintage Ivory",      hex: "#fef3c7", category: "Pastels & Whites", collection: "Warm Whites", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 335, goesWellWith: ["SI-1105","SI-1024","SI-7703"] },
  { code: "SI-6612", name: "Himalayan Snow",     hex: "#f8fafc", category: "Pastels & Whites", collection: "Arctic White", finish: "High Sheen", gloss: "semi-gloss", pricePerLitre: 345, goesWellWith: ["SI-5012","SI-8044","SI-9002"] },
  { code: "SI-P001", name: "Blush Lotus",        hex: "#fce7f3", category: "Pastels & Whites", collection: "Soft Pastels", finish: "Smooth Matte", gloss: "matte", pricePerLitre: 340, goesWellWith: ["SI-4092","SI-6612","SI-8814"] },
  // Modern Urban
  { code: "SI-6020", name: "Urban Slate",        hex: "#334155", category: "Modern Urban", collection: "Industrial Edge", finish: "Exposed Concrete", gloss: "matte", pricePerLitre: 410, goesWellWith: ["SI-9002","SI-5501","SI-6612"] },
  { code: "SI-M001", name: "Graphite Tower",     hex: "#1e293b", category: "Modern Urban", collection: "Night City", finish: "Exposed Concrete", gloss: "matte", pricePerLitre: 415, goesWellWith: ["SI-3081","SI-6612","SI-9002"] },
  { code: "SI-M002", name: "Zinc Coast",         hex: "#94a3b8", category: "Modern Urban", collection: "Industrial Edge", finish: "Soft Silk", gloss: "satin", pricePerLitre: 400, goesWellWith: ["SI-4092","SI-6612","SI-6020"] },
  // Rustic Naturals
  { code: "SI-R001", name: "Forest Bark",        hex: "#431407", category: "Rustic Naturals", collection: "Wild Earth", finish: "Rustic Granite", gloss: "matte", pricePerLitre: 370, goesWellWith: ["SI-3304","SI-7703","SI-9905"] },
  { code: "SI-R002", name: "Sandstone Mesa",     hex: "#d4a574", category: "Rustic Naturals", collection: "Desert Stone", finish: "Stone Finish", gloss: "matte", pricePerLitre: 375, goesWellWith: ["SI-4092","SI-7703","SI-3304"] },
  // Luxury Collection
  { code: "SI-L001", name: "Midnight Sapphire",  hex: "#1e3a8a", category: "Luxury Collection", collection: "Prestige Luxury", finish: "High Sheen", gloss: "high-gloss", pricePerLitre: 650, goesWellWith: ["SI-3081","SI-4092","SI-6612"] },
  { code: "SI-L002", name: "Obsidian Black",     hex: "#0a0a0a", category: "Luxury Collection", collection: "Prestige Luxury", finish: "Gloss Finish", gloss: "high-gloss", pricePerLitre: 680, goesWellWith: ["SI-3081","SI-6612","SI-9002"] },
  { code: "SI-L003", name: "Champagne Mist",     hex: "#d4af37", category: "Luxury Collection", collection: "Gold Prestige", finish: "Metallic Sparkle", gloss: "high-gloss", pricePerLitre: 720, goesWellWith: ["SI-M001","SI-4092","SI-6020"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEXTURE CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
const TEXTURES: TextureItem[] = [
  { id: "sand",       name: "Sand Finish",      code: "TX-101", category: "Natural", previewHex: "#d4a574", opacity: 85, scale: 100, rotation: 0, depth: 60, roughness: 70 },
  { id: "granite",    name: "Rustic Granite",   code: "TX-102", category: "Stone",   previewHex: "#6b7280", opacity: 80, scale: 80,  rotation: 0, depth: 75, roughness: 85 },
  { id: "marble",     name: "Italian Marble",   code: "TX-103", category: "Stone",   previewHex: "#f3f4f6", opacity: 75, scale: 120, rotation: 15, depth: 50, roughness: 30 },
  { id: "stucco",     name: "Stucco Finish",    code: "TX-104", category: "Plaster", previewHex: "#e5e7eb", opacity: 90, scale: 60,  rotation: 0, depth: 55, roughness: 65 },
  { id: "travertine", name: "Travertine",       code: "TX-105", category: "Stone",   previewHex: "#d1c4a0", opacity: 80, scale: 100, rotation: 0, depth: 65, roughness: 50 },
  { id: "cement",     name: "Raw Cement",       code: "TX-106", category: "Modern",  previewHex: "#9ca3af", opacity: 85, scale: 70,  rotation: 0, depth: 40, roughness: 80 },
  { id: "brick",      name: "Exposed Brick",    code: "TX-107", category: "Classic", previewHex: "#b45309", opacity: 88, scale: 80,  rotation: 0, depth: 80, roughness: 90 },
  { id: "wood",       name: "Timber Panel",     code: "TX-108", category: "Natural", previewHex: "#78350f", opacity: 80, scale: 90,  rotation: 90, depth: 70, roughness: 75 },
  { id: "metallic",   name: "Metallic Sheen",   code: "TX-109", category: "Luxury",  previewHex: "#c0c0c0", opacity: 70, scale: 100, rotation: 45, depth: 30, roughness: 15 },
  { id: "roller",     name: "Roller Texture",   code: "TX-110", category: "Modern",  previewHex: "#f9fafb", opacity: 75, scale: 50,  rotation: 0, depth: 35, roughness: 45 },
  { id: "luxury",     name: "Luxury Designer",  code: "TX-111", category: "Luxury",  previewHex: "#d4af37", opacity: 72, scale: 110, rotation: 30, depth: 45, roughness: 20 },
  { id: "concrete",   name: "Polished Concrete",code: "TX-112", category: "Modern",  previewHex: "#6b7280", opacity: 82, scale: 90,  rotation: 0, depth: 35, roughness: 55 },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI THEMES
// ─────────────────────────────────────────────────────────────────────────────
const AI_THEMES: AITheme[] = [
  {
    name: "Nordic Luxury Villa",
    description: "Pristine whites with slate accents — timeless European elegance",
    icon: <Building2 size={16} />,
    mood: "Serene",
    swatches: [{ zone: "Main Wall", code: "SI-4092" }, { zone: "Accent", code: "SI-8044" }, { zone: "Trim", code: "SI-6612" }],
  },
  {
    name: "Royal Rajasthan Heritage",
    description: "Ochre, terracotta & emerald — India's architectural legacy",
    icon: <Star size={16} />,
    mood: "Regal",
    swatches: [{ zone: "Main Wall", code: "SI-7703" }, { zone: "Accent", code: "SI-1024" }, { zone: "Trim", code: "SI-3304" }],
  },
  {
    name: "Mediterranean Warmth",
    description: "Earth tones & azure blues reminiscent of coastal villas",
    icon: <Home size={16} />,
    mood: "Warm",
    swatches: [{ zone: "Main Wall", code: "SI-2209" }, { zone: "Accent", code: "SI-5012" }, { zone: "Trim", code: "SI-4092" }],
  },
  {
    name: "Urban Industrial Modern",
    description: "Charcoal slate with crimson pop — bold architectural statement",
    icon: <Layers size={16} />,
    mood: "Bold",
    swatches: [{ zone: "Main Wall", code: "SI-6020" }, { zone: "Accent", code: "SI-9002" }, { zone: "Trim", code: "SI-6612" }],
  },
  {
    name: "Prestige Black Luxury",
    description: "Obsidian black with gold accents — ultra-premium prestige",
    icon: <TrendingUp size={16} />,
    mood: "Prestige",
    swatches: [{ zone: "Main Wall", code: "SI-L002" }, { zone: "Accent", code: "SI-L003" }, { zone: "Trim", code: "SI-6612" }],
  },
  {
    name: "Tropical Bungalow",
    description: "Alpine blue, olive & ivory — lush tropical sanctuary",
    icon: <Circle size={16} />,
    mood: "Fresh",
    swatches: [{ zone: "Main Wall", code: "SI-5012" }, { zone: "Accent", code: "SI-9905" }, { zone: "Trim", code: "SI-4092" }],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// WALLPAPER CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
const WALLPAPERS: WallpaperItem[] = [
  { id: "wp-damask",      name: "Damask Royale",       category: "Classic",   baseColor: "#1c1412", accentColor: "#d4af37", pattern: "repeating-linear-gradient(45deg, rgba(212,175,55,0.18) 0 3px, transparent 3px 20px), repeating-linear-gradient(-45deg, rgba(212,175,55,0.12) 0 3px, transparent 3px 20px)" },
  { id: "wp-chevron",     name: "Chevron Gold",        category: "Modern",    baseColor: "#0f172a", accentColor: "#fbbf24", pattern: "repeating-linear-gradient(60deg, rgba(251,191,36,0.22) 0 5px, transparent 5px 30px), repeating-linear-gradient(-60deg, rgba(251,191,36,0.15) 0 5px, transparent 5px 30px)" },
  { id: "wp-herringbone", name: "Herringbone Slate",   category: "Industrial",baseColor: "#1e293b", accentColor: "#94a3b8", pattern: "repeating-linear-gradient(45deg, rgba(148,163,184,0.2) 0 4px, transparent 4px 16px), repeating-linear-gradient(-45deg, rgba(148,163,184,0.12) 0 4px, transparent 4px 16px)" },
  { id: "wp-botanical",   name: "Botanical Leaf",      category: "Nature",    baseColor: "#052e16", accentColor: "#4ade80", pattern: "radial-gradient(circle at 25% 25%, rgba(74,222,128,0.3) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgba(74,222,128,0.2) 0%, transparent 40%)" },
  { id: "wp-geometric",   name: "Geometric Hex",       category: "Modern",    baseColor: "#312e81", accentColor: "#818cf8", pattern: "repeating-linear-gradient(0deg, rgba(129,140,248,0.15) 0 2px, transparent 2px 30px), repeating-linear-gradient(60deg, rgba(129,140,248,0.1) 0 2px, transparent 2px 30px)" },
  { id: "wp-stripes",     name: "Heritage Stripes",    category: "Classic",   baseColor: "#7f1d1d", accentColor: "#fca5a5", pattern: "repeating-linear-gradient(0deg, rgba(252,165,165,0.25) 0 8px, transparent 8px 40px)" },
  { id: "wp-floral",      name: "Mughal Floral",       category: "Heritage",  baseColor: "#451a03", accentColor: "#fb923c", pattern: "radial-gradient(circle, rgba(251,146,60,0.35) 4px, transparent 4px), radial-gradient(circle at 30px 30px, rgba(251,146,60,0.2) 4px, transparent 4px)" },
  { id: "wp-lattice",     name: "Jali Lattice",        category: "Heritage",  baseColor: "#fefce8", accentColor: "#854d0e", pattern: "repeating-linear-gradient(0deg, rgba(133,77,14,0.3) 0 2px, transparent 2px 18px), repeating-linear-gradient(90deg, rgba(133,77,14,0.3) 0 2px, transparent 2px 18px)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STENCIL CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────
const STENCILS: StencilItem[] = [
  { id: "st-lotus",      name: "Lotus Bloom",      category: "Indian Heritage", previewColor: "#ec4899", svgPath: "M50,5 C55,20 70,20 70,30 C70,45 55,50 50,55 C45,50 30,45 30,30 C30,20 45,20 50,5 Z" },
  { id: "st-mandala",    name: "Rajput Mandala",   category: "Indian Heritage", previewColor: "#f59e0b", svgPath: "M50,10 L55,25 L70,25 L58,35 L63,50 L50,42 L37,50 L42,35 L30,25 L45,25 Z" },
  { id: "st-paisley",    name: "Paisley Motif",    category: "Indian Heritage", previewColor: "#8b5cf6", svgPath: "M40,10 Q60,5 65,25 Q70,45 50,55 Q35,50 35,35 Q35,20 40,10 Z" },
  { id: "st-chevron",    name: "Chevron Border",   category: "Geometric",      previewColor: "#06b6d4", svgPath: "M10,30 L30,10 L50,30 L70,10 L90,30 L70,50 L50,30 L30,50 Z" },
  { id: "st-arch",       name: "Mughal Arch",      category: "Architecture",   previewColor: "#d97706", svgPath: "M30,55 L30,30 Q30,10 50,10 Q70,10 70,30 L70,55 Z" },
  { id: "st-leaf",       name: "Tropical Leaf",    category: "Nature",         previewColor: "#10b981", svgPath: "M50,5 Q80,20 75,45 Q60,55 50,55 Q40,55 25,45 Q20,20 50,5 Z" },
  { id: "st-star",       name: "Islamic Star",     category: "Indian Heritage", previewColor: "#ef4444", svgPath: "M50,5 L58,30 L85,30 L63,46 L71,70 L50,55 L29,70 L37,46 L15,30 L42,30 Z" },
  { id: "st-diamond",    name: "Diamond Lattice",  category: "Geometric",      previewColor: "#6366f1", svgPath: "M50,5 L90,30 L50,55 L10,30 Z" },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: hex → {r,g,b}
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function lightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lR = Math.min(255, r + amount);
  const lG = Math.min(255, g + amount);
  const lB = Math.min(255, b + amount);
  return `rgb(${lR},${lG},${lB})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function ColorStudioClient({ customers, products }: Props) {
  // Project meta
  const [customer, setCustomer]           = useState(customers[0]?.id || "");
  const [projectName, setProjectName]     = useState("AI Visualizer Project");
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const [area, setArea]                   = useState("2400");
  const [wastage, setWastage]             = useState("10");

  // Image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded]     = useState(false);

  // Tools
  const [activeTool, setActiveTool]       = useState<Tool>("paint");
  const [brushSize, setBrushSize]         = useState(20);
  const [tolerance, setTolerance]         = useState(40);

  // Panel & tabs
  const [activePanel, setActivePanel]     = useState<ActivePanel>("colours");
  const [panelOpen, setPanelOpen]         = useState(true);

  // Colour selection
  const [selectedSwatch, setSelectedSwatch] = useState<Swatch>(SWATCHES[16]); // Kashmiri Pearl
  const [activeSwatches, setActiveSwatches] = useState<Swatch[]>(SWATCHES.slice(0, 4));
  const [favourites, setFavourites]         = useState<string[]>([]);
  const [recentSwatches, setRecentSwatches] = useState<Swatch[]>([]);
  const [compareA, setCompareA]             = useState<Swatch | null>(null);
  const [compareB, setCompareB]             = useState<Swatch | null>(null);

  // Texture
  const [selectedTexture, setSelectedTexture] = useState<TextureItem | null>(null);
  const [textureControls, setTextureControls]  = useState({ scale: 100, rotation: 0, opacity: 80, depth: 60, roughness: 70 });

  // Lighting
  const [lightMode, setLightMode]         = useState<LightMode>("day");

  // Compare view
  const [compareMode, setCompareMode]     = useState<CompareMode>("slider");
  const [showCompare, setShowCompare]     = useState(false);
  const [sliderPos, setSliderPos]         = useState(50);

  // History (undo/redo)
  const [history, setHistory]             = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack]         = useState<HistoryEntry[]>([]);

  // Wall zones
  const [wallZones, setWallZones]         = useState<WallZone[]>([]);
  const [activeZone, setActiveZone]       = useState<string | null>(null);

  // Polygon drawing state
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints]        = useState<{ x: number; y: number }[]>([]);

  // AI
  const [aiTheme, setAiTheme]             = useState<AITheme | null>(null);
  const [swatchSearch, setSwatchSearch]   = useState("");
  const [swatchCategory, setSwatchCategory] = useState<string>("All");

  // Misc UI
  const [zoom, setZoom]                   = useState(100);
  const [showSpecSheet, setShowSpecSheet] = useState(false);
  const [showLeads, setShowLeads]         = useState(false);
  const [isPending, startTransition]      = useTransition();

  // Refs
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const mainCanvas    = useRef<HTMLCanvasElement>(null);
  const maskCanvas    = useRef<HTMLCanvasElement>(null);
  const overlayCanvas = useRef<HTMLCanvasElement>(null);

  // ── Derived Estimates ─────────────────────────────────────────────────────
  const activeProduct  = products.find(p => p.id === selectedProduct) || products[0];
  const rate           = activeProduct ? Number(activeProduct.mrp || 350) : 350;
  const areaNum        = Number(area || 0);
  const wMul           = 1 + Number(wastage) / 100;
  const estPutty       = Math.round((areaNum / 10) * wMul);
  const estPrimer      = Math.round((areaNum / 12) * wMul);
  const estPaint       = Math.round((areaNum / 8)  * wMul);
  const estTexture     = selectedTexture ? Math.round((areaNum / 5) * wMul) : 0;
  const puttyCost      = estPutty  * 50;
  const primerCost     = estPrimer * 150;
  const paintCost      = estPaint  * rate;
  const textureCost    = estTexture * 80;
  const laborCost      = areaNum   * 18;
  const grandTotal     = puttyCost + primerCost + paintCost + textureCost + laborCost;

  // ── Filtered Swatches ─────────────────────────────────────────────────────
  const filteredSwatches = useMemo(() => {
    return SWATCHES.filter(s => {
      const matchCat = swatchCategory === "All" || s.category === swatchCategory;
      const q = swatchSearch.toLowerCase();
      return matchCat && (
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.collection.toLowerCase().includes(q)
      );
    });
  }, [swatchSearch, swatchCategory]);

  const goesWellWith = useMemo(() =>
    selectedSwatch.goesWellWith.map(c => SWATCHES.find(s => s.code === c)).filter(Boolean) as Swatch[],
  [selectedSwatch]);

  // ── Load Photo to Canvas ──────────────────────────────────────────────────
  useEffect(() => {
    const main = mainCanvas.current;
    const mask = maskCanvas.current;
    const ov   = overlayCanvas.current;
    if (!main || !mask || !ov) return;

    const ctx  = main.getContext("2d");
    const mCtx = mask.getContext("2d");
    const oCtx = ov.getContext("2d");
    if (!ctx || !mCtx || !oCtx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = 960;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.round(img.naturalWidth  * scale);
      const h = Math.round(img.naturalHeight * scale);

      main.width  = mask.width  = ov.width  = w;
      main.height = mask.height = ov.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      mCtx.clearRect(0, 0, w, h);
      oCtx.clearRect(0, 0, w, h);
      setImageLoaded(true);
      setHistory([{ maskData: mCtx.getImageData(0, 0, w, h), label: "Initial" }]);
      setRedoStack([]);
    };

    if (uploadedImage) {
      img.src = uploadedImage;
    } else {
      // Demo canvas: draws a sample building facade
      const W = 960, H = 540;
      main.width = mask.width = ov.width = W;
      main.height = mask.height = ov.height = H;

      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.4);
      sky.addColorStop(0, "#93c5fd");
      sky.addColorStop(1, "#bfdbfe");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.4);

      // Ground
      ctx.fillStyle = "#d1d5db";
      ctx.fillRect(0, H * 0.82, W, H);

      // Main building body
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(100, 120, 760, 420);

      // Accent wall (right wing)
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(620, 120, 240, 420);

      // Roof trim
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(80, 100, 800, 30);

      // Left pillar
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(100, 120, 50, 420);

      // Right pillar
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(810, 120, 50, 420);

      // Door
      ctx.fillStyle = "#374151";
      ctx.fillRect(310, 340, 120, 200);

      // Windows
      [[160, 180, 100, 80], [420, 180, 100, 80], [650, 180, 100, 80], [160, 300, 100, 80], [420, 300, 100, 80], [650, 300, 100, 80]].forEach(([x, y, w2, h2]) => {
        ctx.fillStyle = "#bae6fd";
        ctx.fillRect(x, y, w2, h2);
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w2, h2);
        ctx.beginPath();
        ctx.moveTo(x + w2 / 2, y); ctx.lineTo(x + w2 / 2, y + h2);
        ctx.moveTo(x, y + h2 / 2); ctx.lineTo(x + w2, y + h2 / 2);
        ctx.strokeStyle = "#64748b";
        ctx.stroke();
      });

      setImageLoaded(true);
      mCtx.clearRect(0, 0, W, H);
      setHistory([{ maskData: mCtx.getImageData(0, 0, W, H), label: "Initial" }]);
      setRedoStack([]);
    }
  }, [uploadedImage]);

  // ── Lighting Overlay ──────────────────────────────────────────────────────
  const lightGradient: Record<LightMode, string> = {
    day:    "none",
    golden: "linear-gradient(180deg, rgba(251,146,60,0.22) 0%, rgba(194,65,12,0.12) 100%)",
    dusk:   "linear-gradient(180deg, rgba(30,58,138,0.32) 0%, rgba(15,23,42,0.45) 100%)",
    night:  "linear-gradient(180deg, rgba(3,7,18,0.62) 0%, rgba(15,23,42,0.82) 100%)",
  };

  // ── Save history state ────────────────────────────────────────────────────
  const saveHistory = useCallback((label: string) => {
    const mask = maskCanvas.current;
    if (!mask) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    const state = ctx.getImageData(0, 0, mask.width, mask.height);
    setHistory(prev => [...prev, { maskData: state, label }]);
    setRedoStack([]);
  }, []);

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const mask = maskCanvas.current;
    if (!mask || history.length <= 1) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    const current = ctx.getImageData(0, 0, mask.width, mask.height);
    setRedoStack(prev => [{ maskData: current, label: "redo" }, ...prev]);
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    ctx.putImageData(newHistory[newHistory.length - 1].maskData, 0, 0);
  }, [history]);

  // ── Redo ──────────────────────────────────────────────────────────────────
  const redo = useCallback(() => {
    const mask = maskCanvas.current;
    if (!mask || redoStack.length === 0) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    const [next, ...rest] = redoStack;
    setRedoStack(rest);
    setHistory(prev => [...prev, next]);
    ctx.putImageData(next.maskData, 0, 0);
  }, [redoStack]);

  // ── Upload Handler ────────────────────────────────────────────────────────
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoaded(false);
    const reader = new FileReader();
    reader.onload = ev => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── BFS Flood Fill (Smart Edge Detect) ───────────────────────────────────
  const floodFill = useCallback((startX: number, startY: number) => {
    const main = mainCanvas.current;
    const mask = maskCanvas.current;
    if (!main || !mask) return;

    const mainCtx = main.getContext("2d");
    const maskCtx = mask.getContext("2d");
    if (!mainCtx || !maskCtx) return;

    const W = main.width, H = main.height;

    saveHistory(`Paint ${selectedSwatch.code}`);

    const imgPx = mainCtx.getImageData(0, 0, W, H).data;
    const si = (startY * W + startX) * 4;
    const tR = imgPx[si], tG = imgPx[si + 1], tB = imgPx[si + 2];

    const { r: fR, g: fG, b: fB } = hexToRgb(selectedSwatch.hex);

    const maskImg  = maskCtx.getImageData(0, 0, W, H);
    const maskPx   = maskImg.data;
    const visited  = new Uint8Array(W * H);
    const queue: number[] = [startX + startY * W];
    visited[startX + startY * W] = 1;

    const tol = tolerance * 3;

    while (queue.length > 0) {
      const pos = queue.pop()!;
      const cx  = pos % W;
      const cy  = (pos - cx) / W;
      const idx = pos * 4;

      maskPx[idx]     = fR;
      maskPx[idx + 1] = fG;
      maskPx[idx + 2] = fB;
      maskPx[idx + 3] = 200;

      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const nPos = nx + ny * W;
        if (visited[nPos]) continue;
        visited[nPos] = 1;
        const nIdx = nPos * 4;
        const diff = Math.abs(imgPx[nIdx] - tR) + Math.abs(imgPx[nIdx + 1] - tG) + Math.abs(imgPx[nIdx + 2] - tB);
        if (diff < tol) queue.push(nPos);
      }
    }

    maskCtx.putImageData(maskImg, 0, 0);

    // Add to recent
    setRecentSwatches(prev => {
      const filtered = prev.filter(s => s.code !== selectedSwatch.code);
      return [selectedSwatch, ...filtered].slice(0, 8);
    });
  }, [selectedSwatch, tolerance, saveHistory]);

  // ── Erase Circle ─────────────────────────────────────────────────────────
  const eraseAt = useCallback((x: number, y: number) => {
    const mask = maskCanvas.current;
    if (!mask) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [brushSize]);

  // ── Canvas Click Handler ──────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const mask = maskCanvas.current;
    if (!mask || !imageLoaded) return;

    const rect   = mask.getBoundingClientRect();
    const scaleX = mask.width  / rect.width;
    const scaleY = mask.height / rect.height;
    const cx     = Math.floor((e.clientX - rect.left) * scaleX);
    const cy     = Math.floor((e.clientY - rect.top)  * scaleY);

    if (activeTool === "paint" || activeTool === "magic") {
      floodFill(cx, cy);
    } else if (activeTool === "erase") {
      saveHistory("Erase");
      eraseAt(cx, cy);
    } else if (activeTool === "polygon") {
      setPolygonPoints(prev => [...prev, { x: cx, y: cy }]);
    }
  }, [activeTool, imageLoaded, floodFill, eraseAt, saveHistory]);

  // ── Canvas Mouse Move (brush erase drag) ─────────────────────────────────
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return;
    if (activeTool !== "erase" && activeTool !== "brush") return;

    const mask = maskCanvas.current;
    if (!mask || !imageLoaded) return;
    const rect   = mask.getBoundingClientRect();
    const scaleX = mask.width  / rect.width;
    const scaleY = mask.height / rect.height;
    const cx     = Math.floor((e.clientX - rect.left) * scaleX);
    const cy     = Math.floor((e.clientY - rect.top)  * scaleY);
    eraseAt(cx, cy);
  }, [activeTool, imageLoaded, eraseAt]);

  // ── Close Polygon and fill ────────────────────────────────────────────────
  const closePolygon = useCallback(() => {
    if (polygonPoints.length < 3) return;
    const mask = maskCanvas.current;
    if (!mask) return;
    const ctx = mask.getContext("2d");
    if (!ctx) return;

    saveHistory(`Polygon ${selectedSwatch.code}`);

    const { r, g, b } = hexToRgb(selectedSwatch.hex);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    polygonPoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = `rgba(${r},${g},${b},0.78)`;
    ctx.fill();
    ctx.restore();

    setPolygonPoints([]);
    setIsDrawingPolygon(false);
  }, [polygonPoints, selectedSwatch, saveHistory]);

  // ── Select Swatch ─────────────────────────────────────────────────────────
  const selectSwatch = useCallback((s: Swatch) => {
    setSelectedSwatch(s);
    if (!activeSwatches.some(a => a.code === s.code)) {
      setActiveSwatches(prev => [s, ...prev].slice(0, 6));
    }
  }, [activeSwatches]);

  // ── Toggle Favourite ──────────────────────────────────────────────────────
  const toggleFav = useCallback((code: string) => {
    setFavourites(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  }, []);

  // ── Apply AI Theme ────────────────────────────────────────────────────────
  const applyAITheme = useCallback((theme: AITheme) => {
    setAiTheme(theme);
    theme.swatches.forEach(({ code }) => {
      const s = SWATCHES.find(sw => sw.code === code);
      if (s) setSelectedSwatch(s);
    });
    const main = SWATCHES.find(sw => sw.code === theme.swatches[0]?.code);
    if (main) selectSwatch(main);
  }, [selectSwatch]);

  // ── Surprise Me ──────────────────────────────────────────────────────────
  const surpriseMe = useCallback(() => {
    const theme = AI_THEMES[Math.floor(Math.random() * AI_THEMES.length)];
    applyAITheme(theme);
  }, [applyAITheme]);

  // ── Save / Quotation ──────────────────────────────────────────────────────
  const handleSave = () => {
    startTransition(async () => {
      const res = await saveColorDesign({
        customer_id: customer,
        project_name: projectName,
        image_url: uploadedImage || null,
        selected_colors: activeSwatches.map(s => ({ code: s.code, name: s.name, hex: s.hex })),
        estimated_cost: grandTotal,
      });
      alert(res.success ? "Design saved successfully!" : res.error || "Save failed");
    });
  };

  const handleQuotation = () => {
    startTransition(async () => {
      const custName = customers.find(c => c.id === customer)?.name || "Customer";
      const res = await createDealerQuotation({
        customer_id: customer,
        customer_name: custName,
        items: [
          { id: "PUTTY",  name: "WeatherShield Putty",           qty: estPutty,  rate: 50 },
          { id: "PRIMER", name: "Damp-Block Exterior Primer",     qty: estPrimer, rate: 150 },
          { id: selectedProduct, name: `${activeProduct?.name} — ${selectedSwatch.code}`, qty: estPaint, rate },
          ...(estTexture > 0 ? [{ id: "TEXTURE", name: `Texture — ${selectedTexture?.name}`, qty: estTexture, rate: 80 }] : []),
        ],
        subtotal: Math.round(grandTotal / 1.18),
        total_gst: Math.round(grandTotal - grandTotal / 1.18),
        grand_total: grandTotal,
      });
      if (res.success) {
        setShowLeads(true);
        alert("Quotation created successfully!");
      } else {
        alert(res.error || "Failed");
      }
    });
  };

  // ── PDF Export (jsPDF + html2canvas) ─────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    const main = mainCanvas.current;
    const mask = maskCanvas.current;
    if (!main) return;

    try {
      // Composite: draw main + mask onto a temp canvas
      const comp = document.createElement("canvas");
      comp.width = main.width;
      comp.height = main.height;
      const ctx = comp.getContext("2d")!;
      ctx.drawImage(main, 0, 0);
      if (mask) {
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.9;
        ctx.drawImage(mask, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }

      const imgData = comp.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297, H = 210;
      const imgH = (comp.height / comp.width) * W;
      const yOffset = Math.max(0, (H - imgH) / 2 - 10);

      // Header
      pdf.setFillColor(124, 58, 237);
      pdf.rect(0, 0, W, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("SHARMA INDUSTRIES — AI Paint Studio Spec Sheet", 14, 12);
      pdf.setFontSize(9);
      pdf.text(`Project: ${projectName}  |  Colour: ${selectedSwatch.code} ${selectedSwatch.name}  |  Date: ${new Date().toLocaleDateString("en-IN")}`, 14, 17);

      // Image
      pdf.addImage(imgData, "JPEG", 0, 20, W, Math.min(imgH, H - 60));

      // Swatch palette bar at bottom
      const swatchY = H - 38;
      pdf.setFillColor(245, 245, 250);
      pdf.rect(0, swatchY, W, 38, "F");
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("ACTIVE PALETTE", 14, swatchY + 6);

      activeSwatches.slice(0, 6).forEach((s, i) => {
        const swX = 14 + i * 45;
        const { r, g, b } = hexToRgb(s.hex);
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(swX, swatchY + 9, 12, 12, 2, 2, "F");
        pdf.setTextColor(40, 40, 40);
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.text(s.code, swX, swatchY + 25);
        pdf.text(s.name, swX, swatchY + 30);
      });

      // Grand total
      pdf.setTextColor(124, 58, 237);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Estimate: \u20b9${grandTotal.toLocaleString("en-IN")}`, W - 60, swatchY + 20);

      pdf.save(`Sharma-Studio-${projectName.replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    }
  }, [mainCanvas, maskCanvas, projectName, selectedSwatch, activeSwatches, grandTotal]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full space-y-0 animate-in fade-in duration-500 pb-6 min-h-screen">

      {/* ═══ APP BAR ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Wand2 size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-foreground tracking-tight">AI Paint Visualizer</h1>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/25 uppercase tracking-widest">
                Pro Dealer Studio
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Tap walls to paint • AI segmentation • 28 Sharma swatch codes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button onClick={undo} disabled={history.length <= 1} className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-30 transition-all" title="Undo">
            <RotateCcw size={15} className="text-foreground" />
          </button>
          <button onClick={redo} disabled={redoStack.length === 0} className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-30 transition-all" title="Redo">
            <RotateCw size={15} className="text-foreground" />
          </button>

          <button onClick={() => setShowCompare(v => !v)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${showCompare ? "bg-primary text-white border-primary shadow-md shadow-primary/25" : "bg-card border-border hover:bg-muted"}`}>
            <Columns2 size={14} /> Before / After
          </button>

          <button onClick={() => setShowSpecSheet(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold transition-all">
            <Eye size={14} /> Spec Sheet
          </button>

          <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold transition-all">
            <FileText size={14} /> Save
          </button>

          <button onClick={handleQuotation} disabled={isPending} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all">
            <FileSpreadsheet size={14} /> Generate Quotation
          </button>
        </div>
      </div>

      {/* ═══ TOOL RIBBON ════════════════════════════════════════════════════ */}
      <div className="px-5 py-2 bg-background/60 backdrop-blur border-b border-border/40 flex flex-wrap items-center gap-3">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60">
          {([
            { id: "paint",   icon: <Paintbrush size={14} />, label: "Paint" },
            { id: "erase",   icon: <Eraser size={14} />,     label: "Erase" },
            { id: "brush",   icon: <Circle size={14} />,     label: "Brush" },
            { id: "polygon", icon: <Scissors size={14} />,   label: "Lasso" },
            { id: "magic",   icon: <Wand2 size={14} />,      label: "Magic" },
          ] as { id: Tool; icon: React.ReactNode; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                if (t.id !== "polygon") { setPolygonPoints([]); setIsDrawingPolygon(false); }
                else setIsDrawingPolygon(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === t.id ? "bg-primary text-white shadow-md shadow-primary/25" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Polygon Close (when drawing) */}
        {activeTool === "polygon" && polygonPoints.length >= 3 && (
          <button onClick={closePolygon} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold animate-pulse">
            <Check size={13} /> Close & Fill ({polygonPoints.length} pts)
          </button>
        )}

        <div className="h-5 w-px bg-border" />

        {/* Brush Size (erase/brush) */}
        {(activeTool === "erase" || activeTool === "brush") && (
          <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            Brush
            <input type="range" min={5} max={60} value={brushSize} onChange={e => setBrushSize(+e.target.value)} className="w-24 h-1.5 accent-primary" />
            <span className="font-mono text-foreground w-6">{brushSize}</span>
          </label>
        )}

        {/* Tolerance (paint/magic) */}
        {(activeTool === "paint" || activeTool === "magic") && (
          <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            Tolerance
            <input type="range" min={10} max={120} value={tolerance} onChange={e => setTolerance(+e.target.value)} className="w-24 h-1.5 accent-primary" />
            <span className="font-mono text-foreground w-8">{tolerance}</span>
          </label>
        )}

        <div className="h-5 w-px bg-border" />

        {/* Lighting */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/60">
          <span className="text-[10px] font-black text-muted-foreground px-2 uppercase">Light:</span>
          {([
            { id: "day",    icon: <Sun size={13} />,      label: "Day",    color: "text-amber-400" },
            { id: "golden", icon: <CloudSun size={13} />, label: "Golden", color: "text-orange-400" },
            { id: "dusk",   icon: <Moon size={13} />,     label: "Dusk",   color: "text-indigo-400" },
            { id: "night",  icon: <Star size={13} />,     label: "Night",  color: "text-sky-400" },
          ] as { id: LightMode; icon: React.ReactNode; label: string; color: string }[]).map(l => (
            <button
              key={l.id}
              onClick={() => setLightMode(l.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${lightMode === l.id ? `${l.color} bg-white/10 ring-1 ring-current` : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(v => Math.max(50, v - 15))} className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted"><ZoomOut size={12} /></button>
          <span className="text-[11px] font-mono font-bold w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(v => Math.min(200, v + 15))} className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted"><ZoomIn size={12} /></button>
          <button onClick={() => setZoom(100)} className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted"><Maximize2 size={12} /></button>
        </div>

        {/* Upload */}
        <div className="ml-auto flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-black hover:bg-primary/20 transition-all">
            <Upload size={13} /> Upload Photo
          </button>
          <button onClick={surpriseMe} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-black hover:opacity-80 transition-all animate-pulse">
            <Shuffle size={13} /> Surprise Me!
          </button>
        </div>
      </div>

      {/* ═══ MAIN WORKSPACE ════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas Stage ──────────────────────────────────────────────── */}
        <div className="flex-1 bg-neutral-950 relative overflow-auto flex items-center justify-center min-h-[500px] p-6">

          {/* Lighting Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 transition-all duration-700"
               style={{ background: lightGradient[lightMode] }} />

          {/* Canvas Stack */}
          <div className="relative inline-block shadow-2xl rounded-2xl overflow-hidden border border-white/10"
               style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}>

            {/* Layer 1: Original Photo */}
            <canvas ref={mainCanvas} className="block max-w-full" />

            {/* Layer 2: Paint Mask (mix-blend-multiply = preserves shadows) */}
            <canvas
              ref={maskCanvas}
              className="absolute inset-0 w-full h-full z-10 mix-blend-multiply opacity-90"
              style={{
                cursor:
                  activeTool === "erase" || activeTool === "brush" ? `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${brushSize * 2}' height='${brushSize * 2}'><circle cx='${brushSize}' cy='${brushSize}' r='${brushSize - 1}' fill='none' stroke='white' stroke-width='1.5'/></svg>") ${brushSize} ${brushSize}, crosshair` :
                  activeTool === "polygon" ? "crosshair" :
                  "crosshair"
              }}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />

            {/* Layer 3: SVG Polygon Preview Overlay */}
            {activeTool === "polygon" && polygonPoints.length > 0 && (
              <svg
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
                viewBox={`0 0 ${mainCanvas.current?.width ?? 960} ${mainCanvas.current?.height ?? 540}`}
                preserveAspectRatio="none"
              >
                <polyline
                  points={polygonPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                {polygonPoints.map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                    <text x={pt.x + 5} y={pt.y - 5} fill="#fff" fontSize="10" fontWeight="bold">{i + 1}</text>
                  </g>
                ))}
                {polygonPoints.length >= 3 && (
                  <line
                    x1={polygonPoints[polygonPoints.length - 1].x}
                    y1={polygonPoints[polygonPoints.length - 1].y}
                    x2={polygonPoints[0].x}
                    y2={polygonPoints[0].y}
                    stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
                  />
                )}
              </svg>
            )}

            {/* Layer 4: Texture Overlay */}
            {selectedTexture && (
              <div
                className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-all duration-500"
                style={{
                  opacity: (selectedTexture.opacity * textureControls.opacity) / (100 * 100),
                  backgroundSize: `${textureControls.scale}px ${textureControls.scale}px`,
                  transform: `rotate(${textureControls.rotation}deg)`,
                  backgroundImage: getTexturePattern(selectedTexture.id),
                }}
              />
            )}

            {/* Canvas HUD Status */}
            <div className="absolute bottom-3 left-3 z-30">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: selectedSwatch.hex }} />
                <span className="text-[10px] font-bold text-white">
                  {activeTool === "paint" || activeTool === "magic" ? `Tap wall → ${selectedSwatch.code} ${selectedSwatch.name}` :
                   activeTool === "erase" ? "Drag to erase paint" :
                   activeTool === "brush" ? "Drag to paint" :
                   activeTool === "polygon" ? `Polygon selection (${polygonPoints.length} pts)` : ""}
                </span>
              </div>
            </div>

            {/* Image Not Loaded indicator */}
            {!imageLoaded && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <p className="text-white text-sm font-bold">Processing image...</p>
                </div>
              </div>
            )}
          </div>

          {/* Before/After Slider */}
          {showCompare && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
              <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Before / After:</span>
              <input
                type="range" min={0} max={100} value={sliderPos}
                onChange={e => setSliderPos(+e.target.value)}
                className="w-32 h-1.5 accent-primary"
              />
              <span className="text-xs font-mono font-bold text-white">{sliderPos}%</span>
            </div>
          )}
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ x: 340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 340, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[340px] border-l border-border/60 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden"
            >
              {/* Active Swatch Tray */}
              <div className="px-4 pt-3 pb-2 border-b border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Palette</span>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <PanelLeftOpen size={14} />
                  </button>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {activeSwatches.map(s => (
                    <button
                      key={s.code}
                      onClick={() => selectSwatch(s)}
                      className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 transition-all shadow-sm ${selectedSwatch.code === s.code ? "border-primary scale-110 shadow-md shadow-primary/30" : "border-border/50 hover:scale-105"}`}
                      style={{ backgroundColor: s.hex }}
                      title={`${s.code} ${s.name}`}
                    />
                  ))}
                  <button
                    onClick={() => setActivePanel("colours")}
                    className="flex-shrink-0 w-8 h-8 rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary text-muted-foreground transition-all"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Goes Well With */}
                {goesWellWith.length > 0 && (
                  <div className="bg-muted/30 rounded-xl p-2 flex items-center gap-2 border border-border/40">
                    <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">Goes with:</span>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {goesWellWith.map(s => (
                        <button
                          key={s.code}
                          onClick={() => selectSwatch(s)}
                          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border hover:border-primary text-[10px] font-bold transition-all"
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.hex }} />
                          {s.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Tabs */}
              <div className="flex border-b border-border/40 overflow-x-auto no-scrollbar">
                {([
                  { id: "colours",    icon: <Palette size={13} />,          label: "Colours" },
                  { id: "textures",   icon: <Grid size={13} />,             label: "Textures" },
                  { id: "wallpapers", icon: <LayoutGrid size={13} />,       label: "Wallpaper" },
                  { id: "stencils",   icon: <Triangle size={13} />,         label: "Stencils" },
                  { id: "ai",         icon: <Sparkles size={13} />,         label: "AI" },
                  { id: "calculator", icon: <SlidersHorizontal size={13} />,label: "Calc" },
                ] as { id: ActivePanel; icon: React.ReactNode; label: string }[]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`flex items-center justify-center gap-1 px-2 py-2.5 text-[10px] font-bold whitespace-nowrap transition-all border-b-2 ${activePanel === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">

                {/* ── COLOURS TAB ─────────────────────────────────────── */}
                {activePanel === "colours" && (
                  <div className="p-3 space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-2.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search code, name, collection..."
                        value={swatchSearch}
                        onChange={e => setSwatchSearch(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60"
                      />
                    </div>

                    {/* Category Chips */}
                    <div className="flex gap-1.5 flex-wrap">
                      {["All", "Exterior WeatherShield", "Interior Royale Silk", "Royale Accents", "Earthy Heritage", "Pastels & Whites", "Modern Urban", "Luxury Collection"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSwatchCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${swatchCategory === cat ? "bg-primary text-white shadow-sm shadow-primary/30" : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                        >
                          {cat === "All" ? "All" : cat.split(" ")[0]}
                        </button>
                      ))}
                    </div>

                    {/* Recent */}
                    {recentSwatches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock size={11} className="text-muted-foreground" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Recently Used</span>
                        </div>
                        <div className="flex gap-1.5">
                          {recentSwatches.map(s => (
                            <button
                              key={s.code}
                              onClick={() => selectSwatch(s)}
                              className="w-7 h-7 rounded-lg border-2 border-border/50 hover:scale-110 transition-all shadow-sm"
                              style={{ backgroundColor: s.hex }}
                              title={s.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Swatches Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {filteredSwatches.map(s => {
                        const isSelected = selectedSwatch.code === s.code;
                        const isFav = favourites.includes(s.code);

                        return (
                          <div
                            key={s.code}
                            className={`group rounded-xl border overflow-hidden cursor-pointer transition-all ${isSelected ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border/50 hover:border-border"}`}
                            onClick={() => selectSwatch(s)}
                          >
                            {/* Colour Chip */}
                            <div
                              className="w-full aspect-video relative"
                              style={{ backgroundColor: s.hex }}
                            >
                              {/* Fav button */}
                              <button
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={e => { e.stopPropagation(); toggleFav(s.code); }}
                              >
                                <Heart size={10} className={isFav ? "fill-red-400 text-red-400" : "text-white/70"} />
                              </button>
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <CheckCircle2 size={16} className="text-white drop-shadow-lg" />
                                </div>
                              )}
                            </div>
                            {/* Swatch Info */}
                            <div className="p-1.5 bg-card">
                              <p className="text-[9px] font-mono font-black text-foreground leading-none">{s.code}</p>
                              <p className="text-[10px] font-semibold text-foreground/80 truncate leading-tight">{s.name}</p>
                              <p className="text-[8px] text-muted-foreground truncate">{s.finish}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── TEXTURES TAB ─────────────────────────────────────── */}
                {activePanel === "textures" && (
                  <div className="p-3 space-y-3">
                    {/* Texture Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {TEXTURES.map(tex => {
                        const isSelected = selectedTexture?.id === tex.id;
                        return (
                          <button
                            key={tex.id}
                            onClick={() => setSelectedTexture(isSelected ? null : tex)}
                            className={`rounded-xl border overflow-hidden text-left transition-all ${isSelected ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border/50 hover:border-border"}`}
                          >
                            <div
                              className="w-full aspect-video"
                              style={{ backgroundColor: tex.previewHex, backgroundImage: getTexturePattern(tex.id) }}
                            />
                            <div className="p-2 bg-card">
                              <p className="text-[9px] font-mono font-black text-muted-foreground">{tex.code}</p>
                              <p className="text-[11px] font-bold text-foreground truncate">{tex.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Texture Controls */}
                    {selectedTexture && (
                      <div className="bg-muted/20 border border-border/60 rounded-xl p-3 space-y-2.5">
                        <p className="text-[11px] font-black text-foreground uppercase tracking-wider">
                          {selectedTexture.name} Controls
                        </p>
                        {([
                          { key: "scale",    label: "Scale",    min: 20, max: 300 },
                          { key: "rotation", label: "Rotation", min: 0,  max: 360 },
                          { key: "opacity",  label: "Opacity",  min: 10, max: 100 },
                          { key: "depth",    label: "Depth",    min: 0,  max: 100 },
                          { key: "roughness",label: "Roughness",min: 0,  max: 100 },
                        ] as { key: keyof typeof textureControls; label: string; min: number; max: number }[]).map(c => (
                          <label key={c.key} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="w-16 font-bold text-foreground">{c.label}</span>
                            <input
                              type="range" min={c.min} max={c.max}
                              value={textureControls[c.key]}
                              onChange={e => setTextureControls(prev => ({ ...prev, [c.key]: +e.target.value }))}
                              className="flex-1 h-1.5 accent-primary"
                            />
                            <span className="font-mono w-7 text-right">{textureControls[c.key]}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── AI THEMES TAB ────────────────────────────────────── */}
                {activePanel === "ai" && (
                  <div className="p-3 space-y-3">
                    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-300 font-medium">
                      <Sparkles size={13} className="inline mr-1.5 text-violet-400" />
                      AI generates complete colour schemes tuned for architectural excellence.
                    </div>

                    {AI_THEMES.map((theme, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => applyAITheme(theme)}
                        className={`w-full text-left rounded-xl border p-3 transition-all ${aiTheme?.name === theme.name ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-border/50 bg-card hover:border-border"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-primary">{theme.icon}</span>
                            <span className="text-xs font-black text-foreground">{theme.name}</span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{theme.mood}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">{theme.description}</p>
                        <div className="flex gap-1">
                          {theme.swatches.map(({ code }) => {
                            const s = SWATCHES.find(sw => sw.code === code);
                            return s ? (
                              <div key={code} className="flex-1 h-4 rounded-md" style={{ backgroundColor: s.hex }} title={s.name} />
                            ) : null;
                          })}
                        </div>
                      </motion.button>
                    ))}

                    <button
                      onClick={surpriseMe}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-black text-sm hover:opacity-80 transition-all"
                    >
                      <Shuffle size={16} /> ✨ Surprise Me — Random Luxury Theme
                    </button>
                  </div>
                )}

                {/* ── WALLPAPERS TAB ──────────────────────────────────── */}
                {activePanel === "wallpapers" && (
                  <div className="p-3 space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Designer Wallpaper Patterns</p>
                    <div className="grid grid-cols-2 gap-2">
                      {WALLPAPERS.map(wp => (
                        <button
                          key={wp.id}
                          className="rounded-xl border border-border/50 overflow-hidden text-left hover:border-primary transition-all"
                        >
                          <div
                            className="w-full aspect-video"
                            style={{
                              background: wp.pattern,
                              backgroundColor: wp.baseColor,
                            }}
                          />
                          <div className="p-2 bg-card">
                            <p className="text-[9px] font-black text-muted-foreground">{wp.category}</p>
                            <p className="text-[11px] font-bold text-foreground truncate">{wp.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="bg-muted/20 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-400 font-medium">
                      💡 Wallpaper patterns overlay on selected wall zones. Use the Lasso tool to define the accent wall first.
                    </div>
                  </div>
                )}

                {/* ── STENCILS TAB ─────────────────────────────────────── */}
                {activePanel === "stencils" && (
                  <div className="p-3 space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Decorative Stencil Patterns</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STENCILS.map(st => (
                        <button
                          key={st.id}
                          className="rounded-xl border border-border/50 overflow-hidden text-left hover:border-primary transition-all group"
                        >
                          <div
                            className="w-full aspect-video flex items-center justify-center"
                            style={{ backgroundColor: st.previewColor + "22" }}
                          >
                            <svg viewBox="0 0 100 60" className="w-3/4 h-3/4">
                              <path d={st.svgPath} fill={st.previewColor} opacity="0.8" />
                            </svg>
                          </div>
                          <div className="p-2 bg-card">
                            <p className="text-[9px] font-black text-muted-foreground">{st.category}</p>
                            <p className="text-[11px] font-bold text-foreground truncate">{st.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="bg-muted/20 border border-violet-500/20 rounded-xl p-3 text-[11px] text-violet-300 font-medium">
                      🎨 Click a stencil then click on the canvas to stamp it at any position.
                    </div>
                  </div>
                )}

                {/* ── CALCULATOR TAB ───────────────────────────────────── */}
                {activePanel === "calculator" && (
                  <div className="p-3 space-y-3">
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 block">Customer</label>
                        <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-medium">
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 block">Project Name</label>
                        <input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary" />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 block">Paint Grade</label>
                        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.mrp}/L</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 block">Wall Area (sq.ft)</label>
                          <input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary font-mono font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 block">Wastage %</label>
                          <select value={wastage} onChange={e => setWastage(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary">
                            {["5", "10", "15", "20"].map(w => <option key={w} value={w}>{w}%</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Material Breakdown */}
                    <div className="bg-muted/20 border border-border/60 rounded-xl p-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5 mb-2">Material Estimate</p>
                      {[
                        { label: "WeatherShield Putty",  qty: `${estPutty} kg`,  cost: puttyCost },
                        { label: "Damp-Block Primer",    qty: `${estPrimer} L`,  cost: primerCost },
                        { label: `Paint (${selectedSwatch.code})`, qty: `${estPaint} L`, cost: paintCost },
                        ...(selectedTexture ? [{ label: `${selectedTexture.name}`, qty: `${estTexture} kg`, cost: textureCost }] : []),
                        { label: "Labor Charges",        qty: `₹18/sq.ft`,      cost: laborCost },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-foreground font-semibold">{row.label}</span>
                            <span className="text-muted-foreground ml-1.5">({row.qty})</span>
                          </div>
                          <span className="font-mono font-bold text-foreground">₹{row.cost.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs border-t border-border/60 pt-2 mt-1 font-black">
                        <span className="text-foreground">Grand Total</span>
                        <span className="font-mono text-primary text-base">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* CTA Row */}
                    <button
                      onClick={handleQuotation}
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-sm shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all"
                    >
                      <FileSpreadsheet size={15} /> Generate Official Quotation
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleExportPDF}
                        disabled={isPending}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition-all"
                      >
                        <Download size={13} /> Export PDF
                      </button>
                      <button
                        onClick={() => {
                          const shareText = `Check out my paint design — ${selectedSwatch.name} (${selectedSwatch.code}) for project: ${projectName}. Estimated cost: ₹${grandTotal.toLocaleString()}`;
                          if (navigator.share) {
                            navigator.share({ title: projectName, text: shareText });
                          } else {
                            navigator.clipboard.writeText(shareText);
                            alert("Design details copied to clipboard!");
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition-all"
                      >
                        <Share2 size={13} /> Share
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Panel Toggle */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-24 bg-card border border-border rounded-l-xl flex items-center justify-center hover:bg-muted transition-all shadow-lg"
          >
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* ═══ SPEC SHEET MODAL ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSpecSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowSpecSheet(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>

              <div className="border-b border-border pb-4">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
                  <Shield size={14} /> Official Dealer Paint Studio Specification Sheet
                </div>
                <h2 className="text-2xl font-black text-foreground">{projectName}</h2>
                <p className="text-sm text-muted-foreground">
                  Customer: {customers.find(c => c.id === customer)?.name || "—"}
                  {selectedTexture ? ` • Texture: ${selectedTexture.name}` : ""}
                </p>
              </div>

              {/* Selected Swatches */}
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2">Selected Colour Palette</p>
                <div className="grid grid-cols-2 gap-3">
                  {activeSwatches.slice(0, 6).map(s => (
                    <div key={s.code} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                      <div className="w-10 h-10 rounded-xl border border-black/10 shadow-sm flex-shrink-0" style={{ backgroundColor: s.hex }} />
                      <div>
                        <p className="text-xs font-mono font-black text-foreground">{s.code}</p>
                        <p className="text-[11px] font-bold text-foreground/80">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground">{s.category} • {s.finish}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material & Cost Summary */}
              <div className="bg-muted/20 border border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Total Paint & Materials Required</p>
                  <p className="text-[11px] text-muted-foreground">
                    {estPaint} L Paint • {estPrimer} L Primer • {estPutty} kg Putty
                    {selectedTexture ? ` • ${estTexture} kg ${selectedTexture.name}` : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Wall Area: {areaNum.toLocaleString()} sq.ft • Wastage: {wastage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Grand Total Estimate</p>
                  <p className="text-2xl font-mono font-black text-primary">₹{grandTotal.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setShowSpecSheet(false)} className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted">Close</button>
                <button onClick={() => { setShowSpecSheet(false); handleQuotation(); }} className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all">
                  Convert to Official Quotation →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LEAD GENERATION MODAL ═════════════════════════════════════════ */}
      <AnimatePresence>
        {showLeads && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
            >
              <button onClick={() => setShowLeads(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"><X size={18} /></button>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-foreground">Love this Design?</h3>
                <p className="text-sm text-muted-foreground">Take the next step with your {projectName} project</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: <FileText size={16} />,    label: "Request Quote",    color: "bg-violet-600" },
                  { icon: <Building2 size={16} />,   label: "Book Site Visit",  color: "bg-blue-600" },
                  { icon: <Phone size={16} />,       label: "Call Dealer",      color: "bg-emerald-600" },
                  { icon: <MessageCircle size={16} />,label: "WhatsApp Dealer", color: "bg-green-600" },
                  { icon: <ArrowRight size={16} />,  label: "Find Nearest Dealer", color: "bg-amber-600" },
                  { icon: <Download size={16} />,    label: "Download PDF",     color: "bg-slate-600" },
                ].map((btn, i) => (
                  <button
                    key={i}
                    className={`${btn.color} text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold hover:opacity-90 transition-all shadow-md`}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTURE SVG PATTERN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function getTexturePattern(id: string): string {
  const patterns: Record<string, string> = {
    sand:        "radial-gradient(circle, rgba(210,175,116,0.6) 1px, transparent 1px)",
    granite:     "radial-gradient(circle, rgba(0,0,0,0.35) 1.5px, transparent 1.5px)",
    marble:      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(200,200,200,0.1) 50%, rgba(255,255,255,0.3) 100%)",
    stucco:      "radial-gradient(ellipse, rgba(180,180,180,0.3) 0%, transparent 60%)",
    travertine:  "repeating-linear-gradient(0deg, rgba(180,160,100,0.15) 0 3px, transparent 3px 12px)",
    cement:      "radial-gradient(circle, rgba(100,100,100,0.3) 2px, transparent 2px)",
    brick:       "repeating-linear-gradient(90deg, rgba(120,60,0,0.25) 0 2px, transparent 2px 40px), repeating-linear-gradient(0deg, rgba(100,40,0,0.2) 0 20px, transparent 20px 40px)",
    wood:        "repeating-linear-gradient(90deg, rgba(80,40,0,0.2) 0 1px, transparent 1px 10px)",
    metallic:    "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(180,180,180,0.2) 40%, rgba(255,255,255,0.5) 80%, rgba(160,160,160,0.1) 100%)",
    roller:      "repeating-radial-gradient(circle at center, rgba(255,255,255,0.12) 0 2px, transparent 2px 6px)",
    luxury:      "radial-gradient(circle, rgba(212,175,55,0.45) 2px, transparent 2px)",
    concrete:    "repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.12) 0 4px, transparent 4px 8px)",
  };
  return patterns[id] ?? "none";
}
