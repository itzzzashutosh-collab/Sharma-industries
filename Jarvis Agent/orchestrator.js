const dataStore = require('./data/data-store');
const sessionMemory = require('./session-memory');
const asyncLogger = require('./memory/async-logger');
const b2bAgent = require('./agents/b2b-agent');
const rmAgent = require('./agents/rm-agent');
const opsAgent = require('./agents/ops-agent');
const hermesBridge = require('./hermes-bridge');
const socialMarketing = require('./social-marketing-controller');
const primeResearch = require('./prime-research-controller');
const hormoziEngine = require('./hormozi-controller');
const brianTracyEngine = require('./brian-tracy-controller');
const belfortEngine = require('./belfort-scripts-controller');
const graphEngine = require('./graph-engine');
const legendsEngine = require('./legends-interactive-engine');
const divisionHub = require('./paperclip-division-hub');
const ceoApproval = require('./ceo-approval-controller');
const nepqMinerEngine = require('./nepq-miner-controller');
const spinRackhamEngine = require('./spin-rackham-controller');
const chrisVossEngine = require('./chris-voss-controller');
const danKennedyEngine = require('./dan-kennedy-controller');
const zigZiglarEngine = require('./zig-ziglar-controller');
const joeGirardEngine = require('./joe-girard-controller');
const johnMcMahonEngine = require('./john-mcmahon-controller');
const keenanGapEngine = require('./keenan-gap-controller');
const jebBlountEngine = require('./jeb-blount-controller');
const chetHolmesEngine = require('./chet-holmes-controller');
const grantCardoneEngine = require('./grant-cardone-controller');
const aprilDunfordEngine = require('./april-dunford-controller');
const orenKlaffEngine = require('./oren-klaff-controller');
const victorAntonioEngine = require('./victor-antonio-controller');
const marketingHub = require('./marketing-team/marketing-hub');
const philipKotlerEngine = require('./philip-kotler-controller');
const twentyBridge = require('./twenty-crm-bridge');





class Orchestrator {
  constructor() {
    this.name = 'Orchestrator';
  }

  getUser(phone) {
    return dataStore.getUser(phone);
  }

