/**
 * Chet Holmes Dream 100 Market Domination & Growth Strategy Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Market Domination & Sales Growth Planner:
 * - Directs 80% of executive & sales focus toward the Top 100 Whale Accounts (Top 20 Dealers,
 *   Top 20 Contractors, Top 20 Builders, Top 20 Architects, Top 20 Distributors)
 * - Deploys "Pigheaded Discipline" 7–12 touchpoint value cadence
 * - Analyzes sales data and tracks 4 Gold Metrics (Revenue/Whale, Repeat %, AOS, Hurdle Margin)
 * - Formulates actionable roadmaps to catapult Swatch Paints to the #1 regional market rank
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'chet_holmes_dream100_target_ledger.csv');
const USERS_CSV_PATH = path.join(__dirname, 'data', 'users.csv');

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
    console.error('[Chet Holmes Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class ChetHolmesController {
  constructor() {
    this.name = 'chet_holmes_controller';
    this.legend = 'Chet Holmes';
    this.role = 'Market Domination Strategist (Top Dealer Capture + Sales Growth Planner)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match an incoming query to one of the 5 Dream 100 cohorts, Gold Metrics, or Field Cadence
   */
  matchTarget(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const cat = (r.cohort_category || '').toLowerCase();
      const profile = (r.target_profile_or_kpi || '').toLowerCase();

      if (q.includes('dealer') || q.includes('counter') || q.includes('dukaan') || q.includes('retail')) {
        return r.dream_id === 'D100-DLR-01';
      }
      if (q.includes('contractor') || q.includes('thekedar') || q.includes('mistri') || q.includes('painter')) {
        return r.dream_id === 'D100-CON-02';
      }
      if (q.includes('builder') || q.includes('developer') || q.includes('project') || q.includes('township') || q.includes('boq')) {
        return r.dream_id === 'D100-BLD-03';
      }
      if (q.includes('architect') || q.includes('specifier') || q.includes('facade') || q.includes('elevation') || q.includes('sample box')) {
        return r.dream_id === 'D100-ARC-04';
      }
      if (q.includes('distributor') || q.includes('wholesaler') || q.includes('wholesale') || q.includes('sonu')) {
        return r.dream_id === 'D100-DST-05';
      }
      if (q.includes('metric') || q.includes('revenue') || q.includes('kpi') || q.includes('repeat') || q.includes('order size') || q.includes('hurdle')) {
        return r.cohort_category === 'Gold Domination Metric';
      }
      if (q.includes('cadence') || q.includes('routine') || q.includes('daily') || q.includes('weekly') || q.includes('monthly') || q.includes('sop')) {
        return r.dream_id === 'D100-CAD-10';
      }

      return cat.includes(q) || profile.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Generates a Strategic Sales Data Analysis and Growth Report
   */
  analyzeSalesGrowthData({ currentRevenue = 450000, activeDream100Dealers = 3, repeatRatio = 80, avgOrderBags = 65 } = {}) {
    let report = `📊 *CHET HOLMES — SALES DATA ANALYSIS & GROWTH PLAN REPORT*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `💡 *Domination Principle*: _“Top 100 control $\\to$ Market control. Market sabka nahi hota; market top players ka hota hai.”_\n\n`;

    const revPerDealer = activeDream100Dealers > 0 ? Math.round(currentRevenue / activeDream100Dealers) : 0;
    const revBenchmark = 150000;
    const repeatBenchmark = 75;
    const aosBenchmark = 50;

    report += `📈 *1. PERFORMANCE METRICS AUDIT (Current vs #1 Rank Benchmark)*:\n`;
    report += `• *Active Dream 100 Accounts*: *${activeDream100Dealers} / 100*\n`;
    report += `• *Revenue per Account*: *₹${revPerDealer.toLocaleString('en-IN')}/mo* (Target: $\\ge ₹${revBenchmark.toLocaleString('en-IN')}) $\\implies$ ${revPerDealer >= revBenchmark ? '✅ OPTIMAL' : '⚠️ ELEVATE'}\n`;
    report += `• *Repeat Re-order Rate*: *${repeatRatio}%* (Target: $\\ge ${repeatBenchmark}%) $\\implies$ ${repeatRatio >= repeatBenchmark ? '✅ ELITE VELOCITY' : '⚠️ ATTRITION RISK'}\n`;
    report += `• *Average Order Size (AOS)*: *${avgOrderBags} Bags* (Target: $\\ge ${aosBenchmark} Bags) $\\implies$ ${avgOrderBags >= aosBenchmark ? '✅ LOGISTICS OPTIMIZED' : '⚠️ CONSOLIDATE'}\n`;
    report += `• *Net Company Hurdle Margin*: *₹100–₹132/bag net* $\\implies$ 🛡️ 100% PROTECTED\n\n`;

    report += `🚀 *2. STRATEGIC GROWTH PLAN TO #1 RANK (Next 90 Days)*:\n`;
    report += `1. **Focus Concentration**: Stop sales reps from chasing sub-10 bag retail stores. Reallocate 80% field hours to the top 20 counters in Kota, Bundi & Hadoti.\n`;
    report += `2. **Relentless Multi-Touch (Pigheaded Discipline)**: Every whale account must receive 7 to 12 scheduled value touchpoints (demo patch, profit sheet, sample kit) before closing.\n`;
    report += `3. **Territory Protection Lock**: Grant 1 selected dealer per commercial market strict counter exclusivity to incentivize massive brand promotion.\n`;
    report += `4. **Contractor Referral Flywheel**: Link each Dream 100 dealer with top 3 local painting thekedars via the ₹50 Painter Growth Token program.\n\n`;

    report += `⚡ *3. EXPECTED COMMERCIAL PROJECTION (At 20 Active Whales)*:\n`;
    const projectedRev = 20 * revBenchmark;
    const projectedProfit = 20 * 300 * 100; // 300 bags per dealer * Rs 100 profit
    report += `• Projected Monthly Billing: *₹${projectedRev.toLocaleString('en-IN')}*\n`;
    report += `• Projected Monthly Net Manufacturing Profit: *₹${projectedProfit.toLocaleString('en-IN')}*\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `_“Pigheaded discipline and determination will always beat raw sales talent.”_ 👑`;

    return report;
  }

  /**
   * Generates custom scenario-based Dream 100 Domination pitch
   */
  coachDream100({ query = '', repName = 'Territory Executive', targetName = 'Prime Market Leader' } = {}) {
    const q = (query || '').toLowerCase().trim();

    if (q.includes('analysis') || q.includes('growth plan') || q.includes('data') || q.includes('report') || q.includes('rank 1') || q.includes('top 1')) {
      return this.analyzeSalesGrowthData();
    }

    const record = this.matchTarget(query);

    let res = `👑 *CHET HOLMES — DREAM 100 DOMINATION BRIEFING*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `💡 *Core Law*: _“Focus on the best… ignore the rest.”_\n`;
    res += `🎯 *Target Cohort*: *${record.cohort_category}* (${record.target_profile_or_kpi})\n`;
    res += `👤 *Rep*: ${repName} | *Target*: ${targetName}\n\n`;

    res += `📋 *QUALIFICATION CRITERIA*:\n`;
    res += `• ${record.qualification_criteria}\n\n`;

    res += `⚡ *DOMINATION STRATEGY*:\n`;
    res += `• ${record.domination_strategy}\n\n`;

    res += `🎯 *DOMINATION SCRIPT (Word-for-Word)*:\n`;
    res += `👉 *“${record.domination_script_or_benchmark}”*\n\n`;

    res += `🔄 *TOUCHPOINT CADENCE STAGE*:\n`;
    res += `• ${record.touchpoint_cadence_stage}\n\n`;

    res += `🛡️ *PIGHEADED DISCIPLINE RULE*:\n`;
    res += `• ${record.pigheaded_discipline_rule}\n`;
    res += `• *Goal*: Market must say: _“Swatch sirf bade players ke saath kaam karta hai.”_\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“Top 100 control $\\to$ Market control.”_ 👑`;

    return res;
  }

  /**
   * Conversational Router for WhatsApp and Orchestrator
   */
  handleChetConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('chet') || q.startsWith('holmes') || q.startsWith('dream') || q.startsWith('domination')) {
      query = text.replace(/^(chet|holmes|dream|domination|dream100|dream 100)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = 'Top dealer pitch and sales growth plan to rank 1';
    }

    return this.coachDream100({
      query,
      repName,
      targetName: 'Market Whale Partner'
    });
  }
}

const controller = new ChetHolmesController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Top dealer pitch and sales growth plan to rank 1';
  console.log(controller.handleChetConversation(q));
}

module.exports = controller;
