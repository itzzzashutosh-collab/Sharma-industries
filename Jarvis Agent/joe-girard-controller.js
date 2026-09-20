/**
 * Joe Girard Relationship Manager & Retention Payment Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the dedicated Relationship Manager:
 * - Governed by Joe Girard's Law of 250 (Every dealer influences 250 network contacts)
 * - Drives high-frequency repeat orders by reminding dealers of realized rupee cash profits
 * - Automates respectful 7-day payment discipline cadence (Day 4 soft, Day 5 CD/value, Day 7 firm close)
 * - Cultivates deep personal connections and long-term dealer loyalty across Hadoti counters
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'joe_girard_retention_payment_ledger.csv');

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
    console.error('[Joe Girard Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class JoeGirardController {
  constructor() {
    this.name = 'joe_girard_controller';
    this.legend = 'Joe Girard';
    this.role = 'Relationship Manager (Repeat Orders + Payment Discipline + Dealer Loyalty System)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match incoming field scenario against the Joe Girard Retention Ledger
   */
  matchRetentionScenario(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseCsv();

    let matched = records.find(r => {
      const scenario = (r.scenario_type || '').toLowerCase();
      const trigger = (r.dealer_state_trigger || '').toLowerCase();

      // Payment queries
      if (q.includes('payment') || q.includes('paisa') || q.includes('ugahi') || q.includes('collection') || q.includes('credit')) {
        if (q.includes('7') || q.includes('overdue') || q.includes('late') || q.includes('delay') || q.includes('firm')) {
          return r.retention_id === 'GIRARD-04';
        }
        return r.retention_id === 'GIRARD-03';
      }

      // Reorder / Repeat order queries
      if (q.includes('reorder') || q.includes('repeat') || q.includes('order nahi') || q.includes('stock khatam') || q.includes('profit')) {
        return r.retention_id === 'GIRARD-02';
      }

      // Disengagement / Cold dealer queries
      if (q.includes('disengage') || q.includes('thanda') || q.includes('interest lose') || q.includes('ignore') || q.includes('shikayat')) {
        return r.retention_id === 'GIRARD-05';
      }

      // Post delivery follow-up queries
      if (q.includes('deliver') || q.includes('day 2') || q.includes('check') || q.includes('unloading') || q.includes('post sale')) {
        return r.retention_id === 'GIRARD-01';
      }

      // Word of mouth / referrals
      if (q.includes('referral') || q.includes('word of mouth') || q.includes('law of 250') || q.includes('thekedar') || q.includes('250')) {
        return r.retention_id === 'GIRARD-06';
      }

      return scenario.includes(q) || trigger.includes(q);
    });

    if (!matched && records.length > 0) {
      matched = records[1]; // Default to Repeat Order Procrastination (GIRARD-02)
    }

    return matched || {
      retention_id: 'GIRARD-GEN',
      scenario_type: 'General Dealer Retention & Relationship Management',
      dealer_state_trigger: query,
      wrong_approach: 'Sir please agla order do na',
      joe_girard_script: 'Namaste [Dealer Name] ji! Last batch se counter par solid margin generate hua. Relationship aur customer demand ko continuous maintain rakhne ke liye agla dispatch schedule kar lein?',
      retention_pillar: 'Law of 250 & Profit Reminder',
      financial_or_relationship_metric: 'Protecting counter Lifetime Value (LTV)',
      rm_action_sop: 'Always greet by name. Remind of profits already pocketed. Enforce strict 7-day payment window with calm dignity.'
    };
  }

  /**
   * Generates a tailored 7-Day Payment Reminder (Day 4 soft, Day 5 value, Day 7 firm)
   */
  generatePaymentReminder({ day = 4, dealerName = 'Sharma ji', invoiceNum = 'INV-104', invoiceAmount = 34500 }) {
    const cdAmount = Math.round(invoiceAmount * 0.02);

    if (day <= 4) {
      return {
        stage: 'Day 4 Soft Reminder (Cash Discount Window)',
        script: `Namaste ${dealerName}! Bas ek friendly reminder tha — invoice ${invoiceNum} (₹${invoiceAmount.toLocaleString('en-IN')}) ka 2% Cash Discount slot kal sham close ho raha hai. Agar aap kal tak clear kar dete hain toh ₹${cdAmount.toLocaleString('en-IN')} seedha aapka extra bachta hai.`,
        tone: 'Friendly, warm, saving-focused',
        rule: 'Never show doubt. Frame as a direct financial reward for the dealer.'
      };
    } else if (day === 5 || day === 6) {
      return {
        stage: 'Day 5 Value & Priority Dispatch Reminder',
        script: `Namaste ${dealerName}! Bas update check kar raha tha invoice ${invoiceNum} ka. Payment clear ho jane par accounts system me auto-reconcile ho jata hai, jisse next batch dispatch priority queue me rehti hai aur aapke dealer points active rehte hain.`,
        tone: 'Professional, system-driven, supportive',
        rule: 'Link on-time payment to uninterrupted factory priority and scheme benefits.'
      };
    } else {
      return {
        stage: 'Day 7 Firm Institutional Cycle Close',
        script: `Namaste ${dealerName}! Main jaanta hoon aap counter par busy rehte hain. Company ki strict audit policy ke mutabiq 7-day cycle par invoice clear hona zaroori hota hai taaki factory se agla dispatch automatically approve ho sake. Hum dono ka commercial relation ekdum smooth rahe, isiliye kya hum ise aaj sham tak UPI ya cheque se close kar lein?`,
        tone: 'Calm, smiling, institutional, zero personal conflict',
        rule: 'Blame the institutional ERP system. Strictly never get angry or threatening.'
      };
    }
  }

  /**
   * Generates a repeat order pitch framed around net cash profits pocketed
   */
  generateReorderTrigger({ bagsSold = 30, dealerName = 'Sharma ji', product = 'Swatch Rustic Texture' }) {
    const profitPocketed = bagsSold * 400; // ~₹400 per bag profit vs MNC brand ₹45
    const mncProfit = bagsSold * 45;

    return {
      bagsSold,
      profitPocketed,
      mncProfit,
      script: `Namaste ${dealerName}! Pichle cycle me counter se ${bagsSold} bags ${product} nikal chuke hain, jisse aapne lagbhag ₹${profitPocketed.toLocaleString('en-IN')} ka net cash margin pocket kiya — yahi maal kisi MNC brand ka bechne par sirf ₹${mncProfit.toLocaleString('en-IN')} banta. Counter par painters ko bina maal ke wapas na jana pade, isiliye kya Monday subah ke liye same ${bagsSold} bags ka fresh batch schedule kar dein?`,
      sopCue: 'Voicing actual rupee profit makes reordering logical and self-evident. Never beg for orders.'
    };
  }

  /**
   * Formats comprehensive Relationship Manager briefing for WhatsApp or Physical Rep
   */
  coachRetention({ scenario = '', repName = 'Relationship Manager', dealerName = 'Counter Partner' }) {
    const record = this.matchRetentionScenario(scenario);

    let response = `🤝 *JOE GIRARD — RELATIONSHIP MANAGER & RETENTION BRIEFING*\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `💡 *Core Philosophy*: _“People don’t buy once… They buy from people they LIKE, TRUST, and REMEMBER.”_\n`;
    response += `⚖️ *The Law of 250*: _1 Happy Dealer = +250 Advocates | 1 Offended Dealer = -250 Poisoned Wells_\n\n`;

    response += `👤 *Physical RM*: ${repName} | *Dealer Target*: ${dealerName}\n`;
    response += `🎯 *Scenario*: *${record.scenario_type}*\n`;
    response += `🛑 *Dealer State / Trigger*: _"${record.dealer_state_trigger}"_\n\n`;

    response += `❌ *AMATEUR WRONG APPROACH*:\n`;
    response += `• _"${record.wrong_approach}"_\n\n`;

    response += `✅ *JOE GIRARD MASTER SCRIPT*:\n`;
    response += `👉 *“${record.joe_girard_script}”*\n\n`;

    response += `🏛️ *RETENTION PILLAR & METRIC*:\n`;
    response += `• *Pillar*: ${record.retention_pillar}\n`;
    response += `• *Financial / Relational Metric*: ${record.financial_or_relationship_metric}\n\n`;

    response += `🛡️ *RELATIONSHIP MANAGER FIELD SOP*:\n`;
    response += `• *Action*: ${record.rm_action_sop}\n`;
    response += `• *Cadence*: Day 2 Check $\\to$ Day 4-5 Soft/CD Reminder $\\to$ Day 7 Firm Close $\\to$ Day 10 Reorder Push.\n`;
    response += `• *Respect Rule*: Always address as *[Name] ji*. Never use generic slang titles.\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `_“First Sale = Business Start. Repeat Sale = Real Business.”_ 👑`;

    return response;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleGirardConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Relationship Manager';

    // Check if explicitly asking for payment reminder
    if (q.includes('payment reminder') || q.includes('day 4') || q.includes('day 5') || q.includes('day 7')) {
      let day = 4;
      if (q.includes('day 7') || q.includes('7 day') || q.includes('overdue')) day = 7;
      else if (q.includes('day 5') || q.includes('5 day')) day = 5;

      const rem = this.generatePaymentReminder({ day, dealerName: 'Dealer ji' });
      return `💳 *JOE GIRARD PAYMENT CADENCE — ${rem.stage.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👉 *Script*: “${rem.script}”\n\n📌 *Tone*: ${rem.tone}\n🛡️ *Field Rule*: ${rem.rule}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    // Check if asking for repeat order trigger
    if (q.includes('repeat order') || q.includes('reorder') || q.includes('profit reminder')) {
      const ro = this.generateReorderTrigger({ bagsSold: 30, dealerName: 'Sharma ji' });
      return `🔄 *JOE GIRARD REPEAT ORDER TRIGGER (PROFIT REMINDER)*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👉 *Script*: “${ro.script}”\n\n📊 *Economics*: ₹${ro.profitPocketed.toLocaleString('en-IN')} Swatch Profit vs ₹${ro.mncProfit.toLocaleString('en-IN')} MNC Brand Profit.\n🛡️ *Field Cue*: ${ro.sopCue}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    let scenario = text;
    if (q.startsWith('girard') || q.startsWith('joe') || q.startsWith('retention') || q.startsWith('relationship')) {
      scenario = text.replace(/^(girard|joe|retention|relationship|rm)\s*/i, '').trim();
    }

    if (!scenario || scenario.length < 4) {
      scenario = 'Dealer repeat order nahi de raha aur payment delay kar raha hai';
    }

    return this.coachRetention({
      scenario,
      repName,
      dealerName: 'Counter Partner'
    });
  }
}

const controller = new JoeGirardController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Dealer repeat order me aalsi ho raha hai';
  console.log(controller.handleGirardConversation(q));
}

module.exports = controller;
