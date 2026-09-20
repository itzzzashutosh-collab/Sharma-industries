const http = require('http');
const QRCode = require('qrcode');

class QRServer {
  constructor() {
    this.port = process.env.QR_PORT || 3005;
    this.currentQrDataUrl = null;
    this.status = 'initializing'; // 'initializing' | 'qr_ready' | 'connected' | 'disconnected'
    this.server = null;
  }

  async updateQr(qrString) {
    try {
      this.status = 'qr_ready';
      this.currentQrDataUrl = await QRCode.toDataURL(qrString, {
        width: 380,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      console.log(`\n🌐 [QR Web Server] Live QR available at: http://localhost:${this.port}`);
    } catch (err) {
      console.error('[QRServer] Failed to generate QR data URL:', err.message);
    }
  }

  setConnected() {
    this.status = 'connected';
    this.currentQrDataUrl = null;
    console.log(`\n✅ [QR Web Server] WhatsApp Connected! Updated web page at: http://localhost:${this.port}`);
  }

  setDisconnected() {
    this.status = 'disconnected';
    this.currentQrDataUrl = null;
  }

  setWhatsAppClient(client) {
    this.waClient = client;
  }

  start() {
    if (this.server) return;

    this.server = http.createServer((req, res) => {
      // API route for internal Hermes agents to dispatch reports to CEO
      if (req.method === 'POST' && req.url === '/api/send-ceo-report') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            if (!this.waClient || !payload.text) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: false, error: 'WhatsApp client not ready or text missing' }));
            }
            const sent = await this.waClient.sendDirectMessage('919079609627', payload.text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: sent }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

      let content = '';

      if (this.status === 'connected') {
        content = `
          <div class="card connected">
            <div class="icon">✅</div>
            <h1>WhatsApp Connected!</h1>
            <p>Jarvis Agent is linked and actively listening for messages.</p>
            <div class="badge">Status: Live & Operational</div>
          </div>
        `;
      } else if (this.currentQrDataUrl) {
        content = `
          <div class="card">
            <div class="header">
              <h1>Link WhatsApp</h1>
              <p>Scan this QR code from your phone's WhatsApp</p>
            </div>
            <div class="qr-box">
              <img src="${this.currentQrDataUrl}" alt="WhatsApp QR Code" />
            </div>
            <div class="instructions">
              <ol>
                <li>Open <strong>WhatsApp</strong> on your phone</li>
                <li>Tap <strong>Settings</strong> (or ⋮ Menu) &gt; <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong> and point camera here</li>
              </ol>
            </div>
            <div class="footer-note">⚡ Auto-refreshes every 5 seconds</div>
          </div>
        `;
      } else {
        content = `
          <div class="card">
            <div class="spinner"></div>
            <h1>Initializing WhatsApp...</h1>
            <p>Generating session credentials. Please wait a moment.</p>
            <div class="footer-note">Page will automatically update</div>
          </div>
        `;
      }

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sharma Industries — WhatsApp Link</title>
          ${this.status !== 'connected' ? '<meta http-equiv="refresh" content="5">' : ''}
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            body {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              color: #f8fafc;
            }
            .card {
              background: rgba(30, 41, 59, 0.85);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.12);
              border-radius: 20px;
              padding: 32px;
              width: 100%;
              max-width: 440px;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: #38bdf8; }
            .header p { font-size: 14px; color: #94a3b8; margin-bottom: 20px; }
            .qr-box {
              background: #ffffff;
              padding: 16px;
              border-radius: 16px;
              display: inline-block;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
              margin-bottom: 20px;
            }
            .qr-box img { display: block; width: 280px; height: 280px; }
            .instructions {
              text-align: left;
              background: rgba(15, 23, 42, 0.6);
              padding: 16px 20px;
              border-radius: 12px;
              font-size: 13px;
              color: #cbd5e1;
              line-height: 1.6;
              margin-bottom: 16px;
            }
            .instructions ol { padding-left: 20px; }
            .footer-note { font-size: 12px; color: #64748b; }
            .connected .icon { font-size: 54px; margin-bottom: 12px; }
            .connected h1 { color: #4ade80; font-size: 26px; margin-bottom: 10px; }
            .connected p { color: #cbd5e1; font-size: 15px; margin-bottom: 20px; }
            .badge {
              display: inline-block;
              background: rgba(34, 197, 94, 0.2);
              color: #4ade80;
              border: 1px solid rgba(34, 197, 94, 0.4);
              padding: 6px 14px;
              border-radius: 9999px;
              font-size: 13px;
              font-weight: 600;
            }
            .spinner {
              width: 50px;
              height: 50px;
              border: 4px solid rgba(56, 189, 248, 0.2);
              border-top-color: #38bdf8;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `;

      res.end(html);
    });

    this.server.listen(this.port, () => {
      console.log(`🌐 [QR Web Server] Running on http://localhost:${this.port}`);
    });

    this.server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        this.port = Number(this.port) + 1;
        this.server.listen(this.port);
      }
    });
  }
}

module.exports = new QRServer();
