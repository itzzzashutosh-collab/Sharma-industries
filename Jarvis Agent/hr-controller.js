/**
 * Swatch Paints — HR & Talent Controller (Division 7)
 * Powered by Hermes AI and Global HR Legends (Jack Welch, Laszlo Bock, Dave Ulrich, Patrick Lencioni, Mark Roberge)
 *
 * GOVERNANCE RULES (CEO LOCKED: 2026-09-18):
 * 1. Independent Distributor Separation:
 *    - Sonu Kumar (+91 9057501926) is strictly an Independent Wholesale Distributor (NOT on internal payroll).
 *    - No company kit, no free samples, no allowances provided. Guidance & sales techniques only.
 *    - Territory: 11 Approved City Markets only (Talera, Kota City, Dabi City, Bijoliya, Baran, Rawatbhata, Uniyara, Nainwa, Dei, Khatkad, Deoli — max ~150km radius from Bundi).
 *    - Dealer access granted STRICTLY upon CEO Ashutosh Sharma's approval.
 * 2. Employee Factory Product Purchase Deductions:
 *    - Staff (Shahrukh bhai, Om Prakash Saini) taking products from factory are charged at FACTORY BASE PRICE.
 *    - Multiple products supported. Deducted monthly from salary.
 *    - Auto-matched by phone number via invoice or WhatsApp message.
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'employee_payroll_ledger.json');
const DISTRIBUTOR_PATH = path.join(__dirname, 'data', 'sonu_kumar_distributor_profile.json');

// Factory Base Cost Price Catalog for Employee Purchases
const FACTORY_BASE_PRICES = {
  'rustic': { sku: 'SW-RUSTIC-TEX-01', name: 'Swatch Rustic Texture (25kg Bag)', base_price: 450.00 },
  'roller': { sku: 'SW-ROLLER-TEX-02', name: 'Swatch Roller Coat (25kg Bag)', base_price: 500.00 },
  'weatherguard_20l': { sku: 'SW-WG-EMUL-20L', name: 'Swatch Weatherguard (20L Bucket)', base_price: 2000.00 },
  'weatherguard_10l': { sku: 'SW-WG-EMUL-10L', name: 'Swatch Weatherguard (10L Bucket)', base_price: 1000.00 },
  'weatherguard_4l': { sku: 'SW-WG-EMUL-4L', name: 'Swatch Weatherguard (4L Bucket)', base_price: 400.00 },
  'weatherguard_1l': { sku: 'SW-WG-EMUL-1L', name: 'Swatch Weatherguard (1L Pack)', base_price: 100.00 },
  'shine_20l': { sku: 'SW-SHINE-EMUL-20L', name: 'Swatch Shine Emulsion (20L Bucket)', base_price: 2000.00 },
  'shine_10l': { sku: 'SW-SHINE-EMUL-10L', name: 'Swatch Shine Emulsion (10L Bucket)', base_price: 1000.00 },
  'shine_4l': { sku: 'SW-SHINE-EMUL-4L', name: 'Swatch Shine Emulsion (4L Bucket)', base_price: 400.00 },
  'shine_1l': { sku: 'SW-SHINE-EMUL-1L', name: 'Swatch Shine Emulsion (1L Pack)', base_price: 100.00 },
  'waterproofing_5l': { sku: 'SW-WP-SOL-5L', name: 'Swatch Waterproofing (5L Can)', base_price: 650.00 },
  'waterproofing_1l': { sku: 'SW-WP-SOL-1L', name: 'Swatch Waterproofing (1L Bottle)', base_price: 130.00 },
  'topcoat_5l': { sku: 'SW-TOP-COAT-5L', name: 'Swatch Top Coat (5L Can)', base_price: 1250.00 },
  'topcoat_1l': { sku: 'SW-TOP-COAT-1L', name: 'Swatch Top Coat (1L Bottle)', base_price: 250.00 }
};

function loadLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    throw new Error(`Ledger file not found at ${LEDGER_PATH}`);
  }
  return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));
}

function saveLedger(ledger) {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2), 'utf-8');
}

function loadDistributorProfile() {
  if (fs.existsSync(DISTRIBUTOR_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DISTRIBUTOR_PATH, 'utf-8'));
    } catch (e) {}
  }
  return null;
}

/**
 * Resolve employee by phone or ID
 */
