/**
 * Zig Ziglar Trust Engine & Long-Term Relationship Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Provides authentic, integrity-based coaching for physical sales representatives
 * to earn dealer trust, eliminate cynicism through radical honesty, and secure
 * lifetime repeat business across Rajasthan retail counters.
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'zig_ziglar_trust_ledger.csv');

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

function parseCsv() {
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
    console.error('[Zig Ziglar Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class ZigZiglarController {
  constructor() {
    this.name = 'zig_ziglar_controller';
    this.legend = 'Zig Ziglar';
    this.role = 'Trust Builder (Long-Term Relationship & Repeat Order Engine)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match incoming dealer skepticism and generate radical honesty response
   */
  generateTrustFraming(dealerDoubt = '') {
    const q = (dealerDoubt || '').toLowerCase().trim();
    const records = parseCsv();

    let matched = records.find(r => {
      const situation = (r.situation_type || '').toLowerCase();
      const doubt = (r.dealer_hesitation || '').toLowerCase();
      if (q.includes('naya') || q.includes('doubt') || q.includes('brand') || q.includes('new')) return situation.includes('new brand') || doubt.includes('naya');
      if (q.includes('painter') || q.includes('thekedar') || q.includes('karigar')) return situation.includes('painter') || doubt.includes('painter');
      if (q.includes('cheat') || q.includes('dhoka') || q.includes('supplier') || q.includes('past')) return situation.includes('burned') || doubt.includes('cheat');
      if (q.includes('machine') || q.includes('tinting')) return situation.includes('tinting') || doubt.includes('machine');
      if (q.includes('complaint') || q.includes('shikayat') || q.includes('replacement') || q.includes('service')) return situation.includes('service') || doubt.includes('shikayat');
      if (q.includes('target') || q.includes('regular') || q.includes('long term') || q.includes('partnership')) return situation.includes('partnership') || doubt.includes('target');
      return false;
    });

    if (!matched && records.length > 0) {
      matched = records[0]; // Default to New Brand Skepticism
    }

    return matched || {
      trust_id: 'ZIGLAR-GEN',
      situation_type: 'General Skepticism',
      dealer_hesitation: dealerDoubt,
      ziglar_honest_script: 'Sir honestly bolu toh Asian Paints jaisa purana naam abhi hamara nahi hai, lekin Bundi natural quartz ki quality aur 40% clean dealer margin unse better hai.',
      trust_pillar: 'Honesty Over Hype',
      risk_reversal_action: '20-bag starter trial with 7-day 100% exchange guarantee',
      long_term_intent_phrase: 'Hum ek baar maal bechne nahi, agle 10 saal tak Hadoti me counter partnership banane aaye hain.',
      physical_rep_cue: 'Speak with radical honesty. Never boast or overpromise.'
    };
  }

  /**
   * Format field briefing for physical reps on WhatsApp
   */
  coachTrust({ dealerDoubt, repName = 'Field Rep', dealerName = 'Dealer' }) {
    const framing = this.generateTrustFraming(dealerDoubt);

    let response = `🤝 *ZIG ZIGLAR — TRUST ENGINE & INTEGRITY COACHING*\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `💡 *Core Philosophy*: _“People don’t buy products… they buy TRUST in the person selling it.”_\n\n`;
    response += `👤 *Physical Rep Target*: ${repName} | *Prospect*: ${dealerName}\n`;
    response += `🛑 *Dealer Skepticism*: _"${dealerDoubt}"_\n\n`;

    response += `🧠 *TRUST PILLAR*: *${framing.trust_pillar}*\n\n`;

    response += `🎯 *RADICAL HONESTY FIELD SCRIPT*:\n`;
    response += `👉 *“${framing.ziglar_honest_script}”*\n\n`;

    response += `🛡️ *TANGIBLE RISK-REVERSAL ACTION*:\n`;
    response += `• *Action*: ${framing.risk_reversal_action}\n`;
    response += `• *Guarantee*: 7-Day 100% exchange on slow-moving inventory.\n\n`;

    response += `🌱 *LONG-TERM PARTNERSHIP SIGNAL*:\n`;
    response += `👉 *“${framing.long_term_intent_phrase}”*\n\n`;

    response += `📋 *COACHING CUE FOR PHYSICAL REP*:\n`;
    response += `• *Posture*: Humble, grounded, transparent, calm eye contact.\n`;
    response += `• *Field Rule*: ${framing.physical_rep_cue}\n`;
    response += `• *Daily Target*: 1 Honest Line | 1 Risk Removed | 1 Long-term Intent Stated.\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `_“No trust $\\to$ No repeat. No repeat $\\to$ No business.”_ 👑`;

    return response;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleZiglarConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let dealerDoubt = text;
    if (q.startsWith('ziglar') || q.startsWith('trust') || q.startsWith('bharosa') || q.startsWith('vishwaas')) {
      dealerDoubt = text.replace(/^(ziglar|trust|bharosa|vishwaas|integrity)\s*/i, '').trim();
    }

    if (!dealerDoubt || dealerDoubt.length < 4) {
      dealerDoubt = 'Dealer ko lagta hai naya brand hai chalega ya nahi';
    }

    return this.coachTrust({
      dealerDoubt,
      repName,
      dealerName: 'Counter Partner'
    });
  }
}

const controller = new ZigZiglarController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Dealer keh raha hai pehle kisi ne cheat kiya tha';
  console.log(controller.handleZiglarConversation(q));
}

module.exports = controller;
