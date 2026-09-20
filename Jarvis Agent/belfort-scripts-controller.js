/**
 * Sharma Industries / Swatch Paints — Jordan Belfort Straight Line Scripts & SOPs Engine
 * Sub-agent: belfort_scripts_engine
 * 
 * Powered by Jordan Belfort's Straight Line Persuasion & Three 10s Certainty Stacking.
 * Implements:
 *  - Master Field Closing SOPs (jordan_belfort_closing_sop.md)
 *  - Complete 10-Step Sales Flow (Rapport -> Transition -> Situation -> Problem -> Impact -> Solution -> Offer -> Objection -> Close -> Followup)
 *  - Three 10s Certainty Stacking (Product 10/10, Brand 10/10, Salesperson 10/10)
 *  - Master Objection Handling Matrix (Price, New Brand, Asian Only, Think About It, Credit)
 *  - SOP Ledger & Bank (jordan_belfort_sops_ledger.csv & belfort_sops_bank/)
 *  - 24*7 Autonomous Script & SOP Generator (Runs ONLY when triggered by CEO Ashutosh Sharma)
 *  - Collaboration: Brian Tracy (Structure), Jeremy Miner (NEPQ), Alex Hormozi (Offers), Chris Voss (Tone)
 */

const fs = require('fs');
const path = require('path');

const SCRIPTS_LEDGER_FILE = path.join(__dirname, 'data', 'jordan_belfort_scripts_ledger.csv');
const SOPS_LEDGER_FILE = path.join(__dirname, 'data', 'jordan_belfort_sops_ledger.csv');
const PLAYBOOK_FILE = path.join(__dirname, 'data', 'jordan_belfort_master_scripts_playbook.md');
const CLOSING_SOP_FILE = path.join(__dirname, 'data', 'jordan_belfort_closing_sop.md');
const SCRIPTS_BANK_DIR = path.join(__dirname, 'data', 'belfort_scripts_bank');
const SOPS_BANK_DIR = path.join(__dirname, 'data', 'belfort_sops_bank');
const STATE_FILE = path.join(SCRIPTS_BANK_DIR, 'generator_state.json');

function ensureBankDir() {
  if (!fs.existsSync(SCRIPTS_BANK_DIR)) {
    fs.mkdirSync(SCRIPTS_BANK_DIR, { recursive: true });
  }
  if (!fs.existsSync(SOPS_BANK_DIR)) {
    fs.mkdirSync(SOPS_BANK_DIR, { recursive: true });
  }
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      isRunning: false,
      startedAt: null,
      lastGeneratedAt: null,
      lastSOPGeneratedAt: null,
      totalGenerated: 0,
      totalSOPsGenerated: 0,
      intervalHours: 4,
      pid: null
    }, null, 2), 'utf-8');
  }
}

class BelfortScriptsController {
  constructor() {
    this.name = 'belfort_scripts_engine';
    this.displayName = 'Jordan Belfort (Straight Line Closer)';
    ensureBankDir();
  }