function resolveEmployee(phoneOrId) {
  const ledger = loadLedger();
  const clean = String(phoneOrId || '').replace(/[^0-9]/g, '');

  return ledger.employees.find(e => {
    const eClean = String(e.phone || '').replace(/[^0-9]/g, '');
    return e.id === phoneOrId || (clean && eClean && (eClean.includes(clean) || clean.includes(eClean)));
  }) || null;
}

/**
 * Record Employee Factory Product Purchase (Supports Multiple Products at Factory Base Price)
 */
function recordEmployeeProductPurchase(phoneOrId, items = [], source = 'WhatsApp / Invoice') {
  const ledger = loadLedger();
  const emp = resolveEmployee(phoneOrId);

  if (!emp) {
    return { success: false, message: `Employee not found for identifier: ${phoneOrId}` };
  }

  if (!ledger.employee_factory_purchases) {
    ledger.employee_factory_purchases = [];
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const monthStr = dateStr.slice(0, 7);

  const purchaseItems = [];
  let totalDeduction = 0;

  for (const item of items) {
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    const key = (item.key || item.productKey || 'rustic').toLowerCase();
    const prod = FACTORY_BASE_PRICES[key] || FACTORY_BASE_PRICES['rustic'];
    const lineTotal = prod.base_price * qty;

    purchaseItems.push({
      sku: prod.sku,
      product_name: prod.name,
      quantity: qty,
      unit_base_price: prod.base_price,
      line_total: lineTotal
    });

    totalDeduction += lineTotal;
  }

  const purchaseRecord = {
    purchase_id: `PUR-${dateStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    employee_id: emp.id,
    employee_name: emp.name,
    phone: emp.phone,
    date: dateStr,
    month: monthStr,
    items: purchaseItems,
    total_deduction: totalDeduction,
    deduction_status: `SCHEDULED_FOR_${emp.payout_day ? emp.payout_day.toUpperCase() : 'MONTHLY_PAYOUT'}`,
    recorded_via: source,
    notes: `Taken from factory; charged strictly at Factory Base Price (₹${totalDeduction.toFixed(2)})`
  };

  ledger.employee_factory_purchases.push(purchaseRecord);
  saveLedger(ledger);

  return {
    success: true,
    purchaseRecord,
    employee: emp,
    totalDeduction
  };
}

/**
 * Parse Natural Language text from employee for product purchases
 * e.g., "Mene factory se 2 bag rustic texture aur 1 bucket weatherguard liya"
 */
function parseEmployeePurchaseText(text) {
  const t = (text || '').toLowerCase();
  const items = [];

  // 1. Rustic Texture
  const rusticMatch = t.match(/(\d+)\s*(?:bag|bora|bori|packet|baste)?\s*(?:rustic|texture|swatch rustic)/);
  if (rusticMatch) {
    items.push({ key: 'rustic', qty: parseInt(rusticMatch[1], 10) });
  } else if (t.includes('rustic') || t.includes('texture')) {
    const num = t.match(/(\d+)/);
    items.push({ key: 'rustic', qty: num ? parseInt(num[1], 10) : 1 });
  }

  // 2. Roller Coat
  const rollerMatch = t.match(/(\d+)\s*(?:bag|bora|bori)?\s*(?:roller|roller coat)/);
  if (rollerMatch) {
    items.push({ key: 'roller', qty: parseInt(rollerMatch[1], 10) });
  }

  // 3. Weatherguard Emulsion
  const wgMatch = t.match(/(\d+)\s*(?:bucket|balti|drum|can|pack)?\s*(?:weatherguard|weather guard|exterior)/);
  if (wgMatch) {
    const sizeMatch = t.match(/(20|10|4|1)\s*(?:l|litre|liter)/);
    const size = sizeMatch ? sizeMatch[1] : '20';
    items.push({ key: `weatherguard_${size}l`, qty: parseInt(wgMatch[1], 10) });
  }

  // 4. Shine Emulsion
  const shineMatch = t.match(/(\d+)\s*(?:bucket|balti|drum|can|pack)?\s*(?:shine|shine emulsion|interior)/);
  if (shineMatch) {
    const sizeMatch = t.match(/(20|10|4|1)\s*(?:l|litre|liter)/);
    const size = sizeMatch ? sizeMatch[1] : '20';
    items.push({ key: `shine_${size}l`, qty: parseInt(shineMatch[1], 10) });
  }

  // 5. Waterproofing
  const wpMatch = t.match(/(\d+)\s*(?:can|bottle|pack)?\s*(?:waterproof|waterproofing|water proof)/);
  if (wpMatch) {
    const sizeMatch = t.match(/(5|1)\s*(?:l|litre|liter)/);
    const size = sizeMatch ? sizeMatch[1] : '5';
    items.push({ key: `waterproofing_${size}l`, qty: parseInt(wpMatch[1], 10) });
  }

  return items;
}

/**
 * Get all product purchase deductions for an employee in a given month
 */
function getEmployeeProductDeductions(empIdOrPhone, monthStr) {
  const ledger = loadLedger();
  const purchases = ledger.employee_factory_purchases || [];
  const clean = String(empIdOrPhone || '').replace(/[^0-9]/g, '');

  const matches = purchases.filter(p => {
    const pClean = String(p.phone || '').replace(/[^0-9]/g, '');
    const empMatch = p.employee_id === empIdOrPhone || (clean && pClean && (pClean.includes(clean) || clean.includes(pClean)));
    const monthMatch = !monthStr || p.month === monthStr;
    return empMatch && monthMatch;
  });

  const totalDeductions = matches.reduce((sum, p) => sum + (p.total_deduction || 0), 0);
  return { totalDeductions, purchases: matches };
}

/**
 * Field Sales Executive Compensation Evaluation (Revenue Amount Target Model)
 */
function evaluateSalesExecutive(actualBilling = 200000, targetBilling = 200000, baseSalary = 15000, tadaAllowance = 3000) {
  const extraRevenue = Math.max(0, actualBilling - targetBilling);
  const revenueIncentive = extraRevenue * 0.025; // 2.5% commission on revenue above target
  const totalPayable = baseSalary + tadaAllowance + revenueIncentive;
  const attainmentPct = ((actualBilling / targetBilling) * 100).toFixed(1);

  let tier = '';
  let statusEmoji = '';

  if (actualBilling >= targetBilling * 1.5) {
    tier = 'Tier 1: Elite Performer (150%+ Quota)';
    statusEmoji = '👑';
  } else if (actualBilling >= targetBilling * 1.2) {
    tier = 'Tier 1: Star Performer (120%+ Quota)';
    statusEmoji = '🌟';
  } else if (actualBilling >= targetBilling) {
    tier = 'Tier 2: Target Achieved (100% Quota)';
    statusEmoji = '✅';
  } else if (actualBilling >= targetBilling * 0.8) {
    tier = 'Tier 3: Near Hurdle (Coaching Needed)';
    statusEmoji = '⚠️';
  } else {
    tier = 'Tier 4: Critical Deficit (Jack Welch Review)';
    statusEmoji = '🚨';
  }

  return {
    targetBilling,
    actualBilling,
    attainmentPct: parseFloat(attainmentPct),
    baseSalary,
    tadaAllowance,
    extraRevenue,
    revenueIncentive,
    totalPayable,
    tier,
    statusEmoji
  };
}

/**
 * Monthly Corporate Payroll Generation with Factory Product Deductions
 */
function generateMonthlyPayroll(monthStr = '2026-09', options = {}) {
  const repBilling = options.salesBilling !== undefined ? options.salesBilling : 200000;
  const omBagsLoaded = options.omBagsLoaded !== undefined ? options.omBagsLoaded : 1500;

  const salesEval = evaluateSalesExecutive(repBilling, 200000, 15000, 3000);

  // Fetch product purchase deductions for Shahrukh bhai and Om Prakash
  const shahrukhPurchases = getEmployeeProductDeductions('EMP001', monthStr);
  const omPurchases = getEmployeeProductDeductions('EMP002', monthStr);

  const breakdown = [
    {
      id: 'EXEC002',
      name: 'Suresh Kumar Sharma',
      role: 'Co-Founder & Operational General Manager',
      division: 'Leadership / Operations',
      phone: '+91 9784832210',
      base: 20000,
      allowances: 3000, // Fuel allowance
      product_deductions: 0,
      net_payable: 23000,
      payout_day: '10th of month',
      remarks: 'Fixed Base (₹20k) + Fuel Allowance (₹3k)'
    },
    {
      id: 'EMP001',
      name: 'Shahrukh bhai',
      role: 'Senior Chemist',
      division: 'Operations',
      phone: '+91 7340090063',
      base: 24000,
      allowances: 0,
      product_deductions: shahrukhPurchases.totalDeductions,
      net_payable: Math.max(0, 24000 - shahrukhPurchases.totalDeductions),
      payout_day: '2nd of month',
      remarks: shahrukhPurchases.totalDeductions > 0
        ? `Base ₹24,000 less ₹${shahrukhPurchases.totalDeductions.toLocaleString('en-IN')} (Factory Products Taken)`
        : 'Flat monthly salary (Zero extra allowances)'
    },
    {
      id: 'EMP002',
      name: 'Om Prakash Saini',
      role: 'Warehouse & Logistics Helper',
      division: 'Operations',
      phone: '+91 9571412351',
      base: 12000,
      allowances: omBagsLoaded * 1.00, // ₹1 per bag loaded/dispatched
      product_deductions: omPurchases.totalDeductions,
      net_payable: Math.max(0, (12000 + (omBagsLoaded * 1.00)) - omPurchases.totalDeductions),
      payout_day: '5th of month',
      remarks: omPurchases.totalDeductions > 0
        ? `Base ₹12k + ₹${omBagsLoaded} loading less ₹${omPurchases.totalDeductions} products taken`
        : `Base ₹12,000 + ₹1/bag on ${omBagsLoaded.toLocaleString('en-IN')} bags dispatched`
    },
    {
      id: 'EMP003',
      name: 'Field Sales Executive (Beat Rep)',
      role: 'Field Sales Executive',
      division: 'Sales',
      phone: 'Field Beat (Pan-Rajasthan)',
      base: salesEval.baseSalary,
      allowances: salesEval.tadaAllowance + salesEval.revenueIncentive,
      product_deductions: 0,
      net_payable: salesEval.totalPayable,
      payout_day: '1st of month',
      remarks: `${salesEval.tier} — ₹${salesEval.actualBilling.toLocaleString('en-IN')}/₹${salesEval.targetBilling.toLocaleString('en-IN')} (${salesEval.attainmentPct}%)`
    }
  ];

  const totalPayroll = breakdown.reduce((sum, e) => sum + e.net_payable, 0);
  const distributorProfile = loadDistributorProfile();

  return {
    runRecord: {
      month: monthStr,
      run_date: new Date().toISOString(),
      status: 'PENDING_CEO_APPROVAL',
      total_payout: totalPayroll,
      breakdown,
      distributorProfile
    },
    salesEval
  };
}

/**
 * Format Executive Statement for WhatsApp & Dashboard (CEO & Founder Review)
 */
function formatWhatsAppExecutivePayroll(runRecord, salesEval) {
  let msg = `🏛️ *SWATCH PAINTS — MASTER EMPLOYEE PAYROLL LEDGER*\n`;
  msg += `📅 *Month*: ${runRecord.month} | Generated: ${new Date().toLocaleDateString('en-IN')}\n`;
  msg += `👤 *Admin & Sovereign Authority*: CEO Ashutosh Sharma (+91 9079609627)\n`;
  msg += `────────────────────────────\n\n`;

  msg += `👑 *1. LEADERSHIP & MANAGEMENT*\n`;
  msg += `• *Suresh Kumar Sharma* (Co-Founder & Operational GM):\n`;
  msg += `  - Base: ₹20,000 | Fuel Allowance: ₹3,000\n`;
  msg += `  - Net Payable: *₹23,000* | 🗓️ *Payout: 10th of month*\n\n`;
  msg += `• *Ashutosh Sharma* (CEO & Founder):\n`;
  msg += `  - Remuneration: *₹0 (100% Equity / Company Reinvestment)*\n\n`;

  msg += `🏭 *2. OPERATIONS & PLANT FLOOR (Internal Staff)*\n`;
  const shahrukh = runRecord.breakdown.find(e => e.id === 'EMP001');
  msg += `• *Shahrukh bhai* (Senior Chemist):\n`;
  msg += `  - Base Salary: ₹${shahrukh.base.toLocaleString('en-IN')}\n`;
  if (shahrukh.product_deductions > 0) {
    msg += `  - Less: Factory Products Taken: *−₹${shahrukh.product_deductions.toLocaleString('en-IN')}* (Base Price)\n`;
  }
  msg += `  - Net Payable: *₹${shahrukh.net_payable.toLocaleString('en-IN')}* | 🗓️ *Payout: 2nd of month*\n\n`;

  const om = runRecord.breakdown.find(e => e.id === 'EMP002');
  msg += `• *Om Prakash Saini* (Warehouse & Logistics):\n`;
  msg += `  - Base Salary: ₹${om.base.toLocaleString('en-IN')} | Loading Allowance (₹1/bag): ₹${om.allowances.toLocaleString('en-IN')}\n`;
  if (om.product_deductions > 0) {
    msg += `  - Less: Factory Products Taken: *−₹${om.product_deductions.toLocaleString('en-IN')}* (Base Price)\n`;
  }
  msg += `  - Net Payable: *₹${om.net_payable.toLocaleString('en-IN')}* | 🗓️ *Payout: 5th of month*\n\n`;

  msg += `💼 *3. FIELD SALES FORCE (Pan-Rajasthan Beat)*\n`;
  msg += `• *Field Sales Executive*:\n`;
  msg += `  - Target Mix: ₹${salesEval.actualBilling.toLocaleString('en-IN')} / ₹${salesEval.targetBilling.toLocaleString('en-IN')} (${salesEval.attainmentPct}%) ${salesEval.statusEmoji}\n`;
  msg += `  - Base: ₹${salesEval.baseSalary.toLocaleString('en-IN')} | TA/DA: ₹${salesEval.tadaAllowance.toLocaleString('en-IN')}\n`;
  if (salesEval.extraRevenue > 0) {
    msg += `  - 2.5% Incentive (+₹${salesEval.extraRevenue.toLocaleString('en-IN')}): ₹${salesEval.revenueIncentive.toLocaleString('en-IN')}\n`;
  }
  msg += `  - Net Payable: *₹${salesEval.totalPayable.toLocaleString('en-IN')}* | 🗓️ *Payout: 1st of month*\n\n`;

  msg += `────────────────────────────\n`;
  msg += `💰 *TOTAL NET INTERNAL PAYROLL*: *₹${runRecord.total_payout.toLocaleString('en-IN')}*\n`;
  msg += `────────────────────────────\n\n`;

  const dist = runRecord.distributorProfile;
  if (dist) {
    msg += `📦 *4. INDEPENDENT B2B DISTRIBUTOR (Completely Decoupled from Payroll)*\n`;
    msg += `• *${dist.name}* (${dist.classification}):\n`;
    msg += `  - Wholesale Transfer Rate: *₹${dist.commercial_terms.wholesale_transfer_rate_per_bag}/bag* | Quota: *${dist.commercial_terms.monthly_volume_commitment_bags} bags/month*\n`;
    msg += `  - Support Policy: Guidance & sales techniques only (NO free kit/allowances)\n`;
    msg += `  - Approved Territories (City Markets within ~150km radius only; No villages):\n`;
    msg += `    ${dist.territory_and_market_boundaries.approved_city_markets.map(c => c.city).join(', ')}\n`;
    msg += `  - Dealer Assignment Rule: *Strictly CEO Ashutosh Sharma Admin Approval Required*\n\n`;
  }

  msg += `⚡ *Approval Action Required*:\n`;
  msg += `Reply *"APPROVE PAYROLL ${runRecord.month}"* to release payouts, or inspect via Dashboard: http://127.0.0.1:9119`;

  return msg;
}

// CLI Standalone Runner
if (require.main === module) {
  const args = process.argv.slice(2);
  const testMonth = '2026-09';
  const billing = args[0] ? parseFloat(args[0]) : 200000;
  const omBags = args[1] ? parseInt(args[1], 10) : 1500;

  console.log('--- Testing Swatch Paints Master HR Ledger Engine ---');
  const { runRecord, salesEval } = generateMonthlyPayroll(testMonth, { salesBilling: billing, omBagsLoaded: omBags });
  console.log(formatWhatsAppExecutivePayroll(runRecord, salesEval));
}

module.exports = {
  FACTORY_BASE_PRICES,
  loadLedger,
  saveLedger,
  loadDistributorProfile,
  resolveEmployee,
  recordEmployeeProductPurchase,
  parseEmployeePurchaseText,
  getEmployeeProductDeductions,
  evaluateSalesExecutive,
  generateMonthlyPayroll,
  formatWhatsAppExecutivePayroll
};
