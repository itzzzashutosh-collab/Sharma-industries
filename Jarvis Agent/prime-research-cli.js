#!/usr/bin/env node
/**
 * Prime Research Agent CLI — Subordinate Research Layer under Hermes
 * Sharma Industries
 */

const primeResearch = require('./prime-research-controller');

const args = process.argv.slice(2);
const command = args[0] || 'list';

function parseFlags(argList) {
  const flags = {};
  for (let i = 0; i < argList.length; i++) {
    if (argList[i].startsWith('--')) {
      const key = argList[i].slice(2);
      const next = argList[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

async function main() {
  switch (command) {
    case 'run': {
      const flags = parseFlags(args.slice(1));
      const topic = flags.topic || 'General Competitor Benchmarking vs Sharma Industries';
      const competitor = flags.competitor || 'Asian Paints & Berger';
      const productCategory = flags.category || 'exterior_paint';

      console.log(`\n🔍 [Hermes -> Prime Research] Starting research mission...`);
      console.log(`   Topic: ${topic}`);
      console.log(`   Competitor: ${competitor}`);
      console.log(`   Category: ${productCategory}\n`);

      const result = await primeResearch.conductResearch({ topic, competitor, productCategory });
      console.log(`\n======================================================`);
      console.log(`📑 Report Generated: ${result.id}`);
      console.log(`📁 File: ${result.filePath}`);
      console.log(`======================================================\n`);
      console.log(result.content);
      break;
    }

    case 'list': {
      const list = primeResearch.listReports();
      console.log(`\n📊 Prime Research Reports Directory (${list.length} reports):`);
      console.log(`------------------------------------------------------`);
      if (list.length === 0) {
        console.log('   (No research reports found yet. Run "run" command to generate one)');
      } else {
        list.forEach((r, idx) => {
          console.log(`${idx + 1}. [${r.id}] ${r.topic} (${r.competitor}) — ${new Date(r.createdAt).toLocaleString('en-IN')}`);
        });
      }
      console.log(`------------------------------------------------------\n`);
      break;
    }

    case 'report': {
      const id = args[1];
      if (!id) {
        console.log('Usage: node prime-research-cli.js report <REPORT_ID>');
        return;
      }
      const rep = primeResearch.getReport(id);
      if (!rep) {
        console.log(`❌ Report with ID ${id} not found.`);
        return;
      }
      console.log(`\n======================================================`);
      console.log(`📑 Report: ${rep.id} | Topic: ${rep.topic}`);
      console.log(`   Competitor: ${rep.competitor} | Category: ${rep.productCategory}`);
      console.log(`   Date: ${new Date(rep.createdAt).toLocaleString('en-IN')}`);
      console.log(`======================================================\n`);
      console.log(rep.content || '(Empty content)');
      break;
    }

    default:
      console.log(`
Prime Research Agent CLI (Subordinate under Hermes Master Orchestrator)
Usage:
  node prime-research-cli.js run --topic "<topic>" --competitor "<competitor>" --category "<category>"
  node prime-research-cli.js list
  node prime-research-cli.js report <REPORT_ID>

Categories:
  - exterior_paint
  - interior_paint
  - waterproofing
  - wall_putty
`);
  }
}

main().catch(err => {
  console.error('CLI Error:', err);
  process.exit(1);
});
