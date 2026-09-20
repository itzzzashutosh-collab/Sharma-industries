const fs = require('fs');
const path = require('path');
const hermesBridge = require('../hermes-bridge');

async function runHermesCreativeEngine() {
  console.log('👑 [Hermes Master Brain] Invoking Creative & Branding Legends Pipeline via LLM API...');
  console.log('Legends: Storyteller (Piyush Pandey / Donald Miller), Hooks Specialist (MrBeast), CTA Specialist (Gary Halbert)...');

  const baseInstructions = `You are Hermes Brain directing the Branding & Creative Division for Sharma Industries (Swatch Paints).
CRITICAL CEO DIRECTIVES (STRICT ZERO VIOLATION):
1. ZERO COMPETITOR NAMES: Absolutely NEVER mention Asian Paints, Berger, Nerolac, Birla Opus, or ANY competitor brand name!
2. ZERO BADMOUTHING: Do not attack, degrade, compare negatively, or speak ill of any other company or product. Keep it 100% positive, dignified, and focused on Swatch Paints' own quality and values.
3. 100% POSITIVE BRAND IDENTITY: Focus on Swatch Paints' intrinsic merits, honest factory pricing, high dealer margins, ₹50 Painters Growth Tokens, 5-year weatherproof durability, and Rajasthan heritage trust ('Har Deewar Ka Pukka Vishwas').
4. LANGUAGE: Natural, respectful, dignified conversational Hinglish (as spoken by Indian business leaders and trade partners).`;

  // Script 1: For Retail & Hardware Dealers
  console.log('Generating Script 1: Retail & Hardware Dealers...');
  const prompt1 = `${baseInstructions}
Task: Generate a complete Camera-Ready Video Production Shooting Script for CEO Ashutosh Sharma addressing Retail & Hardware Paint Dealers.
Focus: 40-45% dealer margins, zero tinting machine deposit/barrier, 25kg moisture-proof ready-to-use bags, 2% cash discount, and 30-day stock buyback guarantee.

Output format:
# SCRIPT 1: RETAIL & HARDWARE DEALER PARTNERSHIP
- Target Audience: Paint & Hardware Retail Counter Owners
- Core Message: Transparent honest factory margins and zero dead-capital risk.
- [0:00 - 0:05] Visual Hook & Opening Punchline (High-impact visual + spoken line)
- [0:05 - 0:20] The Dealer Reality & Story (Counter space, working capital, inventory peace of mind)
- [0:20 - 0:45] The Swatch Rustic Advantage (40-45% margin, zero machine needed, 25kg bags, 2% cash discount, 30-day stock buyback)
- [0:45 - 1:00] Dignified Call-to-Action (Warm invitation to connect on WhatsApp for dealer terms & sample boards)`;

  const res1 = await hermesBridge.askOmniRoute(prompt1, { role: 'owner', name: 'Ashutosh Sharma' }, null, [], 'hinglish', 800);
  const text1 = typeof res1 === 'string' ? res1 : (res1?.text || '');

  // Script 2: For Professional Painters & Thekedaars
  console.log('Generating Script 2: Professional Painters & Thekedaars...');
  const prompt2 = `${baseInstructions}
Task: Generate a complete Camera-Ready Video Production Shooting Script for CEO Ashutosh Sharma addressing Professional Painters, Thekedaars & Applicators.
Focus: ₹50 cash token sealed inside every 25kg bag, smooth trowel glide, crack-bridging aggregate bonding, and applicator pride.

Output format:
# SCRIPT 2: PAINTERS & THEKEDAARS APPRECIATION
- Target Audience: Master Painters, Applicators, Contractors
- Core Message: Respect for craftsmanship, smooth workability, and instant cash reward in every bag.
- [0:00 - 0:05] Visual Hook (Bag unboxing / token reveal + opening spoken line)
- [0:05 - 0:20] Craftsmanship & Trust Story (Deewar ki lambi umar, mistri ki izzat aur mehnat)
- [0:20 - 0:45] Technical & Financial Merits (Smooth trowel application, high-build texture, ₹50 Painters Growth Token inside every 25kg bag)
- [0:45 - 1:00] Dignified Call-to-Action (Join Swatch Painters Club & get free sample boards)`;

  const res2 = await hermesBridge.askOmniRoute(prompt2, { role: 'owner', name: 'Ashutosh Sharma' }, null, [], 'hinglish', 800);
  const text2 = typeof res2 === 'string' ? res2 : (res2?.text || '');

  // Script 3: For Homeowners & House Builders
  console.log('Generating Script 3: Homeowners & House Builders...');
  const prompt3 = `${baseInstructions}
Task: Generate a complete Camera-Ready Video Production Shooting Script for CEO Ashutosh Sharma addressing Homeowners & Builders.
Focus: 'Har Deewar Ka Pukka Vishwas', 5-year weather resistance, rich stone texture luxury, and long-lasting durability.

Output format:
# SCRIPT 3: HOMEOWNERS & BUILDERS (BRAND FILM)
- Target Audience: Homeowners constructing or renovating their dream home
- Core Message: Permanent beauty, weather resilience, and honest quality.
- [0:00 - 0:05] Visual Hook (Rich architectural texture aesthetic + opening spoken line)
- [0:05 - 0:20] The Homeowner Dream (Ghar saalon saal naya jaisa chamke)
- [0:20 - 0:45] Swatch Rustic Performance (Rajasthan sun & rain resistance, high-build stone texture, 5-year durability assurance)
- [0:45 - 1:00] Dignified Call-to-Action (Doorstep sample swatch consultation)`;

  const res3 = await hermesBridge.askOmniRoute(prompt3, { role: 'owner', name: 'Ashutosh Sharma' }, null, [], 'hinglish', 800);
  const text3 = typeof res3 === 'string' ? res3 : (res3?.text || '');

  const fullDocument = `# 🎬 SWATCH PAINTS — 3 CAMERA-READY PRODUCTION SHOOTING SCRIPTS
*Synthesized by Hermes Brain & Branding Legends (Storyteller, Hooks Specialist, CTA Specialist)*
*Strict Guardrails: ZERO Competitor Mention | ZERO Negative Attacks | 100% Positive Value Framing*

---

${text1}

---

${text2}

---

${text3}
`;

  const outDir = path.join(__dirname, '..', 'data', 'marketing_toolkit');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'production_shooting_scripts.md');
  fs.writeFileSync(outFile, fullDocument, 'utf-8');

  console.log('✅ [Hermes Brain] All 3 Production Scripts synthesized and saved to: ' + outFile);
}

runHermesCreativeEngine().catch(console.error);
