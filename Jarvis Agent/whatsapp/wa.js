const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const path = require('path');
const orchestrator = require('../orchestrator');
const dataStore = require('../data/data-store');
const qrServer = require('./qr-server');
const dailyReporter = require('../reporting/daily-reporter');

class WhatsAppClient {
  constructor() {
    this.sock = null;
    this.authFolder = path.join(__dirname, '..', 'session_auth');
    this.msgCache = new Map(); // Cache for Signal ratchet retry negotiation
  }

  async start() {
    console.log('\n==========================================');
    console.log('📱 Initializing Sharma Industries WhatsApp Client');
    console.log('==========================================\n');

    // Start local web server for browser QR scanning & internal API dispatch
    qrServer.setWhatsAppClient(this);
    qrServer.start();

    const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    this.sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Sharma Industries', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      // CRITICAL: getMessage handler required for WhatsApp multi-device Signal ratchet decryption & retries
      getMessage: async (key) => {
        const id = `${key.remoteJid}_${key.id}`;
        if (this.msgCache.has(id)) {
          return this.msgCache.get(id);
        }
        return { conversation: '' };
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrServer.updateQr(qr);
        console.log('\n📲 Scan QR code in browser at: http://localhost:3005');
        console.log('   (or scan terminal QR below):\n');
        qrcode.generate(qr, { small: true });
        console.log('\nWaiting for scan...');
      }

      if (connection === 'close') {
        qrServer.setDisconnected();
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(`[WhatsApp] Connection closed. Reconnecting: ${shouldReconnect}`);
        if (shouldReconnect) {
          setTimeout(() => this.start(), 3000);
        }
      } else if (connection === 'open') {
        qrServer.setConnected();
        console.log('\n✅ [WhatsApp] Connected successfully to WhatsApp Web Gateway!\n');
        dailyReporter.startScheduler(this);

        // CEO Directive: All background loops (Simulation Training, Overnight Scripts, Scraping) are fully STOPPED.
        console.log('🛑 [Background Loops] All continuous simulation training, scraping, and scripts are FULLY STOPPED per CEO directive.');
      }
    });

    // Automatically sync contact LID to real phone numbers from WhatsApp Address Book
    this.sock.ev.on('contacts.upsert', (contacts) => {
      for (const c of contacts) {
        if (c.lid && (c.id?.includes('@s.whatsapp.net') || c.jid)) {
          const rawPhone = (c.jid || c.id).replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
          const rawLid = c.lid.replace('@lid', '').replace(/[^0-9]/g, '');
          if (rawPhone && rawLid) {
            dataStore.usersByPhone.set(rawLid, dataStore.getUser(rawPhone) || {
              phone: '+' + rawPhone,
              name: c.name || c.notify || 'Verified Contact',
              role: 'lead',
              tier: 'Tier 3',
              region: 'India'
            });
          }
        }
      }
    });

    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          if (!msg.message || msg.key.fromMe) continue;

          // Store in cache for Signal ratchet retries
          const cacheId = `${msg.key.remoteJid}_${msg.key.id}`;
          this.msgCache.set(cacheId, msg.message);
          if (this.msgCache.size > 500) {
            const oldestKey = this.msgCache.keys().next().value;
            this.msgCache.delete(oldestKey);
          }

          const sender = msg.key.remoteJid;
          if (sender.includes('@g.us')) continue; // Skip group chats

          // Acknowledge read to complete Signal protocol handshake
          try {
            await this.sock.readMessages([msg.key]);
          } catch (e) {}

          // Resolve sender phone (handles both standard @s.whatsapp.net and modern @lid)
          const rawId = sender.replace('@s.whatsapp.net', '').replace('@lid', '');
          const cleanPhone = rawId.replace(/[^0-9]/g, '');

          // Look up user (handles direct phone or mapped LID)
          let existingUser = dataStore.getUser(cleanPhone);

          // If incoming sender is LID, check if we can auto-bind to a registered staff member
          if (!existingUser && sender.includes('@lid') && msg.pushName) {
            const allUsers = dataStore.getAllUsers();
            const pLower = msg.pushName.toLowerCase().trim();
            const match = allUsers.find(u => {
              const uLower = (u.name || '').toLowerCase();
              return uLower.includes(pLower) || pLower.includes(uLower) ||
                (pLower.includes('shahrukh') && uLower.includes('shahrukh')) ||
                (pLower.includes('om prakash') && uLower.includes('om prakash')) ||
                (pLower.includes('saini') && uLower.includes('saini')) ||
                (pLower.includes('sonu') && uLower.includes('sonu'));
            });
            if (match) {
              await dataStore.bindLidToUser(match.phone, cleanPhone);
              existingUser = match;
              console.log(`✅ [WhatsApp] Auto-bound LID ${cleanPhone} to staff member ${match.name} (${match.phone})`);
            }
          }

          if (!existingUser && msg.pushName) {
            await dataStore.saveUser({
              phone: '+' + cleanPhone,
              name: msg.pushName,
              role: 'lead',
              tier: 'Tier 3',
              region: 'India',
              notes: 'Auto-onboarded via WhatsApp'
            });
            existingUser = dataStore.getUser(cleanPhone);
          }

          const canonicalPhone = existingUser ? existingUser.phone : ('+' + cleanPhone);
          const isCEO = canonicalPhone.includes('9079609627') || cleanPhone.includes('9079609627') || sender.includes('260872136093846');

          // Extract text, caption, or handle media messages (Images, Documents, QR codes)
          const isImage = !!msg.message.imageMessage;
          const isDocument = !!msg.message.documentMessage;
          const caption =
            msg.message.imageMessage?.caption ||
            msg.message.documentMessage?.caption ||
            '';
          let text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            caption ||
            '';

          // Handle incoming Image / Document (e.g. CEO uploaded QR code or payment doc)
          if (isImage || isDocument) {
            console.log(`📷 [WhatsApp Media] Received media from ${existingUser?.name || 'Contact'} (${canonicalPhone})`);
            try {
              const buffer = await downloadMediaMessage(msg, 'buffer', {});
              if (buffer) {
                const customQrPath = path.join(__dirname, '../../brand-assets/download_content_by_admin/sharma_industries_payment_qr.png');
                const incomingDir = path.join(__dirname, '../data/incoming_media');
                if (!fs.existsSync(incomingDir)) fs.mkdirSync(incomingDir, { recursive: true });
                const archivePath = path.join(incomingDir, `media_${Date.now()}_${isImage ? 'image.png' : 'doc'}`);
                fs.writeFileSync(archivePath, buffer);

                const isQrRelated = isCEO || /qr|payment|upi|code|bhim|pay/i.test(caption || text);
                if (isQrRelated) {
                  const targetDir = path.dirname(customQrPath);
                  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                  fs.writeFileSync(customQrPath, buffer);
                  console.log(`✅ [WhatsApp Media] Successfully stored payment QR code at: ${customQrPath}`);

                  // Check if caption contains UPI ID
                  const upiPattern = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/;
                  const upiMatch = (caption || text).match(upiPattern);
                  let upiAck = '';
                  if (upiMatch) {
                    const upiId = upiMatch[0];
                    const cfgPath = path.join(__dirname, '../data/payment_config.json');
                    const paymentCfg = {
                      upiId: upiId,
                      payeeName: 'Sharma Industries',
                      qrImagePath: 'brand-assets/download_content_by_admin/sharma_industries_payment_qr.png',
                      updatedAt: new Date().toISOString(),
                      updatedBy: existingUser?.name || 'Ashutosh Sharma'
                    };
                    fs.writeFileSync(cfgPath, JSON.stringify(paymentCfg, null, 2));
                    console.log(`✅ [PaymentConfig] Saved UPI ID: ${upiId}`);
                    upiAck = `\n• Configured UPI ID: *${upiId}*`;
                  }

                  const confirmMsg = `✅ *Payment QR Code Received & Stored!* 🏛️\n\n• Stored File: \`brand-assets/download_content_by_admin/sharma_industries_payment_qr.png\`${upiAck}\n• Status: Automatically linked to all GST Invoices and Proforma Estimates.\n\nSir, ab se sabhi generated invoice PDFs me ye direct QR code embed hoga!`;
                  await this.sock.sendMessage(sender, { text: confirmMsg }, { quoted: msg });
                  continue;
                }
              }
            } catch (mediaErr) {
              console.error('[WhatsApp Media] Error downloading media:', mediaErr);
            }
          }

          // Check if message contains a standalone UPI ID
          const upiPattern = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/;
          const upiMatch = text.match(upiPattern);
          if (upiMatch && isCEO) {
            const upiId = upiMatch[0];
            const cfgPath = path.join(__dirname, '../data/payment_config.json');
            let prevCfg = {};
            if (fs.existsSync(cfgPath)) {
              try { prevCfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')); } catch (e) {}
            }
            const paymentCfg = {
              ...prevCfg,
              upiId: upiId,
              payeeName: 'Sharma Industries',
              qrImagePath: 'brand-assets/download_content_by_admin/sharma_industries_payment_qr.png',
              updatedAt: new Date().toISOString(),
              updatedBy: existingUser?.name || 'Ashutosh Sharma'
            };
            fs.writeFileSync(cfgPath, JSON.stringify(paymentCfg, null, 2));
            console.log(`✅ [PaymentConfig] Saved UPI ID from text: ${upiId}`);

            if (text.trim().toLowerCase().includes('upi') || text.trim() === upiId) {
              const confirmMsg = `✅ *UPI ID Successfully Stored & Linked!* 💳\n\n• Configured UPI ID: *${upiId}*\n• Payee Name: Sharma Industries\n• Auto-linked to: All GST Invoices, Trade Bills & Quotations.\n\nSir, ye setting permanently save ho chuki hai!`;
              await this.sock.sendMessage(sender, { text: confirmMsg }, { quoted: msg });
              continue;
            }
          }

          if (!text || text.trim() === '') continue;

          console.log(`\n📩 Incoming from ${existingUser?.name || 'Contact'} (${canonicalPhone}): "${text}"`);

          // Process through Hermes Brain (User -> Hermes -> Orchestrator -> Agents -> Orchestrator -> Hermes -> User)
          const hermesBrain = require('../hermes-brain');
          const res = await hermesBrain.processUserRequest(text, canonicalPhone, 'WhatsApp');
          console.log(`🤖 Replied via [${res.agent} | Team Lead: ${res.teamLead}] (${res.pathType}, ${res.durationMs}ms): "${res.reply.slice(0, 80)}..."`);

          // Send presence update and deliver response quoted to preserve Signal ratchet context
          try {
            await this.sock.sendPresenceUpdate('composing', sender);
          } catch (e) {}

          await this.sock.sendMessage(sender, { text: res.reply }, { quoted: msg });
        }
      } catch (err) {
        console.error('[WhatsApp] Message processing error:', err);
      }
    });
  }

  async sendDirectMessage(targetPhone, text) {
    if (!this.sock) {
      console.warn('[WhatsApp] Socket not connected, cannot send direct message.');
      return false;
    }
    const clean = (targetPhone || '').replace(/[^0-9]/g, '');

    // STRICT EXECUTIVE SECURITY POLICY:
    // Proactive reports are exclusively authorized for CEO Ashutosh Sharma (+919079609627).
    // Strictly prohibited for Father (+919784832210) or any staff / external leads.
    if (clean !== '919079609627' && clean !== '9079609627') {
      console.warn(`🔒 [WhatsApp Firewall] Blocked proactive report to non-CEO number: ${targetPhone}`);
      return false;
    }

    try {
      const user = dataStore.getUser(clean);
      let jid = `${clean}@s.whatsapp.net`;
      if (user && user.notes && user.notes.includes('LID:')) {
        const lidMatch = user.notes.match(/LID:\s*([0-9]+)/);
        if (lidMatch) {
          jid = `${lidMatch[1]}@lid`;
        }
      }
      try {
        await this.sock.sendMessage(jid, { text });
        console.log(`[WhatsApp] Sent direct message to ${targetPhone} (${jid})`);
        return true;
      } catch (err1) {
        if (jid.endsWith('@lid')) {
          const fallbackJid = `${clean}@s.whatsapp.net`;
          console.warn(`[WhatsApp] Send to LID ${jid} failed (${err1.message}), trying fallback ${fallbackJid}...`);
          await this.sock.sendMessage(fallbackJid, { text });
          console.log(`[WhatsApp] Sent direct message via fallback to ${targetPhone} (${fallbackJid})`);
          return true;
        }
        throw err1;
      }
    } catch (err) {
      console.error(`[WhatsApp] Failed to send direct message to ${targetPhone}:`, err.message);
      return false;
    }
  }

  async sendDocument(targetPhone, filePath, fileName = 'Document.pdf', caption = '') {
    if (!this.sock) {
      console.warn('[WhatsApp] Socket not connected, cannot send document.');
      return false;
    }
    const clean = (targetPhone || '').replace(/[^0-9]/g, '');

    // STRICT EXECUTIVE SECURITY POLICY: Proactive documents exclusively for CEO
    if (clean !== '919079609627' && clean !== '9079609627') {
      console.warn(`🔒 [WhatsApp Firewall] Blocked document dispatch to non-CEO number: ${targetPhone}`);
      return false;
    }

    try {
      const user = dataStore.getUser(clean);
      let jid = `${clean}@s.whatsapp.net`;
      if (user && user.notes && user.notes.includes('LID:')) {
        const lidMatch = user.notes.match(/LID:\s*([0-9]+)/);
        if (lidMatch) {
          jid = `${lidMatch[1]}@lid`;
        }
      }
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        console.error(`[WhatsApp] Document not found on disk: ${filePath}`);
        return false;
      }
      const fileBuffer = fs.readFileSync(filePath);
      await this.sock.sendMessage(jid, {
        document: fileBuffer,
        mimetype: 'application/pdf',
        fileName: fileName,
        caption: caption
      });
      console.log(`✅ [WhatsApp] Delivered PDF "${fileName}" to Ashutosh Sir (${targetPhone})`);
      return true;
    } catch (err) {
      console.error(`[WhatsApp] Failed to send document to ${targetPhone}:`, err.message);
      return false;
    }
  }
}

module.exports = new WhatsAppClient();
