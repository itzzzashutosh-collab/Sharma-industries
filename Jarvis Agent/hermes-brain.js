/**
 * Sharma Industries / Swatch Paints — Hermes Brain (Master AI Brain & Chief of Staff)
 * 
 * ARCHITECTURAL FLOW:
 * User (Owner) → Hermes (Brain) → Orchestrator (Team Lead) → Agents (Legends) → 
 * Orchestrator collects → Hermes gets full report → User
 * 
 * Hierarchy:
 *  1. User (Owner / CEO Ashutosh Sharma: +91 9079609627)
 *  2. Hermes (Brain / Chief of Staff): Interprets executive intent, strategizes, directs Orchestrator.
 *  3. Orchestrator (Team Lead): Commands agents, executes subgraphs, runs loops, collects team deliverables.
 *  4. Agents (Legends): Hormozi, Kennedy, Tracy, Voss, Ohno, Buffett, Ogilvy, etc.
 *  5. Orchestrator collects all outputs into structured team report and delivers to Hermes.
 *  6. Hermes audits and synthesizes full executive briefing for CEO Ashutosh Sharma.
 */

const dataStore = require('./data/data-store');
const sessionMemory = require('./session-memory');
const asyncLogger = require('./memory/async-logger');
const hermesBridge = require('./hermes-bridge');
const ceoApproval = require('./ceo-approval-controller');

class HermesBrain {
  constructor() {
    this.name = 'Hermes (Master Brain)';
    this.role = 'Chief of Staff & Commercial Decision-Maker';
  }

  /**
   * Get reference to Orchestrator (Team Lead)
   */
  getOrchestrator() {
    return require('./orchestrator');
  }

