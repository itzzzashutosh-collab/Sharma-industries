class OpsAgent {
  constructor() {
    this.name = 'Operations & Logistics Agent';
  }

  handle(query, userContext = null, session = null) {
    const q = query.toLowerCase().trim();

    // Do NOT intercept if it looks like a sales order booking or conversation!
    if (q.includes('sales order') || q.includes('book') || q.includes('likho') || q.includes('chahiye') || q.includes('bags') || q.includes('bucket')) {
      return { handled: false };
    }

    // Only intercept if specifically asking to track or check an existing dispatch
    const isTrackingQuery = q.startsWith('track') || q.includes('kahan pahuncha') || q.includes('tracking status') || q.includes('dispatch status');
    const ordMatch = q.match(/ord-\d+/i);
    const orderId = ordMatch ? ordMatch[0].toUpperCase() : (session ? session.lastOrder : null);

    if (isTrackingQuery && orderId) {
      const reply = `📦 *Dispatch Tracking for ${orderId}:*\n\n` +
        `• Client: ${userContext?.name || 'Verified Partner'}\n` +
        `• Current Status: *DISPATCHED & IN TRANSIT*\n` +
        `• Transport: Regional Dedicated Cargo\n` +
        `• Delivery ETA: Within 24-36 hrs\n\n` +
        `Driver aur Bilty details dispatch desk par logged hain. Kya transporter ka direct phone number share karun?`;

      return {
        handled: true,
        reply,
        agent: 'OpsAgent',
        confidence: 0.95,
        orderId
      };
    }

    return { handled: false };
  }
}

module.exports = new OpsAgent();
