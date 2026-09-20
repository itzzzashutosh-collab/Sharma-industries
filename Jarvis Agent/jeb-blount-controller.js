/**
 * Jeb Blount Bulk Network Prospecting Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Bulk Lead Generator & Pipeline Engine:
 * - Specializes exclusively in high-value B2B tiers: Architects, Interior Designers,
 *   Painting Thekedars/Contractors, Real Estate Builders, and Bulk Wholesalers/Distributors
 * - Deploys multi-touch prospecting cadence (5–7 touches to conversion)
 * - Drives Indirect Demand Pull (Architect/Contractor pull forces dealer stock)
 * - Queries regional master directories (Rajasthan Builders, Verified Dealers, Architects)
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'jeb_blount_prospecting_ledger.csv');
const RAJASTHAN_BUILDERS_PATH = path.join(__dirname, 'data', 'rajasthan_builders_master.csv');
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
    console.error('[Jeb Blount Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class JebBlountController {
  constructor() {
    this.name = 'jeb_blount_controller';
    this.legend = 'Jeb Blount';
    this.role = 'High-Value Lead Generator (Architects, Contractors, Builders, Distributors)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match an incoming query to one of the 5 B2B target segments or referral system
   */
  matchSegment(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const seg = (r.target_segment || '').toLowerCase();
      const channel = (r.entry_channel || '').toLowerCase();

      if (q.includes('architect') || q.includes('elevation') || q.includes('boq') || q.includes('drawing')) {
        return r.prospect_id === 'BLOUNT-01';
      }
      if (q.includes('interior') || q.includes('designer') || q.includes('accent') || q.includes('feature wall')) {
        return r.prospect_id === 'BLOUNT-02';
      }
      if (q.includes('thekedar') || q.includes('contractor') || q.includes('painter head') || q.includes('labor') || q.includes('site visit')) {
        return r.prospect_id === 'BLOUNT-03';
      }
      if (q.includes('builder') || q.includes('developer') || q.includes('project') || q.includes('sqft') || q.includes('multi unit')) {
        return r.prospect_id === 'BLOUNT-04';
      }
      if (q.includes('distributor') || q.includes('wholesaler') || q.includes('wholesale') || q.includes('bulk stockist') || q.includes('scale')) {
        return r.prospect_id === 'BLOUNT-05';
      }
      if (q.includes('referral') || q.includes('reference') || q.includes('2 contact') || q.includes('network flywheel')) {
        return r.prospect_id === 'BLOUNT-06';
      }

      return seg.includes(q) || channel.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Search regional institutional databases for Builders or Wholesale prospects
   */
  searchProspects({ segment = 'builder', district = 'Kota', limit = 3 }) {
    if (segment.toLowerCase().includes('builder')) {
      if (!fs.existsSync(RAJASTHAN_BUILDERS_PATH)) return [];
      try {
        const raw = fs.readFileSync(RAJASTHAN_BUILDERS_PATH, 'utf-8');
        const lines = raw.trim().split('\n');
        if (lines.length <= 1) return [];
        const headers = parseCsvLine(lines[0]);

        const results = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = parseCsvLine(lines[i]);
          const row = {};
          headers.forEach((h, idx) => {
            row[h] = vals[idx] || '';
          });

          const d = (row.district_hq || '').toLowerCase();
          if (!district || d.includes(district.toLowerCase())) {
            results.push(row);
            if (results.length >= limit) break;
          }
        }
        return results;
      } catch (e) {
        console.error('[Jeb Blount Controller] Error searching builders:', e.message);
        return [];
      }
    }

    // Default to verified dealer stockists for wholesale distributors
    if (!fs.existsSync(VERIFIED_DEALERS_PATH)) return [];
    try {
      const raw = fs.readFileSync(VERIFIED_DEALERS_PATH, 'utf-8');
      const lines = raw.trim().split('\n');
      if (lines.length <= 1) return [];
      const headers = parseCsvLine(lines[0]);

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCsvLine(lines[i]);
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = vals[idx] || '';
        });

        const c = (row.city || '').toLowerCase();
        const estBags = parseInt(row.estimated_monthly_bags || '0', 10);
        if ((!district || c.includes(district.toLowerCase())) && estBags >= 80) {
          results.push(row);
          if (results.length >= limit) break;
        }
      }
      return results;
    } catch (e) {
      console.error('[Jeb Blount Controller] Error searching distributors:', e.message);
      return [];
    }
  }

  /**
   * Formats comprehensive Prospecting Briefing for WhatsApp or Physical Rep
   */
  coachProspecting({ query = '', repName = 'Field Prospector', prospectName = 'Target Specifier' }) {
    const q = (query || '').toLowerCase().trim();

    // Check if query is asking for builder/distributor search
    if (q.includes('search') || q.includes('find') || q.includes('list') || q.includes('dhoondho')) {
      let segment = 'builder';
      if (q.includes('distributor') || q.includes('wholesaler')) segment = 'distributor';

      let district = 'Kota';
      if (q.includes('bundi')) district = 'Bundi';
      else if (q.includes('jaipur')) district = 'Jaipur';
      else if (q.includes('baran')) district = 'Baran';
      else if (q.includes('ajmer')) district = 'Ajmer';

      const results = this.searchProspects({ segment, district, limit: 3 });

      let res = `🏗️ *JEB BLOUNT — REGIONAL ${segment.toUpperCase()} PIPELINE SEARCH (${district.toUpperCase()})*\n`;
      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `💡 *Prospecting Law*: _“No pipeline $\\to$ No sales. No network $\\to$ No growth.”_\n\n`;

      if (results.length === 0) {
        res += `No verified institutional ${segment} records found in ${district}. Broaden geographic parameters.\n`;
      } else {
        results.forEach((r, idx) => {
          if (segment === 'builder') {
            res += `*#${idx + 1} ${r.company_name}* (${r.company_scale || 'Commercial Builder'})\n`;
            res += `• *Projects*: ${r.project_types}\n`;
            res += `• *Procurement Lead*: ${r.purchase_contact_person}\n`;
            res += `• *Phone*: ${r.phone} | *Email*: ${r.email}\n`;
            res += `• *Est. Volume*: *${r.estimated_annual_paint_requirement_liters || '30,000'} Liters/year*\n`;
            res += `• *Action*: Touch 1 Drop-in with Landed Sqft Cost Comparison Sheet\n\n`;
          } else {
            res += `*#${idx + 1} ${r.shop_name}* (${r.business_type})\n`;
            res += `• *Owner*: ${r.owner_name} | *Phone*: ${r.phone}\n`;
            res += `• *Address*: ${r.full_address}\n`;
            res += `• *Est. Volume*: *${r.estimated_monthly_bags} bags/month*\n`;
            res += `• *Action*: Touch 1 B2B Market Visit with ₹430/bag Wholesale Model\n\n`;
          }
        });
      }

      res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      res += `_“The sale doesn’t start at closing… it starts with the RIGHT prospect.”_ 👑`;
      return res;
    }

    const record = this.matchSegment(query);

    let response = `🎯 *JEB BLOUNT — FANATICAL PROSPECTING BRIEFING*\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `💡 *Core Philosophy*: _“The sale doesn’t start at closing… it starts with the RIGHT prospect.”_\n`;
    response += `⚡ *Strategy*: *Indirect Demand Pull* (${record.target_segment} $\\to$ Retail Dealers)\n\n`;

    response += `👤 *Rep*: ${repName} | *Target*: ${prospectName}\n`;
    response += `🏛️ *Target Segment*: *${record.target_segment}*\n`;
    response += `🔑 *Decision Leverage*: ${record.decision_leverage}\n`;
    response += `🚪 *Entry Channel*: ${record.entry_channel}\n\n`;

    response += `🎯 *OPENING HOOK SCRIPT (Word-for-Word)*:\n`;
    response += `👉 *“${record.opening_hook_script}”*\n\n`;

    response += `🔄 *THE 5–7 TOUCH CADENCE*:\n`;
    response += `• ${record.multi_touch_cadence}\n\n`;

    response += `🌊 *INDIRECT PULL MECHANICS*:\n`;
    response += `• ${record.indirect_pull_strategy}\n\n`;

    response += `🛡️ *PHYSICAL REP ACTION CUE*:\n`;
    response += `• ${record.field_rep_cue}\n`;
    response += `• *Referral Golden Rule*: Always ask for 2 contractor / builder contacts before leaving!\n`;
    response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    response += `_“Sales battlefield me jeetne se pehle, tumhe battlefield banana padta hai.”_ 👑`;

    return response;
  }

  /**
   * Conversational Router for WhatsApp
   */
  handleBlountConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('blount') || q.startsWith('jeb') || q.startsWith('prospect') || q.startsWith('pipeline')) {
      query = text.replace(/^(blount|jeb|prospect|pipeline|lead|leads)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = 'Architect elevation meeting script';
    }

    return this.coachProspecting({
      query,
      repName,
      prospectName: 'Institutional Prospect'
    });
  }
}

const controller = new JebBlountController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Architect elevation meeting script';
  console.log(controller.handleBlountConversation(q));
}

module.exports = controller;
