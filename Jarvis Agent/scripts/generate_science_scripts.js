const fs = require('fs');
const path = require('path');
const hermesBridge = require('../hermes-bridge');

async function runScienceOfPaintsGenerator() {
  console.log('👑 [Hermes Master Brain] Synthesizing "Science of Paints" Educational Series Scripts...');

  const basePrompt = `You are Hermes Brain directing the Technical Education & Science of Paints Series for Sharma Industries (Swatch Paints).
CRITICAL DIRECTIVES:
1. ZERO COMPETITOR NAMES: Never mention any competitor brand names.
2. ZERO BADMOUTHING: Speak with scientific authority and technical honesty without disrespecting anyone.
3. EDUCATIONAL & AWARENESS FOCUS: Educate homeowners, dealers, and painters on the real chemistry of paints — Binders (Resin), Pigments (TiO2), Extenders (Quartz/Dolomite), and Additives (Biocides/Polymers).
4. TONE: Engaging, authoritative, easy-to-understand conversational Hinglish. Explain complex chemistry simply using relatable daily analogies.

Generate 3 Distinct Camera-Ready Video Scripts for CEO Ashutosh Sharma to present:

EPISODE 1: "Deewar Par Chalking Aur Papdi Kyu Aati Hai? (The Role of Acrylic Binders / Resin)"
- Explains what Resin/Binder is (the actual glue). Why low binder ratio leads to chalking (haath pe safedi lagna), and why 100% pure acrylic emulsion prevents peeling.
- Visual props: A beaker of acrylic binder vs dry powder, rubbing hand on wall.

EPISODE 2: "Safedi Ka Asli Sach: Titanium Dioxide vs Calcite Filler (The Role of Pigment & Opacity)"
- Explains Rutile Titanium Dioxide (TiO2) vs cheap chalk/dolomite fillers. Why high TiO2 gives UV resistance, hiding power in fewer coats, and stops yellowing under the Indian sun.
- Visual props: Showing how light bounces off pure TiO2.

EPISODE 3: "High-Build Texture Pathar Jaisa Kyu Hota Hai? (The Role of Graded Quartz Aggregates)"
- Explains why Swatch Rustic Texture acts as an impenetrable shield. How interlocking graded quartz crystals bridge hairline cracks and withstand monsoon lashing.
- Visual props: Showing quartz crystals and demonstrating water beading off.

FORMAT FOR EACH EPISODE:
- Episode Title & Educational Objective
- [0:00 - 0:05] Curious Technical Hook (Mind-opening question + visual)
- [0:05 - 0:25] The Chemistry Breakdown (Clear analogy: glue, hiding, or stone matrix)
- [0:25 - 0:45] Laboratory Truth & Demonstration (What happens inside the paint plant)
- [0:45 - 1:00] Empowering Advice for Homeowners/Painters & Dignified CTA`;

  const res = await hermesBridge.askOmniRoute(basePrompt, { role: 'owner', name: 'Ashutosh Sharma' }, null, [], 'hinglish', 1800);
  const text = typeof res === 'string' ? res : (res?.text || '');

  const outDir = path.join(__dirname, '..', 'data', 'marketing_toolkit');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'science_of_paints_scripts.md');
  fs.writeFileSync(outFile, text, 'utf-8');

  console.log('✅ [Hermes Brain] "Science of Paints" scripts generated and saved to: ' + outFile);
}

runScienceOfPaintsGenerator().catch(console.error);
