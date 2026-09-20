/**
 * Marketing Hub — Multi-Agent Operational Controller
 * Core Marketing Strategy & Trade Growth Division (12 Legends)
 * 
 * Orchestrates all 12 marketing strategy legends:
 *  1. Gunjit Jain (Indian FMCG/Paint Trade Distribution)
 *  2. Philip Kotler (Core 4Ps & Strategic Marketing)
 *  3. Rory Sutherland (Behavioral Science & Perceptual Value)
 *  4. Ann Handley (Content Marketing & Humanized Voice)
 *  5. Eugene Schwartz (5 Stages of Awareness & Conversion Copy)
 *  6. Robert Cialdini (Marketing Psychology & 6 Influence Triggers)
 *  7. Neil Patel (Hyperlocal SEO & Google Trade Discovery)
 *  8. Byron Sharp (Mental & Physical Availability)
 *  9. Jay Conrad Levinson (Guerrilla Marketing & Low-Cost Street Warfare)
 * 10. Sergio Zyman (Volume Velocity & Commercial Accountability)
 * 11. Dan Ariely (Pricing Psychology & Behavioral Economics)
 * 12. Mark Ritson (Strategic Brand Diagnosis & GTM Planning)
 * 
 * Governing Executive: CEO Ashutosh Sharma (+91 9079609627)
 */

const fs = require('fs');
const path = require('path');

const MARKETING_DIR = path.join(__dirname);

class MarketingHub {
  constructor() {
    this.name = 'marketing_hub';
    this.division = 'Core Marketing Strategy & Trade Growth Division';
    this.legends = [
      { id: 'gunjit-jain', name: 'Gunjit Jain', role: 'EVP of Trade Marketing & Route-to-Market', keywords: ['gunjit', 'jain', 'trade marketing', 'fmcg', 'counter visibility', 'dangler', 'secondary sales', 'pos kit'] },
      { id: 'philip-kotler', name: 'Philip Kotler', role: 'Chief Marketing Strategist (4Ps)', keywords: ['kotler', 'philip', '4ps', 'product price place promotion', 'segmentation', 'targeting', 'distribution economics'] },
      { id: 'rory-sutherland', name: 'Rory Sutherland', role: 'Vice Chairman of Behavioral Science & Value', keywords: ['rory', 'sutherland', 'alchemy', 'behavioral science', 'perceived value', 'reframing', 'luxury stone', 'tactile'] },
      { id: 'ann-handley', name: 'Ann Handley', role: 'Chief Content Officer & Human Communication Lead', keywords: ['ann', 'handley', 'content marketing', 'everybody writes', 'human voice', 'storytelling', 'handbook', 'craftsman guide'] },
      { id: 'eugene-schwartz', name: 'Eugene Schwartz', role: 'Market Awareness & Conversion Copy Chief', keywords: ['schwartz', 'eugene', 'breakthrough advertising', 'stages of awareness', 'awareness', 'sophistication', 'headline copy'] },
      { id: 'robert-cialdini', name: 'Robert Cialdini', role: 'Chief Behavioral Psychologist (Influence)', keywords: ['cialdini', 'influence', 'persuasion', 'reciprocity', 'scarcity', 'social proof', 'consistency', 'pre-suasion'] },
      { id: 'neil-patel', name: 'Neil Patel', role: 'Head of Digital Marketing & Hyperlocal SEO', keywords: ['neil', 'patel', 'seo', 'google maps', 'local search', 'geofencing', 'near me', 'business profile'] },
      { id: 'byron-sharp', name: 'Byron Sharp', role: 'Mass Market Brand Growth Scientist', keywords: ['byron', 'sharp', 'how brands grow', 'mental availability', 'physical availability', 'distinctive assets', 'category entry points'] },
      { id: 'jay-conrad-levinson', name: 'Jay Conrad Levinson', role: 'Guerrilla Marketing Titan', keywords: ['levinson', 'guerrilla', 'street marketing', 'low cost', 'stencils', 'scratch challenge', 'half and half wall'] },
      { id: 'sergio-zyman', name: 'Sergio Zyman', role: 'Commercial Demand & Volume Velocity Chief', keywords: ['zyman', 'sergio', 'velocity', 'commercial accountability', 'signage contract', 'sku review', 'fast 50'] },
      { id: 'dan-ariely', name: 'Dan Ariely', role: 'Chief Behavioral Economist & Pricing Architect', keywords: ['ariely', 'dan', 'predictably irrational', 'decoy pricing', 'loss aversion', 'pain of paying', 'free effect', 'default choice'] },
      { id: 'mark-ritson', name: 'Mark Ritson', role: 'Chief Strategic Brand & GTM Auditor', keywords: ['ritson', 'mark', 'diagnosis', 'brand strategy', 'mini mba', 'birla opus counter', 'gtm', '60/40 rule'] }
    ];
  }

