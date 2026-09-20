require('dotenv').config();
const readline = require('readline');
const orchestrator = require('./orchestrator');
const hermesBridge = require('./hermes-bridge');

async function main() {
  console.log(`
==========================================================
    👑 SHARMA INDUSTRIES — JARVIS / HERMES AI ENGINE
==========================================================
Architecture: Low-Latency Hybrid Multi-Agent System
LLM Engine: OmniRoute (${process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1'})
Model: ${process.env.OMNIROUTE_MODEL || 'ling/Ling-2.6-flash'}
In-Memory Cache: Active (Hot-reloaded via file-watchers)
Session Memory: Active (Multi-turn context tracking)
Async Logger: Active (Buffered 3s non-blocking flush)
==========================================================
  `);

  // 1. Non-Blocking Background Healthcheck
  hermesBridge.askOmniRoute('Ping')
    .then(() => console.log('⚡ [Background] OmniRoute local LLM verified & ready.'))
    .catch((err) => console.warn(`⚠️ [Background] OmniRoute probe note: ${err.message}. Fast agents & retries active.`));

  // 2. Launch WhatsApp or CLI REPL immediately without blocking
  const args = process.argv.slice(2);
  const runWhatsApp = args.includes('--whatsapp') || args.includes('-w');

  if (runWhatsApp) {
    const waClient = require('./whatsapp/wa');
    waClient.start();
  } else {
    console.log('💡 Tip: To start WhatsApp Baileys connection with QR code:');
    console.log('   npm run dev -- --whatsapp   OR   node index.js --whatsapp\n');
  }

  // 3. Interactive CLI Test Mode
  console.log('💬 Interactive CLI Test Mode active. Type your query below (or "exit" to quit):');
  console.log(' - "Track order ORD-101"');
  console.log(' - "System status"');
  console.log(' - "Explain the difference between acrylic putty and white cement putty"\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'User > '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input.toLowerCase() === 'exit') {
      console.log('Shutting down Jarvis Agent...');
      process.exit(0);
    }

    if (!input) {
      rl.prompt();
      return;
    }

    // Default test phone: Rajesh Paint Store (Tier 1 dealer) or CEO Ashutosh
    const testPhone = process.env.TEST_PHONE || '+919079609627';
    const hermesBrain = require('./hermes-brain');
    const result = await hermesBrain.processUserRequest(input, testPhone, 'CLI');
    console.log(`\n[Agent: ${result.agent} | Team Lead: ${result.teamLead}] (${result.pathType} in ${result.durationMs}ms)`);
    console.log('──────────────────────────────────────────────────────────');
    console.log(result.reply);
    console.log('──────────────────────────────────────────────────────────\n');

    rl.prompt();
  });
}

main().catch(console.error);