  // Handle Admin CRUD commands for Owner / CEO (Ashutosh Sharma)
  async handleAdminCommand(text, user) {
    const q = (text || '').toLowerCase().trim();

    // 0.0 Graph Engine & Human-in-the-Loop Interceptor
    if (q.startsWith('/') || q.startsWith('run ') || q.startsWith('approve ') || q.startsWith('reject ') || q.startsWith('refine ') || q.includes('graph engineering') || q.includes('sales team activate') || q.includes('operations team review') || q.includes('finance team check')) {
      const graphCmd = q.startsWith('/') ? text : `/${text}`;
      const graphRes = await graphEngine.handleCommand(graphCmd, user);
      if (graphRes) {
        return {
          handled: true,
          reply: graphRes.reply,
          agent: 'Hermes Graph Orchestrator'
        };
      }
    }

    // 0.001 Multi-Division Paperclip Worker Hub Interceptor
    if (q === 'divisions' || q === 'divisions status' || q === 'paperclip divisions' || q === 'teams' || q === 'teams status' || q === 'legends status') {
      return {
        handled: true,
        reply: divisionHub.formatStatusBriefing(),
        agent: 'Orchestrator (Execution Leader)'
      };
    }

    if (q.startsWith('division run') || q.startsWith('team run')) {
      const parts = text.split(/\s+/);
      const divName = parts[2];
      const taskText = parts.slice(3).join(' ') || 'Standard division operations review';
      const div = divisionHub.getDivision(divName);
      if (!div) {
        return {
          handled: true,
          reply: `⚠️ Division "${divName}" not recognized. Valid divisions: sales, operations, finance, vision, branding, social, hr, research.`,
          agent: 'Orchestrator (Execution Leader)'
        };
      }
      const task = await divisionHub.delegateTaskToDivision({
        divisionId: div.id,
        title: taskText,
        description: taskText,
        priority: 'high',
        userContext: user
      });
      return {
        handled: true,
        reply: `⚡ *TASK DELEGATED TO ${div.name.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🆔 *Task ID*: \`${task.id}\`\n👤 *Assigned Lead*: ${task.assignedLegend}\n📝 *Task*: "${task.title}"\n\n_Paperclip worker pool actively executing. Output will be submitted to CEO Approval Gate upon completion._ 🫡`,
        agent: 'Orchestrator (Execution Leader)'
      };
    }

    // 0.002 CEO Sovereign File Approvals Interceptor
    if (q === 'pending files' || q === 'files pending' || q === 'approvals' || q === 'pending approvals' || q === 'file approvals' || q === 'files') {
      return {
        handled: true,
        reply: ceoApproval.formatPendingBriefing(user),
        agent: 'Hermes CEO Approval Desk'
      };
    }

    if (q.startsWith('approve file') || q.startsWith('approve doc')) {
      const fileId = text.split(/\s+/)[2];
      const res = ceoApproval.approveFile(fileId, user.phone, 'Approved via WhatsApp by CEO Ashutosh Sharma');
      const reply = res.success 
        ? `✅ *HERMES CEO APPROVAL CONFIRMED*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${res.message}\n\n_File status updated to \`APPROVED_BY_CEO\` and operationalized in live field execution._ 🫡`
        : `⚠️ *HERMES NOTICE*: ${res.message}`;
      return { handled: true, reply, agent: 'Hermes CEO Approval Desk' };
    }

    if (q.startsWith('reject file') || q.startsWith('reject doc')) {
      const parts = text.split(/\s+/);
      const fileId = parts[2];
      const reason = parts.slice(3).join(' ') || 'Requires revision per CEO instructions';
      const res = ceoApproval.rejectFile(fileId, user.phone, reason);
      const reply = res.success 
        ? `🛑 *HERMES REJECTION LOGGED*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${res.message}\n\n_File status updated to \`REJECTED_NEEDS_REVISION\`. Orchestrator (Leader) notified for re-work._ 🫡`
        : `⚠️ *HERMES NOTICE*: ${res.message}`;
      return { handled: true, reply, agent: 'Hermes CEO Approval Desk' };
    }

    // 0.003 Twenty CRM Interceptor & Sync Gateway
    if (q === 'twenty status' || q === 'crm status' || q === 'twenty crm' || q === 'crm bridge') {
      const summary = await twentyBridge.getStatusSummary();
      return {
        handled: true,
        reply: summary,
        agent: 'Hermes Twenty CRM Bridge'
      };
    }

    if (q === 'sync crm' || q === 'twenty sync' || q === 'crm sync') {
      const syncRes = await twentyBridge.syncAllToTwenty();
      const reply = `🔄 *TWENTY CRM RECONCILIATION COMPLETED*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${syncRes.statusMessage}\n\n• *Records Processed*: ${syncRes.recordsCount} Active Accounts\n• *Target Server*: \`http://localhost:3000\`\n• *Database*: Supabase PostgreSQL\n\n_All profiles across Dealers, Builders, Architects & Designers are unified._ 🫡`;
      return {
        handled: true,
        reply,
        agent: 'Hermes Twenty CRM Bridge'
      };
    }

    if (q.startsWith('crm search') || q.startsWith('search crm')) {
      const searchQuery = text.replace(/^(crm search|search crm)/i, '').trim();
      if (!searchQuery) {
        return {
          handled: true,
          reply: '🔍 *CRM SEARCH*: Kripya search query enter karein (e.g. `crm search Kota` ya `crm search architect Bundi`).',
          agent: 'Hermes Twenty CRM Bridge'
        };
      }
      const results = await twentyBridge.searchPanIndiaDatabase(searchQuery, 'all', 5);
      if (results.length === 0) {
        return {
          handled: true,
          reply: `🔍 *CRM SEARCH*: "${searchQuery}" ke liye koi record nahi mila.`,
          agent: 'Hermes Twenty CRM Bridge'
        };
      }
      let reply = `🔍 *PAN-INDIA CRM SEARCH RESULTS* ("${searchQuery}"):\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      results.forEach((r, idx) => {
        reply += `${idx + 1}. *[${r.category}]* ${r.name || r.firm}\n`;
        reply += `   • 📍 City: ${r.city} | 📞 Phone: ${r.phone}\n`;
        reply += `   • 📝 Details: ${r.details || r.firm}\n\n`;
      });
      reply += `_Total PAN-India Database: 1.14M Accounts Connected._ 🫡`;
      return {
        handled: true,
        reply,
        agent: 'Hermes Twenty CRM Bridge'
      };
    }

    // Delete protection: Prohibited for Founder (reserved exclusively for CEO Ashutosh)
    if (q.startsWith('delete') || q.startsWith('remove') || q.startsWith('drop') || q.startsWith('hata do')) {
      if (user?.role === 'founder') {
        return {
          handled: true,
          reply: '⚠️ *Pranam Suresh Sir* — Company audit & security policy ke mutabiq database ya users delete karne ka right sirf CEO Ashutosh Sir (+91 9079609627) ke pass reserved hai. Aap reports, CRM directory aur baaki sabhi operations view/manage kar sakte hain.',
          agent: 'Hermes Executive Core'
        };
      }
    }

    // 0.00 Alex Hormozi Interactive Offers & Schemes Conversation Engine & CEO Feedback Gate
    const isHormoziQuery = 
      q.includes('hormozi') || 
      q.includes('alex') || 
      (q.includes('scheme') && !q.includes('pdf')) || 
      (q.includes('offer') && !q.includes('pdf')) || 
      q.includes('dealer slab') || 
      q.includes('dealer slabs') || 
      q.includes('pricing offer') || 
      (q.includes('pricing') && (q.includes('batao') || q.includes('kya hai') || q.includes('dikhao') || q.includes('offers') || q.includes('schemes'))) ||
      (q.includes('token') && (q.includes('painter') || q.includes('kya hai') || q.includes('growth') || q.includes('scheme')));

    const isHormoziFeedback = 
      user && (user.role === 'admin' || user.role === 'owner' || user.phone === '+919079609627' || user.phone?.includes('9079609627')) &&
      (q.includes('ye offer') || q.includes('offer acha') || q.includes('offer theek') || q.includes('offer sahi') || q.includes('offer bekar') || q.includes('offer change') || q.includes('pricing change') || q.includes('slab change') || (q.includes('640') && q.includes('650')) || (q.includes('token') && (q.includes('badhao') || q.includes('kam'))));

    if (isHormoziQuery || isHormoziFeedback) {
      return await hormoziEngine.handleHormoziConversation(text, user);
    }

    // 0.0001 Brian Tracy CSO Master Sales Playbook & Decision Engine
    const isTracyQuery = 
      q.includes('brian tracy') || 
      q.includes('brian') || 
      q.includes('field bible') || 
      q.includes('salesman manual') || 
      q.includes('field manual') || 
      q.includes('field training') || 
      q.includes('field script') || 
      q.includes('killer script') || 
      q.includes('acquisition script') || 
      q.includes('dealer acquisition') || 
      q.includes('dealer killer') || 
      q.includes('dealer pitch') || 
      q.includes('closing script') || 
      q.includes('sales mind control') || 
      q.includes('mind control sales') || 
      q.includes('7 stage sales') || 
      q.includes('seven stage sales') || 
      q.includes('profit dikhao') || 
      q.includes('playbook') || 
      q.includes('training manual') || 
      q.includes('sales manual') || 
      q.includes('chief sales officer') || 
      q.includes('cso') || 
      q.includes('morning brief') || 
      q.includes('morning command') || 
      q.includes('midday check') || 
      q.includes('mid-day check') || 
      q.includes('sales rules') || 
      q.includes('execution rules') || 
      q.includes('who to call') || 
      q.includes('decision engine') || 
      (q.includes('tracy') && (q.includes('sales') || q.includes('pipeline') || q.includes('target') || q.includes('sop') || q.includes('cadence') || q.includes('dispatch'))) ||
      q.includes('closing cadence') || 
      q.includes('sales sop') || 
      q.includes('pipeline summary') || 
      (q.includes('pipeline') && (q.includes('leads') || q.includes('status') || q.includes('dikhao') || q.includes('batao')));

    if (isTracyQuery) {
      return await brianTracyEngine.handleTracyConversation(text, user);
    }

    // 0.0002 Jordan Belfort Straight Line Closer & Scripts Engine
    const isBelfortQuery = 
      q.includes('belfort') || 
      q.includes('jordan') || 
      q.includes('straight line') || 
      (q.includes('script') && (q.includes('sales') || q.includes('dealer') || q.includes('pitch') || q.includes('objection') || q.includes('close') || q.includes('generate') || q.includes('24*7') || q.includes('24x7'))) ||
      q.includes('three 10') || 
      q.includes('3 10');

    if (isBelfortQuery) {
      return await belfortEngine.handleBelfortConversation(text, user);
    }

    // 0.0003 Jeremy Miner NEPQ Refinement Engine & Question Architect
    const isNEPQQuery = 
      q.includes('nepq') || 
      q.includes('jeremy miner') || 
      q.includes('miner') || 
      q.includes('questioning') || 
      q.includes('optimize script') || 
      q.includes('comfort close') ||
      (q.includes('question') && (q.includes('script') || q.includes('objection') || q.includes('sop') || q.includes('nepq')));

    if (isNEPQQuery) {
      return await nepqMinerEngine.handleNEPQConversation(text, user);
    }

    // 0.0004 Neil Rackham SPIN Selling & Deep Diagnosis Engine
    const isSPINQuery = 
      q.includes('spin') || 
      q.includes('rackham') || 
      q.includes('neil') || 
      q.includes('deep diagnosis') || 
      q.includes('pain monetization') || 
      q.includes('implication') || 
      q.includes('need payoff') || 
      (q.includes('loss') && (q.includes('calculate') || q.includes('rupee') || q.includes('hisaab') || q.includes('bleed')));

    if (isSPINQuery) {
      return {
        handled: true,
        reply: spinRackhamEngine.handleSpinConversation(text),
        agent: 'Neil Rackham (SPIN Selling Engine)'
      };
    }

    // 0.0005 Chris Voss Tactical Empathy & Dynamic Negotiation Engine (Physical Reps & Deal Protection)
    const isVossQuery = 
      q.includes('voss') || 
      q.includes('negotiat') || 
      q.startsWith('objection') || 
      q.startsWith('negotiate') || 
      (q.includes('objection') && (q.includes('dealer') || q.includes('price') || q.includes('demand') || q.includes('soch') || q.includes('brand') || q.includes('handle') || q.includes('kill') || q.includes('coach') || q.includes('domination') || q.includes('control'))) ||
      q.includes('tactical empathy') || 
      q.includes('accusation audit') || 
      q.includes('labeling') || 
      q.includes('mirroring') || 
      q.includes('calibrated question') || 
      q.includes('objection handle') || 
      q.includes('objection domination') || 
      q.includes('objection control') || 
      q.includes('dynamic negotiation') || 
      q.includes('no-oriented') || 
      q.includes('silence power') || 
      q.includes('late night voice') || 
      (q.includes('discount') && (q.includes('mat do') || q.includes('nahi dena') || q.includes('protect') || q.includes('maang raha')));

    if (isVossQuery) {
      return {
        handled: true,
        reply: chrisVossEngine.handleVossConversation(text, user),
        agent: 'Chris Voss (Negotiation Engine)'
      };
    }

    // 0.0006 Dan Kennedy Urgency & Direct Response Engine (Decision Trigger)
    const isKennedyQuery = 
      q.includes('kennedy') || 
      q.includes('urgency') || 
      q.includes('scarcity') || 
      q.includes('deadline') || 
      q.includes('fomo') || 
      q.includes('direct response') || 
      q.includes('decision trigger') || 
      (q.includes('soch') && (q.includes('bataunga') || q.includes('ke batate'))) || 
      (q.includes('delay') && (q.includes('todna') || q.includes('excuse') || q.includes('rokna')));

    if (isKennedyQuery) {
      return {
        handled: true,
        reply: danKennedyEngine.handleKennedyConversation(text, user),
        agent: 'Dan Kennedy (Urgency & Direct Response Engine)'
      };
    }

    // 0.0007 Zig Ziglar Trust Engine & Long-Term Relationship System
    const isZiglarQuery = 
      q.includes('ziglar') || 
      q.includes('zig ziglar') || 
      q.includes('trust engine') || 
      (q.includes('relationship') && !q.includes('relationship manager')) || 
      q.includes('integrity') || 
      q.includes('honesty') || 
      (q.includes('bharosa') && !q.includes('har deewar')) || 
      q.includes('vishwaas') || 
      (q.includes('doubt') && (q.includes('dealer') || q.includes('painter') || q.includes('clear')));

    if (isZiglarQuery) {
      return {
        handled: true,
        reply: zigZiglarEngine.handleZiglarConversation(text, user),
        agent: 'Zig Ziglar (Trust Engine)'
      };
    }

    // 0.0008 Joe Girard Relationship Manager & Retention Payment Engine
    const isGirardQuery = 
      q.includes('girard') || 
      q.includes('joe girard') || 
      q.includes('relationship manager') || 
      q.includes('retention') || 
      q.includes('repeat order') || 
      q.includes('reorder') || 
      q.includes('law of 250') || 
      (q.includes('payment') && (q.includes('reminder') || q.includes('cadence') || q.includes('discipline') || q.includes('cycle') || q.includes('7 day') || q.includes('day 4') || q.includes('day 7') || q.includes('overdue') || q.includes('delay'))) || 
      (q.includes('collection') && (q.includes('credit') || q.includes('payment') || q.includes('dealer')));

    if (isGirardQuery) {
      return {
        handled: true,
        reply: joeGirardEngine.handleGirardConversation(text, user),
        agent: 'Joe Girard (Relationship Manager & Retention Engine)'
      };
    }

    // 0.0009 John McMahon Target Dealer Qualification Engine (MEDDPICC)
    const isMcMahonQuery = 
      q.includes('mcmahon') || 
      q.includes('john mcmahon') || 
      q.includes('qualification') || 
      q.includes('qualify') || 
      q.includes('meddpicc') || 
      q.includes('scorecard') || 
      q.includes('target dealer') || 
      q.includes('icp') || 
      (q.includes('filter') && (q.includes('dealer') || q.includes('customer') || q.includes('target'))) || 
      (q.includes('search') && (q.includes('dealer') || q.includes('target') || q.includes('counter')));

    if (isMcMahonQuery) {
      return {
        handled: true,
        reply: johnMcMahonEngine.handleMcMahonConversation(text, user),
        agent: 'John McMahon (Qualification Engine)'
      };
    }

    // 0.0010 Keenan Gap Selling Engine (Loss Calculator + Decision Accelerator)
    const isKeenanQuery = 
      q.includes('keenan') || 
      q.includes('gap selling') || 
      q.includes('gap') || 
      q.includes('loss calculator') || 
      q.includes('current state') || 
      q.includes('future state') || 
      q.includes('yearly loss') || 
      q.includes('bleed') || 
      (q.includes('loss') && (q.includes('dealer') || q.includes('kitna') || q.includes('dikhao') || q.includes('calculate'))) || 
      (q.includes('refine') && (q.includes('script') || q.includes('pitch') || q.includes('number')));

    if (isKeenanQuery) {
      return {
        handled: true,
        reply: keenanGapEngine.handleKeenanConversation(text, user),
        agent: 'Keenan (Gap Selling Engine)'
      };
    }

    // 0.0011 Jeb Blount Bulk Network Prospecting Engine
    const isBlountQuery = 
      q.includes('blount') || 
      q.includes('jeb blount') || 
      q.includes('prospecting') || 
      q.includes('prospect') || 
      q.includes('pipeline') || 
      q.includes('architect') || 
      q.includes('interior designer') || 
      q.includes('builder') || 
      q.includes('developer') || 
      q.includes('multi-touch') || 
      q.includes('multi touch') || 
      (q.includes('bulk') && (q.includes('distributor') || q.includes('order') || q.includes('lead') || q.includes('buyer')));

    if (isBlountQuery) {
      return {
        handled: true,
        reply: jebBlountEngine.handleBlountConversation(text, user),
        agent: 'Jeb Blount (Prospecting Engine)'
      };
    }

    // 0.0012 Chet Holmes Dream 100 Strategy & Market Domination Engine
    const isChetQuery = 
      q.includes('chet') || 
      q.includes('holmes') || 
      q.includes('dream 100') || 
      q.includes('dream100') || 
      q.includes('market domination') || 
      q.includes('domination') || 
      q.includes('sales growth') || 
      q.includes('growth plan') || 
      q.includes('top dealer') || 
      q.includes('top 100') || 
      q.includes('top player') || 
      q.includes('top 1') || 
      q.includes('rank 1') || 
      (q.includes('sales') && (q.includes('data') || q.includes('analyze') || q.includes('analysis') || q.includes('predictable')));

    if (isChetQuery) {
      return {
        handled: true,
        reply: chetHolmesEngine.handleChetConversation(text, user),
        agent: 'Chet Holmes (Dream 100 & Market Domination Engine)'
      };
    }

    // 0.0013 Grant Cardone 10X Expansion & Aggressive Scale Engine
    const isCardoneQuery = 
      q.includes('cardone') || 
      q.includes('grant cardone') || 
      q.includes('10x') || 
      q.includes('ten x') || 
      q.includes('massive action') || 
      q.includes('expansion engine') || 
      q.includes('aggressive') || 
      q.includes('scale') || 
      q.includes('production sync') || 
      q.includes('inventory buffer') || 
      (q.includes('production') && (q.includes('demand') || q.includes('capacity') || q.includes('buffer') || q.includes('align') || q.includes('sync')));

    if (isCardoneQuery) {
      return {
        handled: true,
        reply: grantCardoneEngine.handleCardoneConversation(text, user),
        agent: 'Grant Cardone (10X Expansion Engine)'
      };
    }

    // 0.0014 April Dunford Positioning & Category Creation Engine
    const isDunfordQuery = 
      q.includes('dunford') || 
      q.includes('april dunford') || 
      q.includes('positioning') || 
      q.includes('position') || 
      q.includes('category') || 
      q.includes('differentiation') || 
      q.includes('perception') || 
      q.includes('asian paints') || 
      (q.includes('compare') && (q.includes('paint') || q.includes('dealer') || q.includes('asian') || q.includes('brand'))) || 
      (q.includes('reframe') && (q.includes('paint') || q.includes('commodity') || q.includes('machine')));

    if (isDunfordQuery) {
      return {
        handled: true,
        reply: aprilDunfordEngine.handleDunfordConversation(text, user),
        agent: 'April Dunford (Positioning & Category Engine)'
      };
    }

    // 0.0015 Oren Klaff Frame Control & Status Elevation Engine
    const isKlaffQuery = 
      q.includes('klaff') || 
      q.includes('oren klaff') || 
      q.includes('frame control') || 
      q.includes('frame') || 
      q.includes('power frame') || 
      q.includes('prize frame') || 
      q.includes('time frame') || 
      q.includes('intrigue frame') || 
      q.includes('status elevation') || 
      q.includes('authority') || 
      (q.includes('dealer') && (q.includes('attitude') || q.includes('phone') || q.includes('ignore') || q.includes('ego')));

    if (isKlaffQuery) {
      return {
        handled: true,
        reply: orenKlaffEngine.handleKlaffConversation(text, user),
        agent: 'Oren Klaff (Frame Control Engine)'
      };
    }

    // 0.0016 Victor Antonio Financial Selling Engine & ROI Closer (Numbers-Based Closing System)
    const isAntonioQuery = 
      q.includes('victor') || 
      q.includes('antonio') || 
      q.includes('financial selling') || 
      q.includes('roi') || 
      q.includes('return on investment') || 
      q.includes('numbers-based') || 
      q.includes('profit sheet') || 
      q.includes('yellow pad') || 
      q.includes('cost of inaction') || 
      q.includes('coi') || 
      (q.includes('profit') && (q.includes('calculation') || q.includes('gap') || q.includes('disparity') || q.includes('35 vs 400') || q.includes('margin'))) || 
      (q.includes('balance') && q.includes('sheet')) || 
      (q.includes('dealer') && (q.includes('calculation') || q.includes('roi') || q.includes('kitna bachega') || q.includes('munafa')));

    if (isAntonioQuery) {
      return {
        handled: true,
        reply: victorAntonioEngine.handleVictorConversation(text, user),
        agent: 'Victor Antonio (Financial Selling Engine)'
      };
    }

    // 0.00165 Philip Kotler Master Execution War Plan & Command Engine
    const isKotlerWarPlanQuery = 
      q.includes('war plan') || 
      q.includes('warplan') || 
      q.includes('execution war plan') || 
      q.includes('master execution') || 
      q.includes('ground level action') || 
      q.includes('morning war room') || 
      q.includes('evening war room') || 
      q.includes('weekly war review') || 
      q.includes('domination plan') || 
      q.includes('kotler command') || 
      q.includes('decision engine') || 
      q.includes('mind control') || 
      q.includes('marketing mind') || 
      q.includes('5 stage marketing') || 
      q.includes('five stage marketing') || 
      q.includes('awareness blast') || 
      q.includes('perception build') || 
      q.includes('trust engine') || 
      q.includes('demand creation') || 
      q.includes('price perception') || 
      q.includes('sale hone se pehle') || 
      (q.includes('kotler') && (q.includes('war') || q.includes('plan') || q.includes('daily') || q.includes('cadence') || q.includes('decision') || q.includes('room') || q.includes('mind')));

    if (isKotlerWarPlanQuery) {
      return philipKotlerEngine.handleKotlerConversation(text, user);
    }

    // 0.0017 Core Marketing Strategy & Trade Growth Division (12 Marketing Legends)
    const isMarketingQuery = 
      q.includes('marketing') || 
      q.includes('trade marketing') || 
      q.includes('gunjit') || 
      q.includes('kotler') || 
      q.includes('sutherland') || 
      q.includes('ann handley') || 
      q.includes('cialdini') || 
      q.includes('eugene schwartz') || 
      q.includes('neil patel') || 
      q.includes('byron sharp') || 
      q.includes('levinson') || 
      q.includes('guerrilla') || 
      q.includes('zyman') || 
      q.includes('ariely') || 
      q.includes('ritson') || 
      q.includes('counter visibility') || 
      q.includes('pos kit') || 
      q.includes('4ps') || 
      q.includes('perceived value') || 
      q.includes('decoy pricing') || 
      (q.includes('seo') && (q.includes('local') || q.includes('google') || q.includes('maps')));

    if (isMarketingQuery) {
      return {
        handled: true,
        reply: marketingHub.handleMarketingConversation(text, user),
        agent: 'Core Marketing Strategy & Trade Growth Division'
      };
    }





    // 0.001 Universal Interactive Conversation Engine for ALL 86 Legends across 7 Divisions
    const legendRes = await legendsEngine.handleConversation(text, user);
    if (legendRes) {
      return legendRes;
    }

    // 0. On-Demand Executive Report & Update command for CEO & Founder
    if (q === 'daily report' || q === 'report' || q === 'aaj ka report' || q === 'send report' || q === 'aaj ka kaam' || q === 'work summary' || q === 'update' || q === 'updates' || q.includes('kya update') || q.includes('status update') || q === 'operations update') {
      const dailyReporter = require('./reporting/daily-reporter');
      const res = await dailyReporter.generateReport();
      return { handled: true, reply: res.text, agent: 'Hermes Executive Core' };
    }

    // 0.1 Product Catalog View command: "catalog", "show catalog", "products", "product list"
    if (q === 'catalog' || q === 'show catalog' || q === 'products' || q === 'product list' || q === 'rate list' || q === 'rates') {
      const prods = dataStore.getProducts();
      if (prods.length === 0) {
        return { handled: true, reply: '📦 Catalog is currently blank. Use "add product <Name>, MRP <X>, Cost <Y>..." to add items.', agent: 'Hermes Executive Core' };
      }
      let reply = `📦 *Sharma Industries / Swatch Paints Confirmed Catalog (${prods.length} SKUs)*:\n\n`;
      prods.forEach((p, idx) => {
        reply += `${idx + 1}. *${p.product_name}* (${p.category})\n` +
                 `   • Pack: ${p.pack_size} | Stock: *${p.stock_qty}*\n` +
                 `   • MRP: ₹${p.mrp} | Base Cost: ₹${p.base_cost}\n` +
                 `   • Homeowner Rate: *₹${p.homeowner_price}* (20% off MRP)\n` +
                 `   • Dealer Rate: *₹${p.dealer_net_tier1} – ₹${p.dealer_net_tier2}* / bag\n` +
                 `   • Schemes: ${p.active_scheme}\n\n`;
      });
      return { handled: true, reply, agent: 'Hermes Executive Core' };
    }

    // 0.15 Sales Training & Market Playbooks Command for CEO & Founder
    if (q === 'sales training' || q === 'training' || q === 'playbooks' || q === 'sales playbooks' || q === 'brian tracy' || q === 'training summary' || q.startsWith('playbook') || q.includes('sales team training')) {
      const salesDispatch = require('./reporting/sales_training_dispatch');
      const pbMatch = q.match(/playbook\s*(\d+)/i);
      if (pbMatch) {
        const moduleNum = pbMatch[1];
        const brief = salesDispatch.generateModuleBrief(moduleNum);
        return { handled: true, reply: brief, agent: 'Brian Tracy (Chief Sales Officer)' };
      } else {
        const summary = salesDispatch.generateCurriculumSummary();
        return { handled: true, reply: summary, agent: 'Brian Tracy (Chief Sales Officer)' };
      }
    }

    // 0.18 Executive PDF & Invoice Generation & WhatsApp Dispatch for CEO Ashutosh Sharma
    if (q.includes('pdf') || q.includes('bhejo pdf') || q.includes('plan pdf') || q.includes('invoice') || q.includes('bill') || q.includes('template') || q.includes('quotation') || q.includes('proforma')) {
      const pdfGenerator = require('./reporting/pdf-generator');
      const waClient = require('./whatsapp/wa');

      if (q.includes('sales')) {
        const res = await pdfGenerator.generateSalesPlanPdf();
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, '📊 *Sharma Industries — Sales Division Operational Blueprint & 50 Battlecards*', waClient);
        return {
          handled: true,
          reply: `✅ *Sales Division Blueprint PDF Generated & Sent!*\n\n• Document: \`${res.fileName}\`\n• Content: 50 Perfected Battlecards, Hormozi Grand Slam Offers, Brian Tracy 5-Step Closing Cadence.\n• Sent directly to your WhatsApp as a downloadable PDF document, Sir!`,
          agent: 'Brian Tracy (CSO) & Alex Hormozi'
        };
      } else if (q.includes('operation') || q.includes('production')) {
        const res = await pdfGenerator.generateOperationsPlanPdf();
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, '🏭 *Sharma Industries — Operations & Manufacturing Blueprint*', waClient);
        return {
          handled: true,
          reply: `✅ *Operations & Manufacturing Blueprint PDF Generated & Sent!*\n\n• Document: \`${res.fileName}\`\n• Content: Taiichi Ohno Zero-Muda Kanban, 25kg Bag Batching, Shahrukh & Om Prakash workflows.\n• Sent directly to your WhatsApp as a downloadable PDF document, Sir!`,
          agent: 'Taiichi Ohno (COO)'
        };
      } else if (q.includes('finance') || q.includes('margin')) {
        const res = await pdfGenerator.generateFinancePlanPdf();
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, '💰 *Sharma Industries — Capital Allocation & Unit Margin Audit*', waClient);
        return {
          handled: true,
          reply: `✅ *Finance & Unit Margin Audit PDF Generated & Sent!*\n\n• Document: \`${res.fileName}\`\n• Content: Warren Buffett Hurdle Rate (≥₹100/bag), Ram Charan 2% Cash Velocity, Sonu Kumar wholesale terms.\n• Sent directly to your WhatsApp as a downloadable PDF document, Sir!`,
          agent: 'Warren Buffett (CFO)'
        };
      } else if (q.includes('luxury') || q.includes('architect')) {
        const res = await pdfGenerator.generateSampleInvoicePdf(null, 'luxury');
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, `🏛️ *Swatch Paints — Luxury Architectural GST Invoice (${res.invNum})*\n_Template: Minimalist Clean Luxury (Total: ₹${res.grandTotal.toLocaleString('en-IN')})_`, waClient);
        return {
          handled: true,
          reply: `✅ *Luxury Architectural Invoice PDF Generated & Sent!*\n\n• Template: *Minimalist Clean Luxury / Architectural*\n• Invoice No: \`${res.invNum}\`\n• Buyer: M/s Rajesh Paint & Hardware Store, Kota\n• Net Payable: *₹${res.grandTotal.toLocaleString('en-IN')}.00*\n• Features: High-res Logo, Dynamic UPI QR Code, 5-Yr Assurance, Minimalist Grid.\n• Document: \`${res.fileName}\`\n• Delivered directly to your WhatsApp, Sir!`,
          agent: 'Hermes Billing & Invoicing Engine'
        };
      } else if (q.includes('trade') || q.includes('distributor') || q.includes('stockist')) {
        const res = await pdfGenerator.generateSampleInvoicePdf(null, 'trade');
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, `📦 *Swatch Paints — B2B Wholesale Trade & Stockist Invoice (${res.invNum})*\n_Template: Heavy-Duty Trade / Tally Enterprise (Total: ₹${res.grandTotal.toLocaleString('en-IN')})_`, waClient);
        return {
          handled: true,
          reply: `✅ *B2B Wholesale Trade Invoice PDF Generated & Sent!*\n\n• Template: *B2B Wholesale Trade & Stockist*\n• Invoice No: \`${res.invNum}\`\n• Total: *₹${res.grandTotal.toLocaleString('en-IN')}.00*\n• Features: E-Way Bill details, Transporter vehicle, 2% CD deduction, ₹5,000 Painter Token counter.\n• Document: \`${res.fileName}\`\n• Delivered directly to your WhatsApp, Sir!`,
          agent: 'Hermes Billing & Invoicing Engine'
        };
      } else if (q.includes('proforma') || q.includes('quotation') || q.includes('estimate') || q.includes('kaccha')) {
        const res = await pdfGenerator.generateSampleInvoicePdf(null, 'proforma');
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, `📋 *Swatch Paints — Proforma Invoice & Price Quotation (${res.invNum})*\n_Template: Commercial Price Estimate (Total: ₹${res.grandTotal.toLocaleString('en-IN')})_`, waClient);
        return {
          handled: true,
          reply: `✅ *Proforma Quotation PDF Generated & Sent!*\n\n• Template: *Proforma Quotation / Estimate*\n• Quote No: \`PI-${res.invNum}\`\n• Estimate Total: *₹${res.grandTotal.toLocaleString('en-IN')}.00*\n• Features: 15-Day Price Lock, Advance UPI QR, Dealer Margin summary.\n• Document: \`${res.fileName}\`\n• Delivered directly to your WhatsApp, Sir!`,
          agent: 'Hermes Billing & Invoicing Engine'
        };
      } else if (q.includes('all template') || q.includes('saare template') || q.includes('templates') || (q.includes('invoice') && q.includes('all'))) {
        const all = await pdfGenerator.generateAllInvoiceTemplates();
        for (const item of all) {
          await pdfGenerator.sendPdfToCeo(item.filePath, item.fileName, `🧾 *Swatch Paints — Invoice Template: ${item.templateType.toUpperCase()}*\n_Invoice No: ${item.invNum} | Total: ₹${item.grandTotal.toLocaleString('en-IN')}_`, waClient);
        }
        return {
          handled: true,
          reply: `👑 *All 4 Invoice & Quotation Templates Generated & Dispatched to WhatsApp!*\n\n` +
                 `1. 🏢 *Modern Corporate Enterprise* (\`Swatch_Invoice_CORPORATE_...\`)\n` +
                 `2. 🏛️ *Minimalist Clean Luxury / Architectural* (\`Swatch_Invoice_LUXURY_...\`)\n` +
                 `3. 📦 *B2B Wholesale Trade & Stockist* (\`Swatch_Invoice_TRADE_...\`)\n` +
                 `4. 📋 *Proforma Quotation / Commercial Estimate* (\`Swatch_Invoice_PROFORMA_...\`)\n\n` +
                 `Sabhi 4 templates me official Swatch logo, real UPI payment QR code, statutory GST HSN schedule, aur commercial assurances embedded hain, Sir!`,
          agent: 'Hermes Billing & Invoicing Engine'
        };
      } else if (q.includes('invoice') || q.includes('bill') || q.includes('gst')) {
        const res = await pdfGenerator.generateSampleInvoicePdf(null, 'corporate');
        await pdfGenerator.sendPdfToCeo(res.filePath, res.fileName, `🧾 *Sharma Industries — Upgraded Corporate GST Tax Invoice (${res.invNum})*\n_Template: Corporate Enterprise | Dynamic UPI QR & HSN Schedule (Total: ₹${res.grandTotal.toLocaleString('en-IN')})_`, waClient);
        return {
          handled: true,
          reply: `✅ *Upgraded Corporate GST Tax Invoice Generated & Sent!*\n\n` +
                 `• Template: *Modern Corporate Enterprise*\n` +
                 `• Invoice No: \`${res.invNum}\`\n` +
                 `• Total Value: *₹${res.grandTotal.toLocaleString('en-IN')}.00* (Inclusive of 18% GST & 2% CD)\n` +
                 `• Upgrades Embedded:\n` +
                 `  - 🎨 High-Res Swatch Paints Branding Banner\n` +
                 `  - 📱 Dynamic UPI QR Code for instant scan-to-pay (SBI)\n` +
                 `  - 📊 Statutory 2-Tier GST HSN Schedule (HSN 3214 & 3209)\n` +
                 `  - 🚚 Full Logistics (E-Way Bill, Vehicle RJ-08-GA-4412, DC)\n` +
                 `  - 🎁 Painters Growth Tokens (₹5,000 loaded value) & 5-Yr Guarantee\n` +
                 `• Document: \`${res.fileName}\`\n\n` +
                 `_Baaki 3 templates dekhne ke liye reply karein: "send all templates" ya "luxury invoice" / "trade invoice" / "proforma quote"._`,
          agent: 'Hermes Billing & Invoicing Engine'
        };
      } else {
        // Send all executive PDFs (or Master Dossier)
        await pdfGenerator.generateAndSendAllPdfs(waClient);
        return {
          handled: true,
          reply: `👑 *All 4 Executive PDFs Generated & Dispatched to Your WhatsApp!*\n\n1. 📊 *Sales Division Blueprint & 50 Battlecards*\n2. 🏭 *Operations & Manufacturing Blueprint*\n3. 💰 *Finance & Capital Allocation Audit*\n4. 👑 *Master Executive Company Dossier (All 6 Divisions)*\n\nSabhi documents aapke WhatsApp par deliver ho chuke hain, Sir!`,
          agent: 'Hermes Master Brain'
        };
      }
    }

    // 0.2 Add / Update Product Command from CEO
    if (q.startsWith('add product') || q.startsWith('update product') || (q.includes('catalog') && (q.includes('add') || q.includes('update')))) {
      const nameMatch = text.match(/(?:product|hai|add)\s+([a-zA-Z0-9\s]+?)(?:\s+jiska|\s+mrp|\s*,|\s*\(|$)/i);
      const mrpMatch = text.match(/mrp\s*:?\s*(\d+)/i);
      const baseMatch = text.match(/(?:selling rate|cost|base cost|selling)\s*:?\s*(\d+)/i);
      const stockMatch = text.match(/(?:stock|stocks)\s*:?\s*(\d+[\s\w]*)/i);
      const dealerMatch = text.match(/dealer[s]?\s*(?:ko|rate)?\s*:?\s*(\d+)(?:[-–to\s]+(\d+))?/i);
      const homeownerMatch = text.match(/(?:home\s*owner[s]?|retail)\s*(?:ko|rate|price)?\s*:?\s*(\d+)/i);

      if (nameMatch || mrpMatch || baseMatch) {
        const prodName = nameMatch ? nameMatch[1].trim() : 'Swatch Rustic Texture';
        const mrp = mrpMatch ? mrpMatch[1] : '1150';
        const baseCost = baseMatch ? baseMatch[1] : '550';
        const stockQty = stockMatch ? stockMatch[1].trim() : '10000 bags';
        const dealer1 = dealerMatch ? dealerMatch[1] : '650';
        const dealer2 = dealerMatch && dealerMatch[2] ? dealerMatch[2] : '700';
        const homeownerPrice = homeownerMatch ? homeownerMatch[1] : '920';

        const sku = `SW-${prodName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 15)}-01`;
        await dataStore.saveProduct({
          sku_code: sku,
          product_name: prodName,
          category: 'Texture Coatings',
          pack_size: 'Bag (25kg)',
          stock_qty: stockQty,
          base_cost: baseCost,
          dealer_net_tier1: dealer1,
          dealer_net_tier2: dealer2,
          homeowner_price: homeownerPrice,
          mrp: mrp,
          active_scheme: 'Homeowner 20% Off; Dealer Margin 30%+',
          pricing_rules: `Homeowner price: Rs ${homeownerPrice}; Dealer rate: Rs ${dealer1}-${dealer2}/bag.`
        });

        return {
          handled: true,
          reply: `✅ *Sir, Product Successfully Added & Published to Catalog*:\n\n` +
                 `📦 *Product*: ${prodName} (${sku})\n` +
                 `• MRP: *₹${mrp}*\n` +
                 `• Base Cost: *₹${baseCost}*\n` +
                 `• Homeowner Rate: *₹${homeownerPrice}* (20% off MRP)\n` +
                 `• Dealer Wholesale Rate: *₹${dealer1} – ₹${dealer2}* / bag\n` +
                 `• Warehouse Stock: *${stockQty}*\n\n` +
                 `🚀 *Status*: Live across WhatsApp Gateway. Staff, dealers aur homeowners ko ab unke role ke mutabiq rates quote kiye jayenge.`,
          agent: 'Hermes Executive Core'
        };
      }
    }

    // 1. List users command: "list users", "show dealers", "all users"
    if (q === 'list users' || q === 'show users' || q === 'all users' || q === 'user list' || q === 'users') {
      const all = dataStore.getAllUsers();
      let reply = `📋 *Sharma Industries CRM Users Directory (${all.length} registered)*:\n\n`;
      all.forEach((u, i) => {
        reply += `${i + 1}. *${u.name}* (${u.phone})\n   Role: *${u.role.toUpperCase()}* | Tier: *${u.tier}* | City: ${u.region}\n`;
      });
      return { handled: true, reply, agent: 'Hermes Executive Core' };
    }

    // 2. Add / Register user command:
    // e.g.: "add dealer Rajesh Paint Store, 9876543210, Tier 1, Delhi"
    if (q.startsWith('add dealer') || q.startsWith('add user') || q.startsWith('register dealer') || q.startsWith('add painter')) {
      const parts = text.replace(/^(add user|add dealer|register dealer|add painter)\s*:?/i, '').split(/,|\n/);
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const phone = parts[1].trim();
        const tier = parts[2] ? parts[2].trim() : 'Tier 3';
        const region = parts[3] ? parts[3].trim() : 'India';
        const role = q.includes('painter') ? 'painter' : 'dealer';

        await dataStore.saveUser({ phone, name, role, tier, region, notes: 'Added by CEO Ashutosh' });
        return {
          handled: true,
          reply: `✅ *Sir, successfully registered in CRM*:\n• Name: *${name}*\n• Phone: *${phone}*\n• Role: *${role.toUpperCase()}*\n• Tier: *${tier}*\n• Region: *${region}*`,
          agent: 'Hermes Executive Core'
        };
      }
    }

    // 3. Set Tier command: "set tier 9876543210, Tier 1"
    if (q.startsWith('set tier')) {
      const parts = text.replace(/^set tier\s*:?/i, '').split(/,|\s+/);
      if (parts.length >= 2) {
        const targetPhone = parts[0].trim();
        const newTier = parts.slice(1).join(' ').trim();
        const existing = dataStore.getUser(targetPhone);
        if (existing) {
          existing.tier = newTier;
          await dataStore.saveUser(existing);
          return {
            handled: true,
            reply: `✅ Updated ${existing.name} (${existing.phone}) to *${newTier}*!`,
            agent: 'Hermes Executive Core'
          };
        } else {
          return {
            handled: true,
            reply: `⚠️ Phone number ${targetPhone} not found in CRM. Use "add dealer" to register first.`,
            agent: 'Hermes Executive Core'
          };
        }
      }
    }

    // 4. Marketing Calendar command: "marketing calendar", "content calendar"
    if (q === 'marketing calendar' || q === 'content calendar' || q === 'social calendar') {
      const cal = socialMarketing.getContentCalendar();
      let reply = `📅 *Sharma Industries Social Media Marketing Strategy Calendar*:\n\n`;
      cal.forEach(item => {
        reply += `📌 *${item.day}* (${item.platform})\n   Theme: _${item.theme}_\n\n`;
      });
      reply += `💡 *Hermes Tip*: Post draft karne ke liye likhein: "social post <Topic/Product>"`;
      return { handled: true, reply, agent: 'Social Marketing Agent' };
    }

    // 5. List Social Posts command: "list posts", "social posts"
    if (q === 'list posts' || q === 'show posts' || q === 'social posts' || q === 'marketing posts') {
      const posts = socialMarketing.listPosts();
      if (posts.length === 0) {
        return { handled: true, reply: 'ℹ️ No social media post drafts found yet. Say "social post <Topic>" to generate one!', agent: 'Social Marketing Agent' };
      }
      let reply = `📢 *Social Media Posts Registry (${posts.length})*:\n\n`;
      posts.slice(0, 8).forEach((p, idx) => {
        const badge = p.status === 'published' ? '🟢 Published' : (p.status === 'approved' ? '🟡 Approved' : '⚪ Draft');
        reply += `${idx + 1}. [${p.id}] *${p.product}* (${p.platformName || p.platform}) — ${badge}\n`;
      });
      reply += `\nCommands:\n• "approve post <ID>"\n• "publish post <ID>"`;
      return { handled: true, reply, agent: 'Social Marketing Agent' };
    }

    // 6. Generate Social Post command: "social post <Topic>", "marketing post <Topic>", "create post <Topic>"
    if (q.startsWith('social post') || q.startsWith('marketing post') || q.startsWith('create post') || q.startsWith('post banao')) {
      const raw = text.replace(/^(social post|marketing post|create post|post banao)\s*:?/i, '').trim();
      let product = raw || 'Sharma Industries';
      let platform = 'instagram';

      if (raw.toLowerCase().includes('whatsapp')) platform = 'whatsapp_status';
      else if (raw.toLowerCase().includes('facebook')) platform = 'facebook';
      else if (raw.toLowerCase().includes('linkedin')) platform = 'linkedin';

      const post = await socialMarketing.generatePost({
        platform,
        product,
        theme: 'company_branding',
        customNotes: raw,
        useCompetitorIntel: false
      });

      return {
        handled: true,
        reply: `📝 *Draft Post Created [${post.id}]* (${post.platformName || platform}):\n\n${post.content}\n\n━━━━━━━━━━━━━━━━━━━━\n⚡ *CEO Approval Required*: "approve post ${post.id}" ya "reject post ${post.id}"`,
        agent: 'Social Marketing Agent'
      };
    }

    // 7. Approve Social Post: "approve post <ID>"
    if (q.startsWith('approve post')) {
      const id = q.replace('approve post', '').trim().toUpperCase();
      const approved = socialMarketing.approvePost(id);
      if (!approved) return { handled: true, reply: `⚠️ Post ID "${id}" not found. Type "list posts" to see valid IDs.`, agent: 'Social Marketing Agent' };
      return {
        handled: true,
        reply: `✅ *Post [${id}] APPROVED by Ashutosh Sir!* Ready for publishing.\nSay "publish post ${id}" to dispatch to channels.`,
        agent: 'Social Marketing Agent'
      };
    }

    // 8. Publish Social Post: "publish post <ID>"
    if (q.startsWith('publish post')) {
      const id = q.replace('publish post', '').trim().toUpperCase();
      const published = socialMarketing.publishPost(id);
      if (!published) return { handled: true, reply: `⚠️ Post ID "${id}" not found. Type "list posts" to see valid IDs.`, agent: 'Social Marketing Agent' };
      return {
        handled: true,
        reply: `🚀 *Post [${id}] PUBLISHED Successfully!*\nRecorded to Sharma Industries campaign ledger.`,
        agent: 'Social Marketing Agent'
      };
    }

    // 9. Daily Executive Briefing (Manual trigger): "briefing", "daily report", "executive report"
    if (q === 'briefing' || q === 'daily report' || q === 'executive report' || q === 'today report' || q === 'shaam ki report' || q === 'report bhejo') {
      const dailyReporter = require('./reporting/daily-reporter');
      const res = await dailyReporter.generateReport();
      return {
        handled: true,
        reply: res.reportText || res,
        agent: 'Hermes Executive Briefing'
      };
    }

    // 10. System Status / Agent Health Query: "system status", "agent status", "hermes status", "skills count", "kitni skills"
    if (q === 'system status' || q === 'agent status' || q === 'hermes status' || q === 'skills' || q.includes('skills count') || q.includes('kitni skills') || q.includes('kitne skills') || q.includes('skills ho gayi') || q.includes('skills install')) {
      return {
        handled: true,
        reply: `Ashutosh Sir, Hermes System Status:\n\n` +
          `• *Total Active Skills*: *1,000 Skills Enabled* across 65+ domains\n` +
          `• *Domains*: Web Scraping (Scrapling), Branding (29), Social & Marketing (14), Masters Personas (80), GTM & Manufacturing Sales (244), Tech & Development (418), Operations/Finance (213)\n` +
          `• *Subordinate Engines*: Prime Research, Social Marketing, Paperclip Workers, Self-Evolution\n` +
          `• *Gateways*: WhatsApp Gateway (3005), Web Dashboard (9119), Local LLM OmniRoute\n` +
          `• *Executive Briefing*: Scheduled daily at 7:00 PM IST\n\n` +
          `Sir, kis domain ya task ko initiate karna hai? Main plan banakar pehle aapse approval loonga.`,
        agent: 'Hermes Executive Core'
      };
    }

    // 11. Branding Skills Query: "branding k liye kya h", "branding me kya hai", "branding skills"
    if (q.includes('branding k liye') || q.includes('branding ke liye') || q.includes('branding me kya') || q.includes('branding skills') || q === 'branding' || (q.includes('branding') && (q.includes('kya') || q.includes('batao') || q.includes('show') || q.includes('list')))) {
      return {
        handled: true,
        reply: `Ashutosh Sir, Company Branding ke liye hamare paas dedicated *29 Active Branding Skills* installed hain:\n\n1. 🎨 *Brand Identity & Packaging*:\n• *brand-identity*: Logo direction, visual language, color palette & design system\n• *brand-packaging*: Factory bucket & pail packaging designs\n• *brand-guidelines*: Dealer store signages & display branding manual\n\n2. 🎯 *Positioning & Strategy*:\n• *brand-positioning*: Brand value proposition & market distinction\n• *b2b-brand-marketing*: Dealer trust building & trade loyalty programs\n• *brand-story* & *brand-manifesto*: Manufacturing heritage & company vision\n\n3. 📢 *Campaigns & Reach*:\n• *social-marketing*: Multi-channel campaigns (Instagram, WhatsApp, Facebook, LinkedIn)\n• *whatsapp-marketing*: Direct dealer & contractor broadcasts\n\nSir, aap jis bhi brand asset ya campaign ka plan chahte hain, batayein — main pura plan bana kar pehle aapse approval loonga.`,
        agent: 'Hermes Executive Core'
      };
    }

    // 12. Alex Hormozi Offer & Pricing Engine (Grand Slam Offers, Value Equation, Pricing Ladders)
    if (
      q.includes('hormozi') ||
      q.includes('pricing karo') ||
      q.includes('offer banao') ||
      q.includes('scheme design') ||
      q.includes('grand slam offer')
    ) {
      const res = await hormoziEngine.handle(text, user);
      if (res.handled) {
        return {
          handled: true,
          reply: res.reply,
          agent: 'Alex Hormozi Offer & Pricing Expert'
        };
      }
    }

    // 13. Competitor Query Guard: strictly do not hallucinate or merge third-party data
    if ((q.includes('competitor') || q.includes('asian paints') || q.includes('berger')) && (user?.role === 'owner' || user?.role === 'admin')) {
      return {
        handled: true,
        reply: `Ashutosh Sir, Competitor intelligence module isolated hai. Jab tak aap specific comparison ya market segment research ka aadesh nahi dete, tab tak kisi bhi doosri company ka data Sharma Industries me merge ya compare nahi kiya jayega.`,
        agent: 'Prime Research Agent'
      };
    }

    return { handled: false };
  }

  /**
   * Orchestrator acts as TEAM LEAD reporting directly to Hermes (Brain)
   * Commands the Agents (Legends), collects all outputs, and delivers full report back to Hermes.
   */
  async executeAsTeamLead(directive, user, channel = 'WhatsApp') {
    const rawQuery = directive.rawQuery;
    const team = directive.team;

    // 1. Governance commands (/approve, /reject, /refine, /status, /loops)
    if (team === 'governance') {
      const graphRes = await graphEngine.handleCommand(rawQuery, user);
      return {
        team: 'Governance & Approval',
        teamLead: 'Orchestrator',
        agentCount: 1,
        agents: ['Graph Engine Controller'],
        text: graphRes ? graphRes.reply : 'Command executed successfully.',
        status: 'EXECUTED'
      };
    }

    // 1.5 Master Dossier Command (Complete Swatch Rustic Commercial, Operations & Training Intelligence)
    if (team === 'executive_master_dossier') {
      const dossierText = `📦 *SWATCH RUSTIC (25KG BAG) — EXECUTIVE COMMERCIAL & OPERATIONAL MASTER REPORT*\n` +
        `_Compiled by Orchestrator (Team Lead) for Hermes Brain & CEO Ashutosh Sharma_\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `1️⃣ *PRICING MATRIX & UNIT ECONOMICS (Alex Hormozi & Warren Buffett)*\n` +
        `• *Anchor Product*: Swatch Rustic Texture (Exterior/Interior High-Build Textured Composite)\n` +
        `• *Packaging Format*: *25kg Moisture-Proof Heavy-Duty Bag* (Powder/Paste Composite — NOT Buckets)\n` +
        `• *Tinting Requirement*: *ZERO TINTING MACHINE NEEDED* (Ready-to-use factory formulated, zero machine deposit, zero dealer space block)\n` +
        `• *Maximum Retail Price (MRP)*: *₹1,150.00* per 25kg bag\n` +
        `• *Landed Factory Manufacturing Cost*: *₹450.00* per 25kg bag (Resin binders, Rutile TiO2, graded quartz dolomite, additives, laminated bag)\n` +
        `• *Dealer Wholesale Price Band*: *₹632.50* (Elite 45% Margin) to *₹690.00* (Standard 40% Margin)\n` +
        `• *Homeowner Direct Rate*: *₹920.00* (20% Off MRP)\n` +
        `• *Cash Velocity Discount*: 2% instant discount on payment within 7 days (Ram Charan Protocol)\n` +
        `• *Strict Profit Hurdle*: *≥ ₹100.00 Net Contribution* per 25kg bag retained by Sharma Industries\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `2️⃣ *ACTIVE SCHEMES & GRAND SLAM OFFERS (Dan Kennedy & Hormozi)*\n` +
        `• 🏬 *Dealer Counter Launch Offer*:\n` +
        `   - 40–45% Guaranteed Margin (₹460–₹517.50 retail profit per 25kg bag vs 20–25% legacy brands)\n` +
        `   - *ZERO Machine Barrier*: No ₹2 Lakh tinting machine deposit or maintenance headaches\n` +
        `   - 30-Day Written Stock Buyback Guarantee (Zero dead-capital risk for dealer)\n` +
        `   - Free Swatch Architectural Texture Sample Board + Stainless Trowel Demo Kit on 25-bag order\n` +
        `   - 30-Day Revolving Credit line (backed by verified PDC underwriting)\n\n` +
        `• 🎨 *Painter Samman Loyalty Program*:\n` +
        `   - ₹50 Instant Cash Token coupon sealed inside every 25kg bag (Instant UPI / QR cash)\n` +
        `   - Swatch Painter Club: 10 bags = 1 free scratch card for professional notched trowels & tools\n` +
        `   - Respect-First Policy: Address by registered name [Painter Name] ji with zero generic slang\n` +
        `   - Certified Applicator Badge on official Swatch portal + direct local homeowner leads\n\n` +
        `• 🏡 *Homeowner Protection Guarantee*:\n` +
        `   - 7-Year Weatherproof & Anti-Cracking Written Warranty\n` +
        `   - Free Doorstep Texture Finish Consultation & Sample Swatch Board inspection\n` +
        `   - Paisa-Vasool Math: High-build film eliminates the ₹30,000 cost of repainting every 2 years\n\n` +
        `• 🏗️ *Contractor / Project Package*:\n` +
        `   - Tiered bulk slabs (100 bags to 2,000+ bags) direct from factory depot\n` +
        `   - Guaranteed 24-Hour on-site delivery SLA with dedicated transport route\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `3️⃣ *INDIAN SALES PSYCHOLOGY & SCRIPTS (Hermes Enablement v1.0)*\n` +
        `• *The 5-Step Sales Flow*: 30s Chai-Talk Opening ➔ 2m Counter Probing ➔ 2m 3-Point Presentation (45% margin, 25kg bags, zero machine cost) ➔ 5m Objection Turnaround ➔ 2m Assumptive Close\n` +
        `• *Daily 15-Minute Objection Drills*: Empathy ➔ Reframe ➔ Proof ➔ Close on top 10 market objections\n` +
        `• *3 Roleplay Certification Gates*: Dealer Gate, Painter Partner Gate, Homeowner Protection Gate (8.0/10 passing score required before field deployment)\n` +
        `• *Sales Training Confinement*: Trained EXCLUSIVELY to Sales Division Legends (Brian Tracy, Hormozi, Voss, Belfort, Girard, Kennedy, etc.) to coach field rep Sonu Kumar\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `4️⃣ *PHYSICAL FACTORY & FIELD EXECUTION (Real Human Workers)*\n` +
        `• 🔬 *Shahrukh bhai (Senior Chemist)*: Physically blends dry/wet aggregate texture batches, verifies grit dispersion and moisture resistance using Thomas Edison & Deming specs\n` +
        `• 🚚 *Om Prakash Saini (Logistics Helper)*: Physically handles 25kg bag pallet stacking, bag loading, and dispatches using Fred Smith & Ohno delivery routes\n` +
        `• 🤝 *Sonu Kumar (Field Salesman)*: Physically visits 6-8 dealer counters daily with live 25kg texture demo boards, conducts scratch tests, and collects bag orders\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `5️⃣ *GOVERNANCE & SOVEREIGN APPROVAL CONTROLS*\n` +
        `• 1-Click WhatsApp Authorization Gate for CEO Ashutosh Sharma (+91 9079609627) on any custom scheme, volume rebate, or margin exception.\n` +
        `• Zero negative recession terms (always strictly "Market", "B2B Market", "Retail Trade Network").`;

      return {
        team: 'Executive Master Dossier',
        teamLead: 'Orchestrator',
        agentCount: 12,
        agents: [
          'Alex Hormozi (Pricing)',
          'Brian Tracy (CSO)',
          'Dan Kennedy (Schemes)',
          'Warren Buffett (CFO)',
          'Thomas Edison (R&D Chemist)',
          'W. Edwards Deming (QA/QC)',
          'Fred Smith (Logistics)',
          'Dale Carnegie (Trust)',
          'Chris Voss (Negotiation)',
          'Jordan Belfort (Closing)',
          'Piyush Pandey (Branding)',
          'Hermes (Chief of Staff)'
        ],
        text: dossierText,
        commercialMetrics: {
          mrp: 1150,
          cost: 450,
          dealerPrice: 632.50,
          margin: 0.45,
          hurdle: 100
        },
        status: 'EXECUTED'
      };
    }

    // 2. Explicit /run command
    if (rawQuery.startsWith('/run') || rawQuery.startsWith('run ')) {
      const graphCmd = rawQuery.startsWith('/') ? rawQuery : `/${rawQuery}`;
      const graphRes = await graphEngine.handleCommand(graphCmd, user);
      return {
        team: directive.team,
        teamLead: 'Orchestrator',
        agentCount: 14,
        agents: ['Hormozi India', 'Dan Kennedy', 'Brian Tracy', 'Chris Voss', 'Jordan Belfort', 'Zig Ziglar', 'Joe Girard', 'John McMahon', 'Keenan', 'Jeb Blount', 'Chet Holmes', 'Grant Cardone', 'April Dunford', 'Oren Klaff'],
        text: graphRes ? graphRes.reply : 'Graph run completed.',
        status: 'PENDING_HUMAN_APPROVAL'
      };
    }

    // 2.5 Training Division (Sales Force Enablement & Roleplay Gates)
    if (team === 'training') {
      const salesDispatch = require('./reporting/sales_training_dispatch');
      const salesTrainingEngine = require('./training/sales_training_engine');

      let replyText = '';
      if (rawQuery.startsWith('/drill') || rawQuery.includes('objection drill')) {
        const drill = salesTrainingEngine.getRandomDrill();
        replyText = `🎯 *HERMES 15-MINUTE DAILY OBJECTION DRILL*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *Buyer Type*: ${drill.buyerType}\n` +
          `🗣️ *Objection*: "${drill.objection}"\n\n` +
          `⏱️ *Rule*: 30 seconds me reply dein using: *Empathy ➔ Reframe ➔ Proof ➔ Close*.\n\n` +
          `_Trainee, aapka turnaround script kya hoga? (Type reply directly to get scored!)_`;
      } else if (rawQuery.startsWith('/roleplay')) {
        replyText = `🎭 *HERMES 3-ROLEPLAY CERTIFICATION GATES*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `1️⃣ *Gate 1: Dealer Qualification* (45% Margin, 30-Day Credit, Written Buyback)\n` +
          `2️⃣ *Gate 2: Painter & Contractor Partner* (Painter Club, Address by Name, ₹50 Scratch Token, Respect & Tools)\n` +
          `3️⃣ *Gate 3: Homeowner Protection* (7-Year Weatherproof Durability, Free Color Consultation)\n\n` +
          `Passing Score: *8/10* in Trust, Probing, Objection Handling, Closing.\n` +
          `Reply "/roleplay 1", "/roleplay 2", or "/roleplay 3" to start!`;
      } else if (rawQuery.includes('daily brief') || rawQuery.includes('training brief') || rawQuery.includes('training report')) {
        replyText = salesTrainingEngine.generateCeoDailyBrief();
      } else {
        const pbMatch = rawQuery.match(/playbook\s*(\d+)/i);
        if (pbMatch) {
          replyText = salesDispatch.generateModuleBrief(pbMatch[1]);
        } else {
          replyText = salesDispatch.generateCurriculumSummary();
        }
      }

      return {
        team: 'Sales Force Enablement & Training',
        teamLead: 'Orchestrator',
        agentCount: 4,
        agents: ['Hermes (Training Orchestrator)', 'Brian Tracy (CSO)', 'Dale Carnegie (Trust)', 'Jordan Belfort (Closing)'],
        text: replyText,
        status: 'EXECUTED'
      };
    }

    // 3. Sales Division
    if (team === 'sales') {
      const hormoziRes = await hormoziEngine.handle(rawQuery, user);
      if (hormoziRes && hormoziRes.handled) {
        return {
          team: 'Sales Division',
          teamLead: 'Orchestrator',
          agentCount: 3,
          agents: ['Alex Hormozi (Pricing & Offers)', 'Brian Tracy (CSO)', 'Chris Voss (Negotiation)'],
          text: hormoziRes.reply,
          commercialMetrics: {
            mrp: 1150,
            cost: 450,
            dealerPrice: 660,
            dealerMarginPct: 42.6,
            companyNetMargin: 120
          },
          status: 'COLLECTED_FOR_HERMES'
        };
      }

      const graphRun = await graphEngine.runGraph('sales', rawQuery, user);
      return {
        team: 'Sales Division',
        teamLead: 'Orchestrator',
        agentCount: 14,
        agents: ['Alex Hormozi', 'Dan Kennedy', 'Brian Tracy', 'Chris Voss', 'Jordan Belfort', 'Zig Ziglar', 'Joe Girard', 'John McMahon', 'Keenan', 'Jeb Blount', 'Chet Holmes', 'Grant Cardone', 'April Dunford', 'Oren Klaff'],
        text: graphRun.notification,
        commercialMetrics: {
          mrp: 1150,
          cost: 450,
          dealerPrice: 690,
          dealerMarginPct: 40.0,
          companyNetMargin: 240
        },
        status: 'COLLECTED_FOR_HERMES'
      };
    }

    // 4. Operations Division
    if (team === 'operations') {
      const graphRun = await graphEngine.runGraph('operations', rawQuery, user);
      return {
        team: 'Operations & Manufacturing',
        teamLead: 'Orchestrator',
        agentCount: 4,
        agents: ['V. Krishnamurthy', 'Taiichi Ohno', 'Eliyahu Goldratt', 'Eiji Toyoda'],
        text: graphRun.notification,
        status: 'COLLECTED_FOR_HERMES'
      };
    }

    // 5. Finance Division
    if (team === 'finance') {
      const graphRun = await graphEngine.runGraph('finance', rawQuery, user);
      return {
        team: 'Finance & Capital Strategy',
        teamLead: 'Orchestrator',
        agentCount: 5,
        agents: ['Warren Buffett', 'Uday Kotak', 'Saurabh Mukherjea', 'Ram Charan', 'Radhakishan Damani'],
        text: graphRun.notification,
        status: 'COLLECTED_FOR_HERMES'
      };
    }

    // 6. Vision Division
    if (team === 'vision') {
      const graphRun = await graphEngine.runGraph('vision', rawQuery, user);
      return {
        team: 'Corporate Vision & Strategy',
        teamLead: 'Orchestrator',
        agentCount: 6,
        agents: ['Dhirubhai Ambani', 'Peter Drucker', 'Andrew Grove', 'Ray Dalio', 'Jim Collins', 'CK Prahalad'],
        text: graphRun.notification,
        status: 'COLLECTED_FOR_HERMES'
      };
    }

    // 7. Branding Division
    if (team === 'branding') {
      const graphRun = await graphEngine.runGraph('branding', rawQuery, user);
      return {
        team: 'Brand Positioning & Strategy',
        teamLead: 'Orchestrator',
        agentCount: 5,
        agents: ['April Dunford', 'Al Ries / Jack Trout', 'Piyush Pandey', 'Donald Miller', 'Marty Neumeier'],
        text: graphRun.notification,
        status: 'COLLECTED_FOR_HERMES'
      };
    }

    // 8. Social Media Division
    if (team === 'social') {
      const graphRun = await graphEngine.runGraph('social', rawQuery, user);
      return {
        team: 'Social Media & Direct Response',
        teamLead: 'Orchestrator',
        agentCount: 6,
        agents: ['Gary Vaynerchuk', 'MrBeast', 'Eugene Schwartz', 'Gary Halbert', 'Robert Cialdini', 'Russell Brunson'],
        text: graphRun.notification,
        status: 'COLLECTED_FOR_HERMES'
      };
    }

    // Default Cross-Team Recipe
    const graphRun = await graphEngine.runGraph('master', rawQuery, user);
    return {
      team: 'Cross-Functional Master Team',
      teamLead: 'Orchestrator',
      agentCount: 12,
      agents: ['Executive Legends Council'],
      text: graphRun.notification,
      status: 'COLLECTED_FOR_HERMES'
    };
  }

  classify(text, sender, session = null) {
    const q = (text || '').toLowerCase().trim();
    const user = this.getUser(sender);

    // If talking to Owner/CEO or conversation is natural Hinglish/order placement, default to Hermes LLM for human warmth
    const isOwner = user?.role === 'owner' || user?.role === 'admin';
    const isOrderPlacement = q.includes('sales order') || q.includes('order :-') || q.includes('bags') || q.includes('bucket') || q.includes('likho') || q.includes('bhejo');
    const isConversational = ['hi', 'hello', 'hey', 'namaste', 'kaise ho', 'status kya hai', 'batao', 'kya haal'].some(k => q.startsWith(k));

    if (isOwner || isOrderPlacement || isConversational) {
      return { intent: 'hermes_cognitive', complexity: 0.9, user };
    }

    // Intent detection for standard dealer lookups
    let intent = 'general';
    let complexity = 0.8; // Default to LLM unless it's a dead-simple rate/catalog lookup

    const isPriceQuery = q.includes('price') || q.includes('rate') || q.includes('kya rate') || q.includes('bhav') || q.includes('daam') || q.includes('cost');
    const isCatalogQuery = q.includes('catalog') || q.includes('product list') || q.includes('rate list') || q.includes('price list');

    if (isPriceQuery || isCatalogQuery) {
      intent = 'b2b_pricing';
      complexity = 0.2;
    } else if (q.startsWith('track ord-')) {
      intent = 'operations_tracking';
      complexity = 0.2;
    } else if (q === 'balance' || q === 'credit' || q === 'hisaab') {
      intent = 'relationship_finance';
      complexity = 0.2;
    }

    return { intent, complexity, user };
  }

  async run(text, sender = 'anonymous', channel = 'WhatsApp') {
    const start = Date.now();
    let user = this.getUser(sender);

    // Auto-registration for new unrecognized numbers
    if (!user && sender && sender !== 'anonymous') {
      const newUser = {
        phone: sender,
        name: 'New Partner',
        role: 'lead',
        tier: 'Tier 3',
        region: 'India',
        notes: 'Auto-onboarded via WhatsApp'
      };
      await dataStore.saveUser(newUser);
      user = newUser;
    }

    // Load Session Context
    const session = sessionMemory.getSession(sender);

    // 1. Language Preference Detection & Selection
    const tLower = text.toLowerCase().trim();
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const isOwner = user?.role === 'owner' || user?.role === 'admin';

    const isHindiTrigger = (
      hasDevanagari ||
      tLower === 'hindi' || tLower === '2' || tLower === 'hindi me' || tLower === 'hindi mein' || tLower === 'हिंदी' ||
      tLower.includes('hindi me') || tLower.includes('hindi mein') || tLower.includes('hindi bol') || tLower.includes('hindi baat') || tLower.includes('hindi me baat') || tLower.includes('shudh hindi')
    ) && !tLower.includes('hinglish');

    const isHinglishTrigger = tLower.includes('hinglish') || tLower === '1' || tLower === 'हिंग्लिश';

    // Language switch execution
    if (isHinglishTrigger) {
      sessionMemory.setLanguage(sender, 'hinglish');
      session.languagePrompted = true;
      const isOwner = user?.role === 'owner' || user?.role === 'admin';
      const reply = isOwner
        ? `Ji Ashutosh Sir! Bilkul, ab se main aapse natural Hinglish mein hi baat karunga. Batayein Sir, abhi kis planning ya skill par kaam shuru karna hai?`
        : `Aapki language *Hinglish* set ho gayi hai. Sharma Industries mein aapka swagat hai. Main aapki kis tarah se sahayata kar sakta hoon?`;
      return { reply, agent: 'Hermes Language Manager', pathType: 'FAST_PATH', durationMs: Date.now() - start };
    } else if (isHindiTrigger) {
      sessionMemory.setLanguage(sender, 'hindi');
      session.languagePrompted = true;
      if (tLower.includes('hindi me') || tLower.includes('hindi mein') || tLower.includes('hindi bol') || tLower.includes('hindi baat') || tLower === 'hindi' || tLower === '2' || tLower === 'हिंदी') {
        const reply = isOwner
          ? `जी आशुतोष सर! बिल्कुल, मैं अब से आपसे पूर्ण रूप से शुद्ध हिंदी (देवनागरी) में ही बातचीत करूँगा। आज के लिए आपका क्या आदेश है सर?`
          : `नमस्ते! आपकी भाषा *हिंदी* सेट कर दी गई है। Sharma Industries में आपका स्वागत है। मैं आपकी किस प्रकार सहायता कर सकता हूँ?`;
        return { reply, agent: 'Hermes Language Manager', pathType: 'FAST_PATH', durationMs: Date.now() - start };
      }
    }

    // Auto-detect Devanagari script if not explicitly chosen
    if (hasDevanagari && !session.language) {
      sessionMemory.setLanguage(sender, 'hindi');
    }

    // First-time onboarding language prompt for new leads/contacts
    const isInternalStaff = isOwner || user?.role === 'founder' || user?.role === 'senior_chemist' || user?.role === 'salesman' || user?.role === 'salesman_helper' || user?.role === 'b2b_distributor';
    if (!isInternalStaff && !session.language && !session.languagePrompted && session.lastMessages.length === 0) {
      session.languagePrompted = true;
      const bilingualWelcome = `Namaste! Sharma Industries mein aapka swagat hai. 🙏\n` +
        `नमस्ते! शर्मा इंडस्ट्रीज में आपका स्वागत है।\n\n` +
        `Aap kis bhasha mein baat karna pasand karenge? / आप किस भाषा में बातचीत करना पसंद करेंगे?\n\n` +
        `1️⃣ *Hinglish* (हिंग्लिश — jaise hum WhatsApp par likhte hain)\n` +
        `2️⃣ *हिंदी* (Hindi — शुद्ध देवनागरी लिपि में)\n\n` +
        `*(Kripya 1 ya 2 likhein, ya direct apna sawal puchein / कृपया 1 या 2 लिखें या सीधे अपना सवाल पूछें)*`;

      sessionMemory.saveTurn(sender, {
        userText: text,
        agentReply: bilingualWelcome,
        intent: 'language_onboarding',
        outcome: 'success'
      });
      return { reply: bilingualWelcome, agent: 'Hermes Onboarding', pathType: 'FAST_PATH', durationMs: Date.now() - start };
    }

    const preferredLanguage = session.language || (hasDevanagari ? 'hindi' : 'hinglish');

    // Check for Owner/Admin/Founder explicit CRUD commands (e.g. "list users", "add dealer", "daily report")
    if (user?.role === 'owner' || user?.role === 'admin' || user?.role === 'founder') {
      const adminRes = await this.handleAdminCommand(text, user);
      if (adminRes.handled) {
        const durationMs = Date.now() - start;
        asyncLogger.log({
          sender, channel, agent: adminRes.agent, intent: 'admin_command',
          pathType: 'FAST_PATH', durationMs, status: 'Success', reply: adminRes.reply
        });
        return { reply: adminRes.reply, agent: adminRes.agent, pathType: 'FAST_PATH', durationMs };
      }
    }

    // Classify with context
    const { intent, complexity } = this.classify(text, sender, session);

    let result = null;
    let pathType = 'FAST_PATH';

    // Simple deterministic rate lookup (only if complexity < 0.5)
    if (complexity < 0.5) {
      if (intent === 'b2b_pricing') {
        result = b2bAgent.handle(text, user, session);
      } else if (intent === 'operations_tracking') {
        result = opsAgent.handle(text, user, session);
      } else if (intent === 'relationship_finance') {
        result = rmAgent.handle(text, user, session);
      }
    }

    // Human-like Hermes AI Reasoning Engine (Handles greetings, sales orders, conversational guidance)
    if (!result || !result.handled) {
      pathType = 'HERMES_ENGINE';
      const recentHistory = sessionMemory.getRecentHistory(sender, 4);
      const productMentioned = b2bAgent.detectProduct(text)?.name || session?.lastProduct || null;

      const aiResponse = await hermesBridge.process(text, user, productMentioned, recentHistory, preferredLanguage);
      result = {
        handled: true,
        reply: aiResponse.text,
        agent: 'Hermes AI Engine',
        confidence: 0.98,
        product: productMentioned
      };
    }

    // Validation
    const validatedReply = this.validate(result.reply);
    const durationMs = Date.now() - start;

    // Update Session Memory
    sessionMemory.saveTurn(sender, {
      userText: text,
      agentReply: validatedReply,
      intent,
      orderId: result.orderId || null,
      product: result.product || null,
      outcome: 'success'
    });

    // Async Buffered Logging
    asyncLogger.log({
      sender, channel, agent: result.agent, intent,
      pathType, durationMs, status: 'Success', reply: validatedReply
    });

    return {
      reply: validatedReply,
      agent: result.agent,
      pathType,
      durationMs
    };
  }

  validate(text) {
    if (!text || typeof text !== 'string') {
      return 'Namaste! Sharma Industries mein aapka swagat hai. Kaise help kar sakta hoon aapki?';
    }
    return text.trim();
  }
}

module.exports = new Orchestrator();
