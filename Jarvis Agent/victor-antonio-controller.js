/**
 * Victor Antonio Controller — Financial Selling Engine & ROI Closing System
 * Swatch Paints — Sales & Negotiations Division (Legend #17)
 * 
 * Translates sales opportunities, dealer hesitation, and price objections
 * into irrefutable mathematical balance sheets, working capital ROI,
 * and Cost of Inaction (COI) calculations.
 * 
 * Governing Authority: CEO Ashutosh Sharma (+91 9079609627)
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'victor_antonio_roi_ledger.csv');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
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
    console.error('[Victor Antonio Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class VictorAntonioController {
  constructor() {
    this.name = 'victor_antonio_controller';
    this.legend = 'Victor Antonio';
    this.role = 'Financial Closer (ROI, Profit & Numbers-Based Selling System)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match incoming query against the ROI Ledger models
   */
  matchRoiModel(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();
    if (!records.length) return null;

    let matched = records.find(r => {
      const id = (r.roi_model_id || '').toLowerCase();
      const product = (r.product_name || '').toLowerCase();
      const scenario = (r.dealer_hesitation_scenario || '').toLowerCase();

      if (q.includes('bulk') || q.includes('100') || q.includes('volume') || q.includes('growth')) {
        return id === 'va-roi-02';
      }
      if (q.includes('wholesale') || q.includes('200') || q.includes('distributor') || q.includes('sonu')) {
        return id === 'va-roi-03';
      }
      if (q.includes('roller') || q.includes('roller coat')) {
        return id === 'va-roi-04';
      }
      if (q.includes('weatherguard') || q.includes('exterior') || q.includes('weather')) {
        return id === 'va-roi-05';
      }
      if (q.includes('shine') || q.includes('interior')) {
        return id === 'va-roi-06';
      }
      if (q.includes('waterproof') || q.includes('waterproofing') || q.includes('dr fixit')) {
        return id === 'va-roi-07';
      }
      if (q.includes('top coat') || q.includes('glaze') || q.includes('clear')) {
        return id === 'va-roi-08';
      }
      if (q.includes('combo') || q.includes('starter') || q.includes('display') || q.includes('counter')) {
        return id === 'va-roi-09';
      }
      if (q.includes('painter') || q.includes('token') || q.includes('contractor') || q.includes('cash token')) {
        return id === 'va-roi-10';
      }
      if (q.includes('rustic') || q.includes('50') || q.includes('texture') || q.includes('hesitant') || q.includes('asian')) {
        return id === 'va-roi-01';
      }

      return product.includes(q) || scenario.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Dynamically calculates ROI and profit gap metrics
   */
  calculateDynamicRoi({
    productName = 'Swatch Rustic Texture',
    packSize = '25kg Bag',
    volume = 50,
    dealerPurchaseRate = 690.0,
    contractorSellRate = 1090.0,
    competitorProfitPerUnit = 35.0
  } = {}) {
    const dealerProfitPerUnit = contractorSellRate - dealerPurchaseRate;
    const totalMonthlySwatchProfit = volume * dealerProfitPerUnit;
    const totalMonthlyMncProfit = volume * competitorProfitPerUnit;
    const monthlyNetGap = totalMonthlySwatchProfit - totalMonthlyMncProfit;
    const workingCapital = volume * dealerPurchaseRate;
    const monthlyCycleRoiPct = ((totalMonthlySwatchProfit / workingCapital) * 100).toFixed(2);
    const annualCashGap = monthlyNetGap * 12;
    const costOfInaction = annualCashGap;

    return {
      productName,
      packSize,
      volume,
      dealerPurchaseRate,
      contractorSellRate,
      dealerProfitPerUnit,
      totalMonthlySwatchProfit,
      competitorProfitPerUnit,
      totalMonthlyMncProfit,
      monthlyNetGap,
      workingCapital,
      monthlyCycleRoiPct,
      annualCashGap,
      costOfInaction
    };
  }

  /**
   * Generates a 2-column visual "Yellow Pad" comparison table
   */
  formatVisualYellowPad({ dealerName = 'Trade Partner', model = null, volume = 50 } = {}) {
    const rec = model || this.matchRoiModel('rustic 50');
    if (!rec) return '';

    const pRate = parseFloat(rec.dealer_purchase_rate) || 690;
    const sRate = parseFloat(rec.contractor_street_realization) || 1090;
    const sMargin = parseFloat(rec.dealer_profit_per_unit) || 400;
    const sTotal = parseFloat(rec.total_monthly_swatch_profit) || 20000;
    const mMargin = parseFloat(rec.competitor_mnc_profit_per_unit) || 35;
    const mTotal = parseFloat(rec.total_monthly_mnc_profit) || 1750;
    const gap = parseFloat(rec.monthly_net_profit_gap) || 18250;
    const capital = parseFloat(rec.initial_working_capital_req) || 34500;
    const roi = rec.monthly_cycle_roi_pct || '57.97';
    const annualGap = parseFloat(rec.annual_cumulative_cash_gap) || 219000;

    let out = `📊 *VICTOR ANTONIO — 2-COLUMN VISUAL ROI SHEET*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎯 *Partner*: ${dealerName} | *Product*: ${rec.product_name} (${rec.pack_size})\n`;
    out += `📦 *Turnover*: ${rec.monthly_volume_units} per 30-day inventory cycle\n\n`;

    out += `┌──────────────────────────────────────────┐\n`;
    out += `│ 1️⃣ *TRADITIONAL MNC MODEL* (Status Quo)   │\n`;
    out += `├──────────────────────────────────────────┤\n`;
    out += `│ • Margin Per Unit   : ₹${mMargin.toFixed(2)}                 │\n`;
    out += `│ • Monthly Profit    : ₹${mTotal.toLocaleString('en-IN')}               │\n`;
    out += `│ • Machine Cost      : ₹4,00,000 (Tinting Trap) │\n`;
    out += `│ • Capital Return    : ~4.0% per cycle           │\n`;
    out += `└──────────────────────────────────────────┘\n`;
    out += `                   ⬇️ VS ⬇️\n`;
    out += `┌──────────────────────────────────────────┐\n`;
    out += `│ 2️⃣ *SWATCH FACTORY-DIRECT MODEL* (Growth) │\n`;
    out += `├──────────────────────────────────────────┤\n`;
    out += `│ • Dealer Buy Price  : ₹${pRate.toFixed(2)}                │\n`;
    out += `│ • Retail Sell Price : ₹${sRate.toFixed(2)}               │\n`;
    out += `│ • Net Margin / Unit : ₹${sMargin.toFixed(2)} (40-45%)       │\n`;
    out += `│ • Monthly Net Profit: ₹${sTotal.toLocaleString('en-IN')}              │\n`;
    out += `│ • Machine Cost      : ₹0.00 (Zero Tinting)      │\n`;
    out += `│ • Working Capital   : ₹${capital.toLocaleString('en-IN')}              │\n`;
    out += `│ • 30-Day Cycle ROI  : *${roi}%*                 │\n`;
    out += `└──────────────────────────────────────────┘\n\n`;

    out += `💰 *THE CASH DISPARITY (Net Gap)*:\n`;
    out += `👉 *+₹${gap.toLocaleString('en-IN')} extra monthly cash profit!*\n`;
    out += `👉 *+₹${annualGap.toLocaleString('en-IN')} extra annual cash profit!*\n\n`;

    out += `⚠️ *COST OF INACTION (COI)*:\n`;
    out += `• Delaying 1 Month = Loss of ₹${gap.toLocaleString('en-IN')}\n`;
    out += `• Delaying 1 Year  = Loss of ₹${annualGap.toLocaleString('en-IN')} left on table!\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    return out;
  }

  /**
   * Generates word-for-word field script and ROI objection turnaround
   */
  generateRoiPitch({ query = '', dealerName = 'Trade Partner', repName = 'Field Sales Authority' } = {}) {
    const record = this.matchRoiModel(query);
    const sheet = this.formatVisualYellowPad({ dealerName, model: record });

    let res = sheet;
    res += `\n💬 *VICTOR ANTONIO SCRIPT (Word-for-Word)*:\n`;
    res += `👉 *"${record.victor_antonio_dialogue_script}"*\n\n`;

    res += `🛡️ *COGNITIVE CLOSING PRINCIPLE*:\n`;
    res += `• _"People buy on emotion, but they justify with logic. Nothing is stronger than undeniable numbers."_\n`;
    res += `• Rep Instruction: Write these numbers on pad in front of ${dealerName}. Never quote purely verbally!\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“No numbers ➔ No trust. No trust ➔ No deal!”_ 📈`;

    return res;
  }

  /**
   * Conversational Router for WhatsApp and Orchestrator
   */
  handleVictorConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const dealerName = userContext?.name || 'Retail Trade Partner';
    const repName = userContext?.repName || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('victor') || q.startsWith('antonio') || q.startsWith('roi') || q.startsWith('finance') || q.startsWith('numbers')) {
      query = text.replace(/^(victor|antonio|roi|finance|numbers|margin)\s*/i, '').trim();
    }

    if (!query || query.length < 3) {
      query = 'rustic texture 50 bags profit gap and roi';
    }

    return this.generateRoiPitch({
      query,
      dealerName,
      repName
    });
  }
}

const controller = new VictorAntonioController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'rustic 50 bags';
  console.log(controller.handleVictorConversation(q));
}

module.exports = controller;
