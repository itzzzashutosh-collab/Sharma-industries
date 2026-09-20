/**
 * Grant Cardone 10X Expansion Engine Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Growth Multiplier & Execution Accelerator:
 * - Multiplies targets, field activities, follow-ups, and visibility by 10X
 * - Deploys massive unapologetic action to achieve regional market dominance
 * - Synchronizes aggressive sales demand with Bundi plant production (+20% safety buffer)
 *   directed by Senior Chemist Shahrukh bhai and Warehouse Helper Om Prakash Saini
 * - Enforces minimum 7–10 touchpoint follow-up rule (a single follow-up is an admission of failure)
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'grant_cardone_10x_expansion_ledger.csv');
const PRODUCTS_CSV_PATH = path.join(__dirname, 'data', 'products.csv');

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
    console.error('[Grant Cardone Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class GrantCardoneController {
  constructor() {
    this.name = 'grant_cardone_controller';
    this.legend = 'Grant Cardone';
    this.role = 'Growth Multiplier (Speed + Volume + Market Capture)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match incoming query against the 10X Expansion Ledger
   */
  matchPillar(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const pillar = (r.framework_pillar || '').toLowerCase();
      const action = (r.cardone_10x_multiplier_action || '').toLowerCase();

      if (q.includes('production') || q.includes('buffer') || q.includes('supply') || q.includes('sync') || q.includes('shahrukh') || q.includes('plant')) {
        return r.cardone_id === 'CARD-PRD-06';
      }
      if (q.includes('target') || q.includes('goal') || q.includes('1000 bag') || q.includes('multiplier')) {
        return r.cardone_id === 'CARD-TGT-01';
      }
      if (q.includes('activity') || q.includes('visit') || q.includes('50 touch') || q.includes('swarm')) {
        return r.cardone_id === 'CARD-ACT-02';
      }
      if (q.includes('follow-up') || q.includes('followup') || q.includes('persistence') || q.includes('7 touch') || q.includes('10 touch')) {
        return r.cardone_id === 'CARD-FLW-03';
      }
      if (q.includes('visibility') || q.includes('board') || q.includes('saturation') || q.includes('display') || q.includes('banner')) {
        return r.cardone_id === 'CARD-VIS-04';
      }
      if (q.includes('speed') || q.includes('dispatch') || q.includes('fast') || q.includes('24 hour')) {
        return r.cardone_id === 'CARD-SPD-05';
      }
      if (q.includes('territory') || q.includes('geographic') || q.includes('bundi') || q.includes('kota') || q.includes('cascade')) {
        return r.cardone_id === 'CARD-GEO-07';
      }
      if (q.includes('dealer') || q.includes('counter') || q.includes('expansion')) {
        return r.cardone_id === 'CARD-DLR-08';
      }
      if (q.includes('site') || q.includes('construction') || q.includes('thekedar') || q.includes('trowel')) {
        return r.cardone_id === 'CARD-STE-09';
      }
      if (q.includes('cadence') || q.includes('daily') || q.includes('routine') || q.includes('sop')) {
        return r.cardone_id === 'CARD-CAD-10';
      }

      return pillar.includes(q) || action.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Calculates 10X Production & Inventory Synchronization Plan
   */
  calculate10XProductionSync({ currentDemandBags = 1000 } = {}) {
    const bufferMultiplier = 1.20; // +20% Buffer Rule
    const productionTarget = Math.round(currentDemandBags * bufferMultiplier);
    const bufferBags = productionTarget - currentDemandBags;

    const baseCost = 450;
    const landedCost = 635;
    const standardDealerPrice = 690;
    const netHurdleCompanyProfit = standardDealerPrice - landedCost; // Rs 55/bag standard, hurdle >= Rs 100 on gross margin
    const totalProductionValue = productionTarget * standardDealerPrice;
    const totalNetProfit = productionTarget * 100; // Net Hurdle Benchmark Rs 100/bag

    let report = `🏭 *GRANT CARDONE — 10X PRODUCTION & INVENTORY SYNCHRONIZATION PLAN*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `💡 *Golden Rule*: _“Demand > Supply kabhi nahi hona chahiye! Sales Forecast $\\to$ Production Planning $\\to$ Buffer Ready.”_\n\n`;

    report += `📊 *1. ARITHMETIC 10X VOLUME & BUFFER BREAKDOWN*:\n`;
    report += `• *Forecasted Market Sales Demand*: *${currentDemandBags.toLocaleString('en-IN')} Bags*\n`;
    report += `• *10X Production Schedule (+20% Buffer)*: *${productionTarget.toLocaleString('en-IN')} Bags*\n`;
    report += `• *Ready Warehouse Safety Buffer*: *${bufferBags.toLocaleString('en-IN')} Bags* (Permanent Pallet Stock)\n`;
    report += `• *Projected Gross Value*: *₹${totalProductionValue.toLocaleString('en-IN')}*\n`;
    report += `• *Projected Company Net Profit (@ ₹100 Hurdle)*: *₹${totalNetProfit.toLocaleString('en-IN')}*\n\n`;

    report += `👨‍🔬 *2. PLANT OPERATIONS DIRECTIVE (Senior Chemist Shahrukh bhai)*:\n`;
    report += `• Stage raw natural silica quartz aggregate (0.5mm & 1.2mm grading) for *${productionTarget} bags*.\n`;
    report += `• Pre-mix acrylic co-polymer binder batches to ensure 100% open-time consistency and trowel glide.\n`;
    report += `• Enforce batch-to-batch quality checks; zero color or aggregate variation across dispatches.\n\n`;

    report += `🚚 *3. LOGISTICS & WAREHOUSE DISPATCH (Om Prakash Saini)*:\n`;
    report += `• Maintain minimum *${bufferBags} pre-packed 25kg Swatch Rustic bags* shrink-wrapped on dry wooden pallets.\n`;
    report += `• Orders confirmed before 14:00 IST are loaded immediately for same-day/next-morning tempo dispatch.\n`;
    report += `• Pre-book transport tempos for Kota, Bundi, and Hadoti trade corridors.\n\n`;

    report += `⚡ *4. CARDONE 10X MINDSET*: _“Small action $\\to$ Small growth. Massive action $\\to$ Market domination!”_ 👑`;
    return report;
  }

  /**
   * Generates aggressive 10X Expansion Briefing
   */
  coach10XExpansion({ query = '', repName = 'Field Sales Warrior', targetName = 'Regional Market' } = {}) {
    const q = (query || '').toLowerCase().trim();

    if (q.includes('production') || q.includes('buffer') || q.includes('plant') || q.includes('inventory') || q.includes('sync')) {
      return this.calculate10XProductionSync();
    }

    const record = this.matchPillar(query);

    let res = `🚀 *GRANT CARDONE — 10X EXPANSION & DOMINATION BRIEFING*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `💡 *Core Law*: _“Average actions bring average results. Massive action creates domination!”_\n`;
    res += `🎯 *Pillar*: *${record.framework_pillar}* | *Command*: \`${record.execution_command}\`\n`;
    res += `👤 *Rep*: ${repName} | *Domain*: ${targetName}\n\n`;

    res += `📉 *NORMAL INDUSTRY BASELINE (Timid & Average)*:\n`;
    res += `• ${record.normal_linear_baseline}\n\n`;

    res += `🔥 *CARDONE 10X MULTIPLIER ACTION (Massive Domination)*:\n`;
    res += `• *${record.cardone_10x_multiplier_action}*\n`;
    res += `• *Volume Target*: *${record.commercial_volume_target}*\n\n`;

    res += `🎯 *FIELD EXECUTION RULE / SCRIPT*:\n`;
    res += `👉 *“${record.field_script_or_sop_rule}”*\n\n`;

    res += `⚙️ *OPERATIONAL PREREQUISITE*:\n`;
    res += `• ${record.operational_dependency}\n\n`;

    res += `🛡️ *THE CARDONE EXPANSION CREED*:\n`;
    res += `• Never reduce a target; multiply your actions by 10!\n`;
    res += `• A single follow-up is failure; execute 7–10 touches without fear of rejection.\n`;
    res += `• *Market Goal*: _“Swatch har jagah hai — ignore karna namumkin hai.”_\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“Competition smart nahi hota, bas consistent hota hai. Tumko unse 10X consistent hona hai.”_ 👑`;

    return res;
  }

  /**
   * Conversational Router for WhatsApp and Orchestrator
   */
  handleCardoneConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('cardone') || q.startsWith('grant') || q.startsWith('10x') || q.startsWith('scale')) {
      query = text.replace(/^(cardone|grant|10x|scale|expansion)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = '10X market expansion and production synchronization';
    }

    return this.coach10XExpansion({
      query,
      repName,
      targetName: 'Rajasthan Core Market'
    });
  }
}

const controller = new GrantCardoneController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || '10X market expansion and production synchronization';
  console.log(controller.handleCardoneConversation(q));
}

module.exports = controller;
