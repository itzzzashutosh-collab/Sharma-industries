/**
 * Philip Kotler Controller — Chief Marketing Strategist (CMO) & Master Execution Commander
 * Swatch Paints — Core Marketing Strategy & Trade Growth Division (Division Supreme Commander)
 * 
 * Enforces the Master Execution War Plan, Ground-Level Action System,
 * Joint Marketing & Sales War Room Cadence (08:30 Morning / 18:00 Evening),
 * and the Dynamic Cross-Legend Decision Dispatch Engine.
 * 
 * Governing Executive: CEO Ashutosh Sharma (+91 9079609627)
 */

const fs = require('fs');
const path = require('path');

const WARPLAN_PATH = path.join(__dirname, 'data', 'swatch_master_execution_war_plan.md');
const MIND_CONTROL_PATH = path.join(__dirname, 'data', 'swatch_marketing_mind_control_system.md');
const USERS_CSV_PATH = path.join(__dirname, 'data', 'users.csv');
const marketingTools = require('./marketing-tools-suite');

class PhilipKotlerController {
  constructor() {
    this.name = 'philip_kotler_controller';
    this.legend = 'Philip Kotler';
    this.role = 'Chief Marketing Strategist (CMO) & Master Execution War Plan Commander';
    this.division = 'Core Marketing Strategy & Trade Growth Division';
    this.mandate = 'Territorial Market Capture, Network Dominance, and Predictable Cash Generation';

    // Auto-bind methods for safe destructuring
    this.getMindControlSystemBrief = this.getMindControlSystemBrief.bind(this);
    this.handleKotlerConversation = this.handleKotlerConversation.bind(this);
    this.getMorningWarRoomBrief = this.getMorningWarRoomBrief.bind(this);
    this.getMidDayExecutionStatus = this.getMidDayExecutionStatus.bind(this);
    this.getEveningWarRoomAnalysis = this.getEveningWarRoomAnalysis.bind(this);
    this.diagnoseAndDispatch = this.diagnoseAndDispatch.bind(this);
    this.getWeeklyWarReview = this.getWeeklyWarReview.bind(this);
    this.getMonthlyDominationPlan = this.getMonthlyDominationPlan.bind(this);
    this.getFullWarPlanBrief = this.getFullWarPlanBrief.bind(this);
  }