  /**
   * Identifies which marketing legend should lead the consultation
   */
  matchLegend(query = '') {
    const q = query.toLowerCase().trim();
    for (const leg of this.legends) {
      if (leg.keywords.some(k => q.includes(k))) {
        return leg;
      }
    }
    // Default to Kotler & Gunjit for general marketing queries
    return this.legends[0];
  }

  /**
   * Loads specific documentation artifact for an agent
   */
  getAgentFile(legendSlug, filename) {
    const p = path.join(MARKETING_DIR, legendSlug, filename);
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
    return null;
  }

  /**
   * Generates a structured operational agent response for any marketing query
   */
  executeMarketingDirective({ query = '', territory = 'Rajasthan (Bundi & Kota)', partnerName = 'Retail Counter' } = {}) {
    const legend = this.matchLegend(query);
    const skillDoc = this.getAgentFile(legend.id, 'SKILL.md');
    const examplesDoc = this.getAgentFile(legend.id, 'EXAMPLES.md');
    const guardrailsDoc = this.getAgentFile(legend.id, 'GUARDRAILS.md');

    let out = `🏛️ *SWATCH PAINTS — CORE MARKETING STRATEGY DIVISION*\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `👤 *Lead Specialist*: *${legend.name}* [${legend.role}]\n`;
    out += `📍 *Territorial Scope*: ${territory} | *Target*: ${partnerName}\n\n`;

    out += `🧠 *COGNITIVE DIAGNOSIS & FIRST-PRINCIPLES THINKING*:\n`;

    switch (legend.id) {
      case 'gunjit-jain':
        out += `• *Gunjit Jain Trade Audit*: "Indian retail counters are war zones of visual clutter. To win against Asian Paints and Berger, Swatch must capture the 2 feet of glass counter space directly in front of the billing ledger."\n`;
        out += `• *Action Vector*: Deploy the high-tactile Counter Display Stand, 3 bilingual danglers, and tie secondary sales off-take directly to the ₹50 painter cash token redemption.\n`;
        out += `• *Ground Rule*: Protect wholesale vs retail territorial perimeters; never allow wholesale pricing to cause retailer margin friction.\n`;
        break;

      case 'philip-kotler':
        out += `• *Kotler Strategic 4P Alignment*: "Do not treat Swatch as a cheap paint commodity. Value is defined by Product superiority (natural quartz), Price realization (₹400 dealer margin), Place concentration (high-traffic hardware corridors), and Promotion (5-Year Guarantee + Painter Token)."\n`;
        out += `• *Action Vector*: Segment counters into Tier-A (Exclusive Paint Hubs), Tier-B (Hardware & Building Materials), and Tier-C (Resellers). Allocate 80% of POS collateral to Tier-A and Tier-B.\n`;
        break;

      case 'rory-sutherland':
        out += `• *Rory Sutherland Behavioral Alchemy*: "Perception is reality. If you sell it as paint, you compete on price per litre. If you sell it as 'Crushed Bundi Natural Granite Wall Armor', you compete with expensive Italian stone cladding."\n`;
        out += `• *Action Vector*: Mandate the 2.5kg cured concrete sample board. The physical weight triggers an unshakeable subconscious perception of structural permanence and weatherproofing.\n`;
        break;

      case 'ann-handley':
        out += `• *Ann Handley Human Voice*: "Nobody wakes up wanting to buy resin polymers. They want a home they are proud of and walls that never crack in the monsoon."\n`;
        out += `• *Action Vector*: Author all customer communication, painter pocket guides, and WhatsApp stories with empathy and warmth. Honor the painter as a respected craftsman (*Ghar Ka Shilpkar*).\n`;
        break;

      case 'eugene-schwartz':
        out += `• *Schwartz 5 Stages of Awareness*: Match the prospect\'s current mental state. For low-margin dealers (Problem Aware), highlight margin bleed. For architects (Solution Aware), present the proprietary 3D Interlocking Silica Matrix.\n`;
        out += `• *Action Vector*: Headline copy must tap into desires that already exist in the market rather than attempting to manufacture new ones.\n`;
        break;

      case 'robert-cialdini':
        out += `• *Cialdini 6 Persuasion Triggers*: Never ask for a purchase order without first giving an unconditional gift (Reciprocity: Luxury sample board + stainless-steel trowel). Frame exclusivity (Scarcity: Only 5 authorized dealers per town).\n`;
        out += `• *Action Vector*: Leverage localized Social Proof (14 leading stores in Kota already stocking) to dissolve adoption hesitation.\n`;
        break;

      case 'neil-patel':
        out += `• *Neil Patel Hyperlocal SEO*: "Win the 3-mile search radius around every store." Optimize Google Business Profiles for all authorized dealers; geofence high-intent searches near industrial construction zones.\n`;
        out += `• *Action Vector*: Integrate automated WhatsApp location-based store discovery so contractors instantly find the nearest Swatch dealer.\n`;
        break;

      case 'byron-sharp':
        out += `• *Byron Sharp Laws of Growth*: Maximize Mental Availability (bold Industrial Yellow & Graphite packaging, universal Category Entry Points) and Physical Availability (Never-Empty Shelf Rule: minimum 15-bag buffer).\n`;
        out += `• *Action Vector*: Reject narrow micro-targeting. Reach the entire mass market of contractors, masonry workers, and home renovators.\n`;
        break;

      case 'jay-conrad-levinson':
        out += `• *Jay Conrad Levinson Guerrilla Warfare*: Invest imagination, not money. Paint the dealer\'s own peeling storefront wall half-and-half (Old Paint vs Swatch 5-Year Armor).\n`;
        out += `• *Action Vector*: Set up the entrance screwdriver scratch challenge: "Try to scratch this wall; if you leave a mark, we pay you ₹1,000."\n`;
        break;

      case 'sergio-zyman':
        out += `• *Sergio Zyman Velocity Mandate*: "If it doesn\'t sell bags, cancel it." Tie storefront signage directly to minimum 100-bag billing commitments. Focus 100% of warehouse buffers on top 2 fast runners.\n`;
        out += `• *Action Vector*: Replace vague awareness campaigns with direct 2% prompt-payment cash discounts to accelerate 7-day collections.\n`;
        break;

      case 'dan-ariely':
        out += `• *Dan Ariely Pricing Architecture*: People cannot evaluate prices without context. Deploy the 3-Tier Decoy Pricing Menu (15 bags starter vs 35 bags decoy vs 50 bags master lot).\n`;
        out += `• *Action Vector*: Frame prompt-payment discounts around Loss Aversion ("Delaying beyond Day 7 loses you ₹690 instantly"). Keep painter tokens as tangible physical cash.\n`;
        break;

      case 'mark-ritson':
        out += `• *Mark Ritson Strategic GTM*: "Strategy is deciding what NOT to do." Position Swatch as the Zero-Machine Specialist counter-strategy against Birla Opus tinting machines. Maintain strict 60/40 brand building vs sales activation.\n`;
        out += `• *Action Vector*: Execute rigorous quarterly objectives across Kota and Bundi before attempting geographic expansion.\n`;
        break;

      default:
        out += `• Comprehensive marketing and trade distribution alignment deployed.\n`;
    }

    out += `\n📋 *STEP-BY-STEP FIELD EXECUTION DIRECTIVE*:\n`;
    out += `1. **Review Guardrails**: Confirm company hurdle rate (>= ₹100/bag on Swatch Rustic) and zero unauthorized price cutting.\n`;
    out += `2. **Deploy Collateral**: Deliver verified physical POS displays, sample boards, or targeted local search campaigns.\n`;
    out += `3. **Measure Off-take**: Track 30-day inventory turnover velocity; ensure dealer re-orders within 18 days.\n`;
    out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    out += `_Core Marketing Strategy & Trade Growth Division — Governed by CEO Ashutosh Sharma._ 🫡`;

    return out;
  }

  /**
   * Router for conversation handlers
   */
  handleMarketingConversation(text = '', userContext = null) {
    const partnerName = userContext?.name || 'Retail Trade Counter';
    return this.executeMarketingDirective({ query: text, partnerName });
  }
}

module.exports = new MarketingHub();

// CLI testing support
if (require.main === module) {
  const hub = new MarketingHub();
  const q = process.argv.slice(2).join(' ') || 'gunjit jain trade marketing and counter visibility';
  console.log(hub.handleMarketingConversation(q));
}
