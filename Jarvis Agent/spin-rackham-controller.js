/**
 * Neil Rackham SPIN Selling & Deep Pain Monetization Controller
 * Swatch Paints — Sales & Negotiations Division
 * 
 * Implements structured Situation -> Problem -> Implication -> Need Payoff diagnosis,
 * calculates cold arithmetic ₹ loss for multi-brand retail counters, and generates
 * high-certainty hybrid closing dialogues (Belfort + NEPQ + SPIN + Hormozi).
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, 'data', 'neil_rackham_spin_diagnosis_ledger.csv');

function parseCsv() {
  if (!fs.existsSync(LEDGER_PATH)) return [];
  try {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf-8');
    const lines = raw.trim().split('\n');
    if (lines.length <= 1) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      // Regex to handle quoted CSV strings with commas
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const row = {};
      headers.forEach((h, i) => {
        let val = matches[i] ? matches[i].replace(/^"|"$/g, '').trim() : '';
        row[h] = val;
      });
      return row;
    });
  } catch (err) {
    console.error('[SPIN Controller] Error reading CSV ledger:', err.message);
    return [];
  }
}

class SpinRackhamController {
  constructor() {
    this.name = 'neil_rackham_spin_controller';
    this.legend = 'Neil Rackham';
    this.role = 'SPIN Specialist (Deep Diagnosis & Pain Monetization Expert)';
    this.division = 'Sales & Negotiations Division';
  }

  /**
   * Cold Arithmetic ₹ Loss Calculator
   */
  calculatePainMonetization({ monthlyBags = 50, currentMargin = 50, swatchMargin = 400 }) {
    const bags = parseInt(monthlyBags, 10) || 50;
    const current = parseFloat(currentMargin) || 50;
    const swatch = parseFloat(swatchMargin) || 400;

    const currentMonthlyProfit = bags * current;
    const swatchMonthlyProfit = bags * swatch;
    const monthlyLoss = swatchMonthlyProfit - currentMonthlyProfit;
    const yearlyLoss = monthlyLoss * 12;

    const dialogueScript = 
      `“Sir ek simple rough hisaab lagate hain dukan par baith kar:\n` +
      `• Aap mahine me ${bags} bags texture bechte ho.\n` +
      `• Abhi legacy brand par per bag lagbhag ₹${current} margin milta hai.\n` +
      `  ➔ Mahine ka total profit: ₹${currentMonthlyProfit.toLocaleString('en-IN')}\n\n` +
      `• Swatch Rustic par direct dealer margin: ₹${swatch} per bag.\n` +
      `  ➔ Mahine ka actual profit potential: ₹${swatchMonthlyProfit.toLocaleString('en-IN')}\n\n` +
      `👉 Difference = ₹${monthlyLoss.toLocaleString('en-IN')} har mahine aapke counter se nikal raha hai!\n` +
      `👉 Saal ka total loss: ₹${yearlyLoss.toLocaleString('en-IN')}.\n\n` +
      `Sir, iska matlab aap legacy brand ke TV ad ke chakkar me apni jeb se har saal ₹${(yearlyLoss / 100000).toFixed(2)} Lakh chhod rahe ho?”`;

    return {
      monthlyBags: bags,
      currentMargin: current,
      swatchMargin: swatch,
      currentMonthlyProfit,
      swatchMonthlyProfit,
      monthlyLoss,
      yearlyLoss,
      dialogueScript
    };
  }

  /**
   * Complete 4-Stage SPIN Dialogue Generator
   */
  generateSpinFlow({ dealerType = 'Multi-Brand Paint Retailer', monthlyBags = 50, currentMargin = 50, brand = 'Asian/Berger' }) {
    const calc = this.calculatePainMonetization({ monthlyBags, currentMargin, swatchMargin: 400 });

    return {
      dealerType,
      framework: 'SPIN (Situation -> Problem -> Implication -> Need Payoff)',
      stages: {
        situation: {
          step: '1️⃣ SITUATION (Fact Finding)',
          goal: 'Counter reality aur baseline volume samajhna',
          question: `“Sir abhi texture coatings me kaunsa brand primary chal raha hai dukan par — ${brand} ya koi local brand?”`,
          rule: 'Keep short (max 2 questions); do not interrogate.'
        },
        problem: {
          step: '2️⃣ PROBLEM (Pain Identification)',
          goal: 'Dealer khud bole ki margin aur rotation me problem hai',
          question: `“Sir jo ₹${calc.currentMargin} margin milta hai, usme dukan ka overhead aur delivery cost nikalne ke baad kuch solid bachta hai ya sirf volume rotate ho raha hai?”`,
          rule: 'Customer should complain first; never criticize the brand yourself.'
        },
        implication: {
          step: '3️⃣ IMPLICATION (Quantified ₹ Loss Bleed)',
          goal: 'Problem ko bada banana aur exact rupaye ka loss dikhana',
          question: calc.dialogueScript,
          rule: 'Always use real rupee numbers. Numbers make denial impossible.'
        },
        needPayoff: {
          step: '4️⃣ NEED PAYOFF (Value Realization)',
          goal: 'Solution ka value dealer khud bole',
          question: `“Sir agar per bag ₹${calc.swatchMargin} ka solid margin mile aur har bag me ₹50 ka instant painter cash coupon ho, toh kya counter ka cash flow aur profit immediate jump nahi karega?”`,
          rule: 'Let the dealer imagine their relief before presenting the offer.'
        },
        comfortClose: {
          step: '5️⃣ HYBRID COMFORT CLOSE (Belfort + NEPQ)',
          goal: 'Low-risk 20-bag commitment',
          question: `“Toh sir, is mahine ka ₹${calc.monthlyLoss.toLocaleString('en-IN')} ka loss rokne ke liye, ek small 20-bag Shubh Aarambh starter trial start karna sensible rahega?”`
        }
      }
    };
  }

  /**
   * Handle incoming conversational requests on WhatsApp
   */
  handleSpinConversation(query = '') {
    const q = query.toLowerCase().trim();

    // Check if query asks for calculation with specific bags
    const bagMatch = q.match(/(\d+)\s*(?:bag|bags|bora|bore)/);
    const bags = bagMatch ? parseInt(bagMatch[1], 10) : 50;

    // Check if query asks for specific margin
    const marginMatch = q.match(/(?:margin|rate|bachat)\s*(?:of|is|hai)?\s*₹?\s*(\d+)/);
    const margin = marginMatch ? parseInt(marginMatch[1], 10) : 50;

    const calc = this.calculatePainMonetization({ monthlyBags: bags, currentMargin: margin });
    const spin = this.generateSpinFlow({ dealerType: 'Rajasthan Trade Counter', monthlyBags: bags, currentMargin: margin });

    let response = `📊 *SPIN SELLING ENGINE — NEIL RACKHAM*\n`;
    response += `_Deep Diagnosis & Pain Monetization System_\n\n`;
    response += `💡 *Core Philosophy*: _“No pain = No sale. No quantified pain = Weak sale.”_\n\n`;
    response += `💰 *Cold Arithmetic Pain Monetization (${bags} Bags/Month)*:\n`;
    response += `• Current Profit (@ ₹${margin}/bag): *₹${calc.currentMonthlyProfit.toLocaleString('en-IN')}*\n`;
    response += `• Swatch Profit (@ ₹400/bag): *₹${calc.swatchMonthlyProfit.toLocaleString('en-IN')}*\n`;
    response += `• 🚨 *Monthly Bleed / Loss*: *₹${calc.monthlyLoss.toLocaleString('en-IN')}/month*\n`;
    response += `• 🚨 *Yearly Bleed / Loss*: *₹${calc.yearlyLoss.toLocaleString('en-IN')}/year*\n\n`;
    
    response += `🧩 *4-Stage SPIN Sales Flow*:\n\n`;
    response += `*1️⃣ Situation*: ${spin.stages.situation.question}\n\n`;
    response += `*2️⃣ Problem*: ${spin.stages.problem.question}\n\n`;
    response += `*3️⃣ Implication (The Clincher)*:\n${spin.stages.implication.question}\n\n`;
    response += `*4️⃣ Need Payoff*: ${spin.stages.needPayoff.question}\n\n`;
    response += `*5️⃣ Comfort Close*: ${spin.stages.comfortClose.question}\n\n`;
    response += `🎯 _Daily Field Quota_: 10 Diagnoses | 5 Implication Conversations | 2 Closes. 👑`;

    return response;
  }
}

const controller = new SpinRackhamController();

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const q = args.join(' ') || '50 bags margin 50';
  console.log(controller.handleSpinConversation(q));
}

module.exports = controller;
