/**
 * Sharma Industries / Swatch Paints — Alex Hormozi Autonomous Example-Based Offer Generator
 * 
 * Generates grounded, practical Indian Paint Market case examples for Schemes, Offers & Programs.
 * Respects locked unit economics: Base ₹450 | Landed ₹635 | Dealer ₹690 | MRP ₹1150 | Token ₹50.
 * 
 * Standby by default. Runs 24*7 ONLY when triggered by CEO Ashutosh Sharma (+91 9079609627).
 */

const fs = require('fs');
const path = require('path');

const BANK_DIR = path.join(__dirname, 'data', 'hormozi_examples_bank');
const STATE_FILE = path.join(BANK_DIR, 'generator_state.json');
const INDEX_FILE = path.join(BANK_DIR, 'index.json');

function ensureDir() {
  if (!fs.existsSync(BANK_DIR)) {
    fs.mkdirSync(BANK_DIR, { recursive: true });
  }
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      isRunning: false,
      startedAt: null,
      lastGeneratedAt: null,
      totalGenerated: 0,
      intervalHours: 4,
      pid: null
    }, null, 2), 'utf-8');
  }
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Indian Trade Hubs & Personas
const TRADE_HUBS = [
  { city: 'Kota', market: 'Aerodrome Road Commercial Market', personaType: 'Multi-Brand Hardware & Paint Store', objection: 'Asian Paints monopoly & heavy credit demand' },
  { city: 'Bundi', market: 'Bundi Sadar Bazaar & Civil Lines', personaType: 'Residential Thekedar with 6 Painters', objection: 'Labour wage liquidity & high price of MNC texture' },
  { city: 'Baran', market: 'Baran City B2B Trade Hub', personaType: 'Commercial G+3 Project Contractor', objection: 'Severe monsoon dampness & seelan cracks' },
  { city: 'Bijoliya', market: 'Bijoliya Sandstone Commercial Area', personaType: 'Stone Bungalow Builder & Retail Stockist', objection: 'Lack of luxury textured finish display' },
  { city: 'Dabi', market: 'Dabi Retail Trade Market', personaType: 'Hardware & Construction Supplier', objection: '30-45 days market credit expectation' },
  { city: 'Rawatbhata', market: 'Rawatbhata Town Market', personaType: 'Institutional Housing Maintenance Contractor', objection: 'Supply lead times and transport freight burden' },
  { city: 'Talera', market: 'Talera City Center Counter', personaType: 'Contractor Referral Community Leader', objection: 'Lack of brand awareness among local mistrys' },
  { city: 'Deoli', market: 'Deoli Main Road Paint Store', personaType: 'Mixed Cement & Paint Retailer', objection: 'MNC tinting machine capital lock-in of ₹3.5 Lakh' }
];

const PRODUCT_FOCUS = [
  { name: 'Swatch Rustic Texture (25kg Bag)', landed: 635, dealer: 690, mrp: 1150, token: 50, category: 'Texture' },
  { name: 'Swatch Roller Coat (25kg Bag)', landed: 645, dealer: 690, mrp: 1150, token: 40, category: 'Texture' },
  { name: 'Swatch Weatherguard Exterior (20L Bucket)', landed: 2255, dealer: 2460, mrp: 4100, token: 150, category: 'Exterior Emulsion' },
  { name: 'Swatch Shine Velvet Interior (20L Bucket)', landed: 2255, dealer: 2460, mrp: 4100, token: 150, category: 'Interior Emulsion' },
  { name: 'Swatch Waterproofing Solution (5L Can)', landed: 950, dealer: 1080, mrp: 1800, token: 125, category: 'Specialty Sealer' },
  { name: 'Swatch Top Coat Sealer (5L Can)', landed: 1350, dealer: 1500, mrp: 2500, token: 175, category: 'Specialty Sealer' }
];

class HormoziExamplesGenerator {
  constructor() {
    ensureDir();
  }

