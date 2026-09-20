/**
 * Swatch Twenty CRM — Dedicated Web Application Server
 * 
 * Inspired by Twenty.com, tailored specifically for Sharma Industries
 * Running on: http://localhost:3000
 * Governing Executive: CEO Ashutosh Sharma (+91 9079609627)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const dataBridge = require('./data-bridge');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function serveStaticFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API ROUTES ---

  // 1. CRM Stats
  if (pathname === '/api/stats' && method === 'GET') {
    return sendJson(res, 200, dataBridge.getStats());
  }

  // 2. Accounts List (Table View)
  if (pathname === '/api/accounts' && method === 'GET') {
    const category = parsedUrl.query.category || 'all';
    const stage = parsedUrl.query.stage || 'all';
    const query = parsedUrl.query.q || '';
    const page = parseInt(parsedUrl.query.page || '1', 10);
    const limit = parseInt(parsedUrl.query.limit || '50', 10);

    const result = dataBridge.getAccounts({ category, stage, query, page, limit });
    return sendJson(res, 200, result);
  }

  // 3. Opportunities (Kanban View)
  if (pathname === '/api/kanban' && method === 'GET') {
    const kanban = dataBridge.getOpportunitiesKanban();
    return sendJson(res, 200, kanban);
  }

  // 4. Update Pipeline Stage (Drag & Drop or Manual)
  if (pathname === '/api/stage' && method === 'POST') {
    const body = await parseJsonBody(req);
    const { phone, newStage, dealValue } = body;
    if (!phone || !newStage) {
      return sendJson(res, 400, { success: false, error: 'Phone and newStage are required' });
    }
    const updateResult = dataBridge.updateStage(phone, newStage, dealValue);
    return sendJson(res, 200, updateResult);
  }

  // 5. AI Leader Tool: Brian Tracy Quote Calculator
  if (pathname === '/api/tools/quote' && method === 'POST') {
    const body = await parseJsonBody(req);
    const quote = dataBridge.calculateQuote(body);
    return sendJson(res, 200, quote);
  }

  // 6. AI Leader Tool: WhatsApp Cadence Dispatcher
  if (pathname === '/api/tools/cadence' && method === 'POST') {
    const body = await parseJsonBody(req);
    const cadence = dataBridge.dispatchCadence(body);
    return sendJson(res, 200, cadence);
  }

  // 7. AI Leader Tool: Bundi Factory Stock Check
  if (pathname === '/api/tools/stock' && method === 'GET') {
    const product = parsedUrl.query.product || 'all';
    const stock = dataBridge.checkStock({ product });
    return sendJson(res, 200, stock);
  }

  // 8. AI Leader Tool: Philip Kotler Creative Generator
  if (pathname === '/api/tools/creative' && method === 'POST') {
    const body = await parseJsonBody(req);
    const creative = dataBridge.generateCreative(body);
    return sendJson(res, 200, creative);
  }

  // 9. PAN-India Directory Live Search
  if (pathname === '/api/pan-india' && method === 'GET') {
    const query = parsedUrl.query.q || '';
    const category = parsedUrl.query.category || 'all';
    const results = await dataBridge.searchPanIndia(query, category, 20);
    return sendJson(res, 200, { success: true, count: results.length, results });
  }

  // 10. CEO File Approvals
  if (pathname === '/api/approvals' && method === 'GET') {
    const approvals = dataBridge.getCeoApprovals();
    return sendJson(res, 200, approvals);
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'text/plain';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
      serveStaticFile(filePath, 'text/html; charset=utf-8', res);
    } else {
      serveStaticFile(filePath, contentType, res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n👑 ==========================================================`);
  console.log(`   SWATCH TWENTY CRM — ENTERPRISE COMMERCIAL HUB`);
  console.log(`   Governing CEO: Ashutosh Sharma (+91 9079609627)`);
  console.log(`   Live Web Application running at: http://localhost:${PORT}`);
  console.log(`==========================================================\n`);
});

module.exports = server;
