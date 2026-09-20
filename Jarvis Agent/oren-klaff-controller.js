/**
 * Oren Klaff Frame Control Engine Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Functions strictly as the Conversation Controller & Status Elevation Architect:
 * - Transforms field sales representatives from supplicating sellers into high-status commercial authorities
 * - Deploys the 5 Core Frames: Power, Time, Prize, Intrigue, and Analyst
 * - Neutralizes dealer arrogance, distractions, and aggressive price discounting demands
 * - Enforces the Walk-Away Posture and protects factory unit economics (hurdle >= Rs 100/bag)
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'oren_klaff_frame_control_ledger.csv');

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
    console.error('[Oren Klaff Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class OrenKlaffController {
  constructor() {
    this.name = 'oren_klaff_controller';
    this.legend = 'Oren Klaff';
    this.role = 'Conversation Controller (Authority Builder + Status Elevation System)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Match incoming query against the Frame Control Ledger
   */
  matchFrame(query = '') {
    const q = (query || '').toLowerCase().trim();
    const records = parseLedger();

    let matched = records.find(r => {
      const type = (r.frame_type || '').toLowerCase();
      const rule = (r.oren_klaff_status_elevation_rule || '').toLowerCase();

      if (q.includes('power') || q.includes('ego') || q.includes('attitude') || q.includes('authority')) {
        return r.frame_id === 'KLAFF-PWR-01';
      }
      if (q.includes('time') || q.includes('10 minute') || q.includes('busy') || q.includes('duration') || q.includes('scarcity')) {
        return r.frame_id === 'KLAFF-TIM-02';
      }
      if (q.includes('prize') || q.includes('reward') || q.includes('qualify') || q.includes('exclusive') || q.includes('opportunity')) {
        return r.frame_id === 'KLAFF-PRZ-03';
      }
      if (q.includes('intrigue') || q.includes('hook') || q.includes('curiosity') || q.includes('dopamine')) {
        return r.frame_id === 'KLAFF-INT-04';
      }
      if (q.includes('analyst') || q.includes('audit') || q.includes('numbers') || q.includes('evaluate')) {
        return r.frame_id === 'KLAFF-ANA-05';
      }
      if (q.includes('distract') || q.includes('phone') || q.includes('mobile') || q.includes('ignore') || q.includes('ignoring')) {
        return r.frame_id === 'KLAFF-DST-06';
      }
      if (q.includes('discount') || q.includes('price push') || q.includes('pressure') || q.includes('sasta')) {
        return r.frame_id === 'KLAFF-PRC-07';
      }
      if (q.includes('asian') || q.includes('alpha') || q.includes('big brand') || q.includes('hamare yahan')) {
        return r.frame_id === 'KLAFF-ALP-08';
      }
      if (q.includes('walk away') || q.includes('walkaway') || q.includes('reject') || q.includes('leave')) {
        return r.frame_id === 'KLAFF-WLK-09';
      }
      if (q.includes('cadence') || q.includes('daily') || q.includes('routine') || q.includes('sop')) {
        return r.frame_id === 'KLAFF-CAD-10';
      }

      return type.includes(q) || rule.includes(q);
    });

    return matched || records[0];
  }

  /**
   * Generates a targeted frame turnaround script
   */
  generateFrameTurnaround({ frameType = 'Power Frame', dealerName = 'Trade Partner', contextNote = '' } = {}) {
    const record = this.matchFrame(frameType);
    let res = `👑 *OREN KLAFF — FRAME CONTROL TURNAROUND: ${record.frame_type.toUpperCase()}*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `💡 *Core Law*: _“The person who controls the frame… controls the deal.”_\n\n`;

    res += `⚠️ *SUBORDINATE MISTAKE (Low Status)*:\n`;
    res += `• ${record.subordinate_amateur_behavior}\n\n`;

    res += `⚡ *OREN KLAFF STATUS ELEVATION*:\n`;
    res += `• ${record.oren_klaff_status_elevation_rule}\n\n`;

    res += `🎯 *AUTHORITATIVE SCRIPT (Word-for-Word)*:\n`;
    res += `👉 *“${record.field_dialogue_script}”*\n\n`;

    res += `🛡️ *PHYSICAL POSTURE & DEMEANOR CUE*:\n`;
    res += `• ${record.rep_physical_posture_cue}\n\n`;

    res += `📈 *PSYCHOLOGICAL OUTCOME*:\n`;
    res += `• ${record.psychological_power_outcome}\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“Low status $\\to$ No respect. No respect $\\to$ No deal!”_ 👑`;
    return res;
  }

  /**
   * Formats comprehensive Frame Control Briefing for Field Sales Force or WhatsApp
   */
  coachFrameControl({ query = '', repName = 'Field Sales Authority', targetName = 'Commercial Counter' } = {}) {
    const record = this.matchFrame(query);

    let res = `🏛️ *OREN KLAFF — FRAME CONTROL & STATUS ELEVATION BRIEFING*\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `💡 *Core Law*: _“The person who controls the frame… controls the deal.”_\n`;
    res += `🎯 *Frame System*: *${record.frame_type}* [ID: \`${record.frame_id}\`]\n`;
    res += `👤 *Rep*: ${repName} | *Target*: ${targetName}\n\n`;

    res += `❌ *AVOID LOW-STATUS BEHAVIOR*:\n`;
    res += `• ${record.subordinate_amateur_behavior}\n\n`;

    res += `⚡ *HIGH-STATUS FRAME REORIENTATION*:\n`;
    res += `• *${record.oren_klaff_status_elevation_rule}*\n\n`;

    res += `🎯 *WORD-FOR-WORD DIALOGUE SCRIPT*:\n`;
    res += `👉 *“${record.field_dialogue_script}”*\n\n`;

    res += `🛡️ *PHYSICAL POSTURE & EYE CONTACT CUE*:\n`;
    res += `• ${record.rep_physical_posture_cue}\n\n`;

    res += `🧠 *PSYCHOLOGICAL PERCEPTION OUTCOME*:\n`;
    res += `• ${record.psychological_power_outcome}\n`;
    res += `• *Goal*: Dealer must think: _“Ye banda alag hai… iski baat poori sunni chahiye.”_\n`;
    res += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    res += `_“You are not the salesperson begging for business; you are the Prize granting access!”_ 👑`;

    return res;
  }

  /**
   * Conversational Router for WhatsApp and Orchestrator
   */
  handleKlaffConversation(text = '', userContext = null) {
    const q = (text || '').toLowerCase().trim();
    const repName = userContext?.name || 'Field Sales Executive';

    let query = text;
    if (q.startsWith('klaff') || q.startsWith('oren') || q.startsWith('frame') || q.startsWith('status') || q.startsWith('authority')) {
      query = text.replace(/^(klaff|oren|frame|status|authority|power)\s*/i, '').trim();
    }

    if (!query || query.length < 4) {
      query = 'Power frame and price push objection handling';
    }

    return this.coachFrameControl({
      query,
      repName,
      targetName: 'Retail Trade Counter'
    });
  }
}

const controller = new OrenKlaffController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || 'Power frame and price push objection handling';
  console.log(controller.handleKlaffConversation(q));
}

module.exports = controller;