  /**
   * Reads and parses registered retail counters from users.csv for war room diagnostics
   */
  getTradeCounters() {
    let counters = [];
    if (fs.existsSync(USERS_CSV_PATH)) {
      try {
        const raw = fs.readFileSync(USERS_CSV_PATH, 'utf-8');
        const lines = raw.trim().split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= headers.length) {
              const row = {};
              headers.forEach((h, idx) => row[h] = cols[idx]);
              counters.push({
                name: row['name'] || 'Retail Counter',
                phone: row['phone'] || '',
                role: row['role'] || 'customer',
                stage: row['pipeline_stage'] || 'Contacted',
                dealValue: parseInt(row['deal_value'] || '34500', 10)
              });
            }
          }
        }
      } catch (err) {
        console.error('[Philip Kotler] Error loading counters from users.csv:', err.message);
      }
    }
    return counters;
  }

  /**
   * Morning War Room Brief (08:30 – 10:00 IST)
   */
  getMorningWarRoomBrief() {
    const counters = this.getTradeCounters();
    return {
      commander: this.legend,
      phase: '🌅 MORNING WAR ROOM (08:30 – 10:00 IST)',
      objective: 'Previous 24h Audit, Corridor Beat Lock, and 15-Minute Lead Dispatch',
      activeLegends: [
        { legend: 'Sergio Zyman', action: 'Revenue run-rate & off-take velocity audit' },
        { legend: 'Mark Ritson', action: 'Territory focus enforcement (150km Bundi corridor)' },
        { legend: 'John McMahon', action: 'MEDDPICC dealer qualification filter' },
        { legend: 'Joe Girard', action: '7-day credit aging audit & dispatch clearance' }
      ],
      mandatoryDirectives: [
        '1. Reconcile yesterday factory dispatches and dealer collections',
        '2. Review incoming digital leads generated overnight via Google Maps, WhatsApp, and social campaigns',
        '3. Route all unassigned leads to local sales reps and nearest authorized dealer (15-Minute SLA)',
        '4. Lock 45-visit daily beat corridor for every field sales executive'
      ],
      registeredCountersCount: counters.length,
      pricingStandards: {
        rustic: 'Authorized Dealer Price: Rs 690/bag | Retail MRP: Rs 1,150/bag (40% Dealer Gross Margin)',
        rollerCoat: 'Authorized Dealer Price: Rs 690/bag | Retail MRP: Rs 1,150/bag (40% Dealer Gross Margin)'
      }
    };
  }

  /**
   * Field & Market Parallel Execution Status (10:00 – 18:00 IST)
   */
  getMidDayExecutionStatus() {
    return {
      commander: this.legend,
      phase: '🚀 FIELD & MARKET PARALLEL EXECUTION (10:00 – 18:00 IST)',
      objective: 'Simultaneous On-Ground Selling and Community Demand Pull',
      salesCadence: {
        rule: '45/20/15/5/2 Metric Rule',
        targetsPerRep: '45 shop visits | 20 new prospects | 15 follow-ups | 5 ROI presentations | 2 closed POs',
        legends: 'Belfort (Scripts) | NEPQ (Questions) | SPIN (Diagnosis) | Keenan (Gap) | Voss (Negotiation)'
      },
      marketingCadence: {
        focus: 'High-visibility storefront saturation & real-time demand pull',
        legends: 'Levinson (Guerrilla stunts) | Patel (Local SEO) | Handley (Stories) | Gunjit (Counter POS) | Ariely (Decoy Slabs)'
      }
    };
  }

  /**
   * Evening War Room Analysis (18:00 – 20:00 IST)
   */
  getEveningWarRoomAnalysis() {
    return {
      commander: this.legend,
      phase: '🌆 EVENING WAR ROOM & ACCOUNTABILITY AUDIT (18:00 – 20:00 IST)',
      objective: 'Reconcile Daily Output, Diagnose Conversion Friction, and Dispatch Executive Briefing',
      activeLegends: [
        { legend: 'Brian Tracy', action: 'Pipeline discipline & 45-visit verification' },
        { legend: 'Sergio Zyman', action: 'Wholesale revenue vs. marketing spend reconciliation' },
        { legend: 'Mark Ritson', action: 'Quarterly milestone pacing & trajectory correction' }
      ],
      reportingProtocol: 'Compile field data into users.csv by 18:30 IST; dispatch 7:00 PM Executive Briefing to Ashutosh Sir (+91 9079609627) via WhatsApp.'
    };
  }

  /**
   * Dynamic Decision Engine (Kotler Control)
   * Diagnoses market friction and dispatches the optimal legend combination
   */
  diagnoseAndDispatch({ symptom, territory = 'Bundi HQ', dealerName = null }) {
    const s = (symptom || '').toLowerCase();
    const targetDealer = dealerName ? `${dealerName} ji` : 'Target Counter';

    if (s.includes('sales') || s.includes('low sales') || s.includes('closing') || s.includes('order')) {
      return {
        symptom: 'Sales Volume Low',
        diagnosis: 'Sales execution bottleneck: Reps failing to close qualified walk-ins or losing prospect certainty.',
        activatedLegends: ['Jordan Belfort (Straight Line 3-Tens)', 'Jeremy Miner (NEPQ)', 'Neil Rackham (SPIN)'],
        immediateDirective: `Mandate Jordan Belfort 3-Tens script retraining for reps in ${territory}. Pivot questioning to NEPQ consequence framing before proposing the 20-bag Shubh Aarambh starter lot.`
      };
    }

    if (s.includes('demand') || s.includes('walk-in') || s.includes('inbound') || s.includes('leads') || s.includes('traffic')) {
      return {
        symptom: 'Inbound Demand Low',
        diagnosis: 'Mental and physical availability deficit: Homeowners and thekedars unaware of Swatch in this micro-market.',
        activatedLegends: ['Neil Patel (Local SEO 3-Pack)', 'Ann Handley (Contractor Stories)', 'Jay Conrad Levinson (Guerrilla Stunts)'],
        immediateDirective: `Deploy 2 live roadside half-wall texture demos within 500m of ${targetDealer}. Geotag 5 project elevation photos on Google Business Profile; broadcast Before/After reels to regional WhatsApp groups.`
      };
    }

    if (s.includes('price') || s.includes('expensive') || s.includes('discount') || s.includes('cheap') || s.includes('margin') || s.includes('mehenga')) {
      return {
        symptom: 'Price Resistance / Push for Discounts',
        diagnosis: 'Improper framing: Prospect evaluating Swatch as cheap commodity putty rather than architectural stone cladding.',
        activatedLegends: ['Dan Ariely (Decoy Choice Architecture)', 'Alex Hormozi (Grand Slam Slabs)', 'Victor Antonio (57.97% Visual ROI)'],
        immediateDirective: `Reframe price using Ariely's Micro-Yield formula: "Sir, aap Rs 50 extra de rahe ho, lekin samne customer se Rs 400 extra kama rahe ho." Present the 3-Tier Decoy Menu (Tier B 20-bag lot +1 bag free). Never give unapproved cash discounts.`
      };
    }

    if (s.includes('credit') || s.includes('payment') || s.includes('overdue') || s.includes('delay') || s.includes('aging')) {
      return {
        symptom: 'Account Overdue (>7 Days)',
        diagnosis: 'Credit risk: Dealer delaying payment beyond the 7-day collection SLA.',
        activatedLegends: ['Joe Girard (7-Day Credit Collection)', 'Warren Buffett (Moat Economics)'],
        immediateDirective: `Enforce Joe Girard's tactical empathy script. Freeze further dispatches to ${targetDealer} until overdue balance is cleared. Remind dealer that paying within 7 days captures the 2% prompt-payment cash discount buffer.`
      };
    }

    if (s.includes('not selling') || s.includes('stagnant') || s.includes('stock') || s.includes('off-take') || s.includes('secondary') || (s.includes('dealer') && s.includes('sell'))) {
      return {
        symptom: 'Dealer Stock Stagnant (Secondary Off-Take Stagnation)',
        diagnosis: 'Primary sale made, but secondary movement stalled: Counter clerks passive and local painters unaware.',
        activatedLegends: ['Sergio Zyman (18-Day Reorder Cycle)', 'Keenan (Gap Loss)', 'Joe Girard (Contractor Relationship)'],
        immediateDirective: `Dispatch field rep to ${targetDealer} at 09:00 AM. Bring 2 local thekedars to the counter, execute a live wet-on-wet trowel demo, and demonstrate the Rs 50 cash token sealed inside every 25kg bag.`
      };
    }

    // Default Strategic Overview
    return {
      symptom: 'General Battlefield GTM Coordination',
      diagnosis: 'Synchronize 12 Marketing Legends and 14 Sales Legends across the approved 150km Bundi corridor.',
      activatedLegends: ['Philip Kotler (CMO)', 'Mark Ritson (Strategy)', 'Brian Tracy (CSO)'],
      immediateDirective: 'Enforce the Master Execution War Plan. Morning War Room at 08:30 IST; 45 visits per sales rep; Evening War Room at 18:00 IST; 19:00 IST Executive Report to Ashutosh Sir.'
    };
  }

  /**
   * Weekly War Review Summary
   */
  getWeeklyWarReview() {
    return {
      commander: this.legend,
      reviewDay: 'Every Monday (08:30 IST)',
      attendees: 'Philip Kotler (CMO), Brian Tracy (CSO), Sergio Zyman (Revenue), Mark Ritson (Strategy)',
      keyCheckpoints: [
        '1. Regional corridor ranking (Bundi, Kota, Talera, Dabi, Baran)',
        '2. Dealer secondary off-take audit (Day 10 stagnation triggers on-site demo)',
        '3. Tier B (20-Bag) Shubh Aarambh slab adoption rate (target >= 75%)',
        '4. Digital CAC and lead-to-order conversion rate with Neil Patel',
        '5. 100% adherence to authorized dealer billing slabs and retail pricing policies'
      ]
    };
  }

  /**
   * Monthly Domination Plan
   */
  getMonthlyDominationPlan() {
    return {
      commander: this.legend,
      quarterlyRoadmap: {
        q1: 'Beachhead Phase: 50 Authorized Dealers, 100 Painters, 200 bags/day across Bundi/Talera/Kota',
        q2: 'Expansion Phase: 150 Authorized Dealers across all 11 Hadoti city markets, 500 bags/day',
        q3: 'Dominance Phase: 300+ Verified Stockists, unshakeable regional category recall'
      },
      scaleLegends: 'Byron Sharp (Physical Availability) | Sergio Zyman (Revenue) | Chet Holmes (Dream 100)'
    };
  }

  /**
   * Master War Plan Brief
   */
  getFullWarPlanBrief() {
    return {
      title: 'SWATCH PAINTS MASTER EXECUTION WAR PLAN',
      commander: 'Philip Kotler (CMO & Supreme Division Commander)',
      coCommander: 'Brian Tracy (CSO & Sales Division Commander)',
      status: 'PENDING_CEO_APPROVAL (File ID: Registered in CEO Approval Gate)',
      coreRule: 'Har activity ka clear marketing + sales purpose hona chahiye; random kaam = banned.',
      dailyCadence: '08:30 Morning War Room -> 10:00-18:00 Field Action -> 18:00 Evening War Room -> 19:00 CEO Report',
      decisionEngine: 'Dynamic symptom-based dispatch covering Sales, Demand, Stagnant Stock, Price Resistance, and Overdue Credit'
    };
  }

  /**
   * Generates the Swatch Paints Marketing Mind Control System Brief
   */
  getMindControlSystemBrief() {
    let out = `🧠 *PHILIP KOTLER (CMO) — MARKETING MIND CONTROL SYSTEM*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎖️ *Controlled by*: Philip Kotler (CMO & Division Commander)\n`;
    out += `👑 *Governing Authority*: CEO Ashutosh Sharma (+91 9079609627)\n\n`;
    out += `🎯 *Core Objective*: Dealer ka dimaag pehle hi influence karna | Demand create karna | Swatch ko preferred brand banana!\n`;
    out += `🧠 *The Core Principle*: "Sale hone se pehle decision hota hai!"\n\n`;
    out += `🔥 *THE 5-STAGE MIND CONTROL SYSTEM FLOW*:\n`;
    out += `1. 🟡 *STAGE 1: AWARENESS BLAST* (Byron Sharp, Jay Conrad Levinson, Neil Patel)\n`;
    out += `   • Tasks: Shop branding (flange boards, stickers), 100m roadside half-wall demos, Local SEO Google 3-Pack saturation.\n\n`;
    out += `2. 🟢 *STAGE 2: PERCEPTION BUILD* (Rory Sutherland, April Dunford)\n`;
    out += `   • Tasks: Premium architectural stone texture framing, category shift to "Factory-Direct Quartz Cladding", real 1ft x 1ft cured sample boards.\n\n`;
    out += `3. 🔵 *STAGE 3: TRUST ENGINE* (Robert Cialdini, Ann Handley)\n`;
    out += `   • Tasks: 100+ Hadoti contractor proof walls, unscripted local thekedar video testimonials, CEO 5-year weather assurance certificates.\n\n`;
    out += `4. 🟣 *STAGE 4: DEMAND CREATION* (Sergio Zyman, Neil Patel)\n`;
    out += `   • Tasks: ₹50 Painter Growth Cash Tokens inside every 25kg Rustic bag, 15-minute digital inbound lead handoff to authorized dealers.\n\n`;
    out += `5. 🔴 *STAGE 5: PRICE PERCEPTION* (Dan Ariely)\n`;
    out += `   • Tasks: Micro-yield framing (₹12/sq.ft. stone durability), Decoy Choice Architecture (20+1 Shubh Aarambh starter lot @ ₹640/bag).\n\n`;
    out += `💥 *THE FINAL RESULT*: Dealer looks up and says: "Customer aur painter dono Swatch maang rahe hain!"\n`;
    out += `⚠️ *Strict Rules*: ❌ Random marketing banned | ❌ Passive branding banned | ✔ Direct demand pull only!\n`;
    out += `🎯 *Final Goal*: Market bole: "SWATCH CHAL RAHA HAI!" 👑\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master System Doc: \`data/swatch_marketing_mind_control_system.md\`_ 🫡`;
    return out;
  }

  /**
   * Interactive Conversation Handler for Kotler War Plan Queries
   */
  handleKotlerConversation(text, user) {
    const q = (text || '').toLowerCase();

    // 0. Marketing Mind Control System
    if (q.includes('mind control') || q.includes('marketing mind') || q.includes('5 stage') || q.includes('five stage') || q.includes('stage 1') || q.includes('awareness blast') || q.includes('perception build') || q.includes('trust engine') || q.includes('demand creation') || q.includes('price perception') || q.includes('sale hone se pehle') || (q.includes('mind') && q.includes('control'))) {
      return {
        handled: true,
        reply: this.getMindControlSystemBrief(),
        agent: 'Philip Kotler (Chief Marketing Strategist)'
      };
    }

    // 1. Morning War Room
    if (q.includes('morning') || q.includes('morning war room') || q.includes('subah') || q.includes('08:30')) {
      const b = this.getMorningWarRoomBrief();
      const reply = `🎖️ *PHILIP KOTLER (CMO) — MORNING WAR ROOM BRIEF*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🫡 Swatch Paints Ground Level Action Plan:\n\n` +
        `⏰ *Phase*: ${b.phase}\n` +
        `🎯 *Objective*: ${b.objective}\n\n` +
        `⚔️ *Active Specialist Legends*:\n` +
        `• *Sergio Zyman*: Revenue run-rate & off-take velocity audit\n` +
        `• *Mark Ritson*: 150km corridor focus (Bundi HQ, Kota, Talera)\n` +
        `• *John McMahon*: MEDDPICC dealer qualification filter\n` +
        `• *Joe Girard*: 7-day payment aging & dispatch clearance\n\n` +
        `📋 *War Directives*:\n` +
        `1. Reconcile yesterday's dispatches & collections\n` +
        `2. Route all incoming overnight leads to dealers & reps (15-Min SLA)\n` +
        `3. Lock 45-visit daily beat corridor for every sales rep\n` +
        `4. Defend official authorized pricing: 100% adherence to approved dealer billing rates!\n\n` +
        `_“Marketing + Sales = Ek Hi System Hai. Random kaam = BANNED!”_ 🫡`;
      return { handled: true, reply, agent: 'Philip Kotler (Chief Marketing Strategist)' };
    }

    // 2. Evening War Room / 7 PM Report
    if (q.includes('evening') || q.includes('evening war room') || q.includes('shaam') || q.includes('18:00') || q.includes('19:00')) {
      const e = this.getEveningWarRoomAnalysis();
      const reply = `🌆 *PHILIP KOTLER (CMO) — EVENING WAR ROOM BRIEF*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🫡 Swatch Paints Evening Accountability Audit:\n\n` +
        `⏰ *Phase*: ${e.phase}\n` +
        `🎯 *Objective*: ${e.objective}\n\n` +
        `⚔️ *Active War Room Legends*:\n` +
        `• *Brian Tracy*: 45-visit pipeline verification & rep discipline\n` +
        `• *Sergio Zyman*: Wholesale revenue billing vs marketing spend audit\n` +
        `• *Mark Ritson*: Quarterly milestone pacing & trajectory correction\n\n` +
        `📱 *Executive Reporting Protocol*:\n` +
        `• 18:30 IST: All salesmen submit digitized visit logs into users.csv\n` +
        `• 19:00 IST Sharp: Comprehensive Daily Executive Report dispatched to Ashutosh Sir (+91 9079609627) on WhatsApp!\n\n` +
        `_Daily Execution Discipline ➔ Weekly Growth ➔ Monthly Domination!_ 🫡`;
      return { handled: true, reply, agent: 'Philip Kotler (Chief Marketing Strategist)' };
    }

    // 3. Weekly War Review
    if (q.includes('weekly') || q.includes('hafta') || q.includes('monday') || q.includes('week review')) {
      const w = this.getWeeklyWarReview();
      const reply = `📅 *PHILIP KOTLER (CMO) — WEEKLY WAR REVIEW*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🫡 Joint Marketing & Sales Weekly Battlefield Audit:\n\n` +
        `⏰ *Schedule*: ${w.reviewDay}\n` +
        `👥 *War Cabinet*: ${w.attendees}\n\n` +
        `🔍 *Key Checkpoints*:\n` +
        `1. Regional corridor ranking (Bundi, Kota, Talera, Dabi, Baran)\n` +
        `2. Dealer secondary off-take audit (Day 10 stagnation demo trigger)\n` +
        `3. Tier B (20-Bag) Shubh Aarambh slab adoption rate (>=75% target)\n` +
        `4. Digital CAC & lead-to-order conversion rate with Neil Patel\n` +
        `5. 100% price discipline (Zero unauthorized price discounting / defend dealer margins)\n\n` +
        `_“Strategy is deciding what NOT to do. We execute with military focus!”_ 🫡`;
      return { handled: true, reply, agent: 'Philip Kotler (Chief Marketing Strategist)' };
    }

    // 4. Monthly Domination Plan / Roadmap
    if (q.includes('monthly') || q.includes('mahina') || q.includes('roadmap') || q.includes('quarterly') || q.includes('q1') || q.includes('q2') || q.includes('q3')) {
      const m = this.getMonthlyDominationPlan();
      const reply = `📆 *PHILIP KOTLER (CMO) — BATTLEFIELD ROADMAP*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🫡 Swatch Paints Regional Domination Blueprint:\n\n` +
        `📍 *Quarter 1 (Entry Phase)*: ${m.quarterlyRoadmap.q1}\n` +
        `📍 *Quarter 2 (Expansion Phase)*: ${m.quarterlyRoadmap.q2}\n` +
        `📍 *Quarter 3 (Dominance Phase)*: ${m.quarterlyRoadmap.q3}\n\n` +
        `🚀 *Scale Engines*: ${m.scaleLegends}\n\n` +
        `_Territory Locked: 150km radius from Bundi HQ across approved city markets!_ 🫡`;
      return { handled: true, reply, agent: 'Philip Kotler (Chief Marketing Strategist)' };
    }

    // 5. Decision Engine Symptom Check
    if (q.includes('sales low') || q.includes('demand low') || q.includes('stagnant') || q.includes('price') || q.includes('expensive') || q.includes('discount') || q.includes('overdue')) {
      const d = this.diagnoseAndDispatch({ symptom: text });
      const reply = `🧠 *PHILIP KOTLER DYNAMIC DECISION DISPATCH*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ *Symptom Detected*: ${d.symptom}\n` +
        `🔍 *Diagnosis*: ${d.diagnosis}\n\n` +
        `⚔️ *Activated Specialist Legends*:\n` +
        d.activatedLegends.map(l => `• ${l}`).join('\n') + `\n\n` +
        `🎯 *Immediate Action Directive*:\n` +
        `${d.immediateDirective}\n\n` +
        `_“Right specialist + Right moment = Guaranteed problem resolution!”_ 🫡`;
      return { handled: true, reply, agent: 'Philip Kotler (Chief Marketing Strategist)' };
    }

    // 6. Tool: generate_social_creative (Brand Visual Asset Creator)
    if (q.includes('creative') || q.includes('generate creative') || q.includes('poster') || q.includes('banner') || q.includes('social post')) {
      let product = 'swatch_rustic_texture';
      if (q.includes('weatherguard')) product = 'swatch_weatherguard';
      else if (q.includes('shine')) product = 'swatch_shine_emulsion';
      else if (q.includes('waterproof')) product = 'swatch_waterproofing_solution';
      else if (q.includes('top coat')) product = 'swatch_top_coat';

      const creativeRes = marketingTools.generate_social_creative({
        title: 'Swatch Paints Trade Campaign',
        product,
        offer: '40–45% Dealer Margin & Zero Capex High-Performance Range',
        platform: q.includes('whatsapp') ? 'whatsapp_status' : (q.includes('facebook') ? 'facebook' : 'instagram')
      });
      return {
        handled: true,
        reply: creativeRes.formattedBrief,
        agent: 'Philip Kotler (Chief Marketing Strategist)'
      };
    }

    // 7. Tool: local_seo_lead_router (Neil Patel 15-Min Lead Gateway)
    if (q.includes('route lead') || q.includes('inbound lead') || q.includes('seo lead') || q.includes('google lead')) {
      const leadRes = marketingTools.local_seo_lead_router({
        customerName: userContext?.name || 'Inbound Contractor',
        customerPhone: userContext?.phone || '+919079609627',
        location: q.includes('kota') ? 'Kota City' : (q.includes('talera') ? 'Talera' : 'Bundi HQ'),
        productInterest: 'Rustic Texture & Exterior Weatherguard'
      });
      return {
        handled: true,
        reply: leadRes.formattedRouting,
        agent: 'Philip Kotler (Chief Marketing Strategist)'
      };
    }

    // 8. Tool: whatsapp_trade_broadcaster (Bulk Vernacular Broadcast Tool)
    if (q.includes('broadcast') || q.includes('trade broadcast') || q.includes('blast') || q.includes('bulk whatsapp')) {
      let campaignType = 'dealer_scheme';
      if (q.includes('painter') || q.includes('token')) campaignType = 'painter_token';
      else if (q.includes('weather') || q.includes('monsoon')) campaignType = 'monsoon_waterproofing';

      const broadcastRes = marketingTools.whatsapp_trade_broadcaster({
        campaignType,
        targetGroup: q.includes('painter') ? 'painters' : 'dealers'
      });
      return {
        handled: true,
        reply: broadcastRes.formattedBroadcast,
        agent: 'Philip Kotler (Chief Marketing Strategist)'
      };
    }

    // 9. Tool: ceo_file_approval_submitter (Auto-Approval Ledger Integration)
    if (q.includes('submit approval') || q.includes('submit file') || q.includes('send for approval') || q.includes('approval request')) {
      const approvalRes = marketingTools.ceo_file_approval_submitter({
        title: 'Master Strategic Execution Directive',
        division: 'Core Marketing Strategy & Trade Growth Division',
        authorLegend: 'Philip Kotler',
        summary: 'Automated strategic campaign and dealer enablement package submitted for CEO review.',
        commercialImpact: 'Accelerates dealer counter conversion in Kota and Bundi corridor.',
        filePath: 'data/swatch_master_execution_war_plan.md'
      });
      return {
        handled: true,
        reply: approvalRes.formattedSubmission,
        agent: 'Philip Kotler (Chief Marketing Strategist)'
      };
    }

    // Default: Master Execution War Plan Overview
    const reply = `⚔️ *SWATCH PAINTS MASTER EXECUTION WAR PLAN*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎖️ *Supreme Commander*: Philip Kotler (CMO)\n` +
      `🎖️ *Co-Commander (Sales)*: Brian Tracy (CSO)\n` +
      `👑 *Governing Executive*: CEO Ashutosh Sharma (+91 9079609627)\n\n` +
      `🎯 *Core Mission*: Market capture, dealer network expansion, counter dominance, and predictable cash growth!\n\n` +
      `⏰ *Daily War Cadence*:\n` +
      `• *08:30 – 10:00*: 🌅 Morning War Room (Diagnosis, Corridor Beat Lock, Lead Routing)\n` +
      `• *10:00 – 18:00*: 🚀 Field Sales (45 visits/rep) + Parallel Ground Marketing (Guerrilla/SEO)\n` +
      `• *18:00 – 20:00*: 🌆 Evening War Room (Output Reconciliation & 19:00 CEO Report)\n\n` +
      `🧠 *Dynamic Decision Engine Activated*:\n` +
      `• If sales low ➔ Jordan Belfort + NEPQ + SPIN\n` +
      `• If demand low ➔ Neil Patel + Ann Handley + Levinson\n` +
      `• If stock stagnant ➔ Sergio Zyman + Keenan + Girard\n` +
      `• If price issue ➔ Dan Ariely + Hormozi + Victor Antonio\n\n` +
      `_“Marketing + Sales = Ek Hi System Hai. Random kaam = BANNED!”_ 🫡`;
    return { handled: true, reply, agent: 'Philip Kotler (Chief Marketing Strategist)' };
  }
}

const controller = new PhilipKotlerController();
module.exports = controller;