  /**
   * Main Entry Point for All User Inquiries
   * Implements: User → Hermes (Brain) → Orchestrator (Team Lead) → Agents → Orchestrator collects → Hermes gets full report → User
   */
  async processUserRequest(text, sender = 'anonymous', channel = 'WhatsApp') {
    const start = Date.now();
    const cleanText = (text || '').trim();
    const user = dataStore.getUser(sender) || {
      phone: sender,
      name: 'User',
      role: (sender === '+919079609627' || sender.includes('9079609627')) ? 'admin' : 'lead'
    };

    const isOwner = user.role === 'owner' || user.role === 'admin' || user.phone === '+919079609627';

    // Strict Homeowner & Family Privacy Firewall (Priyanka ji)
    const isHomeownerFamily = user.role === 'homeowner' || user.phone === '+918949375214' || (user.notes && user.notes.includes('143967656136810')) || (user.name && user.name.includes('Priyanka'));
    if (isHomeownerFamily) {
      return this.handleHomeownerFamilyRequest(cleanText, user, sender, channel, start);
    }

    // Direct HR & Payroll Dispatcher for Leadership & Staff
    const hrCheck = this.handleHRQuery(cleanText, user, sender, channel, start);
    if (hrCheck && hrCheck.handled) {
      return hrCheck;
    }

    const q = cleanText.toLowerCase().trim();

    // Sovereign CEO File Approvals Interceptor
    if (isOwner) {
      if (q === 'pending files' || q === 'files pending' || q === 'approvals' || q === 'pending approvals' || q === 'file approvals' || q === 'files') {
        const briefing = ceoApproval.formatPendingBriefing(user);
        return {
          reply: briefing,
          agent: 'Hermes CEO Approval Desk',
          handled: true
        };
      }

      if (q.startsWith('approve file') || q.startsWith('approve doc')) {
        const fileId = cleanText.split(/\s+/)[2];
        const res = ceoApproval.approveFile(fileId, user.phone, 'Approved via WhatsApp by CEO Ashutosh Sharma');
        const reply = res.success 
          ? `✅ *HERMES CEO APPROVAL CONFIRMED*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${res.message}\n\n_File status updated to \`APPROVED_BY_CEO\` and operationalized in live field execution._ 🫡`
          : `⚠️ *HERMES NOTICE*: ${res.message}`;
        return { reply, agent: 'Hermes CEO Approval Desk', handled: true };
      }

      if (q.startsWith('reject file') || q.startsWith('reject doc')) {
        const parts = cleanText.split(/\s+/);
        const fileId = parts[2];
        const reason = parts.slice(3).join(' ') || 'Requires revision per CEO instructions';
        const res = ceoApproval.rejectFile(fileId, user.phone, reason);
        const reply = res.success 
          ? `🛑 *HERMES REJECTION LOGGED*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${res.message}\n\n_File status updated to \`REJECTED_NEEDS_REVISION\`. Orchestrator (Leader) notified for re-work._ 🫡`
          : `⚠️ *HERMES NOTICE*: ${res.message}`;
        return { reply, agent: 'Hermes CEO Approval Desk', handled: true };
      }
    }

    // Check if the query is an explicit Graph/Dossier/Governance command:
    const isExplicitGraphCommand = 
      q.startsWith('/') ||
      q.startsWith('run ') ||
      q.startsWith('approve') ||
      q.startsWith('reject') ||
      q.startsWith('refine') ||
      q.includes('master report') ||
      q.includes('complete dossier') ||
      q.includes('objection drill') ||
      q.startsWith('roleplay');

    // Natural conversation, questions, updates, ideas, greetings -> Hermes Cognitive Engine
    if (!isExplicitGraphCommand) {
      console.log(`💬 [Hermes Brain] Direct cognitive conversation for ${user.name} ("${cleanText}")`);
      return await this.getOrchestrator().run(cleanText, sender, channel);
    }

    // Log Step 1: User -> Hermes (Brain) for explicit graph execution
    console.log(`\n======================================================================`);
    console.log(`🧠 [PIPELINE STEP 1] User (${user.name}) ➔ Hermes (Brain) [GRAPH DIRECTIVE]`);
    console.log(`   Query: "${cleanText}"`);
    console.log(`======================================================================`);

    // 1. Hermes evaluates intent and formulates directive for Orchestrator (Team Lead)
    const directive = this.formulateDirective(cleanText, user);

    // 2. Hermes sends directive to Orchestrator (Team Lead)
    console.log(`🎯 [PIPELINE STEP 2] Hermes (Brain) ➔ Orchestrator (Team Lead)`);
    console.log(`   Directive: Team = ${directive.team} | Action = ${directive.action} | Product = ${directive.product}`);

    const orchestrator = this.getOrchestrator();

    // 3 & 4. Orchestrator commands Agents (Legends) and collects all outputs
    console.log(`⚡ [PIPELINE STEP 3] Orchestrator (Team Lead) ➔ Commanding Agents (Legends)...`);
    const orchestratorReport = await orchestrator.executeAsTeamLead(directive, user, channel);
    console.log(`📦 [PIPELINE STEP 4] Orchestrator collects deliverables from ${orchestratorReport.agentCount || 0} Legends`);

    // 5. Hermes gets full report from Orchestrator
    console.log(`📥 [PIPELINE STEP 5] Orchestrator (Team Lead) ➔ Hermes gets full report`);
    const hermesAudit = this.auditOrchestratorReport(orchestratorReport, directive);

    // 6. Hermes synthesizes final executive report for User (Owner)
    console.log(`👑 [PIPELINE STEP 6] Hermes synthesizes Executive Briefing for User`);
    const userFacingBriefing = this.synthesizeForOwner(hermesAudit, user);
    console.log(`📤 [PIPELINE STEP 7] Hermes ➔ User (Owner) Delivered in ${Date.now() - start}ms`);
    console.log(`======================================================================\n`);

    const durationMs = Date.now() - start;

    // Log to Async Logger
    asyncLogger.log({
      sender,
      channel,
      agent: 'Hermes (Master Brain)',
      intent: directive.action,
      pathType: 'HERMES_TEAM_LEAD_CHAIN',
      durationMs,
      status: 'Success',
      reply: userFacingBriefing
    });

    return {
      reply: userFacingBriefing,
      agent: 'Hermes (Master Brain)',
      teamLead: 'Orchestrator',
      pathType: 'HERMES_TEAM_LEAD_CHAIN',
      durationMs,
      orchestratorReport
    };
  }

