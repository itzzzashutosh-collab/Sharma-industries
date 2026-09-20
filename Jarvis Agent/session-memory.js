class SessionMemory {
  constructor() {
    this.sessionMemory = new Map();
    this.maxHistory = 5;
  }

  cleanPhone(phone) {
    if (!phone) return 'anonymous';
    return String(phone).replace(/[^0-9]/g, '') || 'anonymous';
  }

  getSession(phone) {
    const key = this.cleanPhone(phone);
    if (!this.sessionMemory.has(key)) {
      this.sessionMemory.set(key, {
        lastMessages: [],
        lastOrder: null,
        lastIntent: null,
        lastProduct: null,
        language: (key === '919079609627' || key === '260872136093846') ? 'hinglish' : null,
        languagePrompted: false,
        updatedAt: Date.now()
      });
    }
    return this.sessionMemory.get(key);
  }

  setLanguage(phone, lang) {
    const session = this.getSession(phone);
    session.language = lang;
    session.updatedAt = Date.now();
    return session;
  }

  saveTurn(phone, { userText, agentReply, intent, orderId, product, outcome = 'success' }) {
    const session = this.getSession(phone);

    if (userText) {
      session.lastMessages.push({ role: 'user', text: userText, timestamp: Date.now() });
    }
    if (agentReply) {
      session.lastMessages.push({ role: 'assistant', text: agentReply, timestamp: Date.now() });
    }

    // Keep only last 5 messages
    if (session.lastMessages.length > this.maxHistory) {
      session.lastMessages = session.lastMessages.slice(-this.maxHistory);
    }

    if (intent) session.lastIntent = intent;
    if (orderId) session.lastOrder = orderId;
    if (product) session.lastProduct = product;
    session.lastOutcome = outcome;
    session.updatedAt = Date.now();

    return session;
  }

  getRecentHistory(phone, count = 3) {
    const session = this.getSession(phone);
    return session.lastMessages.slice(-count);
  }
}

module.exports = new SessionMemory();
