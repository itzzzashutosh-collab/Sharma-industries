/**
 * 🎨 SWATCH PAINTS — MARKETING DIVISION TOOLS SUITE
 * Controlled by: Philip Kotler (Chief Marketing Strategist / CMO)
 * Governing Authority: CEO Ashutosh Sharma (+91 9079609627)
 * 
 * Tools Included:
 * 1. generate_social_creative
 * 2. local_seo_lead_router
 * 3. whatsapp_trade_broadcaster
 * 4. ceo_file_approval_submitter
 */

const fs = require('fs');
const path = require('path');

class MarketingToolsSuite {
  constructor() {
    this.ledgerPath = path.join(__dirname, 'data', 'ceo_file_approvals_ledger.json');
    this.usersCsvPath = path.join(__dirname, 'data', 'users.csv');

    // Binding methods
    this.generate_social_creative = this.generate_social_creative.bind(this);
    this.local_seo_lead_router = this.local_seo_lead_router.bind(this);
    this.whatsapp_trade_broadcaster = this.whatsapp_trade_broadcaster.bind(this);
    this.ceo_file_approval_submitter = this.ceo_file_approval_submitter.bind(this);
  }

  /**
   * Tool 1: Brand Visual Asset Creator
   * Generates social copy, banners, and visual design parameters
   * Enforces locked Swatch colors: Imperial Purple (#4B0082), Rich Gold (#D4AF37), Cream (#FFFDD0)
   */
  generate_social_creative({
    title = 'Har Deewar Ka Pukka Vishwas',
    product = 'Swatch Rustic Texture',
    offer = 'Shubh Aarambh 20+1 Starter Batch',
    platform = 'instagram_post'
  }) {
    const brandPalette = {
      primary: '#4B0082', // Imperial Purple
      accent: '#D4AF37',  // Rich Gold
      background: '#FFFDD0', // Warm Cream
      text: '#1A1A1A'
    };

    let creativeCopy = '';
    let visualSpecs = {};

    if (platform === 'whatsapp_status') {
      creativeCopy = `✨ *${title.toUpperCase()}* ✨\n\n` +
        `🧱 *${product}* — Rajasthan ka apna natural quartz stone finish!\n\n` +
        `💎 *Why Choose Swatch?*\n` +
        `✔ 5-Year Weather & Anti-Fungal Assurance\n` +
        `✔ 100% Monolithic Natural Stone Quartz — No Fading\n` +
        `✔ ₹50 Painter Cash Token Inside Every 25kg Bag\n` +
        `✔ Clean 40–45% Dealer Cash Margins\n\n` +
        `🎁 *Special Trade Offer*: ${offer}\n\n` +
        `📞 *Bundi Factory Direct Hotline*: +91 8000530422\n` +
        `_Best Quality. Best Price. Sharma Industries._ 👑`;

      visualSpecs = {
        format: 'Vertical Story (1080x1920)',
        gradient: 'Linear (Imperial Purple #4B0082 to Deep Plum #2D004D)',
        goldBadge: '₹50 Painter Cash Token Inside',
        heroImage: 'High-contrast split screen (Flaking Putty vs Monolithic Swatch Rustic)'
      };
    } else if (platform === 'instagram_post') {
      creativeCopy = `🔥 Rajasthan ki kadakti dhoop aur barish ka ek hi ilaj: **${product}**!\n\n` +
        `Sadharan paint 2 saal me fade ho jata hai, lekin Swatch natural graded quartz facade par monolithic stone armor banata hai jo 5 saal tak bilkul naya rehta hai! 🧱✨\n\n` +
        `💼 *For Hardware & Paint Retailers*:\n` +
        `Zero Machine Investment. 40–45% Direct Cash Margins. 24-Hour Factory Dispatch.\n\n` +
        `🎁 *Trade Scheme*: ${offer}!\n\n` +
        `📩 Send 'SWATCH' on WhatsApp to +91 8000530422 for Free Doorstep Demo.\n\n` +
        `#SwatchPaints #SharmaIndustries #BundiPaints #KotaHardware #ArchitecturalCoatings #RusticTexture #ExteriorWallDesign #PaintersClub #MadeInRajasthan`;

      visualSpecs = {
        format: 'Square Post (1080x1080)',
        border: '3px Rich Gold (#D4AF37)',
        headlineFont: 'Bold Serif with Drop Shadow',
        calloutBadge: '5-YEAR DURABILITY ASSURANCE'
      };
    } else {
      // Dealer Counter Flyer / Poster
      creativeCopy = `🏪 *SWATCH PAINTS — AUTHORIZED RETAIL DISPLAY POSTER*\n\n` +
        `👑 *${title}*\n` +
        `PRODUCT: ${product}\n` +
        `GUARANTEE: 5-Year Weatherproof Durability Assurance\n` +
        `PAINTER BENEFIT: ₹50 Instant Cash Coupon in Every Bag\n` +
        `EXCLUSIVE SCHEME: ${offer}\n` +
        `Direct Factory Support: Sharma Industries, Bundi (Rajasthan)\n` +
        `Inquiries & Orders: +91 8000530422`;

      visualSpecs = {
        format: 'A4 Counter Flange Poster (1200x1600)',
        header: 'Regal Purple Banner with Gold Emblem',
        footer: 'Bundi Factory Quality Seal'
      };
    }

    return {
      success: true,
      platform,
      brandPalette,
      visualSpecs,
      creativeCopy,
      message: 'Creative asset generated successfully adhering to Swatch visual guidelines.'
    };
  }