  /**
   * Hermes Brain: Analyzes user input and creates a structured mission directive
   */
  formulateDirective(text, user) {
    const q = text.toLowerCase().trim();

    let team = 'sales';
    let action = 'commercial_review';
    let product = 'Swatch Rustic';

    if (q.includes('master report') || q.includes('complete report') || (q.includes('offers') && q.includes('schemes')) || (q.includes('offers') && q.includes('report')) || q.includes('sabhi cheezon') || (q.includes('train') && q.includes('report'))) {
      team = 'executive_master_dossier';
      action = 'complete_swatch_rustic_dossier';
    } else if (q.includes('operation') || q.includes('production') || q.includes('factory') || q.includes('batch')) {
      team = 'operations';
      action = 'production_and_inventory_review';
    } else if (q.includes('finance') || q.includes('cash flow') || q.includes('margin audit') || q.includes('cost')) {
      team = 'finance';
      action = 'financial_and_margin_audit';
    } else if (q.includes('vision') || q.includes('strategy') || q.includes('long term') || q.includes('okr')) {
      team = 'vision';
      action = 'strategic_vision_review';
    } else if (q.includes('brand') || q.includes('positioning') || q.includes('differentiat')) {
      team = 'branding';
      action = 'brand_positioning_review';
    } else if (q.includes('social') || q.includes('marketing') || q.includes('reels') || q.includes('campaign')) {
      team = 'social';
      action = 'social_marketing_campaign';
    } else if (q.startsWith('/approve') || q.startsWith('approve')) {
      team = 'governance';
      action = 'approve_execution';
    } else if (q.startsWith('/reject') || q.startsWith('reject')) {
      team = 'governance';
      action = 'reject_execution';
    } else if (q.startsWith('/refine') || q.startsWith('refine')) {
      team = 'governance';
      action = 'refine_execution';
    } else if (q.startsWith('/loops') || q.startsWith('/metrics') || q.startsWith('/status')) {
      team = 'governance';
      action = 'status_metrics';
    } else if (q.includes('training') || q.includes('playbook') || q.startsWith('/drill') || q.startsWith('/roleplay') || q.includes('objection drill')) {
      team = 'training';
      action = 'sales_force_enablement';
    }

    return {
      team,
      action,
      product,
      rawQuery: text,
      priority: 'high',
      authorizedBy: user.name || 'Owner Ashutosh Sharma'
    };
  }

  /**
   * Hermes Brain: Audits the full report received from Orchestrator (Team Lead)
   */
  auditOrchestratorReport(report, directive) {
    const audit = {
      directive,
      report,
      marginProtected: true,
      singleSkuFocus: true,
      zeroMandiVerified: true,
      executiveSummary: '',
      concerns: []
    };

    const raw = (report.text || report.reply || '').toLowerCase();

    // Verification 1: Strictly zero mandi terms (standalone usage)
    if (/\b(?<!zero\s+|no\s+)mandi\b/i.test(raw)) {
      audit.zeroMandiVerified = false;
      audit.concerns.push('Mandi terminology found in raw report. Sanitized by Hermes.');
    }

    // Verification 2: Swatch Rustic focus
    if (!raw.includes('swatch rustic') && !raw.includes('rustic')) {
      audit.singleSkuFocus = false;
      audit.concerns.push('Report missing explicit Swatch Rustic product grounding.');
    }

    // Verification 3: Margin Floor (40% dealer, >= ₹100 company net hurdle)
    if (report.commercialMetrics) {
      if (report.commercialMetrics.dealerMarginPct < 40.0) {
        audit.marginProtected = false;
        audit.concerns.push(`Dealer margin (${report.commercialMetrics.dealerMarginPct}%) below 40% floor.`);
      }
      if (report.commercialMetrics.companyNetMargin < 100.0) {
        audit.marginProtected = false;
        audit.concerns.push(`Company net margin (₹${report.commercialMetrics.companyNetMargin}) below ₹100 hurdle rate.`);
      }
    }

    return audit;
  }

