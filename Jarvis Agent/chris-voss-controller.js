/**
 * Chris Voss Tactical Empathy & Dynamic Negotiation Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Master Legend: Chris Voss (Former FBI Lead Kidnapping Negotiator & Author of Never Split the Difference)
 * Governing Executive: CEO Ashutosh Sharma (+91 9079609627)
 * 
 * Core System:
 *  1. Tactical Empathy (Lowering defensive shields)
 *  2. Labeling (Naming unspoken emotions)
 *  3. Mirroring (Acoustic reflections of last 2-3 words)
 *  4. Calibrated Questions (Strictly "How" & "What")
 *  5. No-Oriented Questions (Safe agreement architecture)
 *  6. Advanced Techniques: Silence Power (4-sec rule), Late-Night FM DJ Voice, "That's Right" Moment
 *  7. Margin Protection Guardrails (Zero discounting, net hurdle rate defense)
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'chris_voss_negotiation_ledger.csv');
const SYSTEM_DOC_PATH = path.join(__dirname, 'data', 'swatch_chris_voss_objection_domination_system.md');

function parseCsv() {
  if (!fs.existsSync(LEDGER_PATH)) return [];
  try {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf-8');
    const lines = raw.trim().split('\n');
    if (lines.length <= 1) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const row = {};
      headers.forEach((h, i) => {
        let val = matches[i] ? matches[i].replace(/^"|"$/g, '').trim() : '';
        row[h] = val;
      });
      return row;
    });
  } catch (err) {
    console.error('[Chris Voss Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class ChrisVossController {
  constructor() {
    this.name = 'chris_voss_controller';
    this.legend = 'Chris Voss';
    this.role = 'Negotiation Specialist & Dynamic Objection Domination Commander';
    this.division = 'Sales & Negotiations Division';
    this.mandate = 'Objection Domination without Discounting, Tactical Empathy, and Margin Protection';

    // Auto-bind methods for safe destructuring
    this.handleVossConversation = this.handleVossConversation.bind(this);
    this.getObjectionDominationBrief = this.getObjectionDominationBrief.bind(this);
    this.coachPhysicalAgent = this.coachPhysicalAgent.bind(this);
    this.analyzeObjection = this.analyzeObjection.bind(this);
  }

  /**
   * Generates the Master Chris Voss Advanced Objection Domination Brief
   */
  getObjectionDominationBrief() {
    let out = `🎧 *CHRIS VOSS — ADVANCED OBJECTION DOMINATION SYSTEM*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎖️ *Controlled by*: Chris Voss (Dynamic Negotiation Lead)\n`;
    out += `👑 *Governing Authority*: CEO Ashutosh Sharma (+91 9079609627)\n\n`;
    out += `🎯 *Core Objective*: Toughest dealer ko handle karna | Stuck deals revive karna | Bina discount deal close karna!\n`;
    out += `🧠 *The Core Philosophy*: "Negotiation = Control through understanding. Objection = NO nahi hota, Objection = 'Samjho mujhe!'"\n\n`;
    out += `🧩 *THE 5 CORE PRINCIPLE SYSTEM*:\n`;
    out += `1. 🟡 *TACTICAL EMPATHY*: "Lag raha hai sir aapko risk lene me hesitation ho raha hai..." (Drop guard instantly)\n`;
    out += `2. 🟢 *LABELING* (Emotion ko naam do): "Lagta hai sir aapko lag raha hai ki demand nahi aayegi..." (Unspoken pain surfaces)\n`;
    out += `3. 🔵 *MIRRORING* (Last words repeat): Dealer: "Demand nahi hai" ➔ Rep: "Demand nahi hai?" (+ 4 sec silence)\n`;
    out += `4. 🟣 *CALIBRATED QUESTIONS* (How/What): "Sir kya hona chahiye ki aap comfortable feel karo?" (Hand control back)\n`;
    out += `5. 🔴 *NO-ORIENTED QUESTIONS*: "Sir kya aapko lagta hai ki extra ₹300 profit lena galat hai?" (Safe agreement)\n\n`;
    out += `💣 *REAL OBJECTION DOMINATION SCENARIOS*:\n`;
    out += `• *“Demand nahi hai”* ➔ Label hesitation ➔ "Sir agar painters ko ₹50 token + ₹300 dealer margin mile, kya wo push nahi karenge?"\n`;
    out += `• *“Price high hai”* ➔ Label price anxiety ➔ "Sir kya ₹50 bachane ke chakkar me ₹300 extra margin lose karna chahoge?"\n`;
    out += `• *“Soch ke bataunga”* ➔ Label uncertainty ➔ "Sir aisa kya point hai jo abhi aapko rok raha hai 20 bag trial start karne se?"\n`;
    out += `• *“Already brand hai”* ➔ Label comfort zone ➔ "Sir wahi painters agar Swatch se ₹300 extra profit de jayein, kya use ignore karna sahi hoga?"\n\n`;
    out += `⚡ *ADVANCED TECHNIQUES*: Silence Power (Wait 4 sec) | Late-Night FM DJ Voice | "That's Right" Moment\n`;
    out += `🚨 *GUARDRAIL*: Strict Zero Discounting. Swatch Rustic net profit hurdle strictly ≥₹100/bag protected.\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master System Doc: \`data/swatch_chris_voss_objection_domination_system.md\`_ 🫡`;
    return out;
  }

  /**
   * Analyze an incoming objection from a physical rep and generate dynamic tactical guidance
   */
  analyzeObjection(objectionText = '') {
    const q = (objectionText || '').toLowerCase().trim();
    const records = parseCsv();

    // Specific matchers based on the 4 core Voss scenarios
    if (q.includes('demand') || q.includes('maang') || (q.includes('chalta') && q.includes('nahi'))) {
      return {
        objection_id: 'VOSS-DEMAND',
        dealer_objection: 'Demand nahi hai / Naya brand hai',
        detected_emotion: 'Fear of Dead Inventory & Capital Blockade',
        voss_label: 'Lagta hai [Name] ji, aapko doubt hai ki agar stock utha liya to counter se demand aayegi ya nahi...',
        voss_mirror: 'Demand nahi hai?',
        voss_calibrated_question: 'Sir agar ground painters ko har bag par ₹50 direct cash token aur solid quality mile, to kya wo isko khareedne counter par nahi aayenge?',
        tactical_empathy_phrase: 'Samajh sakta hoon sir, 20 saal ki dukan ki reputation kisi untested brand par lagana easy nahi hota.',
        physical_rep_coaching_cue: 'Keep tone slow and calm. After mirroring "Demand nahi hai?", maintain complete silence for 4 seconds.',
        margin_protection_rule: 'Never discount to create demand. Emphasize ₹50 cash tokens inside bag and 7-day exchange guarantee.'
      };
    }

    if (q.includes('price') || q.includes('rate') || q.includes('mehenga') || q.includes('expensive') || q.includes('sasta')) {
      return {
        objection_id: 'VOSS-PRICE',
        dealer_objection: 'Price bahut high hai / Saste me do',
        detected_emotion: 'Fear of Overpaying & Margin Anxiety',
        voss_label: 'Lagta hai sir aapko pricing structure thoda risky lag raha hai...',
        voss_mirror: 'Price risky lag raha hai?',
        voss_calibrated_question: 'Sir kya aap ₹50 saste local maal ke chakkar me counter par painter ki shikayat lena chahoge, ya fir ₹300-₹400 ka pakka net profit banana chahoge?',
        tactical_empathy_phrase: 'Samajh sakta hoon sir, har smart business owner sabse pehle apni purchase cost aur risk dekhta hai.',
        physical_rep_coaching_cue: 'Never defend price or apologize. Contrast ₹50 raw material cost vs ₹300 dealer net profit.',
        margin_protection_rule: 'STRICT ZERO DISCOUNT. Never drop ₹690 dealer price. Emphasize ₹300-400 clean margin per bag.'
      };
    }

    if (q.includes('soch') || q.includes('baad') || q.includes('busy') || q.includes('agle') || q.includes('next week') || q.includes('baad me')) {
      return {
        objection_id: 'VOSS-STALL',
        dealer_objection: 'Soch ke bataunga / Agle hafte aao',
        detected_emotion: 'Decision Avoidance & Friction Hesitation',
        voss_label: 'Lagta hai sir aap abhi sure nahi ho pa rahe hain aur aapse koi galat decision na ho jaye...',
        voss_mirror: 'Soch ke batayenge?',
        voss_calibrated_question: 'Sir aisa kya point hai jo abhi aapko rok raha hai ek small 20-bag trial start karne se?',
        tactical_empathy_phrase: 'Bilkul samajhta hoon sir, jaldbazi me decision lene ka koi matlab nahi hai.',
        physical_rep_coaching_cue: 'Isolate the real hesitation with calibrated What question. Propose 20-bag starter batch on tomorrow morning dispatch truck.',
        margin_protection_rule: 'Do not beg or reduce terms. Frame 20 bags as zero-risk trial.'
      };
    }

    if (q.includes('asian') || q.includes('berger') || q.includes('purana') || q.includes('already') || q.includes('existing')) {
      return {
        objection_id: 'VOSS-MONOPOLY',
        dealer_objection: 'Already purana brand bechte hain',
        detected_emotion: 'Comfort Zone & Inertia',
        voss_label: 'Lagta hai [Name] ji, aap already apne purane brand ke saath bohot comfortable hain aur experiment nahi karna chahte...',
        voss_mirror: 'Already comfortable hain?',
        voss_calibrated_question: 'Sir agar wahi painters Swatch ke naye direct model se har bag par aapko ₹300 extra de jayein, to kya us profit ko ignore karna counter ke liye sahi hoga?',
        tactical_empathy_phrase: 'Sahi baat hai sir, established brand counter par footfall banaye rakhta hai, uski apni jagah hai.',
        physical_rep_coaching_cue: 'Never criticize Asian Paints. Frame Swatch as an extra high-margin secondary profit channel (40% vs 4%).',
        margin_protection_rule: 'Position alongside legacy brand as high-yield pillar.'
      };
    }

    // Match closest from CSV ledger
    let matched = records.find(r => {
      const keywords = (r.dealer_objection || '').toLowerCase();
      if (q.includes('credit') || q.includes('udhaar') || q.includes('udhari')) return keywords.includes('udhaar');
      if (q.includes('painter') || q.includes('thekedar') || q.includes('karigar')) return keywords.includes('painter');
      if (q.includes('discount') || q.includes('kam karo') || q.includes('margin badhao')) return keywords.includes('margin thoda');
      return false;
    });

    if (matched) return matched;

    return {
      objection_id: 'VOSS-GEN',
      dealer_objection: objectionText,
      detected_emotion: 'Uncertainty & Risk Aversion',
      voss_label: 'Lag raha hai is deal me aapko kisi cheez par hesitation feel ho raha hai...',
      voss_mirror: 'Hesitation feel ho raha hai?',
      voss_calibrated_question: 'Sir aisa kya hona chahiye ki aap Swatch ke saath 100% comfortable feel karo?',
      tactical_empathy_phrase: 'Samajh sakta hoon sir, nayi commercial partnership me har cheez clear hona zaroori hai.',
      physical_rep_coaching_cue: 'Keep tone calm. Lower pitch. Wait 4 seconds of complete silence after labeling.',
      margin_protection_rule: 'Never discount to solve an emotional hesitation.'
    };
  }

  /**
   * Live Coaching Response for Physical Agents & WhatsApp Reps
   */
  coachPhysicalAgent({ objection, repName = 'Field Rep', dealerName = 'Dealer' }) {
    const tactical = this.analyzeObjection(objection);

    let coaching = `🎧 *CHRIS VOSS — TACTICAL NEGOTIATION COACHING*\n`;
    coaching += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    coaching += `👤 *Physical Agent Target*: ${repName} | *Prospect*: ${dealerName}\n`;
    coaching += `🗣️ *Dealer Objection*: _"${objection}"_\n\n`;

    coaching += `🧠 *DEEP PSYCHOLOGY*: Detected Emotion = *${tactical.detected_emotion}*\n\n`;

    coaching += `🧩 *THE 5-PILLAR TACTICAL EXECUTION FLOW*:\n\n`;
    coaching += `1️⃣ *LABEL (Emotion ko naam do)*:\n`;
    coaching += `   👉 *“${tactical.voss_label}”*\n`;
    coaching += `   _(Pause for 4 full seconds of complete silence. Let the dealer absorb it.)_\n\n`;

    coaching += `2️⃣ *MIRROR (Last 2–3 words repeat)*:\n`;
    coaching += `   👉 *“${tactical.voss_mirror}”*\n`;
    coaching += `   _(Use gentle, curious upward pitch like a friendly question.)_\n\n`;

    coaching += `3️⃣ *CALIBRATED QUESTION (Hand control back)*:\n`;
    coaching += `   👉 *“${tactical.voss_calibrated_question}”*\n`;
    coaching += `   _(Strictly "How" or "What". NEVER use "Why".)_\n\n`;

    coaching += `4️⃣ *TACTICAL EMPATHY (Build safety)*:\n`;
    coaching += `   👉 *“${tactical.tactical_empathy_phrase}”*\n\n`;

    coaching += `5️⃣ *NO-ORIENTED CLOSE (Safe Agreement)*:\n`;
    coaching += `   👉 *“Sir kya 20 bag ka trial batch kal subah godown me utarwana koi bura idea hoga?”*\n\n`;

    coaching += `🛡️ *COACHING CUE FOR PHYSICAL REP*:\n`;
    coaching += `• *Voice*: Late-Night FM DJ Voice (Unhurried, calm, downward pitch at end).\n`;
    coaching += `• *Body Language*: Unclenched posture, zero defensiveness, nodding gently.\n`;
    coaching += `• *Rule*: ${tactical.physical_rep_coaching_cue}\n\n`;

    coaching += `🚨 *MARGIN PROTECTION GUARDRAIL*:\n`;
    coaching += `• *${tactical.margin_protection_rule}*\n`;
    coaching += `• *Company Hurdle*: Strictly ≥₹100/bag Net Company Hurdle is sovereign.\n`;
    coaching += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    coaching += `_“He who controls the emotions… controls the deal.”_ 👑`;

    return coaching;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleVossConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    // 1. Full Objection Domination System Brief
    if (q.includes('objection domination') || q.includes('negotiation system') || q.includes('objection system') || q.includes('voss playbook') || q.includes('voss manual') || q.includes('tactical empathy system') || q === 'voss' || q === 'chris voss') {
      return this.getObjectionDominationBrief();
    }

    // 2. Extract objection text if specified
    let objectionText = text;
    if (q.startsWith('negotiate') || q.startsWith('voss') || q.startsWith('objection') || q.startsWith('coach')) {
      objectionText = text.replace(/^(negotiate|voss|objection|coaching|coach)\s*/i, '').trim();
    }

    if (!objectionText || objectionText.length < 5) {
      objectionText = 'Price bahut high hai, dusre brand saste hain';
    }

    return this.coachPhysicalAgent({
      objection: objectionText,
      repName,
      dealerName: 'Counter Partner'
    });
  }
}

const controller = new ChrisVossController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Price high lag raha hai';
  console.log(controller.handleVossConversation(q));
}

module.exports = controller;
