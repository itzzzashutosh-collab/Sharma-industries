/**
 * Brian Tracy Controller — Chief Sales Officer (CSO) & Master Sales Commander
 * Swatch Paints — Sales & Negotiations Division (Legend #02 & Supreme Master Commander)
 * 
 * Enforces the Full Sales Playbook (Team Training Manual), 45-visit daily discipline,
 * real-time pipeline velocity tracking, and the 18-Legend Multi-Agent Decision Engine.
 * 
 * Governing Executive: CEO Ashutosh Sharma (+91 9079609627)
 */

const fs = require('fs');
const path = require('path');

const PLAYBOOK_PATH = path.join(__dirname, 'data', 'swatch_master_sales_playbook.md');
const FIELD_BIBLE_PATH = path.join(__dirname, 'data', 'swatch_salesman_field_bible.md');
const KILLER_SCRIPT_PATH = path.join(__dirname, 'data', 'swatch_dealer_acquisition_killer_script.md');
const SALES_MIND_CONTROL_PATH = path.join(__dirname, 'data', 'swatch_sales_mind_control_system.md');
const USERS_CSV_PATH = path.join(__dirname, 'data', 'users.csv');
const salesTools = require('./sales-tools-suite');

class BrianTracyController {
  constructor() {
    this.name = 'brian_tracy_controller';
    this.legend = 'Brian Tracy';
    this.role = 'Chief Sales Officer (CSO) & Master Sales Playbook Commander';
    this.division = 'Sales & Negotiations Division';
    this.mandate = 'Predictable Sales System, Daily Execution Discipline, and #1 Market Brand Dominance';

    // Auto-bind methods for safe destructuring
    this.handleTracyConversation = this.handleTracyConversation.bind(this);
    this.getSalesMindControlSystemBrief = this.getSalesMindControlSystemBrief.bind(this);
    this.getFullProductBasketBrief = this.getFullProductBasketBrief.bind(this);
    this.getFieldBibleBrief = this.getFieldBibleBrief.bind(this);
    this.getDealerAcquisitionScriptBrief = this.getDealerAcquisitionScriptBrief.bind(this);
    this.getFullPlaybookBrief = this.getFullPlaybookBrief.bind(this);
    this.getDailyCommandBrief = this.getDailyCommandBrief.bind(this);
    this.getExecutionRules = this.getExecutionRules.bind(this);
    this.diagnoseAndDispatch = this.diagnoseAndDispatch.bind(this);
    this.getPipelineSummary = this.getPipelineSummary.bind(this);
  }

