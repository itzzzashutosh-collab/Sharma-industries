/**
 * Sharma Industries / Swatch Paints — Jeremy Miner NEPQ Refinement Engine
 * Sub-agent: nepq_miner_engine
 * 
 * Powered by Jeremy Miner's Neuro-Emotional Persuasion Questioning (NEPQ).
 * Role: Belfort Script Optimizer & Question Architect.
 * 
 * Implements:
 *  - Master NEPQ Questioning SOP (jeremy_miner_nepq_questioning_sop.md)
 *  - 5 Levels of NEPQ Questioning (Connecting, Situation, Problem, Solution, Consequence)
 *  - Belfort Raw Script -> NEPQ Refined Question Transformation Engine
 *  - 60/40 Talking Ratio Enforcement (Customer talks 60%+, Salesman guides 30%)
 *  - Master Question Ledger (jeremy_miner_nepq_ledger.csv)
 *  - Dynamic Question Generator & Interactive WhatsApp / CLI Engine
 */

const fs = require('fs');
const path = require('path');
const ceoApproval = require('./ceo-approval-controller');

const NEPQ_LEDGER_FILE = path.join(__dirname, 'data', 'jeremy_miner_nepq_ledger.csv');
const SOP_FILE = path.join(__dirname, 'data', 'jeremy_miner_nepq_questioning_sop.md');
const NEPQ_BANK_DIR = path.join(__dirname, 'data', 'nepq_questions_bank');
const STATE_FILE = path.join(NEPQ_BANK_DIR, 'nepq_state.json');

function ensureBankDir() {
  if (!fs.existsSync(NEPQ_BANK_DIR)) {
    fs.mkdirSync(NEPQ_BANK_DIR, { recursive: true });
  }
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      isRunning: false,
      startedAt: null,
      lastOptimizedAt: null,
      totalOptimized: 0,
      pid: null
    }, null, 2), 'utf-8');
  }
}

class NepqMinerController {
  constructor() {
    this.name = 'nepq_miner_engine';
    this.displayName = 'Jeremy Miner (NEPQ Question Architect)';
    ensureBankDir();
  }