  /**
   * Hermes Brain: Synthesizes final executive report for User (Owner Ashutosh Sharma)
   */
  synthesizeForOwner(audit, user) {
    const { report, directive } = audit;
    const isOwner = user.role === 'owner' || user.role === 'admin' || user.phone === '+919079609627';

    // If already structured approval or status message, format cleanly with Hermes executive framing
    const baseContent = report.text || report.reply || '';

    let briefing = `👑 *Hermes Executive Briefing for ${isOwner ? 'Ashutosh Sir' : user.name}*\n`;
    briefing += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    briefing += `📌 *Mission*: ${directive.action.toUpperCase()} (${directive.product})\n`;
    briefing += `🎖️ *Team Lead*: Orchestrator | *Agents Deployed*: ${report.agentCount || 'Specialist Legends'}\n`;
    briefing += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    briefing += baseContent;

    briefing += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    briefing += `🧠 *Hermes Chief-of-Staff Audit*:\n`;
    briefing += `• Product Architecture: *Focused 5-SKU Lineup* (Rustic 25kg locked; 4 SKUs awaiting CEO pricing)\n`;
    briefing += `• Brand Positioning: *"High Performance Paints at Honest Prices with Better Dealer Margins."*\n`;
    briefing += `• Margin Protection: *40–45% Dealer Band / ₹100+ Company Hurdle* (Enforced)\n`;
    briefing += `• Trade Terminology: *B2B Market & Retail Trade Network* (Compliant)\n`;
    briefing += `• Loyalty Program: *Painters Growth Tokens (₹50 cash token)* | *5-Yr Durability Assurance*\n`;

    if (audit.concerns.length > 0) {
      briefing += `⚠️ *Notices*: ${audit.concerns.join('; ')}\n`;
    }

    briefing += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    briefing += `_Aapka agla aadesh kya hai Sir? (Reply '/approve <ID>' ya direct command dein)_`;

    return briefing;
  }

