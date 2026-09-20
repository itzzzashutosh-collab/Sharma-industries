/**
 * Sharma Industries — Autonomous Overnight Video Script Generator
 * 
 * Powered by Hermes Brain & Branding Legends:
 *  - Hook Specialist: MrBeast (Visual Pattern Interrupt, Sensory Spikes)
 *  - Storyteller: Piyush Pandey / Donald Miller (Relatable Indian Context, Zero Competitor Mentions)
 *  - CTA Specialist: Gary Halbert / Alex Hormozi (Free Doorstep Consultation on +91 8000530422)
 * 
 * Runs continuously overnight, generating a comprehensive master script database
 * across 5 categories:
 * 1. Science of Paints (Technical Chemistry Education)
 * 2. Dealer Counter & Retail Business (Margins, Zero Tinting Machine)
 * 3. Painters & Thekedaars (₹50 Tokens, Trowel Techniques, Applicator Pride)
 * 4. Homeowners & Villa Builders (Monsoon Durability, Stone Texture Luxury)
 * 5. Architects & Interior Designers (Texture Specifications & Aesthetics)
 */

const fs = require('fs');
const path = require('path');
const hermesBridge = require('../hermes-bridge');

const TOOLKIT_DIR = path.join(__dirname, '..', 'data', 'marketing_toolkit');
const DB_JSON = path.join(TOOLKIT_DIR, 'video_scripts_database.json');
const MASTER_MD = path.join(TOOLKIT_DIR, 'all_production_scripts.md');
const MASTER_CSV = path.join(TOOLKIT_DIR, 'video_scripts_master.csv');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function initFiles() {
  ensureDir(TOOLKIT_DIR);
  if (!fs.existsSync(DB_JSON)) {
    fs.writeFileSync(DB_JSON, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(MASTER_MD)) {
    fs.writeFileSync(MASTER_MD, '# 🎬 SHARMA INDUSTRIES — MASTER VIDEO SCRIPTS DATABASE\n\n', 'utf-8');
  }
  if (!fs.existsSync(MASTER_CSV)) {
    fs.writeFileSync(MASTER_CSV, 'id,title,category,target_audience,hook_type,duration,cta_offer,created_at\n', 'utf-8');
  }
}

const TOPIC_POOL = [
  // Category 1: Science of Paints
  { category: 'Science of Paints', audience: 'Homeowners & Painters', topic: 'Why Efflorescence & Shora (Salt Leaks) Happen on Walls and How Waterproofing Polymers Block Them' },
  { category: 'Science of Paints', audience: 'Homeowners & Builders', topic: 'The Chemistry of Anti-Fungal Biocides: Preventing Black Mold & Algae During Monsoon' },
  { category: 'Science of Paints', audience: 'Painters & Contractors', topic: 'Pigment Volume Concentration (PVC) Explained: The Difference Between Primer, Emulsion, and Texture' },
  { category: 'Science of Paints', audience: 'Homeowners', topic: 'Water-Based Coatings vs Solvent Paints: Odor, VOCs, Health and Flame Resistance' },
  { category: 'Science of Paints', audience: 'Builders & Architects', topic: 'Crack-Bridging Science: How High-Elongation Acrylic Polymers Stretch Over Structural Micro-Cracks' },
  
  // Category 2: Dealer Counter Business
  { category: 'Dealer Counter', audience: 'Hardware & Paint Shop Owners', topic: 'Dead Stock vs Fast Inventory Turnover: Why Ready-To-Use Bags Protect Dealer Cash Flow' },
  { category: 'Dealer Counter', audience: 'Retail Paint Dealers', topic: 'The 30-Day Buyback Guarantee: Eliminating Risk for Emerging Product Lines' },
  { category: 'Dealer Counter', audience: 'Hardware Retailers', topic: 'The True Cost of Space: How Storing Bulk Bags Compares to Expensive Heavy Machines' },
  { category: 'Dealer Counter', audience: 'Paint Stockists', topic: 'Cash Discount Math (2% in 7 Days): How Ram Charan Cash Velocity Compounds Dealer Annual ROCE' },
  
  // Category 3: Painters & Applicators
  { category: 'Painters Club', audience: 'Professional Painters', topic: 'The Unboxing of Swatch Rustic: Finding the Sealed ₹50 Cash Token and Instant Scanning' },
  { category: 'Painters Club', audience: 'Thekedaars & Contractors', topic: 'The Notched Trowel vs Flat Float Technique for Maximum Rustic Texture Pattern Uniformity' },
  { category: 'Painters Club', audience: 'Contractors & Applicators', topic: 'How High-Build Texture Saves 2 Labour Days Compared to Multi-Coat Putty Sanding' },
  { category: 'Painters Club', audience: 'Master Painters', topic: 'Why Respecting Applicators Builds a Lifelong Brand: Swatch Certified Painter Community' },

  // Category 4: Homeowners & Builders
  { category: 'Homeowner Film', audience: 'Homeowners Building Houses', topic: 'Why Repainting Every 2 Years Is an Avoidable Scam: The 5-Year Stone Armor Philosophy' },
  { category: 'Homeowner Film', audience: 'Villa & House Owners', topic: 'Pre-Monsoon Wall Inspection: 3 Simple Signs That Your Exterior Wall Needs Protective Texture' },
  { category: 'Homeowner Film', audience: 'Families', topic: 'Har Deewar Ka Pukka Vishwas: The Heritage and Craft Behind Rajasthan-Engineered Coatings' },

  // Category 5: Architects & Designers
  { category: 'Architect Spec', audience: 'Architects & Interior Designers', topic: 'Aesthetic Light Shadows: How Natural Graded Quartz Texture Interacts with Sunlight Facades' },
  { category: 'Architect Spec', audience: 'Interior Decorators', topic: 'Seamless Accent Walls: Combining Swatch Rustic Texture with Modern Minimalist Lighting' }
];

class OvernightScriptGenerator {
  constructor() {
    this.running = false;
    this.generatedCount = 0;
    this.init();
  }

  init() {
    initFiles();
    try {
      const existing = JSON.parse(fs.readFileSync(DB_JSON, 'utf-8'));
      this.generatedCount = existing.length;
    } catch (e) {
      this.generatedCount = 0;
    }
  }

  async generateNextScript() {
    const topicItem = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
    const scriptId = `SC-${Date.now().toString(36).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const prompt = `You are Hermes Brain directing the Creative, Branding & Scriptwriting Division (MrBeast Hooks, Piyush Pandey Storytelling, Gary Halbert CTA).
Topic: "${topicItem.topic}"
Category: "${topicItem.category}"
Target Audience: "${topicItem.audience}"

CRITICAL RULES:
1. ZERO COMPETITOR NAMES: Never mention Asian Paints, Berger, Nerolac, Birla Opus or any other brand!
2. ZERO BADMOUTHING: Maintain 100% positive, dignified, helpful, and educational framing.
3. MRBEAST HOOK (0-3s): Start with a high-curiosity visual pattern interrupt / physical test / sensory spike.
4. HONEST SWATCH IDENTITY: Focus on genuine factory quality, honest pricing, healthy dealer margins, ₹50 painter cash tokens, and 5-year weatherproof durability.
5. GARY HALBERT / HORMOZI CTA: End with the Free Doorstep Paint & Moisture Consultation offer, sending 'GHAR' or 'CONSULT' to our official WhatsApp Gateway: +91 8000530422.
6. LANGUAGE: Natural, respectful, dignified conversational Hinglish.

OUTPUT FORMAT:
Title: <Punchy Video Title>
Target: ${topicItem.audience}
Category: ${topicItem.category}
Estimated Duration: 55-60s

[0:00 - 0:04] 🪝 Visual Hook & Opening Punchline:
<Describe high-retention visual action + exact spoken opening line>

[0:04 - 0:20] 📖 Core Story / Technical Problem:
<Relatable trade reality or scientific problem explained simply>

[0:20 - 0:42] 💡 Demonstration & Swatch Solution:
<Show the experiment, product benefit, or honest math>

[0:42 - 0:58] 🎯 Irresistible Free Consultation CTA:
<Free Doorstep Consultation offer + WhatsApp 'GHAR' or 'CONSULT' to +91 8000530422>`;

    try {
      const res = await hermesBridge.askOmniRoute(prompt, { role: 'owner', name: 'Ashutosh Sharma' }, null, [], 'hinglish', 850);
      const scriptBody = typeof res === 'string' ? res : (res?.text || '');

      if (scriptBody && scriptBody.length > 100) {
        const titleMatch = scriptBody.match(/Title:\s*(.+)/i);
        const title = titleMatch ? titleMatch[1].trim() : topicItem.topic;

        const newRecord = {
          id: scriptId,
          title,
          category: topicItem.category,
          targetAudience: topicItem.audience,
          scriptContent: scriptBody,
          createdAt: new Date().toISOString()
        };

        // 1. Append to JSON DB
        const currentDb = JSON.parse(fs.readFileSync(DB_JSON, 'utf-8'));
        currentDb.push(newRecord);
        fs.writeFileSync(DB_JSON, JSON.stringify(currentDb, null, 2), 'utf-8');

        // 2. Append to Master Markdown
        const mdEntry = `\n---\n\n## [${scriptId}] ${title}\n*Category: ${topicItem.category} | Audience: ${topicItem.audience}*\n\n${scriptBody}\n`;
        fs.appendFileSync(MASTER_MD, mdEntry, 'utf-8');

        // 3. Append to CSV
        const csvLine = `"${scriptId}","${title.replace(/"/g, '""')}","${topicItem.category}","${topicItem.audience}","MrBeast Visual Spike","55s","Free Consultation (+91 8000530422)","${new Date().toISOString()}"\n`;
        fs.appendFileSync(MASTER_CSV, csvLine, 'utf-8');

        this.generatedCount = currentDb.length;
        console.log(`✅ [OvernightScriptGenerator] Script #${this.generatedCount} (${scriptId}) saved: "${title}"`);
      }
    } catch (err) {
      console.warn('[OvernightScriptGenerator] Generation round error:', err.message);
    }
  }

  async startOvernight(intervalSeconds = 60) {
    this.running = true;
    console.log(`🚀 [OvernightScriptGenerator] Autonomous Overnight Script Generation Active (Current DB: ${this.generatedCount} scripts)...`);

    while (this.running) {
      try {
        await this.generateNextScript();
      } catch (e) {
        console.error('[OvernightScriptGenerator] Error:', e.message);
      }
      await new Promise(r => setTimeout(r, intervalSeconds * 1000));
    }
  }

  stop() {
    this.running = false;
  }
}

module.exports = new OvernightScriptGenerator();

if (require.main === module) {
  const gen = module.exports;
  gen.startOvernight(45);
}