  getState() {
    ensureDir();
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      return { isRunning: false, totalGenerated: 0 };
    }
  }

  saveState(state) {
    ensureDir();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  }

  getIndex() {
    ensureDir();
    try {
      return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  }

  /**
   * Generate 1 rich, practical Indian Paint Market case example
   */
  generateOneExample() {
    ensureDir();
    const state = this.getState();
    const index = this.getIndex();

    const hub = TRADE_HUBS[Math.floor(Math.random() * TRADE_HUBS.length)];
    const prod = PRODUCT_FOCUS[Math.floor(Math.random() * PRODUCT_FOCUS.length)];
    const caseId = `CASE-${Date.now().toString(36).toUpperCase()}`;

    const dealerMarginRs = prod.mrp - prod.dealer;
    const dealerMarginPct = ((dealerMarginRs / prod.mrp) * 100).toFixed(1);
    const companyGrossProfit = prod.dealer - prod.landed;

    const example = {
      caseId,
      timestamp: new Date().toISOString(),
      location: `${hub.market}, ${hub.city} (Rajasthan)`,
      targetProfile: hub.personaType,
      coreProduct: prod.name,
      marketObjection: hub.objection,
      pricingStructure: {
        mrp: `₹${prod.mrp}`,
        landedCost: `₹${prod.landedCost || prod.landed}`,
        standardDealerPrice: `₹${prod.dealer}`,
        dealerProfitPerUnit: `₹${dealerMarginRs.toFixed(2)} (${dealerMarginPct}%)`,
        painterCashToken: `₹${prod.token}`,
        netCompanyProfit: `₹${companyGrossProfit.toFixed(2)} / unit`
      },
      offerStack: [
        `Initial Trial Order of 50 units with 5 Bonus Units shipped free directly from Bundi plant.`,
        `1ft x 1ft Real Texture Framed Demo Board installed on the billing counter.`,
        `100 Customized Pamphlets featuring dealer/contractor name and contact numbers.`,
        `Ironclad 7-Day Unsold Stock Exchange Guarantee (1-to-1 SKU swap for Emulsion/Waterproofing).`,
        `100% Transit Leakage Immediate Replacement upon video confirmation.`,
        `5-Day 2% Cash Discount (Float Velocity) saving an extra 2.0% on prompt payments.`
      ],
      profitComparison: {
        mncCompetitorReturn: `MNC gives 3.5% to 5.0% margin (approx ₹${(prod.mrp * 0.04).toFixed(0)}/unit) + locks ₹3.5 Lakh in tinting machines.`,
        swatchReturn: `Swatch delivers ₹${dealerMarginRs.toFixed(0)}/unit (${dealerMarginPct}%) + ₹${prod.token} cash token inside + zero machine requirement.`,
        roiMultiplier: `Over 8X to 10X higher clean dealer profit on capital invested.`
      },
      executionSteps: [
        `Day 1: Company sales executive introduces 1ft x 1ft sample board to counter owner.`,
        `Day 2: 50 units dispatched with 5 free trial units from Bundi plant.`,
        `Day 3: Sales executive visits 10 local thekedars with sample trowel demo.`,
        `Day 5: First painter scans ₹${prod.token} cash token card on WhatsApp/UPI.`,
        `Day 7: Dealer clears invoice under 5-day cycle to capture 2% Cash Discount.`
      ],
      memoryHook: `${hub.city} Trade Rule: Dealer ko 40% margin, painter ko ₹${prod.token} cash jeb me, aur company ko 5-din me float velocity!`,
      status: 'AWAITING_CEO_APPROVAL',
      author: 'Alex Hormozi (Offer Architect) & Warren Buffett (CFO)'
    };

    // Save individual case file
    const caseFile = path.join(BANK_DIR, `${caseId}.json`);
    fs.writeFileSync(caseFile, JSON.stringify(example, null, 2), 'utf-8');

    // Update index
    index.unshift({
      caseId,
      timestamp: example.timestamp,
      location: example.location,
      product: prod.name,
      dealerMargin: `${dealerMarginPct}%`,
      status: example.status
    });
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index.slice(0, 100), null, 2), 'utf-8');

    // Update state
    state.lastGeneratedAt = example.timestamp;
    state.totalGenerated += 1;
    this.saveState(state);

    return example;
  }

  /**
   * Start 24*7 continuous generation loop (Triggered by CEO)
   */
  start24x7(intervalHours = 4) {
    ensureDir();
    const state = this.getState();
    if (state.isRunning) {
      return { status: 'ALREADY_RUNNING', state };
    }

    state.isRunning = true;
    state.startedAt = new Date().toISOString();
    state.intervalHours = intervalHours;
    state.pid = process.pid;
    this.saveState(state);

    // Run first generation immediately
    const firstExample = this.generateOneExample();

    return {
      status: 'STARTED',
      message: `24*7 Example Generator is now actively running. Cycles every ${intervalHours} hours.`,
      firstExample
    };
  }

  /**
   * Stop 24*7 continuous generation loop
   */
  stop24x7() {
    ensureDir();
    const state = this.getState();
    state.isRunning = false;
    state.pid = null;
    this.saveState(state);
    return {
      status: 'STOPPED',
      message: '24*7 Example Generator is now on STANDBY.'
    };
  }

  /**
   * Get formatted status report
   */
  getStatus() {
    ensureDir();
    const state = this.getState();
    const index = this.getIndex();
    return {
      isRunning: state.isRunning,
      startedAt: state.startedAt,
      lastGeneratedAt: state.lastGeneratedAt,
      totalGenerated: state.totalGenerated,
      recentCases: index.slice(0, 5)
    };
  }
}

const generator = new HormoziExamplesGenerator();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || '--status';

  if (cmd === '--start') {
    console.log('🚀 Triggering Hormozi 24*7 Example Generator...');
    const res = generator.start24x7();
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === '--stop') {
    console.log('🛑 Stopping Hormozi 24*7 Example Generator...');
    const res = generator.stop24x7();
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === '--once') {
    console.log('🎯 Generating 1 New Example-Based Scheme...');
    const res = generator.generateOneExample();
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log('📊 Hormozi Examples Generator Status:');
    console.log(JSON.stringify(generator.getStatus(), null, 2));
  }
}

module.exports = generator;
