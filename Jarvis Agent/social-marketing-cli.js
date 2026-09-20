#!/usr/bin/env node
/**
 * Social Media Marketing & Posting CLI
 * Sharma Industries
 */

const marketing = require('./social-marketing-controller');

const args = process.argv.slice(2);
const command = args[0] || 'calendar';

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
    case 'generate': {
      const flags = parseFlags(args.slice(1));
      const platform = flags.platform || 'instagram';
      const theme = flags.theme || 'company_branding';
      const product = flags.product || 'Sharma Industries';
      const notes = flags.notes || '';
      const compare = Boolean(flags.compare || flags.competitor);

      console.log(`\n📢 [Hermes -> Social Marketing] Generating Campaign Post...`);
      console.log(`   Platform: ${platform.toUpperCase()}`);
      console.log(`   Product:  ${product}`);
      console.log(`   Theme:    ${theme}\n`);

      const post = await marketing.generatePost({
        platform,
        theme,
        product,
        customNotes: notes,
        useCompetitorIntel: compare
      });

      console.log(`======================================================`);
      console.log(`📑 Post Created: ${post.id} [Status: ${post.status.toUpperCase()}]`);
      console.log(`🌐 Platform: ${post.platformName}`);
      console.log(`======================================================\n`);
      console.log(post.content);
      console.log(`\n======================================================`);
      console.log(`💡 To approve: node social-marketing-cli.js approve ${post.id}`);
      console.log(`🚀 To publish: node social-marketing-cli.js publish ${post.id}`);
      console.log(`======================================================\n`);
      break;
    }

    case 'list': {
      const filter = args[1] || null;
      const posts = marketing.listPosts(filter);
      console.log(`\n📊 Social Media Post Registry (${posts.length} posts):`);
      console.log(`------------------------------------------------------`);
      if (posts.length === 0) {
        console.log('   (No posts found. Generate one with "generate" command)');
      } else {
        posts.forEach((p, idx) => {
          const statusBadge = p.status === 'published' ? '🟢 PUBLISHED' : (p.status === 'approved' ? '🟡 APPROVED' : '⚪ DRAFT');
          console.log(`${idx + 1}. [${p.id}] ${statusBadge} | ${p.platformName || p.platform} | ${p.product} | ${new Date(p.createdAt).toLocaleDateString('en-IN')}`);
        });
      }
      console.log(`------------------------------------------------------\n`);
      break;
    }

    case 'view': {
      const id = args[1];
      if (!id) {
        console.log('Usage: node social-marketing-cli.js view <POST_ID>');
        return;
      }
      const p = marketing.getPost(id);
      if (!p) {
        console.log(`❌ Post ${id} not found.`);
        return;
      }
      console.log(`\n======================================================`);
      console.log(`📑 Post: ${p.id} | Status: ${p.status.toUpperCase()} | Platform: ${p.platformName}`);
      console.log(`   Theme: ${p.theme} | Product: ${p.product}`);
      console.log(`   Created: ${new Date(p.createdAt).toLocaleString('en-IN')}`);
      console.log(`======================================================\n`);
      console.log(p.content);
      break;
    }

    case 'approve': {
      const id = args[1];
      if (!id) {
        console.log('Usage: node social-marketing-cli.js approve <POST_ID>');
        return;
      }
      const updated = marketing.updatePostStatus(id, 'approved');
      if (!updated) {
        console.log(`❌ Post ${id} not found.`);
        return;
      }
      console.log(`✅ [Hermes] Post ${id} APPROVED for dispatch/posting!`);
      break;
    }

    case 'publish': {
      const id = args[1];
      if (!id) {
        console.log('Usage: node social-marketing-cli.js publish <POST_ID>');
        return;
      }
      const updated = marketing.updatePostStatus(id, 'published');
      if (!updated) {
        console.log(`❌ Post ${id} not found.`);
        return;
      }
      console.log(`🚀 [Hermes] Post ${id} marked as PUBLISHED across channels!`);
      break;
    }

    case 'calendar': {
      const cal = marketing.getContentCalendar();
      console.log(`\n📅 Weekly Social Media & Marketing Strategy Calendar:`);
      console.log(`========================================================================`);
      cal.forEach(item => {
        console.log(`📌 ${item.day.padEnd(10)} | ${item.platform.padEnd(26)} | ${item.theme}`);
      });
      console.log(`========================================================================\n`);
      break;
    }

    default:
      console.log(`
Social Media Marketing CLI (Subordinate Layer under Hermes)
Usage:
  node social-marketing-cli.js generate --platform <instagram|whatsapp_status|facebook|linkedin> --product <Product/Brand> --theme <company_branding|dealer_scheme|competitor_comparison|painter_contractor|festival_seasonal> [--compare]
  node social-marketing-cli.js list [draft|approved|published]
  node social-marketing-cli.js view <POST_ID>
  node social-marketing-cli.js approve <POST_ID>
  node social-marketing-cli.js publish <POST_ID>
  node social-marketing-cli.js calendar
`);
  }
}

main().catch(err => {
  console.error('Marketing CLI Error:', err);
  process.exit(1);
});