  /**
   * Reads and parses registered retail counters for pipeline tracking
   */
  getPipelineSummary() {
    let leads = [];
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
              leads.push({
                name: row['name'] || 'Trade Counter',
                phone: row['phone'] || '',
                role: row['role'] || 'customer',
                stage: row['pipeline_stage'] || 'Contacted',
                dealValue: parseInt(row['deal_value'] || '34500', 10)
              });
            }
          }
        }
      } catch (err) {
        console.error('[Brian Tracy] Error loading pipeline from users.csv:', err.message);
      }
    }

    const summary = {
      totalLeads: leads.length,
      stages: {
        'Cold': { count: 0, totalValue: 0 },
        'Contacted': { count: 0, totalValue: 0 },
        'Qualified': { count: 0, totalValue: 0 },
        'Interested': { count: 0, totalValue: 0 },
        'Negotiation': { count: 0, totalValue: 0 },
        'Closed': { count: 0, totalValue: 0 }
      },
      activePipelineValue: 0,
      wonRevenue: 0
    };

    leads.forEach(l => {
      let stg = l.stage;
      if (!summary.stages[stg]) {
        if (stg.includes('Trial') || stg.includes('Interested')) stg = 'Interested';
        else if (stg.includes('Pending') || stg.includes('Negotiat')) stg = 'Negotiation';
        else if (stg.includes('New') || stg.includes('Contact')) stg = 'Contacted';
        else if (stg.includes('Close') || stg.includes('Won')) stg = 'Closed';
        else stg = 'Qualified';
      }
      if (summary.stages[stg]) {
        summary.stages[stg].count += 1;
        summary.stages[stg].totalValue += l.dealValue;
      }
      if (stg === 'Closed') {
        summary.wonRevenue += l.dealValue;
      } else {
        summary.activePipelineValue += l.dealValue;
      }
    });

    return summary;
  }

  /**
   * Generates Daily Three-Tier Command Briefings (Morning, Mid-Day, Evening)
   */
  getDailyCommandBrief(phase = 'morning') {
    const p = phase.toLowerCase();
    let res = '';

    if (p.includes('morning') || p.includes('subah') || p.includes('start') || p.includes('target')) {
      res += `🌅 *BRIAN TRACY (CSO) — MORNING SALES COMMAND (08:30 IST)*\n`;
      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `🎯 *Mission*: Predictable Sales Discipline & Daily Market Domination!\n\n`;
      res += `📋 *MANDATORY DAILY SALES REP TARGETS*:\n`;
      res += `• 🚶 *45 Dealer Visits* (Strict beat route: 09:00 AM – 06:30 PM)\n`;
      res += `• 🔍 *20 New Prospects* (Hardware, sanitary, building material shops)\n`;
      res += `• 🔄 *15 Active Follow-ups* (Day 3 & Day 5 touches)\n`;
      res += `• 📊 *5 Serious Discussions* (Visual 2-column Yellow Pad ROI presented)\n`;
      res += `• 🤝 *2 Closing Attempts* (Straight Line 20-bag or 50-bag lot PO)\n\n`;
      res += `📍 *PRIORITY ACTION FOR TODAY*:\n`;
      res += `1. Review your 45-counter route map before stepping into the field.\n`;
      res += `2. Carry 5 Swatch Rustic sample boards + Yellow Pad + blue ink pen.\n`;
      res += `3. Lock at least 22 visits before the 13:30 IST mid-day check!\n`;
      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `_“No activity ➔ No pipeline. No pipeline ➔ No sales!”_ 🫡`;
      return res;
    }

    if (p.includes('mid') || p.includes('dopahar') || p.includes('afternoon') || p.includes('check')) {
      res += `☀️ *BRIAN TRACY (CSO) — MID-DAY CHECK & INTERVENTION (13:30 IST)*\n`;
      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `📊 *MID-DAY AUDIT CHECKLIST*:\n`;
      res += `1. *Visit Velocity*: Have you completed at least 22 visits so far?\n`;
      res += `2. *CRM Logging*: Are dealer names, phone numbers, and current brands logged?\n`;
      res += `3. *Field Roadblocks*: Facing pushback on counter?\n\n`;
      res += `🧠 *RAPID DECISION DISPATCH*:\n`;
      res += `• If dealer is uninterested ➔ Call *Neil Rackham (SPIN)* & *Jeremy Miner (NEPQ)*\n`;
      res += `• If dealer asks for discount ➔ Call *Victor Antonio (ROI)* & *Alex Hormozi (Offers)*\n`;
      res += `• If dealer is confused ➔ Call *April Dunford (Positioning)*\n`;
      res += `• If deal is stalled ➔ Call *Keenan (Gap)* & *Jordan Belfort (Closing)*\n\n`;
      res += `_Do not return to base with under 45 visits! Re-engage the beat immediately._ 📈`;
      return res;
    }

    // Default to Evening Report
    res += `🌆 *BRIAN TRACY (CSO) — EVENING ACCOUNTABILITY AUDIT (19:00 IST)*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `📋 *MANDATORY EVENING CLOSING REPORT*:\n`;
    res += `1. *Total Completed Visits* (Target: 45)\n`;
    res += `2. *New Qualified Prospects Added* (Target: 20)\n`;
    res += `3. *Visual ROI Sheets Presented* (Target: 5)\n`;
    res += `4. *Purchase Orders Closed* (Target: 2 Orders / ≥₹69,000 billing)\n`;
    res += `5. *Tomorrow's 15 Follow-ups* scheduled in CRM\n\n`;
    res += `⚖️ *PERFORMANCE AUDIT STANDARD*:\n`;
    res += `• Top Performers (≥₹2L quota) receive 2.5% surplus incentive.\n`;
    res += `• Reps below 35 visits face daily mandatory roleplays & monitoring.\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“Discipline ➔ Pipeline ➔ Sales ➔ Scale ➔ Dominance!”_ 🫡`;
    return res;
  }

  /**
   * The Multi-Legend Decision Engine: Diagnoses counter roadblock and dispatches exact legend
   */
  diagnoseAndDispatch({ issue = '', dealerName = 'Trade Partner' } = {}) {
    const q = (issue || '').toLowerCase().trim();
    const dTrim = (dealerName || 'Trade Partner').trim();
    const cleanName = dTrim.toLowerCase().endsWith('ji') ? dTrim : `${dTrim} ji`;

    let matched = {
      scenario: 'General Counter Resistance',
      legends: 'Neil Rackham (SPIN) + Jordan Belfort (Closing)',
      directive: 'Diagnose the dealer\'s working capital bleed, then move directly to a low-risk 20-bag trial lot.',
      script: `"${cleanName}, hum bada order nahi maang rahe. Sirf 20 bag ka sample display rakhiye, agar 7 din me move na ho toh 100% buyback guarantee hai."`
    };

    if (q.includes('uninterested') || q.includes('interest nahi') || q.includes('sun nahi raha') || q.includes('ignore')) {
      matched = {
        scenario: 'Dealer Uninterested / Cold Resistance',
        legends: 'Neil Rackham (SPIN Selling) + Jeremy Miner (NEPQ)',
        directive: 'Never pitch product features to an uninterested dealer. Ask consequence questions about their current low margin and capital locked in tinting machines.',
        script: `"${cleanName}, Asian Paints bohot bada brand hai, lekin kya sach me 3-5% margin se dukaan ka monthly bijli ka bill aur ladko ka kharcha pura nikal pata hai?"`
      };
    } else if (q.includes('confused') || q.includes('asian') || q.includes('berger') || q.includes('compare') || q.includes('brand')) {
      matched = {
        scenario: 'Dealer Confused / Comparing with MNC Paint Brands',
        legends: 'April Dunford (Positioning & Category Creation)',
        directive: 'Reframe Swatch out of the commodity paint category into the high-margin, zero-tint architectural texture specialty category.',
        script: `"${cleanName}, Asian Paints aapke showroom ka brand standard hai aur unhe wahan rehna bhi chahiye. Lekin Swatch counter par ek separate 40% Net Cash Engine hai jo bina machine ke seedha ₹400/bag profit deta hai!"`
      };
    } else if (q.includes('price') || q.includes('discount') || q.includes('sasta') || q.includes('mehenga') || q.includes('margin')) {
      matched = {
        scenario: 'Price Objection / Discount Push',
        legends: 'Victor Antonio (Financial Selling) + Alex Hormozi (Offer Architect)',
        directive: 'Draw the 2-column visual Yellow Pad comparison immediately. Prove ₹35 margin vs ₹400 margin and 57.97% 30-day ROI.',
        script: `"${cleanName}, price nahi dekhna, net profit dekho. Asian Paints 50 bag pe ₹1,750 bachta hai, Swatch pe seedha ₹20,000 bachta hai. Fark har mahine ₹18,250 ka hai. Dukaan discount se nahi, net munafey se chalti hai!"`
      };
    } else if (q.includes('negotiat') || q.includes('counter') || q.includes('kam karo') || q.includes('daba raha')) {
      matched = {
        scenario: 'Dealer Aggressive Negotiation / Counter-Anchoring',
        legends: 'Chris Voss (Tactical Empathy & Black Swan Negotiation)',
        directive: 'Use calibrated "How" questions and labeling to defend authorized dealer pricing slabs (never quote below official dealer billing tiers).',
        script: `"${cleanName}, lagta hai aapko lag raha hai hum extra margin rakh rahe hain. Lekin aap hi batayiye, agar hum quality aur durability assurance maintain karein, toh hum isse kam me kaise deliver karein?"`
      };
    } else if (q.includes('stuck') || q.includes('delay') || q.includes('sochunga') || q.includes('kal aana') || q.includes('procrastinat')) {
      matched = {
        scenario: 'Deal Stuck / Dealer Procrastination',
        legends: 'Keenan (Gap Selling) + Jordan Belfort (Straight Line Closer)',
        directive: 'Quantify Cost of Inaction (COI) — delay costs ₹18,250 per month. Build 3-Tens certitude and ask for the order.',
        script: `"${cleanName}, har 30 din delay karne par aapki dukaan se ₹18,250 ka seedha loss ho raha hai. Product solid hai, margin audited hai, risk zero hai. 20 bag se shuruat karte hain, gadi aaj dispatch karwaye ya kal?"`
      };
    } else if (q.includes('no lead') || q.includes('leads') || q.includes('pipeline dry') || q.includes('prospect')) {
      matched = {
        scenario: 'Empty Pipeline / No Qualified Leads',
        legends: 'Jeb Blount (Fanatical Prospecting Engine)',
        directive: 'Expand targeting beyond traditional paint shops. Target hardware counters, sanitary stores, tile dealers, architects, and direct building contractors.',
        script: `"${cleanName}, namaste. Hum Hadoti region ke premium architects aur developers ko natural quartz textures supply kar rahe hain. Aapke counter par direct customer footfall badhane ke liye humara starter kit display karna chahte hain."`
      };
    } else if (q.includes('slow growth') || q.includes('tempo') || q.includes('slump') || q.includes('lazy')) {
      matched = {
        scenario: 'Slow Growth / Low Tempo Across Beat',
        legends: 'Grant Cardone (10X Expansion Engine)',
        directive: 'Execute massive action: double daily visit volume to 60 visits, engage 30 prospects, and synchronize +20% warehouse buffer.',
        script: `"Massive Action creates market dominance! 45 visits is the floor, not the ceiling. Over-commit and dominate the territory!"`
      };
    } else if (q.includes('dominate') || q.includes('top dealer') || q.includes('capture') || q.includes('market capture')) {
      matched = {
        scenario: 'Capturing Top Competitor Accounts & Market Domination',
        legends: 'Chet Holmes (Dream 100 Strategy)',
        directive: 'Identify the top 100 highest-volume retail counters in the district. Apply pigheaded discipline with bi-weekly executive follow-ups until won.',
        script: `"${cleanName}, aap poore Kota market ke top 5 dealers me aate hain. Hum aapke counter ko district ka exclusive Swatch Architectural Hub banana chahte hain with full display sponsorship."`
      };
    } else if (q.includes('attitude') || q.includes('phone') || q.includes('mobile') || q.includes('ego')) {
      matched = {
        scenario: 'Dealer Disrespect / Mobile Phone Distraction',
        legends: 'Oren Klaff (Frame Control Engine)',
        directive: 'Hold total silence. Stand as an equal commercial authority. Enforce the 10-minute time constraint and prize frame.',
        script: `"${cleanName}, main dekh raha hu aap calls me busy hain. Swatch ka 40% margin model serious attention demand karta hai. Ya toh hum abhi agle 10 minute focus se discuss karein, ya main kal reschedule kar deta hu. Which works better for you?"`
      };
    } else if (q.includes('credit') || q.includes('payment') || q.includes('udhari') || q.includes('retention') || q.includes('repeat')) {
      matched = {
        scenario: 'Credit Collection & 7-Day Payment Discipline',
        legends: 'Joe Girard (Relationship Manager & Retention Engine)',
        directive: 'Use warm personal relationship, sincere gratitude, and the 7-day payment reminder protocol to collect funds without commercial conflict.',
        script: `"${cleanName}, namaste! Pichla batch thekedaron ne kaisa uthaya? Company billing audit ke mutabiq batch-1 clear hone par batch-2 ka stock instantly dispatch ho jata hai. Account update karwaye ji?"`
      };
    }

    let out = `🧠 *BRIAN TRACY (CSO) — DECISION ENGINE ACTIVATION*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎯 *Scenario Diagnosed*: *${matched.scenario}*\n`;
    out += `⚡ *Specialist Legends Dispatched*: *${matched.legends}*\n\n`;
    out += `📋 *TACTICAL COMMAND DIRECTIVE*:\n`;
    out += `• ${matched.directive}\n\n`;
    out += `💬 *EXACT FIELD SCRIPT (Word-for-Word)*:\n`;
    out += `👉 ${matched.script}\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_“The right legend at the right time closes the deal every single time!”_ 📈`;
    return out;
  }

  /**
   * Return the 5 Golden Execution Rules
   */
  getExecutionRules() {
    let out = `⚡ *BRIAN TRACY — THE 5 GOLDEN SALES EXECUTION RULES*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `1️⃣ *RULE 1: ACTIVITY > TALENT* (“Jo karega wahi bechega”)\n`;
    out += `   • 45 counter visits per day beats lazy genius every single time!\n\n`;
    out += `2️⃣ *RULE 2: FOLLOW-UP = MONEY* (“80% sales follow-up me hoti hai”)\n`;
    out += `   • Day 1 (Visit) ➔ Day 3 (Call) ➔ Day 5 (Visit) ➔ Day 10 (Close).\n\n`;
    out += `3️⃣ *RULE 3: NO RANDOM SELLING* (“Har step structured”)\n`;
    out += `   • Follow the sequence: Connect ➔ Diagnose ➔ Position ➔ Prove Math ➔ Close.\n\n`;
    out += `4️⃣ *RULE 4: DATA > FEELING* (“Numbers decide”)\n`;
    out += `   • How many bags? What margin? When payment? Zero emotional guesswork.\n\n`;
    out += `5️⃣ *RULE 5: SYSTEM > INDIVIDUAL* (“Process follow karo”)\n`;
    out += `   • The Swatch multi-legend system guarantees predictable crores in revenue.\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    return out;
  }

  /**
   * Return full playbook executive briefing
   */
  getFullPlaybookBrief() {
    let out = `📘 *SWATCH PAINTS — FULL SALES PLAYBOOK (TEAM TRAINING MANUAL)*\n`;
    out += `👑 *Governed by*: Brian Tracy (Chief Sales Officer)\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎯 *CORE MISSION*: Predictable System | Daily Execution | #1 Brand\n\n`;
    out += `🔥 *THE 14-STAGE MULTI-LEGEND PIPELINE*:\n`;
    out += `1. Prospecting ➔ *Jeb Blount*\n`;
    out += `2. Qualification ➔ *John McMahon*\n`;
    out += `3. Connection & Trust ➔ *Zig Ziglar & Dale Carnegie*\n`;
    out += `4. Problem Discovery ➔ *Neil Rackham (SPIN)*\n`;
    out += `5. Emotional Persuasion ➔ *Jeremy Miner (NEPQ)*\n`;
    out += `6. Gap Creation ➔ *Keenan (Gap Selling)*\n`;
    out += `7. Category Positioning ➔ *April Dunford*\n`;
    out += `8. Frame Authority ➔ *Oren Klaff*\n`;
    out += `9. Grand Slam Offers ➔ *Alex Hormozi*\n`;
    out += `10. Closing Certainty ➔ *Jordan Belfort*\n`;
    out += `11. Tactical Empathy ➔ *Chris Voss*\n`;
    out += `12. Financial ROI ➔ *Victor Antonio*\n`;
    out += `13. Retention & 7-Day Credit ➔ *Joe Girard*\n`;
    out += `14. 10X Scale ➔ *Grant Cardone*\n`;
    out += `15. Dream 100 Domination ➔ *Chet Holmes*\n`;
    out += `16. Direct Urgency ➔ *Dan Kennedy*\n\n`;
    out += `📋 *DAILY REP MANDATE*: 45 Visits | 20 Prospects | 15 Follow-ups | 5 Serious | 2 Closes\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master Playbook File: \`data/swatch_master_sales_playbook.md\`_ 🫡`;
    return out;
  }

  /**
   * Generates the Swatch Salesman Training Manual (Field Bible) Brief
   */
  getFieldBibleBrief() {
    let out = `📘 *SWATCH SALESMAN TRAINING MANUAL (FIELD BIBLE)*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎖️ *Controlled by*: Brian Tracy (Chief Sales Officer)\n`;
    out += `👑 *Governing Authority*: CEO Ashutosh Sharma (+91 9079609627)\n\n`;
    out += `🎯 *Core Objective*: Har salesman sale leke aaye | Har din new dealers add ho | Har visit ka result ho\n`;
    out += `🧠 *The Golden Rule*: "Sirf baat karna kaam nahi hai — Result lana kaam hai!"\n\n`;
    out += `🔥 *THE 10-STEP GROUND FIELD EXECUTION SYSTEM*:\n`;
    out += `1. 🟡 *ENTRY* (Shop me ghusna) ➔ Oren Klaff & Zig Ziglar (2-minute frame lock)\n`;
    out += `2. 🟢 *RAPPORT* (Guard down) ➔ Dale Carnegie & Zig Ziglar (Local market talk)\n`;
    out += `3. 🔵 *PROBING* (Dard samajhna) ➔ Neil Rackham (SPIN) & Jeremy Miner (NEPQ)\n`;
    out += `4. 🟣 *GAP CREATE* (Shock dena) ➔ Keenan (Gap) & Victor Antonio (3% vs 43% margin)\n`;
    out += `5. 🔴 *SOLUTION PRESENT* ➔ Jordan Belfort (Zero machine, high margin quartz)\n`;
    out += `6. ⚫ *TRUST BUILD* ➔ Robert Cialdini & Zig Ziglar (100+ thekedars proof)\n`;
    out += `7. ⚡ *THE OFFER* ➔ Alex Hormozi & Dan Ariely (20+1 Shubh Aarambh slab)\n`;
    out += `8. 💣 *THE CLOSE* ➔ Jordan Belfort ("Trial ke liye 20 bag dispatch kar dein?")\n`;
    out += `9. ⚠️ *OBJECTION HANDLE* ➔ Chris Voss & NEPQ ("Demand hum create karenge")\n`;
    out += `10. 🔁 *FOLLOW-UP* ➔ Joe Girard & Jeb Blount (Day 1, 2, 3, 7 cadence)\n\n`;
    out += `📋 *DAILY REP MANDATE*: 40–50 Visits | 10 Serious | 3 Strong Follow-ups | 1–2 Orders\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master Field Bible File: \`data/swatch_salesman_field_bible.md\`_ 🫡`;
    return out;
  }

  /**
   * Generates the Swatch Dealer Acquisition Killer Script Brief
   */
  getDealerAcquisitionScriptBrief() {
    let out = `📘 *SWATCH DEALER ACQUISITION KILLER SCRIPT*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎖️ *Controlled by*: Brian Tracy (Chief Sales Officer)\n`;
    out += `👑 *Governing Authority*: CEO Ashutosh Sharma (+91 9079609627)\n\n`;
    out += `🎯 *Core Objective*: Shop me ghuste hi control lena | Mindset shift karna | Profit bechna | 20-bag trial close karna!\n`;
    out += `🧠 *The Core Rule*: "Product mat becho — Profit becho!"\n\n`;
    out += `🔥 *THE PSYCHOLOGICAL CLOSING SYSTEM (STEP-BY-STEP)*:\n`;
    out += `1. 🟡 *ENTRY WITH FRAME CONTROL* (Oren Klaff):\n`;
    out += `   _"Namaste [Name] ji, main Bundi factory se Swatch Paints se hoon. Hum abhi regional market me limited dealers onboard kar rahe hain. 2 minute me check karna tha aap fit ho ya nahi."_\n\n`;
    out += `2. 🟢 *RAPID RAPPORT* (Dale Carnegie + Zig Ziglar):\n`;
    out += `   _"Sir aap kitne time se paint business me ho? Abhi kaunsa brand jyada chal raha hai?"_\n\n`;
    out += `3. 🔵 *PROBLEM UNLOCK* (SPIN + NEPQ):\n`;
    out += `   _"Sir texture me actual margin kitna bachta hai? Machine me kitna investment block hai? Slow moving stock ka issue aata hai kya?"_\n\n`;
    out += `4. 🟣 *GAP ATTACK — REALITY SHOCK* (Keenan + Victor Antonio):\n`;
    out += `   _"Sir aap ₹3–4 lakh machine me laga ke 3–4% kama rahe ho, aur Swatch me bina machine ₹300–₹400 per bag margin hai!"_\n\n`;
    out += `5. 🔴 *POSITION SHIFT* (April Dunford):\n`;
    out += `   _"Sir Swatch paint nahi hai, ye ek Factory-Direct Profit System hai!"_\n\n`;
    out += `6. ⚫ *VALUE STACK* (Alex Hormozi):\n`;
    out += `   _No machine investment + High margin + Fast moving product + ₹50 Painter cash token + Free sample display boards._\n\n`;
    out += `7. ⚡ *SOCIAL PROOF + TRUST* (Robert Cialdini + Zig Ziglar):\n`;
    out += `   _"Sir nearby dealers already shift kar rahe hain aur painters ko bhi product aur token pasand aa raha hai."_\n\n`;
    out += `8. 💣 *MICRO CLOSE — TRIAL* (Jordan Belfort):\n`;
    out += `   _"Sir trial ke liye sirf 20 bag se start karte hain, risk zero hai!"_\n\n`;
    out += `9. ⚠️ *OBJECTION KILL* (Chris Voss + NEPQ):\n`;
    out += `   • *Demand nahi hai*: _"Sir demand company create karegi, aap high profit miss kar rahe ho."_\n`;
    out += `   • *Price high hai*: _"Sir ₹50 extra deke ₹300 extra kamaoge, ye mehenga nahi smart hai."_\n`;
    out += `   • *Soch ke bataunga*: _"Sir koi risk nahi hai, sirf trial karna hai, kal ki factory gadi me dispatch nikalwa doon?"_\n\n`;
    out += `10. 🔥 *FINAL CLOSE*: _"Sir 20 bag note kar deta hoon, delivery kal subah 11 baje tak ho jayegi!"_ (Ask ➔ Don't wait!)\n\n`;
    out += `🔁 *3-Day Follow-Up*: Day 1 Visit ➔ Day 2 Video Call ➔ Day 3 Scheme Close\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master Killer Script File: \`data/swatch_dealer_acquisition_killer_script.md\`_ 🫡`;
    return out;
  }

  /**
   * Generates the Swatch Paints Sales Mind Control System Brief
   */
  getSalesMindControlSystemBrief() {
    let out = `🧠 *BRIAN TRACY (CSO) — SALES MIND CONTROL SYSTEM*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎖️ *Controlled by*: Brian Tracy (Chief Sales Officer)\n`;
    out += `👑 *Governing Authority*: CEO Ashutosh Sharma (+91 9079609627)\n\n`;
    out += `🎯 *Core Objective*: Dealer ko convert karna | Same visit me order lena | Repeat system banana!\n`;
    out += `🧠 *The Core Principle*: "Profit dikhao = Decision lo!"\n\n`;
    out += `🔥 *THE 7-STAGE SALES MIND CONTROL SYSTEM FLOW*:\n`;
    out += `1. 🟡 *STAGE 1: CONTROL ENTRY* (Oren Klaff & Zig Ziglar)\n`;
    out += `   • Task: Strong entry, Authority create, Frame lock ("Bundi factory se limited dealers onboard kar rahe hain, 2 min me check karna hai aap fit ho ya nahi").\n\n`;
    out += `2. 🟢 *STAGE 2: RAPPORT + PROBLEM* (Neil Rackham SPIN & Jeremy Miner NEPQ)\n`;
    out += `   • Task: Dealer ka dard samajhna (machine capex trap, dead stock, 3-4% thin margin).\n\n`;
    out += `3. 🔵 *STAGE 3: GAP ATTACK* (Keenan & Victor Antonio)\n`;
    out += `   • Task: Current loss vs future profit shock (₹3-4L machine = ₹40/bag vs Swatch = ₹300-400/bag clean profit!).\n\n`;
    out += `4. 🟣 *STAGE 4: VALUE STACK* (Alex Hormozi & Jordan Belfort)\n`;
    out += `   • Task: No machine + High margin + ₹50 Painter cash token + Free sample boards + Guaranteed pull.\n\n`;
    out += `5. 🔴 *STAGE 5: OBJECTION DOMINATION* (Chris Voss & Jeremy Miner)\n`;
    out += `   • Task: Resistance todna with Tactical Empathy, Labeling, Mirroring, and No-Oriented questions.\n\n`;
    out += `6. ⚫ *STAGE 6: CLOSE* (Jordan Belfort & Brian Tracy)\n`;
    out += `   • Task: 20-bag trial order lena ("Trial ke liye 20 bag note kar deta hoon, delivery kal subah ho jayegi" + Silent Pause!).\n\n`;
    out += `7. 🔁 *STAGE 7: RETENTION & PAYMENT* (Joe Girard & Jeb Blount)\n`;
    out += `   • Task: Repeat orders (18-day reorder cycle) & strict 7-day payment discipline with 2% CD buffer.\n\n`;
    out += `💥 *THE FINAL RESULT*: Dealer bole: "Trial de do... 20 bag Swatch Rustic bhej do!"\n`;
    out += `⚠️ *Strict Rule*: ❌ Product mat becho | ✔ Profit becho!\n`;
    out += `🎯 *Final Goal*: Har visit = Conversion ya strong follow-up! 👑\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master System Doc: \`data/swatch_sales_mind_control_system.md\`_ 🫡`;
    return out;
  }

  /**
   * Generates the Full 6-Product Commercial Arsenal Brief
   */
  getFullProductBasketBrief() {
    let out = `📦 *SWATCH PAINTS — FULL 6-PRODUCT COMMERCIAL ARSENAL*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `🎖️ *Commander*: Brian Tracy (Chief Sales Officer)\n`;
    out += `👑 *Governing Authority*: CEO Ashutosh Sharma (+91 9079609627)\n\n`;
    out += `🎯 *Sales Directives*: Never limit sales pitches to Rustic Texture alone. Present the complete architectural coating system with official MRP and Dealer Margins!\n\n`;
    out += `1. 🧱 *SWATCH RUSTIC TEXTURE (25kg Bag)*:\n`;
    out += `   • MRP: ₹1,150 | Homeowner Offer: ₹920 (20% Off)\n`;
    out += `   • Authorized Dealer Price: ₹632.50–₹690 (Bulk 50+ Bags: ₹640–₹650)\n`;
    out += `   • Dealer Gross Margin: 40–45% (₹460–₹517.50/bag cash profit)\n`;
    out += `   • Loyalty Hook: ₹50 Cash Token sealed inside every bag for the painter\n`;
    out += `   • Pricing Rule: Strictly defend official dealer tier; zero unapproved discounting\n\n`;
    out += `2. 🎨 *SWATCH ROLLER COAT (25kg Bag)*:\n`;
    out += `   • MRP: ₹1,150 | Homeowner Offer: ₹1,035 (10% Off)\n`;
    out += `   • Authorized Dealer Price: ₹632.50–₹690\n`;
    out += `   • Dealer Gross Margin: 40–45% (₹460–₹517.50/bag cash profit)\n`;
    out += `   • Pitch: Pre-mixed roller application, zero trowel skill required, high application speed\n`;
    out += `   • Pricing Rule: Strictly defend official dealer tier\n\n`;
    out += `3. 🛡️ *SWATCH WEATHERGUARD EXTERIOR EMULSION (20L/10L/4L/1L)*:\n`;
    out += `   • 20L Bucket: MRP ₹4,100 (₹205/L) | Authorized Dealer Price: ₹2,255–₹2,460\n`;
    out += `   • Dealer Net Profit: ₹1,640–₹1,845 per 20L bucket (40–45% Gross Margin)\n`;
    out += `   • Guarantee: 5-Year Weather & Anti-Fungal Shield with UV-blocker polymers\n`;
    out += `   • Pricing Rule: Strictly defend official dealer tier\n\n`;
    out += `4. ✨ *SWATCH SHINE INTERIOR EMULSION (20L/10L/4L/1L)*:\n`;
    out += `   • 20L Bucket: MRP ₹4,100 (₹205/L) | Authorized Dealer Price: ₹2,255–₹2,460\n`;
    out += `   • Dealer Net Profit: ₹1,640–₹1,845 per 20L bucket (40–45% Gross Margin)\n`;
    out += `   • Feature: Washable luxury high-sheen European finish\n`;
    out += `   • Pricing Rule: Strictly defend official dealer tier\n\n`;
    out += `5. 💧 *SWATCH WATERPROOFING SOLUTION (1L/5L/20L)*:\n`;
    out += `   • 5L Can: MRP ₹1,800 (1L: ₹360) | Authorized Dealer Price: ₹900–₹1,000 (₹180–₹200/L)\n`;
    out += `   • Dealer Net Profit: ₹800–₹900 per 5L can (45% Gross Margin)\n`;
    out += `   • Feature: Deep penetrating nano barrier for slabs, parapets, and exterior walls\n\n`;
    out += `6. 💎 *SWATCH TOP COAT CLEAR PROTECTIVE SEALANT (1L/5L)*:\n`;
    out += `   • 5L Can: MRP ₹2,500 (1L: ₹500) | Authorized Dealer Price: ₹1,600–₹1,750 (₹320–₹350/L)\n`;
    out += `   • Dealer Net Profit: ₹750–₹900 per 5L can (40% Gross Margin)\n`;
    out += `   • Feature: Clear gloss protective quartz lock sealant, UV and rain resistant\n\n`;
    out += `🧺 *RECOMMENDED STARTER COMBO BASKET*:\n`;
    out += `• 10 Bags Rustic + 2 Buckets Weatherguard 20L + 2 Buckets Shine 20L + 2 Cans Waterproofing 5L + 2 Cans Top Coat 5L\n`;
    out += `• Dealer Cost: ₹21,940 | Retail Selling Value: ₹37,300\n`;
    out += `• *Net Dealer Profit*: *₹15,360 Cash Profit (41.2% Clean Return)* with ZERO machine capex!\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Master Catalog: \`data/swatch_brand_charter.md\`_ 🫡`;
    return out;
  }

  /**
   * Handle interactive conversation for Brian Tracy
   */
  async handleTracyConversation(text, userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const dealerName = userContext?.name || 'Trade Partner';

    // 000. Full Product Arsenal & Basket Brief
    if (q.includes('products') || q.includes('product catalog') || q.includes('basket') || q.includes('emulsion') || q.includes('weatherguard') || q.includes('waterproofing') || q.includes('top coat') || q.includes('shine emulsion') || q.includes('full catalog') || q.includes('arsenal')) {
      return {
        handled: true,
        reply: this.getFullProductBasketBrief(),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 00. Sales Mind Control System Request
    if (q.includes('sales mind control') || q.includes('mind control sales') || q.includes('7 stage') || q.includes('seven stage') || q.includes('profit dikhao') || (q.includes('sales') && q.includes('mind control'))) {
      return {
        handled: true,
        reply: this.getSalesMindControlSystemBrief(),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 0a. Dealer Acquisition Killer Script Request
    if (q.includes('killer script') || q.includes('acquisition script') || q.includes('dealer acquisition') || q.includes('closing script') || q.includes('dealer pitch') || q.includes('acquisition killer') || (q.includes('dealer') && (q.includes('pitch') || q.includes('killer') || q.includes('closing') || q.includes('script')))) {
      return {
        handled: true,
        reply: this.getDealerAcquisitionScriptBrief(),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 0b. Field Bible Request
    if (q.includes('field bible') || q.includes('bible') || q.includes('salesman manual') || q.includes('field manual') || q.includes('10 step') || q.includes('field training') || q.includes('field script') || q.includes('training bible') || (q.includes('salesman') && (q.includes('training') || q.includes('manual') || q.includes('script') || q.includes('steps')))) {
      return {
        handled: true,
        reply: this.getFieldBibleBrief(),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 1. Full Playbook Request
    if (q.includes('playbook') || q.includes('manual') || q.includes('training manual') || q.includes('sales playbook')) {
      return {
        handled: true,
        reply: this.getFullPlaybookBrief(),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 2. Daily Command Briefs (Morning, Mid-Day, Evening)
    if (q.includes('morning') || q.includes('subah') || q.includes('start beat')) {
      return {
        handled: true,
        reply: this.getDailyCommandBrief('morning'),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }
    if (q.includes('midday') || q.includes('mid-day') || q.includes('dopahar') || q.includes('check')) {
      return {
        handled: true,
        reply: this.getDailyCommandBrief('midday'),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }
    if (q.includes('evening') || q.includes('closing report') || q.includes('shaam') || (q.includes('report') && q.includes('sales'))) {
      return {
        handled: true,
        reply: this.getDailyCommandBrief('evening'),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 3. Execution Rules
    if (q.includes('rule') || q.includes('rulebook') || q.includes('laws') || q.includes('golden rules')) {
      return {
        handled: true,
        reply: this.getExecutionRules(),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 4. Decision Engine Dispatch (Who to Call When)
    if (q.includes('call') || q.includes('dispatch') || q.includes('stuck') || q.includes('uninterested') || q.includes('confused') || q.includes('price') || q.includes('discount') || q.includes('hesitant') || q.includes('objection')) {
      return {
        handled: true,
        reply: this.diagnoseAndDispatch({ issue: text, dealerName }),
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 5. Pipeline Summary
    if (q.includes('pipeline') || q.includes('leads') || q.includes('summary') || q.includes('funnel')) {
      const summary = this.getPipelineSummary();
      const reply = `💼 *BRIAN TRACY (CHIEF SALES OFFICER) — PIPELINE TRACKING*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🫡 Swatch Paints Master Sales Pipeline Status:\n\n` +
        `📊 *Pipeline Funnel Overview*:\n` +
        `• *Total Registered Counters*: ${summary.totalLeads}\n` +
        `• 🟢 *Closed / Won*: ${summary.stages['Closed'].count} Counters (₹${summary.wonRevenue.toLocaleString('en-IN')})\n` +
        `• 🟡 *Negotiation Pending*: ${summary.stages['Negotiation'].count} Counters (₹${summary.stages['Negotiation'].totalValue.toLocaleString('en-IN')})\n` +
        `• 🔵 *Interested / Trial*: ${summary.stages['Interested'].count} Counters (₹${summary.stages['Interested'].totalValue.toLocaleString('en-IN')})\n` +
        `• 🟠 *Qualified*: ${summary.stages['Qualified'].count} Counters\n` +
        `• ⚪ *Contacted / New*: ${summary.stages['Contacted'].count} Counters\n\n` +
        `💰 *Active Pipeline Revenue*: *₹${summary.activePipelineValue.toLocaleString('en-IN')}*\n` +
        `📈 *Realized Won Revenue*: *₹${summary.wonRevenue.toLocaleString('en-IN')}*\n\n` +
        `_All accounts strictly tracked under the 4-touch follow-up system (Day 1, 3, 5, 10)._ 🫡`;
      return { handled: true, reply, agent: 'Brian Tracy (Chief Sales Officer)' };
    }

    // 6. Tool: calculate_instant_quote (Quotation & Dealer ROI Calculator)
    if (q.includes('quote') || q.includes('quotation') || q.includes('roi calculator') || q.includes('order mix') || q.includes('calculate quote')) {
      const isBulkTier = q.includes('bulk') || q.includes('50 bags') || q.includes('tier c');
      const quoteRes = salesTools.calculate_instant_quote({
        items: [
          { product: 'swatch_rustic_texture', quantity: 20 },
          { product: 'swatch_weatherguard', quantity: 4 },
          { product: 'swatch_top_coat', quantity: 2 }
        ],
        dealerName,
        isBulkTier
      });
      return {
        handled: true,
        reply: quoteRes.formattedQuote,
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 7. Tool: inventory_stock_checker (Bundi Factory Stock Query)
    if (q.includes('stock') || q.includes('inventory') || q.includes('factory stock') || q.includes('godown')) {
      let product = 'all';
      if (q.includes('rustic')) product = 'swatch_rustic_texture';
      else if (q.includes('roller')) product = 'swatch_roller_coat';
      else if (q.includes('weatherguard')) product = 'swatch_weatherguard';
      else if (q.includes('shine')) product = 'swatch_shine_emulsion';
      else if (q.includes('waterproof')) product = 'swatch_waterproofing_solution';
      else if (q.includes('top coat')) product = 'swatch_top_coat';

      const stockRes = salesTools.inventory_stock_checker({ product });
      return {
        handled: true,
        reply: stockRes.formattedStatus,
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 8. Tool: whatsapp_cadence_dispatcher (Automated Follow-up Sender)
    if (q.includes('cadence') || q.includes('touchpoint') || q.includes('followup') || q.includes('follow-up') || q.includes('follow up')) {
      let touchpoint = 1;
      if (q.includes('touch 2') || q.includes('day 2') || q.includes('video')) touchpoint = 2;
      else if (q.includes('touch 3') || q.includes('day 3') || q.includes('call')) touchpoint = 3;
      else if (q.includes('touch 4') || q.includes('day 7') || q.includes('revisit')) touchpoint = 4;

      const cadenceRes = salesTools.whatsapp_cadence_dispatcher({
        phone: userContext?.phone || '+919079609627',
        dealerName,
        touchpoint
      });
      return {
        handled: true,
        reply: cadenceRes.formattedMessage,
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // 9. Tool: crm_lead_manager (Live Counter Visit & Pipeline Tool)
    if (q.startsWith('crm') || q.includes('crm add') || q.includes('crm update') || q.includes('update lead') || q.includes('add lead')) {
      const crmRes = salesTools.crm_lead_manager({
        action: q.includes('add') ? 'add' : 'update_stage',
        phone: userContext?.phone || '+919079609627',
        name: dealerName,
        stage: q.includes('negotiation') ? 'Negotiation' : (q.includes('interested') ? 'Interested' : (q.includes('closed') ? 'Closed' : 'Qualified')),
        notes: text
      });
      return {
        handled: true,
        reply: crmRes.formattedResponse,
        agent: 'Brian Tracy (Chief Sales Officer)'
      };
    }

    // Default Briefing
    return {
      handled: true,
      reply: this.getFullPlaybookBrief(),
      agent: 'Brian Tracy (Chief Sales Officer)'
    };
  }
}

module.exports = new BrianTracyController();
