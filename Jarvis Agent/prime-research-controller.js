/**
 * Prime Research Agent — Subordinate Competitor & Market Research Layer
 * 
 * Hierarchy:
 *   1. Ashutosh Sharma (Owner / CEO)
 *   2. Hermes Agent (Chief of Staff & Master Orchestrator)
 *   3. Prime Research Agent (Subordinate Market Intelligence & Competitor Analysis Engine)
 */

const fs = require('fs');
const path = require('path');
const hermesBridge = require('./hermes-bridge');

const REPORTS_DIR = path.join(__dirname, 'data', 'research_reports');
const REGISTRY_FILE = path.join(REPORTS_DIR, 'index.json');

// Ensure storage
function initStorage() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(REGISTRY_FILE)) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Competitor benchmark matrix is strictly populated on explicit direction from CEO Ashutosh Sharma
const BENCHMARK_MATRIX = {};


class PrimeResearchController {
  constructor() {
    this.name = 'PrimeResearchAgent';
    initStorage();
  }

  listReports() {
    initStorage();
    try {
      return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  }

  getReport(id) {
    initStorage();
    const all = this.listReports();
    const item = all.find(r => r.id === id);
    if (!item) return null;
    const file = path.join(REPORTS_DIR, `${item.id}.md`);
    if (fs.existsSync(file)) {
      return { ...item, content: fs.readFileSync(file, 'utf-8') };
    }
    return item;
  }

  /**
   * Run Deep Competitor Research under Hermes Master Orchestrator
   */
  async conductResearch({ topic, competitor = 'General Market', productCategory = 'coatings' }) {
    initStorage();
    const reportId = `RES-${Date.now().toString(36).toUpperCase()}`;

    console.log(`[Prime Research Agent] Initiating competitor research: "${topic}" (Competitor: ${competitor})...`);

    const prompt = `You are Prime Research Agent, the subordinate Deep Research and Competitor Intelligence Agent operating under Hermes Master Orchestrator for Sharma Industries.

Research Mandate:
Topic: ${topic}
Primary Competitor: ${competitor}
Category: ${productCategory}

STRICT INSTRUCTION: Sharma Industries official product catalog is maintained separately by CEO Ashutosh Sharma. Do NOT assume, invent, or mix hypothetical products. Focus analysis on the competitor's market behavior, pricing tiers, distribution channels, and margins.

Synthesize a comprehensive, executive-grade Market Intelligence Report covering:
1. 🎯 *Competitor Price Positioning & Slabs*: How ${competitor} prices in this category.
2. 💡 *Dealer Margins & Scheme Structures*: Standard trade margins offered by ${competitor}.
3. 🧪 *Technical & Quality Standards*: Standard specifications in this category.
4. 📈 *Key Market Takeaways*: Strategic insights for Sharma Industries leadership.

Deliver an actionable, highly professional, sharp commercial report in Hinglish / English.`;

    let reportContent;
    try {
      const res = await hermesBridge.askOmniRoute(prompt);
      reportContent = typeof res === 'string' ? res : (res?.text || String(res));
    } catch (e) {
      reportContent = `## Competitor Research Report: ${topic}\n\n` +
        `**Competitor**: ${competitor}\n` +
        `**Category**: ${productCategory}\n\n` +
        `### Market Pricing & Margin Overview:\n` +
        `- Competitor: ${competitor}\n` +
        `- Focus: ${topic}\n` +
        `- Note: Awaiting specific product benchmark parameters from CEO Ashutosh Sharma.`;
    }

    const reportFile = path.join(REPORTS_DIR, `${reportId}.md`);
    fs.writeFileSync(reportFile, reportContent, 'utf-8');

    const meta = {
      id: reportId,
      topic,
      competitor,
      productCategory,
      createdAt: new Date().toISOString(),
      orchestratedBy: 'Hermes Master Orchestrator',
      filePath: reportFile
    };

    const all = this.listReports();
    all.unshift(meta);
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(all, null, 2), 'utf-8');

    console.log(`✅ [Prime Research Agent] Report ${reportId} saved successfully.`);
    return { ...meta, content: reportContent };
  }
}

module.exports = new PrimeResearchController();
