/**
 * Keenan Gap Selling & Financial Loss Calculator Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Financial Reality Builder:
 * - Quantifies the chasm between Current State (MNC 3% margin) and Desired Future State (Swatch 40% margin)
 * - Calculates exact monthly and yearly compounded financial bleed
 * - Refines sales rep pitches: ruthlessly strips vague adjectives and injects exact rupee metrics
 * - Transforms decisions into urgent arithmetic necessities
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'keenan_gap_selling_ledger.csv');

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
    console.error('[Keenan Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class KeenanGapController {
  constructor() {
    this.name = 'keenan_gap_controller';
    this.legend = 'Keenan';
    this.role = 'Financial Reality Builder (Loss Calculator + Decision Accelerator)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Cold Arithmetic Loss Calculator
   */
  calculateGapLoss({ bagsPerMonth = 50, currentMarginPerBag = 35, swatchMarginPerBag = 400 }) {
    const currentProfit = bagsPerMonth * currentMarginPerBag;
    const swatchProfit = bagsPerMonth * swatchMarginPerBag;
    const monthlyGap = swatchProfit - currentProfit;
    const yearlyHemorrhage = monthlyGap * 12;
    const dailyBleed = Math.round(monthlyGap / 30);
    const perBagDifference = swatchMarginPerBag - currentMarginPerBag;

    return {
      bagsPerMonth,
      currentMarginPerBag,
      swatchMarginPerBag,
      perBagDifference,
      currentProfit,
      swatchProfit,
      monthlyGap,
      yearlyHemorrhage,
      dailyBleed,
      script: `Sir aap abhi ${bagsPerMonth} bag bechkar sirf ₹${currentProfit.toLocaleString('en-IN')} kama rahe ho. Swatch par wahi ${bagsPerMonth} bag ₹${swatchProfit.toLocaleString('en-IN')} dete hain. Difference seedha ₹${perBagDifference} per bag ka hai. Har mahine dukan se ₹${monthlyGap.toLocaleString('en-IN')} aur saal ka ₹${yearlyHemorrhage.toLocaleString('en-IN')} MNC brand ki jeb me bleed ho raha hai.`
    };
  }

  /**
   * Refine vague sales pitches into Keenan number-driven scripts
   */
  refineScriptToKeenanNumbers(vaguePitch = '') {
    const p = (vaguePitch || '').toLowerCase();

    if (p.includes('machine') || p.includes('tinting')) {
      return {
        vaguePitch,
        keenanScript: `Sir ₹3.5 Lakh machine me block karke aapko 2.5% return mil raha hai jabki tube sukhne aur maintenance ka alag kharcha hai. Wahi ₹3.5 Lakh Swatch fast-moving texture me lage toh saal me 6 turnover cycles me ₹84,000 net clean cash banata hai.`,
        rule: 'Contrast locked dead iron with liquid inventory velocity.'
      };
    }

    if (p.includes('thekedar') || p.includes('painter') || p.includes('token')) {
      return {
        vaguePitch,
        keenanScript: `Sir painters MNC se isliye shift nahi ho rahe kyunki unhe kuch nahi milta. Swatch Rustic ke har 25kg bag me ₹50 ka direct cash token hai. Agar 15 thekedar 10-10 bag uthayein toh counter par mahine ka ₹60,000 extra margin aur thekedaron ki pocket me ₹7,500 cash jata hai.`,
        rule: 'Quantify both dealer margin and painter micro-economics.'
      };
    }

    if (p.includes('delay') || p.includes('soch') || p.includes('time')) {
      return {
        vaguePitch,
        keenanScript: `Sir har ek din jo aap decision delay karte ho, counter se ₹1,230 ka cash profit nikal kar Asian ki jeb me chala jata hai. Sunday tak 20-bag trial lock karne se ye bleed turant stop ho jata hai.`,
        rule: 'Calculate daily cost of inaction (Daily Bleed).'
      };
    }

    // Default margin refinement
    return {
      vaguePitch: vaguePitch || 'Sir hamara product best hai aur margin zyada milega',
      keenanScript: `Sir aap abhi 50 bori bechkar sirf ₹1,750 kama rahe ho. Swatch par wahi 50 bori ₹20,000 deti hai — difference ₹365 per bag ka hai. Har mahine ₹18,250 aur saal ka ₹2,19,000 counter se seedha bleed ho raha hai.`,
      rule: 'Strip all adjectives. Voice exact monthly and annual rupee losses.'
    };
  }

  /**
   * Match incoming query to one of the 6 ledger scenarios
   */
  matchScenario(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const type = (r.scenario_type || '').toLowerCase();
      const current = (r.current_state_reality || '').toLowerCase();

      if (q.includes('100') || q.includes('high volume') || q.includes('100 bag')) {
        return r.gap_id === 'KEENAN-01';
      }
      if (q.includes('machine') || q.includes('tinting') || q.includes('capital')) {
        return r.gap_id === 'KEENAN-02';
      }
      if (q.includes('slow') || q.includes('dead') || q.includes('dhool') || q.includes('dust')) {
        return r.gap_id === 'KEENAN-03';
      }
      if (q.includes('thekedar') || q.includes('painter') || q.includes('leakage') || q.includes('token')) {
        return r.gap_id === 'KEENAN-04';
      }
      if (q.includes('trial') || q.includes('starter') || q.includes('delay') || q.includes('soch')) {
        return r.gap_id === 'KEENAN-05';
      }
      if (q.includes('territory') || q.includes('3 lakh') || q.includes('overall') || q.includes('annual')) {
        return r.gap_id === 'KEENAN-06';
      }

      return type.includes(q) || current.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Coach physical sales reps with gap selling briefings on WhatsApp
   */
  coachGapSelling({ query = '', repName = 'Field Sales Rep', dealerName = 'Counter Partner', bags = 50 }) {
    const record = this.matchScenario(query);

    // Extract numbers if present in query
    const numMatch = query.match(/(\d+)\s*(bag|bori|boriyaan)/i);
    let bagCount = bags;
    if (numMatch) {
      bagCount = parseInt(numMatch[1], 10);
    }

    const calc = this.calculateGapLoss({ bagsPerMonth: bagCount, currentMarginPerBag: 35, swatchMarginPerBag: 400 });

    let response = `⚡ *KEENAN — GAP SELLING & FINANCIAL REALITY BRIEFING*\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `💡 *Core Philosophy*: _“People don’t buy because of benefits… They buy to fix a costly problem.”_\n`;
    response += `⚖️ *Keenan's Law*: _“No Pain $\\to$ No Sale. No Loss $\\to$ No Urgency.”_\n\n`;

    response += `👤 *Rep*: ${repName} | *Target*: ${dealerName}\n`;
    response += `🎯 *Scenario*: *${record.scenario_type}*\n\n`;

    response += `📉 *CURRENT STATE (Aaj Ki Asliyat)*:\n`;
    response += `• ${bagCount} bags MNC texture @ ₹35 margin = *₹${calc.currentProfit.toLocaleString('en-IN')} profit*\n\n`;

    response += `📈 *FUTURE STATE (Swatch Reality)*:\n`;
    response += `• ${bagCount} bags Swatch Rustic @ ₹400 margin = *₹${calc.swatchProfit.toLocaleString('en-IN')} profit*\n\n`;

    response += `💣 *THE GAP (Cold Arithmetic Loss)*:\n`;
    response += `• *Per-Bag Hemorrhage*: ₹${calc.perBagDifference} / bag\n`;
    response += `• *Monthly Uncaptured Profit*: *₹${calc.monthlyGap.toLocaleString('en-IN')} / month*\n`;
    response += `• *12-Month Compounded Loss*: *₹${calc.yearlyHemorrhage.toLocaleString('en-IN')} / year*\n`;
    response += `• *Daily Bleed*: ₹${calc.dailyBleed.toLocaleString('en-IN')} / day\n\n`;

    response += `❌ *AMATEUR VAGUE PITCH (BANNED)*:\n`;
    response += `• _"${record.vague_amateur_script}"_\n\n`;

    response += `✅ *KEENAN REFINED SCRIPT*:\n`;
    response += `👉 *“${calc.script}”*\n\n`;

    response += `🛡️ *PHYSICAL REP ACTION CUE*:\n`;
    response += `• ${record.physical_rep_action_cue}\n`;
    response += `• *Golden Rule*: Put the physical calculator on the counter. Make the dealer enter the numbers.\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `_“Log profit ke liye nahi, active loss ko rokne ke liye decision lete hain.”_ 👑`;

    return response;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleKeenanConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    // Check if user is asking to refine a script
    if (q.includes('refine') || q.includes('script') || q.includes('vague')) {
      const refined = this.refineScriptToKeenanNumbers(text);
      let res = `🔧 *KEENAN SCRIPT REFINEMENT ENGINE*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `❌ *Original Vague Pitch*: _"${refined.vaguePitch}"_\n\n`;
      res += `✅ *Keenan Number-Driven Script*:\n👉 *“${refined.keenanScript}”*\n\n`;
      res += `🛡️ *Keenan Rule*: ${refined.rule}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      return res;
    }

    let query = text;
    if (q.startsWith('keenan') || q.startsWith('gap') || q.startsWith('loss') || q.startsWith('calculator')) {
      query = text.replace(/^(keenan|gap|loss|calculator|bleed)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = '100 bag texture me dealer ka kitna loss ho raha hai';
    }

    return this.coachGapSelling({
      query,
      repName,
      dealerName: 'Dealer ji',
      bags: 50
    });
  }
}

const controller = new KeenanGapController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Dealer moves 100 bags of MNC texture per month';
  console.log(controller.handleKeenanConversation(q));
}

module.exports = controller;
