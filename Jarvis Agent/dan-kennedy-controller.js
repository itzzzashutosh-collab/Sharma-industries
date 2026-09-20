/**
 * Dan Kennedy Urgency & Direct Response Decision Trigger Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Provides 24*7 autonomous direct response guidance for physical sales reps
 * to destroy dealer delay ("soch ke batata hoon") and compel immediate commitment
 * for the 20-bag Shubh Aarambh starter trial.
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'dan_kennedy_urgency_ledger.csv');

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
    console.error('[Dan Kennedy Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}


class DanKennedyController {
  constructor() {
    this.name = 'dan_kennedy_controller';
    this.legend = 'Dan Kennedy';
    this.role = 'Dealer Activation Specialist (Decision Trigger Engine)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match an incoming dealer delay excuse and generate a direct response urgency trigger
   */
  generateUrgencyTrigger(delayExcuse = '') {
    const q = (delayExcuse || '').toLowerCase().trim();
    const records = parseCsv();

    let matched = records.find(r => {
      const excuse = (r.dealer_delay_excuse || '').toLowerCase();
      if (q.includes('soch') || q.includes('bataunga') || q.includes('vichar')) return excuse.includes('soch');
      if (q.includes('time') || q.includes('jaldi') || q.includes('waqt')) return excuse.includes('time');
      if (q.includes('market') || q.includes('dekh ke') || q.includes('dekhkar')) return excuse.includes('market');
      if (q.includes('agle mahine') || q.includes('next month') || q.includes('season')) return excuse.includes('agle mahine');
      if (q.includes('sample') || q.includes('check') || q.includes('ek do')) return excuse.includes('sample');
      if (q.includes('baaki') || q.includes('puch') || q.includes('doosre')) return excuse.includes('baaki');
      return false;
    });

    if (!matched && records.length > 0) {
      matched = records[0]; // Default to "Soch ke bataunga"
    }

    return matched || {
      urgency_id: 'KENNEDY-GEN',
      dealer_delay_excuse: delayExcuse,
      trigger_type: 'Ethical Scarcity & Deadline',
      kennedy_response_script: 'Sir honestly bolu toh iss area me hum limited counters select kar rahe hain jisme se majority slots lock ho chuke hain. Isliye launch terms ko hold nahi kar payenge.',
      psychological_principle: 'Fear of Missing Out (FOMO)',
      territory_slots_context: '10 Territory Slots Max',
      deadline_time: 'Sunday 6:00 PM',
      physical_rep_cue: 'Do not sound needy. Speak with authority and matter-of-fact confidence.'
    };
  }

  /**
   * Format field briefing for physical reps on WhatsApp
   */
  coachUrgency({ delayExcuse, repName = 'Field Rep', dealerName = 'Dealer' }) {
    const trigger = this.generateUrgencyTrigger(delayExcuse);

    let response = `⚡ *DAN KENNEDY — DIRECT RESPONSE DECISION TRIGGER*\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `💡 *Core Philosophy*: _“If there is no urgency, there is no sale.”_\n\n`;
    response += `👤 *Physical Rep Target*: ${repName} | *Prospect*: ${dealerName}\n`;
    response += `🛑 *Dealer Delay Excuse*: _"${delayExcuse}"_\n\n`;

    response += `🧠 *PSYCHOLOGICAL TRIGGER*: *${trigger.trigger_type}*\n`;
    response += `• *Principle*: ${trigger.psychological_principle}\n`;
    response += `• *Context*: ${trigger.territory_slots_context}\n`;
    response += `• *Hard Deadline*: *${trigger.deadline_time}*\n\n`;

    response += `🎯 *WORD-FOR-WORD DECISION TRIGGER SCRIPT*:\n`;
    response += `👉 *“${trigger.kennedy_response_script}”*\n\n`;

    response += `🛡️ *COACHING CUE FOR PHYSICAL REP*:\n`;
    response += `• *Posture*: High authority, matter-of-fact, calm tone. Zero begging.\n`;
    response += `• *Field Rule*: ${trigger.physical_rep_cue}\n`;
    response += `• *Objective*: Lock immediate commitment for the **20-Bag Shubh Aarambh Trial**.\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `_“No urgency $\\to$ No decision. No decision $\\to$ No sale.”_ 👑`;

    return response;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleKennedyConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let delayExcuse = text;
    if (q.startsWith('kennedy') || q.startsWith('urgency') || q.startsWith('scarcity') || q.startsWith('deadline')) {
      delayExcuse = text.replace(/^(kennedy|urgency|scarcity|deadline|fomo)\s*/i, '').trim();
    }

    if (!delayExcuse || delayExcuse.length < 4) {
      delayExcuse = 'Dealer bol raha hai soch ke bataunga';
    }

    return this.coachUrgency({
      delayExcuse,
      repName,
      dealerName: 'Counter Partner'
    });
  }
}

const controller = new DanKennedyController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Dealer bol raha hai market dekh ke batayenge';
  console.log(controller.handleKennedyConversation(q));
}

module.exports = controller;
