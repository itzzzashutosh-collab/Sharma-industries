/**
 * April Dunford Positioning Engine Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Category Architect & Market Perception Controller:
 * - Extricates Swatch from the generic, low-margin "commodity paint brand" bucket
 * - Positions Swatch as a "Factory-Fresh, High-Margin, Zero-Tint Texture System"
 * - Breaks head-to-head commodity comparisons (e.g., Asian Paints vs. Swatch)
 * - Equips sales force with unified, perception-shifting commercial messaging
 * - Strictly enforces: NEVER introduce Swatch using the word "paint"
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'april_dunford_positioning_ledger.csv');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, '').trim());
}

function parseLedger() {
  if (!fs.existsSync(LEDGER_PATH)) return [];
  try {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf-8');
    const lines = raw.trim().split('\n');
    if (lines.length <= 1) return [];
    const headers = parseCsvLine(lines[0]);
    
    return lines.slice(1).map(line => {
      const vals = parseCsvLine(line);
      const row = {};
      headers.forEach((h, i) => {
        row[h] = vals[i] || '';
      });
      return row;
    });
  } catch (err) {
    console.error('[April Dunford Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class AprilDunfordController {
  constructor() {
    this.name = 'april_dunford_controller';
    this.legend = 'April Dunford';
    this.role = 'Category Architect (Market Perception Controller)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match an incoming query against the April Dunford Positioning Ledger
   */
  matchDimension(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const dim = (r.positioning_dimension || '').toLowerCase();
      const frame = (r.april_dunford_differentiation_frame || '').toLowerCase();

      if (q.includes('asian paints') || q.includes('asian') || q.includes('berger') || q.includes('comparison') || q.includes('vs')) {
        return r.positioning_id === 'DUNFORD-MNC-06';
      }
      if (q.includes('machine') || q.includes('tinting') || q.includes('dispenser') || q.includes('3.5 lakh')) {
        return r.positioning_id === 'DUNFORD-MCH-09';
      }
      if (q.includes('price') || q.includes('rate') || q.includes('sasta') || q.includes('350') || q.includes('expensive')) {
        return r.positioning_id === 'DUNFORD-PRC-08';
      }
      if (q.includes('confused') || q.includes('putty') || q.includes('kya hai') || q.includes('what is swatch') || q.includes('category')) {
        return r.positioning_id === 'DUNFORD-CNF-07';
      }
      if (q.includes('value') || q.includes('margin') || q.includes('40%') || q.includes('cash profit') || q.includes('10x')) {
        return r.positioning_id === 'DUNFORD-VAL-04';
      }
      if (q.includes('attribute') || q.includes('feature') || q.includes('silica quartz') || q.includes('shahrukh')) {
        return r.positioning_id === 'DUNFORD-ATT-03';
      }
      if (q.includes('target') || q.includes('hardware') || q.includes('dealer profile') || q.includes('who to sell')) {
        return r.positioning_id === 'DUNFORD-TGT-05';
      }
      if (q.includes('cadence') || q.includes('daily') || q.includes('sop') || q.includes('routine')) {
        return r.positioning_id === 'DUNFORD-CAD-10';
      }

      return dim.includes(q) || frame.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Generates a direct comparison reframing breakdown against Asian Paints or multinational brands
   */
  reframeComparison({ competitor = 'Asian Paints', dealerName = 'Retail Partner' } = {}) {
    let res = `🛡️ *APRIL DUNFORD — COMPETITIVE REFRAME: SWATCH VS ${competitor.toUpperCase()}*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `💡 *Positioning Law*: _“If you are compared, you are commoditized. If you are different, you are chosen.”_\n\n`;

    res += `❌ *THE COMMODITY TRAP (What Amateurs Say)*:\n`;
    res += `• “Sir hum bhi paint bechte hain, hamara maal ${competitor} jaisa hi hai aur unse sasta denge.”\n`;
    res += `👉 *Result*: Immediate price haggling, margin erosion, and 90-day credit demand.\n\n`;

    res += `✅ *THE APRIL DUNFORD REFRAME (Category Creation)*:\n`;
    res += `• *Identity*: ${competitor} is a computerized tinting paint system; Swatch is a **Zero-Tint Direct Texture Profit System**.\n`;
    res += `• *Capital Investment*: ${competitor} requires **₹3.5 Lakh machine capital lockup**; Swatch requires **₹0 machine investment**.\n`;
    res += `• *Dealer Net Margin*: ${competitor} delivers **3% to 5% (₹15–₹30/can)**; Swatch delivers **40% protected margin (₹200+/bag)**.\n`;
    res += `• *Labor Application Pull*: ${competitor} relies on corporate app points; Swatch seals a **₹50 instant cash token inside every bag**.\n\n`;

    res += `🎯 *EXECUTIVE WORD-FOR-WORD SCRIPT*:\n`;
    res += `👉 *“[Dealer Name] ji, aap bilkul sahi keh rahe hain. ${competitor} ek established tinting paint brand hai use chalne dijiye. Lekin hum koi paint brand nahi hain jo unse compete karne aaye hain — hum ek completely different business model hain. Wahan aapne ₹3.5 Lakh ki machine block ki hai aur margin milta hai 3%. Swatch ek Factory-Fresh Zero-Investment Texture System hai jisme bina kisi machine ke har single bori par aap flat 40% net cash profit kamate hain. Kya counter par ₹40,000 extra monthly income add karna galat hoga?”*\n\n`;

    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“Market me jeet product se nahi hoti; perception se hoti hai!”_ 👑`;
    return res;
  }

  /**
   * Formats comprehensive Positioning Briefing for Field Sales Force or WhatsApp
   */
  coachPositioning({ query = '', repName = 'Field Sales Executive', targetName = 'Trade Partner' } = {}) {
    const q = (query || '').toLowerCase().trim();

    if (q.includes('asian') || q.includes('vs') || q.includes('compare') || q.includes('comparison') || q.includes('competitor')) {
      return this.reframeComparison({ competitor: 'Asian Paints', dealerName: targetName });
    }

    const record = this.matchDimension(query);

    let res = `🏛️ *APRIL DUNFORD — POSITIONING & DIFFERENTIATION BRIEFING*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `💡 *Core Law*: _“If you are compared, you are commoditized. If you are different, you are chosen.”_\n`;
    res += `🎯 *Dimension*: *${record.positioning_dimension}*\n`;
    res += `👤 *Rep*: ${repName} | *Target*: ${targetName}\n\n`;

    res += `⚠️ *COMMODITY TRAP BEHAVIOR (Avoid)*:\n`;
    res += `• ${record.commodity_trap_behavior}\n\n`;

    res += `⚡ *DIFFERENTIATION FRAME (The Winning Shift)*:\n`;
    res += `• *${record.april_dunford_differentiation_frame}*\n\n`;

    res += `🎯 *POSITIONING SCRIPT (Word-for-Word)*:\n`;
    res += `👉 *“${record.field_dialogue_script}”*\n\n`;

    res += `📈 *COMMERCIAL PERCEPTION OUTCOME*:\n`;
    res += `• ${record.commercial_perception_outcome}\n\n`;

    res += `🛡️ *FIELD SALES ACTION RULE*:\n`;
    res += `• ${record.sales_rep_action_rule}\n`;
    res += `• *Cardinal Rule*: NEVER introduce Swatch using the word "paint"!\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“Swatch is NOT a paint brand. It is a high-margin, zero-investment texture system.”_ 👑`;

    return res;
  }

  /**
   * Conversational Router for WhatsApp and Orchestrator
   */
  handleDunfordConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('dunford') || q.startsWith('april') || q.startsWith('positioning') || q.startsWith('category')) {
      query = text.replace(/^(dunford|april|positioning|category|differentiation)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = 'Asian Paints comparison reframe and zero-tint texture category positioning';
    }

    return this.coachPositioning({
      query,
      repName,
      targetName: 'Retail Trade Partner'
    });
  }
}

const controller = new AprilDunfordController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Asian Paints comparison reframe and zero-tint texture category positioning';
  console.log(controller.handleDunfordConversation(q));
}

module.exports = controller;
