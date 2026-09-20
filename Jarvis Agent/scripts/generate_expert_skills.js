const fs = require('fs');
const path = require('path');

const baseExpertsDir = 'C:/Users/itzzz/.hermes/skills/experts';
const baseRootSkillsDir = 'C:/Users/itzzz/.hermes/skills';
const localAppDataDir = path.join(process.env.LOCALAPPDATA || 'C:/Users/itzzz/AppData/Local', 'hermes/skills/experts');
const localAppRootSkills = path.join(process.env.LOCALAPPDATA || 'C:/Users/itzzz/AppData/Local', 'hermes/skills');

const experts = [
  // Branding & Positioning
  {
    name: 'seth-godin',
    dept: 'Branding & Positioning',
    triggers: ['seth godin', 'purple cow', 'tribes', 'permission marketing'],
    title: 'Seth Godin — Remarkable Branding & Permission Marketing Expert',
    frameworks: ['Purple Cow (Being Remarkable in a Sea of Brown)', 'Tribes (Leading the Craftsman Community)', 'The Dip (Strategic Quitting vs Pushing Through)'],
    paintApp: 'Turn Swatch Paints into a "Purple Cow" among boring white paint brands through eye-catching bucket aesthetics, radical transparency in chemist formulations, and building an exclusive tribe of master painters.'
  },
  {
    name: 'philip-kotler',
    dept: 'Branding & Positioning',
    triggers: ['philip kotler', 'kotler', 'marketing management', '4ps', 'stp'],
    title: 'Philip Kotler — Marketing Management & B2B Segmentation Legend',
    frameworks: ['STP (Segmentation, Targeting, Positioning)', 'Industrial 4Ps to 4Cs Transition', 'B2B Trade Relationship Marketing'],
    paintApp: 'Segmenting Rajasthan hardware and paint dealers by trade velocity (A-grade mandis vs rural tehsil stores) to structure custom pricing slabs and route logistics.'
  },
  {
    name: 'al-ries-jack-trout',
    dept: 'Branding & Positioning',
    triggers: ['al ries', 'jack trout', 'positioning', '22 immutable laws'],
    title: 'Al Ries & Jack Trout — Positioning & Category Focus Pioneers',
    frameworks: ['The Law of Leadership vs The Law of Category', 'The Law of Focus (Owning a Word in the Mind)', 'The Law of the Opposite'],
    paintApp: 'Instead of being a generic me-too decorative paint, own the word "TEXTURE" and "DURABILITY" in Rajasthan. Be the opposite of corporate giants: where Asian Paints is distant, Swatch is local and personal.'
  },
  {
    name: 'david-ogilvy',
    dept: 'Branding & Positioning',
    triggers: ['david ogilvy', 'ogilvy', 'advertising', 'big idea'],
    title: 'David Ogilvy — Advertising & Copywriting Titan',
    frameworks: ['The Big Idea', 'Headline & Proof Architecture', 'Research-Driven Direct Advertising'],
    paintApp: 'Crafting dealer and builder print collateral grounded in hard, undeniable facts: "Tested for 5,000 scrub cycles. Contains 16% pure acrylic binder. Here is why painters refuse to switch."'
  },
  {
    name: 'donald-miller',
    dept: 'Branding & Positioning',
    triggers: ['donald miller', 'storybrand', 'sb7'],
    title: 'Donald Miller — StoryBrand & Narrative Clarity Expert',
    frameworks: ['The SB7 Framework (Customer is the Hero, Brand is the Guide)', 'Clarifying the One Problem', 'Direct Call to Action Transformation'],
    paintApp: 'Positioning independent paint dealers and painters as the heroes fighting against rising corporate costs and shrinking margins, with Swatch Paints acting as the faithful guide providing high-margin weapons.'
  },

  // Operations & Supply Chain Titans
  {
    name: 'taiichi-ohno',
    dept: 'Operations & Supply Chain',
    triggers: ['taiichi ohno', 'toyota production system', 'tps', 'muda', 'lean'],
    title: 'Taiichi Ohno — Toyota Production System & Lean Manufacturing Father',
    frameworks: ['Elimination of the 7 Mudas (Wastes)', 'Kanban & Just-In-Time Raw Material Delivery', 'Genchi Genbutsu (Go and See at the Factory Floor)'],
    paintApp: 'Eliminating raw material handling waste in disperser charging, sizing exact batch queues of Swatch Rustic Texture, and standardizing cycle times.'
  },
  {
    name: 'sam-walton',
    dept: 'Operations & Supply Chain',
    triggers: ['sam walton', 'walmart', 'distribution', 'retail'],
    title: 'Sam Walton — Rural Distribution & Low-Cost Logistics Master',
    frameworks: ['Saturating Small Town Mandis Before Big Cities', 'Passing Cost Savings to Dealers', 'Empowering Store Associates & Drivers'],
    paintApp: 'Bypassing overcrowded metropolitan battles to dominate Tier 2/3 and rural Rajasthan mandis where independent hardware retailers command 80% market share.'
  },
  {
    name: 'tim-cook',
    dept: 'Operations & Supply Chain',
    triggers: ['tim cook', 'supply chain', 'inventory control'],
    title: 'Tim Cook — World-Class Supply Chain & Inventory Optimization Titan',
    frameworks: ['Treating Inventory as Inherently Depreciating Waste', 'Buffer Stock Sizing at Key Depots', 'Single-Sourced Component Mitigation'],
    paintApp: 'Maintaining lean 7-day raw material inventory of titanium dioxide and emulsions while maintaining 48-hour buffer of finished rustic texture bags for peak season orders.'
  },
  {
    name: 'eliyahu-goldratt',
    dept: 'Operations & Supply Chain',
    triggers: ['eliyahu goldratt', 'theory of constraints', 'toc', 'the goal'],
    title: 'Eliyahu M. Goldratt — Theory of Constraints & Bottleneck Master',
    frameworks: ['The 5 Focusing Steps', 'Drum-Buffer-Rope Factory Scheduling', 'Throughput Accounting vs Cost Accounting'],
    paintApp: 'Identifying the high-speed disperser or bagging station as the factory bottleneck, ensuring it never starves for raw material slurry.'
  },
  {
    name: 'amancio-ortega',
    dept: 'Operations & Supply Chain',
    triggers: ['amancio ortega', 'inditex', 'zara', 'fast production'],
    title: 'Amancio Ortega — Fast-Response Agility & Lean Batch Pioneer',
    frameworks: ['Short Batch Production Cycles', 'Zero Warehousing Stagnation', 'Real-Time Market Feedback Pulled Production'],
    paintApp: 'Manufacturing rustic texture in responsive 500-bag daily batches based on real-time WhatsApp dealer orders rather than over-producing slow-moving SKUs.'
  },

  // Sales & Master Negotiators
  {
    name: 'chris-voss',
    dept: 'Sales & Negotiation',
    triggers: ['chris voss', 'negotiation', 'never split the difference', 'tactical empathy'],
    title: 'Chris Voss — Master Hostage Negotiator & Tactical Empathy Expert',
    frameworks: ['Tactical Empathy & Mirroring', 'Calibrated Questions (How & What)', 'Labeling Fears & Auditing Accusations'],
    paintApp: 'When a dealer says "I already sell Asian Paints", Voss mirrors: "You only sell Asian Paints?" then labels: "It feels like bringing in another brand sounds like extra risk with unknown returns."'
  },
  {
    name: 'jeb-blount',
    dept: 'Sales & Negotiation',
    triggers: ['jeb blount', 'objections', 'fanatical prospecting'],
    title: 'Jeb Blount — Objections & High-Velocity Prospecting Master',
    frameworks: ['Relentless Prospecting Rhythm', 'The 4-Step Objection Turnaround', 'Managing Emotional Lurch'],
    paintApp: 'Teaching Sonu Kumar and Om Prakash Saini to handle "Credit do pehle" with calm confidence: "Sharma ji, companies that give 90-day credit build that interest into the bucket price. We give you cash discount instead."'
  },
  {
    name: 'jordan-belfort',
    dept: 'Sales & Negotiation',
    triggers: ['jordan belfort', 'straight line', 'sales persuasion'],
    title: 'Jordan Belfort — Straight Line Persuasion System',
    frameworks: ['The Three Tens (Product, You, Company Certainty)', 'Tonality & Urgency Control', 'Looping Past Initial Objections'],
    paintApp: 'Building 10/10 certainty in Swatch Paints\' chemistry, 10/10 trust in CEO Ashutosh Sharma, and 10/10 belief in high dealer cash margins.'
  },
  {
    name: 'jeremy-miner',
    dept: 'Sales & Negotiation',
    triggers: ['jeremy miner', 'nepq', 'neuro emotional persuasion'],
    title: 'Jeremy Miner — NEPQ Behavioral Sales Questions',
    frameworks: ['Connecting Questions vs Consequence Questions', 'Disarming Retailer Sales Defenses', 'Problem Clarification Protocol'],
    paintApp: 'Asking dealers: "How has your net profit margin on exterior coatings changed over the last three years with corporate brands?"'
  },
  {
    name: 'brian-tracy',
    dept: 'Sales & Negotiation',
    triggers: ['brian tracy', 'psychology of selling'],
    title: 'Brian Tracy — Consultative Selling & Professional Closing Legend',
    frameworks: ['The Psychology of Buying Decisions', 'Consultative Relationship Building', 'The 7 Closing Techniques'],
    paintApp: 'Structuring field sales visits around dealer profitability and contractor business growth rather than product push.'
  },

  // Direct Response & Copywriting
  {
    name: 'eugene-schwartz',
    dept: 'Direct Response & Copywriting',
    triggers: ['eugene schwartz', 'breakthrough advertising', 'awareness levels'],
    title: 'Eugene Schwartz — Market Awareness & Desire Channeling Master',
    frameworks: ['The 5 Stages of Customer Awareness', 'Channeling Mass Desire', 'Market Sophistication Mechanics'],
    paintApp: 'Tailoring WhatsApp broadcasts based on dealer awareness: Unaware dealers get margin shock data; Solution-aware dealers get technical formulation comparisons.'
  },
  {
    name: 'gary-halbert',
    dept: 'Direct Response & Copywriting',
    triggers: ['gary halbert', 'boron letters', 'copywriting'],
    title: 'Gary Halbert — Master Copywriter & Direct Mail Legend',
    frameworks: ['A-Pile vs B-Pile Mail Sorting', 'The Star-Story-Solution Flow', 'Irresistible Personal Grabbers'],
    paintApp: 'Writing direct executive letters from CEO Ashutosh Sharma to top 100 hardware retailers that get opened and read immediately.'
  },
  {
    name: 'joe-sugarman',
    dept: 'Direct Response & Copywriting',
    triggers: ['joe sugarman', 'triggers', 'slippery slide'],
    title: 'Joe Sugarman — Psychological Purchase Triggers & Copy Architecture',
    frameworks: ['The Slippery Slide Concept', 'Curiosity and Specificity Hooks', '30 Psychological Buying Triggers'],
    paintApp: 'Writing paint product brochures where the first sentence forces the reader to read the second sentence until the entire value offer is consumed.'
  },
  {
    name: 'claude-hopkins',
    dept: 'Direct Response & Copywriting',
    triggers: ['claude hopkins', 'scientific advertising', 'preemptive marketing'],
    title: 'Claude Hopkins — Father of Scientific Advertising & Testing',
    frameworks: ['Preemptive Claim (Explaining the Unseen Process)', 'Coupon-Based Direct Tracking', 'Elimination of Guesswork'],
    paintApp: 'Explaining our chemical manufacturing process: "Why we double-mill our quartz sand to exactly 0.5-1.0mm grains so your painters never experience trowel drag."'
  },
  {
    name: 'russell-brunson',
    dept: 'Direct Response & Copywriting',
    triggers: ['russell brunson', 'value ladder', 'hook story offer'],
    title: 'Russell Brunson — Value Ladder & Modern Funnel Architect',
    frameworks: ['The Hook-Story-Offer Framework', 'The Value Ladder (Putty -> Primer -> Texture -> Luxury)', 'Attractive Character Engineering'],
    paintApp: 'Guiding retailers up the Swatch value ladder: start with 10 bags of Putty, graduate to Primers, dominate with Rustic Textures, and finish with Waterproofing.'
  },

  // Industrial & Empire Strategists
  {
    name: 'dhirubhai-ambani',
    dept: 'Industrial Strategy',
    triggers: ['dhirubhai ambani', 'reliance', 'scale', 'polyester'],
    title: 'Dhirubhai Ambani — Indian Industrial Scale & Courage Icon',
    frameworks: ['Think Big, Think Fast, Think Ahead', 'Backward Integration Mastery', 'Building Trust with Trade Partners'],
    paintApp: 'Building an unshakeable offline network in Rajasthan, pricing products for mass Indian adoption, and turning dealers into true family partners.'
  },
  {
    name: 'mukesh-ambani',
    dept: 'Industrial Strategy',
    triggers: ['mukesh ambani', 'execution', 'jio scale'],
    title: 'Mukesh Ambani — World-Class Mega-Project Execution Architect',
    frameworks: ['Uncompromising Scale & Capital Efficiency', 'Technology-Driven Supply Chain Visibility', 'Data-Backed Operational Decisions'],
    paintApp: 'Automating inventory tracking via WhatsApp and CRM, ensuring zero friction in dealer dispatch and invoice settlements.'
  },
  {
    name: 'charlie-munger',
    dept: 'Industrial Strategy',
    triggers: ['charlie munger', 'munger', 'inversion', 'mental models'],
    title: 'Charlie Munger — Mental Models & Rational Inversion Legend',
    frameworks: ['Invert, Always Invert (How to fail in paint manufacturing?)', 'Latticework of Mental Models', 'Circle of Competence'],
    paintApp: 'Inverting: How does an Indian paint startup go bankrupt? By giving 90-day credit to shady dealers and producing bad batches. Munger rule: Avoid these two, and success is inevitable.'
  },
  {
    name: 'peter-drucker',
    dept: 'Industrial Strategy',
    triggers: ['peter drucker', 'management', 'drucker'],
    title: 'Peter Drucker — Father of Modern Business Management',
    frameworks: ['The Two Functions of Business: Marketing & Innovation', 'Managing for Results', 'What Gets Measured Gets Managed'],
    paintApp: 'Measuring the exact weekly metrics that matter: Active ordering dealers, stock turnover days, and zero-complaint batch logs.'
  },
  {
    name: 'andy-grove',
    dept: 'Industrial Strategy',
    triggers: ['andy grove', 'intel', 'high output management', 'okr'],
    title: 'Andy Grove — Operational Discipline & Inflection Point Master',
    frameworks: ['High Output Management (Managerial Leverage)', 'Strategic Inflection Points', 'Objectives and Key Results (OKRs)'],
    paintApp: 'Treating the paint factory as a high-leverage machine: measuring daily output per labor hour, delivery dispatch times, and raw material conversion efficiency.'
  },

  // Sales Psychology & Modern Scale
  {
    name: 'daniel-kahneman',
    dept: 'Sales Psychology',
    triggers: ['daniel kahneman', 'kahneman', 'thinking fast and slow', 'loss aversion'],
    title: 'Daniel Kahneman — Behavioral Economics & Decision Science Pioneer',
    frameworks: ['System 1 (Intuitive) vs System 2 (Analytical) Thinking', 'Prospect Theory & Loss Aversion', 'Anchoring Bias'],
    paintApp: 'Anchoring dealer prices against MRP (₹1,150) so the ₹650 wholesale net feels like massive instant value. Leveraging loss aversion: showing what profits retailers lose daily by not stocking Swatch.'
  },
  {
    name: 'aswath-damodaran',
    dept: 'Industrial Strategy',
    triggers: ['aswath damodaran', 'valuation', 'cost of capital'],
    title: 'Aswath Damodaran — Valuation & Capital Allocation Dean',
    frameworks: ['Operating Leverage vs Financial Leverage', 'Cash Flow Return on Invested Capital', 'Story vs Numbers Reconciliation'],
    paintApp: 'Keeping factory fixed overhead low so operating break-even is achieved at just 2,000 bags per month, ensuring profitability even during slow winter months.'
  },
  {
    name: 'rory-sutherland',
    dept: 'Sales Psychology',
    triggers: ['rory sutherland', 'alchemy', 'behavioral science'],
    title: 'Rory Sutherland — Behavioral Psychology & Counterintuitive Strategy',
    frameworks: ['Psychological Moonshots', 'Signaling & Costly Signaling', 'Reframing Perceived Value'],
    paintApp: 'Adding heavy-duty bucket handles, tamper-evident tear seals, and textured lid finishes to signal premium industrial formulation before the lid is even opened.'
  },
  {
    name: 'zig-ziglar',
    dept: 'Sales & Negotiation',
    triggers: ['zig ziglar', 'closing the sale'],
    title: 'Zig Ziglar — Timeless Sales Inspiration & Character Selling',
    frameworks: ['You Can Have Everything You Want If You Help Others Get What They Want', 'Character-Driven Selling', 'The Need-Based Close'],
    paintApp: 'Helping paint retailers double their shop earnings. When the dealer grows prosperous, Swatch Paints grows with them.'
  },
  {
    name: 'grant-cardone',
    dept: 'Sales & Negotiation',
    triggers: ['grant cardone', '10x rule', 'sell or be sold'],
    title: 'Grant Cardone — 10X Sales Intensity & Aggressive Follow-Up',
    frameworks: ['The 10X Activity Multiplier', 'Domination vs Competition', 'Omnipresent Follow-Up Schedules'],
    paintApp: 'Driving field reps to contact every single hardware shop in their district twice a week until every counter stocks Swatch.'
  },

  // Product & Strategy Icons
  {
    name: 'steve-jobs',
    dept: 'Branding & Positioning',
    triggers: ['steve jobs', 'product excellence', 'apple'],
    title: 'Steve Jobs — Product Obsession & Simplicity Master',
    frameworks: ['Simplicity is the Ultimate Sophistication', 'End-to-End User Experience', 'Saying No to 1,000 Good Ideas to Focus on One Great SKU'],
    paintApp: 'Refusing to clutter the catalog with 200 mediocre skus. Making Swatch Rustic Texture the undisputed best-applying, cleanest-textured coating in India.'
  },
  {
    name: 'elon-musk',
    dept: 'Industrial Strategy',
    triggers: ['elon musk', 'first principles', 'spacex', 'tesla'],
    title: 'Elon Musk — First Principles Engineering & Velocity Titan',
    frameworks: ['First Principles Reasoning (Boil down to raw materials)', '5-Step Engineering Algorithm', 'Hyper-Fast Iteration Velocity'],
    paintApp: 'Breaking down paint to raw chemicals: TiO2 + Acrylic Emulsion + Calcium Carbonate + Water. Cutting out expensive trading middleman markups by sourcing raw chemicals direct from port importers.'
  },
  {
    name: 'marty-neumeier',
    dept: 'Branding & Positioning',
    triggers: ['marty neumeier', 'brand gap', 'zag'],
    title: 'Marty Neumeier — The Brand Gap & Zag Positioning Visionary',
    frameworks: ['The "Only-ness" Statement', 'When Everyone Zigs, Zag', 'The Brand Commitment Matrix'],
    paintApp: 'The Swatch Paints Only-ness Statement: "Swatch Paints is the ONLY regional paint manufacturer in Rajasthan that guarantees 30%+ dealer margins with same-day factory dispatch and 16% pure acrylic formulation."'
  },
  {
    name: 'jim-collins',
    dept: 'Industrial Strategy',
    triggers: ['jim collins', 'good to great', 'flywheel effect'],
    title: 'Jim Collins — The Flywheel Effect & Built to Last Architect',
    frameworks: ['The Hedgehog Concept (Passion + Economic Engine + Best in World)', 'The Flywheel Effect', 'Level 5 Leadership'],
    paintApp: 'Spinning the Swatch Flywheel: Superior chemistry -> Zero painter complaints -> Dealer re-orders -> Factory volume scale -> Lower raw material cost -> Higher dealer margins -> More loyal dealers.'
  },
  {
    name: 'ray-dalio',
    dept: 'Industrial Strategy',
    triggers: ['ray dalio', 'principles', 'bridgewater'],
    title: 'Ray Dalio — Radical Truth & Machine Framework Thinker',
    frameworks: ['Pain + Reflection = Progress', 'Viewing the Organization as a Machine', 'Radical Transparency & Decision Principles'],
    paintApp: 'Creating clear operational algorithms: If batch viscosity deviates by > 5 KU, stop packing immediately, diagnose disperser RPM, log error, and fix formulation.'
  },

  // Modern Distribution
  {
    name: 'gary-vaynerchuk',
    dept: 'Branding & Positioning',
    triggers: ['gary vaynerchuk', 'garyvee', 'jab jab right hook'],
    title: 'Gary Vaynerchuk — Modern Attention & Underpriced Content Master',
    frameworks: ['Document Don\'t Create', 'Jab, Jab, Jab, Right Hook (Give value before asking for order)', 'Day Trading Attention on Social Platforms'],
    paintApp: 'Shooting short raw WhatsApp Status and Instagram Reels of real painters applying Swatch Rustic Texture on Rajasthan bungalows. Real site proof crushes polished corporate TV ads.'
  },
  {
    name: 'neil-patel',
    dept: 'Branding & Positioning',
    triggers: ['neil patel', 'digital growth', 'seo'],
    title: 'Neil Patel — Local SEO & Digital Dealer Acquisition Specialist',
    frameworks: ['Hyper-Local Google My Business Dominance', 'Long-Tail Commercial Intent Queries', 'Content-Driven Inbound Lead Gen'],
    paintApp: 'Optimizing local search so when contractors search "Texture paint supplier in Jaipur" or "Putty factory in Sikar", Sharma Industries ranks #1.'
  },
  {
    name: 'simon-sinek',
    dept: 'Branding & Positioning',
    triggers: ['simon sinek', 'start with why', 'golden circle'],
    title: 'Simon Sinek — Start With Why & Purpose-Driven Leadership',
    frameworks: ['The Golden Circle (Why, How, What)', 'The Infinite Game in Business', 'Trust and Empathy in Distribution'],
    paintApp: 'Why Swatch Paints exists: To champion the dignity, profitability, and craft of independent Indian paint retailers and ustaad painters.'
  }
];

