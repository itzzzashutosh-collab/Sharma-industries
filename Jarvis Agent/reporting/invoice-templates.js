/**
 * Sharma Industries / Swatch Paints — GST Tax Invoice & Quotation Templates Engine
 * 
 * Provides 4 distinct, high-end, executive-grade PDF templates:
 *  1. 'corporate'  - Modern Corporate Enterprise (Slate Navy, Royal Blue, Emerald accents)
 *  2. 'luxury'     - Minimalist Clean Luxury / Architectural (Matte Onyx, Champagne Gold)
 *  3. 'trade'      - B2B Wholesale Trade & Stockist (Heavy-duty Tally/Zoho enterprise, E-Way, Transporter)
 *  4. 'proforma'   - Proforma Quotation & Project Estimate (Pre-billing price quotation & validity)
 * 
 * All templates include:
 *  - Official Swatch Paints Logo & RIICO Bundi Factory credentials
 *  - Dynamic UPI QR Code (SBI / PhonePe / GPay)
 *  - Statutory GST HSN Schedule (HSN, Taxable Value, CGST 9%, SGST 9%, Total GST)
 *  - Indian Number to Words conversion
 *  - Bank Details & Commercial Buyback / 5-Yr Durability Assurances
 *  - Authorized Signatory seal block
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const LOGO_PATH = path.join(__dirname, '../../brand-assets/logos/swatch_paints_logo_primary.png');
const CUSTOM_QR_PATH = path.join(__dirname, '../../brand-assets/download_content_by_admin/sharma_industries_payment_qr.png');
const PAYMENT_CONFIG_PATH = path.join(__dirname, '../data/payment_config.json');

// Indian Number to Words Converter
function numberToIndianWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';
  return (inWords(rounded).trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

// Generate UPI QR Code Buffer
async function generateUpiQrBuffer(upiId, payeeName, amount, note = 'Invoice Payment') {
  // If CEO uploaded a custom QR code image, use it directly!
  if (fs.existsSync(CUSTOM_QR_PATH)) {
    try {
      return fs.readFileSync(CUSTOM_QR_PATH);
    } catch (e) {}
  }

  try {
    const cleanAmount = Number(amount || 0).toFixed(2);
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    return await QRCode.toBuffer(upiUri, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('[InvoiceTemplates] QR generation error:', err);
    return null;
  }
}

// Default Sample Invoice Data
function getDefaultInvoiceData() {
  const invNum = `SI-INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const invDate = new Date().toISOString().slice(0, 10);
  
  const items = [
    {
      sn: 1,
      desc: 'Swatch Rustic Texture (Zero Tinting Machine quartz finish)',
      hsn: '3214',
      batch: 'SR-2609',
      pack: '25kg Bag',
      qty: 100,
      rate: 640.00,
      disc: 0,
      amount: 64000.00,
      gstPct: 18
    },
    {
      sn: 2,
      desc: 'Swatch Weatherguard High-Build Exterior Emulsion',
      hsn: '3209',
      batch: 'WG-2609',
      pack: '20L Pail',
      qty: 10,
      rate: 2255.00,
      disc: 0,
      amount: 22550.00,
      gstPct: 18
    },
    {
      sn: 3,
      desc: 'Swatch Shine Luxury Interior Washable Emulsion',
      hsn: '3209',
      batch: 'SS-2609',
      pack: '20L Pail',
      qty: 5,
      rate: 2255.00,
      disc: 0,
      amount: 11275.00,
      gstPct: 18
    },
    {
      sn: 4,
      desc: 'Swatch Waterproofing Elastomeric Solution',
      hsn: '3214',
      batch: 'WP-2609',
      pack: '5L Jerry',
      qty: 15,
      rate: 650.00,
      disc: 0,
      amount: 9750.00,
      gstPct: 18
    }
  ];

  const subtotalTaxable = items.reduce((acc, it) => acc + it.amount, 0); // 107575.00
  const cashDiscount = Math.round(subtotalTaxable * 0.02 * 100) / 100; // 2% CD = 2151.50
  const netTaxable = subtotalTaxable - cashDiscount; // 105423.50
  const cgst = Math.round(netTaxable * 0.09 * 100) / 100; // 9488.12
  const sgst = Math.round(netTaxable * 0.09 * 100) / 100; // 9488.12
  const rawTotal = netTaxable + cgst + sgst; // 124399.74
  const grandTotal = Math.round(rawTotal); // 124400
  const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100; // +0.26

  let activeUpiId = 'sharmaindustries@sbi';
  if (fs.existsSync(PAYMENT_CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(PAYMENT_CONFIG_PATH, 'utf-8'));
      if (cfg.upiId) activeUpiId = cfg.upiId;
    } catch (e) {}
  }

  return {
    invoiceNo: invNum,
    invoiceDate: invDate,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    challanNo: 'DC-2026-0419',
    eWayBillNo: '2819 0948 1029 4412',
    vehicleNo: 'RJ-08-GA-4412',
    transporter: 'Direct Factory Delivery / Sharma Logistics',
    placeOfSupply: 'Rajasthan (Code 08)',
    reverseCharge: 'No',
    copyType: 'Original for Recipient',
    
    // Seller Details
    seller: {
      companyName: 'SHARMA INDUSTRIES',
      division: 'SWATCH PAINTS DIVISION',
      tagline: 'Best Quality. Best Price. | Har Deewar Ka Pukka Vishwas',
      address: 'RIICO Industrial Area, Bundi – 323001, Rajasthan, India',
      gstin: '08AAGCS4128N1Z8',
      pan: 'AAGCS4128N',
      state: 'Rajasthan',
      stateCode: '08',
      udyam: 'UDYAM-RJ-08-001248',
      phone: '+91 9079609627',
      email: 'sales@sharmaindustries.com',
      bankName: 'State Bank of India (SBI)',
      branch: 'RIICO Bundi Branch (323001)',
      accountNo: '394820194820',
      ifsc: 'SBIN0001234',
      accountType: 'Current Account',
      upiId: activeUpiId
    },

    // Buyer / Dealer Details
    buyer: {
      tradeName: 'M/s Rajesh Paint & Hardware Store',
      contactPerson: 'Rajesh Sharma (+91 98765 43210)',
      address: 'Shop No. 14-15, Main Market, Aerodrome Circle, Kota – 324007, Rajasthan',
      gstin: '08BKFPS8912P1ZA',
      pan: 'BKFPS8912P',
      state: 'Rajasthan',
      stateCode: '08',
      category: 'Tier 1 Authorized Stockist',
      paymentTerms: '2% Cash Discount (CD within 7 Days) / Net 30 Days Credit'
    },

    // Consignee (Ship To)
    shipTo: {
      name: 'M/s Rajesh Paint & Hardware Store (Godown)',
      address: 'Godown No. 3, Near Transport Nagar, Kota – 324005, Rajasthan',
      state: 'Rajasthan (08)'
    },

    items,
    subtotalTaxable,
    cashDiscount,
    netTaxable,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    amountInWords: numberToIndianWords(grandTotal),

    // HSN Summary
    hsnSummary: [
      {
        hsn: '3214',
        desc: 'Glaziers putty, grafting putty, resin cements (Rustic & Waterproofing)',
        taxable: 72265.00,
        cgstRate: 9,
        cgstAmt: 6503.85,
        sgstRate: 9,
        sgstAmt: 6503.85,
        totalTax: 13007.70
      },
      {
        hsn: '3209',
        desc: 'Paints & varnishes based on synthetic polymers (Emulsions)',
        taxable: 33158.50,
        cgstRate: 9,
        cgstAmt: 2984.27,
        sgstRate: 9,
        sgstAmt: 2984.27,
        totalTax: 5968.54
      }
    ],

    perks: [
      'Painters Growth Tokens: 100 Bags x ₹50 = ₹5,000 Instant Cash Tokens loaded inside bags',
      'Guaranteed Retail Margin: 40%–45% gross dealer margin vs MRP ₹1,150/bag',
      '30-Day Written Stock Buyback: Unsold batch returned at full credit value',
      '5-Year Durability & Weather Resistance: Lab certified elastomeric resin bonding'
    ]
  };
}

class InvoiceTemplates {

  /**
   * =========================================================================
   * TEMPLATE 1: MODERN CORPORATE ENTERPRISE (Slate Navy & Royal Blue)
   * Designed for Fortune-500 scale, corporate aesthetics, high contrast.
   * =========================================================================
   */
  async renderCorporate(doc, data) {
    const qrBuffer = await generateUpiQrBuffer(
      data.seller.upiId,
      data.seller.companyName,
      data.grandTotal,
      `Inv-${data.invoiceNo}`
    );

    const pw = doc.page.width; // 595.28
    const margin = 30;
    const contentW = pw - (margin * 2); // 535.28

    // 1. TOP CORPORATE HEADER BANNER
    doc.save();
    doc.rect(0, 0, pw, 72).fill('#0f172a'); // Deep Slate
    doc.rect(0, 72, pw, 3).fill('#2563eb');  // Royal Blue accent stripe
    doc.restore();

    // Swatch Logo
    let logoX = margin;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, margin, 12, { width: 50, height: 50 });
        logoX = margin + 58;
      } catch (e) {}
    }

    // Company Credentials
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(data.seller.companyName, logoX, 14);
    doc.fillColor('#60a5fa').fontSize(8.5).font('Helvetica-Bold').text(`SWATCH PAINTS  •  ${data.seller.tagline}`, logoX, 30);
    doc.fillColor('#cbd5e1').fontSize(7.5).font('Helvetica')
       .text(`${data.seller.address} | GSTIN: ${data.seller.gstin} | State: ${data.seller.stateCode}`, logoX, 43)
       .text(`Udyam: ${data.seller.udyam} | PAN: ${data.seller.pan} | Phone: ${data.seller.phone}`, logoX, 54);

    // Invoice Title Badge
    const titleBoxW = 150;
    const titleBoxX = pw - margin - titleBoxW;
    doc.save();
    doc.roundedRect(titleBoxX, 12, titleBoxW, 48, 4).fill('#1e293b');
    doc.rect(titleBoxX, 12, titleBoxW, 4).fill('#38bdf8'); // Cyan top border
    doc.restore();

    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('TAX INVOICE', titleBoxX, 22, { width: titleBoxW, align: 'center' });
    doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text(`(${data.copyType})`, titleBoxX, 36, { width: titleBoxW, align: 'center' });
    doc.fillColor('#38bdf8').fontSize(7.5).font('Helvetica-Bold').text('Rule 46 of CGST Rules', titleBoxX, 47, { width: titleBoxW, align: 'center' });

    // 2. DISPATCH & LOGISTICS METADATA STRIP
    const metaY = 82;
    doc.save();
    doc.roundedRect(margin, metaY, contentW, 28, 3).fill('#f8fafc');
    doc.roundedRect(margin, metaY, contentW, 28, 3).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    const colW = contentW / 4;
    // Col 1: Invoice No & Date
    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('INVOICE NO & DATE', margin + 6, metaY + 4);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(`${data.invoiceNo}`, margin + 6, metaY + 12);
    doc.fillColor('#334155').fontSize(7).font('Helvetica').text(`Dt: ${data.invoiceDate}`, margin + 6, metaY + 20);

    // Col 2: E-Way Bill & Challan
    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('E-WAY BILL / CHALLAN', margin + colW + 6, metaY + 4);
    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text(data.eWayBillNo, margin + colW + 6, metaY + 12);
    doc.fillColor('#334155').fontSize(7).font('Helvetica').text(`DC: ${data.challanNo}`, margin + colW + 6, metaY + 20);

    // Col 3: Transporter & Vehicle
    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('TRANSPORT & VEHICLE', margin + (colW * 2) + 6, metaY + 4);
    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text(data.vehicleNo, margin + (colW * 2) + 6, metaY + 12);
    doc.fillColor('#334155').fontSize(7).font('Helvetica').text('Direct Factory Dispatch', margin + (colW * 2) + 6, metaY + 20);

    // Col 4: Place of Supply & Terms
    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('PLACE OF SUPPLY', margin + (colW * 3) + 6, metaY + 4);
    doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text(data.placeOfSupply, margin + (colW * 3) + 6, metaY + 12);
    doc.fillColor('#334155').fontSize(7).font('Helvetica').text(`Due: ${data.dueDate}`, margin + (colW * 3) + 6, metaY + 20);

    // 3. BILLED TO & SHIPPED TO (DUAL CARDS)
    const partyY = metaY + 33;
    const cardW = (contentW - 8) / 2;
    const cardH = 68;

    // Left Card: Billed To
    doc.save();
    doc.roundedRect(margin, partyY, cardW, cardH, 3).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.rect(margin, partyY, cardW, 14).fill('#f1f5f9');
    doc.restore();

    doc.fillColor('#1e293b').fontSize(7).font('Helvetica-Bold').text('DETAILS OF RECEIVER | BILLED TO (BUYER):', margin + 6, partyY + 3.5);
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(data.buyer.tradeName, margin + 6, partyY + 18);
    doc.fillColor('#334155').fontSize(7).font('Helvetica')
       .text(data.buyer.address, margin + 6, partyY + 29, { width: cardW - 12 })
       .text(`GSTIN: ${data.buyer.gstin}  |  State: ${data.buyer.state} (${data.buyer.stateCode})`, margin + 6, partyY + 49)
       .text(`Contact: ${data.buyer.contactPerson}`, margin + 6, partyY + 58);

    // Right Card: Shipped To
    const rightCardX = margin + cardW + 8;
    doc.save();
    doc.roundedRect(rightCardX, partyY, cardW, cardH, 3).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.rect(rightCardX, partyY, cardW, 14).fill('#f1f5f9');
    doc.restore();

    doc.fillColor('#1e293b').fontSize(7).font('Helvetica-Bold').text('DETAILS OF CONSIGNEE | SHIPPED TO (DESTINATION):', rightCardX + 6, partyY + 3.5);
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(data.shipTo.name, rightCardX + 6, partyY + 18);
    doc.fillColor('#334155').fontSize(7).font('Helvetica')
       .text(data.shipTo.address, rightCardX + 6, partyY + 29, { width: cardW - 12 })
       .text(`State: ${data.shipTo.state}  |  Reverse Charge: ${data.reverseCharge}`, rightCardX + 6, partyY + 49)
       .text(`Payment Terms: ${data.buyer.paymentTerms}`, rightCardX + 6, partyY + 58, { width: cardW - 12 });

    // 4. LINE ITEMS TABLE
    const tableY = partyY + cardH + 7;
    doc.save();
    doc.rect(margin, tableY, contentW, 16).fill('#1e293b'); // Dark header
    doc.restore();

    doc.fillColor('#ffffff').fontSize(7).font('Helvetica-Bold');
    doc.text('#', margin + 4, tableY + 4.5, { width: 14 });
    doc.text('DESCRIPTION OF GOODS & SPECIFICATIONS', margin + 22, tableY + 4.5, { width: 180 });
    doc.text('HSN', margin + 206, tableY + 4.5, { width: 35 });
    doc.text('BATCH', margin + 245, tableY + 4.5, { width: 45 });
    doc.text('PACK', margin + 294, tableY + 4.5, { width: 46 });
    doc.text('QTY', margin + 344, tableY + 4.5, { width: 28, align: 'right' });
    doc.text('RATE (₹)', margin + 376, tableY + 4.5, { width: 52, align: 'right' });
    doc.text('DISC', margin + 432, tableY + 4.5, { width: 30, align: 'right' });
    doc.text('TAXABLE (₹)', margin + 466, tableY + 4.5, { width: 64, align: 'right' });

    let curY = tableY + 16;
    doc.font('Helvetica').fontSize(7.5);

    data.items.forEach((item, idx) => {
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.save();
      doc.rect(margin, curY, contentW, 16).fill(rowBg);
      doc.rect(margin, curY, contentW, 16).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      doc.restore();

      doc.fillColor('#334155');
      doc.text(String(item.sn), margin + 4, curY + 4, { width: 14 });
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(item.desc, margin + 22, curY + 4, { width: 180 }).font('Helvetica').fillColor('#334155');
      doc.text(item.hsn, margin + 206, curY + 4, { width: 35 });
      doc.text(item.batch, margin + 245, curY + 4, { width: 45 });
      doc.text(item.pack, margin + 294, curY + 4, { width: 46 });
      doc.text(String(item.qty), margin + 344, curY + 4, { width: 28, align: 'right' });
      doc.text(item.rate.toFixed(2), margin + 376, curY + 4, { width: 52, align: 'right' });
      doc.text(item.disc === 0 ? '0.00' : `${item.disc}%`, margin + 432, curY + 4, { width: 30, align: 'right' });
      doc.font('Helvetica-Bold').text(item.amount.toFixed(2), margin + 466, curY + 4, { width: 64, align: 'right' }).font('Helvetica');

      curY += 16;
    });

    // 5. STATUTORY GST HSN SUMMARY SCHEDULE
    const hsnTableY = curY + 5;
    doc.save();
    doc.rect(margin, hsnTableY, contentW, 13).fill('#e2e8f0');
    doc.restore();

    doc.fillColor('#1e293b').fontSize(6.5).font('Helvetica-Bold');
    doc.text('HSN / SAC', margin + 6, hsnTableY + 3.5, { width: 50 });
    doc.text('TAXABLE VALUE (₹)', margin + 110, hsnTableY + 3.5, { width: 85, align: 'right' });
    doc.text('CGST RATE', margin + 210, hsnTableY + 3.5, { width: 50, align: 'center' });
    doc.text('CGST AMT (₹)', margin + 265, hsnTableY + 3.5, { width: 65, align: 'right' });
    doc.text('SGST RATE', margin + 345, hsnTableY + 3.5, { width: 50, align: 'center' });
    doc.text('SGST AMT (₹)', margin + 400, hsnTableY + 3.5, { width: 65, align: 'right' });
    doc.text('TOTAL TAX (₹)', margin + 470, hsnTableY + 3.5, { width: 60, align: 'right' });

    let hsnY = hsnTableY + 13;
    doc.font('Helvetica').fontSize(6.5);

    data.hsnSummary.forEach(h => {
      doc.save();
      doc.rect(margin, hsnY, contentW, 12).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      doc.restore();

      doc.fillColor('#334155');
      doc.text(h.hsn, margin + 6, hsnY + 2.5);
      doc.text(h.taxable.toFixed(2), margin + 110, hsnY + 2.5, { width: 85, align: 'right' });
      doc.text(`${h.cgstRate}%`, margin + 210, hsnY + 2.5, { width: 50, align: 'center' });
      doc.text(h.cgstAmt.toFixed(2), margin + 265, hsnY + 2.5, { width: 65, align: 'right' });
      doc.text(`${h.sgstRate}%`, margin + 345, hsnY + 2.5, { width: 50, align: 'center' });
      doc.text(h.sgstAmt.toFixed(2), margin + 400, hsnY + 2.5, { width: 65, align: 'right' });
      doc.font('Helvetica-Bold').text(h.totalTax.toFixed(2), margin + 470, hsnY + 2.5, { width: 60, align: 'right' }).font('Helvetica');

      hsnY += 12;
    });

    // 6. BOTTOM SPLIT SECTION: UPI QR & BANK DETAILS (LEFT) vs TAX CALCULATION (RIGHT)
    const bottomY = hsnY + 6;
    const leftW = 295;
    const rightW = contentW - leftW - 8;
    const boxH = 125;

    // LEFT BOX: UPI QR, BANK ACCOUNT & VALUE HIGHLIGHTS
    doc.save();
    doc.roundedRect(margin, bottomY, leftW, boxH, 3).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.rect(margin, bottomY, leftW, 14).fill('#f8fafc');
    doc.restore();

    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('DIGITAL SETTLEMENT & BANK ACCOUNT DETAILS:', margin + 6, bottomY + 3.5);

    // Embed QR Code
    if (qrBuffer) {
      try {
        doc.image(qrBuffer, margin + 8, bottomY + 18, { width: 64, height: 64 });
      } catch (e) {}
    }

    // QR Helper Text
    doc.fillColor('#059669').fontSize(6).font('Helvetica-Bold').text('SCAN TO PAY VIA UPI', margin + 8, bottomY + 84, { width: 64, align: 'center' });
    doc.fillColor('#64748b').fontSize(5.5).font('Helvetica').text('GPay • PhonePe • BHIM', margin + 8, bottomY + 92, { width: 64, align: 'center' });

    // Bank Account Typography
    const bankX = margin + 78;
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(`• Bank: `, bankX, bottomY + 18).font('Helvetica-Bold').text(`${data.seller.bankName}`, bankX + 32, bottomY + 18).font('Helvetica')
       .text(`• Account Name: ${data.seller.companyName}`, bankX, bottomY + 28)
       .text(`• Current A/c No: `, bankX, bottomY + 38).font('Helvetica-Bold').text(`${data.seller.accountNo}`, bankX + 60, bottomY + 38).font('Helvetica')
       .text(`• IFSC Code: `, bankX, bottomY + 48).font('Helvetica-Bold').text(`${data.seller.ifsc}`, bankX + 45, bottomY + 48).font('Helvetica')
       .text(`• Branch: ${data.seller.branch}`, bankX, bottomY + 58)
       .text(`• UPI ID: `, bankX, bottomY + 68).font('Helvetica-Bold').fillColor('#2563eb').text(`${data.seller.upiId}`, bankX + 35, bottomY + 68).font('Helvetica').fillColor('#334155');

    // Perks Strip inside left box
    doc.save();
    doc.rect(margin + 4, bottomY + 101, leftW - 8, 20).fill('#f1f5f9');
    doc.restore();

    doc.fillColor('#059669').fontSize(6).font('Helvetica-Bold').text('🎁 VALUE ASSURANCES: ', margin + 8, bottomY + 104);
    doc.fillColor('#334155').fontSize(5.5).font('Helvetica')
       .text('• ₹5,000 Cash Tokens Loaded (100 Bags x ₹50)  • 45% Dealer Margin  • 30-Day Buyback  • 5-Yr Weatherproof', margin + 8, bottomY + 112);

    // RIGHT BOX: TAX CALCULATION & NET TOTAL
    const rightX = margin + leftW + 8;
    doc.save();
    doc.roundedRect(rightX, bottomY, rightW, boxH, 3).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    const calcRows = [
      { label: 'Gross Taxable Value:', val: `₹${data.subtotalTaxable.toFixed(2)}`, bold: false },
      { label: 'Less: 2% Cash Discount (CD):', val: `-₹${data.cashDiscount.toFixed(2)}`, bold: false, color: '#059669' },
      { label: 'Net Taxable Goods Value:', val: `₹${data.netTaxable.toFixed(2)}`, bold: true },
      { label: 'Add: CGST @ 9.0%:', val: `₹${data.cgst.toFixed(2)}`, bold: false },
      { label: 'Add: SGST @ 9.0%:', val: `₹${data.sgst.toFixed(2)}`, bold: false },
      { label: 'Round Off (+/-):', val: `₹${data.roundOff >= 0 ? '+' : ''}${data.roundOff.toFixed(2)}`, bold: false }
    ];

    let rY = bottomY + 6;
    calcRows.forEach(row => {
      doc.fillColor(row.color || '#334155')
         .fontSize(row.bold ? 7.5 : 7)
         .font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
         .text(row.label, rightX + 6, rY)
         .text(row.val, rightX + 110, rY, { width: rightW - 116, align: 'right' });
      rY += 13;
    });

    // Grand Total High-Impact Card
    const totalBoxY = bottomY + 84;
    doc.save();
    doc.rect(rightX + 1, totalBoxY, rightW - 2, 38).fill('#0f172a');
    doc.rect(rightX + 1, totalBoxY, rightW - 2, 2).fill('#2563eb');
    doc.restore();

    doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text('TOTAL INVOICE VALUE (INR)', rightX + 8, totalBoxY + 6);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(`₹${data.grandTotal.toLocaleString('en-IN')}.00`, rightX + 8, totalBoxY + 16, { width: rightW - 16, align: 'right' });

    // 7. AMOUNT IN WORDS
    const wordsY = bottomY + boxH + 5;
    doc.save();
    doc.roundedRect(margin, wordsY, contentW, 16, 2).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.rect(margin, wordsY, contentW, 16).fill('#f8fafc');
    doc.restore();

    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('Amount in Words: ', margin + 6, wordsY + 4.5);
    doc.fillColor('#1e293b').fontSize(7).font('Helvetica').text(data.amountInWords, margin + 78, wordsY + 4.5, { width: contentW - 86 });

    // 8. DECLARATION, TERMS & SIGNATURE
    const signY = wordsY + 21;
    const signH = 50;
    doc.save();
    doc.roundedRect(margin, signY, contentW, signH, 2).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    // Left Terms
    doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('TERMS & CONDITIONS & STATUTORY DECLARATION:', margin + 6, signY + 4);
    doc.fillColor('#475569').fontSize(6).font('Helvetica')
       .text('1. We declare that this invoice shows actual price of the goods described and all particulars are true and correct.', margin + 6, signY + 14, { width: 330 })
       .text('2. 30-Day Written Stock Buyback Guarantee is honored in accordance with Sharma Industries Swatch charter.', margin + 6, signY + 23, { width: 330 })
       .text('3. Payment due within 30 days. Interest @ 18% p.a. charged after due date. Subject to Bundi (Rajasthan) jurisdiction.', margin + 6, signY + 32, { width: 330 })
       .text('4. Goods once dispatched are insured under standard transit guidelines.', margin + 6, signY + 41, { width: 330 });

    // Right Signatory
    const signBoxX = pw - margin - 150;
    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text(`For ${data.seller.companyName}`, signBoxX, signY + 6, { width: 140, align: 'center' });
    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('[Digitally Signed & Verified]', signBoxX, signY + 26, { width: 140, align: 'center' });
    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('Authorised Signatory / CEO', signBoxX, signY + 38, { width: 140, align: 'center' });

    // 9. BOTTOM FOOTER BAR
    doc.save();
    doc.rect(0, doc.page.height - 18, pw, 18).fill('#0f172a');
    doc.restore();

    doc.fillColor('#94a3b8').fontSize(6.5).font('Helvetica')
       .text('Sharma Industries  •  Corporate Tax Invoicing System  •  Generated by Hermes AI Brain', margin, doc.page.height - 13);
    doc.text(`Page 1 of 1  •  GSTIN: ${data.seller.gstin}`, pw - margin - 180, doc.page.height - 13, { width: 180, align: 'right' });
  }

  /**
   * =========================================================================
   * TEMPLATE 2: MINIMALIST CLEAN LUXURY / ARCHITECTURAL (Onyx & Champagne Gold)
   * Designed for premium architects, high-end builders, villa projects.
   * =========================================================================
   */
  async renderLuxury(doc, data) {
    const qrBuffer = await generateUpiQrBuffer(
      data.seller.upiId,
      data.seller.companyName,
      data.grandTotal,
      `LuxuryInv-${data.invoiceNo}`
    );

    const pw = doc.page.width;
    const margin = 32;
    const contentW = pw - (margin * 2);

    // Minimal Top Line
    doc.save();
    doc.rect(margin, 20, contentW, 2).fill('#b45309'); // Champagne Amber
    doc.restore();

    // Luxury Header
    let logoX = margin;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, margin, 30, { width: 44, height: 44 });
        logoX = margin + 52;
      } catch (e) {}
    }

    doc.fillColor('#18181b').fontSize(15).font('Helvetica-Bold').text(data.seller.companyName, logoX, 30);
    doc.fillColor('#b45309').fontSize(8.5).font('Helvetica').text('SWATCH PAINTS  —  LUXURY ARCHITECTURAL FINISHES', logoX, 47);
    doc.fillColor('#52525b').fontSize(7.5).font('Helvetica')
       .text(`${data.seller.address}  |  GSTIN: ${data.seller.gstin}`, logoX, 59);

    // Right Side Minimal Title
    doc.fillColor('#18181b').fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', pw - margin - 180, 30, { width: 180, align: 'right' });
    doc.fillColor('#71717a').fontSize(8).font('Helvetica').text(`Invoice #: ${data.invoiceNo}`, pw - margin - 180, 48, { width: 180, align: 'right' });
    doc.text(`Date: ${data.invoiceDate}`, pw - margin - 180, 59, { width: 180, align: 'right' });

    // Luxury Separator
    const sepY = 82;
    doc.save();
    doc.rect(margin, sepY, contentW, 0.5).fill('#e4e4e7');
    doc.restore();

    // Client & Project Info (3-Column Clean Layout)
    const clientY = sepY + 10;
    const col3W = contentW / 3;

    // Col 1: Billed To
    doc.fillColor('#b45309').fontSize(7).font('Helvetica-Bold').text('CLIENT / PROJECT OWNER', margin, clientY);
    doc.fillColor('#18181b').fontSize(8.5).font('Helvetica-Bold').text(data.buyer.tradeName, margin, clientY + 12);
    doc.fillColor('#52525b').fontSize(7).font('Helvetica')
       .text(data.buyer.address, margin, clientY + 23, { width: col3W - 10 })
       .text(`GSTIN: ${data.buyer.gstin}`, margin, clientY + 45);

    // Col 2: Project Delivery Site
    doc.fillColor('#b45309').fontSize(7).font('Helvetica-Bold').text('ARCHITECTURAL SITE / DISPATCH', margin + col3W, clientY);
    doc.fillColor('#18181b').fontSize(8).font('Helvetica-Bold').text(data.shipTo.name, margin + col3W, clientY + 12);
    doc.fillColor('#52525b').fontSize(7).font('Helvetica')
       .text(data.shipTo.address, margin + col3W, clientY + 23, { width: col3W - 10 })
       .text(`Logistics: ${data.vehicleNo}`, margin + col3W, clientY + 45);

    // Col 3: Financial & E-Way Terms
    doc.fillColor('#b45309').fontSize(7).font('Helvetica-Bold').text('SETTLEMENT TERMS', margin + (col3W * 2), clientY);
    doc.fillColor('#18181b').fontSize(8).font('Helvetica-Bold').text(`Due: ${data.dueDate}`, margin + (col3W * 2), clientY + 12);
    doc.fillColor('#52525b').fontSize(7).font('Helvetica')
       .text(`E-Way: ${data.eWayBillNo}`, margin + (col3W * 2), clientY + 23)
       .text(`Place of Supply: ${data.placeOfSupply}`, margin + (col3W * 2), clientY + 34)
       .text(`Terms: 2% CD (7 Days) / Net 30`, margin + (col3W * 2), clientY + 45);

    // Minimalist Items Table
    const tY = clientY + 62;
    doc.save();
    doc.rect(margin, tY, contentW, 16).fill('#18181b');
    doc.restore();

    doc.fillColor('#ffffff').fontSize(7).font('Helvetica-Bold');
    doc.text('ITEM', margin + 6, tY + 4.5, { width: 20 });
    doc.text('ARCHITECTURAL SPECIFICATION & FINISH', margin + 30, tY + 4.5, { width: 210 });
    doc.text('HSN', margin + 245, tY + 4.5, { width: 35 });
    doc.text('PACK', margin + 285, tY + 4.5, { width: 45 });
    doc.text('QTY', margin + 335, tY + 4.5, { width: 30, align: 'right' });
    doc.text('RATE (₹)', margin + 375, tY + 4.5, { width: 55, align: 'right' });
    doc.text('TAXABLE VALUE (₹)', margin + 440, tY + 4.5, { width: 90, align: 'right' });

    let itemY = tY + 16;
    data.items.forEach((it, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#fafafa';
      doc.save();
      doc.rect(margin, itemY, contentW, 16).fill(bg);
      doc.rect(margin, itemY, contentW, 16).strokeColor('#f4f4f5').lineWidth(0.5).stroke();
      doc.restore();

      doc.fillColor('#52525b').fontSize(7.5).font('Helvetica');
      doc.text(String(it.sn), margin + 6, itemY + 4, { width: 20 });
      doc.fillColor('#18181b').font('Helvetica-Bold').text(it.desc, margin + 30, itemY + 4, { width: 210 }).font('Helvetica').fillColor('#52525b');
      doc.text(it.hsn, margin + 245, itemY + 4, { width: 35 });
      doc.text(it.pack, margin + 285, itemY + 4, { width: 45 });
      doc.text(String(it.qty), margin + 335, itemY + 4, { width: 30, align: 'right' });
      doc.text(it.rate.toFixed(2), margin + 375, itemY + 4, { width: 55, align: 'right' });
      doc.font('Helvetica-Bold').text(it.amount.toFixed(2), margin + 440, itemY + 4, { width: 90, align: 'right' }).font('Helvetica');

      itemY += 16;
    });

    // GST Breakdown Line
    const gstY = itemY + 6;
    doc.save();
    doc.rect(margin, gstY, contentW, 14).fill('#f4f4f5');
    doc.restore();

    doc.fillColor('#18181b').fontSize(6.5).font('Helvetica-Bold');
    doc.text('STATUTORY GST BREAKUP:', margin + 6, gstY + 4);
    doc.fillColor('#52525b').font('Helvetica')
       .text(`Taxable Goods Value: ₹${data.netTaxable.toFixed(2)}`, margin + 120, gstY + 4)
       .text(`CGST @ 9%: ₹${data.cgst.toFixed(2)}`, margin + 260, gstY + 4)
       .text(`SGST @ 9%: ₹${data.sgst.toFixed(2)}`, margin + 360, gstY + 4)
       .text(`Total Tax: ₹${(data.cgst + data.sgst).toFixed(2)}`, margin + 450, gstY + 4, { width: 80, align: 'right' });

    // Luxury Bottom Split
    const luxBottomY = gstY + 20;
    const luxLeftW = 280;
    const luxRightW = contentW - luxLeftW - 10;

    // Left Luxury Card: QR & Bank
    doc.save();
    doc.roundedRect(margin, luxBottomY, luxLeftW, 115, 2).strokeColor('#e4e4e7').lineWidth(0.5).stroke();
    doc.restore();

    if (qrBuffer) {
      try {
        doc.image(qrBuffer, margin + 10, luxBottomY + 12, { width: 68, height: 68 });
      } catch (e) {}
    }

    doc.fillColor('#b45309').fontSize(6.5).font('Helvetica-Bold').text('INSTANT UPI SCAN-TO-PAY', margin + 10, luxBottomY + 84, { width: 68, align: 'center' });
    doc.fillColor('#71717a').fontSize(5.5).font('Helvetica').text('GPay • PhonePe • Paytm', margin + 10, luxBottomY + 93, { width: 68, align: 'center' });

    const lBankX = margin + 86;
    doc.fillColor('#18181b').fontSize(7.5).font('Helvetica-Bold').text('BANK TRANSFER DETAILS', lBankX, luxBottomY + 10);
    doc.fillColor('#52525b').fontSize(6.5).font('Helvetica')
       .text(`Bank: ${data.seller.bankName}`, lBankX, luxBottomY + 22)
       .text(`Account Name: ${data.seller.companyName}`, lBankX, luxBottomY + 32)
       .text(`Current A/c: ${data.seller.accountNo}`, lBankX, luxBottomY + 42)
       .text(`IFSC Code: ${data.seller.ifsc}`, lBankX, luxBottomY + 52)
       .text(`UPI: ${data.seller.upiId}`, lBankX, luxBottomY + 62)
       .text(`🛡️ 5-Year Weather & Durability Assurance`, lBankX, luxBottomY + 76, { width: luxLeftW - 92 })
       .text(`🔄 30-Day Written Stock Buyback Assured`, lBankX, luxBottomY + 86, { width: luxLeftW - 92 });

    // Right Luxury Card: Grand Total Box
    const luxRightX = margin + luxLeftW + 10;
    doc.save();
    doc.roundedRect(luxRightX, luxBottomY, luxRightW, 115, 2).strokeColor('#e4e4e7').lineWidth(0.5).stroke();
    doc.restore();

    const luxCalc = [
      { label: 'Subtotal:', val: `₹${data.subtotalTaxable.toFixed(2)}` },
      { label: 'Prompt CD Discount (2%):', val: `-₹${data.cashDiscount.toFixed(2)}`, color: '#059669' },
      { label: 'Taxable Goods Base:', val: `₹${data.netTaxable.toFixed(2)}`, bold: true },
      { label: 'Central GST (9%):', val: `₹${data.cgst.toFixed(2)}` },
      { label: 'State GST (9%):', val: `₹${data.sgst.toFixed(2)}` },
      { label: 'Rounding Adjustment:', val: `₹${data.roundOff >= 0 ? '+' : ''}${data.roundOff.toFixed(2)}` }
    ];

    let lCalcY = luxBottomY + 8;
    luxCalc.forEach(c => {
      doc.fillColor(c.color || '#52525b').fontSize(row => (c.bold ? 7.5 : 7)).font(c.bold ? 'Helvetica-Bold' : 'Helvetica')
         .text(c.label, luxRightX + 8, lCalcY)
         .text(c.val, luxRightX + 110, lCalcY, { width: luxRightW - 118, align: 'right' });
      lCalcY += 12;
    });

    // Luxury Grand Total Highlight Card
    const luxTotalY = luxBottomY + 82;
    doc.save();
    doc.rect(luxRightX + 1, luxTotalY, luxRightW - 2, 32).fill('#18181b');
    doc.restore();

    doc.fillColor('#d4d4d8').fontSize(6.5).font('Helvetica').text('NET PAYABLE AMOUNT (INR)', luxRightX + 8, luxTotalY + 5);
    doc.fillColor('#fbbf24').fontSize(13).font('Helvetica-Bold').text(`₹${data.grandTotal.toLocaleString('en-IN')}.00`, luxRightX + 8, luxTotalY + 14, { width: luxRightW - 16, align: 'right' });

    // Words & Signature
    const luxSignY = luxBottomY + 120;
    doc.fillColor('#18181b').fontSize(7).font('Helvetica-Bold').text('Amount in Words: ', margin, luxSignY);
    doc.fillColor('#52525b').fontSize(7).font('Helvetica').text(data.amountInWords, margin + 75, luxSignY);

    doc.save();
    doc.rect(margin, luxSignY + 12, contentW, 0.5).fill('#e4e4e7');
    doc.restore();

    doc.fillColor('#71717a').fontSize(6).font('Helvetica')
       .text('Declaration: Goods once sold are covered under 30-Day Buyback & 5-Yr Durability Guarantee. Interest @ 18% p.a. post 30-day credit.', margin, luxSignY + 18, { width: 340 });

    doc.fillColor('#18181b').fontSize(7.5).font('Helvetica-Bold')
       .text(`For ${data.seller.companyName}`, pw - margin - 150, luxSignY + 16, { width: 140, align: 'center' })
       .font('Helvetica').fontSize(6.5)
       .text('[Authorized Signatory / CEO]', pw - margin - 150, luxSignY + 32, { width: 140, align: 'center' });
  }

  /**
   * =========================================================================
   * TEMPLATE 3: B2B WHOLESALE TRADE & STOCKIST (TallyPrime / Heavy Duty Trade)
   * Designed for dealer networks, Sonu Kumar B2B distribution, Kota-Bundi stockists.
   * =========================================================================
   */
  async renderTrade(doc, data) {
    const qrBuffer = await generateUpiQrBuffer(
      data.seller.upiId,
      data.seller.companyName,
      data.grandTotal,
      `TradeInv-${data.invoiceNo}`
    );

    const pw = doc.page.width;
    const margin = 28;
    const contentW = pw - (margin * 2);

    // Header Frame Box
    doc.save();
    doc.rect(margin, 16, contentW, 64).strokeColor('#042f2e').lineWidth(1).stroke();
    doc.rect(margin, 16, contentW, 16).fill('#042f2e'); // Deep Forest Teal
    doc.restore();

    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text('TAX INVOICE — B2B WHOLESALE TRADE & STOCKIST BILL', margin + 8, 20);
    doc.fillColor('#a7f3d0').fontSize(7.5).font('Helvetica').text('(Rule 46 Tax Invoice — Original for Recipient)', pw - margin - 200, 20, { width: 192, align: 'right' });

    // Logo & Firm Details
    let logoX = margin + 8;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, margin + 8, 36, { width: 40, height: 40 });
        logoX = margin + 52;
      } catch (e) {}
    }

    doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text(data.seller.companyName, logoX, 35);
    doc.fillColor('#047857').fontSize(7.5).font('Helvetica-Bold').text(`SWATCH PAINTS  •  ${data.seller.tagline}`, logoX, 49);
    doc.fillColor('#334155').fontSize(7).font('Helvetica')
       .text(`${data.seller.address} | GSTIN: ${data.seller.gstin} | State: Rajasthan (08)`, logoX, 59)
       .text(`Udyam: ${data.seller.udyam} | PAN: ${data.seller.pan} | Factory Sales Desk: ${data.seller.phone}`, logoX, 69);

    // Trade Meta Table (3 Columns)
    const tMetaY = 84;
    doc.save();
    doc.rect(margin, tMetaY, contentW, 30).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    const cW = contentW / 3;
    // Box 1: Invoice & Date
    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text(`Invoice No: ${data.invoiceNo}`, margin + 6, tMetaY + 4);
    doc.fillColor('#334155').fontSize(7).font('Helvetica')
       .text(`Date: ${data.invoiceDate}`, margin + 6, tMetaY + 14)
       .text(`Payment Due: ${data.dueDate}`, margin + 6, tMetaY + 22);

    // Box 2: Transport & E-Way
    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text(`E-Way Bill: ${data.eWayBillNo}`, margin + cW + 6, tMetaY + 4);
    doc.fillColor('#334155').fontSize(7).font('Helvetica')
       .text(`Vehicle No: ${data.vehicleNo}`, margin + cW + 6, tMetaY + 14)
       .text(`Challan: ${data.challanNo}`, margin + cW + 6, tMetaY + 22);

    // Box 3: Dealer Terms & Hub
    doc.fillColor('#047857').fontSize(7.5).font('Helvetica-Bold').text(`Dealer Tier: ${data.buyer.category}`, margin + (cW * 2) + 6, tMetaY + 4);
    doc.fillColor('#334155').fontSize(7).font('Helvetica')
       .text(`Place of Supply: ${data.placeOfSupply}`, margin + (cW * 2) + 6, tMetaY + 14)
       .text(`Terms: 2% CD (7 Days) / Net 30`, margin + (cW * 2) + 6, tMetaY + 22);

    // Parties Grid
    const pGridY = tMetaY + 34;
    const halfW = (contentW - 4) / 2;
    doc.save();
    doc.rect(margin, pGridY, halfW, 58).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.rect(margin + halfW + 4, pGridY, halfW, 58).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    // Buyer
    doc.fillColor('#042f2e').fontSize(7).font('Helvetica-Bold').text('BILLED TO (DEALER / STOCKIST):', margin + 6, pGridY + 4);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(data.buyer.tradeName, margin + 6, pGridY + 14);
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(data.buyer.address, margin + 6, pGridY + 24, { width: halfW - 12 })
       .text(`GSTIN: ${data.buyer.gstin} | State: ${data.buyer.stateCode}`, margin + 6, pGridY + 42)
       .text(`Contact: ${data.buyer.contactPerson}`, margin + 6, pGridY + 50);

    // Shipped To
    const sX = margin + halfW + 4;
    doc.fillColor('#042f2e').fontSize(7).font('Helvetica-Bold').text('CONSIGNEE (DELIVERY GODOWN):', sX + 6, pGridY + 4);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(data.shipTo.name, sX + 6, pGridY + 14);
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(data.shipTo.address, sX + 6, pGridY + 24, { width: halfW - 12 })
       .text(`Destination Hub: Kota Commercial Market`, sX + 6, pGridY + 42)
       .text(`Logistics Lead: Sonu Kumar Network (+91 9057501926)`, sX + 6, pGridY + 50);

    // Line Items
    const tblY = pGridY + 62;
    doc.save();
    doc.rect(margin, tblY, contentW, 16).fill('#042f2e');
    doc.restore();

    doc.fillColor('#ffffff').fontSize(7).font('Helvetica-Bold');
    doc.text('SN', margin + 4, tblY + 4.5, { width: 14 });
    doc.text('DESCRIPTION OF PRODUCT / SHADE', margin + 20, tblY + 4.5, { width: 185 });
    doc.text('HSN', margin + 208, tblY + 4.5, { width: 35 });
    doc.text('BATCH', margin + 246, tblY + 4.5, { width: 45 });
    doc.text('PACK', margin + 294, tblY + 4.5, { width: 46 });
    doc.text('QTY', margin + 344, tblY + 4.5, { width: 28, align: 'right' });
    doc.text('RATE (₹)', margin + 376, tblY + 4.5, { width: 52, align: 'right' });
    doc.text('DISC', margin + 432, tblY + 4.5, { width: 30, align: 'right' });
    doc.text('AMOUNT (₹)', margin + 466, tblY + 4.5, { width: 64, align: 'right' });

    let tCurY = tblY + 16;
    doc.font('Helvetica').fontSize(7);

    data.items.forEach((it, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f0fdf4';
      doc.save();
      doc.rect(margin, tCurY, contentW, 16).fill(bg);
      doc.rect(margin, tCurY, contentW, 16).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
      doc.restore();

      doc.fillColor('#334155');
      doc.text(String(it.sn), margin + 4, tCurY + 4, { width: 14 });
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(it.desc, margin + 20, tCurY + 4, { width: 185 }).font('Helvetica').fillColor('#334155');
      doc.text(it.hsn, margin + 208, tCurY + 4, { width: 35 });
      doc.text(it.batch, margin + 246, tCurY + 4, { width: 45 });
      doc.text(it.pack, margin + 294, tCurY + 4, { width: 46 });
      doc.text(String(it.qty), margin + 344, tCurY + 4, { width: 28, align: 'right' });
      doc.text(it.rate.toFixed(2), margin + 376, tCurY + 4, { width: 52, align: 'right' });
      doc.text('0.00', margin + 432, tCurY + 4, { width: 30, align: 'right' });
      doc.font('Helvetica-Bold').text(it.amount.toFixed(2), margin + 466, tCurY + 4, { width: 64, align: 'right' }).font('Helvetica');

      tCurY += 16;
    });

    // Trade HSN Schedule
    const hsnBarY = tCurY + 4;
    doc.save();
    doc.rect(margin, hsnBarY, contentW, 13).fill('#ccfbf1');
    doc.restore();

    doc.fillColor('#042f2e').fontSize(6.5).font('Helvetica-Bold');
    doc.text('HSN SUMMARY: HSN 3214 (Taxable: ₹72,265.00 | CGST 9%: ₹6,503.85 | SGST 9%: ₹6,503.85)  •  HSN 3209 (Taxable: ₹33,158.50 | CGST 9%: ₹2,984.27 | SGST 9%: ₹2,984.27)', margin + 6, hsnBarY + 3.5);

    // Trade Bottom Split
    const bY = hsnBarY + 18;
    const bLeftW = 295;
    const bRightW = contentW - bLeftW - 8;

    // Left: QR + Bank Details + Painter Loyalty Box
    doc.save();
    doc.rect(margin, bY, bLeftW, 120).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    if (qrBuffer) {
      try {
        doc.image(qrBuffer, margin + 8, bY + 10, { width: 64, height: 64 });
      } catch (e) {}
    }

    doc.fillColor('#047857').fontSize(6).font('Helvetica-Bold').text('DIRECT UPI SETTLEMENT', margin + 8, bY + 76, { width: 64, align: 'center' });
    doc.fillColor('#64748b').fontSize(5.5).font('Helvetica').text('GPay • PhonePe • BHIM', margin + 8, bY + 84, { width: 64, align: 'center' });

    const tbX = margin + 78;
    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('COMPANY BANK ACCOUNT:', tbX, bY + 8);
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(`Bank: ${data.seller.bankName}`, tbX, bY + 18)
       .text(`A/c Name: ${data.seller.companyName}`, tbX, bY + 28)
       .text(`Current A/c: ${data.seller.accountNo}`, tbX, bY + 38)
       .text(`IFSC: ${data.seller.ifsc} | Branch: Bundi`, tbX, bY + 48)
       .text(`UPI: ${data.seller.upiId}`, tbX, bY + 58);

    // Painter Growth Token Counter Banner
    doc.save();
    doc.rect(margin + 4, bY + 94, bLeftW - 8, 22).fill('#fef3c7');
    doc.restore();

    doc.fillColor('#b45309').fontSize(6.5).font('Helvetica-Bold').text('🎁 PAINTERS GROWTH TOKENS (INSIDE BAGS):', margin + 8, bY + 97);
    doc.fillColor('#78350f').fontSize(6).font('Helvetica').text('100 Bags x ₹50 Cash Tokens = ₹5,000 Cash Value for local applicators / painters.', margin + 8, bY + 106);

    // Right: Calculation Box
    const bRightX = margin + bLeftW + 8;
    doc.save();
    doc.rect(bRightX, bY, bRightW, 120).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    const tCalc = [
      { label: 'Gross Value of Goods:', val: `₹${data.subtotalTaxable.toFixed(2)}` },
      { label: 'Less: 2% Cash Discount (CD):', val: `-₹${data.cashDiscount.toFixed(2)}`, color: '#059669' },
      { label: 'Net Taxable Goods Value:', val: `₹${data.netTaxable.toFixed(2)}`, bold: true },
      { label: 'Add: Central Tax (CGST 9%):', val: `₹${data.cgst.toFixed(2)}` },
      { label: 'Add: State Tax (SGST 9%):', val: `₹${data.sgst.toFixed(2)}` },
      { label: 'Round Off Adjustment:', val: `₹${data.roundOff >= 0 ? '+' : ''}${data.roundOff.toFixed(2)}` }
    ];

    let tCalcY = bY + 8;
    tCalc.forEach(row => {
      doc.fillColor(row.color || '#334155').fontSize(row.bold ? 7.5 : 7).font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
         .text(row.label, bRightX + 6, tCalcY)
         .text(row.val, bRightX + 110, tCalcY, { width: bRightW - 116, align: 'right' });
      tCalcY += 13;
    });

    // Grand Total Bar
    const tTotalY = bY + 85;
    doc.save();
    doc.rect(bRightX + 1, tTotalY, bRightW - 2, 34).fill('#042f2e');
    doc.restore();

    doc.fillColor('#a7f3d0').fontSize(6.5).font('Helvetica').text('FINAL INVOICE VALUE (INR)', bRightX + 8, tTotalY + 5);
    doc.fillColor('#ffffff').fontSize(13).font('Helvetica-Bold').text(`₹${data.grandTotal.toLocaleString('en-IN')}.00`, bRightX + 8, tTotalY + 15, { width: bRightW - 16, align: 'right' });

    // Words & Terms
    const bWordsY = bY + 125;
    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('Amount in Words: ', margin, bWordsY);
    doc.fillColor('#334155').fontSize(7).font('Helvetica').text(data.amountInWords, margin + 75, bWordsY);

    const bSignY = bWordsY + 14;
    doc.save();
    doc.rect(margin, bSignY, contentW, 46).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('STATUTORY TERMS & CONDITIONS:', margin + 6, bSignY + 4);
    doc.fillColor('#475569').fontSize(6).font('Helvetica')
       .text('1. All sales subject to 30-Day Written Stock Buyback Guarantee as per Sharma Industries Swatch charter.', margin + 6, bSignY + 13, { width: 330 })
       .text('2. 2% Cash Discount applicable only if payment cleared within 7 calendar days from invoice date.', margin + 6, bSignY + 22, { width: 330 })
       .text('3. Interest @ 18% p.a. on delayed payments post 30-day grace period. Bundi jurisdiction.', margin + 6, bSignY + 31, { width: 330 });

    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold')
       .text(`For ${data.seller.companyName}`, pw - margin - 150, bSignY + 6, { width: 140, align: 'center' })
       .font('Helvetica').fontSize(6.5)
       .text('[Authorized Signatory / CEO]', pw - margin - 150, bSignY + 30, { width: 140, align: 'center' });
  }

  /**
   * =========================================================================
   * TEMPLATE 4: PROFORMA QUOTATION / PROJECT ESTIMATE (Pre-Order Bidding)
   * Designed for dealer onboarding, large project bidding, architects before billing.
   * =========================================================================
   */
  async renderProforma(doc, data) {
    const qrBuffer = await generateUpiQrBuffer(
      data.seller.upiId,
      data.seller.companyName,
      data.grandTotal,
      `Quote-${data.invoiceNo}`
    );

    const pw = doc.page.width;
    const margin = 30;
    const contentW = pw - (margin * 2);

    // Top Header Banner (Royal Indigo & Amber)
    doc.save();
    doc.rect(0, 0, pw, 70).fill('#312e81'); // Royal Indigo
    doc.rect(0, 70, pw, 3).fill('#f59e0b');  // Amber Stripe
    doc.restore();

    let logoX = margin;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, margin, 12, { width: 48, height: 48 });
        logoX = margin + 56;
      } catch (e) {}
    }

    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(data.seller.companyName, logoX, 14);
    doc.fillColor('#fbbf24').fontSize(8.5).font('Helvetica-Bold').text(`SWATCH PAINTS  •  ${data.seller.tagline}`, logoX, 30);
    doc.fillColor('#c7d2fe').fontSize(7.5).font('Helvetica')
       .text(`${data.seller.address}  |  GSTIN: ${data.seller.gstin}`, logoX, 43)
       .text(`Direct Sales & Projects Desk: ${data.seller.phone}  |  Email: ${data.seller.email}`, logoX, 54);

    // Proforma Badge
    const pBadgeW = 160;
    const pBadgeX = pw - margin - pBadgeW;
    doc.save();
    doc.roundedRect(pBadgeX, 12, pBadgeW, 46, 3).fill('#1e1b4b');
    doc.rect(pBadgeX, 12, pBadgeW, 3).fill('#fbbf24');
    doc.restore();

    doc.fillColor('#fbbf24').fontSize(10).font('Helvetica-Bold').text('PROFORMA INVOICE', pBadgeX, 20, { width: pBadgeW, align: 'center' });
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica').text('COMMERCIAL PRICE ESTIMATE', pBadgeX, 33, { width: pBadgeW, align: 'center' });
    doc.fillColor('#a5b4fc').fontSize(6.5).font('Helvetica').text('Validity: 15 Days from Date', pBadgeX, 44, { width: pBadgeW, align: 'center' });

    // Quote Details Bar
    const qBarY = 82;
    doc.save();
    doc.rect(margin, qBarY, contentW, 26).fill('#f8fafc');
    doc.rect(margin, qBarY, contentW, 26).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    const qColW = contentW / 4;
    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('ESTIMATE / QUOTE NO', margin + 6, qBarY + 4);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(`PI-${data.invoiceNo}`, margin + 6, qBarY + 13);

    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('QUOTATION DATE', margin + qColW + 6, qBarY + 4);
    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold').text(data.invoiceDate, margin + qColW + 6, qBarY + 13);

    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('VALID UP TO', margin + (qColW * 2) + 6, qBarY + 4);
    doc.fillColor('#d97706').fontSize(7.5).font('Helvetica-Bold').text(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), margin + (qColW * 2) + 6, qBarY + 13);

    doc.fillColor('#64748b').fontSize(6.5).font('Helvetica').text('PRICE LOCK STATUS', margin + (qColW * 3) + 6, qBarY + 4);
    doc.fillColor('#059669').fontSize(7.5).font('Helvetica-Bold').text('Firm Fixed Price (15D)', margin + (qColW * 3) + 6, qBarY + 13);

    // Client & Site Card
    const cCardY = qBarY + 32;
    const cW = (contentW - 6) / 2;
    doc.save();
    doc.rect(margin, cCardY, cW, 60).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.rect(margin + cW + 6, cCardY, cW, 60).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    doc.fillColor('#312e81').fontSize(7).font('Helvetica-Bold').text('PREPARED FOR (PROSPECT / DEALER):', margin + 6, cCardY + 4);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(data.buyer.tradeName, margin + 6, cCardY + 14);
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(data.buyer.address, margin + 6, cCardY + 24, { width: cW - 12 })
       .text(`Contact: ${data.buyer.contactPerson}`, margin + 6, cCardY + 42)
       .text(`GSTIN: ${data.buyer.gstin}`, margin + 6, cCardY + 50);

    const sQx = margin + cW + 6;
    doc.fillColor('#312e81').fontSize(7).font('Helvetica-Bold').text('PROJECT DELIVERY DESTINATION:', sQx + 6, cCardY + 4);
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(data.shipTo.name, sQx + 6, cCardY + 14);
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(data.shipTo.address, sQx + 6, cCardY + 24, { width: cW - 12 })
       .text(`Lead Time: Ready for Dispatch within 24 Hours`, sQx + 6, cCardY + 42)
       .text(`Payment Terms: 50% Advance with PO, 50% on Dispatch`, sQx + 6, cCardY + 50);

    // Items
    const qTblY = cCardY + 66;
    doc.save();
    doc.rect(margin, qTblY, contentW, 16).fill('#312e81');
    doc.restore();

    doc.fillColor('#ffffff').fontSize(7).font('Helvetica-Bold');
    doc.text('#', margin + 4, qTblY + 4.5, { width: 14 });
    doc.text('PROPOSED PRODUCT & APPLICATION SPECIFICATION', margin + 20, qTblY + 4.5, { width: 200 });
    doc.text('HSN', margin + 225, qTblY + 4.5, { width: 35 });
    doc.text('PACK', margin + 265, qTblY + 4.5, { width: 45 });
    doc.text('QTY', margin + 315, qTblY + 4.5, { width: 30, align: 'right' });
    doc.text('EST. RATE (₹)', margin + 355, qTblY + 4.5, { width: 60, align: 'right' });
    doc.text('EST. AMOUNT (₹)', margin + 425, qTblY + 4.5, { width: 100, align: 'right' });

    let qCurY = qTblY + 16;
    data.items.forEach((it, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#eef2ff';
      doc.save();
      doc.rect(margin, qCurY, contentW, 16).fill(bg);
      doc.rect(margin, qCurY, contentW, 16).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
      doc.restore();

      doc.fillColor('#334155').fontSize(7);
      doc.text(String(it.sn), margin + 4, qCurY + 4, { width: 14 });
      doc.fillColor('#0f172a').font('Helvetica-Bold').text(it.desc, margin + 20, qCurY + 4, { width: 200 }).font('Helvetica').fillColor('#334155');
      doc.text(it.hsn, margin + 225, qCurY + 4, { width: 35 });
      doc.text(it.pack, margin + 265, qCurY + 4, { width: 45 });
      doc.text(String(it.qty), margin + 315, qCurY + 4, { width: 30, align: 'right' });
      doc.text(it.rate.toFixed(2), margin + 355, qCurY + 4, { width: 60, align: 'right' });
      doc.font('Helvetica-Bold').text(it.amount.toFixed(2), margin + 425, qCurY + 4, { width: 100, align: 'right' }).font('Helvetica');

      qCurY += 16;
    });

    // Proforma Commercial Perks Bar
    const qPerkY = qCurY + 6;
    doc.save();
    doc.rect(margin, qPerkY, contentW, 14).fill('#fef3c7');
    doc.restore();

    doc.fillColor('#b45309').fontSize(6.5).font('Helvetica-Bold').text('COMMERCIAL OFFER HIGHLIGHTS:', margin + 6, qPerkY + 3.5);
    doc.fillColor('#78350f').fontSize(6.5).font('Helvetica')
       .text('• Guaranteed 40%–45% Dealer Margin  • ₹5,000 Cash Tokens inside 100 Bags  • 30-Day Buyback  • 5-Yr Weatherproof', margin + 140, qPerkY + 3.5);

    // Bottom Split
    const qBottomY = qPerkY + 20;
    const qLeftW = 280;
    const qRightW = contentW - qLeftW - 10;

    // Left Card
    doc.save();
    doc.rect(margin, qBottomY, qLeftW, 115).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    if (qrBuffer) {
      try {
        doc.image(qrBuffer, margin + 8, qBottomY + 12, { width: 64, height: 64 });
      } catch (e) {}
    }

    doc.fillColor('#312e81').fontSize(6.5).font('Helvetica-Bold').text('ADVANCE PAYMENT UPI', margin + 8, qBottomY + 80, { width: 64, align: 'center' });
    doc.fillColor('#64748b').fontSize(5.5).font('Helvetica').text('GPay • PhonePe • BHIM', margin + 8, qBottomY + 88, { width: 64, align: 'center' });

    const qbX = margin + 78;
    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('OFFICIAL BANK FOR ADVANCE REMITTANCE:', qbX, qBottomY + 8);
    doc.fillColor('#334155').fontSize(6.5).font('Helvetica')
       .text(`Bank: ${data.seller.bankName}`, qbX, qBottomY + 18)
       .text(`A/c Name: ${data.seller.companyName}`, qbX, qBottomY + 28)
       .text(`Current A/c: ${data.seller.accountNo}`, qbX, qBottomY + 38)
       .text(`IFSC: ${data.seller.ifsc}`, qbX, qBottomY + 48)
       .text(`UPI: ${data.seller.upiId}`, qbX, qBottomY + 58)
       .text(`Terms: 50% Advance to confirm order`, qbX, qBottomY + 70);

    // Right Card: Calculation
    const qRightX = margin + qLeftW + 10;
    doc.save();
    doc.rect(qRightX, qBottomY, qRightW, 115).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    const qCalc = [
      { label: 'Gross Estimate Value:', val: `₹${data.subtotalTaxable.toFixed(2)}` },
      { label: 'Prompt 2% Cash Discount (CD):', val: `-₹${data.cashDiscount.toFixed(2)}`, color: '#059669' },
      { label: 'Net Taxable Goods Base:', val: `₹${data.netTaxable.toFixed(2)}`, bold: true },
      { label: 'Estimated CGST (9.0%):', val: `₹${data.cgst.toFixed(2)}` },
      { label: 'Estimated SGST (9.0%):', val: `₹${data.sgst.toFixed(2)}` },
      { label: 'Round Off Adjustment:', val: `₹${data.roundOff >= 0 ? '+' : ''}${data.roundOff.toFixed(2)}` }
    ];

    let qCalcY = qBottomY + 8;
    qCalc.forEach(row => {
      doc.fillColor(row.color || '#334155').fontSize(row.bold ? 7.5 : 7).font(row.bold ? 'Helvetica-Bold' : 'Helvetica')
         .text(row.label, qRightX + 6, qCalcY)
         .text(row.val, qRightX + 110, qCalcY, { width: qRightW - 116, align: 'right' });
      qCalcY += 12;
    });

    const qTotalY = qBottomY + 82;
    doc.save();
    doc.rect(qRightX + 1, qTotalY, qRightW - 2, 32).fill('#312e81');
    doc.restore();

    doc.fillColor('#c7d2fe').fontSize(6.5).font('Helvetica').text('ESTIMATED TOTAL PAYABLE (INR)', qRightX + 8, qTotalY + 5);
    doc.fillColor('#fbbf24').fontSize(13).font('Helvetica-Bold').text(`₹${data.grandTotal.toLocaleString('en-IN')}.00`, qRightX + 8, qTotalY + 15, { width: qRightW - 16, align: 'right' });

    // Words & Acceptance
    const qWordsY = qBottomY + 120;
    doc.fillColor('#0f172a').fontSize(7).font('Helvetica-Bold').text('Amount in Words: ', margin, qWordsY);
    doc.fillColor('#334155').fontSize(7).font('Helvetica').text(data.amountInWords, margin + 75, qWordsY);

    const qSignY = qWordsY + 14;
    doc.save();
    doc.rect(margin, qSignY, contentW, 46).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
    doc.restore();

    doc.fillColor('#0f172a').fontSize(6.5).font('Helvetica-Bold').text('QUOTATION ACCEPTANCE & TERMS:', margin + 6, qSignY + 4);
    doc.fillColor('#475569').fontSize(6).font('Helvetica')
       .text('1. This proforma invoice is an official price quotation and not a demand for statutory tax payment.', margin + 6, qSignY + 13, { width: 330 })
       .text('2. Final GST Tax Invoice will be issued upon dispatch of goods accompanied with E-Way bill.', margin + 6, qSignY + 22, { width: 330 })
       .text('3. Prices locked for 15 days from issue date. Subject to Bundi (Rajasthan) jurisdiction.', margin + 6, qSignY + 31, { width: 330 });

    doc.fillColor('#0f172a').fontSize(7.5).font('Helvetica-Bold')
       .text(`For ${data.seller.companyName}`, pw - margin - 150, qSignY + 6, { width: 140, align: 'center' })
       .font('Helvetica').fontSize(6.5)
       .text('[Authorized Signatory / CEO]', pw - margin - 150, qSignY + 30, { width: 140, align: 'center' });
  }

  /**
   * Main Dispatcher: Render requested template
   */
  async render(doc, templateType = 'corporate', data = null) {
    const invoiceData = data || getDefaultInvoiceData();
    const type = (templateType || 'corporate').toLowerCase().trim();

    switch (type) {
      case 'luxury':
      case 'architectural':
      case 'minimal':
        return await this.renderLuxury(doc, invoiceData);

      case 'trade':
      case 'distributor':
      case 'b2b':
      case 'stockist':
        return await this.renderTrade(doc, invoiceData);

      case 'proforma':
      case 'quotation':
      case 'estimate':
      case 'quote':
        return await this.renderProforma(doc, invoiceData);

      case 'corporate':
      case 'enterprise':
      default:
        return await this.renderCorporate(doc, invoiceData);
    }
  }
}

module.exports = {
  InvoiceTemplates: new InvoiceTemplates(),
  getDefaultInvoiceData,
  numberToIndianWords,
  generateUpiQrBuffer
};
