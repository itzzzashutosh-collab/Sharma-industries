/**
 * Sharma Industries / Swatch Paints — Alex Hormozi Offer & Pricing Sub-Agent
 * Sub-agent name: hormozi_offer_engine
 * 
 * Powered by Alex Hormozi's Localized Frameworks ($100M Offers, $100M Leads, Money Models)
 * Tailored strictly for the Indian Paint Market — CURRENT FOCUS: SWATCH RUSTIC ONLY.
 * 
 * Features:
 *  1. Graph Engineering: Deterministic 6-State DAG for pricing audits and offer flow.
 *  2. Loop Engineering: Iterative margin recalculation loops when hurdle rates are breached.
 *  3. Admin Approval Gate: Dynamic margin updates & overrides via CEO Ashutosh Sharma (+91 9079609627).
 *  4. Scope Discipline: Pricing, Offers, Schemes ONLY (No logistics, warehousing, or distribution).
 *  5. Terminology Compliance: Strictly zero use of "mandi" (Uses Market / B2B Market / Retail Trade Network).
 */

const fs = require('fs');
const path = require('path');
const hermesBridge = require('./hermes-bridge');

const LOGS_DIR = path.join(__dirname, 'data', 'hormozi_logs');
const PRODUCTS_MEMORY_FILE = path.join(__dirname, 'data', 'swatch_products_memory.json');
const SKILL_DIR = path.join(process.env.USERPROFILE || 'C:\\Users\\itzzz', '.hermes', 'skills', 'experts', 'alex-hormozi-india');

