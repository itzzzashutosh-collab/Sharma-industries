const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");
const path = require("path");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function uuid() {
  return crypto.randomUUID();
}

let cachedBucketFiles = [];
async function loadBucketCache() {
  let allFiles = [];
  let page = 0;
  const limit = 100;
  while (true) {
    const { data, error } = await supabase.storage
      .from("competitor-products")
      .list("", { limit, offset: page * limit });
      
    if (error || !data || data.length === 0) break;
    allFiles = allFiles.concat(data.map(f => f.name));
    if (data.length < limit) break;
    page++;
  }
  cachedBucketFiles = allFiles;
  console.log(`📂 Loaded ${cachedBucketFiles.length} files from competitor-products storage bucket to cache.`);
}

const directMappings = {
  "Asian Paints: Apex Duracast Finetex": "ap-duracast-finetex.webp",
  "Asian Paints: Apex Duracast Roughtex": "ap-duracast-roughtex.webp",
  "Asian Paints: Apex Duracast Swirltex": "ap-duracast-swirltex.webp",
  "Asian Paints: Apex Duracast Pebbletex": "ap-duracast-pebbletex.webp",
  "Asian Paints: Apex Duracast Crosstex": "ap-duracast-crosstex.webp",
  "Asian Paints: Apex Duracast Dholpurtex": "apex-dholpurtex.webp",
  "Asian Paints: Trucare Super Putty": "trucare-super-putty.webp",
  "Asian Paints: Trucare 2x Primer Putty Mix": "trucare-2x-primer-putty-mix.webp",
  "Asian Paints: Acrylic Wall Putty": "acrylic-wall-putty.webp",
  "Asian Paints: Royale Play Special Effects": "royale-play-texture1.png",
  "Asian Paints: Royale Play Metallics": "06.webp",
  "Asian Paints: Royale Play Safari": "royale-play-safari.webp",
  "Asian Paints: Royale Play Dune": "royale-play-dune.webp",
  "Asian Paints: Royale Play Stucco": "royale-play-stucco.webp",

  "Nerolac Paints: Excel Texture Finish Scratch": "nerolac-excel-texture-finish-scratch.webp",
  "Nerolac Paints: Excel Texture Finish Frost": "nerolac-excel-texture-finish-scratch.webp",
  "Nerolac Paints: Wall Putty Acrylic": "wall-putty-acrylic-250x250.webp",
  "Nerolac Paints: Readymix Primer Putty": "readymix-primer-putty.webp",
  "Nerolac Paints: Putty Filler Grey Knifing": "nerolac-grey-knifing-paste-putty-filler-1.webp",

  "Indigo Paints: Indigo Polymer Putty": "polymer-putty.webp",
  "Indigo Paints: Indigo Polymer Putty Gold": "polymer-putty.webp",
  "Indigo Paints: Rustic Texture Finish": "polymer-putty.webp",

  "Berger Paints: Bison Wall Putty": "berger-bison-wall-putty.png",
  "Berger Paints: Happy Wall Acrylic Putty": "berger-happy-wall-acrylic-putty.png",
  "Berger Paints: Waterproof Putty For Wall": "berger-waterproof-putty.png",
  "Berger Paints: Berger Wall Castle Fine": "berger-waterproof-putty.png",
  "Berger Paints: Berger Ruff N Tuff Scratch": "berger-waterproof-putty.png",

  "Nippon Paint: Nippon Walltron Scratch Texture": "nippon-paint-fr-putty.png",
  "Nippon Paint: Nippon Walltron Swirl Texture": "nippon-paint-fr-putty.png",
  "Nippon Paint: Walltron Fr-putty": "nippon-paint-fr-putty.png",

  "Dulux: Weathershield Signature": "dulux-weathershield-signature.webp",
  "Dulux: Weathershield Tex": "dulux-weathershield-clear.webp",
  "Dulux: Woodguard Putty": "dulux-woodguard-wood-putty_s_1.webp"
};

