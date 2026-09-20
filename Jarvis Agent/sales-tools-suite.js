/**
 * 🛒 SWATCH PAINTS — SALES DIVISION TOOLS SUITE
 * Controlled by: Brian Tracy (Chief Sales Officer)
 * Governing Authority: CEO Ashutosh Sharma (+91 9079609627)
 * 
 * Tools Included:
 * 1. calculate_instant_quote
 * 2. crm_lead_manager
 * 3. whatsapp_cadence_dispatcher
 * 4. inventory_stock_checker
 */

const fs = require('fs');
const path = require('path');
const twentyBridge = require('./twenty-crm-bridge');

class SalesToolsSuite {
  constructor() {
    this.productsCsvPath = path.join(__dirname, 'data', 'products.csv');
    this.usersCsvPath = path.join(__dirname, 'data', 'users.csv');
    
    // Binding methods
    this.calculate_instant_quote = this.calculate_instant_quote.bind(this);
    this.crm_lead_manager = this.crm_lead_manager.bind(this);
    this.whatsapp_cadence_dispatcher = this.whatsapp_cadence_dispatcher.bind(this);
    this.inventory_stock_checker = this.inventory_stock_checker.bind(this);
  }

  /**
   * Tool 1: Quotation & Dealer ROI Calculator Tool
   * Calculates official dealer billing, retail MRP, and dealer 40-45% cash profit.
   * STRICT GUARDRAlL: Strictly NO factory base costs or internal margins exposed!
   */
  calculate_instant_quote({ items, dealerName = 'Dealer', isBulkTier = false }) {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        error: 'Please provide at least one item with product code/slug and quantity.'
      };
    }

    const catalog = {
      'rustic': { name: 'Swatch Rustic Texture (25kg)', dp: isBulkTier ? 645 : 690, mrp: 1150, pack: '25kg Bag', token: 50 },
      'roller_coat': { name: 'Swatch Roller Coat (25kg)', dp: isBulkTier ? 645 : 690, mrp: 1150, pack: '25kg Bag', token: 0 },
      'weatherguard_20l': { name: 'Swatch Weatherguard (20L)', dp: 2460, mrp: 4100, pack: '20L Bucket', token: 0 },
      'weatherguard_10l': { name: 'Swatch Weatherguard (10L)', dp: 1230, mrp: 2050, pack: '10L Bucket', token: 0 },
      'weatherguard_4l': { name: 'Swatch Weatherguard (4L)', dp: 492, mrp: 820, pack: '4L Bucket', token: 0 },
      'weatherguard_1l': { name: 'Swatch Weatherguard (1L)', dp: 123, mrp: 205, pack: '1L Container', token: 0 },
      'shine_20l': { name: 'Swatch Shine Emulsion (20L)', dp: 2460, mrp: 4100, pack: '20L Bucket', token: 0 },
      'shine_10l': { name: 'Swatch Shine Emulsion (10L)', dp: 1230, mrp: 2050, pack: '10L Bucket', token: 0 },
      'shine_4l': { name: 'Swatch Shine Emulsion (4L)', dp: 492, mrp: 820, pack: '4L Bucket', token: 0 },
      'waterproofing_5l': { name: 'Swatch Waterproofing Solution (5L)', dp: 1000, mrp: 1800, pack: '5L Jerry Can', token: 0 },
      'waterproofing_1l': { name: 'Swatch Waterproofing Solution (1L)', dp: 200, mrp: 360, pack: '1L Bottle', token: 0 },
      'topcoat_5l': { name: 'Swatch Top Coat Clear Sealant (5L)', dp: 1750, mrp: 2500, pack: '5L Jerry Can', token: 0 },
      'topcoat_1l': { name: 'Swatch Top Coat Clear Sealant (1L)', dp: 350, mrp: 500, pack: '1L Bottle', token: 0 }
    };

    let totalInvestment = 0;
    let totalRetailValue = 0;
    let totalTokens = 0;
    let totalRusticBags = 0;
    const breakdown = [];

    items.forEach(item => {
      const key = (item.product || '').toLowerCase().trim();
      const product = catalog[key] || catalog['rustic'];
      const qty = parseInt(item.qty, 10) || 1;

      const lineCost = product.dp * qty;
      const lineRetail = product.mrp * qty;
      const lineProfit = lineRetail - lineCost;
      const marginPct = ((lineProfit / lineRetail) * 100).toFixed(1);

      if (key.includes('rustic')) {
        totalRusticBags += qty;
        totalTokens += (product.token * qty);
      }

      totalInvestment += lineCost;
      totalRetailValue += lineRetail;

      breakdown.push({
        product: product.name,
        qty,
        pack: product.pack,
        dealerPrice: product.dp,
        lineTotal: lineCost,
        mrp: product.mrp,
        retailValue: lineRetail,
        dealerProfit: lineProfit,
        marginPct: `${marginPct}%`
      });
    });

    const netProfit = totalRetailValue - totalInvestment;
    const overallMarginPct = ((netProfit / totalRetailValue) * 100).toFixed(1);

    // Free bonuses & schemes
    const bonuses = [];
    if (totalRusticBags >= 50) {
      bonuses.push('+ 3 BAGS 100% FREE (Worth ₹3,450)');
      bonuses.push('Free Backlit Storefront Fascia Glow-Sign Board');
      bonuses.push('Free 1ft x 1ft Cured Quartz Texture Demo Boards (x2)');
    } else if (totalRusticBags >= 20) {
      bonuses.push('+ 1 BAG 100% FREE (Worth ₹1,150)');
      bonuses.push('Free Bundi Factory Truck Delivery to Shop');
      bonuses.push('Free 1ft x 1ft Cured Quartz Texture Counter Demo Board');
    }

    // 2% Prompt Payment Cash Discount
    const cd2Percent = Math.round(totalInvestment * 0.02);
    const netWithCD = totalInvestment - cd2Percent;

    // Format WhatsApp ready message
    let quoteText = `🧾 *SWATCH PAINTS — OFFICIAL DEALER ORDER QUOTATION*\n`;
    quoteText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    quoteText += `👤 *Prepared for*: ${dealerName} ji\n`;
    quoteText += `🏭 *Factory Source*: Bundi Manufacturing Plant (Sharma Industries)\n\n`;
    quoteText += `📦 *ORDER BREAKDOWN*:\n`;

    breakdown.forEach((b, i) => {
      quoteText += `${i + 1}. *${b.product}* x ${b.qty} units\n`;
      quoteText += `   • Dealer Billing: ₹${b.lineTotal.toLocaleString('en-IN')} (₹${b.dealerPrice}/unit)\n`;
      quoteText += `   • Retail MRP Value: ₹${b.retailValue.toLocaleString('en-IN')} (₹${b.mrp}/unit)\n`;
      quoteText += `   • *Your Cash Profit*: *₹${b.dealerProfit.toLocaleString('en-IN')} (${b.marginPct} Margin)*\n\n`;
    });

    quoteText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    quoteText += `💰 *FINANCIAL SUMMARY*:\n`;
    quoteText += `• Total Dealer Purchase Amount: *₹${totalInvestment.toLocaleString('en-IN')}*\n`;
    quoteText += `• Total Retail Counter Value: *₹${totalRetailValue.toLocaleString('en-IN')}*\n`;
    quoteText += `• 🟢 *NET DEALER CASH PROFIT*: *₹${netProfit.toLocaleString('en-IN')} (${overallMarginPct}% Clean Return)*\n`;
    if (totalTokens > 0) {
      quoteText += `• 🎁 *Painter Cash Tokens Inside*: ₹${totalTokens.toLocaleString('en-IN')} (Guaranteed Contractor Pull)\n`;
    }
    quoteText += `• ⚡ *2% Cash Discount (Within 7 Days)*: Save extra *₹${cd2Percent.toLocaleString('en-IN')}* ➔ Net: *₹${netWithCD.toLocaleString('en-IN')}*\n\n`;

    if (bonuses.length > 0) {
      quoteText += `🎁 *QUALIFIED FREE BONUS & SCHEMES*:\n`;
      bonuses.forEach(b => {
        quoteText += `✔ ${b}\n`;
      });
      quoteText += `\n`;
    }

    quoteText += `🚚 *Delivery*: 24-Hour Factory Truck Dispatch directly to counter\n`;
    quoteText += `🛡️ *Warranty*: 5-Year Weatherproof & Anti-Fungal Assurance\n`;
    quoteText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    quoteText += `_Brian Tracy Closing Rule: Order confirm karne ke liye reply karein "CONFIRM"_ 🫡`;

    return {
      success: true,
      summary: {
        totalInvestment,
        totalRetailValue,
        netProfit,
        overallMarginPct,
        cd2Percent,
        netWithCD,
        bonuses,
        totalRusticBags,
        breakdown
      },
      quoteText
    };
  }

  /**
   * Tool 2: Live Counter Visit & Pipeline Tool
   * Manages dealers and visit notes in data/users.csv
   */
  crm_lead_manager({ action = 'add', phone, name, role = 'dealer', tier = 'Tier 2', region = 'Rajasthan', stage = 'Qualified', notes = '', geotag = '' }) {
    if (!phone) {
      return { success: false, error: 'Phone number is required for CRM management.' };
    }

    const cleanPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;
    let csvContent = '';
    let rows = [];

    if (fs.existsSync(this.usersCsvPath)) {
      csvContent = fs.readFileSync(this.usersCsvPath, 'utf8');
      rows = csvContent.split('\n').filter(r => r.trim().length > 0);
    } else {
      rows = ['phone,name,role,tier,region,creditLimit,balanceDue,notes'];
    }

    const headers = rows[0].split(',');
    let foundIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(',');
      if (cols[0].trim() === cleanPhone) {
        foundIndex = i;
        break;
      }
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (action === 'add') {
      if (foundIndex !== -1) {
        return {
          success: true,
          message: `Dealer ${cleanPhone} already registered in CRM. Use action 'update_stage' or 'log_visit'.`,
          existingRecord: rows[foundIndex]
        };
      }
      const newRow = `${cleanPhone},"${name || 'Dealer'}","${role}","${tier}","${region}",0,0,"[Stage: ${stage}] Registered: ${timestamp}. ${notes}"`;
      rows.push(newRow);
      fs.writeFileSync(this.usersCsvPath, rows.join('\n') + '\n', 'utf8');

      // Sync to Twenty CRM
      twentyBridge.pushLeadToTwenty({
        name: name || 'Dealer',
        phone: cleanPhone,
        role,
        stage,
        dealValue: 34500,
        region,
        notes
      }).catch(e => console.error('[Twenty Bridge AutoSync]', e.message));

      return {
        success: true,
        action: 'added',
        phone: cleanPhone,
        name: name || 'Dealer',
        stage,
        message: `Dealer ${name || cleanPhone} successfully registered in CRM & Twenty CRM!`
      };
    }

    if (action === 'update_stage' || action === 'log_visit') {
      if (foundIndex === -1) {
        // Auto-create on visit
        const newRow = `${cleanPhone},"${name || 'Dealer'}","${role}","${tier}","${region}",0,0,"[Stage: ${stage}] ${action === 'log_visit' ? 'Visited' : 'Updated'}: ${timestamp} at ${geotag || region}. ${notes}"`;
        rows.push(newRow);
      } else {
        const cols = rows[foundIndex].split(',');
        let existingNotes = cols.slice(7).join(',').replace(/^"|"$/g, '');
        existingNotes += ` | [Stage: ${stage}] ${timestamp}: ${notes} ${geotag ? `(Loc: ${geotag})` : ''}`;
        cols[7] = `"${existingNotes.trim()}"`;
        if (name) cols[1] = `"${name}"`;
        if (region) cols[4] = `"${region}"`;
        rows[foundIndex] = cols.join(',');
      }

      fs.writeFileSync(this.usersCsvPath, rows.join('\n') + '\n', 'utf8');

      return {
        success: true,
        action,
        phone: cleanPhone,
        stage,
        timestamp,
        message: `CRM updated successfully for ${cleanPhone} [Stage: ${stage}]!`
      };
    }

    return { success: false, error: `Unknown CRM action: ${action}` };
  }

  /**
   * Tool 3: Automated Follow-up Sender
   * Brian Tracy's 4-Touch Follow-up Sequence
   */
  whatsapp_cadence_dispatcher({ phone, dealerName = 'Dealer', touchpoint = 1, customNote = '' }) {
    const cleanPhone = phone ? (phone.startsWith('+') ? phone : `+91${phone}`) : null;
    let message = '';

    switch (parseInt(touchpoint, 10)) {
      case 1:
        // Day 1: Post-Visit Recap & Quote Confirmation
        message = `Namaste ${dealerName} ji! 🙏\n\n` +
          `Aaj aapki dukaan par aapse milkar bohot accha laga. Swatch Paints ke natural quartz architectural texture ka 40% margin model aapke counter ke liye best fit hai.\n\n` +
          `Sample board aapke counter par rakh diya hai. Kal subah factory truck se 20-bag starter batch (+1 Bag Free) dispatch nikalwa dein?\n\n` +
          `${customNote ? `Note: ${customNote}\n\n` : ''}` +
          `Aapka shubh-chintak,\nBrian Tracy Sales Desk — Swatch Paints (Bundi Plant)`;
        break;

      case 2:
        // Day 2: Visual Social Proof
        message = `Namaste ${dealerName} ji! 🌟\n\n` +
          `Ye dekhiye hamare Hadoti region me kal hi complete huye Swatch Rustic site ka result. 5 saal tak na rang udega na seelan aayegi!\n\n` +
          `Aas-paas ke 4 dealers ne already display lagwa liya hai aur painters ko har bag me ₹50 cash token bohot pasand aa raha hai.\n\n` +
          `Aapka Shubh Aarambh batch aaj confirm karwaye taaki weekend delivery ho sake?\n\n` +
          `Swatch Paints — Har Deewar Ka Pukka Vishwas 👑`;
        break;

      case 3:
        // Day 3: Morning Order Confirmation Call / Urgency Trigger
        message = `Namaste ${dealerName} ji! 🚚\n\n` +
          `Aaj subah 11:00 baje Bundi factory se truck aapke area ke route par nikal raha hai. Factory manager ne aapke starter order ke sath free 1ft x 1ft cured quartz display board bhi allocate kar diya hai.\n\n` +
          `Aapka 20-bag lot gadi me load karwa doon sir? Sirf "HAAN" likhkar reply karein.\n\n` +
          `Dhanyawad,\nSwatch Paints Team`;
        break;

      case 7:
        // Day 7: Revisit with Senior Painting Contractor
        message = `Namaste ${dealerName} ji! 🤝\n\n` +
          `Hum aaj dopahar 2:30 baje aapke counter par aa rahe hain hamare area ke senior painting contractor ke sath. Wo khud Swatch Rustic ki coverage aur ₹50 painter cash token ka live feedback denge.\n\n` +
          `Milte hain sir dopahar me!\n\n` +
          `Brian Tracy Field Team — Sharma Industries`;
        break;

      default:
        message = `Namaste ${dealerName} ji! Swatch Paints factory-direct commercial partnership ke sath aapke counter par 40% net cash margin dene ke liye ready hai. Batayein sir kab batch dispatch karwaye?`;
    }

    return {
      success: true,
      phone: cleanPhone,
      dealerName,
      touchpoint,
      message,
      dispatchReady: true
    };
  }

  /**
   * Tool 4: Bundi Factory Stock Query
   * Real-time stock levels and pack sizes from data/products.csv
   */
  inventory_stock_checker({ product = 'all' }) {
    if (!fs.existsSync(this.productsCsvPath)) {
      return { success: false, error: 'Products database not found.' };
    }

    const content = fs.readFileSync(this.productsCsvPath, 'utf8');
    const rows = content.split('\n').filter(r => r.trim().length > 0);
    const results = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(',');
      const sku = cols[0];
      const name = cols[1];
      const category = cols[2];
      const pack = cols[3];
      const stock = parseInt(cols[4], 10) || 100;
      const dp = cols[6];
      const mrp = cols[9];

      if (product === 'all' || name.toLowerCase().includes(product.toLowerCase()) || sku.toLowerCase().includes(product.toLowerCase())) {
        results.push({
          sku,
          name,
          category,
          packSize: pack,
          inStockQty: stock,
          status: stock >= 20 ? '🟢 AVAILABLE (Immediate 24-hr Dispatch)' : '🟡 LOW STOCK (Batch in production)',
          authorizedDealerPrice: `₹${dp}`,
          retailMRP: `₹${mrp}`
        });
      }
    }

    let brief = `🏭 *BUNDI FACTORY LIVE WAREHOUSE STOCK (SHARMA INDUSTRIES)*\n`;
    brief += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    brief += `📅 Status Updated: ${new Date().toISOString().substring(0, 10)} | Location: Bundi Plant\n\n`;

    results.forEach(r => {
      brief += `• *${r.name}* (${r.packSize}): *${r.inStockQty} units* | ${r.status}\n`;
      brief += `  Dealer Billing: ${r.authorizedDealerPrice} | MRP: ${r.retailMRP}\n\n`;
    });

    brief += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    brief += `_Dispatch SLA: Orders received before 14:00 IST are dispatched same day!_ 🚚`;

    return {
      success: true,
      count: results.length,
      inventory: results,
      formattedReport: brief
    };
  }
}

module.exports = new SalesToolsSuite();
