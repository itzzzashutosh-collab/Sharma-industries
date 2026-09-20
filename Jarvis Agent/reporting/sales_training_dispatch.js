/**
 * Sharma Industries — Autonomous Sales Training & Playbook Dispatcher
 * 
 * Compiles and delivers ground-level Market Playbooks directly to
 * CEO Ashutosh Sharma (+91 9079609627) on WhatsApp and via CLI.
 * 
 * Covers:
 *  1. Hormozi Grand Slam Market Offers (₹150 margin, ₹50 mistri token, 30-day buyback guarantee)
 *  2. McMahon MEDDPICC 6-Stage Dealer Onboarding
 *  3. Rackham & Keenan Hindi SPIN & Gap Selling Counter Discovery
 *  4. Blount & Voss Master Market Objection Battlecards (Top 8 scripts)
 *  5. Brian Tracy & Belfort Field Sales Cadence (Sonu Kumar's daily 10-shop beat & Straight Line close)
 *  6. Joe Girard & Carnegie 12-Month Dealer Retention & Law of 250
 */

const fs = require('fs');
const path = require('path');

const PLAYBOOKS_DIR = path.join(__dirname, '..', 'data', 'sales_training');
const CEO_PHONE = '+919079609627';

class SalesTrainingDispatch {
  constructor() {
    this.ceoPhone = CEO_PHONE;
  }

  getAvailablePlaybooks() {
    if (!fs.existsSync(PLAYBOOKS_DIR)) return [];
    return fs.readdirSync(PLAYBOOKS_DIR)
      .filter(f => f.endsWith('.md'))
      .sort();
  }

  readPlaybook(filename) {
    const filePath = path.join(PLAYBOOKS_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  }

  generateCurriculumSummary() {
    const files = this.getAvailablePlaybooks();
    let text = `👑 *SHARMA INDUSTRIES — AUTONOMOUS SALES FORCE TRAINING SYSTEM*\n` +
      `_Curated by Chief of Staff Hermes & Chief Sales Officer Brian Tracy_\n\n` +
      `Ashutosh Sir, Prime Agent Market Intelligence Dossier 2026 ke basis par humari Sales Team (Sonu Kumar & Field Reps) ke liye 6 Master Execution Playbooks finalize ho chuke hain:\n\n`;

    const modules = [
      {
        num: '1',
        name: 'Market Grand-Slam Offers & Margin Engineering',
        legend: 'Alex Hormozi',
        highlight: '₹150 Net Dealer Margin, ₹50 Sealed Cash Token in every bag, 30-Day 100% Unopened Stock Buyback Guarantee.'
      },
      {
        num: '2',
        name: 'Dealer Onboarding Stage Gates (MEDDPICC)',
        legend: 'John McMahon',
        highlight: '6-Stage Qualification Gate: Cold Visit ➔ Sample Test ➔ Owner Gate ➔ First 25-Bag PO ➔ Display Board Install ➔ Retain.'
      },
      {
        num: '3',
        name: 'Market Diagnostic Questions (SPIN & Gap)',
        legend: 'Neil Rackham & Keenan',
        highlight: 'Hindi Counter Discovery: Exposing Tier-1 brand margin bleeding, 45-day credit traps, and lack of contractor loyalty.'
      },
      {
        num: '4',
        name: 'Master Market Objection Battlecards',
        legend: 'Jeb Blount & Chris Voss',
        highlight: 'Turnaround scripts for "Credit do", "Asian Paints chalta hai", "Dukan me jagah nahi", and "Local me complaint aati hai".'
      },
      {
        num: '5',
        name: 'Field Sales Cadence & Straight-Line Closing',
        legend: 'Brian Tracy & Jordan Belfort',
        highlight: 'Sonu Kumar 08:30 AM Bag Kit Check, 10-Shop Daily Route, Three 10s Certainty, and Straight-Line Closing script.'
      },
      {
        num: '6',
        name: 'Dealer Relationship Calendar & Law of 250',
        legend: 'Joe Girard & Dale Carnegie',
        highlight: '1 Dealer = 250 painters/jobs unlock. 12-Month festive touchpoint cadence (Holi, Diwali, personal voice notes).'
      },
      {
        num: '7',
        name: 'Indian Sales Psychology & Script Playbook (Hermes Enablement v1.0)',
        legend: 'Hermes (Master Sales Training Orchestrator)',
        highlight: '80% Psychology / 20% Product. 3-Roleplay Certification Gates (Dealer, Painter, Homeowner), 15-Minute Daily Objection Drills, and Ashutosh Sir Daily 1-Page Brief.'
      }
    ];

    modules.forEach(m => {
      text += `📘 *MODULE ${m.num}: ${m.name}*\n` +
              `• *Legend Lead*: ${m.legend}\n` +
              `• *Tactical Core*: ${m.highlight}\n\n`;
    });

    text += `🎯 *Operational Impact*: Ye saari skills Hermes Brain me active hain aur Sonu Kumar ko field pe exact counter pitch ke liye ready kiya gaya hai.\n\n` +
            `_Reply "playbook 1", "playbook 7", "/drill", ya "/roleplay" on WhatsApp to receive tactical word-for-word field scripts or start training!_`;

    return text;
  }

  generateModuleBrief(moduleNumber) {
    const files = this.getAvailablePlaybooks();
    const match = files.find(f => f.startsWith(`${moduleNumber}_`));
    if (!match) {
      return `⚠️ Playbook module #${moduleNumber} not found. Available modules: 1 to ${files.length}.`;
    }

    const content = this.readPlaybook(match);
    return `📘 *SHARMA INDUSTRIES FIELD PLAYBOOK — MODULE ${moduleNumber}*\n\n` +
      `${content}\n\n` +
      `──────────────────────────────\n` +
      `_Authorized by Hermes & Brian Tracy for Sonu Kumar & Field Sales Force._`;
  }

  async sendCurriculumToCeo(waClient) {
    const text = this.generateCurriculumSummary();
    if (waClient && typeof waClient.sendDirectMessage === 'function') {
      console.log(`[SalesTraining] Dispatching Master Curriculum to Ashutosh Sir (${this.ceoPhone})...`);
      const sent = await waClient.sendDirectMessage(this.ceoPhone, text);
      return sent;
    }
    return false;
  }

  async sendModuleToCeo(waClient, moduleNumber) {
    const text = this.generateModuleBrief(moduleNumber);
    if (waClient && typeof waClient.sendDirectMessage === 'function') {
      console.log(`[SalesTraining] Dispatching Module ${moduleNumber} to Ashutosh Sir (${this.ceoPhone})...`);
      const sent = await waClient.sendDirectMessage(this.ceoPhone, text);
      return sent;
    }
    return false;
  }
}

module.exports = new SalesTrainingDispatch();

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dispatcher = module.exports;

  if (args.includes('--module')) {
    const idx = args[args.indexOf('--module') + 1] || '1';
    console.log(dispatcher.generateModuleBrief(idx));
  } else {
    console.log(dispatcher.generateCurriculumSummary());
  }
}