function clean(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getBestImage(brand, product_name, category) {
  const directKey = `${brand}: ${product_name}`;
  if (directMappings[directKey]) {
    const filename = directMappings[directKey];
    let matched = filename;
    for (const f of cachedBucketFiles) {
      if (clean(f).startsWith(clean(filename.split('.')[0]))) {
        matched = f;
        const cleanedName = f.replace(/-\d+x\d+/, "");
        if (cleanedName !== f && cachedBucketFiles.includes(cleanedName)) {
          matched = cleanedName;
        }
        break;
      }
    }
    const { data } = supabase.storage.from("competitor-products").getPublicUrl(matched);
    return data.publicUrl;
  }

  const prodClean = clean(product_name);
  const brandClean = clean(brand);
  const otherBrandsList = ["asian", "nerolac", "indigo", "berger", "birla", "nippon", "dulux"].filter(b => b !== clean(brand.split(" ")[0]));
  
  let matchedFile = null;
  for (const filename of cachedBucketFiles) {
    const fileClean = clean(filename);
    const belongsToOtherBrand = otherBrandsList.some(otherBrand => fileClean.includes(otherBrand));
    if (belongsToOtherBrand) continue;

    if (fileClean.includes(prodClean) || prodClean.includes(fileClean.replace("webp", "").replace("png", "").replace("jpg", ""))) {
      matchedFile = filename;
      const cleanedName = filename.replace(/-\d+x\d+/, "");
      if (cleanedName !== filename && cachedBucketFiles.includes(cleanedName)) {
        matchedFile = cleanedName;
      }
      break;
    }
  }

  if (!matchedFile) {
    for (const filename of cachedBucketFiles) {
      const fileClean = clean(filename);
      const belongsToOtherBrand = otherBrandsList.some(otherBrand => fileClean.includes(otherBrand));
      if (belongsToOtherBrand) continue;

      const prodCleanNoBrand = clean(product_name.replace(brand, ""));
      if (prodCleanNoBrand.length > 3 && fileClean.includes(prodCleanNoBrand)) {
        matchedFile = filename;
        const cleanedName = filename.replace(/-\d+x\d+/, "");
        if (cleanedName !== filename && cachedBucketFiles.includes(cleanedName)) {
          matchedFile = cleanedName;
        }
        break;
      }
    }
  }

  if (!matchedFile) {
    let fallbackFile = null;
    if (brand === "Asian Paints") {
      fallbackFile = category.includes("Exterior") ? "apex-weatherproof-emulsion.webp" : "tractor-emulsion.webp";
    } else if (brand === "Nerolac Paints") {
      fallbackFile = "little-master.webp";
    } else if (brand === "Indigo Paints") {
      fallbackFile = "interior-emulsion-silver.webp";
    } else if (brand === "Berger Paints") {
      fallbackFile = "bison-acrylic-emulsion-can.png";
    } else if (brand === "Birla Opus") {
      fallbackFile = "birla-opus-price-one-pure-elegance.webp";
    } else if (brand === "Nippon Paint") {
      fallbackFile = "nippon-paint-breeze-2.png";
    }
    
    if (fallbackFile) {
      for (const f of cachedBucketFiles) {
        if (clean(f).startsWith(clean(fallbackFile.split('.')[0]))) {
          matchedFile = f;
          const cleanedName = f.replace(/-\d+x\d+/, "");
          if (cleanedName !== f && cachedBucketFiles.includes(cleanedName)) {
            matchedFile = cleanedName;
          }
          break;
        }
      }
    }
  }

  if (matchedFile) {
    const { data } = supabase.storage.from("competitor-products").getPublicUrl(matchedFile);
    return data.publicUrl;
  }
  
  return "";
}

async function ensureProductImageRenamed(brand, name, size, category, remoteUrl = null) {
  try {
    const cleanBrand = brand.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
    const cleanSize = size.toLowerCase()
      .replace(/\s*litre/g, "l")
      .replace(/\s*kg/g, "kg")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");
    
    const targetFilename = `${cleanBrand}_${cleanName}_${cleanSize}.webp`;

    // 1. Check if already exists in cache
    if (cachedBucketFiles.includes(targetFilename)) {
      const { data } = supabase.storage.from("competitor-products").getPublicUrl(targetFilename);
      return data.publicUrl;
    }

    // 2. Fetch image buffer (either download from remote URL, or download from existing file in bucket)
    let buffer = null;
    let mimeType = "image/webp";

    if (remoteUrl) {
      console.log(`📥 Downloading remote image for copying: ${remoteUrl}`);
      try {
        const res = await fetch(remoteUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
          mimeType = res.headers.get("content-type") || "image/webp";
        }
      } catch (err) {
        console.error(`  ❌ Failed to fetch remote url ${remoteUrl}:`, err.message);
      }
    }

    // Fallback: If no remoteUrl, or remote fetch failed, use our brand-aware getBestImage bucket matcher
    if (!buffer) {
      const originalUrl = getBestImage(brand, name, category);
      if (!originalUrl) {
        console.log(`⚠️ No matched source image found for: [${brand}] ${name}.`);
        return "";
      }
      const sourceFilename = path.basename(new URL(originalUrl).pathname);
      console.log(`📥 Copying source [${sourceFilename}] to target [${targetFilename}]...`);
      const { data: blob, error: downloadError } = await supabase.storage
        .from("competitor-products")
        .download(sourceFilename);

      if (downloadError) {
        console.error(`  ❌ Failed to download original image ${sourceFilename}:`, downloadError.message);
        return originalUrl;
      }
      const arrayBuffer = await blob.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // 3. Upload to target name
    console.log(`📤 Uploading renamed copy [${targetFilename}] to storage...`);
    const { error: uploadError } = await supabase.storage
      .from("competitor-products")
      .upload(targetFilename, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error(`  ❌ Failed to upload renamed image ${targetFilename}:`, uploadError.message);
      return "";
    }

    // Add to cache list
    cachedBucketFiles.push(targetFilename);

    const { data } = supabase.storage.from("competitor-products").getPublicUrl(targetFilename);
    return data.publicUrl;
  } catch (e) {
    console.error(`  ❌ Error processing renamed image for [${brand}] ${name}:`, e.message);
    return "";
  }
}

function makeRow({ brand, category, subcategory, product_name, pack_size, mrp, trade_price, dealer_margin_pct, installer_margin_pct, finish, coverage, drying_time, recoat_time, technology, warranty, interior_exterior, washability, voc, features, source, brand_color, image_url }) {
  return {
    id: uuid(),
    brand,
    category,
    subcategory,
    product_name,
    pack_size,
    mrp,
    finish,
    coverage,
    drying_time,
    recoat_time,
    technology,
    warranty,
    interior_exterior,
    washability,
    voc,
    features: JSON.stringify(features || []),
    source: source || "market_survey",
    description: JSON.stringify({ 
      trade_price: trade_price || Math.round(mrp * 0.85), 
      dealer_margin_pct: dealer_margin_pct || 12, 
      installer_margin_pct: installer_margin_pct || 5, 
      brand_color: brand_color,
      image_url: image_url || ""
    }),
    sheen: brand_color,
  };
}

// Helper to calculate pricing variations for different pack sizes
function getCalculatedMRP(baseSize, basePrice, targetSize) {
  const baseNum = parseFloat(baseSize);
  const targetNum = parseFloat(targetSize);
  if (baseSize.toLowerCase().includes("kg") && targetSize.toLowerCase().includes("kg")) {
    const ratio = targetNum / baseNum;
    return Math.round(basePrice * ratio);
  }
  const ratios = {
    "1L": 0.08,
    "4L": 0.28,
    "10L": 0.58,
    "20L": 1.00
  };
  
  if (baseSize.includes("20") && ratios[targetSize]) {
    const factor = ratios[targetSize];
    let markup = 1.0;
    if (targetSize === "1L") markup = 1.45;
    else if (targetSize === "4L") markup = 1.25;
    else if (targetSize === "10L") markup = 1.10;
    
    return Math.round(basePrice * factor * markup);
  }
  return basePrice;
}

// Scraped Asian Paints price list with real 2026 data
const rawAsianPaints = [
  // Distempers
  { name: "Tractor Acrylic Distemper", size: "20 KG", price: 1580, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "80-100 sq.ft/KG", tech: "Water thinnable", war: "1 Year", ie: "Interior" },
  { name: "Tractor Synthetic Distemper", size: "20 KG", price: 1344, cat: "Distemper", sub: "Synthetic Distemper", finish: "Matt", cov: "70-90 sq.ft/KG", tech: "Solvent based", war: "1 Year", ie: "Interior" },
  { name: "Tractor Uno Acrylic Distemper", size: "20 KG", price: 1580, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "80-100 sq.ft/KG", tech: "Water thinnable", war: "1 Year", ie: "Interior" },
  { name: "Tractor Aqualock", size: "20 KG", price: 1620, cat: "Distemper", sub: "Waterproof Distemper", finish: "Matt", cov: "80-100 sq.ft/KG", tech: "Hydrophobic", war: "2 Years", ie: "Interior" },

  // Interior Emulsions
  { name: "Tractor Emulsion", size: "20 Litre", price: 4240, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Acrylic Copolymer", war: "3 Years", ie: "Interior" },
  { name: "Tractor Emulsion Advanced", size: "20 Litre", price: 2147, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Acrylic Copolymer", war: "3 Years", ie: "Interior" },
  { name: "Apcolite Premium Emulsion", size: "20 Litre", price: 8750, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Pure Acrylic", war: "5 Years", ie: "Interior" },
  { name: "Apcolite Advanced Emulsion", size: "20 Litre", price: 5479, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Pure Acrylic", war: "5 Years", ie: "Interior" },
  { name: "Apcolite Premium Satin Emulsion", size: "20 Litre", price: 5507, cat: "Interior Emulsion", sub: "Satin Wall Finish", finish: "Satin", cov: "120-140 sq.ft/L", tech: "Satin Glow", war: "5 Years", ie: "Interior" },
  { name: "Lustre Interior Wall Finish", size: "20 Litre", price: 4616, cat: "Interior Emulsion", sub: "Lustre Wall Finish", finish: "Lustre", cov: "100-120 sq.ft/L", tech: "Solvent Thinnable", war: "4 Years", ie: "Interior" },
  { name: "Royale Luxury Emulsion", size: "20 Litre", price: 15280, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Soft Sheen", cov: "140-160 sq.ft/L", tech: "Teflon Protek", war: "6 Years", ie: "Interior" },
  { name: "Royale Shyne", size: "20 Litre", price: 8996, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "High Sheen", cov: "140-160 sq.ft/L", tech: "Teflon Protek", war: "6 Years", ie: "Interior" },
  { name: "Royale Matt", size: "20 Litre", price: 16730, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Matt", cov: "140-160 sq.ft/L", tech: "Teflon Protek", war: "6 Years", ie: "Interior" },
  { name: "Royale Aspira", size: "20 Litre", price: 11044, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Soft Sheen", cov: "140-160 sq.ft/L", tech: "Hydrophobic", war: "8 Years", ie: "Interior" },
  { name: "Royale Atmos", size: "20 Litre", price: 9790, cat: "Interior Emulsion", sub: "Fragrant Emulsion", finish: "Sheen", cov: "140-160 sq.ft/L", tech: "Activated Carbon", war: "6 Years", ie: "Interior" },
  { name: "Royale Lustre", size: "20 Litre", price: 7910, cat: "Interior Emulsion", sub: "Lustre Wall Finish", finish: "Semi-Gloss", cov: "120-140 sq.ft/L", tech: "Teflon Protek", war: "5 Years", ie: "Interior" },
  { name: "Royale Health Shield", size: "20 Litre", price: 16500, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "140-160 sq.ft/L", tech: "Sanitizing Shield", war: "8 Years", ie: "Interior" },

  // Exterior Emulsions
  { name: "Ace Emulsion", size: "20 Litre", price: 5030, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Exterior Acrylic", war: "3 Years", ie: "Exterior" },
  { name: "Ace Sparc Emulsion", size: "20 Litre", price: 3900, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "95-115 sq.ft/L", tech: "Sparc Tech", war: "2 Years", ie: "Exterior" },
  { name: "Ace Advanced", size: "20 Litre", price: 2668, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Silicon Protected", war: "3 Years", ie: "Exterior" },
  { name: "Apex Weatherproof Emulsion", size: "20 Litre", price: 8510, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Weatherproof Acrylic", war: "5 Years", ie: "Exterior" },
  { name: "Apex Advanced Weatherproof Emulsion", size: "20 Litre", price: 4543, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Silicon Protected", war: "5 Years", ie: "Exterior" },
  { name: "Apex Ultima", size: "20 Litre", price: 12710, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Smooth", cov: "120-140 sq.ft/L", tech: "Advanced Acrylic", war: "7 Years", ie: "Exterior" },
  { name: "Apex Ultima Protek", size: "20 Litre", price: 12644, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Smooth", cov: "120-140 sq.ft/L", tech: "Nano Technology", war: "10 Years", ie: "Exterior" },
  { name: "Apex Ultima Protek Duralife", size: "20 Litre", price: 19500, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Sheen", cov: "120-140 sq.ft/L", tech: "Duralife Nano", war: "10 Years", ie: "Exterior" },
  { name: "Apex Ultima Protek Lamino", size: "20 Litre", price: 15200, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Sheen", cov: "115-135 sq.ft/L", tech: "Lamino Elastomeric", war: "10 Years", ie: "Exterior" },
  { name: "Apex Ultima Protek Top Coat", size: "20 Litre", price: 18553, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Glossy", cov: "120-140 sq.ft/L", tech: "Lamination Tech", war: "10 Years", ie: "Exterior" },
  { name: "Apex Floor Guard", size: "4 Litre", price: 2826, cat: "Exterior Emulsion", sub: "Floor Coating", finish: "Semi-Gloss", cov: "80-100 sq.ft/L", tech: "Cross-linking Polymer", war: "4 Years", ie: "Exterior" },
  { name: "Apex Tile Guard", size: "20 Litre", price: 4666, cat: "Exterior Emulsion", sub: "Roof Coating", finish: "Glossy", cov: "100-120 sq.ft/L", tech: "Waterproof Acrylic", war: "5 Years", ie: "Exterior" },

  // Primers and Basecoats
  { name: "Decoprime Advanced Cement Primer", size: "20 Litre", price: 3300, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "130-150 sq.ft/L", tech: "Cement Primer", war: "N/A", ie: "Interior" },
  { name: "Trucare Interior Wall Primer Solvent Thinnable", size: "20 Litre", price: 2934, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Solvent Thinnable", war: "N/A", ie: "Interior" },
  { name: "Trucare Interior Wall Primer Water Thinnable", size: "20 Litre", price: 2104, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "130-150 sq.ft/L", tech: "Water Thinnable", war: "N/A", ie: "Interior" },
  { name: "Trucare Economy Interior Wall Primer Water Thinnable", size: "20 Litre", price: 1591, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Water Thinnable", war: "N/A", ie: "Interior" },
  { name: "Royale Wall Basecoat", size: "20 Litre", price: 3206, cat: "Primer", sub: "Premium Basecoat", finish: "Matt", cov: "145-165 sq.ft/L", tech: "Basecoat Seal", war: "N/A", ie: "Interior" },
  { name: "Trucare Exterior Wall Primer", size: "20 Litre", price: 2574, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "115-135 sq.ft/L", tech: "Exterior Seal", war: "N/A", ie: "Exterior" },
  { name: "Smartcare Primero", size: "20 Litre", price: 3206, cat: "Primer", sub: "Waterproofing Primer", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Waterproof Shield", war: "N/A", ie: "Exterior" },

  // Putties
  { name: "Trucare Super Putty", size: "30 KG", price: 624, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "10-15 sq.ft/KG", tech: "White Cement", war: "N/A", ie: "Interior" },
  { name: "Trucare 2x Primer Putty Mix", size: "20 KG", price: 1053, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "12-18 sq.ft/KG", tech: "Primer Putty Mix", war: "N/A", ie: "Interior" },
  { name: "Acrylic Wall Putty", size: "25 KG", price: 1750, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "15-20 sq.ft/KG", tech: "Acrylic Binder", war: "N/A", ie: "Interior" },

  // Special Effects / Textures
  { name: "Royale Play Special Effects", size: "1 Litre", price: 1818, cat: "Wall Texture", sub: "Special Effects", finish: "Patterned", cov: "80-100 sq.ft/L", tech: "Metallic/Non-Metallic", war: "5 Years", ie: "Interior" },
  { name: "Royale Play Metallics", size: "1 Litre", price: 1815, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic", cov: "80-100 sq.ft/L", tech: "Metallic Tint", war: "5 Years", ie: "Interior" },
  { name: "Royale Play Safari", size: "1 Litre", price: 1088, cat: "Wall Texture", sub: "Special Effects", finish: "Textured", cov: "60-85 sq.ft/L", tech: "Silica Sand Finish", war: "5 Years", ie: "Interior" },
  { name: "Royale Play Dune", size: "1 Litre", price: 1670, cat: "Wall Texture", sub: "Special Effects", finish: "Textured", cov: "70-90 sq.ft/L", tech: "Dune Swirls", war: "5 Years", ie: "Interior" },
  { name: "Royale Play Stucco", size: "5 KG", price: 4875, cat: "Wall Texture", sub: "Special Effects", finish: "Marble Finish", cov: "25-35 sq.ft/KG", tech: "Stucco Plaster", war: "5 Years", ie: "Interior" },
  { name: "Apex Duracast Finetex", size: "20 KG", price: 1420, cat: "Wall Texture", sub: "Exterior Texture", finish: "Textured", cov: "10-12 sq.ft/KG", tech: "Acrylic Texture", war: "5 Years", ie: "Exterior" },
  { name: "Apex Duracast Roughtex", size: "25 KG", price: 1179, cat: "Wall Texture", sub: "Exterior Texture", finish: "Textured", cov: "8-10 sq.ft/KG", tech: "Acrylic Texture", war: "5 Years", ie: "Exterior" },
  { name: "Apex Duracast Swirltex", size: "25 KG", price: 1099, cat: "Wall Texture", sub: "Exterior Texture", finish: "Textured", cov: "8-10 sq.ft/KG", tech: "Acrylic Texture", war: "5 Years", ie: "Exterior" },
  { name: "Apex Duracast Pebbletex", size: "30 KG", price: 1351, cat: "Wall Texture", sub: "Exterior Texture", finish: "Textured", cov: "6-8 sq.ft/KG", tech: "Acrylic Texture", war: "5 Years", ie: "Exterior" },
  { name: "Apex Duracast Crosstex", size: "25 KG", price: 1122, cat: "Wall Texture", sub: "Exterior Texture", finish: "Textured", cov: "8-10 sq.ft/KG", tech: "Acrylic Texture", war: "5 Years", ie: "Exterior" },
  { name: "Apex Duracast Dholpurtex", size: "25 KG", price: 1345, cat: "Wall Texture", sub: "Exterior Texture", finish: "Textured", cov: "6-8 sq.ft/KG", tech: "Acrylic Texture", war: "5 Years", ie: "Exterior" },
  { name: "Ultima Allura Venezio", size: "30 KG", price: 5611, cat: "Wall Texture", sub: "Super Premium Texture", finish: "Smooth Metallic", cov: "12-15 sq.ft/KG", tech: "Silicon Texture", war: "7 Years", ie: "Exterior" },
  { name: "Ultima Allura Torino", size: "25 KG", price: 5725, cat: "Wall Texture", sub: "Super Premium Texture", finish: "Smooth Metallic", cov: "10-12 sq.ft/KG", tech: "Silicon Texture", war: "7 Years", ie: "Exterior" },
  { name: "Ultima Allura Graniza", size: "30 KG", price: 9332, cat: "Wall Texture", sub: "Super Premium Texture", finish: "Granite Finish", cov: "8-10 sq.ft/KG", tech: "Silicon Texture", war: "7 Years", ie: "Exterior" },
  
  // Wood Finishes / Woodtech
  { name: "Woodtech Polyester", size: "25 KG", price: 14000, cat: "Wood Finishes", sub: "Polyester Coating", finish: "High Gloss", cov: "10-12 sq.ft/KG", tech: "Polyester Resin", war: "5 Years", ie: "Interior" },
  { name: "Woodtech Emporio Pu Clear", size: "4 Litre", price: 7932, cat: "Wood Finishes", sub: "Emporio PU", finish: "Gloss/Matt", cov: "12-15 sq.ft/L", tech: "Polyurethane Clear", war: "6 Years", ie: "Interior" },
  { name: "Woodtech Emporio Pu Palette", size: "4 KG", price: 4400, cat: "Wood Finishes", sub: "Emporio PU", finish: "Coloured Gloss/Matt", cov: "10-12 sq.ft/KG", tech: "Polyurethane Palette", war: "6 Years", ie: "Interior" },
  { name: "Woodtech Aquadur Pu Interior", size: "4 Litre", price: 2850, cat: "Wood Finishes", sub: "Water-based PU", finish: "Gloss/Matt", cov: "12-14 sq.ft/L", tech: "Aquadur Polyurethane", war: "5 Years", ie: "Interior" },
  { name: "Woodtech Aquadur Pu Exterior", size: "4 Litre", price: 2600, cat: "Wood Finishes", sub: "Water-based PU", finish: "Gloss/Matt", cov: "12-14 sq.ft/L", tech: "Aquadur Polyurethane", war: "5 Years", ie: "Exterior" },
  { name: "Woodtech Aquadur 2k Pu", size: "1 Litre", price: 630, cat: "Wood Finishes", sub: "Water-based PU", finish: "Gloss/Matt", cov: "12-14 sq.ft/L", tech: "Aquadur 2K PU", war: "5 Years", ie: "Interior" },
  { name: "Woodtech Pu Interior", size: "20 Litre", price: 10400, cat: "Wood Finishes", sub: "Standard PU", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Polyurethane", war: "4 Years", ie: "Interior" },
  { name: "Woodtech Pu Exterior", size: "20 Litre", price: 12300, cat: "Wood Finishes", sub: "Standard PU", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Polyurethane", war: "4 Years", ie: "Exterior" },
  { name: "Woodtech Pu Palette Interior", size: "4 Litre", price: 2700, cat: "Wood Finishes", sub: "Standard PU", finish: "Coloured Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Polyurethane Palette", war: "4 Years", ie: "Interior" },
  { name: "Woodtech Pu Palette Exterior", size: "4 Litre", price: 2800, cat: "Wood Finishes", sub: "Standard PU", finish: "Coloured Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Polyurethane Palette", war: "4 Years", ie: "Exterior" },
  { name: "Woodtech Melamyne", size: "20 Litre", price: 4900, cat: "Wood Finishes", sub: "Melamyne Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Acid Curing Melamyne", war: "2 Years", ie: "Interior" },
  { name: "Woodtech Melamyne Gold Clear", size: "20 Litre", price: 5500, cat: "Wood Finishes", sub: "Melamyne Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Acid Curing Melamyne", war: "3 Years", ie: "Interior" },
  { name: "Woodtech Touchwood Interior", size: "4 Litre", price: 900, cat: "Wood Finishes", sub: "1K PU Finish", finish: "Gloss/Matt", cov: "8-10 sq.ft/L", tech: "Single Pack Polyurethane", war: "2 Years", ie: "Interior" },
  { name: "Woodtech Touchwood Exterior", size: "4 Litre", price: 1150, cat: "Wood Finishes", sub: "1K PU Finish", finish: "Gloss/Matt", cov: "8-10 sq.ft/L", tech: "Single Pack Polyurethane", war: "2 Years", ie: "Exterior" },
  { name: "Woodtech Genie Polish", size: "5 Litre", price: 950, cat: "Wood Finishes", sub: "French Polish", finish: "Glossy", cov: "8-10 sq.ft/L", tech: "Genie French Polish", war: "1 Year", ie: "Interior" },
  { name: "Woodtech Wood Stains", size: "5 Litre", price: 1500, cat: "Wood Finishes", sub: "Wood Stain", finish: "Stained", cov: "12-15 sq.ft/L", tech: "Wood Stain Color", war: "N/A", ie: "Interior" },

  // Enamels / Specialty
  { name: "Apcolite Premium Enamel", size: "1 Litre", price: 400, cat: "Enamel", sub: "Premium Enamel", finish: "Mahogany/White", cov: "100-120 sq.ft/L", tech: "Alkyd Enamel", war: "3 Years", ie: "Interior" },
  { name: "Apcolite Rust Shield", size: "20 Litre", price: 9000, cat: "Enamel", sub: "Anti-Rust Enamel", finish: "Glossy", cov: "90-110 sq.ft/L", tech: "Anti-Corrosion", war: "3 Years", ie: "Interior" },
  { name: "Enamel Paint White", size: "1 Litre", price: 339, cat: "Enamel", sub: "Enamel Paint", finish: "Glossy White", cov: "90-110 sq.ft/L", tech: "Alkyd Enamel", war: "2 Years", ie: "Interior" },
  { name: "Kids World Magneto", size: "1 KG", price: 372, cat: "Wall Texture", sub: "Special Effects", finish: "Matt Magnetized", cov: "40-50 sq.ft/KG", tech: "Magnetic Paint", war: "3 Years", ie: "Interior" }
];

// Scraped Nerolac Paints price list with real 2026 data
const rawNerolacPaints = [
  // Distempers
  { name: "Beauty Acrylic Distemper", size: "20 KG", price: 997, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "80-100 sq.ft/KG", tech: "Water thinnable", war: "1 Year", ie: "Interior" },

  // Interior Emulsions
  { name: "Little Master", size: "20 Litre", price: 2211, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Acrylic Copolymer", war: "2 Years", ie: "Interior" },
  { name: "Lotus Touch", size: "20 Litre", price: 4815, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "120-145 sq.ft/L", tech: "Pure Acrylic", war: "5 Years", ie: "Interior" },
  { name: "Beauty Silver", size: "20 Litre", price: 3524, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Copolymer", war: "2 Years", ie: "Interior" },
  { name: "Beauty Gold", size: "20 Litre", price: 5507, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Satin", cov: "110-130 sq.ft/L", tech: "Copolymer", war: "3 Years", ie: "Interior" },
  { name: "Beauty Smooth Finish", size: "20 Litre", price: 1668, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "90-110 sq.ft/L", tech: "Copolymer", war: "1 Year", ie: "Interior" },
  { name: "Pearls Lustre Finish", size: "20 Litre", price: 5043, cat: "Interior Emulsion", sub: "Lustre Wall Finish", finish: "Semi-Gloss", cov: "110-130 sq.ft/L", tech: "Solvent Thinnable", war: "4 Years", ie: "Interior" },
  { name: "Pearls Emulsion", size: "20 Litre", price: 5264, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "115-135 sq.ft/L", tech: "Acrylic Emulsion", war: "4 Years", ie: "Interior" },
  { name: "Impressions Eco Clean", size: "20 Litre", price: 11069, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "135-155 sq.ft/L", tech: "Ultra Low VOC", war: "6 Years", ie: "Interior" },
  { name: "Impressions 24 Carat", size: "20 Litre", price: 9982, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "High Sheen", cov: "140-160 sq.ft/L", tech: "Laminated Shield", war: "6 Years", ie: "Interior" },
  { name: "Impressions Ideaz", size: "4 Litre", price: 2900, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "120-140 sq.ft/L", tech: "Accent Colors", war: "5 Years", ie: "Interior" },
  { name: "Impressions Glitter Gold", size: "1 Litre", price: 534, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic Gold", cov: "60-80 sq.ft/L", tech: "Gold Glitter Coating", war: "5 Years", ie: "Interior" },
  { name: "Impressions Glitter Silver", size: "1 Litre", price: 512, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic Silver", cov: "60-80 sq.ft/L", tech: "Silver Glitter Coating", war: "5 Years", ie: "Interior" },

  // Exterior Emulsions
  { name: "Suraksha", size: "20 KG", price: 2297, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "90-110 sq.ft/KG", tech: "Weather Resistant", war: "3 Years", ie: "Exterior" },
  { name: "Suraksha Advanced", size: "20 Litre", price: 3469, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Anti-Algae Shield", war: "3 Years", ie: "Exterior" },
  { name: "Suraksha Plus", size: "20 Litre", price: 3038, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Water Resistant", war: "3 Years", ie: "Exterior" },
  { name: "Excel Total", size: "20 Litre", price: 8103, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Silicon Protected", war: "5 Years", ie: "Exterior" },
  { name: "Excel Mica Marble", size: "20 Litre", price: 6435, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Mica Shield Stretch", war: "5 Years", ie: "Exterior" },
  { name: "Excel Anti Peel", size: "20 Litre", price: 2700, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Peel Guard", war: "5 Years", ie: "Exterior" },
  { name: "Excel Everlast", size: "20 Litre", price: 3659, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Everlast Shield", war: "5 Years", ie: "Exterior" },
  { name: "Excel Tile Guard", size: "20 Litre", price: 5237, cat: "Exterior Emulsion", sub: "Roof Coating", finish: "Glossy", cov: "100-120 sq.ft/L", tech: "Tile Waterproofing", war: "5 Years", ie: "Exterior" },
  { name: "Excel Rain Guard Horizontal Walls", size: "20 Litre", price: 3770, cat: "Exterior Emulsion", sub: "Waterproofing", finish: "Smooth", cov: "70-90 sq.ft/L", tech: "Elastomeric Membrane", war: "7 Years", ie: "Exterior" },
  { name: "Excel Rain Guard Vertical Walls", size: "20 Litre", price: 5896, cat: "Exterior Emulsion", sub: "Waterproofing", finish: "Smooth", cov: "80-100 sq.ft/L", tech: "Elastomeric Membrane", war: "7 Years", ie: "Exterior" },
  { name: "Excel", size: "20 Litre", price: 5247, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Acrylic Co-polymer", war: "3 Years", ie: "Exterior" },

  // Wood Finishes / Wonderwood
  { name: "Wonderwood Mel Mine", size: "25 Litre", price: 4143, cat: "Wood Finishes", sub: "Melamyne Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Wonderwood Melamyne", war: "2 Years", ie: "Interior" },
  { name: "Wonderwood Clear Lacquer", size: "20 Litre", price: 3496, cat: "Wood Finishes", sub: "Lacquer", finish: "Glossy Clear", cov: "11-13 sq.ft/L", tech: "Wood Lacquer Coating", war: "2 Years", ie: "Interior" },
  { name: "Wonderwood 1k Pu", size: "20 Litre", price: 3290, cat: "Wood Finishes", sub: "1K PU Finish", finish: "Gloss/Matt", cov: "9-11 sq.ft/L", tech: "Single Pack PU", war: "2 Years", ie: "Interior" },
  { name: "Wonderwood Mel Mine Crystal Clear", size: "1 Litre", price: 240, cat: "Wood Finishes", sub: "Melamyne Finish", finish: "Crystal Clear", cov: "10-12 sq.ft/L", tech: "Acid Curing Clear", war: "3 Years", ie: "Interior" },
  { name: "Wonderwood 2k Pu Interior", size: "20 Litre", price: 7996, cat: "Wood Finishes", sub: "Standard PU", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Polyurethane Clear", war: "4 Years", ie: "Interior" },
  { name: "Wonderwood 2k Pu Exterior", size: "20 Litre", price: 9423, cat: "Wood Finishes", sub: "Standard PU", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Polyurethane Clear", war: "4 Years", ie: "Exterior" },
  { name: "Italian Pigmented Pu White Glossy", size: "20 Litre", price: 15000, cat: "Wood Finishes", sub: "Italian PU", finish: "Pigmented White Glossy", cov: "12-14 sq.ft/L", tech: "Premium Polyurethane", war: "5 Years", ie: "Interior" },
  { name: "Wonderwood Nc Sanding Sealer", size: "20 Litre", price: 2889, cat: "Wood Finishes", sub: "Sanding Sealer", finish: "Matt Seal", cov: "10-12 sq.ft/L", tech: "Nitrocellulose", war: "N/A", ie: "Interior" },

  // Primers, Putties & Textures
  { name: "Wall Putty Acrylic", size: "20 Litre", price: 877, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "12-16 sq.ft/L", tech: "Acrylic Putty Filler", war: "N/A", ie: "Interior" },
  { name: "Exterior Primer", size: "20 Litre", price: 1883, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Exterior Seal Undercoat", war: "N/A", ie: "Exterior" },
  { name: "Readymix Primer Putty", size: "20 KG", price: 901, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "10-15 sq.ft/KG", tech: "Primer Putty Mix", war: "N/A", ie: "Interior" },
  { name: "Excel Alkali Prime", size: "20 Litre", price: 2517, cat: "Primer", sub: "Alkali Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Alkali Seal Undercoat", war: "N/A", ie: "Exterior" },
  { name: "Italian Pigmented Pu White Primer", size: "4 Litre", price: 1259, cat: "Wood Finishes", sub: "Italian PU", finish: "White Primer Seal", cov: "10-12 sq.ft/L", tech: "Premium PU Primer", war: "5 Years", ie: "Interior" },
  { name: "Excel Texture Finish Scratch", size: "30 KG", price: 857, cat: "Wall Texture", sub: "Exterior Texture", finish: "Scratch Texture", cov: "8-12 sq.ft/KG", tech: "Acrylic Scratch Finish", war: "5 Years", ie: "Exterior" },
  { name: "Excel Texture Finish Frost", size: "30 KG", price: 1246, cat: "Wall Texture", sub: "Exterior Texture", finish: "Frost Texture", cov: "6-10 sq.ft/KG", tech: "Acrylic Frost Finish", war: "5 Years", ie: "Exterior" },
  { name: "Putty Filler Grey Knifing", size: "2 KG", price: 196, cat: "Putty", sub: "Knifing Putty", finish: "Matt Grey", cov: "10-12 sq.ft/KG", tech: "Knifing Paste", war: "N/A", ie: "Interior" }
];

// Scraped Indigo Paints price list with real 2026 data
const rawIndigoPaints = [
  // Distempers
  { name: "Acrylic Distemper Gold", size: "20 KG", price: 1350, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "80-100 sq.ft/KG", tech: "Water thinnable", war: "2 Years", ie: "Interior" },
  { name: "Acrylic Distemper Silver", size: "20 KG", price: 1065, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "75-95 sq.ft/KG", tech: "Water thinnable", war: "1 Year", ie: "Interior" },
  { name: "Acrylic Pouch Distemper", size: "1 KG", price: 70, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "70-90 sq.ft/KG", tech: "Pouch Distemper", war: "1 Year", ie: "Interior" },

  // Putties & Primers
  { name: "Acrylic Wall Putty", size: "1 KG", price: 77, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "10-15 sq.ft/KG", tech: "Acrylic Base", war: "N/A", ie: "Interior" },
  { name: "Polymer Putty", size: "40 KG", price: 1240, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "12-16 sq.ft/KG", tech: "Polymer Base", war: "N/A", ie: "Interior" },
  { name: "Polymer Putty Gold", size: "40 KG", price: 1330, cat: "Putty", sub: "Premium Putty", finish: "Smooth", cov: "14-18 sq.ft/KG", tech: "Polymer Base Gold", war: "N/A", ie: "Interior" },
  { name: "Knifing Paste Filler", size: "500 gms", price: 89, cat: "Putty", sub: "Filler Paste", finish: "Matt", cov: "10-12 sq.ft/KG", tech: "Joint Filler", war: "N/A", ie: "Interior" },
  { name: "Exterior Wall Primer", size: "20 Litre", price: 2920, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Weather Seal", war: "N/A", ie: "Exterior" },
  { name: "Wt Cement Primer Bronze", size: "20 Litre", price: 1665, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Water Thinnable", war: "N/A", ie: "Interior" },
  { name: "Wt Cement Primer Gold", size: "20 Litre", price: 2475, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Water Thinnable Gold", war: "N/A", ie: "Interior" },
  { name: "Wt Cement Primer Silver", size: "20 Litre", price: 2035, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Water Thinnable Silver", war: "N/A", ie: "Interior" },
  { name: "Wt Sealer Primer", size: "20 Litre", price: 3340, cat: "Primer", sub: "Sealer Primer", finish: "Matt", cov: "130-150 sq.ft/L", tech: "Sealer Penetrating", war: "N/A", ie: "Interior" },
  { name: "Stain Block Primer", size: "1 Litre", price: 453, cat: "Primer", sub: "Specialty Primer", finish: "Matt", cov: "80-100 sq.ft/L", tech: "Stain Blocking", war: "N/A", ie: "Interior" },
  { name: "Single Pack Epoxy Primer", size: "500 ml", price: 210, cat: "Primer", sub: "Metal Primer", finish: "Matt", cov: "45-55 sq.ft/pack", tech: "Epoxy Resin", war: "N/A", ie: "Interior" },
  { name: "S T Redoxide Metal Primer", size: "500 ml", price: 98, cat: "Primer", sub: "Metal Primer", finish: "Matt Red", cov: "40-50 sq.ft/pack", tech: "Alkyd Redoxide", war: "N/A", ie: "Interior" },
  { name: "S T Wood Primer", size: "500 ml", price: 109, cat: "Primer", sub: "Wood Primer", finish: "Matt White", cov: "40-50 sq.ft/pack", tech: "Alkyd Wood Primer", war: "N/A", ie: "Interior" },
  { name: "Zinc Chormate Primer", size: "500 ml", price: 108, cat: "Primer", sub: "Metal Primer", finish: "Matt Yellow", cov: "40-50 sq.ft/pack", tech: "Zinc Chromate", war: "N/A", ie: "Interior" },

  // Interior Emulsions
  { name: "Interior Emulsion Silver", size: "20 Litre", price: 2815, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Copolymer", war: "3 Years", ie: "Interior" },
  { name: "Interior Emulsion Bronze", size: "20 Litre", price: 2310, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "95-115 sq.ft/L", tech: "Copolymer", war: "2 Years", ie: "Interior" },
  { name: "Premium Interior Emulsion", size: "20 Litre", price: 5985, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "120-140 sq.ft/L", tech: "Pure Acrylic", war: "5 Years", ie: "Interior" },
  { name: "Luxury Interior Emulsion", size: "20 Litre", price: 10565, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "135-155 sq.ft/L", tech: "Crosslinking Polymer", war: "7 Years", ie: "Interior" },
  { name: "Interior Sheen Emulsion", size: "20 Litre", price: 3575, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Sheen", cov: "100-120 sq.ft/L", tech: "Acrylic Sheen", war: "3 Years", ie: "Interior" },
  { name: "Bright Ceiling Coat Gold", size: "20 Litre", price: 3365, cat: "Interior Emulsion", sub: "Ceiling Paint", finish: "Super Matt White", cov: "110-130 sq.ft/L", tech: "High Opacity Ceiling", war: "3 Years", ie: "Interior" },
  { name: "Bright Ceiling Coat Platinum", size: "20 Litre", price: 6430, cat: "Interior Emulsion", sub: "Ceiling Paint", finish: "Super Matt White", cov: "120-140 sq.ft/L", tech: "High Opacity Ceiling", war: "5 Years", ie: "Interior" },

  // Exterior Emulsions & Waterproofing
  { name: "Dirtproof Waterproof Exterior Laminate", size: "20 Litre", price: 8740, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Semi-Gloss", cov: "120-140 sq.ft/L", tech: "Nanotechnology Laminate", war: "7 Years", ie: "Exterior" },
  { name: "Exterior Interior Acrylic Laminate", size: "20 Litre", price: 7900, cat: "Exterior Emulsion", sub: "Premium Laminate", finish: "Soft Sheen", cov: "115-135 sq.ft/L", tech: "Acrylic Laminate", war: "6 Years", ie: "Exterior" },
  { name: "Premium Xt Exterior Emulsion", size: "20 Litre", price: 5975, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth Matt", cov: "100-120 sq.ft/L", tech: "XT Protection", war: "5 Years", ie: "Exterior" },
  { name: "Exterior Sheen Emulsion", size: "20 Litre", price: 3805, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Sheen", cov: "100-120 sq.ft/L", tech: "Acrylic Exterior Sheen", war: "3 Years", ie: "Exterior" },
  { name: "Tile Coat", size: "20 Litre", price: 6830, cat: "Exterior Emulsion", sub: "Roof/Tile Coating", finish: "High Gloss", cov: "90-110 sq.ft/L", tech: "Tile Protection Paint", war: "5 Years", ie: "Exterior" },
  { name: "Stone Tile Top Coat", size: "4 Litre", price: 1318, cat: "Exterior Emulsion", sub: "Roof/Tile Coating", finish: "Clear Gloss", cov: "85-105 sq.ft/L", tech: "Clear Top Coat", war: "5 Years", ie: "Exterior" },
  { name: "Floor Coat Emulsion", size: "10 Litre", price: 4955, cat: "Exterior Emulsion", sub: "Floor Coating", finish: "Semi-Gloss", cov: "80-100 sq.ft/L", tech: "Abrasion Resistant Floor", war: "4 Years", ie: "Exterior" },
  { name: "Floracem", size: "25 KG", price: 870, cat: "Distemper", sub: "Cement Paint", finish: "Matt", cov: "45-55 sq.ft/KG", tech: "Portland Cement Base", war: "1 Year", ie: "Exterior" },
  { name: "Royal Indigocem", size: "25 KG", price: 965, cat: "Distemper", sub: "Cement Paint", finish: "Matt", cov: "50-60 sq.ft/KG", tech: "Premium Cement Base", war: "2 Years", ie: "Exterior" },

  // Wood Finishes & Enamels
  { name: "Exterior Single Pack Clear Pu", size: "500 ml", price: 227, cat: "Wood Finishes", sub: "Single Pack PU", finish: "Gloss/Matt Clear", cov: "40-50 sq.ft/pack", tech: "PU Clear Exterior", war: "3 Years", ie: "Exterior" },
  { name: "Exterior Two Pack Clear Pu", size: "1 Litre", price: 955, cat: "Wood Finishes", sub: "Two Pack PU", finish: "Gloss/Matt Clear", cov: "90-110 sq.ft/L", tech: "2K PU Clear Exterior", war: "5 Years", ie: "Exterior" },
  { name: "Interior Single Pack Clear Pu", size: "500 ml", price: 174, cat: "Wood Finishes", sub: "Single Pack PU", finish: "Gloss/Matt Clear", cov: "40-50 sq.ft/pack", tech: "PU Clear Interior", war: "3 Years", ie: "Interior" },
  { name: "Interior Quick Drying Two Pack Pu", size: "1 Litre", price: 485, cat: "Wood Finishes", sub: "Two Pack PU", finish: "Gloss/Matt Clear", cov: "90-110 sq.ft/L", tech: "2K PU Fast Dry", war: "5 Years", ie: "Interior" },
  { name: "Interior Two Pack Hi-solid Melamine", size: "500 ml", price: 188, cat: "Wood Finishes", sub: "Melamine", finish: "Gloss/Matt Clear", cov: "40-50 sq.ft/pack", tech: "Acid Curing Melamine", war: "3 Years", ie: "Interior" },
  { name: "Interior Sanding Sealer Nc", size: "500 ml", price: 132, cat: "Wood Finishes", sub: "Sanding Sealer", finish: "Matt Sealer", cov: "40-50 sq.ft/pack", tech: "NC Sanding Sealer", war: "N/A", ie: "Interior" },
  { name: "Wood Stain", size: "500 ml", price: 220, cat: "Wood Finishes", sub: "Wood Stain", finish: "Stained", cov: "50-60 sq.ft/pack", tech: "Soluble Stain Colors", war: "N/A", ie: "Interior" },
  { name: "Pu Super Gloss Enamel", size: "500 ml", price: 156, cat: "Enamel", sub: "PU Enamel", finish: "High Gloss", cov: "45-55 sq.ft/pack", tech: "Polyurethane Enamel", war: "4 Years", ie: "Interior" },
  { name: "Satin Enamel", size: "500 ml", price: 171, cat: "Enamel", sub: "Satin Enamel", finish: "Satin Sheen", cov: "45-55 sq.ft/pack", tech: "Alkyd Satin", war: "3 Years", ie: "Interior" },
  { name: "Aluminium Paint", size: "500 ml", price: 188, cat: "Enamel", sub: "Specialty Paint", finish: "Metallic Silver", cov: "50-60 sq.ft/pack", tech: "Aluminium Flake Paint", war: "2 Years", ie: "Exterior" },

  // Special Solutions / Stainers
  { name: "Anti Termite Solution", size: "500 ml", price: 170, cat: "Primer", sub: "Wood Treatment", finish: "Clear Liquid", cov: "60-80 sq.ft/pack", tech: "Termite Defense", war: "5 Years", ie: "Interior" },
  { name: "Universal Stainer", size: "200 ml", price: 168, cat: "Enamel", sub: "Tinting Stainer", finish: "High Pigment", cov: "N/A", tech: "Universal Tinting Liquid", war: "N/A", ie: "Interior" },
  { name: "Nc Pu Melamine Thinner", size: "1 Litre", price: 274, cat: "Wood Finishes", sub: "Thinner", finish: "Clear Thinner", cov: "N/A", tech: "Solvent Reducer", war: "N/A", ie: "Interior" },
  { name: "Exterior Emulsion Gold", size: "500 ml", price: 114, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "45-55 sq.ft/pack", tech: "Acrylic Co-polymer", war: "3 Years", ie: "Exterior" },
  { name: "Rustic Texture Finish", size: "25 KG", price: 1350, cat: "Wall Texture", sub: "Exterior Texture", finish: "Rustic Scratch", cov: "8-12 sq.ft/KG", tech: "Acrylic quartz matrix", war: "5 Years", ie: "Exterior" },
  { name: "Metallic Emulsion", size: "1 Litre", price: 1200, cat: "Wall Texture", sub: "Special Effects", finish: "Sparkling Metallic", cov: "60-80 sq.ft/L", tech: "Pure Acrylic Metallic", war: "5 Years", ie: "Interior/Exterior" }
];

// Scraped Berger Paints price list with real 2026 data
const rawBergerPaints = [
  // Interior Emulsions
  { name: "Bison Acrylic Emulsion", size: "20 Litre", price: 2900, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Acrylic Co-polymer", war: "3 Years", ie: "Interior" },
  { name: "Berger Commando", size: "20 Litre", price: 2100, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "90-110 sq.ft/L", tech: "Co-polymer", war: "2 Years", ie: "Interior" },
  { name: "Rangoli Total Care Emulsion", size: "20 Litre", price: 4100, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "115-135 sq.ft/L", tech: "Acrylic Latex", war: "5 Years", ie: "Interior" },
  { name: "Easy Clean Luxury Emulsion", size: "20 Litre", price: 5600, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "120-140 sq.ft/L", tech: "Cross-linking Acrylic", war: "6 Years", ie: "Interior" },
  { name: "Silk Luxury", size: "20 Litre", price: 8800, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "High Sheen", cov: "135-155 sq.ft/L", tech: "Pure Acrylic", war: "7 Years", ie: "Interior" },
  { name: "Silk Glamor Luxury Emulsion", size: "20 Litre", price: 14800, cat: "Interior Emulsion", sub: "Super Premium", finish: "Glamour Sheen", cov: "140-160 sq.ft/L", tech: "Bio-resistant Tech", war: "8 Years", ie: "Interior" },
  { name: "Silk Breathe Easy Luxury Emulsion", size: "20 Litre", price: 16200, cat: "Interior Emulsion", sub: "Super Premium", finish: "High Sheen", cov: "140-160 sq.ft/L", tech: "Sanitizing Paint", war: "10 Years", ie: "Interior" },

  // Exterior Emulsions
  { name: "Walmasta Antifungal Emulsion", size: "20 Litre", price: 4800, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "95-115 sq.ft/L", tech: "Antifungal Acrylic", war: "3 Years", ie: "Exterior" },
  { name: "WeatherCoat Champ", size: "20 Litre", price: 5400, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Champ Protection", war: "3 Years", ie: "Exterior" },
  { name: "WeatherCoat Glow", size: "20 Litre", price: 6300, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Soft Sheen", cov: "105-125 sq.ft/L", tech: "Glow Protection", war: "5 Years", ie: "Exterior" },
  { name: "WeatherCoat Smooth", size: "20 Litre", price: 7200, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Acrylic Elastomeric", war: "5 Years", ie: "Exterior" },
  { name: "WeatherCoat Anti Dust", size: "20 Litre", price: 8600, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Soft Sheen", cov: "115-135 sq.ft/L", tech: "Dust Guard", war: "5 Years", ie: "Exterior" },
  { name: "WeatherCoat All Guard", size: "20 Litre", price: 9200, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Sheen", cov: "120-140 sq.ft/L", tech: "Silicon Protected", war: "7 Years", ie: "Exterior" },
  { name: "WeatherCoat Long Life 7", size: "20 Litre", price: 12400, cat: "Exterior Emulsion", sub: "Super Premium", finish: "High Sheen", cov: "120-140 sq.ft/L", tech: "PU Reinforced", war: "7 Years", ie: "Exterior" },
  { name: "WeatherCoat Long Life 10", size: "20 Litre", price: 18200, cat: "Exterior Emulsion", sub: "Super Premium", finish: "High Sheen", cov: "130-150 sq.ft/L", tech: "PU Reinforced Guard", war: "10 Years", ie: "Exterior" },
  { name: "WeatherCoat Roof Guard", size: "20 Litre", price: 6900, cat: "Exterior Emulsion", sub: "Roof Waterproofing", finish: "Matt", cov: "70-90 sq.ft/L", tech: "Elastomeric Waterproofing", war: "5 Years", ie: "Exterior" },

  // Primers, Putties & Special
  { name: "Bison Wall Putty", size: "30 KG", price: 650, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "10-15 sq.ft/KG", tech: "White Cement Base", war: "N/A", ie: "Interior" },
  { name: "Happy Wall Acrylic Putty", size: "20 KG", price: 1450, cat: "Putty", sub: "Acrylic Putty", finish: "Smooth", cov: "12-16 sq.ft/KG", tech: "Acrylic Putty Paste", war: "N/A", ie: "Interior" },
  { name: "Waterproof Putty For Wall", size: "20 KG", price: 1150, cat: "Putty", sub: "Waterproof Putty", finish: "Smooth", cov: "12-16 sq.ft/KG", tech: "Hydrophobic Cement Putty", war: "N/A", ie: "Exterior" },
  { name: "Crack Filler Paste", size: "1 KG", price: 160, cat: "Putty", sub: "Filler Paste", finish: "Matt", cov: "10-12 sq.ft/pack", tech: "Elastomeric Filler", war: "N/A", ie: "Interior" },
  { name: "WeatherCoat Exterior Primer", size: "20 Litre", price: 2700, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Exterior Seal Undercoat", war: "N/A", ie: "Exterior" },
  { name: "BP Exterior Cement Primer", size: "20 Litre", price: 2300, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Water Thinnable Seal", war: "N/A", ie: "Exterior" },
  { name: "BP White Interior Primer", size: "20 Litre", price: 2200, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "115-135 sq.ft/L", tech: "Water Thinnable White", war: "N/A", ie: "Interior" },
  { name: "BP Interior Cement Primer", size: "20 Litre", price: 1700, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Water Thinnable Cement", war: "N/A", ie: "Interior" },

  // Wood & Metal / Enamels / Illusion
  { name: "Luxol High Gloss Enamel", size: "1 Litre", price: 410, cat: "Enamel", sub: "High Gloss Enamel", finish: "High Gloss", cov: "90-110 sq.ft/L", tech: "Alkyd resin Gloss", war: "3 Years", ie: "Interior" },
  { name: "Luxol Satin Enamel", size: "1 Litre", price: 430, cat: "Enamel", sub: "Satin Enamel", finish: "Satin Sheen", cov: "95-115 sq.ft/L", tech: "Alkyd resin Satin", war: "3 Years", ie: "Interior" },
  { name: "Wood Keeper 1K PU", size: "1 Litre", price: 450, cat: "Wood Finishes", sub: "1K PU Finish", finish: "Glossy/Matt Clear", cov: "80-100 sq.ft/L", tech: "Single Pack PU Clear", war: "2 Years", ie: "Interior" },
  { name: "WoodKeeper Melamine 24 Karat", size: "1 Litre", price: 480, cat: "Wood Finishes", sub: "Melamyne Finish", finish: "Glossy/Matt Clear", cov: "85-105 sq.ft/L", tech: "2K Melamine Gold", war: "3 Years", ie: "Interior" },
  { name: "Silk Illusion Non-Metallic", size: "1 Litre", price: 1200, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic/Non-Metallic", cov: "60-80 sq.ft/L", tech: "Textured Illusion Coating", war: "5 Years", ie: "Interior" },
  { name: "Berger Wall Castle Fine", size: "25 KG", price: 1150, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Textured Pattern", cov: "8-12 sq.ft/KG", tech: "Copolymer textured coating", war: "5 Years", ie: "Exterior" },
  { name: "Berger Ruff N Tuff Scratch", size: "30 KG", price: 1380, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Scratch Texture", cov: "6-10 sq.ft/KG", tech: "Heavy duty trowel texture", war: "5 Years", ie: "Exterior" }
];

// Scraped Birla Opus price list with real 2026 data
const rawBirlaOpusPaints = [
  { name: "One True Vision", size: "20 Litre", price: 17750, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "High Sheen", cov: "120-140 sq.ft/L", tech: "Vision Shield", war: "10 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-true-vision.webp" },
  { name: "One True Look", size: "20 Litre", price: 14723, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "135-155 sq.ft/L", tech: "True Look Gloss", war: "7 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-true-look.webp" },
  { name: "Calista Neo Star Shine", size: "20 Litre", price: 10323, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Sheen", cov: "115-135 sq.ft/L", tech: "Neo Star Shine", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-neo-star-shine.webp" },
  { name: "Calista Neo Star", size: "20 Litre", price: 9886, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Neo Star Acrylic", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-neo-star.webp" },
  { name: "Style Power Fit", size: "20 Litre", price: 5604, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Power Fit Tech", war: "3 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-power-fit.webp" },
  { name: "One Pure Elegance", size: "20 Litre", price: 14240, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "140-160 sq.ft/L", tech: "Pure Elegance", war: "8 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-pure-elegance.webp" },
  { name: "One Dream Duracoat", size: "4 Litre", price: 1190, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Duracoat Seal", war: "N/A", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-dream-duracoat.webp" },
  { name: "Calista Ever Wash Shine", size: "20 Litre", price: 8190, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "120-140 sq.ft/L", tech: "Ever Wash", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-ever-wash-shine.webp" },
  { name: "Style Colour Fresh", size: "20 Litre", price: 4670, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Colour Fresh", war: "3 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-colour-fresh.webp" },
  { name: "Style Super Bright", size: "20 KG", price: 4203, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "80-100 sq.ft/KG", tech: "Super Bright Base", war: "1 Year", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-super-bright.webp" },
  { name: "One Pure Elegance Shine", size: "20 Litre", price: 15350, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "140-160 sq.ft/L", tech: "Pure Elegance", war: "8 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-pure-elegance-shine.webp" },
  { name: "One Pure Elegance Matt", size: "20 Litre", price: 15810, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Matt", cov: "140-160 sq.ft/L", tech: "Pure Elegance", war: "8 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-pure-elegance-matt.webp" },
  { name: "One Pure Legend", size: "20 Litre", price: 14240, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Soft Sheen", cov: "135-155 sq.ft/L", tech: "Pure Legend Tech", war: "8 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-pure-legend.webp" },
  { name: "One True Flex", size: "20 Litre", price: 16036, cat: "Exterior Emulsion", sub: "Waterproofing", finish: "Smooth Sheen", cov: "80-100 sq.ft/L", tech: "Flex Waterproof Membrane", war: "7 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-true-flex.webp" },
  { name: "One True Life", size: "20 Litre", price: 16929, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "140-160 sq.ft/L", tech: "True Life Shield", war: "8 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-true-life.webp" },
  { name: "Calista Ever Wash", size: "20 Litre", price: 8190, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "120-140 sq.ft/L", tech: "Ever Wash", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-ever-wash.webp" },
  { name: "Calista Ever Clear Matt", size: "20 Litre", price: 9010, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Ever Clear Stain Guard", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-ever-clear-matt.webp" },
  { name: "Calista Ever Clear", size: "20 Litre", price: 10237, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Satin", cov: "120-140 sq.ft/L", tech: "Ever Clear Stain Guard", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-ever-clear.webp" },
  { name: "Calista Ever Stay", size: "20 Litre", price: 7781, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth Sheen", cov: "110-130 sq.ft/L", tech: "Ever Stay Acrylic", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-calista-ever-stay.webp" },
  { name: "Style Super Smooth Acrylic Distemper", size: "20 KG", price: 3783, cat: "Distemper", sub: "Acrylic Distemper", finish: "Matt", cov: "75-95 sq.ft/KG", tech: "Super Smooth Base", war: "1 Year", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-super-smooth-acrylic-distemper.webp" },
  { name: "Style Colour Smart", size: "20 Litre", price: 4670, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Colour Smart", war: "3 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-colour-smart.webp" },
  { name: "Style Colour Smart Shine", size: "20 Litre", price: 4904, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Sheen", cov: "100-120 sq.ft/L", tech: "Colour Smart", war: "3 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-colour-smart-shine.webp" },
  { name: "Style Power Bright", size: "20 Litre", price: 4670, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Power Bright", war: "3 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-power-bright.webp" },
  { name: "Style Power Bright Shine", size: "20 Litre", price: 4904, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Sheen", cov: "100-120 sq.ft/L", tech: "Power Bright", war: "3 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-power-bright-shine.webp" },
  { name: "One Dream Texture", size: "20 KG", price: 3114, cat: "Wall Texture", sub: "Premium Designer Texture", finish: "Textured 3D", cov: "10-15 sq.ft/KG", tech: "Lime-based 3D Finish", war: "5 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-dream-duracoat.webp" },
  { name: "Prime Exterior Textures Scratch", size: "25 KG", price: 1500, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Scratch Texture", cov: "8-12 sq.ft/KG", tech: "Weather Resistant Polymer", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-power-fit.webp" },
  { name: "Opus Prime T15 Exterior Scratch", size: "25 KG", price: 1450, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Scratch Texture", cov: "8-12 sq.ft/KG", tech: "Water-repellent scratch texture", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-power-fit.webp" },
  { name: "Opus Prime T30 Exterior Scratch", size: "25 KG", price: 1580, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Heavy Scratch", cov: "6-10 sq.ft/KG", tech: "Acrylic scratch texture", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-style-power-fit.webp" },
  { name: "Opus One Explore 15 Trowel", size: "25 KG", price: 1650, cat: "Wall Texture", sub: "Premium Designer Texture", finish: "Trowel pattern", cov: "10-15 sq.ft/KG", tech: "Fibre Trowel Texture", war: "5 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/birla-opus-price-one-dream-duracoat.webp" }
];

const rawNipponPaints = [
  { name: "Breeze Emulsion", size: "20 Litre", price: 2500, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Smooth Matt Finish", war: "3 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/nippon-paint-breeze-2.png" },
  { name: "Vinilex Emulsion", size: "20 Litre", price: 3200, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Copolymer Base", war: "3 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/nippon-paint-Vinilex.png" },
  { name: "Atom 2 In 1", size: "20 Litre", price: 4800, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Washable Dual Protection", war: "3 Years", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Atom-2-in-1.png" },
  { name: "Spotless Nxt", size: "20 Litre", price: 12500, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Soft Sheen", cov: "135-155 sq.ft/L", tech: "Swan-back Stain Repellent", war: "7 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-paint-Spotless-NXT.png" },
  { name: "Satin-glo Aura", size: "20 Litre", price: 14500, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Satin Sheen", cov: "140-160 sq.ft/L", tech: "Ultra-Low VOC Aura", war: "8 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Satinglo-Aura.png" },
  { name: "Satin Glo+", size: "20 Litre", price: 13000, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Rich Sheen", cov: "140-160 sq.ft/L", tech: "Satin Glo Protection", war: "8 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Satinglo-Plus.png" },
  { name: "Matex Ez Wash", size: "20 Litre", price: 4200, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Washable Acrylic", war: "3 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-paint-Matex-ez-Wash.png" },
  { name: "Matex Gold", size: "20 Litre", price: 5500, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Smooth Sheen", cov: "115-135 sq.ft/L", tech: "Gold Acrylic Finish", war: "5 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Matex-Gold.png" },
  { name: "Shogun Emulsion", size: "20 Litre", price: 4500, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "95-115 sq.ft/L", tech: "Shogun Guard", war: "3 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-paint-Shogun.png" },
  { name: "Sumo Xtra", size: "20 Litre", price: 7800, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Soft Sheen", cov: "105-125 sq.ft/L", tech: "Weather Guard Soft Sheen", war: "5 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Sumo-Xtra.png" },
  { name: "Samurai", size: "20 Litre", price: 4800, cat: "Exterior Emulsion", sub: "Standard Exterior", finish: "Matt", cov: "90-110 sq.ft/L", tech: "Anti-Peel Formula", war: "3 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Samurai.png" },
  { name: "Weatherond Advance", size: "20 Litre", price: 12800, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Smooth", cov: "110-130 sq.ft/L", tech: "Heat Ban Lamination", war: "7 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-paint-Weatherbond-Advance.png" },
  { name: "Durafresh Xpert", size: "20 Litre", price: 14000, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Smooth", cov: "115-135 sq.ft/L", tech: "Dirt Guard Heat Ban", war: "7 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/nippon-paint-durafresh-xpert.png" },
  { name: "Weatherbond Pro", size: "20 Litre", price: 18000, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "High Sheen", cov: "120-140 sq.ft/L", tech: "15 Years Weather Protection", war: "15 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Weatherbond-pro-and-Basecoat.png" },
  { name: "Nippon Atom Fibra", size: "20 Litre", price: 4900, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Excellent Washability Fibra", war: "3 Years", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/nippon-atom-fibra.png" },
  { name: "Wood Primer", size: "20 Litre", price: 3200, cat: "Primer", sub: "Wood Primer", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Genie Wood Seal", war: "N/A", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Wood-Primer.png" },
  { name: "Exterior Wall Primer", size: "20 Litre", price: 2800, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Anti-Algal Weather Seal", war: "N/A", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/NIPPON-PAINT-EXTERIOR-WALL-PRIMER.png" },
  { name: "Interior Wall Primer", size: "20 Litre", price: 2200, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "115-135 sq.ft/L", tech: "Acrylic Undercoat Seal", war: "N/A", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Interior-Wall-Primer.png" },
  { name: "Aqua Primer", size: "20 Litre", price: 3500, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Environment Friendly All Surface", war: "N/A", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-Aqua-Primer-For-All-Surfaces.png" },
  { name: "Walltron Fr-putty", size: "20 KG", price: 1100, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "12-16 sq.ft/KG", tech: "Water Repellent Putty", war: "N/A", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/05/Nippon-Paint-FR-Putty.png" },
  { name: "Red Oxide Metal Primer", size: "1 Litre", price: 250, cat: "Primer", sub: "Metal Primer", finish: "Matt Red", cov: "90-110 sq.ft/L", tech: "Anti-Corrosive Red Oxide", war: "N/A", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/nippon-red-oxide-metal-primer.png" },
  { name: "Satin Enamel", size: "1 Litre", price: 380, cat: "Enamel", sub: "Satin Enamel", finish: "Satin", cov: "95-115 sq.ft/L", tech: "Lead-Free Satin Finish", war: "3 Years", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/nippon-paint-satin-enamel.png" },
  { name: "Bodelac High Gloss Enamel", size: "1 Litre", price: 420, cat: "Enamel", sub: "High Gloss Enamel", finish: "Glossy", cov: "90-110 sq.ft/L", tech: "Anti-Fungal Gloss Enamel", war: "4 Years", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-BodelacHigh-Gloss-Enamel.png" },
  { name: "Melamic Interior Wood Finish", size: "1 Litre", price: 350, cat: "Wood Finishes", sub: "Melamyne Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Low Odour Melamic Seal", war: "3 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/06/nippon-paint-melamic-interior-wood-finish.png" },
  { name: "Cleartone Pu Wood Finish", size: "1 Litre", price: 480, cat: "Wood Finishes", sub: "PU Wood Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "Tough Film Acid Resistant", war: "4 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-paint-Cleartone-pu-wood-finish.png" },
  { name: "Hydroshield Elastomeric Exterior Waterproof Coating", size: "20 Litre", price: 9500, cat: "Exterior Emulsion", sub: "Waterproofing", finish: "Matt", cov: "70-90 sq.ft/L", tech: "Elastomeric Waterproof Base", war: "7 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-Hydroshield-Elastomeric-Exterior-Waterproof-CoatingBasecoat.png" },
  { name: "Hydroshield Waterproof Exterior Emulsion Top Coat", size: "20 Litre", price: 13500, cat: "Exterior Emulsion", sub: "Waterproofing", finish: "Smooth", cov: "80-100 sq.ft/L", tech: "Waterproof Top Coat", war: "7 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-Hydroshield-Waterproof-Exterior-EmulsionTop-Coat.png" },
  { name: "Momento Dzine", size: "1 Litre", price: 1400, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic/Textured", cov: "60-80 sq.ft/L", tech: "Designer Finish Dzine", war: "5 Years", ie: "Interior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-Momento-Dzine.png" },
  { name: "Walltron Hydroshield Dampseal", size: "4 Litre", price: 1800, cat: "Primer", sub: "Waterproofing Primer", finish: "Matt White", cov: "80-100 sq.ft/L", tech: "Dampness Block Sealer", war: "5 Years", ie: "Interior/Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-Walltron-Hydroshield-Dampseal-Exterior-4ltr.png" },
  { name: "Nippon Walltron Scratch Texture", size: "25 KG", price: 1250, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Scratch Texture", cov: "8-12 sq.ft/KG", tech: "High water repellency copolymer", war: "5 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-Hydroshield-Elastomeric-Exterior-Waterproof-CoatingBasecoat.png" },
  { name: "Nippon Walltron Swirl Texture", size: "25 KG", price: 1180, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Swirl Pattern", cov: "8-12 sq.ft/KG", tech: "High water repellency copolymer", war: "5 Years", ie: "Exterior", img: "https://yespainter.com/wp-content/uploads/2021/06/Nippon-Paint-Hydroshield-Waterproof-Exterior-EmulsionTop-Coat.png" }
];

const rawDuluxPaints = [
  { name: "Supercover", size: "20 Litre", price: 3850, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Copolymer Base", war: "3 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-supercover-colours-of-the-world_s.webp" },
  { name: "Rainbow Colours", size: "20 Litre", price: 2150, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "90-110 sq.ft/L", tech: "Copolymer Base", war: "2 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/PNTEMU0045.webp" },
  { name: "Velvet Touch Pearl Glo", size: "20 Litre", price: 6976, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Soft Sheen", cov: "135-155 sq.ft/L", tech: "Pearl Glo Luminous", war: "6 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-trends_s.webp" },
  { name: "Velvet Touch Diamond Glo", size: "20 Litre", price: 7949, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "High Sheen", cov: "140-160 sq.ft/L", tech: "Diamond Glo Resilient", war: "7 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-trends_s.webp" },
  { name: "Velvet Touch Platinum Glo", size: "20 Litre", price: 6506, cat: "Interior Emulsion", sub: "Luxury Emulsion", finish: "Satin", cov: "130-150 sq.ft/L", tech: "Platinum Glow Shield", war: "6 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-trends_s.webp" },
  { name: "Super Clean 3 In 1", size: "20 Litre", price: 5272, cat: "Interior Emulsion", sub: "Premium Emulsion", finish: "Soft Sheen", cov: "120-140 sq.ft/L", tech: "Stain Repellent 3-in-1", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-superclean_s.webp" },
  { name: "Promise", size: "20 Litre", price: 1707, cat: "Interior Emulsion", sub: "Standard Emulsion", finish: "Matt", cov: "100-120 sq.ft/L", tech: "Acrylic Co-polymer", war: "3 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-promise.webp" },
  { name: "Premium Exterior Emulsion", size: "20 Litre", price: 4800, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Weather Resistant Acrylic", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/professional-premium-exterior-emulsion-matt-500x500.webp" },
  { name: "Weathershield Protect", size: "20 Litre", price: 3687, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Smooth", cov: "100-120 sq.ft/L", tech: "Weathershield Guard", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-protect.webp" },
  { name: "Weathershield Max", size: "20 Litre", price: 5526, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Soft Sheen", cov: "110-130 sq.ft/L", tech: "Crack-proof Max Protection", war: "7 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/ici-dulux-weathershield-max-500x500.webp" },
  { name: "Weathershield Powerflexx", size: "20 Litre", price: 6341, cat: "Exterior Emulsion", sub: "Super Premium Exterior", finish: "Smooth Sheen", cov: "120-140 sq.ft/L", tech: "Powerflexx Elastomeric", war: "10 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-powerflexx-500x500.webp" },
  { name: "Weathershield Ultra Clean Professional", size: "20 Litre", price: 5060, cat: "Exterior Emulsion", sub: "Premium Exterior", finish: "Sheen", cov: "115-135 sq.ft/L", tech: "Ultra Clean Dirt Guard", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/weathershield-ultra-clean-professional.webp" },
  { name: "Weathershield Waterproof", size: "20 Litre", price: 3297, cat: "Exterior Emulsion", sub: "Waterproofing", finish: "Matt", cov: "70-90 sq.ft/L", tech: "Waterproof Shield Membrane", war: "7 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-waterproof.webp" },
  { name: "Weathershield Signature", size: "25 KG", price: 3750, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Textured Pattern", cov: "8-12 sq.ft/KG", tech: "Acrylic Co-polymer Texture", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-signature.webp" },
  { name: "Weathershield Tile", size: "20 Litre", price: 4600, cat: "Exterior Emulsion", sub: "Roof/Tile Coating", finish: "Glossy", cov: "100-120 sq.ft/L", tech: "Tile Protection Gloss", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-tile.webp" },
  { name: "Weathershield Clear", size: "4 Litre", price: 1350, cat: "Exterior Emulsion", sub: "Roof/Tile Coating", finish: "Clear Gloss", cov: "85-105 sq.ft/L", tech: "Clear Top Coat Protective", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-clear.webp" },
  { name: "Weathershield Tex", size: "25 KG", price: 1200, cat: "Wall Texture", sub: "Exterior Wall Texture", finish: "Scratch Texture", cov: "6-10 sq.ft/KG", tech: "Coarse Acrylic Texture", war: "5 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-weathershield-clear.webp" },
  { name: "5in1 Super Gloss", size: "20 Litre", price: 4309, cat: "Enamel", sub: "Premium Enamel", finish: "High Gloss", cov: "90-110 sq.ft/L", tech: "5-in-1 Alkyd Enamel", war: "3 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-supergloss-5-in-1-ready-mix_s.webp" },
  { name: "Gloss", size: "20 Litre", price: 3660, cat: "Enamel", sub: "Standard Enamel", finish: "Glossy", cov: "90-110 sq.ft/L", tech: "Alkyd resin Gloss", war: "2 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-gloss_s.webp" },
  { name: "Super Satin", size: "20 Litre", price: 4095, cat: "Enamel", sub: "Satin Enamel", finish: "Satin", cov: "95-115 sq.ft/L", tech: "Stay Bright Satin", war: "3 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-satin-stay-bright_s.webp" },
  { name: "Satin Stay Bright", size: "20 Litre", price: 4607, cat: "Enamel", sub: "Satin Enamel", finish: "Satin", cov: "95-115 sq.ft/L", tech: "Stay Bright Satin Glow", war: "3 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-satin-stay-bright_s.webp" },
  { name: "Gloss Stay Bright", size: "20 Litre", price: 4826, cat: "Enamel", sub: "Premium Enamel", finish: "High Gloss", cov: "90-110 sq.ft/L", tech: "Stay Bright High Gloss", war: "4 Years", ie: "Interior/Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-gloss_s.webp" },
  { name: "Lustre", size: "20 Litre", price: 3623, cat: "Interior Emulsion", sub: "Lustre Wall Finish", finish: "Lustre", cov: "100-120 sq.ft/L", tech: "Solvent Thinnable", war: "4 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-lustre_s.webp" },
  { name: "Weathershield Alkali Bloc", size: "20 Litre", price: 4050, cat: "Primer", sub: "Exterior Primer", finish: "Matt", cov: "110-130 sq.ft/L", tech: "Alkali Resistant Seal", war: "N/A", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/dulux-smoothover_s.webp" },
  { name: "Smoothover", size: "20 Litre", price: 2100, cat: "Putty", sub: "Wall Putty", finish: "Smooth", cov: "10-15 sq.ft/KG", tech: "Smoothover Paste Putty", war: "N/A", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-smoothover-500x500.webp" },
  { name: "Promise Primer", size: "20 Litre", price: 3300, cat: "Primer", sub: "Wall Primer", finish: "Matt", cov: "120-140 sq.ft/L", tech: "Acrylic Primer Seal", war: "N/A", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/0_0_productGfx_d1953bac63651b91fd4503c5f45d0de9.webp" },
  { name: "Woodguard Interior Sealer", size: "4 Litre", price: 1150, cat: "Wood Finishes", sub: "Wood Sealer", finish: "Matt Clear", cov: "10-12 sq.ft/L", tech: "Woodguard Nitrocellulose Sealer", war: "N/A", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-wood-putty-500x500.webp" },
  { name: "Woodguard Putty", size: "1 KG", price: 130, cat: "Wood Finishes", sub: "Wood Putty", finish: "Matt", cov: "8-10 sq.ft/KG", tech: "Acrylic Wood Putty Filler", war: "N/A", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-woodguard-wood-putty_s_1.webp" },
  { name: "Woodguard Pu Exterior", size: "4 Litre", price: 2500, cat: "Wood Finishes", sub: "PU Wood Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "PU Exterior Weather Resistant", war: "4 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/wonder-wood2k-pu-exterior-500x500.webp" },
  { name: "Woodguard Pu Interior", size: "4 Litre", price: 2250, cat: "Wood Finishes", sub: "PU Wood Finish", finish: "Gloss/Matt", cov: "10-12 sq.ft/L", tech: "PU Interior Stain Resistant", war: "4 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/wonder-wood2k-pu-exterior-500x500.webp" },
  { name: "Duco Pu Sealer Interior", size: "1 Litre", price: 426, cat: "Wood Finishes", sub: "Duco Sealer", finish: "Clear Sealer", cov: "12-15 sq.ft/L", tech: "Duco Polyurethane Sealer", war: "3 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/duco-pu-sealer-interior.webp" },
  { name: "Duco Pu Sealer Exterior", size: "1 Litre", price: 482, cat: "Wood Finishes", sub: "Duco Sealer", finish: "Clear Sealer", cov: "11-14 sq.ft/L", tech: "Duco Polyurethane Sealer", war: "3 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/duco-pu-sealer-interior.webp" },
  { name: "Duco Pu Interior", size: "4 Litre", price: 1765, cat: "Wood Finishes", sub: "Duco PU", finish: "Gloss/Matt Clear", cov: "10-12 sq.ft/L", tech: "Duco Polyurethane Interior Coating", war: "4 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/duco-pu-sealer-interior.webp" },
  { name: "Duco Pu Exterior", size: "4 Litre", price: 1972, cat: "Wood Finishes", sub: "Duco PU", finish: "Gloss/Matt Clear", cov: "10-12 sq.ft/L", tech: "Duco Polyurethane Exterior Coating", war: "4 Years", ie: "Exterior", img: "https://aapkapainter.com/uploads/product_images/duco-pu-sealer-interior.webp" },
  { name: "Duco 1k Pu Clear", size: "1 Litre", price: 192, cat: "Wood Finishes", sub: "Duco PU", finish: "Clear Gloss", cov: "10-12 sq.ft/L", tech: "Single Pack Polyurethane", war: "2 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/duco-pu-sealer-interior.webp" },
  { name: "Velvet Touch Trends", size: "1 Litre", price: 482, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic/Non-Metallic", cov: "60-80 sq.ft/L", tech: "Velvet Touch Trends Base", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-trends-500x500.webp" },
  { name: "Velvet Touch Trends Ny Metallics", size: "1 Litre", price: 1035, cat: "Wall Texture", sub: "Special Effects", finish: "Metallic", cov: "60-80 sq.ft/L", tech: "trends New York Metallic Finish", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-persian-silk-500x500.webp" },
  { name: "Velvet Touch Trends Glitter", size: "1 Litre", price: 772, cat: "Wall Texture", sub: "Special Effects", finish: "Glitter Finish", cov: "60-80 sq.ft/L", tech: "trends Glitter Shield", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-trends-500x500.webp" },
  { name: "Velvet Touch Trends Persian Silk", size: "1 Litre", price: 915, cat: "Wall Texture", sub: "Special Effects", finish: "Silk Finish", cov: "60-80 sq.ft/L", tech: "trends Persian Silk Texture", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-persian-silk-500x500.webp" },
  { name: "Velvet Touch Irish Linen", size: "1 Litre", price: 919, cat: "Wall Texture", sub: "Special Effects", finish: "Textured Linen", cov: "50-70 sq.ft/L", tech: "trends Irish Linen Texture", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-irish-linen-500x500.webp" },
  { name: "Velvet Touch Italian Marble", size: "1 Litre", price: 429, cat: "Wall Texture", sub: "Special Effects", finish: "Polished Marble", cov: "45-65 sq.ft/L", tech: "trends Italian Marble Stucco", war: "5 Years", ie: "Interior", img: "https://aapkapainter.com/uploads/product_images/dulux-velvet-touch-italian-marble-500x500.webp" }
];

const otherBrands = [];

async function seed() {
  console.log("📂 Initializing Supabase Storage bucket cache...");
  await loadBucketCache();

  // Generate final rows for DB insertion
  const finalRows = [];

  console.log("⚙️ Resolving Asian Paints product list...");
  for (const item of rawAsianPaints) {
    if (item.size.includes("20 Litre")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const imageUrl = await ensureProductImageRenamed("Asian Paints", item.name, targetSize, item.cat);
        const price = getCalculatedMRP(item.size, item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Asian Paints",
          brand_color: "#e8132b",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: targetSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Royale") ? "Excellent" : "Good",
          voc: item.name.includes("Royale") ? "Ultra Low VOC" : "Low VOC",
          features: [item.tech, "Smooth Flow", "Anti-Fungal Protection"],
          source: "aapkapainter_asian_paints_price",
          image_url: imageUrl
        }));
      }
    } else {
      const imageUrl = await ensureProductImageRenamed("Asian Paints", item.name, item.size, item.cat);
      finalRows.push(makeRow({
        brand: "Asian Paints",
        brand_color: "#e8132b",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "aapkapainter_asian_paints_price",
        image_url: imageUrl
      }));
    }
  }

  console.log("⚙️ Resolving Nerolac Paints product list...");
  for (const item of rawNerolacPaints) {
    if (item.size.includes("20 Litre") || item.size.includes("20 KG")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const mappedSize = targetSize.replace("L", item.size.includes("KG") ? " KG" : "L");
        const imageUrl = await ensureProductImageRenamed("Nerolac Paints", item.name, mappedSize, item.cat);
        const price = getCalculatedMRP("20L", item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Nerolac Paints",
          brand_color: "#007a33",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: mappedSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Impressions") ? "Excellent" : "Good",
          voc: item.name.includes("Impressions") ? "Ultra Low VOC" : "Low VOC",
          features: [item.tech, "Smooth Application", "Nerolac Eco Shield"],
          source: "aapkapainter_nerolac_paints_price",
          image_url: imageUrl
        }));
      }
    } else {
      const imageUrl = await ensureProductImageRenamed("Nerolac Paints", item.name, item.size, item.cat);
      finalRows.push(makeRow({
        brand: "Nerolac Paints",
        brand_color: "#007a33",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "aapkapainter_nerolac_paints_price",
        image_url: imageUrl
      }));
    }
  }

  console.log("⚙️ Resolving Indigo Paints product list...");
  for (const item of rawIndigoPaints) {
    if (item.size.includes("20 Litre") || item.size.includes("20 KG")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const mappedSize = targetSize.replace("L", item.size.includes("KG") ? " KG" : "L");
        const imageUrl = await ensureProductImageRenamed("Indigo Paints", item.name, mappedSize, item.cat);
        const price = getCalculatedMRP("20L", item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Indigo Paints",
          brand_color: "#4b0082",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: mappedSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Laminate") ? "Excellent" : "Good",
          voc: "Low VOC",
          features: [item.tech, "Smart Flow", "Indigo Color Guard"],
          source: "aapkapainter_indigo_paints_price",
          image_url: imageUrl
        }));
      }
    } else {
      const imageUrl = await ensureProductImageRenamed("Indigo Paints", item.name, item.size, item.cat);
      finalRows.push(makeRow({
        brand: "Indigo Paints",
        brand_color: "#4b0082",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "aapkapainter_indigo_paints_price",
        image_url: imageUrl
      }));
    }
  }

  console.log("⚙️ Resolving Berger Paints product list...");
  for (const item of rawBergerPaints) {
    if (item.size.includes("20 Litre") || item.size.includes("20 KG")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const mappedSize = targetSize.replace("L", item.size.includes("KG") ? " KG" : "L");
        const imageUrl = await ensureProductImageRenamed("Berger Paints", item.name, mappedSize, item.cat);
        const price = getCalculatedMRP("20L", item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Berger Paints",
          brand_color: "#0054a6",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: mappedSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Silk") || item.name.includes("Easy Clean") ? "Excellent" : "Good",
          voc: "Low VOC",
          features: [item.tech, "Berger Silk Touch", "Anti-Fungal Protection"],
          source: "yespainter_berger_paint_price",
          image_url: imageUrl
        }));
      }
    } else {
      const imageUrl = await ensureProductImageRenamed("Berger Paints", item.name, item.size, item.cat);
      finalRows.push(makeRow({
        brand: "Berger Paints",
        brand_color: "#0054a6",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "yespainter_berger_paint_price",
        image_url: imageUrl
      }));
    }
  }

  console.log("⚙️ Resolving & Auto-uploading Birla Opus product list...");
  for (const item of rawBirlaOpusPaints) {
    if (item.size.includes("20 Litre") || item.size.includes("20 KG")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const mappedSize = targetSize.replace("L", item.size.includes("KG") ? " KG" : "L");
        const storageUrl = await ensureProductImageRenamed("Birla Opus", item.name, mappedSize, item.cat, item.img);
        const price = getCalculatedMRP("20L", item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Birla Opus",
          brand_color: "#ff6b00",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: mappedSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Pure") || item.name.includes("True") ? "Excellent" : "Good",
          voc: "Low VOC",
          features: [item.tech, "Birla Opus Premium Touch", "Alkali Resistant"],
          source: "aapkapainter_birla_opus_price",
          image_url: storageUrl
        }));
      }
    } else {
      const storageUrl = await ensureProductImageRenamed("Birla Opus", item.name, item.size, item.cat, item.img);
      finalRows.push(makeRow({
        brand: "Birla Opus",
        brand_color: "#ff6b00",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "aapkapainter_birla_opus_price",
        image_url: storageUrl
      }));
    }
  }

  console.log("⚙️ Resolving & Auto-uploading Nippon Paint product list...");
  for (const item of rawNipponPaints) {
    if (item.size.includes("20 Litre") || item.size.includes("20 KG")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const mappedSize = targetSize.replace("L", item.size.includes("KG") ? " KG" : "L");
        const storageUrl = await ensureProductImageRenamed("Nippon Paint", item.name, mappedSize, item.cat, item.img);
        const price = getCalculatedMRP("20L", item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Nippon Paint",
          brand_color: "#0a549d",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: mappedSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Satin") || item.name.includes("Spotless") ? "Excellent" : "Good",
          voc: "Low VOC",
          features: [item.tech, "Nippon Color Tech", "Green Label Certified"],
          source: "yespainter_nippon_paint_price",
          image_url: storageUrl
        }));
      }
    } else {
      const storageUrl = await ensureProductImageRenamed("Nippon Paint", item.name, item.size, item.cat, item.img);
      finalRows.push(makeRow({
        brand: "Nippon Paint",
        brand_color: "#0a549d",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "yespainter_nippon_paint_price",
        image_url: storageUrl
      }));
    }
  }

  console.log("⚙️ Resolving & Auto-uploading Dulux Paint product list...");
  for (const item of rawDuluxPaints) {
    if (item.size.includes("20 Litre") || item.size.includes("20 KG")) {
      for (const targetSize of ["1L", "4L", "10L", "20L"]) {
        const mappedSize = targetSize.replace("L", item.size.includes("KG") ? " KG" : "L");
        const storageUrl = await ensureProductImageRenamed("Dulux", item.name, mappedSize, item.cat, item.img);
        const price = getCalculatedMRP("20L", item.price, targetSize);
        finalRows.push(makeRow({
          brand: "Dulux",
          brand_color: "#cc0100",
          category: item.cat,
          subcategory: item.sub,
          product_name: item.name,
          pack_size: mappedSize,
          mrp: price,
          finish: item.finish,
          coverage: item.cov,
          drying_time: "30-45 mins",
          recoat_time: "4 hrs",
          technology: item.tech,
          warranty: item.war,
          interior_exterior: item.ie,
          washability: item.cat.includes("Luxury") || item.name.includes("Velvet") || item.name.includes("3 In 1") ? "Excellent" : "Good",
          voc: "Low VOC",
          features: [item.tech, "Dulux Quality Seal", "Anti-Fungal Protection"],
          source: "aapkapainter_dulux_paints_price",
          image_url: storageUrl
        }));
      }
    } else {
      const storageUrl = await ensureProductImageRenamed("Dulux", item.name, item.size, item.cat, item.img);
      finalRows.push(makeRow({
        brand: "Dulux",
        brand_color: "#cc0100",
        category: item.cat,
        subcategory: item.sub,
        product_name: item.name,
        pack_size: item.size,
        mrp: item.price,
        finish: item.finish,
        coverage: item.cov,
        drying_time: "30-45 mins",
        recoat_time: "4 hrs",
        technology: item.tech,
        warranty: item.war,
        interior_exterior: item.ie,
        washability: "Good",
        voc: "Low VOC",
        features: [item.tech],
        source: "aapkapainter_dulux_paints_price",
        image_url: storageUrl
      }));
    }
  }

  console.log("⚙️ Resolving comparison other brands...");
  for (const item of otherBrands) {
    finalRows.push(makeRow({
      brand: item.brand,
      brand_color: item.color,
      category: item.cat,
      subcategory: item.sub,
      product_name: item.name,
      pack_size: item.size,
      mrp: item.price,
      finish: "Smooth",
      coverage: "120-140 sq.ft/L",
      drying_time: "30 mins",
      recoat_time: "4 hrs",
      technology: "Acrylic",
      warranty: "5 Years",
      interior_exterior: item.cat.includes("Interior") ? "Interior" : "Exterior",
      washability: "Excellent",
      voc: "Low VOC",
      features: ["Smooth finish", "Easy washability"],
      source: "market_survey"
    }));
  }

  console.log(`\n📦 Preparing to seed ${finalRows.length} competitor products with real-world scraped data...\n`);

  // Clear existing
  const { error: delError } = await supabase
    .from("competitor_products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (delError) {
    console.log("⚠️ Delete error:", delError.message);
  } else {
    console.log("🗑️ Cleared existing database table.\n");
  }

  let totalSeeded = 0;
  for (let i = 0; i < finalRows.length; i += 10) {
    const batch = finalRows.slice(i, i + 10);
    const { data, error } = await supabase
      .from("competitor_products")
      .insert(batch)
      .select("id");

    if (error) {
      console.error(`  ❌ Batch ${i + 1}–${Math.min(i + 10, finalRows.length)}: ${error.message}`);
    } else {
      totalSeeded += data.length;
      console.log(`  ✅ Batch ${i + 1}–${Math.min(i + 10, finalRows.length)}: ${data.length} rows inserted successfully`);
    }
  }

  console.log(`\n🎉 Seeding Completed! Seeded ${totalSeeded}/${finalRows.length} products.`);
  const brands = [...new Set(finalRows.map((c) => c.brand))];
  brands.forEach((b) => {
    const c = finalRows.filter((x) => x.brand === b).length;
    console.log(`   • ${b}: ${c} SKUs`);
  });
}

seed();