  /**
   * Tool 2: Neil Patel 15-Minute Local Lead Gateway
   * Captures search/maps inquiries and routes to closest authorized dealer within 15 minutes
   */
  local_seo_lead_router({
    customerName = 'Prospective Customer',
    customerPhone,
    location = 'Bundi',
    productInterest = 'Swatch Rustic Texture'
  }) {
    if (!customerPhone) {
      return { success: false, error: 'Customer phone number is required for lead routing.' };
    }

    // Lookup closest dealer from users.csv
    let closestDealer = { name: 'Sonu Kumar', phone: '+919057501926', region: 'Bundi / Kota Territory' };

    if (fs.existsSync(this.usersCsvPath)) {
      const rows = fs.readFileSync(this.usersCsvPath, 'utf8').split('\n');
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (cols.length >= 5) {
          const dPhone = cols[0].trim();
          const dName = cols[1].replace(/"/g, '').trim();
          const dRegion = cols[4].replace(/"/g, '').trim();
          if (location.toLowerCase().includes(dRegion.toLowerCase()) || dRegion.toLowerCase().includes(location.toLowerCase())) {
            closestDealer = { name: dName, phone: dPhone, region: dRegion };
            break;
          }
        }
      }
    }

    const leadTimestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Format dealer handoff message (15-Minute SLA)
    const dealerHandoffText = `🚨 *SWATCH HIGH-INTENT BUYER LEAD (15-MINUTE SLA)* 🚨\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Namaste ${closestDealer.name} ji! 🙏\n\n` +
      `Aapke area (${location}) se ek ready-to-buy customer ne Google Maps par Swatch Paints search kiya hai:\n\n` +
      `👤 *Customer Name*: ${customerName} ji\n` +
      `📞 *Contact Number*: ${customerPhone}\n` +
      `📍 *Location*: ${location}\n` +
      `🧱 *Product Requirement*: ${productInterest}\n` +
      `⏰ *Lead Generated*: ${leadTimestamp} IST\n\n` +
      `👉 *Neil Patel Conversion Rule*: Agle 15 minute ke andar customer ko call karein aur unhe aapki dukaan se sample dekhne bulayein.\n\n` +
      `Dhanyawad,\nSwatch Hyperlocal Demand Engine — Sharma Industries`;

    // Format customer acknowledgment message
    const customerAckText = `Namaste ${customerName} ji! 🙏\n\n` +
      `Swatch Paints me ruchi dikhane ke liye dhanyawad. Hamare ${location} ke authorized distributor **${closestDealer.name} ji** (${closestDealer.phone}) aapse agle 15 minute me contact karke aapke ghar ke liye free samples arrange karwayenge.\n\n` +
      `Swatch Paints — Har Deewar Ka Pukka Vishwas 👑`;

    return {
      success: true,
      slaMinutes: 15,
      leadDetails: {
        customerName,
        customerPhone,
        location,
        productInterest,
        assignedDealer: closestDealer,
        timestamp: leadTimestamp
      },
      dealerHandoffText,
      customerAckText
    };
  }

  /**
   * Tool 3: Bulk Vernacular Trade Broadcaster
   * Multi-legend broadcast templates for dealers, painters, and thekedars
   */
  whatsapp_trade_broadcaster({
    campaignType = 'festival_scheme',
    targetGroup = 'dealers',
    customHook = ''
  }) {
    let broadcastSubject = '';
    let broadcastMessage = '';

    switch (campaignType) {
      case 'festival_scheme':
        broadcastSubject = '🎉 SHUBH AARAMBH FESTIVE TRADE SCHEME (20+1 FREE)';
        broadcastMessage = `🎉 *SWATCH PAINTS — SHUBH AARAMBH DHAMAKA OFFER* 🎉\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste [Name] ji! 🙏\n\n` +
          `Bundi manufacturing plant se direct factory festive bumper scheme:\n\n` +
          `📦 *Shubh Aarambh 20-Bag Lot*: Har 20 bag Swatch Rustic order karne par:\n` +
          `✔ *+ 1 BAG 100% FREE* (Value ₹1,150 — Seedha aapka net profit!)\n` +
          `✔ *Free 1ft x 1ft Cured Quartz Display Board*\n` +
          `✔ *Free Factory Truck Delivery* direct aapke counter tak\n` +
          `✔ *2% Extra Cash Discount* on 7-day payment\n\n` +
          `💰 *Aapka Profit*: Swatch Rustic bechne par saaf 40–45% net margin milta hai (MNC ke 3% margin ke muqable 10X zyada cash munafa!).\n\n` +
          `${customHook ? `📢 *Special Update*: ${customHook}\n\n` : ''}` +
          `🚚 *Batch dispatch kal subah 11:00 baje*. Confirm karne ke liye reply karein "BOOK 20".\n\n` +
          `Dhanyawad,\nPhilip Kotler Marketing Desk — Swatch Paints (+91 8000530422)`;
        break;

      case 'painter_token_alert':
        broadcastSubject = '🎁 ₹50 CASH TOKEN ALERT FOR THEKEDARS';
        broadcastMessage = `🎁 *SWATCH CERTIFIED PAINTERS CLUB — TOKEN ALERT* 🎁\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste [Name] ji! 🙏\n\n` +
          `Bundi factory se khushkhabri! Swatch Rustic Texture ke har 25kg bag ke andar **₹50 ka sealed cash token** rakha gaya hai.\n\n` +
          `✨ *Painter Bhaiyon ke Fayde*:\n` +
          `• 100% factory-graded washed natural quartz — trowel se application bohot smooth chalti hai\n` +
          `• Zero touch-up, zero complaint finish\n` +
          `• Har bag kholte hi ₹50 cash token instant cashable!\n\n` +
          `Apne nazdeeki hardware dealer se Swatch Rustic maangein ya direct factory sample mangwane ke liye WhatsApp karein: +91 8000530422.\n\n` +
          `_Skill Aapki, Vishwas Swatch Ka!_ 🤝`;
        break;

      case 'monsoon_defense':
        broadcastSubject = '🌧️ 5-YEAR MONSOON DEFENSE CAMPAIGN';
        broadcastMessage = `🌧️ *MONSOON SEELAN SE PERMANENT CHHUTKARA* 🌧️\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste [Name] ji! 🙏\n\n` +
          `Rajasthan ki barish aur dhoop me agar deewar par sadharan paint lagao toh 2 saal me shora aur papdi ban jati hai.\n\n` +
          `🛡️ *Swatch Weatherguard + Waterproofing System*:\n` +
          `• Deep-penetrating micro-pore moisture barrier\n` +
          `• High-elongation acrylic polymer stretch (dararein nahi aane deta)\n` +
          `• 5 Saala Weather Durability Assurance seedha factory se certified!\n\n` +
          `Apne ghar ka free moisture check karwayein — WhatsApp par 'CHECK' bhejein +91 8000530422 par.\n\n` +
          `Sharma Industries — Bundi Plant 👑`;
        break;

      case 'new_product_launch':
        broadcastSubject = '✨ COMPLETE 6-PRODUCT ARSENAL ARRIVAL';
        broadcastMessage = `✨ *ANNOUNCING SWATCH 6-PRODUCT COMPLETE SURFACE ARSENAL* ✨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste [Name] ji! 🙏\n\n` +
          `Swatch Paints ab leke aaya hai complete surface protection range with 40–45% dealer margins:\n\n` +
          `1. *Swatch Rustic Texture* (25kg Stone Cladding Finish)\n` +
          `2. *Swatch Roller Coat* (Easy Roll-on Texture)\n` +
          `3. *Swatch Weatherguard 20L* (5-Year Exterior Armor)\n` +
          `4. *Swatch Shine Emulsion 20L* (Luxury Washable Interior)\n` +
          `5. *Swatch Waterproofing Solution* (Deep Barrier)\n` +
          `6. *Swatch Top Coat Clear Sealant* (Gloss Quartz Lock)\n\n` +
          `Complete Combo Starter Basket lene par special dealer stocking scheme uplabdh hai.\n\n` +
          `Details ke liye reply karein "CATALOG".\n` +
          `Philip Kotler Marketing Command — Swatch Paints`;
        break;

      default:
        broadcastSubject = '📢 SWATCH PAINTS TRADE UPDATE';
        broadcastMessage = `Namaste [Name] ji! Swatch Paints Rajasthan trade network me high-margin products deliver kar raha hai. Sampark karein: +91 8000530422.`;
    }

    return {
      success: true,
      campaignType,
      targetGroup,
      broadcastSubject,
      broadcastMessage,
      readyForDispatch: true
    };
  }

  /**
   * Tool 4: Auto-Approval Ledger Integration
   * Automatically registers newly created assets in data/ceo_file_approvals_ledger.json as PENDING_CEO_APPROVAL
   */
  ceo_file_approval_submitter({
    fileId,
    title,
    division = 'Marketing & Strategy',
    authorLegend = 'Philip Kotler',
    summary = 'New marketing asset submitted for CEO review',
    commercialImpact = 'Drives trade demand and retail counter conversion',
    filePath,
    metadata = {}
  }) {
    if (!title || !filePath) {
      return { success: false, error: 'Title and filePath are required for file approval submission.' };
    }

    const generatedFileId = fileId || `FILE-MAR-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    let ledger = {
      version: '1.0',
      lastUpdated: timestamp,
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      files: []
    };

    if (fs.existsSync(this.ledgerPath)) {
      try {
        ledger = JSON.parse(fs.readFileSync(this.ledgerPath, 'utf8'));
      } catch (err) {
        console.error('Error reading approval ledger:', err.message);
      }
    }

    // Check if already registered
    const existingIndex = ledger.files.findIndex(f => f.fileId === generatedFileId || f.filePath === filePath);
    
    const entry = {
      fileId: generatedFileId,
      filePath,
      fileName: path.basename(filePath),
      title,
      division,
      authorLegend,
      summary,
      commercialImpact,
      status: 'PENDING_CEO_APPROVAL',
      submittedAt: timestamp,
      reviewedAt: null,
      reviewedBy: null,
      decisionNotes: null,
      metadata
    };

    if (existingIndex >= 0) {
      ledger.files[existingIndex] = entry;
    } else {
      ledger.files.unshift(entry);
    }

    // Recalculate counts
    ledger.totalPending = ledger.files.filter(f => f.status === 'PENDING_CEO_APPROVAL').length;
    ledger.totalApproved = ledger.files.filter(f => f.status === 'APPROVED_BY_CEO').length;
    ledger.totalRejected = ledger.files.filter(f => f.status === 'REJECTED_BY_CEO').length;
    ledger.lastUpdated = timestamp;

    fs.writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 2), 'utf8');

    // Format instant 1-click action message for CEO Ashutosh Sharma
    const ceoNotificationText = `🛡️ *NEW FILE SUBMITTED FOR CEO APPROVAL*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📁 *File ID*: \`${generatedFileId}\`\n` +
      `📝 *Title*: ${title}\n` +
      `🎖️ *Division*: ${division} (${authorLegend})\n` +
      `📄 *Path*: \`${filePath}\`\n\n` +
      `📋 *Summary*: ${summary}\n` +
      `💼 *Commercial Impact*: ${commercialImpact}\n\n` +
      `⚡ *1-Click WhatsApp Action Commands*:\n` +
      `• *"Approve file ${generatedFileId}"*\n` +
      `• *"Reject file ${generatedFileId} [reason]"*\n` +
      `• *"Pending files"*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Status: Strictly locked until signed off by Ashutosh Sir (+91 9079609627)._ 👑`;

    return {
      success: true,
      fileId: generatedFileId,
      status: 'PENDING_CEO_APPROVAL',
      totalPending: ledger.totalPending,
      ceoNotificationText,
      message: `File ${generatedFileId} successfully registered in CEO Approval Gate!`
    };
  }
}

module.exports = new MarketingToolsSuite();
