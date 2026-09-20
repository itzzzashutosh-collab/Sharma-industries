const dataStore = require('../data/data-store');

class B2BAgent {
  constructor() {
    this.name = 'B2B Wholesale Agent';
  }

  getCatalog() {
    return dataStore.getProducts();
  }

  detectProduct(text) {
    const q = (text || '').toLowerCase();
    const catalog = this.getCatalog();
    for (const item of catalog) {
      const name = (item.product_name || '').toLowerCase();
      const sku = (item.sku_code || '').toLowerCase();
      if (q.includes(name) || name.includes(q) || (item.sku_code && q.includes(sku)) ||
          (q.includes('rustic') && name.includes('rustic')) ||
          (q.includes('texture') && name.includes('texture'))) {
        return item;
      }
    }
    return null;
  }

  handle(query, dealerContext = null, session = null) {
    const q = query.toLowerCase();
    const role = dealerContext?.role || 'lead';
    const tier = dealerContext?.tier || 'Tier 3';
    const catalog = this.getCatalog();

    // Price query
    if (q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('bhav') || q.includes('daam')) {
      if (catalog.length === 0) {
        return {
          handled: true,
          reply: `Namaste ${dealerContext?.name || 'Sir'}! Sharma Industries ki official product rate list management dwara release ki ja rahi hai. Confirm rates ke liye hamare field salesman Sonu Kumar ji se direct sampark karein.`,
          agent: 'B2BAgent',
          confidence: 0.95
        };
      }

      let matchedItem = this.detectProduct(q);
      if (!matchedItem && session && session.lastProduct) {
        matchedItem = this.detectProduct(session.lastProduct);
      }

      let matched = matchedItem ? [matchedItem] : catalog;

      // Special handling for internal staff (Om Prakash Saini / Sonu Kumar)
      if (role === 'salesman_helper' || role === 'salesman' || role === 'staff') {
        let reply = `Namaste ${dealerContext?.name || 'Staff'}! Ye rahi hamari confirmed product rate list:\n\n`;
        matched.forEach(item => {
          reply += `📦 *${item.product_name}* (${item.pack_size || 'Bag'})\n` +
                   `• MRP: ₹${item.mrp}\n` +
                   `• Homeowner Rate: *₹${item.homeowner_price}* (20% off MRP)\n` +
                   `• Dealer Rate: *₹${item.dealer_net_tier1} – ₹${item.dealer_net_tier2}* / bag\n` +
                   `• Warehouse Stock: *${item.stock_qty || 'Available'}*\n\n`;
        });
        reply += `Orders aur dispatch booking ke liye system ready hai.`;
        return {
          handled: true,
          reply,
          agent: 'B2BAgent',
          confidence: 0.95,
          product: matchedItem ? matchedItem.product_name : null
        };
      }

      // Handling for dealers
      if (role === 'dealer') {
        let reply = `Namaste ${dealerContext?.name || 'Partner'}! Here is your authorized wholesale dealer pricing:\n\n`;
        matched.forEach(item => {
          const rate = tier === 'Tier 1' ? item.dealer_net_tier1 : item.dealer_net_tier2;
          reply += `• *${item.product_name}* (${item.pack_size}):\n` +
                   `   MRP: ₹${item.mrp} | *Dealer Net Rate: ₹${rate}* / bag\n` +
                   `   Retail Margin: ₹${item.mrp - rate} per bag (Approx 30%+)\n`;
        });
        reply += `\nDispatch within 24-48 hrs. Would you like to confirm an order?`;
        return {
          handled: true,
          reply,
          agent: 'B2BAgent',
          confidence: 0.95,
          product: matchedItem ? matchedItem.product_name : null
        };
      }

      // Handling for retail/homeowners
      let reply = `Namaste ${dealerContext?.name || 'Sir'}! Swatch Paints official pricing:\n\n`;
      matched.forEach(item => {
        reply += `• *${item.product_name}* (${item.pack_size}):\n` +
                 `   MRP: ₹${item.mrp}\n` +
                 `   Special Direct Offer: *₹${item.homeowner_price}* (Flat 20% discount)\n`;
      });
      reply += `\nDirect factory dispatch available. For bulk dealer inquiries, please mention your shop location.`;
      return {
        handled: true,
        reply,
        agent: 'B2BAgent',
        confidence: 0.95,
        product: matchedItem ? matchedItem.product_name : null
      };
    }

    // Catalog / Products list
    if (q.includes('catalog') || q.includes('product') || q.includes('list') || q.includes('items') || q.includes('paint')) {
      if (catalog.length === 0) {
        return {
          handled: true,
          reply: `Sharma Industries Official Product Catalog:\n\nOfficial product catalog abhi update ho raha hai aur direct CEO Ashutosh Sharma dwara jari kiya jayega. Naye dealer association ke liye sampark karein.`,
          agent: 'B2BAgent',
          confidence: 0.92
        };
      }

      let reply = `🎨 *Sharma Industries Product Catalog*:\n\n`;
      catalog.forEach((item, idx) => {
        reply += `${idx + 1}. *${item.product_name}* (${item.category})\n` +
                 `   Pack: ${item.pack_size} | Stock: ${item.stock_qty || 'In Stock'} | MRP: ₹${item.mrp}\n`;
      });
      reply += `\nKisi bhi product ki custom quote ya dealer scheme ke liye product ka naam likhein.`;

      return { handled: true, reply, agent: 'B2BAgent', confidence: 0.92 };
    }

    return { handled: false };
  }
}

module.exports = new B2BAgent();