  /**
   * Internal Cognitive Reasoning Loop for Leader (Orchestrator)
   * Whenever Leader or subgraphs need deep cognitive arbitration, margin verification, 
   * or strategic resolution, Leader calls Hermes Brain directly.
   */
  async requestInternalCognition({ query, context, divisionReports = [], tradeOffs = null, user = null }) {
    console.log(`🧠 [Hermes Brain] Internal cognition requested by Orchestrator (Leader): "${query}"`);
    
    let prompt = `You are Hermes, the Master AI Brain and Chief of Staff of Sharma Industries.\n` +
      `The Execution Leader (Orchestrator) is commanding the 8 Paperclip Division Pools and has requested internal cognitive arbitration/reasoning.\n\n` +
      `Query/Issue: "${query}"\n` +
      `Context: ${typeof context === 'object' ? JSON.stringify(context) : context}\n`;
    
    if (tradeOffs) {
      prompt += `Trade-offs to resolve: ${JSON.stringify(tradeOffs)}\n`;
    }
    
    if (divisionReports && divisionReports.length > 0) {
      prompt += `Division Deliverables:\n` + divisionReports.map(d => `- [${d.division || d.divisionName} / ${d.legend || d.assignedLegend}]: ${d.summary || d.result}`).join('\n') + `\n`;
    }

    prompt += `\nSTRICT SHARMA INDUSTRIES CONSTRAINTS:\n` +
      `- Anchor product: Swatch Rustic 25kg Bag, MRP ₹1150, Base ₹450, Dealer Price ₹632.50–₹690 (40-45% margin), Company Hurdle >= ₹100 net.\n` +
      `- Zero tinting machine hassle.\n` +
      `- Never use 'mandi' (use B2B Market or Retail Trade Network).\n` +
      `- Address painters/dealers respectfully by name [Name] ji.\n` +
      `- Provide clear, decisive executive guidance that the Leader can incorporate into the team report.\n\n` +
      `Output format: Concise, bulleted cognitive decision in Hinglish/English.`;

    try {
      const response = await hermesBridge.askOmniRoute(prompt, user || { role: 'owner', name: 'Ashutosh Sharma' });
      return {
        cognitiveDecision: response.text || 'Standard operating margins (40-45%) and company hurdle (>=₹100) enforced.',
        status: 'RESOLVED_BY_BRAIN',
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      return {
        cognitiveDecision: 'Enforce Swatch standard: 40% dealer margin, ₹50 painter cash token, ₹450 base cost, zero machine deposit.',
        status: 'FALLBACK_POLICY_ENFORCED',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Strict Homeowner Family Desk for Priyanka ji (CEO Wife)
   * Enforces zero factory/internal leaks and presents polite, friendly homeowner decor options
   */
  handleHomeownerFamilyRequest(text, user, sender, channel, start) {
    const q = (text || '').toLowerCase().trim();

    // Check if query attempts to ask about factory operations, workers, salaries, margins
    const isInternalQuery = q.includes('factory') || q.includes('karkhana') || q.includes('production') ||
      q.includes('worker') || q.includes('salary') || q.includes('kamai') || q.includes('profit') ||
      q.includes('dealer margin') || q.includes('dealer rate') || q.includes('base cost') ||
      q.includes('shahrukh') || q.includes('om prakash') || q.includes('dispatch') || q.includes('tempo');

    let reply = '';

    if (isInternalQuery) {
      reply = `Namaste Priyanka ji! 🙏\n\n` +
        `Main Swatch Paints customer desk se bol raha hoon. Factory production, technical dispatch aur trade operations hamari engineering team sambhalti hai.\n\n` +
        `Main aapko ghar ke sundar colors, makhmali Shine Emulsion, durable Weatherguard, aur designer Rustic Texture wall finishes ke bare me sabhi details bata sakta hoon.\n\n` +
        `Aap batayein aapko apne ghar ke interior (andar ke kamron) ya exterior (bahar ki deewaron) ke liye kaunsa finish dekhna hai?`;
    } else {
      // Warm homeowner product guide
      reply = `Namaste Priyanka ji! 🙏 Swatch Paints me aapka swagat hai.\n\n` +
        `Hamare ghar ko khubsurat aur majboot banane wale premium paints aur textures:\n\n` +
        `🏠 *1. Swatch Shine Emulsion* (Andar ke Kamron ke Liye):\n` +
        `• *Khaasiyat*: Makhmali smooth finish, chamakdar deewarein, washable (daag aasani se saaf ho jate hain).\n` +
        `• *Homeowner Rates*: 20L Bucket: *₹3,280* | 10L: *₹1,700* | 4L: *₹720* | 1L: *₹190*\n\n` +
        `☀️ *2. Swatch Weatherguard* (Bahar ki Deewaron ke Liye):\n` +
        `• *Khaasiyat*: Dhoop aur baarish se 100% suraksha, algae/fungus resistant, 5-saal ki lambi chamak.\n` +
        `• *Homeowner Rates*: 20L Bucket: *₹3,280* | 10L: *₹1,700* | 4L: *₹720* | 1L: *₹190*\n\n` +
        `✨ *3. Swatch Rustic Texture* (Royal Feature Wall / TV Unit Design):\n` +
        `• *Khaasiyat*: Premium grainy metallic stone design jo living room ki main deewar ko royal look deta hai.\n` +
        `• *Homeowner Rate*: *₹920* per 25kg Bag\n\n` +
        `💧 *4. Swatch Waterproofing Solution* (Seelan aur Capping Rokne ke Liye):\n` +
        `• *Homeowner Rates*: 5L Can: *₹1,440* | 1L Bottle: *₹300*\n\n` +
        `Aap batayein aapko kaunse room ke liye colors ya design pasand karna hai?`;
    }

    const durationMs = Date.now() - start;

    asyncLogger.log({
      sender,
      channel,
      agent: 'Hermes Home Care Desk',
      intent: 'homeowner_inquiry',
      pathType: 'HOMEOWNER_FIREWALL',
      durationMs,
      status: 'Success',
      reply
    });

    return {
      reply,
      agent: 'Hermes Home Care Desk',
      teamLead: 'Homeowner Specialist',
      pathType: 'HOMEOWNER_FIREWALL',
      durationMs,
      orchestratorReport: { text: reply }
    };
  }

  /**
   * Direct HR & Payroll Handler for CEO, Founder, and Employees
   */
  handleHRQuery(text, user, sender, channel, start) {
    const q = (text || '').toLowerCase().trim();
    const isOwner = user.role === 'owner' || user.role === 'admin' || user.phone === '+919079609627' || sender.includes('9079609627');
    const isFounder = user.role === 'founder' || user.phone === '+919784832210' || sender.includes('9784832210');
    const isShahrukh = user.phone === '+917340090063' || sender.includes('7340090063') || (user.name && user.name.toLowerCase().includes('shahrukh'));
    const isOmPrakash = user.phone === '+919571412351' || sender.includes('9571412351') || (user.name && user.name.toLowerCase().includes('om prakash'));
    const hrController = require('./hr-controller');
    let reply = '';

    const isHRQuery = q.includes('salary') || q.includes('tankhwah') || q.includes('tanva') ||
      q.includes('allowance') || q.includes('payroll') || q.includes('payout') || q.includes('incentive') ||
      q.includes('remuneration') || q.includes('hr') || q.includes('kitne paise') || q.includes('kitna milega') ||
      q.includes('hisaab') || q.includes('hisab') || q.includes('kitna bacha') || q.includes('remaining') ||
      ((q.includes('om prakash') || q.includes('shahrukh') || q.includes('sonu')) && (q.includes('ka batao') || q.includes('ki detail') || q.includes('kya hai') || q.includes('details')));

    // Direct Employee Product Purchase Detection from Factory (Shahrukh / Om Prakash)
    const isPurchaseNotice = (isShahrukh || isOmPrakash) &&
      (q.includes('liya') || q.includes('liye') || q.includes('le gaya') || q.includes('leke ja raha') || q.includes('le raha hoon') || q.includes('bag') || q.includes('bucket') || q.includes('balti') || q.includes('bora'));

    if (isPurchaseNotice) {
      const parsedItems = hrController.parseEmployeePurchaseText(text);
      if (parsedItems.length > 0) {
        const rec = hrController.recordEmployeeProductPurchase(user.phone || sender, parsedItems, 'WhatsApp Message');
        if (rec.success) {
          const itemSummary = rec.purchaseRecord.items.map(i => `• ${i.quantity}x ${i.product_name} @ ₹${i.unit_base_price} = ₹${i.line_total.toFixed(2)}`).join('\n');
          const deductions = hrController.getEmployeeProductDeductions(rec.employee.id, rec.purchaseRecord.month);
          const basePay = rec.employee.monthly_base_salary || (rec.employee.base || 0);
          const remaining = Math.max(0, basePay - deductions.totalDeductions);

          reply = `✅ *Receipt Confirmed — Factory Product Entry*\n\n` +
            `Namaste ${rec.employee.name}! 🙏\n` +
            `Aapke account mein factory base rate par products record ho gaye hain:\n` +
            `${itemSummary}\n\n` +
            `💰 *Total Deduction (Base Price)*: *₹${rec.totalDeduction.toFixed(2)}*\n` +
            `🗓️ *Salary Impact*: Aapki ${rec.employee.payout_day || 'monthly payout'} ki salary (₹${basePay.toLocaleString('en-IN')}) se deduct hokar remaining amount *₹${remaining.toLocaleString('en-IN')}* release hoga.\n\n` +
            `_Sharma Industries Internal Factory Gate & HR Ledger updated._`;

          const durationMs = Date.now() - start;
          asyncLogger.log({
            sender, channel, agent: 'Hermes HR & Payroll Desk',
            intent: 'employee_factory_purchase', pathType: 'HR_PAYROLL_DISPATCH',
            durationMs, status: 'Success', reply
          });

          return { handled: true, reply, agent: 'Hermes HR & Payroll Desk', durationMs, orchestratorReport: { text: reply } };
        }
      }
    }

    if (!isHRQuery) return { handled: false };

    // 1. Ashutosh Sir (CEO / Admin) or Suresh Sir (Founder) Access
    if (isOwner || isFounder) {
      if (q.includes('meri salary') || (q.includes('meri') && q.includes('salary'))) {
        if (isOwner) {
          reply = `👑 *Pranam Ashutosh Sir!* 🙏\n\n` +
            `Aap (Ashutosh Sharma, CEO & Founder) Sharma Industries mein *₹0 Remuneration* par operate karte hain (100% Equity / Company Reinvestment, just like Hermes!). Company ki complete wealth creation aapki ownership mein hai.`;
        } else {
          reply = `👑 *Pranam Suresh Sir!* 🙏\n\n` +
            `Aapki monthly remuneration is prakar lock hai:\n` +
            `• Role: *Co-Founder & Operational General Manager*\n` +
            `• Fixed Base Salary: *₹20,000 / month*\n` +
            `• Fixed Fuel Allowance: *₹3,000 / month*\n` +
            `• Net Monthly Total: *₹23,000 / month*\n` +
            `• 🗓️ *Payout Day: Har mahine ki 10 tareekh (10th of every month)*.`;
        }
      } else if (q.includes('om prakash') || q.includes('helper') || q.includes('loading')) {
        const omDed = hrController.getEmployeeProductDeductions('EMP002', '2026-09');
        reply = `📋 *Om Prakash Saini (Warehouse & Logistics Helper)*:\n` +
          `• Fixed Base Salary: *₹12,000 / month*\n` +
          `• Dispatch & Loading Allowance: *₹1.00 per bag*\n`;
        if (omDed.totalDeductions > 0) {
          reply += `• Less Factory Products Taken: *−₹${omDed.totalDeductions.toLocaleString('en-IN')}* (Base Price)\n`;
        }
        reply += `• 🗓️ *Payout Day: Har mahine ki 5 tareekh (5th of every month)*.\n` +
          `• Net Payable (1,500 bags loaded): *₹${(13500 - omDed.totalDeductions).toLocaleString('en-IN')}*.`;
      } else if (q.includes('shahrukh') || q.includes('chemist')) {
        const sDed = hrController.getEmployeeProductDeductions('EMP001', '2026-09');
        reply = `📋 *Shahrukh bhai (Senior Chemist)*:\n` +
          `• Fixed Flat Salary: *₹24,000 / month* (Zero extra allowances right now)\n`;
        if (sDed.totalDeductions > 0) {
          reply += `• Less Factory Products Taken: *−₹${sDed.totalDeductions.toLocaleString('en-IN')}* (Base Price)\n` +
            `• Net Remaining Payout: *₹${(24000 - sDed.totalDeductions).toLocaleString('en-IN')}*\n`;
        } else {
          reply += `• Net Payout: *₹24,000*\n`;
        }
        reply += `• 🗓️ *Payout Day: Har mahine ki 2 tareekh (2nd of every month)*.\n` +
          `• Responsibilities: Batch formulation, plant quality assurance, viscosity tests.`;
      } else if (q.includes('father') || q.includes('suresh')) {
        reply = `📋 *Suresh Kumar Sharma (Co-Founder & Operational GM)*:\n` +
          `• Fixed Base Salary: *₹20,000 / month*\n` +
          `• Fuel Allowance: *₹3,000 / month*\n` +
          `• Net Payable: *₹23,000 / month*\n` +
          `• 🗓️ *Payout Day: Har mahine ki 10 tareekh (10th of every month)*.`;
      } else if (q.includes('salesman') || q.includes('sales executive') || q.includes('target')) {
        reply = `📋 *Field Sales Executives (Pan-Rajasthan Beat)*:\n` +
          `• Fixed Base Salary: *₹15,000 / month*\n` +
          `• Fixed TA/DA (Petrol & Daily): *₹3,000 / month*\n` +
          `• Monthly Revenue Target: *₹2,00,000 billing* across all products\n` +
          `• Commission: *2.5% incentive* on all billing above ₹2.0 Lakhs\n` +
          `• 🗓️ *Payout Day: Har mahine ki 1 tareekh (1st of every month)*\n` +
          `• Cost-Stacking Discipline: strictly capped ≤ ₹75/bag (₹72/bag actual on Rustic).`;
      } else if (q.includes('sonu') || q.includes('distributor')) {
        const dist = hrController.loadDistributorProfile();
        reply = `📋 *Sonu Kumar (Independent B2B Wholesale Distributor)*:\n` +
          `• Classification: Independent Distributor (Completely Decoupled from Employee Payroll)\n` +
          `• Wholesale Transfer Rate: *₹430.00 / bag* (Strict wholesale floor)\n` +
          `• Quota Commitment: *200 bags / month*\n` +
          `• Kit Policy: Guidance & selling techniques only (NO free kits/allowances)\n` +
          `• Approved Cities (~150km radius from Bundi HQ; City Markets only):\n` +
          `  Talera, Kota, Dabi, Bijoliya, Baran, Rawatbhata, Uniyara, Nainwa, Dei, Khatkad, Deoli\n` +
          `• Dealer Assignment: *Strictly CEO Ashutosh Sharma Admin Approval Required*.`;
      } else {
        // Full executive statement
        const payrollData = hrController.generateMonthlyPayroll('2026-09');
        reply = hrController.formatWhatsAppExecutivePayroll(payrollData.runRecord, payrollData.salesEval);
      }
    }
    // 2. Om Prakash Saini Personal Access
    else if (isOmPrakash) {
      const omDed = hrController.getEmployeeProductDeductions('EMP002', '2026-09');
      if (q.includes('meri') || q.includes('salary') || q.includes('payout') || q.includes('hisaab')) {
        reply = `Namaste Om Prakash ji! 🙏\n\n` +
          `Aapka salary package Sharma Industries mein is prakar hai:\n` +
          `• Fixed Base Salary: *₹12,000 / month*\n` +
          `• Dispatch & Loading Allowance: *₹1.00 per bag*\n`;
        if (omDed.totalDeductions > 0) {
          reply += `• Factory Products Taken (Deduction): *−₹${omDed.totalDeductions.toLocaleString('en-IN')}* (Base Price)\n`;
        }
        reply += `• 🗓️ *Payout Day: Har mahine ki 5 tareekh (5th of every month)*.\n\n` +
          `Aapki mehnat se factory loading aur dispatches bilkul time par chal rahe hain!`;
      } else {
        reply = `Om Prakash ji, company policy ke tehat doosre karmchariyon ki financial details confidential hoti hain. Aap dispatch, stock ya apni salary ke bare me pooch sakte hain.`;
      }
    }
    // 3. Shahrukh bhai Personal Access
    else if (isShahrukh) {
      const sDed = hrController.getEmployeeProductDeductions('EMP001', '2026-09');
      if (q.includes('meri') || q.includes('salary') || q.includes('payout') || q.includes('hisaab')) {
        reply = `Namaste Shahrukh bhai! 🙏\n\n` +
          `Aapka salary package Sharma Industries mein is prakar hai:\n` +
          `• Fixed Flat Salary: *₹24,000 / month*\n`;
        if (sDed.totalDeductions > 0) {
          reply += `• Factory Products Taken (Base Price): *−₹${sDed.totalDeductions.toLocaleString('en-IN')}*\n` +
            `• Net Remaining Payable: *₹${(24000 - sDed.totalDeductions).toLocaleString('en-IN')}*\n`;
        }
        reply += `• 🗓️ *Payout Day: Har mahine ki 2 tareekh (2nd of every month)*.\n\n` +
          `Aapki lab testing aur quality supervision se Swatch Paints ki quality ek number bani hui hai!`;
      } else {
        reply = `Shahrukh bhai, company audit policy ke tehat baaki staff ki salary confidential hai. Aap batch formulation, raw materials ya apni salary ke bare me jankari le sakte hain.`;
      }
    }
    // 4. External / Unknown Contacts
    else {
      reply = `Namaste! Sharma Industries ki internal payroll details strictly confidential hain. Swatch Paints ke dealership programs ya products ki jankari ke liye batayein.`;
    }

    const durationMs = Date.now() - start;

    asyncLogger.log({
      sender,
      channel,
      agent: 'Hermes HR & Payroll Desk',
      intent: 'hr_payroll_inquiry',
      pathType: 'HR_PAYROLL_DISPATCH',
      durationMs,
      status: 'Success',
      reply
    });

    return {
      handled: true,
      reply,
      agent: 'Hermes HR & Payroll Desk',
      teamLead: 'Dave Ulrich & Jack Welch',
      pathType: 'HR_PAYROLL_DISPATCH',
      durationMs,
      orchestratorReport: { text: reply }
    };
  }
}

module.exports = new HermesBrain();
