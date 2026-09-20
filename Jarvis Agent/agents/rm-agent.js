class RMAgent {
  constructor() {
    this.name = 'Relationship Manager Agent';
  }

  handle(query, dealerContext = null, session = null) {
    const q = query.toLowerCase();

    // Credit limit or balance due
    if (q.includes('balance') || q.includes('due') || q.includes('credit') || q.includes('payment') || q.includes('hisaab') || q.includes('khata')) {
      if (!dealerContext) {
        return {
          handled: true,
          reply: `To check credit ledger and pending balances, please share your registered phone number or dealer ID.`,
          agent: 'RMAgent',
          confidence: 0.9
        };
      }

      const balance = parseInt(dealerContext.balanceDue || 0, 10);
      const credit = parseInt(dealerContext.creditLimit || 0, 10);
      const available = Math.max(0, credit - balance);

      let reply = `Account Statement for ${dealerContext.name} (${dealerContext.tier}):\n\n`;
      reply += `• Credit Limit: ₹${credit.toLocaleString()}\n`;
      reply += `• Current Outstanding Balance: ₹${balance.toLocaleString()}\n`;
      reply += `• Available Credit: ₹${available.toLocaleString()}\n`;
      reply += `\nPayment options: NEFT/RTGS/UPI. Need bank account details or a PDF ledger statement?`;

      return { handled: true, reply, agent: 'RMAgent', confidence: 0.95 };
    }

    // Support / Help / Contact human
    if (q.includes('human') || q.includes('manager') || q.includes('talk') || q.includes('complaint') || q.includes('shikayat') || q.includes('help')) {
      const reply = `Our Senior Relationship Desk has been alerted for ${dealerContext?.name || 'your account'}.\n\n` +
        `Direct Helpline: +91 98100 00000\nEmail: sales@sharmaindustries.com\nWorking Hours: Mon-Sat, 9:00 AM - 7:00 PM\n` +
        `Our account executive will also call you back shortly.`;
      return { handled: true, reply, agent: 'RMAgent', confidence: 0.92 };
    }

    return { handled: false };
  }
}

module.exports = new RMAgent();