console.log(`Starting automated generation for ${experts.length} Legend Expert Skills...`);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

let generatedCount = 0;

for (const exp of experts) {
  const dirs = [
    path.join(baseExpertsDir, exp.name),
    path.join(baseRootSkillsDir, exp.name),
    path.join(localAppDataDir, exp.name),
    path.join(localAppRootSkills, exp.name)
  ];

  for (const d of dirs) {
    ensureDir(d);
    ensureDir(path.join(d, 'frameworks'));
    ensureDir(path.join(d, 'examples'));
    ensureDir(path.join(d, 'prompts'));

    // SKILL.md
    const skillContent = `---
name: ${exp.name}
description: "Expert skill embodying ${exp.title}. Specialized for Swatch Paints."
triggers:
${exp.triggers.map(t => `  - "${t}"`).join('\n')}
department: "${exp.dept}"
version: 1.0.0
---

# ${exp.title}

## Purpose in Hermes / Swatch Paints
${exp.paintApp}

## Core Frameworks
${exp.frameworks.map((f, i) => `${i + 1}. **${f}**`).join('\n')}

## Application to Offline Indian Paint Distribution
- Applied specifically to Swatch Paints distribution, factory efficiency, and dealer profitability.
- Strict Blank Input Mode: Awaits official catalog confirmation by CEO Ashutosh Sharma before assuming unconfirmed products.
`;
    fs.writeFileSync(path.join(d, 'SKILL.md'), skillContent, 'utf-8');

    // identity.md
    const identityContent = `# Identity: ${exp.title}

## Background & Mental Models
- Domain: ${exp.dept}
- Key Principles:
${exp.frameworks.map(f => `- ${f}`).join('\n')}

## Advisory Stance for Swatch Paints
${exp.paintApp}
`;
    fs.writeFileSync(path.join(d, 'identity.md'), identityContent, 'utf-8');

    // frameworks
    exp.frameworks.forEach((f, idx) => {
      const fSlug = f.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
      const fContent = `# Framework: ${f}\n\n## Core Principles\n- Operationalized for Swatch Paints.\n- Focus on margin preservation, high-speed execution, and brand equity.\n\n## Practical Application\n${exp.paintApp}\n`;
      fs.writeFileSync(path.join(d, 'frameworks', `${idx + 1}-${fSlug}.md`), fContent, 'utf-8');
    });

    // examples/paint-industry.md
    const exampleContent = `# Paint Industry Application: ${exp.title}\n\n## Case Scenario for Swatch Paints\n${exp.paintApp}\n\n## Outcome\nIncreased dealer profitability, higher customer satisfaction, and predictable factory cash flow.\n`;
    fs.writeFileSync(path.join(d, 'examples', 'paint-industry.md'), exampleContent, 'utf-8');

    // questions.md
    const questionsContent = `# Diagnostic Questions: ${exp.title}\n\n1. How does this decision reinforce our core competitive advantage?\n2. What is the impact on dealer cash margins and stock turnover?\n3. Are we adhering to our strict 7-day payment discipline?\n4. How does this improve customer or painter perception on the job site?\n`;
    fs.writeFileSync(path.join(d, 'questions.md'), questionsContent, 'utf-8');

    // anti-patterns.md
    const antiContent = `# Anti-Patterns: ${exp.title}\n\n1. Never sacrifice product chemistry to win a temporary price war.\n2. Never grant uncollateralized 60-90 day credit to retail stores.\n3. Avoid generic corporate marketing fluff with no clear call to action.\n`;
    fs.writeFileSync(path.join(d, 'anti-patterns.md'), antiContent, 'utf-8');

    // sources.md
    const sourcesContent = `# Sources & Bibliography: ${exp.title}\n\n- Published works, executive frameworks, and industry case studies.\n`;
    fs.writeFileSync(path.join(d, 'sources.md'), sourcesContent, 'utf-8');
  }

  generatedCount++;
}

console.log(`✅ Successfully generated, structured, and mirrored all ${generatedCount} Legend Expert Skills!`);
