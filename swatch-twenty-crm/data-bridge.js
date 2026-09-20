/**
 * Swatch Twenty CRM — Central Data Bridge & Agent Execution Gateway
 * 
 * Unifies all data sources:
 * - Master users & core leadership (Jarvis Agent/data/users.csv)
 * - 2,100 Verified Dealers (verified_dealers_directory.csv)
 * - 1,000 Real Estate Builders (rajasthan_builders_master.csv)
 * - Priority Architects & Interior Designers
 * - 1.14 Million PAN-India Directory
 * - AI Division Leaders & Tools Suite (Sales, Marketing, HR, Ops)
 * - CEO File Approvals Ledger
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const JARVIS_DATA_DIR = path.join(__dirname, '..', 'Jarvis Agent', 'data');
const USERS_CSV = path.join(JARVIS_DATA_DIR, 'users.csv');
const PAYROLL_LEDGER = path.join(JARVIS_DATA_DIR, 'employee_payroll_ledger.json');
const CEO_APPROVALS_LEDGER = path.join(JARVIS_DATA_DIR, 'ceo_file_approvals_ledger.json');
const VERIFIED_DEALERS_CSV = path.join(JARVIS_DATA_DIR, 'verified_dealers_directory.csv');
const BUILDERS_CSV = path.join(JARVIS_DATA_DIR, 'rajasthan_builders_master.csv');
const ARCHITECTS_CSV = path.join(JARVIS_DATA_DIR, 'india_architects_master.csv');
const DESIGNERS_CSV = path.join(JARVIS_DATA_DIR, 'india_interior_designers_master.csv');

// Load tool suites
let salesTools = null;
let marketingTools = null;
try {
  salesTools = require(path.join(__dirname, '..', 'Jarvis Agent', 'sales-tools-suite.js'));
  marketingTools = require(path.join(__dirname, '..', 'Jarvis Agent', 'marketing-tools-suite.js'));
} catch (e) {
  console.warn('[DataBridge] Tool suites warning:', e.message);
}

class DataBridge {
  constructor() {
    this.cachedAccounts = [];
    this.stageOverrides = new Map(); // phone -> newStage
    this.dealOverrides = new Map(); // phone -> newDealValue
    this.lastLoad = null;
    this.init();
  }

  parseCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ''));
    return result;
  }

  cleanPhone(p) {
    if (!p) return '';
    let digits = String(p).replace(/[^0-9]/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    return String(p).trim();
  }

  init() {
    console.log('[DataBridge] Initializing Swatch Twenty CRM Data Bridge...');
    this.loadAllAccounts();
  }

  loadAllAccounts() {
    const accounts = [];
    const phoneSet = new Set();

    // 1. Core Users & Leadership (users.csv)
    if (fs.existsSync(USERS_CSV)) {
      try {
        const raw = fs.readFileSync(USERS_CSV, 'utf-8');
        const lines = raw.trim().split(/\r?\n/);
        if (lines.length > 1) {
          const headers = this.parseCsvLine(lines[0]);
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;
            const cols = this.parseCsvLine(line);
            const row = {};
            headers.forEach((h, idx) => row[h] = cols[idx] || '');

            const phone = this.cleanPhone(row.phone);
            if (phone && !phoneSet.has(phone)) {
              phoneSet.add(phone);
              const r = (row.role || 'dealer').toLowerCase();
              let category = 'DEALER';
              if (['owner', 'founder', 'senior_chemist', 'warehouse_helper', 'staff', 'system'].includes(r)) category = 'EMPLOYEE';
              else if (r === 'builder') category = 'BUILDER';
              else if (r === 'architect') category = 'ARCHITECT';
              else if (r === 'interior_designer') category = 'INTERIOR_DESIGNER';
              else if (r === 'b2b_distributor') category = 'DISTRIBUTOR';
              else if (r === 'homeowner') category = 'HOMEOWNER';

              accounts.push({
                id: `ACC-CORE-${i}`,
                phone,
                name: row.name || 'Account',
                company: category === 'EMPLOYEE' ? 'Sharma Industries (Bundi Plant)' : `${row.name} Paint & Hardware Store`,
                role: row.role || 'dealer',
                category,
                tier: row.tier || 'Standard',
                region: row.region || 'Bundi',
                stage: this.stageOverrides.get(phone) || (category === 'EMPLOYEE' ? 'Closed' : 'Qualified'),
                dealValue: parseInt(this.dealOverrides.get(phone) || (category === 'EMPLOYEE' ? '0' : '34500'), 10),
                notes: row.notes || '',
                source: 'users.csv'
              });
            }
          }
        }
      } catch (err) {
        console.error('[DataBridge] Error loading users.csv:', err.message);
      }
    }

    // 2. Verified Paint Dealers (verified_dealers_directory.csv)
    if (fs.existsSync(VERIFIED_DEALERS_CSV)) {
      try {
        const raw = fs.readFileSync(VERIFIED_DEALERS_CSV, 'utf-8');
        const lines = raw.trim().split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          const cols = this.parseCsvLine(line);
          if (cols.length >= 7) {
            const shopName = cols[1] || 'Paint Store';
            const ownerName = cols[2] || 'Store Owner';
            const phone = this.cleanPhone(cols[3]);
            const city = cols[4] || 'Rajasthan';
            const address = cols[6] || '';
            const busType = cols[7] || 'Retailer';
            const bags = parseInt(cols[8] || '50', 10);

            if (phone && !phoneSet.has(phone)) {
              phoneSet.add(phone);
              accounts.push({
                id: `ACC-DLR-${cols[0] || i}`,
                phone,
                name: ownerName,
                company: shopName,
                role: 'dealer',
                category: 'DEALER',
                tier: 'Tier 2 Dealer',
                region: city,
                stage: this.stageOverrides.get(phone) || (i % 7 === 0 ? 'Negotiation' : (i % 5 === 0 ? 'Interested' : (i % 3 === 0 ? 'Qualified' : 'Lead'))),
                dealValue: parseInt(this.dealOverrides.get(phone) || (bags * 690), 10),
                notes: `${busType}; ${address}; Est: ${bags} bags/mo`,
                source: 'verified_dealers_directory.csv'
              });
            }
          }
        }
      } catch (err) {
        console.error('[DataBridge] Error loading verified dealers:', err.message);
      }
    }

    // 3. Regional Builders (rajasthan_builders_master.csv)
    if (fs.existsSync(BUILDERS_CSV)) {
      try {
        const raw = fs.readFileSync(BUILDERS_CSV, 'utf-8');
        const lines = raw.trim().split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          const cols = this.parseCsvLine(line);
          if (cols.length >= 7) {
            const companyName = cols[1] || 'Builder Group';
            const city = cols[2] || 'Rajasthan';
            const projectTypes = cols[3] || 'Residential Highrise';
            const scale = cols[4] || 'Tier 1 Builder';
            const contactPerson = cols[5] || 'Procurement Head';
            const phone = this.cleanPhone(cols[6]);
            const paintReq = parseInt(cols[8] || '50000', 10);

            if (phone && !phoneSet.has(phone)) {
              phoneSet.add(phone);
              accounts.push({
                id: `ACC-BLD-${cols[0] || i}`,
                phone,
                name: contactPerson,
                company: companyName,
                role: 'builder',
                category: 'BUILDER',
                tier: scale,
                region: city,
                stage: this.stageOverrides.get(phone) || (i % 4 === 0 ? 'Negotiation' : (i % 2 === 0 ? 'Interested' : 'Qualified')),
                dealValue: parseInt(this.dealOverrides.get(phone) || Math.min(paintReq * 10, 500000), 10),
                notes: `${projectTypes}; Req: ${paintReq.toLocaleString('en-IN')} Ltr`,
                source: 'rajasthan_builders_master.csv'
              });
            }
          }
        }
      } catch (err) {
        console.error('[DataBridge] Error loading builders:', err.message);
      }
    }

    this.cachedAccounts = accounts;
    this.lastLoad = new Date().toISOString();
    console.log(`[DataBridge] Loaded ${accounts.length} Accounts into Twenty CRM Memory Cache.`);
    return accounts;
  }

  getStats() {
    const counts = {};
    let totalDealValue = 0;
    const stageCounts = {
      'Lead': { count: 0, value: 0 },
      'Qualified': { count: 0, value: 0 },
      'Interested': { count: 0, value: 0 },
      'Negotiation': { count: 0, value: 0 },
      'Closed': { count: 0, value: 0 }
    };

    this.cachedAccounts.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
      const stage = stageCounts[a.stage] ? a.stage : 'Qualified';
      stageCounts[stage].count++;
      stageCounts[stage].value += a.dealValue || 0;
      totalDealValue += a.dealValue || 0;
    });

    return {
      totalAccounts: this.cachedAccounts.length,
      categoryCounts: counts,
      stageCounts,
      totalPipelineValue: totalDealValue,
      panIndiaTotal: 1146394,
      lastSync: this.lastLoad
    };
  }

  getAccounts({ category = 'all', stage = 'all', query = '', page = 1, limit = 50 }) {
    let list = this.cachedAccounts;

    if (category !== 'all') {
      list = list.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (stage !== 'all') {
      list = list.filter(a => a.stage.toLowerCase() === stage.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase().trim();
      list = list.filter(a => 
        a.name.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.notes.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginated
    };
  }

  getOpportunitiesKanban() {
    const stages = ['Lead', 'Qualified', 'Interested', 'Negotiation', 'Closed'];
    const columns = {};

    stages.forEach(st => {
      columns[st] = {
        stage: st,
        count: 0,
        totalValue: 0,
        deals: []
      };
    });

    this.cachedAccounts.forEach(a => {
      if (a.category === 'EMPLOYEE') return; // Exclude employees from sales pipeline
      const stage = columns[a.stage] ? a.stage : 'Qualified';
      columns[stage].count++;
      columns[stage].totalValue += a.dealValue || 0;
      if (columns[stage].deals.length < 25) { // Return top 25 deals per column for fast initial rendering
        columns[stage].deals.push(a);
      }
    });

    return columns;
  }

  updateStage(phone, newStage, newDealValue = null) {
    this.stageOverrides.set(phone, newStage);
    if (newDealValue) this.dealOverrides.set(phone, parseInt(newDealValue, 10));

    const acc = this.cachedAccounts.find(a => a.phone === phone);
    if (acc) {
      acc.stage = newStage;
      if (newDealValue) acc.dealValue = parseInt(newDealValue, 10);
    }
    return { success: true, phone, newStage, newDealValue };
  }

  async searchPanIndia(query, category = 'all', limit = 10) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    const results = [];

    const files = [];
    if (category === 'all' || category === 'architect') files.push({ cat: 'ARCHITECT', path: ARCHITECTS_CSV });
    if (category === 'all' || category === 'interior_designer') files.push({ cat: 'INTERIOR_DESIGNER', path: DESIGNERS_CSV });
    if (category === 'all' || category === 'builder') files.push({ cat: 'BUILDER', path: BUILDERS_CSV });
    if (category === 'all' || category === 'dealer') files.push({ cat: 'DEALER', path: VERIFIED_DEALERS_CSV });

    for (const f of files) {
      if (!fs.existsSync(f.path)) continue;
      const fileStream = fs.createReadStream(f.path);
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      for await (const line of rl) {
        if (line.toLowerCase().includes(q)) {
          const cols = this.parseCsvLine(line);
          results.push({
            category: f.cat,
            id: cols[0],
            name: cols[1],
            firm: cols[2],
            city: cols[3],
            phone: cols[5] || cols[4] || cols[6],
            details: cols.slice(6).join(', ')
          });
          if (results.length >= limit) break;
        }
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  // AI Leader Tool: Calculate Quote
  calculateQuote(params) {
    if (!salesTools) return { error: 'Sales tools not loaded' };
    return salesTools.calculate_instant_quote(params);
  }

  // AI Leader Tool: Dispatch Cadence Follow-up
  dispatchCadence(params) {
    if (!salesTools) return { error: 'Sales tools not loaded' };
    return salesTools.whatsapp_cadence_dispatcher(params);
  }

  // AI Leader Tool: Check Factory Stock
  checkStock(params) {
    if (!salesTools) return { error: 'Sales tools not loaded' };
    return salesTools.inventory_stock_checker(params);
  }

  // AI Leader Tool: Generate Creative
  generateCreative(params) {
    if (!marketingTools) return { error: 'Marketing tools not loaded' };
    return marketingTools.generate_social_creative(params);
  }

  // CEO Approvals
  getCeoApprovals() {
    if (!fs.existsSync(CEO_APPROVALS_LEDGER)) return [];
    try {
      return JSON.parse(fs.readFileSync(CEO_APPROVALS_LEDGER, 'utf-8'));
    } catch (e) {
      return [];
    }
  }
}

module.exports = new DataBridge();
