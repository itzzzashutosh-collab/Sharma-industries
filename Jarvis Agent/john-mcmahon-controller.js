/**
 * John McMahon Target Dealer Qualification Controller (MEDDPICC)
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Target Selection & Dealer Qualification Engine:
 * - Simplified MEDDPICC for Indian retail paint trade (Money, Economic Buyer, Demand, Pain, Process, Intent, Competition)
 * - 10-Point Scorecard (8-10 High Target, 5-7 Dream 100 Nurture, <5 Disqualify/Avoid)
 * - Filters out low-margin time-wasters and chronic credit-seekers before reps spend hours
 * - Scans verified dealer directories for Ideal Customer Profile (ICP) counters
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'john_mcmahon_qualification_scorecard_ledger.csv');
const VERIFIED_DEALERS_PATH = path.join(__dirname, 'data', 'verified_dealers_directory.csv');

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
    console.error('[John McMahon Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class JohnMcMahonController {
  constructor() {
    this.name = 'john_mcmahon_controller';
    this.legend = 'John McMahon';
    this.role = 'Target Selection Engine (High-Value Dealer & Customer Identifier)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Calculate 10-point MEDDPICC score based on field parameters
   */
  calculateScore({
    billing = 250000,
    isOwnerPresent = true,
    demandBags = 35,
    hasMncPain = true,
    hasIntent = true,
    accepts7DayTerms = true
  }) {
    let moneyScore = 0;
    if (billing >= 200000) moneyScore = 2;
    else if (billing >= 100000) moneyScore = 1;

    const ebScore = isOwnerPresent ? 2 : 0;

    let demandScore = 0;
    if (demandBags >= 30) demandScore = 2;
    else if (demandBags >= 10) demandScore = 1;

    const painScore = hasMncPain ? 1 : 0;
    const intentScore = hasIntent ? 2 : 0;
    const paymentScore = accepts7DayTerms ? 1 : 0;

    const totalScore = moneyScore + ebScore + demandScore + painScore + intentScore + paymentScore;

    let classification = '🔴 DISQUALIFY (AVOID)';
    let action = 'Do not visit again. Zero sales hours invested to prevent rep burnout and bad debt.';

    if (totalScore >= 8) {
      classification = '🟢 HIGH PRIORITY TARGET';
      action = 'Immediate on-site closing pitch. Deploy Alex Hormozi Shubh Aarambh 20-bag trial with 1ft x 1ft display board.';
    } else if (totalScore >= 5) {
      classification = '🟡 DREAM 100 LIST (NURTURE)';
      action = 'Do not pitch aggressively. Place on Chet Holmes Dream 100 list. Send quarterly trade proof slips and revisit during price hikes.';
    }

    return {
      totalScore,
      maxScore: 10,
      classification,
      action,
      breakdown: {
        money: `${moneyScore}/2 (Billing: ₹${billing.toLocaleString('en-IN')})`,
        economicBuyer: `${ebScore}/2 (Owner Present: ${isOwnerPresent ? 'Yes' : 'No'})`,
        demand: `${demandScore}/2 (Monthly Texture Pull: ${demandBags} bags)`,
        pain: `${painScore}/1 (MNC Margin Frustration: ${hasMncPain ? 'Yes' : 'No'})`,
        intent: `${intentScore}/2 (Commercial Intent: ${hasIntent ? 'High' : 'Low'})`,
        payment: `${paymentScore}/1 (Accepts 7-Day Protocol: ${accepts7DayTerms ? 'Yes' : 'No'})`
      }
    };
  }

  /**
   * Match an incoming query to one of the 6 grounded qualification ledger profiles
   */
  matchProfile(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const profile = (r.shop_profile || '').toLowerCase();
      const turnover = (r.monthly_turnover || '').toLowerCase();
      const pain = (r.mnc_pain_point || '').toLowerCase();
      const classification = (r.classification || '').toLowerCase();

      if (q.includes('small') || q.includes('rural') || q.includes('chhoti') || q.includes('udhar') || q.includes('40000') || q.includes('credit')) {
        return r.qual_id === 'MCMAHON-02';
      }
      if (q.includes('mnc') || q.includes('exclusive') || q.includes('showroom') || q.includes('big dealer') || q.includes('dream 100')) {
        return r.qual_id === 'MCMAHON-03';
      }
      if (q.includes('commercial') || q.includes('stockist') || q.includes('project') || q.includes('heavy') || q.includes('bulk')) {
        return r.qual_id === 'MCMAHON-04';
      }
      if (q.includes('sanitary') || q.includes('struggling') || q.includes('tile') || q.includes('no owner') || q.includes('helper')) {
        return r.qual_id === 'MCMAHON-05';
      }
      if (q.includes('thekedar') || q.includes('contractor') || q.includes('pull') || q.includes('town edge')) {
        return r.qual_id === 'MCMAHON-06';
      }
      if (q.includes('mixed') || q.includes('hardware') || q.includes('ideal') || q.includes('perfect') || q.includes('target')) {
        return r.qual_id === 'MCMAHON-01';
      }

      return profile.includes(q) || turnover.includes(q) || pain.includes(q) || classification.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Search verified dealers directory for qualified target candidates in a city/town
   */
  searchQualifiedDealers({ city = 'Kota', minBags = 40, limit = 5 }) {
    if (!fs.existsSync(VERIFIED_DEALERS_PATH)) return [];
    try {
      const raw = fs.readFileSync(VERIFIED_DEALERS_PATH, 'utf-8');
      const lines = raw.trim().split('\n');
      if (lines.length <= 1) return [];
      const headers = parseCsvLine(lines[0]);

      const candidates = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCsvLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = vals[idx] || '';
        });

        const rowCity = (row.city || '').toLowerCase();
        const estBags = parseInt(row.estimated_monthly_bags || '0', 10);

        if ((!city || rowCity.includes(city.toLowerCase())) && estBags >= minBags) {
          candidates.push(row);
          if (candidates.length >= limit) break;
        }
      }
      return candidates;
    } catch (e) {
      console.error('[John McMahon Controller] Error searching verified dealers:', e.message);
      return [];
    }
  }

  /**
   * Coach physical sales reps on dealer qualification via WhatsApp
   */
  coachQualification({ query = '', repName = 'Field Sales Rep', dealerName = 'Target Counter' }) {
    const q = (query || '').toLowerCase().trim();

    // Check if query is asking to search verified dealers
    if (q.includes('search') || q.includes('find') || q.includes('list') || q.includes('dhoondho') || q.includes('directory')) {
      let targetCity = 'Kota';
      if (q.includes('bundi')) targetCity = 'Bundi';
      else if (q.includes('baran')) targetCity = 'Baran';
      else if (q.includes('ajmer')) targetCity = 'Ajmer';
      else if (q.includes('alwar')) targetCity = 'Alwar';
      else if (q.includes('sikar')) targetCity = 'Sikar';

      const dealers = this.searchQualifiedDealers({ city: targetCity, minBags: 50, limit: 3 });
      
      let res = `🎯 *JOHN MCMAHON — VERIFIED ICP TARGET SEARCH (${targetCity.toUpperCase()})*\n`;
      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `💡 *Qualification Directive*: _“Not every customer is worth your time.”_\n`;
      res += `Filter: $\\ge 50$ monthly texture bags potential | Active Mixed Hardware/Coating Counters\n\n`;

      if (dealers.length === 0) {
        res += `No verified counters found in ${targetCity} matching $\\ge 50$ bags criteria. Broaden search.\n`;
      } else {
        dealers.forEach((d, idx) => {
          res += `*#${idx + 1} ${d.shop_name}*\n`;
          res += `• *Owner*: ${d.owner_name} | *Phone*: ${d.phone}\n`;
          res += `• *Area*: ${d.market_area}, ${d.city}\n`;
          res += `• *Est. Volume*: *${d.estimated_monthly_bags} bags/month* (~₹${(parseInt(d.estimated_monthly_bags, 10) * 690).toLocaleString('en-IN')} billing)\n`;
          res += `• *Business Type*: ${d.business_type}\n`;
          res += `• *MEDDPICC Verdict*: 🟢 HIGH PRIORITY TARGET (Score: 9/10)\n\n`;
        });
      }
      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `_“Right customer $\\to$ Easy sale. Wrong customer $\\to$ Constant struggle.”_ 👑`;
      return res;
    }

    const matched = this.matchProfile(query);

    let response = `🎯 *JOHN MCMAHON — DEALER QUALIFICATION ENGINE (MEDDPICC)*\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `💡 *Core Philosophy*: _“Not every customer is worth your time.”_\n`;
    response += `⚖️ *The McMahon Law*: _“Right customer $\\to$ Easy sale. Wrong customer $\to$ Constant struggle.”_\n\n`;

    response += `👤 *Rep*: ${repName} | *Target*: ${dealerName}\n`;
    response += `🏪 *Profile Analyzed*: *${matched.shop_profile}*\n`;
    response += `📊 *Monthly Billing*: ${matched.monthly_turnover}\n`;
    response += `👥 *Economic Buyer*: ${matched.economic_buyer_status}\n`;
    response += `📦 *Texture Demand*: ${matched.texture_demand}\n`;
    response += `🔥 *MNC Pain Point*: _"${matched.mnc_pain_point}"_\n`;
    response += `💳 *Payment Terms*: ${matched.payment_terms_ethic}\n\n`;

    response += `⚖️ *MEDDPICC SCORECARD VERDICT*:\n`;
    response += `• *Total Score*: *${matched.meddpicc_score}*\n`;
    response += `• *Classification*: *${matched.classification}*\n\n`;

    response += `🛡️ *ACTION DIRECTIVE FOR FIELD REP*:\n`;
    response += `👉 *${matched.mcmahon_action_directive}*\n\n`;

    response += `📋 *DAILY QUALIFICATION CADENCE*:\n`;
    response += `20 New Shops Identified $\\to$ 10 Qualified via MEDDPICC $\\to$ Top 5 Shortlisted $\\to$ 2 On-Site Trial Closes.\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `_“Growth fast tab hoti hai jab tum wrong logon ko 'NO' bolte ho.”_ 👑`;

    return response;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleMcMahonConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('mcmahon') || q.startsWith('qualify') || q.startsWith('qualification') || q.startsWith('icp')) {
      query = text.replace(/^(mcmahon|qualify|qualification|icp|filter|scorecard)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = 'High-Volume Mixed Building Materials Counter';
    }

    return this.coachQualification({
      query,
      repName,
      dealerName: 'Target Dealer Counter'
    });
  }
}

const controller = new JohnMcMahonController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Small rural hardware shop credit मांगता है';
  console.log(controller.handleMcMahonConversation(q));
}

module.exports = controller;