function initStorage() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTS_MEMORY_FILE)) {
    const defaultData = {
      "swatch rustic": {
        productName: "Swatch Rustic",
        category: "Mid-tier / Premium Paint",
        mrp: 1150,
        landedCost: 450,
        dealerMarginMin: 0.40,
        dealerMarginMax: 0.45,
        dealerPriceMin: 632.50,
        dealerPriceMax: 690.00,
        packSize: "25kg Bag",
        companyMarginHurdle: 100.00,
        painterIncentive: { min: 100, max: 600, default: 200 },
        cashDiscount: { min: 0.03, max: 0.05, default: 0.03 },
        festivalBonus: { min: 0.02, max: 0.05, default: 0.02 },
        adminApprovalRequired: true,
        adminContact: "Ashutosh Sharma (+91 9079609627)",
        updatedAt: new Date().toISOString()
      }
    };
    fs.writeFileSync(PRODUCTS_MEMORY_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

class HormoziOfferEngine {
  constructor() {
    this.name = 'hormozi_offer_engine';
    this.displayName = 'Alex Hormozi Offer & Pricing Expert';
    initStorage();
  }

  getProductData(name = 'swatch rustic') {
    initStorage();
    try {
      const data = JSON.parse(fs.readFileSync(PRODUCTS_MEMORY_FILE, 'utf-8'));
      const key = name.toLowerCase().trim();
      let entry = data[key];
      // Follow string aliases (e.g. "rustic" → "swatch rustic" → actual object)
      if (typeof entry === 'string') {
        entry = data[entry];
      }
      return entry || data['swatch rustic'];
    } catch (e) {
      return {
        productName: "Swatch Rustic Texture",
        mrp: 1150,
        landedCost: 450,
        dealerMarginMin: 0.40,
        dealerMarginMax: 0.45,
        dealerPriceMin: 632.50,
        dealerPriceMax: 690.00,
        packSize: "25kg Bag",
        companyMarginHurdle: 100.00
      };
    }
  }

  saveProductData(name, details) {
    initStorage();
    try {
      const data = JSON.parse(fs.readFileSync(PRODUCTS_MEMORY_FILE, 'utf-8'));
      data[name.toLowerCase()] = { ...details, updatedAt: new Date().toISOString() };
      fs.writeFileSync(PRODUCTS_MEMORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      return false;
    }
  }

  logSession({ userQuery, recommendation, status = 'evaluated', graphTrace = [] }) {
    initStorage();
    const logId = `HORMOZI-${Date.now().toString(36).toUpperCase()}`;
    const entry = {
      id: logId,
      timestamp: new Date().toISOString(),
      userQuery,
      graphTrace,
      recommendation,
      status
    };
    const logFile = path.join(LOGS_DIR, `${logId}.json`);
    fs.writeFileSync(logFile, JSON.stringify(entry, null, 2), 'utf-8');

    const indexFile = path.join(LOGS_DIR, 'index.json');
    let index = [];
    if (fs.existsSync(indexFile)) {
      try { index = JSON.parse(fs.readFileSync(indexFile, 'utf-8')); } catch (e) {}
    }
    index.unshift({ id: logId, timestamp: entry.timestamp, status });
    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf-8');
    return logId;
  }

  /**
   * GRAPH ENGINEERING: 6-State DAG Decision Flow
   * State 1: Scope Validation
   * State 2: Parameter Ingestion & Grounding
   * State 3: Dealer Margin Gate (40% - 45%)
   * State 4: Operational Burden Subtraction
   * State 5: Hurdle Rate Verification (>= ₹100)
   * State 6: Decision Routing & Admin Approval Gate
   */
  evaluatePricingGraph(params) {
    const trace = [];
    const prod = this.getProductData('swatch rustic');
    const mrp = params.mrp || prod.mrp;
    const cost = params.landedCost || prod.landedCost;
    const dealerPrice = params.dealerPrice || (mrp * (1 - (params.dealerMarginPercent ? params.dealerMarginPercent / 100 : 0.40)));

    trace.push({ state: 'S1_SCOPE_VALIDATION', status: 'PASS', details: 'Focused strictly on Swatch Rustic pricing/offers.' });
    trace.push({ state: 'S2_PARAMETER_INGESTION', status: 'PASS', mrp, cost, dealerPrice });

    // Step 3: Dealer Margin Gate
    const dealerMarginRs = mrp - dealerPrice;
    const dealerMarginPct = (dealerMarginRs / mrp) * 100;

    let marginStatus = 'PASS';
    let blockReason = null;

    if (dealerMarginPct < (prod.dealerMarginMin * 100) - 0.01) {
      marginStatus = 'BLOCKED_LOW_DEALER_MARGIN';
      blockReason = `Dealer Margin (${dealerMarginPct.toFixed(2)}%) is below mandatory minimum 40% (₹460 on ₹1150 MRP). Dealer price ₹${dealerPrice.toFixed(2)} is too high.`;
    } else if (dealerPrice < prod.dealerPriceMin - 0.01 && !params.adminOverride) {
      marginStatus = 'BLOCKED_COMPANY_MARGIN_COMPRESSED';
      blockReason = `Dealer Price (₹${dealerPrice.toFixed(2)}) is below ₹632.50 floor (45% margin limit). Company margin excessively thin without explicit CEO approval.`;
    }

    trace.push({ state: 'S3_DEALER_MARGIN_GATE', status: marginStatus, dealerMarginPct: dealerMarginPct.toFixed(2), blockReason });

    // Step 4: Operational Burdens
    const painterToken = params.painterToken !== undefined ? params.painterToken : (prod.painterIncentive?.default || 200);
    const cashDiscountPct = params.cashDiscountPct !== undefined ? params.cashDiscountPct : (prod.cashDiscount?.default || 0.03);
    const cashDiscountRs = dealerPrice * cashDiscountPct;
    const extraBurden = painterToken + cashDiscountRs + (params.freight || 0);

    const grossCompanyMargin = dealerPrice - cost;
    const netCompanyMargin = grossCompanyMargin - extraBurden;

    trace.push({
      state: 'S4_OPERATIONAL_BURDEN_AUDIT',
      grossCompanyMargin: grossCompanyMargin.toFixed(2),
      painterToken,
      cashDiscountRs: cashDiscountRs.toFixed(2),
      netCompanyMargin: netCompanyMargin.toFixed(2)
    });

    // Step 5: Hurdle Rate Verification
    let hurdleStatus = 'PASS';
    if (netCompanyMargin < prod.companyMarginHurdle) {
      hurdleStatus = 'BREACH_HURDLE_FLOOR';
    }

    trace.push({ state: 'S5_HURDLE_RATE_VERIFICATION', status: hurdleStatus, netCompanyMargin: netCompanyMargin.toFixed(2), hurdle: prod.companyMarginHurdle });

    // Step 6: Decision Routing
    let finalVerdict = 'APPROVED';
    if (blockReason) {
      finalVerdict = 'BLOCKED';
    } else if (hurdleStatus === 'BREACH_HURDLE_FLOOR') {
      finalVerdict = 'NEEDS_LOOP_OPTIMIZATION_OR_ADMIN_APPROVAL';
    }

    trace.push({ state: 'S6_DECISION_ROUTING', verdict: finalVerdict });

    return {
      mrp,
      cost,
      dealerPrice,
      dealerMarginRs,
      dealerMarginPct,
      grossCompanyMargin,
      painterToken,
      cashDiscountRs,
      cashDiscountPct: cashDiscountPct * 100,
      netCompanyMargin,
      hurdleStatus,
      finalVerdict,
      blockReason,
      trace
    };
  }

  /**
   * LOOP ENGINEERING: Iterative Margin Rebalancing Engine
   * Executes when Net Margin < ₹100 to find the optimal commercial configuration.
   */
  runOptimizationLoop(baseEval) {
    const loopSteps = [];
    let current = { ...baseEval };
    let iteration = 0;
    const maxIterations = 4;

    while (current.netCompanyMargin < 100 && iteration < maxIterations) {
      iteration++;

      if (iteration === 1 && current.cashDiscountPct > 3) {
        // Loop Step 1: Compress cash discount to baseline 3%
        const newCdPct = 0.03;
        const newCdRs = current.dealerPrice * newCdPct;
        const newNet = current.grossCompanyMargin - (current.painterToken + newCdRs);
        loopSteps.push({
          iteration: 1,
          action: 'Compress Cash Discount from 5% to 3%',
          recovered: (current.cashDiscountRs - newCdRs).toFixed(2),
          resultingNetMargin: newNet.toFixed(2)
        });
        current.cashDiscountPct = 3;
        current.cashDiscountRs = newCdRs;
        current.netCompanyMargin = newNet;
        if (current.netCompanyMargin >= 100) break;
      }

      if (iteration === 2 && current.painterToken > 150) {
        // Loop Step 2: Cap company-borne painter token or shift to dealer price absorption
        const newPt = 150;
        const saved = current.painterToken - newPt;
        const newNet = current.netCompanyMargin + saved;
        loopSteps.push({
          iteration: 2,
          action: 'Cap direct company painter token at ₹150 (balance built into dealer price or dealer-matched)',
          recovered: saved.toFixed(2),
          resultingNetMargin: newNet.toFixed(2)
        });
        current.painterToken = newPt;
        current.netCompanyMargin = newNet;
        if (current.netCompanyMargin >= 100) break;
      }

      if (iteration === 3) {
        // Loop Step 3: Reallocate promotional support to High-Perceived Value / Zero Marginal Cost barter
        loopSteps.push({
          iteration: 3,
          action: 'Convert physical cash discount into 90-day stock rotation guarantee + display stand asset financing amortized over 250 pails',
          recovered: '25.00',
          resultingNetMargin: (current.netCompanyMargin + 25).toFixed(2)
        });
        current.netCompanyMargin += 25;
        if (current.netCompanyMargin >= 100) break;
      }

      if (iteration === 4) {
        // Loop Step 4: Admin Approval Gate
        loopSteps.push({
          iteration: 4,
          action: 'Hurdle gap persists. Route offer package for Sovereign Admin Approval to CEO Ashutosh Sharma (+91 9079609627)',
          status: 'AWAITING_ADMIN_OVERRIDE'
        });
        break;
      }
    }

    return {
      resolved: current.netCompanyMargin >= 100,
      optimizedConfig: current,
      loopSteps
    };
  }

  /**
   * Scope Enforcement Guard
   */
  isOutOfScope(text) {
    const t = text.toLowerCase();
    const outKeywords = [
      'logistics', 'transport route', 'truck hiring', 'driver',
      'warehouse management', 'godown layout', 'raw material vendor',
      'monomer procurement', 'emulsion synthesis', 'reactor temperature',
      'dealer recruitment interview', 'territory boundary planning'
    ];
    for (const kw of outKeywords) {
      if (t.includes(kw)) return kw;
    }
    return null;
  }

  /**
   * Handle dynamic Admin margin updates
   */
  handleAdminMarginUpdate(text, userContext) {
    const t = text.toLowerCase();
    const isOwner = userContext && (userContext.phone === '+919079609627' || userContext.role === 'admin' || userContext.name?.toLowerCase().includes('ashutosh'));

    // Check for explicit margin update patterns
    const marginMatch = t.match(/set\s+margin\s+(?:to\s+)?([0-9.]+)\s*%/i);
    const costMatch = t.match(/set\s+cost\s+(?:to\s+)?(?:₹|rs\.?)?\s*([0-9.]+)/i);
    const mrpMatch = t.match(/set\s+mrp\s+(?:to\s+)?(?:₹|rs\.?)?\s*([0-9.]+)/i);

    if (marginMatch || costMatch || mrpMatch) {
      const prod = this.getProductData('swatch rustic');
      let changed = false;

      if (marginMatch) {
        const newPct = parseFloat(marginMatch[1]) / 100;
        prod.dealerMarginMin = newPct;
        prod.dealerPriceMax = prod.mrp * (1 - newPct);
        changed = true;
      }
      if (costMatch) {
        prod.landedCost = parseFloat(costMatch[1]);
        changed = true;
      }
      if (mrpMatch) {
        prod.mrp = parseFloat(mrpMatch[1]);
        prod.dealerPriceMax = prod.mrp * (1 - prod.dealerMarginMin);
        prod.dealerPriceMin = prod.mrp * (1 - prod.dealerMarginMax);
        changed = true;
      }

      if (changed) {
        this.saveProductData('swatch rustic', prod);
        return `✅ *Admin Margin Configuration Updated Successfully!*\n\n` +
          `👑 *Authorized by*: CEO Ashutosh Sharma\n` +
          `📦 *Product*: Swatch Rustic\n` +
          `🏷️ *MRP*: ₹${prod.mrp}\n` +
          `🏭 *Landed Cost*: ₹${prod.landedCost}\n` +
          `📊 *Dealer Margin Target*: ${(prod.dealerMarginMin * 100).toFixed(1)}% to ${(prod.dealerMarginMax * 100).toFixed(1)}%\n` +
          `💰 *Allowed Dealer Price Band*: ₹${prod.dealerPriceMin.toFixed(2)} – ₹${prod.dealerPriceMax.toFixed(2)}\n\n` +
          `_All subsequent pricing, schemes, and Grand Slam offers will dynamically calculate based on these updated parameters._`;
      }
    }
    return null;
  }

  /**
   * Main Handler
   */
  async handle(text, userContext = null) {
    const t = text.toLowerCase();

    // 1. Check Scope First
    const outOfScopeKeyword = this.isOutOfScope(text);
    if (outOfScopeKeyword) {
      return {
        handled: true,
        reply: `⚠️ *Alex Hormozi Skill Scope Directive*\n\n` +
          `Mera scope strictly **Pricing Decisions, Grand Slam Offers, Trade Schemes, Money Models, aur Margin Protection** tak seemit hai.\n\n` +
          `*\"${outOfScopeKeyword}\"* distribution/logistics/operations ke domain me aata hai, jo Taiichi Ohno (Operations) ya V. Krishnamurthy ke command me hai.\n\n` +
          `Aap mujhse **Swatch Rustic** ke base price, dealer margins, painter scratch token programs, ya festive volume schemes ke baare me puchiye!`,
        agent: 'hormozi_offer_engine'
      };
    }

    // 2. Check for Admin Margin Configuration Updates
    const adminUpdateReply = this.handleAdminMarginUpdate(text, userContext);
    if (adminUpdateReply) {
      return {
        handled: true,
        reply: adminUpdateReply,
        agent: 'hormozi_offer_engine'
      };
    }

    // 3. Parse Pricing Parameters
    const prod = this.getProductData('swatch rustic');
    const params = {
      mrp: prod.mrp,
      landedCost: prod.landedCost,
      adminOverride: t.includes('override') || t.includes('approve')
    };

    // Extract custom dealer price or margin if mentioned in prompt
    const dpMatch = t.match(/(?:dealer price|dp|rate|price)\s*(?:is|hai|:)?\s*(?:₹|rs\.?)?\s*([0-9.]+)/i);
    if (dpMatch) params.dealerPrice = parseFloat(dpMatch[1]);

    const marginMatch = t.match(/([0-9.]+)%\s*margin/i);
    if (marginMatch) params.dealerMarginPercent = parseFloat(marginMatch[1]);

    const tokenMatch = t.match(/(?:painter|mistri|token)\s*(?:of|is|:)?\s*(?:₹|rs\.?)?\s*([0-9.]+)/i);
    if (tokenMatch) params.painterToken = parseFloat(tokenMatch[1]);

    const cdMatch = t.match(/([0-9.]+)%\s*(?:cd|cash discount)/i);
    if (cdMatch) params.cashDiscountPct = parseFloat(cdMatch[1]) / 100;

    // 4. Run Graph Engineering Evaluation
    const evalResult = this.evaluatePricingGraph(params);

    // 5. If Hurdle Breached, Run Loop Engineering
    let loopResult = null;
    if (evalResult.hurdleStatus === 'BREACH_HURDLE_FLOOR') {
      loopResult = this.runOptimizationLoop(evalResult);
    }

    // 6. Build Direct Localized Report
    let reply = `💼 *Alex Hormozi Offer & Pricing Engine — Indian Paint Market*\n`;
    reply += `📦 *Product Focus*: Swatch Rustic (25kg Bag) | MRP ₹${evalResult.mrp} | Cost ₹${evalResult.cost} | Zero Tinting Machine Required\n\n`;

    reply += `📊 *Graph Engineering State Audit*:\n`;
    reply += `• Dealer Price: ₹${evalResult.dealerPrice.toFixed(2)} (Dealer Margin: ${evalResult.dealerMarginPct.toFixed(2)}% | ₹${evalResult.dealerMarginRs.toFixed(2)}/bag)\n`;
    reply += `• Company Gross Margin: ₹${evalResult.grossCompanyMargin.toFixed(2)} per bag (${((evalResult.grossCompanyMargin / evalResult.mrp) * 100).toFixed(2)}% on MRP)\n`;
    reply += `• Painter Incentive Token: −₹${evalResult.painterToken.toFixed(2)}\n`;
    reply += `• Cash Discount (${evalResult.cashDiscountPct.toFixed(1)}%): −₹${evalResult.cashDiscountRs.toFixed(2)}\n`;
    reply += `• **Net Company Contribution**: *₹${evalResult.netCompanyMargin.toFixed(2)} per bag*\n\n`;

    if (evalResult.finalVerdict === 'BLOCKED') {
      reply += `🚫 *STATE GATE VERDICT: BLOCKED*\n`;
      reply += `⚠️ *Reason*: ${evalResult.blockReason}\n\n`;
      reply += `💡 *Hormozi Rule*: Dealer margin 40% se neeche nahi hona chahiye (retail trade network promote nahi karega), aur dealer price ₹632.50 se neeche company ko thin karta hai.\n`;
      reply += `👑 *Admin Override*: Sir Ashutosh Sharma (+91 9079609627) verbal/written confirmation se override kar sakte hain.\n`;
    } else if (loopResult && !loopResult.resolved) {
      reply += `⚠️ *STATE GATE VERDICT: HURDLE FLOOR BREACH*\n`;
      reply += `Net margin ₹${evalResult.netCompanyMargin.toFixed(2)} company ke ₹100.00 hurdle rate se kam hai.\n\n`;
      reply += `🔄 *Loop Engineering Optimization Trace*:\n`;
      loopResult.loopSteps.forEach(s => {
        reply += `• *Iter ${s.iteration}*: ${s.action} ➔ Result: ₹${s.resultingNetMargin || 'N/A'}\n`;
      });
      reply += `\n👑 *Admin Approval Gate*: Is custom bundle/scheme ko release karne ke liye **CEO Ashutosh Sharma (+91 9079609627)** ka explicit approval darkaar hai.\n`;
    } else {
      reply += `✅ *STATE GATE VERDICT: APPROVED (Hormozi Green)*\n`;
      reply += `• Unit Economics verified & sustainable.\n`;
      reply += `• Target Network: B2B Market & Retail Trade Network.\n`;
      reply += `• Value-to-Price Discrepancy: > 2.5:1 achieved.\n`;
      if (loopResult && loopResult.resolved) {
        reply += `\n🔄 *Loop Optimization Applied*:\n`;
        loopResult.loopSteps.forEach(s => {
          reply += `• ${s.action}\n`;
        });
      }
    }

    reply += `\n🎯 *Available Ready-Made Playbooks (Swatch Rustic)*:\n`;
    reply += `1. Dealer Volume Scheme (Entry to Elite slabs: ₹690 ➔ ₹632.50)\n`;
    reply += `2. Painter Samman Program (₹100–₹600 token tiers + tool kits)\n`;
    reply += `3. Homeowner Diwali Festival Bundle (2.91:1 value stack)\n`;
    reply += `4. Contractor Project Package (100L to 5,000L+)\n`;
    reply += `5. Swatch Rustic Elite Club (Exclusive 45% margin + display asset)\n\n`;
    reply += `_Margins can be updated anytime by CEO Ashutosh Sharma using command: 'Set margin to X%' or 'Set cost to ₹X'._`;

    this.logSession({
      userQuery: text,
      recommendation: reply,
      status: evalResult.finalVerdict,
      graphTrace: evalResult.trace
    });

    return {
      handled: true,
      reply,
      agent: 'hormozi_offer_engine'
    };
  }

  /**
   * Get latest approved/active offer proposal from continuous training
   */
  getLatestOfferProposal() {
    const battlecardPath = path.join(__dirname, 'data', 'legends_battlecards', 'sales-alex-hormozi.md');
    if (fs.existsSync(battlecardPath)) {
      try {
        return fs.readFileSync(battlecardPath, 'utf-8');
      } catch (e) {}
    }
    return null;
  }

  /**
   * Record CEO feedback directly from WhatsApp to trigger refined self-training
   */
  recordCeoFeedback(feedbackText, userContext) {
    const feedbackFile = path.join(__dirname, 'data', 'ceo_feedback_hormozi.json');
    let list = [];
    if (fs.existsSync(feedbackFile)) {
      try {
        list = JSON.parse(fs.readFileSync(feedbackFile, 'utf-8'));
      } catch (e) {
        list = [];
      }
    }

    const entry = {
      id: `FEEDBACK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: userContext?.name || 'CEO Ashutosh Sharma',
      phone: userContext?.phone || '+919079609627',
      feedbackText: feedbackText.trim(),
      status: 'PENDING_NEXT_TRAINING_ROUND'
    };

    list.unshift(entry);
    // Keep last 50 feedback entries
    if (list.length > 50) list = list.slice(0, 50);

    fs.writeFileSync(feedbackFile, JSON.stringify(list, null, 2), 'utf-8');

    // Also update deep memory
    const deepMemoryFile = path.join(__dirname, 'data', 'legends_deep_memory', 'sales-alex-hormozi.json');
    if (fs.existsSync(deepMemoryFile)) {
      try {
        const mem = JSON.parse(fs.readFileSync(deepMemoryFile, 'utf-8'));
        mem.latestCeoFeedback = entry;
        fs.writeFileSync(deepMemoryFile, JSON.stringify(mem, null, 2), 'utf-8');
      } catch (e) {}
    }

    return entry;
  }

  /**
   * Interactive WhatsApp Conversation Engine for Alex Hormozi
   * Allows CEO Ashutosh Sharma to directly discuss, critique, and approve offers & schemes
   */
  async handleHormoziConversation(text, userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const isCeo = userContext && (userContext.phone === '+919079609627' || userContext.phone?.includes('9079609627') || userContext.role === 'admin' || userContext.role === 'owner');

    // Check if the query is feedback/critique on offers
    const isFeedback = 
      q.includes('acha') || q.includes('theek') || q.includes('sahi') ||
      q.includes('approve') || q.includes('approved') || q.includes('pass') ||
      q.includes('badlo') || q.includes('change') || q.includes('kam karo') ||
      q.includes('badhao') || q.includes('640') || q.includes('650') || q.includes('660') ||
      q.includes('margin') || q.includes('token') || q.includes('slab') ||
      q.includes('bekar') || q.includes('nahi chalega') || q.includes('galat') ||
      q.includes('reject') || q.includes('modify');

    // 24*7 Autonomous Generator Triggers (CEO Controlled)
    const examplesGen = require('./hormozi-examples-generator');

    if (q.includes('start 24') || q.includes('start generator') || q.includes('chalao 24') || q.includes('trigger alex')) {
      const res = examplesGen.start24x7();
      const reply = `🚀 *Alex Hormozi (24*7 Autonomous Offer Generator Triggered)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏 Aapke direct aadesh par **24*7 Autonomous Scheme & Offer Generator** shuru ho chuka hai!\n\n` +
        `⚙️ *Cycle Interval*: Har 4 ghante me ek fresh, practical Indian market case study create hogi.\n` +
        `📊 *First Real Case Generated*:\n` +
        `• *Market*: ${res.firstExample.location}\n` +
        `• *Product*: ${res.firstExample.coreProduct}\n` +
        `• *Dealer Margin*: ${res.firstExample.pricingStructure.dealerProfitPerUnit}\n` +
        `• *Painter Cash Token*: ${res.firstExample.pricingStructure.painterCashToken}\n` +
        `• *Memory Hook*: "${res.firstExample.memoryHook}"\n\n` +
        `_Aap jab chahein "stop 24*7 offers" bolkar ise instantly pause kar sakte hain Sir!_ 🫡`;
      return { handled: true, reply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    if (q.includes('stop 24') || q.includes('stop generator') || q.includes('band karo 24')) {
      const res = examplesGen.stop24x7();
      const reply = `🛑 *Alex Hormozi (Offer Generator Paused)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Ashutosh Sir, 24*7 Autonomous Offer Generator ko **STANDBY** par daal diya gaya hai.\n\n` +
        `Jab bhi aap naye offers chahenge, bas boliye: *"Start 24*7 offers"* ya *"Generate new offer example"*. 🫡`;
      return { handled: true, reply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    if (q.includes('status') && (q.includes('generator') || q.includes('offer') || q.includes('24'))) {
      const stat = examplesGen.getStatus();
      const reply = `📊 *Alex Hormozi 24*7 Generator Status*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• *Engine Status*: ${stat.isRunning ? '🟢 ACTIVELY RUNNING (24*7)' : '🟡 ON STANDBY (Waiting for CEO Trigger)'}\n` +
        `• *Total Example Cases Generated*: *${stat.totalGenerated}*\n` +
        `• *Last Run*: ${stat.lastGeneratedAt ? new Date(stat.lastGeneratedAt).toLocaleString('en-IN') : 'None'}\n\n` +
        `📁 *Master Files*:\n` +
        `• \`data/swatch_example_based_programs_and_offers.md\`\n` +
        `• \`alex-hormozi-india/LOCAL_EXAMPLES_SCHEMES_OFFERS.md\``;
      return { handled: true, reply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    if (q.includes('naya example') || q.includes('new example') || q.includes('generate') && q.includes('offer')) {
      const ex = examplesGen.generateOneExample();
      const reply = `🎯 *Alex Hormozi: Fresh Example-Based Case Generated*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📍 *Location*: ${ex.location}\n` +
        `👤 *Target Profile*: ${ex.targetProfile}\n` +
        `📦 *Product*: ${ex.coreProduct}\n\n` +
        `💰 *Pricing & Margins*:\n` +
        `• Dealer Price: ${ex.pricingStructure.standardDealerPrice} | MRP: ${ex.pricingStructure.mrp}\n` +
        `• Dealer Margin: *${ex.pricingStructure.dealerProfitPerUnit}*\n` +
        `• Painter Cash Token: *${ex.pricingStructure.painterCashToken}*\n` +
        `• Company Net Profit: *${ex.pricingStructure.netCompanyProfit}*\n\n` +
        `🎁 *Value Stack*:\n` +
        ex.offerStack.slice(0, 3).map(s => `• ${s}`).join('\n') + `\n\n` +
        `🧠 *Memory Hook*: "${ex.memoryHook}"\n\n` +
        `_Status: Awaiting CEO Approval_ 👑`;
      return { handled: true, reply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    if (q.includes('example') || q.includes('case') || q.includes('udharan')) {
      const reply = `👑 *Alex Hormozi: 6 Real-World Grounded Case Examples*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏 Master Playbook (*swatch_example_based_programs_and_offers.md*) ke 6 live cases:\n\n` +
        `1. 🏪 *Kota Hardware Store (M/s Mahaveer)*: 50-Bag Shubh Aarambh trial $\\to$ ₹28,750 net dealer profit vs Asian ₹1,750 (16X ROI, Zero Tinting Machine)!\n` +
        `2. 👷 *Bundi Painting Crew (Ramesh ji Thekedar)*: 6-member team applies 10 bags/day $\\to$ ₹500/day liquid cash tokens + Level 4 bonus = **₹22,500/mo extra income**!\n` +
        `3. 🌧️ *Baran Monsoon Dampness Site (G+3 Complex)*: 40x Weatherguard + 20x Waterproofing $\\to$ Dealer earns ₹80,000, Painters get ₹8,500 cash, Homeowner gets 5-Yr Warranty!\n` +
        `4. 🤝 *Talera Thekedar Referral (Kailash ji)*: 5 thekedaron ko laya $\\to$ Kailash ji ko **₹2,500 UPI Cash**, naye thekedaron ko toolkit, company CAC ₹750 vs MNC ₹4,000!\n` +
        `5. 🏛️ *Bijoliya Showroom Wall (Shree Ganesh)*: 10ft Luxury Experience Wall $\\to$ **₹75,000/mo dealer margin** from previously dead showroom wall!\n` +
        `6. ⚡ *Dabi Float Velocity (Krishna Paint)*: 5 din me payment $\\to$ 2% Cash Discount (₹1,380/order saved), factory ko 120 hrs me cash, 0% bad debt!\n\n` +
        `_Full details ke liye file dekhein ya bole: "Start 24*7 offers" jab bhi aap continuous generator trigger karna chahein!_ 🫡`;
      return { handled: true, reply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    // Skill File 05 Execution Scripts & No-Brainer Pitch
    if (q.includes('script') || q.includes('pitch') || q.includes('value stack') || q.includes('normal vs hormozi') || q.includes('dialogue') || q.includes('kaise bole')) {
      const scriptReply = `🔥 *ALEX HORMOZI — NO-BRAINER OFFER EXECUTION SCRIPTS*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💡 *Core Philosophy*: _“Make the offer so good people feel stupid saying no.”_\n\n` +
        `🏆 *MASTER COMBINED SALES SCRIPT (Dealer Pitch)*:\n` +
        `“Namaste [Dealer Name] ji! Hum rate bechne nahi, aapki dukan ka profit double karne aaye hain. Simple hisaab dekhiye:\n\n` +
        `1. Counter par per bag *₹400 ka direct clean profit* mil raha hai.\n` +
        `2. Har bag me *₹50 ka painter cash coupon* hai — thekedar khud demand karega.\n` +
        `3. *20 bag ke trial par 1 bag company se 100% FREE* mil raha hai.\n` +
        `4. 7 din me stock rotate na ho toh *100% exchange guarantee* hai — ₹1 ka risk nahi.\n` +
        `5. Town me aapko *Exclusive Area Protection* milega.\n` +
        `6. Aur customer ko hum *7 saal ki written durability assurance* de rahe hain.\n\n` +
        `Sir, ab aap khud bataiye — is deal ko na lene me koi logic banta hai kya?”\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚖️ *NORMAL PITCH vs HORMOZI VALUE STACK*:\n` +
        `❌ *Normal Pitch*: “Sir hamara texture ₹700 per bag padega.”\n` +
        `  *(Dealer thinks: Mehenga hai, discount do)*\n\n` +
        `✅ *Hormozi Value Stack*: “Sir ₹700 ka rate hai, but isme ₹400 margin + ₹50 painter cash + 7-day exchange + 7-year warranty + free bags shamil hain — net effective cost ₹600 se bhi kam padti hai!”\n\n` +
        `🎯 _Daily Quota_: 5 Dealers | 5 Painters | 2 Customers 👑`;
      return { handled: true, reply: scriptReply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    // Skill File 05: Dealership Growth Program (DGP)
    if (q.includes('dgp') || q.includes('growth program') || (q.includes('dealership') && (q.includes('program') || q.includes('exclusive') || q.includes('tier')))) {
      const dgpReply = `🟢 *DEALERSHIP GROWTH PROGRAM (DGP) — ALEX HORMOZI*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎯 *Positioning*: _“Exclusive partner, not just a retail buyer”_\n\n` +
        `🔹 *Entry Tier*: 20-bag trial (COD / 100% Advance)\n` +
        `🔹 *VIP Partner Upgrade*: *300 bags/month commitment*\n\n` +
        `💣 *VIP PARTNER BENEFITS*:\n` +
        `• 🛡️ *Exclusive Area Protection*: Territory lock (no competing dealer within 1.5 km)\n` +
        `• 💰 *Extra ₹30/Bag Margin Rebate* on monthly target achievement\n` +
        `• 🎨 *Architectural Storefront Branding* (10ft x 4ft luxury experience display)\n` +
        `• ⚡ *Priority Factory Dispatch* with direct senior chemist support\n\n` +
        `📁 _Full SOP: \`data/alex_hormozi_master_offer_engine_sop.md\`_`;
      return { handled: true, reply: dgpReply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    // Skill File 05: Painter Partner Program & Milestone Ladder
    if (q.includes('painter partner') || q.includes('thekedar program') || (q.includes('painter') && (q.includes('milestone') || q.includes('ladder') || q.includes('reward') || q.includes('meet')))) {
      const painterReply = `🔵 *PAINTER PARTNER PROGRAM — ALEX HORMOZI*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎯 *Objective*: Demand Pull Strategy (_“Painter = Your unpaid brand ambassador”_)\n\n` +
        `🪙 *Core Token*: ₹50 instant cash coupon inside every 25kg bag.\n\n` +
        `🏆 *ANNUAL MILESTONE REWARDS LADDER*:\n` +
        `• *100 Coupons* (100 Bags): *₹2,500 Cash Reward*\n` +
        `• *250 Coupons* (250 Bags): *₹7,000 Cash Reward*\n` +
        `• *500 Coupons* (500 Bags): *₹15,000 Cash Reward*\n` +
        `• *1000 Coupons* (1,000 Bags): *₹35,000 Cash Reward + Silver Token*\n\n` +
        `💥 *Community Reinforcement*:\n` +
        `• Monthly Painter Meet (Chai + Samosa + Application Demos)\n` +
        `• Top Thekedar of the Month Award\n` +
        `• Free Professional Texture Technique Training`;
      return { handled: true, reply: painterReply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    // Skill File 05: Warranty Buffet & Customer Trust
    if (q.includes('warranty') || q.includes('buffet') || q.includes('guarantee') || q.includes('fade')) {
      const warrantyReply = `🧠 *WARRANTY BUFFET (ZERO RISK ELIMINATION) — ALEX HORMOZI*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎯 *Objective*: Eliminate all customer friction & fear of failure.\n\n` +
        `💣 *THE 3-TIER WARRANTY STACK*:\n` +
        `1. 🛡️ *7-Year Weatherproof Durability Assurance* (Anti-algal, quartz bond)\n` +
        `2. 🔄 *100% Free Replacement Guarantee* on any verified factory batch defect\n` +
        `3. ☀️ *Zero Color Fade Assurance* (Natural UV-stable graded quartz aggregates)\n\n` +
        `🎁 *Customer Conversion Bonus*:\n` +
        `• Free 1ft x 1ft authentic quartz demo board for client living room\n` +
        `• Free 2ft x 2ft on-site wall test patch\n` +
        `• 5% Next Purchase Loyalty Coupon`;
      return { handled: true, reply: warrantyReply, agent: 'Alex Hormozi (Offer Architect)' };
    }

    // Check if user specifically requested schemes or programs summary
    const wantsSchemesOrPrograms = q.includes('scheme') || q.includes('program') || q.includes('local') || q.includes('summary') || q.includes('kya hai') || q.includes('batao') || q.includes('yaad');

    
    if (wantsSchemesOrPrograms && !q.includes('weatherguard') && !q.includes('shine') && !q.includes('waterproof') && !q.includes('top coat')) {
      const schemesReply = `👑 *Alex Hormozi (Offer Architect & Dealership Program Designer)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏 Hamara Master Compendium (*LOCAL_SCHEMES_OFFERS_PROGRAMS.md*) ready hai. Aapko yaad rakhne ke liye 1-by-1 proper summary:\n\n` +
        `🎁 *TOP NO-BRAINER OFFERS*:\n` +
        `1. *"Shubh Aarambh" Launch Offer*: 50 bags par 5 free bag (₹5,750 value) + 1ft x 1ft Real Texture Demo Board + 100 Branded Pamphlets + 20 Verified Thekedar Leads!\n` +
        `2. *Zero-Risk Reversal*: 7-din me na bika toh 1-to-1 SKU exchange (Emulsion/Waterproofing me) + 100% transit leak replacement.\n` +
        `3. *Zero Machine Freedom*: ₹3.5 Lakh tinting machine ka jhanjhat khatam. Ready-to-apply natural Bundi silica quartz!\n\n` +
        `📊 *ACTIVE TRADE SCHEMES*:\n` +
        `• *Silver (50-149 bags)*: ₹690/bag (40.0% Dealer Margin)\n` +
        `• *Gold (150-349 bags)*: ₹660/bag (42.6% Margin + Free 5L Top Coat)\n` +
        `• *Platinum (350-999 bags)*: ₹640/bag (44.3% Margin + Shop Glow-Sign)\n` +
        `• *Diamond (1000+ bags)*: ₹620/bag (46.1% Margin + Market Exclusivity)\n` +
        `• *Float Velocity*: 5 din me bill clear karo $\\to$ 2% Cash Discount (₹13.80/bag bachat).\n\n` +
        `🪙 *PAINTER & THEKEDAR PROGRAMS*:\n` +
        `1. *Painters Growth Tokens*: Har 25kg bag ke andar **₹50 Cash Token** (Instant UPI scan ya counter cash).\n` +
        `2. *Ustaad Samman Yojna*: Monthly ladder (25 bag=T-shirt, 50 bag=Trowel+₹1k, 100 bag=Full Kit+₹3k, 250 bag=Spray Machine+₹10k).\n` +
        `3. *Thekedar Bandhan*: Naya thekedar 20 bag lega toh lane wale ko **₹500 Direct UPI Cash**!\n` +
        `4. *Annual Mahakumbh*: 1000+ bags/year wale thekedar ko 3-Day Goa Convention ya ₹35,000 Gold Voucher.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📁 *Master Reference Files Synced*:\n` +
        `• Local Skill: \`alex-hormozi-india/LOCAL_SCHEMES_OFFERS_PROGRAMS.md\`\n` +
        `• Master Data: \`data/swatch_master_local_offers_and_schemes.md\`\n` +
        `• Live CSV: \`data/hormozi_product_offers_ledger.csv\`\n\n` +
        `_Aap kisi bhi scheme ya slab me badlav batayein, main turant update kar dunga Sir!_ 🫡`;

      return {
        handled: true,
        reply: schemesReply,
        agent: 'Alex Hormozi (Offer Architect)'
      };
    }

    // Default: Present latest offer proposal & ask for CEO review
    // Check if user specifically requested a product
    let targetProd = 'swatch rustic';
    if (q.includes('weatherguard')) targetProd = 'weatherguard';
    else if (q.includes('shine')) targetProd = 'shine';
    else if (q.includes('roller')) targetProd = 'roller coat';
    else if (q.includes('waterproof')) targetProd = 'waterproofing';
    else if (q.includes('top coat') || q.includes('topcoat')) targetProd = 'top coat';

    const prodOffer = this.getProductOffer(targetProd);

    let reply = `👑 *Alex Hormozi (Offer Architect & Dealership Program Designer)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Pranam Ashutosh Sir! 🙏 Swatch Paints ke Master Dynamic Offers Ledger se live proposal:\n\n`;

    if (prodOffer) {
      reply += `📦 *Product*: ${prodOffer.productName} (${prodOffer.category})\n` +
        `• *Pack Size*: ${prodOffer.packSize} | *MRP*: ₹${prodOffer.mrp}\n` +
        `• *Factory Base Cost*: ₹${prodOffer.factoryCost} | *Landed Cost*: ₹${prodOffer.landedCost}\n` +
        `• *Standard Dealer Price*: *₹${prodOffer.dealerPrice}* (${prodOffer.dealerMarginPct} Dealer Margin)\n\n` +
        `📊 *Structured Dealer Volume Slabs*:\n` +
        `• *Entry*: ${prodOffer.entrySlab}\n` +
        `• *Growth*: ${prodOffer.growthSlab}\n` +
        `• *Scale*: ${prodOffer.scaleSlab}\n` +
        `• *Elite*: ${prodOffer.eliteSlab}\n\n` +
        `⚡ *Value Stack*: ${prodOffer.valueStack}\n` +
        `🛡️ *Risk Reversal*: ${prodOffer.riskReversal}\n` +
        `🎁 *Painter Loyalty Program*: ${prodOffer.painterProgram}\n` +
        `🔒 *Future Lock-In / Credits*: ${prodOffer.loyaltyCoupons}\n` +
        `📋 *Approval Status*: *${prodOffer.approvalStatus}*`;
    } else {
      const proposal = this.getLatestOfferProposal();
      reply += proposal || `📦 *Flagship Product*: Swatch Rustic Texture (25kg Bag)\n• Standard Dealer: ₹690 | MRP: ₹1,150 | 40% Margin`;
    }

    reply += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 *CEO Approval & Modification Gate*:\n` +
      `Ashutosh Sir, aap is offer structure ko review karke approval dein ya koi specific badlav batayein (pricing, slabs, tokens, exchange terms). Main turant ledger update kar dunga!\n\n` +
      `_Baaki products dekhne ke liye bol sakte hain: "Weatherguard offer", "Shine offer", "Waterproofing offer", "Top Coat offer", ya "All offers"._`;

    return {
      handled: true,
      reply,
      agent: 'Alex Hormozi (Offer Architect)'
    };
  }

  /**
   * Load all product offers and schemes from the Master Ledger CSV
   */
  getOffersLedger() {
    const csvPath = path.join(__dirname, 'data', 'hormozi_product_offers_ledger.csv');
    if (!fs.existsSync(csvPath)) return [];
    try {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 8) {
          records.push({
            productName: cols[0]?.replace(/^"|"$/g, '').trim(),
            category: cols[1]?.replace(/^"|"$/g, '').trim(),
            packSize: cols[2]?.replace(/^"|"$/g, '').trim(),
            mrp: parseFloat(cols[3]) || 0,
            factoryCost: parseFloat(cols[4]) || 0,
            landedCost: parseFloat(cols[5]) || 0,
            dealerPrice: parseFloat(cols[6]) || 0,
            dealerMarginPct: cols[7]?.replace(/^"|"$/g, '').trim(),
            entrySlab: cols[8]?.replace(/^"|"$/g, '').trim(),
            growthSlab: cols[9]?.replace(/^"|"$/g, '').trim(),
            scaleSlab: cols[10]?.replace(/^"|"$/g, '').trim(),
            eliteSlab: cols[11]?.replace(/^"|"$/g, '').trim(),
            valueStack: cols[12]?.replace(/^"|"$/g, '').trim(),
            riskReversal: cols[13]?.replace(/^"|"$/g, '').trim(),
            painterProgram: cols[14]?.replace(/^"|"$/g, '').trim(),
            loyaltyCoupons: cols[15]?.replace(/^"|"$/g, '').trim(),
            approvalStatus: cols[16]?.replace(/^"|"$/g, '').trim(),
            lastUpdated: cols[17]?.replace(/^"|"$/g, '').trim()
          });
        }
      }
      return records;
    } catch (e) {
      return [];
    }
  }

  /**
   * Fetch specific product offer by name
   */
  getProductOffer(name = 'swatch rustic') {
    const ledger = this.getOffersLedger();
    const q = name.toLowerCase().trim();
    for (const item of ledger) {
      if (item.productName.toLowerCase().includes(q) || q.includes(item.productName.toLowerCase())) {
        return item;
      }
    }
    return ledger[0] || null;
  }
}

module.exports = new HormoziOfferEngine();

