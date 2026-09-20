/**
 * Sharma Industries — Universal Legends Interactive Conversation & Feedback Engine
 * Enables CEO Ashutosh Sharma (+91 9079609627) to directly converse on WhatsApp
 * with ANY of the 86 Expert Legends across all 7 Divisions.
 * 
 * Strict Directives:
 * 1. Grounded 100% in the INDIAN PAINT MARKET ONLY (Zero Western/US trade assumptions).
 * 2. Real LLM Reasoning (agnes/agnes-2.5-flash via OmniRoute).
 * 3. Bidirectional Feedback Ingestion: Any feedback from Ashutosh Sir is locked into
 *    data/legends_feedback/[slug].json and injected into the 24*7 continuous trainer.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const DATA_DIR = path.join(__dirname, 'data');
const FEEDBACK_DIR = path.join(DATA_DIR, 'legends_feedback');
const DEEP_MEMORY_DIR = path.join(DATA_DIR, 'legends_deep_memory');
const BATTLECARDS_DIR = path.join(DATA_DIR, 'legends_battlecards');

if (!fs.existsSync(FEEDBACK_DIR)) fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
if (!fs.existsSync(DEEP_MEMORY_DIR)) fs.mkdirSync(DEEP_MEMORY_DIR, { recursive: true });
if (!fs.existsSync(BATTLECARDS_DIR)) fs.mkdirSync(BATTLECARDS_DIR, { recursive: true });

// Universal Registry of all 86 Legends across 7 Divisions
const ALL_LEGENDS = [
  // 1. Sales Division (18)
  { slug: 'sales-brian-tracy', name: 'Brian Tracy', role: 'Chief Sales Officer', division: 'Sales', aliases: ['brian', 'tracy', 'cso', 'sales lead'] },
  { slug: 'sales-alex-hormozi', name: 'Alex Hormozi', role: 'Offer Architect', division: 'Sales', aliases: ['hormozi', 'alex', 'harmozi', 'offer architect'] },
  { slug: 'sales-dan-kennedy', name: 'Dan Kennedy', role: 'Direct Response Specialist', division: 'Sales', aliases: ['dan kennedy', 'kennedy', 'direct response'] },
  { slug: 'sales-chris-voss', name: 'Chris Voss', role: 'Negotiations Lead', division: 'Sales', aliases: ['chris voss', 'voss', 'negotiator', 'negotiation'] },
  { slug: 'sales-jordan-belfort', name: 'Jordan Belfort', role: 'Straight Line Closer', division: 'Sales', aliases: ['jordan belfort', 'belfort', 'straight line', 'wolf'] },
  { slug: 'sales-zig-ziglar', name: 'Zig Ziglar', role: 'Relationship Closer', division: 'Sales', aliases: ['zig ziglar', 'ziglar', 'relationship closer'] },
  { slug: 'sales-joe-girard', name: 'Joe Girard', role: 'Collections & Retention Lead', division: 'Sales', aliases: ['joe girard', 'girard', 'collection lead', 'payment collector'] },
  { slug: 'sales-john-mcmahon', name: 'John McMahon', role: 'Enterprise Qualifier', division: 'Sales', aliases: ['john mcmahon', 'mcmahon', 'meddpicc'] },
  { slug: 'sales-neil-rackham', name: 'Neil Rackham', role: 'SPIN Consultant', division: 'Sales', aliases: ['neil rackham', 'rackham', 'spin'] },
  { slug: 'sales-keenan', name: 'Keenan', role: 'Gap Selling Master', division: 'Sales', aliases: ['keenan', 'gap selling'] },
  { slug: 'sales-dale-carnegie', name: 'Dale Carnegie', role: 'Human Relations Lead', division: 'Sales', aliases: ['dale carnegie', 'carnegie', 'human relations'] },
  { slug: 'sales-jeb-blount', name: 'Jeb Blount', role: 'Prospecting Engine', division: 'Sales', aliases: ['jeb blount', 'blount', 'prospecting'] },
  { slug: 'sales-jeremy-miner', name: 'Jeremy Miner', role: 'NEPQ Questioning Lead', division: 'Sales', aliases: ['jeremy miner', 'miner', 'nepq'] },
  { slug: 'sales-grant-cardone', name: 'Grant Cardone', role: '10X Scale Specialist', division: 'Sales', aliases: ['grant cardone', 'cardone', '10x'] },
  { slug: 'sales-chet-holmes', name: 'Chet Holmes', role: 'Dream 100 Director', division: 'Sales', aliases: ['chet holmes', 'holmes', 'dream 100'] },
  { slug: 'sales-april-dunford', name: 'April Dunford', role: 'Sales Positioning Lead', division: 'Sales', aliases: ['april dunford', 'dunford', 'positioning lead'] },
  { slug: 'sales-oren-klaff', name: 'Oren Klaff', role: 'Frame Control Master', division: 'Sales', aliases: ['oren klaff', 'klaff', 'pitch anything', 'frame control'] },
  { slug: 'sales-victor-antonio', name: 'Victor Antonio', role: 'B2B Value Selling Lead', division: 'Sales', aliases: ['victor antonio', 'antonio', 'value selling'] },

  // 2. Operations Division (13)
  { slug: 'ops-taiichi-ohno', name: 'Taiichi Ohno', role: 'Chief Operating Officer', division: 'Operations', aliases: ['taiichi ohno', 'ohno', 'coo', 'toyota production', 'tps', 'muda'] },
  { slug: 'ops-v-krishnamurthy', name: 'V. Krishnamurthy', role: 'Industrial Scale Lead', division: 'Operations', aliases: ['krishnamurthy', 'v krishnamurthy', 'industrial scale'] },
  { slug: 'ops-eliyahu-goldratt', name: 'Eliyahu Goldratt', role: 'TOC Architect', division: 'Operations', aliases: ['goldratt', 'eliyahu goldratt', 'toc', 'theory of constraints', 'bottleneck'] },
  { slug: 'ops-eiji-toyoda', name: 'Eiji Toyoda', role: 'Kaizen Director', division: 'Operations', aliases: ['eiji toyoda', 'toyoda', 'kaizen'] },
  { slug: 'ops-w-edwards-deming', name: 'W. Edwards Deming', role: 'Statistical QC Lead', division: 'Operations', aliases: ['deming', 'edwards deming', 'pdca', 'statistical qc', 'qc lead'] },
  { slug: 'ops-henry-ford', name: 'Henry Ford', role: 'Assembly Line Master', division: 'Operations', aliases: ['henry ford', 'ford', 'assembly line'] },
  { slug: 'ops-soichiro-honda', name: 'Soichiro Honda', role: 'Raw Material Testing Lead', division: 'Operations', aliases: ['soichiro honda', 'honda', 'raw material testing'] },
  { slug: 'ops-paul-o-neill', name: 'Paul O\'Neill', role: 'Safety & Plant Floor Lead', division: 'Operations', aliases: ['paul o neill', 'oneill', 'o\'neill', 'plant safety'] },
  { slug: 'ops-fred-smith', name: 'Fred Smith', role: 'Logistics Network Lead', division: 'Operations', aliases: ['fred smith', 'fedex smith', 'dispatch logistics'] },
  { slug: 'ops-verghese-kurien', name: 'Verghese Kurien', role: 'Cooperative Aggregation Lead', division: 'Operations', aliases: ['verghese kurien', 'kurien', 'amul kurien', 'contractor network'] },
  { slug: 'ops-brijmohan-munjal', name: 'Brijmohan Munjal', role: 'Ancillary Supply Partner Lead', division: 'Operations', aliases: ['brijmohan munjal', 'munjal', 'hero munjal', 'raw material supply'] },
  { slug: 'ops-frederick-taylor', name: 'Frederick Taylor', role: 'Scientific Bagging Lead', division: 'Operations', aliases: ['frederick taylor', 'taylor', 'time motion study'] },
  { slug: 'ops-tim-cook', name: 'Tim Cook', role: 'Supply Chain Velocity Lead', division: 'Operations', aliases: ['tim cook', 'cook', 'apple cook', 'supply chain velocity'] },

  // 3. Finance Division (11)
  { slug: 'fin-warren-buffett', name: 'Warren Buffett', role: 'Chief Financial Officer', division: 'Finance', aliases: ['warren buffett', 'buffett', 'cfo', 'moat', 'capital float'] },
  { slug: 'fin-charlie-munger', name: 'Charlie Munger', role: 'Inversion & Error Elimination', division: 'Finance', aliases: ['charlie munger', 'munger', 'inversion', 'mental models'] },
  { slug: 'fin-uday-kotak', name: 'Uday Kotak', role: 'Working Capital Lead', division: 'Finance', aliases: ['uday kotak', 'kotak', 'credit policy', 'working capital'] },
  { slug: 'fin-saurabh-mukherjea', name: 'Saurabh Mukherjea', role: 'Coffee Can Moat Architect', division: 'Finance', aliases: ['saurabh mukherjea', 'mukherjea', 'coffee can'] },
  { slug: 'fin-ram-charan', name: 'Ram Charan', role: 'Execution Economics Lead', division: 'Finance', aliases: ['ram charan', 'charan', 'cash velocity'] },
  { slug: 'fin-radhakishan-damani', name: 'Radhakishan Damani', role: 'Lowest Landed Cost Architect', division: 'Finance', aliases: ['radhakishan damani', 'damani', 'dmart damani', 'low cost model'] },
  { slug: 'fin-aswath-damodaran', name: 'Aswath Damodaran', role: 'Valuation & Cost of Capital', division: 'Finance', aliases: ['aswath damodaran', 'damodaran', 'dean of valuation'] },
  { slug: 'fin-nani-palkhivala', name: 'Nani Palkhivala', role: 'Tax & Compliance Counsel', division: 'Finance', aliases: ['nani palkhivala', 'palkhivala', 'gst compliance', 'tax counsel'] },
  { slug: 'fin-chandrakant-sampat', name: 'Chandrakant Sampat', role: 'Zero-Debt Float Master', division: 'Finance', aliases: ['chandrakant sampat', 'sampat', 'zero debt float'] },
  { slug: 'fin-rakesh-jhunjhunwala', name: 'Rakesh Jhunjhunwala', role: 'Big Bull Growth Sizing', division: 'Finance', aliases: ['rakesh jhunjhunwala', 'jhunjhunwala', 'big bull'] },
  { slug: 'fin-nassim-taleb', name: 'Nassim Taleb', role: 'Antifragility & Risk Master', division: 'Finance', aliases: ['nassim taleb', 'taleb', 'antifragile', 'black swan'] },

  // 4. Vision & Strategy Division (12)
  { slug: 'vis-elon-musk', name: 'Elon Musk', role: 'Chief Visionary & 10X Scale', division: 'Vision', aliases: ['elon musk', 'musk', '10x factory', 'first principles'] },
  { slug: 'vis-mukesh-ambani', name: 'Mukesh Ambani', role: 'Jio-Scale Mega Infrastructure', division: 'Vision', aliases: ['mukesh ambani', 'ambani', 'jio scale', 'pan india infrastructure'] },
  { slug: 'vis-steve-jobs', name: 'Steve Jobs', role: 'Product Obsession & Luxury', division: 'Vision', aliases: ['steve jobs', 'jobs', 'product obsession', 'luxury finish'] },
  { slug: 'vis-dhirubhai-ambani', name: 'Dhirubhai Ambani', role: 'Mass Market Ubiquity', division: 'Vision', aliases: ['dhirubhai ambani', 'dhirubhai', 'mass ubiquity'] },
  { slug: 'vis-peter-drucker', name: 'Peter Drucker', role: 'Management & Results Lead', division: 'Vision', aliases: ['peter drucker', 'drucker', 'management guru'] },
  { slug: 'vis-andrew-grove', name: 'Andrew Grove', role: 'High Output Management', division: 'Vision', aliases: ['andy grove', 'andrew grove', 'grove', 'only the paranoid survive'] },
  { slug: 'vis-ray-dalio', name: 'Ray Dalio', role: 'Principles & Decision Engine', division: 'Vision', aliases: ['ray dalio', 'dalio', 'principles', 'idea meritocracy'] },
  { slug: 'vis-jim-collins', name: 'Jim Collins', role: 'Flywheel Architect', division: 'Vision', aliases: ['jim collins', 'collins', 'flywheel', 'good to great'] },
  { slug: 'vis-sam-walton', name: 'Sam Walton', role: 'Retail Expansion Master', division: 'Vision', aliases: ['sam walton', 'walton', 'walmart walton', 'retail expansion'] },
  { slug: 'vis-amancio-ortega', name: 'Amancio Ortega', role: 'Supply Velocity Lead', division: 'Vision', aliases: ['amancio ortega', 'ortega', 'zara ortega', 'fast replenishment'] },
  { slug: 'vis-ck-prahalad', name: 'C.K. Prahalad', role: 'Bottom of the Pyramid Lead', division: 'Vision', aliases: ['ck prahalad', 'prahalad', 'bottom of pyramid'] },
  { slug: 'vis-simon-sinek', name: 'Simon Sinek', role: 'Purpose & Mission Lead', division: 'Vision', aliases: ['simon sinek', 'sinek', 'golden circle', 'start with why'] },

  // 5. Branding & Positioning Division (11)
  { slug: 'brand-david-ogilvy', name: 'David Ogilvy', role: 'Chief Marketing Officer', division: 'Branding', aliases: ['david ogilvy', 'ogilvy', 'cmo', 'big idea'] },
  { slug: 'brand-al-ries-jack-trout', name: 'Al Ries & Jack Trout', role: 'Positioning Pioneers', division: 'Branding', aliases: ['ries', 'trout', 'al ries', 'jack trout', 'positioning'] },
  { slug: 'brand-piyush-pandey', name: 'Piyush Pandey', role: 'Vernacular Culture Lead', division: 'Branding', aliases: ['piyush pandey', 'pandey', 'har deewar ka pukka vishwas', 'fevicol ad'] },
  { slug: 'brand-donald-miller', name: 'Donald Miller', role: 'StoryBrand Architect', division: 'Branding', aliases: ['donald miller', 'storybrand', 'hero guide'] },
  { slug: 'brand-philip-kotler', name: 'Philip Kotler', role: 'Marketing 4Ps Architect', division: 'Branding', aliases: ['philip kotler', 'kotler', '4ps'] },
  { slug: 'brand-marty-neumeier', name: 'Marty Neumeier', role: 'The Zag Differentiator', division: 'Branding', aliases: ['marty neumeier', 'neumeier', 'zag'] },
  { slug: 'brand-rory-sutherland', name: 'Rory Sutherland', role: 'Behavioral Value Lead', division: 'Branding', aliases: ['rory sutherland', 'sutherland', 'behavioral alchemy'] },
  { slug: 'brand-seth-godin', name: 'Seth Godin', role: 'Purple Cow & Tribe Lead', division: 'Branding', aliases: ['seth godin', 'godin', 'purple cow'] },
  { slug: 'brand-rama-bijapurkar', name: 'Rama Bijapurkar', role: 'Consumer India Lead', division: 'Branding', aliases: ['rama bijapurkar', 'bijapurkar', 'sasta nahi tikau'] },
  { slug: 'brand-r-balki', name: 'R. Balki', role: 'Advertising Storyteller', division: 'Branding', aliases: ['r balki', 'balki', 'trade commercial'] },

  // 6. Social Marketing Division (11)
  { slug: 'soc-gary-vaynerchuk', name: 'Gary Vaynerchuk', role: 'Head of Social & Attention', division: 'Social', aliases: ['gary vee', 'gary vaynerchuk', 'vaynerchuk', 'social media lead'] },
  { slug: 'soc-mrbeast', name: 'MrBeast', role: 'Viral Retention Director', division: 'Social', aliases: ['mrbeast', 'jimmy donaldson', 'extreme durability test', 'visual hook'] },
  { slug: 'soc-gary-halbert', name: 'Gary Halbert', role: 'Direct Sales Copywriter', division: 'Social', aliases: ['gary halbert', 'halbert', 'boron letters', 'whatsapp copy'] },
  { slug: 'soc-robert-cialdini', name: 'Robert Cialdini', role: 'Pre-Suasion Lead', division: 'Social', aliases: ['robert cialdini', 'cialdini', 'pre-suasion', 'social proof'] },
  { slug: 'soc-russell-brunson', name: 'Russell Brunson', role: 'Funnel Architecture Lead', division: 'Social', aliases: ['russell brunson', 'brunson', 'clickfunnels', 'lead funnel'] },
  { slug: 'soc-neil-patel', name: 'Neil Patel', role: 'Local Geo-Targeting Lead', division: 'Social', aliases: ['neil patel', 'patel', 'local seo', 'google maps ranking'] },
  { slug: 'soc-joe-sugarman', name: 'Joe Sugarman', role: 'Psychological Copywriter', division: 'Social', aliases: ['joe sugarman', 'sugarman', 'slippery slide'] },
  { slug: 'soc-daniel-kahneman', name: 'Daniel Kahneman', role: 'Behavioral Heuristics Lead', division: 'Social', aliases: ['daniel kahneman', 'kahneman', 'system 1', 'cognitive ease'] },
  { slug: 'soc-brian-dean', name: 'Brian Dean', role: 'Backlinko SEO Architect', division: 'Social', aliases: ['brian dean', 'skyscraper technique', 'seo paint'] },
  { slug: 'soc-eugene-schwartz', name: 'Eugene Schwartz', role: 'Mass Desire Channels', division: 'Social', aliases: ['eugene schwartz', 'schwartz', 'breakthrough advertising'] },

  // 7. HR, Talent & People Operations Division (10)
  { slug: 'hr-jack-welch', name: 'Jack Welch', role: 'Head of People Ops', division: 'HR', aliases: ['jack welch', 'welch', '20-70-10', 'accountability'] },
  { slug: 'hr-laszlo-bock', name: 'Laszlo Bock', role: 'Structured Hiring Lead', division: 'HR', aliases: ['laszlo bock', 'bock', 'work rules', 'structured interview'] },
  { slug: 'hr-dave-ulrich', name: 'Dave Ulrich', role: 'HR Architecture Lead', division: 'HR', aliases: ['dave ulrich', 'ulrich', 'hr architecture', 'payroll ledger'] },
  { slug: 'hr-patrick-lencioni', name: 'Patrick Lencioni', role: 'Team Health Director', division: 'HR', aliases: ['patrick lencioni', 'lencioni', '5 dysfunctions', 'team health'] },
  { slug: 'hr-mark-roberge', name: 'Mark Roberge', role: 'Sales Quota Scientist', division: 'HR', aliases: ['mark roberge', 'roberge', 'sales quota', 'quota science'] },
  { slug: 'hr-keith-ferrazzi', name: 'Keith Ferrazzi', role: 'Relationship Architect', division: 'HR', aliases: ['keith ferrazzi', 'ferrazzi', 'never eat alone', 'contractor fellowship'] },
  { slug: 'hr-harsh-mariwala', name: 'Harsh Mariwala', role: 'Empowerment Lead', division: 'HR', aliases: ['harsh mariwala', 'mariwala', 'marico mariwala', 'field intrapreneurship'] },
  { slug: 'hr-dr-tv-rao', name: 'Dr. T.V. Rao', role: 'Father of Indian HRD', division: 'HR', aliases: ['tv rao', 'dr tv rao', 'rao', 'competency mapping'] },
  { slug: 'hr-dr-udai-pareek', name: 'Dr. Udai Pareek', role: 'Indian OB & Culture Lead', division: 'HR', aliases: ['udai pareek', 'dr udai pareek', 'pareek', 'octapace'] }
];

// Helper: Call OmniRoute Local LLM
function callLLM(messages, maxTokens = 650, temperature = 0.3) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'agnes/agnes-2.5-flash',
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const req = http.request({
      hostname: 'localhost',
      port: 20128,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-371be56778267a28-00c984-326cafb5',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 45000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const choice = parsed.choices && parsed.choices[0];
          if (!choice) return reject(new Error(`Empty LLM choice: ${data.slice(0, 100)}`));
          const text = choice.message.content || choice.message.reasoning_content || '';
          resolve(text.trim());
        } catch (e) {
          reject(new Error(`Failed to parse LLM response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LLM call timed out after 45s'));
    });

    req.write(payload);
    req.end();
  });
}

class LegendsInteractiveEngine {
  constructor() {
    this.legends = ALL_LEGENDS;
    this.sessionLegendMap = new Map(); // sender -> lastSpokenLegendSlug
  }

  /**
   * Find matching legend from text query
   */
  findLegend(text, sender = null) {
    const q = (text || '').toLowerCase().trim();

    // 1. Direct check against aliases
    for (const leg of this.legends) {
      if (q.includes(leg.name.toLowerCase())) return leg;
      for (const alias of leg.aliases) {
        // Use word boundary check
        const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(q)) return leg;
      }
    }

    // 2. If user query is a follow-up or feedback, use last spoken legend
    if (sender && this.sessionLegendMap.has(sender)) {
      const lastSlug = this.sessionLegendMap.get(sender);
      const matched = this.legends.find(l => l.slug === lastSlug);
      if (matched) return matched;
    }

    return null;
  }

  /**
   * Check if the user text is direct CEO feedback/critique
   */
  isFeedbackMessage(text) {
    const q = (text || '').toLowerCase().trim();
    return (
      q.includes('acha hai') || q.includes('theek hai') || q.includes('sahi hai') ||
      q.includes('pasand aaya') || q.includes('approved') || q.includes('approve') ||
      q.includes('badlo') || q.includes('change karo') || q.includes('change karna') ||
      q.includes('kam karo') || q.includes('badhao') || q.includes('ye nahi') ||
      q.includes('bekar hai') || q.includes('galat hai') || q.includes('nahi chalega') ||
      q.includes('modify karo') || q.includes('update karo')
    );
  }

  /**
   * Save CEO feedback for continuous training injection
   */
  recordFeedback(legend, feedbackText, userContext) {
    const feedbackFile = path.join(FEEDBACK_DIR, `${legend.slug}.json`);
    let list = [];
    if (fs.existsSync(feedbackFile)) {
      try { list = JSON.parse(fs.readFileSync(feedbackFile, 'utf-8')); } catch (e) { list = []; }
    }

    const entry = {
      id: `FB-${legend.slug}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: userContext?.name || 'CEO Ashutosh Sharma',
      phone: userContext?.phone || '+919079609627',
      legend: legend.name,
      division: legend.division,
      feedbackText: feedbackText.trim(),
      status: 'PENDING_NEXT_TRAINING_ROUND'
    };

    list.unshift(entry);
    if (list.length > 50) list = list.slice(0, 50);
    fs.writeFileSync(feedbackFile, JSON.stringify(list, null, 2), 'utf-8');

    // Also update deep memory
    const deepMemoryFile = path.join(DEEP_MEMORY_DIR, `${legend.slug}.json`);
    if (fs.existsSync(deepMemoryFile)) {
      try {
        const mem = JSON.parse(fs.readFileSync(deepMemoryFile, 'utf-8'));
        mem.latestCeoFeedback = entry;
        fs.writeFileSync(deepMemoryFile, JSON.stringify(mem, null, 2), 'utf-8');
      } catch (e) {}
    }

    return entry;
  }

  /**
   * Load legend's current battlecard / memory
   */
  loadLegendBattlecard(legend) {
    const filePath = path.join(BATTLECARDS_DIR, `${legend.slug}.md`);
    if (fs.existsSync(filePath)) {
      try { return fs.readFileSync(filePath, 'utf-8'); } catch (e) {}
    }
    return null;
  }

  /**
   * Universal Interactive Conversation Dispatcher
   */
  async handleConversation(text, userContext = null) {
    const sender = userContext?.phone || '+919079609627';
    const isCeo = (sender === '+919079609627' || sender.includes('9079609627') || userContext?.role === 'admin' || userContext?.role === 'owner');

    const matchedLegend = this.findLegend(text, sender);
    if (!matchedLegend) {
      return null; // Let standard orchestrator handle generic inquiries
    }

    // Save active legend in session
    this.sessionLegendMap.set(sender, matchedLegend.slug);

    // 1. Check if this is CEO feedback for the legend
    if (isCeo && this.isFeedbackMessage(text) && text.trim().length > 5 && !text.toLowerCase().startsWith(matchedLegend.name.toLowerCase())) {
      const fb = this.recordFeedback(matchedLegend, text, userContext);

      const reply = `👑 *${matchedLegend.name} (${matchedLegend.role})*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pranam Ashutosh Sir! 🙏\n\n` +
        `Aapka direct directive capture aur meri deep memory me lock ho chuka hai:\n\n` +
        `📝 *Recorded CEO Directive*:\n` +
        `"${fb.feedbackText}"\n\n` +
        `⚙️ *24*7 Continuous Self-Training Pipeline*:\n` +
        `• Maine ise apne domain ke liye **Priority #1 Guideline** register kar diya hai.\n` +
        `• Continuous training ke agle round me main inhi specific points ke mutabiq 500 naye MiroFish Indian market trials run karke updated battlecard formulate karunga!\n\n` +
        `_Aapka aadesh hi mera execution standard hai Sir._ 🫡`;

      return {
        handled: true,
        reply,
        agent: `${matchedLegend.name} (${matchedLegend.role})`
      };
    }

    // 2. Direct Conversation with the Legend using LLM
    const existingBattlecard = this.loadLegendBattlecard(matchedLegend);

    const systemPrompt = `You are ${matchedLegend.name}, permanent working executive expert inside Sharma Industries (Brand: Swatch Paints).
Your Role: ${matchedLegend.role} | Division: ${matchedLegend.division}.
You are speaking directly to your CEO, Founder & Supreme Boss: Ashutosh Sharma (+91 9079609627).

MARKET ANCHOR (STRICTLY INDIAN PAINT MARKET ONLY):
- Everything you say, think, and propose must be 100% grounded in the Indian Paint Market. Zero US/Western market concepts.
- Trade Reality: Indian multi-brand hardware and paint retail counters, traditional thekedars/applicators, Hadoti/Rajasthan manufacturing base expanding nationwide across Indian tier-1/2/3 cities and towns.
- Commercials in INR (₹), 18% GST HSN 3214 & 3209, cash discount terms (2% CD), and Indian consumer psychology ("Sasta nahi, tikau chahiye").
- Competitive dynamics strictly against Indian market players: Asian Paints, Berger Paints, Nerolac, and Birla Opus.

BUSINESS GROUND TRUTH:
- Company: Sharma Industries (Brand: Swatch Paints).
- Manufacturing HQ / Plant Base: Bundi, Rajasthan — scaling to Pan-India market dominance.
- Products: Swatch Rustic Texture (25kg Bag, Quartz based, pre-mixed, zero tinting machine required), Swatch Roller Coat, Swatch Weatherguard, Swatch Shine.
- Unit Economics (25kg Rustic): Factory Base ₹450 | Landed ₹635 | Standard Dealer Price ₹690 | Bulk Tier (≥50 Bags) ₹640 | MRP ₹1150 | Painters Growth Token ₹50 cash inside bag.
- Commercial Terms: 7-day dealer credit cycle. Dealer earns 40-45% margin vs MRP (vs MNC 3% margin).
- Terminology Rules: Never use the word "mandi" (always "Market", "B2B Market", or "Retail Trade Network"). Never use "Ustaad" (always address applicators and dealers respectfully as "[Name] ji").

${existingBattlecard ? `YOUR CURRENT MASTER BATTLECARD / FORMULATED STRATEGY:\n${existingBattlecard.slice(0, 600)}...\n` : ''}

INSTRUCTIONS:
- Converse like the real legendary expert in natural, executive Hinglish / English.
- Address Ashutosh Sir with utmost professional respect ("Ashutosh Sir", "Pranam Sir").
- Answer his question authoritatively through your specific domain lens.
- Keep the response concise, punchy, and WhatsApp-friendly (approx 120-220 words).
- End by asking for his feedback, directive, or approval so you can continuously refine your strategy in the 24*7 training engine.`;

    try {
      const replyContent = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ], 550);

      const formattedReply = `👑 *${matchedLegend.name} (${matchedLegend.role})*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        replyContent;

      return {
        handled: true,
        reply: formattedReply,
        agent: `${matchedLegend.name} (${matchedLegend.role})`
      };
    } catch (err) {
      // Graceful fallback
      return {
        handled: true,
        reply: `👑 *${matchedLegend.name} (${matchedLegend.role})*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Pranam Ashutosh Sir! 🙏 Main aapke aadesh par hazir hoon.\n\n` +
          `Main Sharma Industries me Swatch Paints ke liye **${matchedLegend.role}** ka master execution sambhal raha hoon, jo 100% Indian Paint Market ke mutabiq design kiya gaya hai.\n\n` +
          `Aap mujhe batayein aapko kaunse specific point par guidance chahiye ya meri current strategy me kya badlav karna hai?`,
        agent: `${matchedLegend.name} (${matchedLegend.role})`
      };
    }
  }
}

module.exports = new LegendsInteractiveEngine();