  getLedger() {
    if (!fs.existsSync(NEPQ_LEDGER_FILE)) return [];
    try {
      const content = fs.readFileSync(NEPQ_LEDGER_FILE, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 7) {
          records.push({
            id: cols[0]?.replace(/^"|"$/g, '').trim(),
            category: cols[1]?.replace(/^"|"$/g, '').trim(),
            stage: cols[2]?.replace(/^"|"$/g, '').trim(),
            belfortRaw: cols[3]?.replace(/^"|"$/g, '').trim(),
            nepqRefined: cols[4]?.replace(/^"|"$/g, '').trim(),
            expectedAnswer: cols[5]?.replace(/^"|"$/g, '').trim(),
            emotionalHook: cols[6]?.replace(/^"|"$/g, '').trim(),
            talkRatio: cols[7]?.replace(/^"|"$/g, '').trim(),
            status: cols[8]?.replace(/^"|"$/g, '').trim()
          });
        }
      }
      return records;
    } catch (e) {
      return [];
    }
  }

  getState() {
    ensureBankDir();
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      return { isRunning: false, totalOptimized: 0 };
    }
  }

  saveState(state) {
    ensureBankDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  }

  /**
   * Optimize a raw Belfort pitch statement into a question-driven NEPQ flow
   */
  optimizeBelfortScript(rawPitchText) {
    const raw = (rawPitchText || '').toLowerCase();

    // Check pre-computed patterns in ledger
    const ledger = this.getLedger();
    let match = null;

    if (raw.includes('price') || raw.includes('mehenga') || raw.includes('rate')) {
      match = ledger.find(l => l.category === 'Price Objection');
    } else if (raw.includes('naya brand') || raw.includes('new brand') || raw.includes('risk')) {
      match = ledger.find(l => l.category === 'New Brand Fear');
    } else if (raw.includes('asian') || raw.includes('berger') || raw.includes('monopoly')) {
      match = ledger.find(l => l.category === 'Asian Paints Monopoly');
    } else if (raw.includes('soch ke') || raw.includes('chahiye hi nahi') || raw.includes('interest')) {
      match = ledger.find(l => l.category === 'Complacency / No Interest');
    } else if (raw.includes('close') || raw.includes('order') || raw.includes('bag le lo') || raw.includes('20 bag')) {
      match = ledger.find(l => l.category === 'Comfort Close');
    }

    if (match) {
      return {
        rawInput: rawPitchText,
        refinedNEPQFlow: match.nepqRefined,
        customerResponseGoal: match.expectedAnswer,
        psychologicalDynamic: 'Customer self-convinces via guided realization question',
        talkRatio: 'Customer 70% | Rep 30%'
      };
    }

    // Default dynamic transformation: Convert statement -> Inquisitive question
    return {
      rawInput: rawPitchText,
      refinedNEPQFlow: `“Sir ek honest cheez samajhni thi — ${rawPitchText.replace(/sir/gi, '').trim()}... kya ye aapke business calculation me fit baithta hai?”`,
      customerResponseGoal: 'Forces customer to verbalize their own criteria',
      psychologicalDynamic: 'Converts sales pitch into consultative interview',
      talkRatio: 'Customer 65% | Rep 35%'
    };
  }

  /**
   * Generate 1 New Situational NEPQ Questioning Set
   */
  generateOneQuestionSet() {
    ensureBankDir();
    const state = this.getState();

    const questionsPool = [
      {
        scenario: 'Aerodrome Kota Multi-Brand Hardware Counter',
        belfortTell: 'Sir Swatch Rustic me ₹460 margin hai, turant 50 bag ka stock lagao.',
        nepqAsk: '“Sir abhi texture me jo brand chal raha hai, usme mahine ke end par kitna net margin bachta hai? ...Agar ek secondary local certified product ₹400+ clean margin de, toh kya dukan ke total profit me significant farak aayega?”',
        stage: 'Solution Awareness Probe',
        emotionalHook: 'Pain of working 12 hours/day for MNC 3% crumbs'
      },
      {
        scenario: 'Bundi Sadar Bazaar Traditional Paint Counter',
        belfortTell: 'Hum Bundi factory se direct 24 ghante me dispatch kar denge, local support milega.',
        nepqAsk: '“Sir jab badi MNC companies se maal aane me 4-5 din lagte hain aur customer laut jata hai, toh kya sales miss hoti hai? ...Agar Bundi plant se direct 24-hr doorstep delivery mile, toh stock management kitna aasan ho jayega?”',
        stage: 'Impact Agitation',
        emotionalHook: 'Frustration with stockouts and delayed MNC dispatches'
      },
      {
        scenario: 'Baran Project Site Contractor Counter',
        belfortTell: 'Hamara Swatch Weatherguard 5 saal tak bilkul nahi chhootega, guarantee hai.',
        nepqAsk: '“Sir jab monsoon me diwal par silan aane se grahak thekedar par gussa karta hai, toh contractor ka market me naam kharab hota hai na? ...Agar 5-saal written weatherproof assurance mile, toh customer ko guarantee dena kitna peaceful rahega?”',
        stage: 'Consequence & Peace of Mind',
        emotionalHook: 'Fear of reputational damage among contractors'
      }
    ];

    const chosen = questionsPool[Math.floor(Math.random() * questionsPool.length)];
    const qId = `NEPQ-GEN-${Date.now().toString(36).toUpperCase()}`;

    const newEntry = {
      qId,
      timestamp: new Date().toISOString(),
      scenario: chosen.scenario,
      belfortTell: chosen.belfortTell,
      nepqAsk: chosen.nepqAsk,
      stage: chosen.stage,
      emotionalHook: chosen.emotionalHook,
      talkingRatio: 'Customer 70% | Rep 30%',
      governance: 'Under Sovereign Command of CEO Ashutosh Sharma (+91 9079609627)'
    };

    const file = path.join(NEPQ_BANK_DIR, `${qId}.json`);
    fs.writeFileSync(file, JSON.stringify(newEntry, null, 2), 'utf-8');

    state.lastOptimizedAt = newEntry.timestamp;
    state.totalOptimized += 1;
    this.saveState(state);

    return newEntry;
  }

  /**
   * Interactive Conversation for Jeremy Miner
   */
  async handleNEPQConversation(text, userContext = null) {
    const q = (text || '').toLowerCase().trim();

    if (q.includes('optimize') || q.includes('convert') || q.includes('refine')) {
      const rawText = text.replace(/optimize|convert|refine|nepq/gi, '').trim() || 'Sir 20 bags le lo bahut fayda hai';
      const opt = this.optimizeBelfortScript(rawText);
      const reply = `🧠 *Jeremy Miner: NEPQ Script Transformation*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `❌ *Belfort Raw Statement (Tell)*:\n` +
        `"${opt.rawInput}"\n\n` +
        `✅ *NEPQ Refined Question (Ask)*:\n` +
        `${opt.refinedNEPQFlow}\n\n` +
        `🎯 *Psychology*: ${opt.psychologicalDynamic}\n` +
        `🗣️ *Talking Ratio*: ${opt.talkRatio}\n\n` +
        `_Principle: Tell = Resistance | Ask = Control_ 🫡`;
      return { handled: true, reply, agent: 'Jeremy Miner (NEPQ Question Architect)' };
    }

    if (q.includes('generate') || q.includes('question') || q.includes('drill')) {
      const qSet = this.generateOneQuestionSet();
      const reply = `🎯 *Jeremy Miner: Fresh NEPQ Counter Question Set*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🏪 *Scenario*: ${qSet.scenario}\n` +
        `🎯 *Stage*: ${qSet.stage}\n` +
        `💥 *Emotional Hook*: ${qSet.emotionalHook}\n\n` +
        `🗣️ *Verbatim Rep Question*:\n` +
        `${qSet.nepqAsk}\n\n` +
        `📊 *Target Ratio*: ${qSet.talkingRatio}\n` +
        `_Master SOP: \`data/jeremy_miner_nepq_questioning_sop.md\`_ 🧠`;
      return { handled: true, reply, agent: 'Jeremy Miner (NEPQ Question Architect)' };
    }

    if (q.includes('sop') || q.includes('guide')) {
      const ledger = this.getLedger();
      const reply = `📋 *Jeremy Miner: Master NEPQ Questioning SOP*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏\n\n` +
        `*"Belfort controls the conversation… NEPQ makes the customer control the decision."*\n\n` +
        `📁 *Master Documents*:\n` +
        `• 📄 Playbook & SOP: \`data/jeremy_miner_nepq_questioning_sop.md\`\n` +
        `• 📊 NEPQ CSV Ledger: \`data/jeremy_miner_nepq_ledger.csv\` (${ledger.length} active question templates)\n` +
        `• 🏛️ Skill SOP: \`.hermes/skills/jeremy-miner/QUESTIONING_SOP.md\`\n\n` +
        `🎯 *5-Step NEPQ Architecture*:\n` +
        `1. *Connecting*: Defuse sales guard without pitching\n` +
        `2. *Situation*: Map current volume & product rotation\n` +
        `3. *Problem Awareness*: Surface margin fatigue (MNC 3% vs Swatch ₹460)\n` +
        `4. *Solution Awareness*: Guide them to discover secondary profit channel\n` +
        `5. *Comfort Close*: "...start karna comfortable rahega?"\n\n` +
        `_Aap jab chahein "optimize [script]" bolkar kisi bhi pitch ko NEPQ me convert karwa sakte hain Sir!_ 🫡`;
      return { handled: true, reply, agent: 'Jeremy Miner (NEPQ Question Architect)' };
    }

    // Default Overview
    const reply = `🧠 *Jeremy Miner (NEPQ Specialist & Question Architect)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Pranam Ashutosh Sir! 🙏\n\n` +
      `Main Swatch Paints ke field reps ke liye **Belfort Script Optimizer & Question Architecture** govern kar raha hoon:\n` +
      `• *Core Rule*: Statement ko question me convert karo\n` +
      `• *Ratio*: Customer 60–70% bolega, salesman 30–40% guide karega\n` +
      `• *Objection Handling*: Argument nahi, customer se realization bulwao\n` +
      `• *Comfort Close*: Pressure-free micro-commitment\n\n` +
      `_Files: \`data/jeremy_miner_nepq_questioning_sop.md\` & \`data/jeremy_miner_nepq_ledger.csv\`_ 🫡`;
    return { handled: true, reply, agent: 'Jeremy Miner (NEPQ Question Architect)' };
  }
}

const controller = new NepqMinerController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || '--status';

  if (cmd === '--ledger') {
    console.log(JSON.stringify(controller.getLedger(), null, 2));
  } else if (cmd === '--optimize') {
    const rawText = args.slice(1).join(' ') || 'Sir humara product le lo margin zyada hai';
    console.log(JSON.stringify(controller.optimizeBelfortScript(rawText), null, 2));
  } else if (cmd === '--generate') {
    console.log(JSON.stringify(controller.generateOneQuestionSet(), null, 2));
  } else {
    console.log(JSON.stringify(controller.getState(), null, 2));
  }
}

module.exports = controller;