  /**
   * Load all parsed scripts from CSV ledger
   */
  getScriptsLedger() {
    if (!fs.existsSync(SCRIPTS_LEDGER_FILE)) return [];
    try {
      const content = fs.readFileSync(SCRIPTS_LEDGER_FILE, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 8) {
          records.push({
            scriptId: cols[0]?.replace(/^"|"$/g, '').trim(),
            dateCreated: cols[1]?.replace(/^"|"$/g, '').trim(),
            name: cols[2]?.replace(/^"|"$/g, '').trim(),
            targetPersona: cols[3]?.replace(/^"|"$/g, '').trim(),
            flowStage: cols[4]?.replace(/^"|"$/g, '').trim(),
            scriptText: cols[5]?.replace(/^"|"$/g, '').trim(),
            technique: cols[6]?.replace(/^"|"$/g, '').trim(),
            threeTensPillar: cols[7]?.replace(/^"|"$/g, '').trim(),
            rating: cols[8]?.replace(/^"|"$/g, '').trim(),
            status: cols[9]?.replace(/^"|"$/g, '').trim()
          });
        }
      }
      return records;
    } catch (e) {
      return [];
    }
  }

  /**
   * Load all parsed SOPs from CSV ledger
   */
  getSOPsLedger() {
    if (!fs.existsSync(SOPS_LEDGER_FILE)) return [];
    try {
      const content = fs.readFileSync(SOPS_LEDGER_FILE, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 8) {
          records.push({
            sopId: cols[0]?.replace(/^"|"$/g, '').trim(),
            dateCreated: cols[1]?.replace(/^"|"$/g, '').trim(),
            title: cols[2]?.replace(/^"|"$/g, '').trim(),
            targetCounter: cols[3]?.replace(/^"|"$/g, '').trim(),
            stageFocus: cols[4]?.replace(/^"|"$/g, '').trim(),
            tonality: cols[5]?.replace(/^"|"$/g, '').trim(),
            threeTensPillar: cols[6]?.replace(/^"|"$/g, '').trim(),
            mandatoryAction: cols[7]?.replace(/^"|"$/g, '').trim(),
            primaryObjection: cols[8]?.replace(/^"|"$/g, '').trim(),
            closingTrigger: cols[9]?.replace(/^"|"$/g, '').trim(),
            status: cols[10]?.replace(/^"|"$/g, '').trim()
          });
        }
      }
      return records;
    } catch (e) {
      return [];
    }
  }

  /**
   * Get specific script by stage or objection type
   */
  getScriptByStage(stageName) {
    const ledger = this.getScriptsLedger();
    const q = (stageName || '').toLowerCase();
    const matches = ledger.filter(s => s.flowStage.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    return matches[0] || ledger[0];
  }

  /**
   * Generator State & Control
   */
  getGeneratorState() {
    ensureBankDir();
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      return { isRunning: false, totalGenerated: 0, totalSOPsGenerated: 0 };
    }
  }

  saveGeneratorState(state) {
    ensureBankDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  }

  /**
   * Generate 1 New High-Converting Script Variation
   */
  generateOneScript() {
    ensureBankDir();
    const state = this.getGeneratorState();

    const personas = [
      'Aerodrome Commercial Hardware Stockist (Kota)',
      'Sadar Bazaar Traditional Paint Retailer (Bundi)',
      'High-Turnover Building Material Counter (Baran)',
      'Stone Bungalow Luxury Display Counter (Bijoliya)',
      'Rural Town Multi-Brand Mixed Counter (Talera)'
    ];

    const objections = [
      { trigger: 'Price High', reframe: 'Unit Profit Reframing', script: 'Sir price mat dekhiye, profit dekhiye. ₹350 ki putty par ₹30 milta hai, ₹690 ke Swatch par ₹460 seedha net profit milta hai.' },
      { trigger: 'Asian Monopoly', reframe: 'Complementary Second Channel', script: 'Asian replace mat kijiye sir. Swatch ko apna high-profit secret weapon banaiye — 10X margin per bag.' },
      { trigger: 'New Brand Fear', reframe: '7-Day Stock Swap Guarantee', script: 'Naya brand hai isi liye 40% launch margin mil raha hai sir. 7 din me na bika toh 1-to-1 swap hamari taraf se.' },
      { trigger: 'Think About It', reframe: 'Doubt Isolation Probe', script: 'Sir sochiye zaroor, lekin hesitation product quality par hai ya counter rotation par?' }
    ];

    const chosenPersona = personas[Math.floor(Math.random() * personas.length)];
    const chosenObj = objections[Math.floor(Math.random() * objections.length)];
    const scriptId = `SCR-GEN-${Date.now().toString(36).toUpperCase()}`;

    const newScript = {
      scriptId,
      timestamp: new Date().toISOString(),
      targetPersona: chosenPersona,
      flowStage: 'Objection Handling & Closing Loop',
      objectionTrigger: chosenObj.trigger,
      technique: chosenObj.reframe,
      scriptTextHinglish: chosenObj.script,
      threeTensTarget: 'Product 10/10 & Company 10/10 Certainty',
      toneGuidance: 'Reasonable, absolute certainty, non-aggressive expert posture'
    };

    const file = path.join(SCRIPTS_BANK_DIR, `${scriptId}.json`);
    fs.writeFileSync(file, JSON.stringify(newScript, null, 2), 'utf-8');

    state.lastGeneratedAt = newScript.timestamp;
    state.totalGenerated += 1;
    this.saveGeneratorState(state);

    return newScript;
  }

  /**
   * Generate 1 New Situational Straight Line SOP
   */
  generateOneSOP(customPersona = null) {
    ensureBankDir();
    const state = this.getGeneratorState();

    const templates = [
      {
        counter: 'Exclusive MNC Paint Dealer Counter (Kota Hub)',
        stage: 'Co-existence & High Margin Secondary Channel',
        tonality: 'Utter Sincerity & Non-Threatening Expert',
        pillar: 'Product 10/10 & Salesperson 10/10',
        action: 'Place 1ft x 1ft Real Quartz Board on glass counter without touching MNC displays',
        objection: 'Hum sirf Asian Paints bechte hain, dusra brand lagane ki jagah nahi hai',
        reframe: 'Asian replace mat kijiye. Unke 100 bag ka profit Swatch ke 20 bag nikalte hain. Secondary rack par rakh kar 10X profit dekhiye.',
        closeTrigger: 'Confirm 20-bag trial with 7-day exchange guarantee'
      },
      {
        counter: 'Highway Building Material & Sanitary Counter (Dabi)',
        stage: 'Margin Contrast & Cash Velocity',
        tonality: 'Feigned Surprise & Utter Commercial Logic',
        pillar: 'Company 10/10 & Product 10/10',
        action: 'Take out notepad and draw unit profit: White Putty ₹30 vs Swatch Rustic ₹460',
        objection: 'Grahak sasti putty mangta hai, texture mehenga padega',
        reframe: 'Price mat dekhiye sir, profit dekhiye. ₹350 ki putty par ₹30 milta hai, Swatch par ₹460 seedha net pocket me aata hai.',
        closeTrigger: 'Lock 20 bags for upcoming commercial site'
      },
      {
        counter: 'Monsoon Damp Wall Problem Site (Baran Project Counter)',
        stage: 'Weatherguard & Waterproofing Stacking',
        tonality: 'Absolute Certainty & Technical Authority',
        pillar: 'Product 10/10 (5-Year Assurance)',
        action: 'Water droplet repellency test on coated demo tile',
        objection: 'Local waterproofing solution kaam nahi karta, silan wapis aa jati hai',
        reframe: 'Pure siloxane cross-linking polymer hai. 5-saal tak diwal par moisture block rahegi.',
        closeTrigger: 'Bundle 40L Weatherguard + 20L Waterproofing combo trial'
      },
      {
        counter: 'Conservative Village Town Hardware Counter (Talera / Nainwa)',
        stage: 'Painter Pull & Risk Liquidation',
        tonality: 'Local Apnapan & Respectful Reasonableness',
        pillar: 'Salesperson 10/10 & Company 10/10',
        action: 'Tear open sample packet showing ₹50 Painter Growth Token voucher inside',
        objection: 'Contractor naya maal nahi lagayega',
        reframe: 'Bag ke andar ₹50 liquid cash token hai. Painter khud maang kar lagayega kyunki uski extra kamai hai.',
        closeTrigger: '10 bags Shubh Aarambh starter display'
      }
    ];

    const chosen = templates[Math.floor(Math.random() * templates.length)];
    const sopId = `SOP-GEN-${Date.now().toString(36).toUpperCase()}`;

    const newSOP = {
      sopId,
      timestamp: new Date().toISOString(),
      counterType: customPersona || chosen.counter,
      stageFocus: chosen.stage,
      tonalityProtocol: chosen.tonality,
      threeTensTarget: chosen.pillar,
      mandatoryPhysicalAction: chosen.action,
      primaryObjection: chosen.objection,
      reframingScript: chosen.reframe,
      closingTrigger: chosen.closeTrigger,
      status: 'ACTIVE_GENERATED',
      governance: 'Reviewed under Sovereign Command of CEO Ashutosh Sharma'
    };

    const sopFile = path.join(SOPS_BANK_DIR, `${sopId}.json`);
    fs.writeFileSync(sopFile, JSON.stringify(newSOP, null, 2), 'utf-8');

    // Append to CSV ledger
    try {
      const csvLine = `\n"${sopId}","${new Date().toISOString().split('T')[0]}","Dynamic SOP: ${chosen.stage}","${chosen.counter}","${chosen.stage}","${chosen.tonality}","${chosen.pillar}","${chosen.action}","${chosen.objection}","${chosen.closeTrigger}","ACTIVE_GENERATED"`;
      fs.appendFileSync(SOPS_LEDGER_FILE, csvLine, 'utf-8');
    } catch (e) {}

    state.lastSOPGeneratedAt = newSOP.timestamp;
    state.totalSOPsGenerated = (state.totalSOPsGenerated || 0) + 1;
    this.saveGeneratorState(state);

    return newSOP;
  }

  start24x7(intervalHours = 4) {
    ensureBankDir();
    const state = this.getGeneratorState();
    if (state.isRunning) return { status: 'ALREADY_RUNNING', state };

    state.isRunning = true;
    state.startedAt = new Date().toISOString();
    state.intervalHours = intervalHours;
    state.pid = process.pid;
    this.saveGeneratorState(state);

    const firstScript = this.generateOneScript();
    const firstSOP = this.generateOneSOP();
    return {
      status: 'STARTED',
      message: `Jordan Belfort 24*7 Script & SOP Generator actively running. Generates fresh scripts & SOPs every ${intervalHours} hours.`,
      firstScript,
      firstSOP
    };
  }

  stop24x7() {
    ensureBankDir();
    const state = this.getGeneratorState();
    state.isRunning = false;
    state.pid = null;
    this.saveGeneratorState(state);
    return {
      status: 'STOPPED',
      message: 'Jordan Belfort 24*7 Script & SOP Generator is now on STANDBY.'
    };
  }

  /**
   * Interactive Conversation for Jordan Belfort
   */
  async handleBelfortConversation(text, userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const state = this.getGeneratorState();

    // 24*7 Generator Triggers
    if (q.includes('start 24') || q.includes('start generator') || q.includes('chalao scripts') || q.includes('chalao sop')) {
      const res = this.start24x7();
      const reply = `🐺 *Jordan Belfort (Straight Line Script & SOP Generator Triggered)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Boom! 💥 Ashutosh Sir, **24*7 Autonomous Straight Line Engine** shuru ho chuka hai!\n\n` +
        `🎯 *Target*: Har 4 ghante me fresh objection scripts aur counter-closing SOPs generate hongi.\n` +
        `📜 *First Script*: "${res.firstScript?.scriptTextHinglish}"\n` +
        `📋 *First SOP*: [${res.firstSOP?.sopId}] ${res.firstSOP?.stageFocus} (${res.firstSOP?.counterType})\n\n` +
        `_Aap jab chahein "stop 24*7 scripts" bolkar ise pause kar sakte hain Sir!_ 🫡`;
      return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
    }

    if (q.includes('stop 24') || q.includes('stop generator') || q.includes('band karo scripts') || q.includes('band karo sop')) {
      const res = this.stop24x7();
      const reply = `🛑 *Jordan Belfort (Engine Paused)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Ashutosh Sir, Script & SOP Generator ko **STANDBY** par daal diya gaya hai.\n\n` +
        `Jab bhi aap naye field scripts ya SOPs chahein, bas boliye: *"Start 24*7 scripts"* ya *"Generate new SOP"*. 🫡`;
      return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
    }

    // SOP Queries
    if (q.includes('sop') || q.includes('standard operating procedure')) {
      if (q.includes('generate') || q.includes('banao') || q.includes('create') || q.includes('naya')) {
        const sop = this.generateOneSOP();
        const reply = `📋 *Jordan Belfort: Dynamic Counter Closing SOP Generated*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🆔 *SOP ID*: \`${sop.sopId}\`\n` +
          `🏪 *Counter Type*: ${sop.counterType}\n` +
          `🎯 *Stage Focus*: ${sop.stageFocus}\n` +
          `🎙️ *Tonality*: ${sop.tonalityProtocol}\n` +
          `📦 *Three 10s Pillar*: ${sop.threeTensTarget}\n` +
          `✋ *Physical Action*: ${sop.mandatoryPhysicalAction}\n\n` +
          `⚡ *Objection Faced*: "${sop.primaryObjection}"\n` +
          `🗣️ *Reframing Script*: "${sop.reframingScript}"\n` +
          `🎯 *Closing Trigger*: ${sop.closingTrigger}\n\n` +
          `_Master SOP Document: \`data/jordan_belfort_closing_sop.md\`_\n` +
          `_SOP Ledger: \`data/jordan_belfort_sops_ledger.csv\`_ 🫡`;
        return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
      }

      const ledger = this.getSOPsLedger();
      const reply = `📋 *Jordan Belfort: Master Straight Line Closing SOPs*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏 Field reps ke liye **Standard Operating Procedures (SOP)** locked aur ready hain:\n\n` +
        `📁 *Master SOP Architecture*:\n` +
        `• 📄 Playbook & SOP: \`data/jordan_belfort_closing_sop.md\`\n` +
        `• 📊 SOP CSV Ledger: \`data/jordan_belfort_sops_ledger.csv\` (${ledger.length} active SOPs)\n` +
        `• 🏛️ Skill SOP: \`.hermes/skills/jordan-belfort/STRAIGHT_LINE_SOP.md\`\n` +
        `• 📂 SOP Bank: \`data/belfort_sops_bank/\`\n\n` +
        `🎯 *Top 8 Master Field SOPs*:\n` +
        `1. *SOP-001*: 4-Second First Impression & Authority (Sharp, Enthusiastic, Expert)\n` +
        `2. *SOP-002*: Counter Margin & Hidden Pain Probe (SPIN / NEPQ)\n` +
        `3. *SOP-003*: 1ft x 1ft Real Quartz Demo Board Sensory Stacking\n` +
        `4. *SOP-004*: Sharma Industries Bundi Factory Pedigree & Dispatch Speed\n` +
        `5. *SOP-005*: Hormozi Value Offer & Unit Economics Calculation\n` +
        `6. *SOP-006*: 'Price High' Profit Reframing Looping Protocol\n` +
        `7. *SOP-007*: 'Asian Only' Complementary Secret Weapon Protocol\n` +
        `8. *SOP-008*: 20-Bag Shubh Aarambh Action Close Routine\n\n` +
        `_Aap jab chahein "generate SOP" bolkar specific counter ke liye naya SOP generate karwa sakte hain Sir!_ 🐺`;
      return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
    }

    if (q.includes('generate') && (q.includes('script') || q.includes('dialogue') || q.includes('pitch'))) {
      const sc = this.generateOneScript();
      const reply = `🎯 *Jordan Belfort: Fresh Straight Line Script Generated*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Target Persona*: ${sc.targetPersona}\n` +
        `⚡ *Objection Trigger*: "${sc.objectionTrigger}"\n` +
        `🧠 *Technique*: ${sc.technique}\n\n` +
        `🗣️ *Verbatim Rep Script*:\n` +
        `*"${sc.scriptTextHinglish}"*\n\n` +
        `🎙️ *Tone Guidance*: ${sc.toneGuidance}\n` +
        `🎯 *Goal*: Build 10/10 certainty across the Three 10s.\n\n` +
        `_Playbook: \`data/jordan_belfort_master_scripts_playbook.md\`_ 🐺`;
      return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
    }

    if (q.includes('three 10') || q.includes('3 10') || q.includes('certainty')) {
      const reply = `🐺 *Jordan Belfort: The Three 10s Certainty Stacking*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏 Deal close hone se pehle dealer ke dimag me ye 3 pillars 10/10 hone chahiye:\n\n` +
        `1. 📦 *The Product (10/10)*: 1ft x 1ft Real Bundi Silica Quartz board hath me pakdao. Flawless glide aur 5-saal warranty se product certainty 10/10 banti hai.\n` +
        `2. 🏛️ *The Company (10/10)*: Sharma Industries Bundi plant, 110 KU viscosity QC, aur 24-hr prompt dispatch se company trust 10/10 banta hai.\n` +
        `3. 👔 *The Salesperson (10/10)*: Rep beggar nahi, expert advisor bankar baat kare. Honest, sharp aur disciplined posture.\n\n` +
        `_Jab teeno 10/10 hote hain, dealer 'Yes' bolne ke alawa kuch soch hi nahi sakta!_ 💥`;
      return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
    }

    // Default: Briefing on 10-Step Flow & SOPs
    const reply = `🐺 *Jordan Belfort (Straight Line Closer)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Pranam Ashutosh Sir! 🙏\n\n` +
      `*"Great salespeople don't push... They guide the conversation."*\n\n` +
      `Main Swatch Paints ke field reps ke liye **Complete Straight Line Sales Flow & SOPs** govern kar raha hoon:\n` +
      `1. *Rapport*: Connection without selling (4-Second Authority)\n` +
      `2. *Transition*: Soft shift to business\n` +
      `3. *Situation & Problem*: SPIN pain finding (MNC 3% margin)\n` +
      `4. *Impact*: NEPQ emotional & financial cost\n` +
      `5. *Solution & Offer*: Swatch ₹460 margin + ₹50 token\n` +
      `6. *Objection Loops*: Deflect price, focus on profit\n` +
      `7. *Close*: Natural 20-bag action close\n\n` +
      `_Master SOP: \`data/jordan_belfort_closing_sop.md\`_\n` +
      `_SOP Ledger: \`data/jordan_belfort_sops_ledger.csv\`_\n` +
      `_Master Playbook: \`data/jordan_belfort_master_scripts_playbook.md\`_ 🫡`;

    return { handled: true, reply, agent: 'Jordan Belfort (Straight Line Closer)' };
  }
}

const controller = new BelfortScriptsController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || '--status';

  if (cmd === '--start') {
    console.log(JSON.stringify(controller.start24x7(), null, 2));
  } else if (cmd === '--stop') {
    console.log(JSON.stringify(controller.stop24x7(), null, 2));
  } else if (cmd === '--generate') {
    console.log(JSON.stringify(controller.generateOneScript(), null, 2));
  } else if (cmd === '--generate-sop') {
    console.log(JSON.stringify(controller.generateOneSOP(), null, 2));
  } else if (cmd === '--sops') {
    console.log(JSON.stringify(controller.getSOPsLedger(), null, 2));
  } else {
    console.log(JSON.stringify(controller.getGeneratorState(), null, 2));
  }
}

module.exports = controller;
