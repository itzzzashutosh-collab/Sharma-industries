export interface SpecialistDetail {
  name: string;
  title: string;
  focus: string;
}

export interface DivisionKPI {
  label: string;
  value: string;
  sub: string;
  status: 'good' | 'warning' | 'neutral';
}

export interface DivisionConfig {
  id: string;
  name: string;
  shortName: string;
  lead: string;
  leadTitle: string;
  totalLegendsCount: number;
  specialists: string[];
  specialistDetails: SpecialistDetail[];
  themeColor: string;
  accentColor: string;
  floorColor: string;
  cabinPos: [number, number, number]; // [x, y, z] in 3D world
  boardroomSeatPos: [number, number, number]; // [x, y, z] in Boardroom
  cameraFocus: [number, number, number]; // [x, y, z] camera look target
  role: string;
  activeFocus: string;
  currentTask: string;
  currentTaskHindi: string;
  currentTaskProgress: number;
  taskStatus: string;
  recentActivity: string[];
  kpis: DivisionKPI[];
  kpiTitle: string;
  kpiValue: string;
  avatarSpecs: {
    suitColor: string;
    shirtColor: string;
    hairColor: string;
  };
  speechScript: string;
}

export interface FactoryZoneConfig {
  id: string;
  name: string;
  subtitle: string;
  pos: [number, number, number];
  personnel?: {
    name: string;
    phone: string;
    role: string;
    pos: [number, number, number];
    status: string;
  };
}

export const DIVISIONS: DivisionConfig[] = [
  {
    id: 'sales',
    name: 'Sales Division',
    shortName: 'SALES',
    lead: 'Brian Tracy',
    leadTitle: 'Chief Sales Officer (CSO)',
    totalLegendsCount: 18,
    specialists: [
      'Alex Hormozi',
      'Dan Kennedy',
      'Chris Voss',
      'Jordan Belfort',
      'Zig Ziglar',
      'John McMahon',
      'Neil Rackham',
      'Keenan',
      'Dale Carnegie',
      'Jeb Blount',
      'Joe Girard',
      'Jeremy Miner',
      'Grant Cardone',
      'Chet Holmes',
      'April Dunford',
      'Oren Klaff',
      'Victor Antonio'
    ],
    specialistDetails: [
      { name: 'Alex Hormozi', title: 'Pricing & Grand Slam Offers', focus: 'Swatch Rustic ₹690 dealer vs ₹1,150 MRP (40% margin structure) & Sonu Kumar ₹430 tier' },
      { name: 'Dan Kennedy', title: 'Direct-Response Mailers', focus: 'Hadoti contractor letter & dealer margin comparison proof sheets' },
      { name: 'Chris Voss', title: 'Tactical Empathy & Negotiation', focus: 'Negotiating volume tier contracts with Kota hardware counters' },
      { name: 'Jordan Belfort', title: 'Straight-Line Selling', focus: 'Field rep objection script for Asian Paints Apex & Berger comparisons' },
      { name: 'Zig Ziglar', title: 'Relationship Closing', focus: 'Building long-term imandari & Bundi dealer trust' },
      { name: 'John McMahon', title: 'MEDDPICC Qualification', focus: 'Enterprise dealer counter qualification & decision criteria lock' },
      { name: 'Neil Rackham', title: 'SPIN Project Selling', focus: 'High-ticket bulk supply for township & commercial builders' },
      { name: 'Keenan', title: 'Gap Selling', focus: 'Uncovering dealer capital lockup in tinting machines & slow-moving paints' },
      { name: 'Dale Carnegie', title: 'Human Relations', focus: 'Winning dealer friendships & painter contractor loyalty' },
      { name: 'Jeb Blount', title: 'Fanatical Prospecting', focus: 'Daily prospecting engine for 45 mixed hardware retail counters' },
      { name: 'Joe Girard', title: 'Payment Reminders & Debt Collections Maestro', focus: 'Guinness-record personalized 7-day payment follow-ups & respectful collections that eliminate bad debts while deepening dealer trust' },
      { name: 'Jeremy Miner', title: 'NEPQ Questioning', focus: 'Neuro-emotional objection handling without sales pressure' },
      { name: 'Grant Cardone', title: '10X Territory Scale', focus: 'Aggressive retail shelf-space domination across Rajasthan' },
      { name: 'Chet Holmes', title: 'Dream 100 Execution', focus: 'Pigheaded discipline targeting top 100 high-billing Hadoti dealers' },
      { name: 'April Dunford', title: 'Category Narrative & Counter Positioning', focus: 'Positioning Swatch Rustic directly against MNC brands as the high-margin, zero-tinting contractor choice' },
      { name: 'Oren Klaff', title: 'Pitch Anything & Frame Control', focus: 'High-stakes counter pitches, prize framing, and status elevation for Sharma Industries dealer meetings' },
      { name: 'Victor Antonio', title: 'B2B Sales Influence & Value Selling', focus: 'Mathematical value selling proving 5X faster dealer cash velocity and higher gross shelf ROI' }
    ],
    themeColor: '#f59e0b',
    accentColor: '#d97706',
    floorColor: '#fef3c7',
    cabinPos: [-28, 0, -18],
    boardroomSeatPos: [-4.5, 0, -1.8],
    cameraFocus: [-28, 2.5, -18],
    role: 'Wholesale Pricing, Dealer Counters & Counter Battlecards',
    activeFocus: 'Swatch Rustic ₹690 Dealer Price (40% margin vs MRP ₹1,150) & Sonu Kumar 200 bags/mo tier',
    currentTask: 'Drafting wholesale price ladder & counter battlecard for Sonu Kumar (200 bags/mo commitment at ₹430 floor price).',
    currentTaskHindi: 'सोनू कुमार के ₹430 थोक रेट व 200 बैग/माह कोटे का 18 लीजेंड्स द्वारा ट्रेड बैटलकार्ड तैयार कर रहे हैं।',
    currentTaskProgress: 88,
    taskStatus: '🟢 Active at Battlestation',
    recentActivity: [
      '16:35 - Joe Girard deployed automated 7-day payment reminder & collection sequence for Hadoti dealers',
      '16:22 - Locked Kota city counter tier at ₹690/bag (dealer net profit ₹460/bag vs MRP)',
      '15:40 - Issued objection playbook: "Quality Asian Paints se behtar, margin 15% zyada"',
      '14:15 - Verified ₹50 Painters Growth Token voucher packaging with plant'
    ],
    kpis: [
      { label: 'Dealer Margin', value: '40–45%', sub: '₹460 profit/bag', status: 'good' },
      { label: 'Salesman Quota', value: '₹2,00,000', sub: 'Per rep / month', status: 'good' },
      { label: 'Wholesale Floor', value: '₹430', sub: 'Sonu Kumar Tier', status: 'good' }
    ],
    kpiTitle: 'Monthly Quota',
    kpiValue: '₹2,00,000 / rep',
    avatarSpecs: {
      suitColor: '#1e293b',
      shirtColor: '#f59e0b',
      hairColor: '#334155'
    },
    speechScript: 'Sales Division (18 Legends): Bundi & Kota trade network ready hai. Swatch Rustic ₹690 par 40% gross dealer margin de raha hai, Oren Klaff frame pitch aur Victor Antonio B2B value selling active hai!'
  },
  {
    id: 'ops',
    name: 'Operations Division',
    shortName: 'OPERATIONS',
    lead: 'Taiichi Ohno',
    leadTitle: 'Chief Operating Officer (COO)',
    totalLegendsCount: 13,
    specialists: [
      'V. Krishnamurthy',
      'Eliyahu Goldratt',
      'Eiji Toyoda',
      'W. Edwards Deming',
      'Henry Ford',
      'Soichiro Honda',
      'Paul O\'Neill',
      'Fred Smith',
      'Verghese Kurien',
      'Brijmohan Munjal',
      'Frederick Taylor',
      'Tim Cook'
    ],
    specialistDetails: [
      { name: 'V. Krishnamurthy', title: 'Industrial Scale', focus: 'High-volume plant flow & zero equipment bottleneck' },
      { name: 'Eliyahu Goldratt', title: 'Theory of Constraints', focus: 'Quartz silo feed rate synchronization with bagging hopper' },
      { name: 'Eiji Toyoda', title: 'Total Quality & Kaizen', focus: 'Shahrukh bhai batch testing standards & zero-defect seal' },
      { name: 'W. Edwards Deming', title: 'Statistical Quality Control', focus: 'Continuous Plan-Do-Check-Act quality loop on batch viscosity' },
      { name: 'Henry Ford', title: 'Continuous Assembly Line', focus: 'High-speed automated bag movement & zero handling lag' },
      { name: 'Soichiro Honda', title: 'Resilient Engineering', focus: 'High-torque agitator motor reliability & zero downtime' },
      { name: 'Paul O\'Neill', title: 'Absolute Safety Culture', focus: 'Zero plant injury record, dust control & worker health standards' },
      { name: 'Fred Smith', title: 'Hub-and-Spoke Logistics', focus: 'Next-day Hadoti corridor dispatches & route optimization' },
      { name: 'Verghese Kurien', title: 'Raw Material Aggregation', focus: 'Co-operative procurement of high-grade quartz silica & binders' },
      { name: 'Brijmohan Munjal', title: 'Frugal Manufacturing', focus: 'Vendor relationship management & lean capital machinery utilization' },
      { name: 'Frederick Taylor', title: 'Scientific Management & Motion Studies', focus: 'Standardizing 25kg bag filling cycle, hopper feed rates & worker ergonomic efficiency' },
      { name: 'Tim Cook', title: 'Supply Chain & Inventory Velocity', focus: '7-day raw material inventory buffers, zero stockout dispatch, and same-day Hadoti deliveries' }
    ],
    themeColor: '#10b981',
    accentColor: '#059669',
    floorColor: '#d1fae5',
    cabinPos: [-28, 0, 4],
    boardroomSeatPos: [-4.5, 0, 1.8],
    cameraFocus: [-28, 2.5, 4],
    role: 'Plant Throughput, Kaizen & Batch Viscosity Flow',
    activeFocus: 'Zero-downtime quartz dispersion & 25kg automatic bagging cycle with Shahrukh bhai',
    currentTask: 'Supervising Swatch Rustic Batch #B26-09 viscosity stabilization (110 Krebs Units) and conveyor bagging cycle.',
    currentTaskHindi: 'शाहरुख भाई के साथ 13 लीजेंड्स द्वारा बैच #B26-09 की 110 KU विस्कोसिटी, 25kg लाइन व टिम कुक इन्वेंट्री फ्लो मॉनिटरिंग जारी है।',
    currentTaskProgress: 94,
    taskStatus: '🟢 Monitoring Plant Telemetry',
    recentActivity: [
      '16:18 - Automated bag drop rate synchronized to 25 bags / 10 minutes',
      '15:30 - Shahrukh bhai signed off batch #B26-09 viscosity report (110 KU nominal)',
      '14:00 - Scheduled preventive maintenance on Silo #1 quartz agitator shaft'
    ],
    kpis: [
      { label: 'Plant Throughput', value: '250 Bags/Day', sub: 'Single shift', status: 'good' },
      { label: 'Batch Viscosity', value: '110 KU', sub: 'Passed QA', status: 'good' },
      { label: 'Token Insertion', value: '100%', sub: '₹50 token verified', status: 'good' }
    ],
    kpiTitle: 'Daily Capacity',
    kpiValue: '250 Bags / Day',
    avatarSpecs: {
      suitColor: '#064e3b',
      shirtColor: '#10b981',
      hairColor: '#1e293b'
    },
    speechScript: 'Operations Division (13 Legends): Plant line continuous running me hai. Shahrukh bhai ne batch pass kar diya hai, Frederick Taylor motion sync aur Tim Cook supply flow 100% active hai!'
  },
  {
    id: 'finance',
    name: 'Finance Division',
    shortName: 'FINANCE',
    lead: 'Warren Buffett',
    leadTitle: 'Chief Financial Officer (CFO)',
    totalLegendsCount: 11,
    specialists: [
      'Charlie Munger',
      'Uday Kotak',
      'Saurabh Mukherjea',
      'Ram Charan',
      'Radhakishan Damani',
      'Aswath Damodaran',
      'Nani Palkhivala',
      'Chandrakant Sampat',
      'Rakesh Jhunjhunwala',
      'Nassim Taleb'
    ],
    specialistDetails: [
      { name: 'Charlie Munger', title: 'Inversion & Moat Economics', focus: 'Preventing margin decay, bad debt, and unsustainable credit terms' },
      { name: 'Uday Kotak', title: 'Working Capital Architecture', focus: '7-day dealer payment cycle & liquidity velocity' },
      { name: 'Saurabh Mukherjea', title: 'Consistent Capital Allocation', focus: 'Debt-free reinvestment into raw material inventory' },
      { name: 'Ram Charan', title: 'Execution Economics', focus: 'Real-time cash conversion & strict salesman loading ceiling' },
      { name: 'Radhakishan Damani', title: 'Value & Sourcing', focus: 'Lowest-cost raw materials sourcing & bulk purchase leverage' },
      { name: 'Aswath Damodaran', title: 'Valuation & Hurdle Science', focus: 'Intrinsic DCF modeling of product lines & hurdle margin tracking' },
      { name: 'Nani Palkhivala', title: 'Tax Compliance & CA Integrity', focus: 'Statutory GST audit trail, CA portal synchronization & legal moat' },
      { name: 'Chandrakant Sampat', title: 'India Value Investing & Zero Debt', focus: 'Debt-free compounding, high ROCE asset efficiency, and pure free cash flow protection' },
      { name: 'Rakesh Jhunjhunwala', title: 'Big Bull Growth Conviction', focus: 'Indian construction supercycle capitalization, bold capacity bets & economies of scale' },
      { name: 'Nassim Taleb', title: 'Antifragility & Black Swan Defense', focus: 'Stress-testing raw material supply shocks, 10-day liquidity buffer & dealer credit via negativa' }
    ],
    themeColor: '#3b82f6',
    accentColor: '#2563eb',
    floorColor: '#dbeafe',
    cabinPos: [-28, 0, 26],
    boardroomSeatPos: [-1.8, 0, 3.8],
    cameraFocus: [-28, 2.5, 26],
    role: 'Unit Economics, Cash Buffer & Ledger Reinvestment',
    activeFocus: 'Landed cost ₹635 vs Dealer ₹690 = ₹55 net company profit/bag with 2% CD buffer',
    currentTask: 'Validating unit economics cost-stacking: Factory ₹450 + Freight ₹30 + Sales ₹72 + ₹50 Token = ₹635 landed cost.',
    currentTaskHindi: '11 लीजेंड्स द्वारा यूनिट इकोनॉमिक्स व एंटीफ्रेजाइल रिस्क ऑडिट: बेस ₹450 + मालभाड़ा ₹30 + सेल्स ₹72 + ₹50 टोकन = ₹635 लैंडेड कॉस्ट।',
    currentTaskProgress: 100,
    taskStatus: '🟢 Financial Balance Verified',
    recentActivity: [
      '16:25 - Verified ₹55 net company profit / bag margin at ₹690 dealer price',
      '15:50 - Audited salesman loading buffer capped at ₹72.00 / bag (below ₹75 ceiling)',
      '14:40 - Synchronized Suresh Sir 10th-of-month fuel allowance ledger entry'
    ],
    kpis: [
      { label: 'Landed Cost', value: '₹635.00', sub: 'Per 25kg bag', status: 'good' },
      { label: 'Company Net', value: '₹55.00', sub: 'Per bag retained profit', status: 'good' },
      { label: 'Cash Buffer', value: '2% CD', sub: '₹13.00 reserve', status: 'good' }
    ],
    kpiTitle: 'Hurdle Margin',
    kpiValue: '≥ ₹100 / bag',
    avatarSpecs: {
      suitColor: '#172554',
      shirtColor: '#60a5fa',
      hairColor: '#e2e8f0'
    },
    speechScript: 'Finance Division (11 Legends): Unit economics fully stacked. Factory base ₹450 + Freight ₹30 + Salesman ₹72 + ₹50 Token = ₹635 Landed. Chandrakant Sampat zero-debt rule aur Nassim Taleb risk shield active!'
  },
  {
    id: 'vision',
    name: 'Vision & Strategy Division',
    shortName: 'VISION',
    lead: 'Elon Musk',
    leadTitle: 'Chief Visionary Officer (CVO) & First-Principles Architect',
    totalLegendsCount: 12,
    specialists: [
      'Mukesh Ambani',
      'Steve Jobs',
      'Dhirubhai Ambani',
      'Peter Drucker',
      'Andy Grove',
      'Ray Dalio',
      'Jim Collins',
      'Sam Walton',
      'Amancio Ortega',
      'C.K. Prahalad',
      'Simon Sinek'
    ],
    specialistDetails: [
      { name: 'Elon Musk', title: 'Chief Visionary & 10X Engineering', focus: 'First-principles manufacturing automation, solar-powered plant floor & scaling Sharma Industries 10X without legacy overhead' },
      { name: 'Mukesh Ambani', title: 'Mega-Scale & Digital Infrastructure', focus: 'Jio-style market penetration, statewide dealer network integration & high-volume raw material procurement' },
      { name: 'Steve Jobs', title: 'Product Obsession & Aesthetic Simplicity', focus: 'Crafting Swatch Rustic & Shine coatings into iconic, flawless products that painters and homeowners fall in love with' },
      { name: 'Dhirubhai Ambani', title: 'Grassroots Market Dominance', focus: 'Aggressive retail trade penetration, high dealer loyalty & making Swatch Paints a household name' },
      { name: 'Peter Drucker', title: 'Strategic Architecture & Governance', focus: 'Disciplined management by objectives, capital allocation principles & sustainable corporate growth' },
      { name: 'Andy Grove', title: 'Paranoid Execution & Inflection Points', focus: 'Outmaneuvering Asian Paints and Birla Opus through rapid tactical pivots and agile decision loops' },
      { name: 'Ray Dalio', title: 'System Principles & Economic Moats', focus: 'Radical truth, operational transparency & building anti-fragile financial reserves' },
      { name: 'Jim Collins', title: 'Flywheel Architecture', focus: 'High Quality → High Dealer Margin → Painter Tokens → Reorder Flywheel' },
      { name: 'Sam Walton', title: 'Semi-Urban Retail Ubiquity', focus: 'Dominating tier-2/3 hardware counters in Bundi, Kota & Hadoti trade corridors' },
      { name: 'Amancio Ortega', title: 'Ultra-Fast Supply Velocity', focus: 'Same-day factory dispatch for urgent dealer replenishment to eliminate stockouts' },
      { name: 'C.K. Prahalad', title: 'Bottom of the Pyramid Value', focus: 'Delivering luxury architectural finishes at honest middle-class prices' },
      { name: 'Simon Sinek', title: 'Start With Why & Infinite Game', focus: 'Inspiring company mission: championing the dignity, craft & profitability of independent retailers and skilled painters' }
    ],
    themeColor: '#6366f1',
    accentColor: '#4f46e5',
    floorColor: '#e0e7ff',
    cabinPos: [28, 0, -18],
    boardroomSeatPos: [1.8, 0, 3.8],
    cameraFocus: [28, 2.5, -18],
    role: 'Futuristic 10X Strategy, Pan-India Scale & Disruptive Innovation',
    activeFocus: 'Elon Musk, Mukesh Ambani & Steve Jobs: 10X Automation, Solar Plant, Jio-Scale Distribution & Flawless Product Simplicity',
    currentTask: 'Elon Musk, Mukesh Ambani aur Steve Jobs 10-year disruptive scaling roadmap design kar rahe hain: automated solar manufacturing line, zero tinting machine model, aur Pan-India digital dealer network.',
    currentTaskHindi: 'एलन मस्क, मुकेश अंबानी, स्टीव जॉब्स व धीरूभाई अंबानी द्वारा 10-वर्षीय विजनरी रोडमैप: 10X ऑटोमेशन, सोलर प्लांट और पैन-इंडिया विस्तार।',
    currentTaskProgress: 85,
    taskStatus: '🟢 Futuristic 10X Roadmap Active',
    recentActivity: [
      '16:40 - Elon Musk modeled 10X solar-powered automated bagging and mixing line for Bundi plant',
      '16:15 - Mukesh Ambani drafted Jio-style zero-friction digital ordering gateway for Hadoti dealers',
      '15:30 - Steve Jobs finalized zero-defect packaging aesthetic and tactile feel for Swatch 25kg bags',
      '14:00 - Dhirubhai Ambani & Peter Drucker mapped Rajasthan-to-Pan-India expansion corridor'
    ],
    kpis: [
      { label: 'Vision Horizon', value: '10-Year Moat', sub: 'Pan-India Scale', status: 'good' },
      { label: 'Plant Automation', value: '10X Solar Line', sub: 'First-Principles', status: 'good' },
      { label: 'Product Standard', value: 'Steve Jobs Grade', sub: 'Zero-Defect Touch', status: 'good' }
    ],
    kpiTitle: 'Futuristic Vision',
    kpiValue: 'Pan-India 10X Moat',
    avatarSpecs: {
      suitColor: '#1e1b4b',
      shirtColor: '#38bdf8',
      hairColor: '#334155'
    },
    speechScript: 'Vision Division (12 Legends): Elon Musk, Mukesh Ambani aur Steve Jobs lead kar rahe hain. Hum sirf aaj ka nahi, agle 10 saal ka soch rahe hain — 10X automated solar manufacturing, Jio-scale dealer network aur Simon Sinek purpose blueprint!'
  },
  {
    id: 'branding',
    name: 'Branding Division',
    shortName: 'BRANDING',
    lead: 'David Ogilvy',
    leadTitle: 'Chief Marketing Officer (CMO)',
    totalLegendsCount: 11,
    specialists: [
      'April Dunford',
      'Al Ries / Jack Trout',
      'Piyush Pandey',
      'Donald Miller',
      'Philip Kotler',
      'Marty Neumeier',
      'Rory Sutherland',
      'Seth Godin',
      'Rama Bijapurkar',
      'R. Balki'
    ],
    specialistDetails: [
      { name: 'April Dunford', title: 'Product Positioning', focus: '"High Performance Paints at Honest Prices with Better Dealer Margins"' },
      { name: 'Al Ries / Jack Trout', title: 'Category Ownership', focus: 'Owning the "Premium Exterior Texture with Zero Machine Cost" category' },
      { name: 'Piyush Pandey', title: 'Cultural Resonance', focus: '"Har Deewar Ka Pukka Vishwas" Hindi vernacular trust & local pride' },
      { name: 'Donald Miller', title: 'StoryBrand Clarity', focus: 'Painters as the Hero; Swatch Paints as the trusted expert guide' },
      { name: 'Philip Kotler', title: 'Marketing Management 4Ps', focus: 'Aligning Product, Price, Place, Promotion for Rajasthan trade network' },
      { name: 'Marty Neumeier', title: 'Brand Zag Differentiation', focus: 'When competitors push expensive tinting, Swatch zags with pre-mixed texture' },
      { name: 'Rory Sutherland', title: 'Perceptual Value Framing', focus: 'Framing Swatch texture as luxury stone finish at a fraction of cost' },
      { name: 'Seth Godin', title: 'Permission & Remarkability', focus: 'Creating "Purple Cow" 1ft x 1ft demo boards painters love to show clients' },
      { name: 'Rama Bijapurkar', title: 'Middle India Consumer Psychology', focus: '"Sasta Nahi, Tikau Chahiye" value architecture & dual decision-maker dynamics' },
      { name: 'R. Balki', title: 'Emotional Advertising & Cultural Storytelling', focus: 'Iconic Indian trade commercials, grounded Hindi narratives & memorable retailer dialogues alongside Piyush Pandey' }
    ],
    themeColor: '#ec4899',
    accentColor: '#db2777',
    floorColor: '#fce7f3',
    cabinPos: [28, 0, 4],
    boardroomSeatPos: [4.5, 0, 1.8],
    cameraFocus: [28, 2.5, 4],
    role: 'Brand Charter, Packaging Aesthetics & Positioning',
    activeFocus: '"Best Quality. Best Price." • "Har Deewar Ka Pukka Vishwas" • 5-Year Durability Assurance',
    currentTask: 'Inspecting primary 25kg bag packaging graphic typography and waterproof warranty seal aesthetics.',
    currentTaskHindi: '11 लीजेंड्स द्वारा 25kg बैग की प्रीमियम ग्राफिक पैकेजिंग, 5-वर्षीय सील व रमा बीजापुरकर इनसाइट्स का समन्वय।',
    currentTaskProgress: 92,
    taskStatus: '🟢 Design Reviewing',
    recentActivity: [
      '16:10 - Approved Swatch Primary Logo placement on high-contrast gloss finish bags',
      '15:20 - Verified painter token callout badge: "₹50 Token Inside"',
      '14:05 - Finalized dealer display mockups for 1ft x 1ft physical texture swatches'
    ],
    kpis: [
      { label: 'Warranty Seal', value: '5-Year Durability', sub: 'Lab-Assurance Tag', status: 'good' },
      { label: 'Tagline', value: 'Best Quality', sub: 'Best Price • Honest', status: 'good' },
      { label: 'Sample Boards', value: '1ft x 1ft', sub: 'Texture Swatch Board', status: 'good' }
    ],
    kpiTitle: 'Brand Trust',
    kpiValue: '5-Yr Durability',
    avatarSpecs: {
      suitColor: '#831843',
      shirtColor: '#f472b6',
      hairColor: '#334155'
    },
    speechScript: 'Branding Division (11 Legends): "Best Quality. Best Price." positioning market me standout kar rahi hai. Rama Bijapurkar middle-India insights aur R. Balki emotional stories ready hain!'
  },
  {
    id: 'social',
    name: 'Social Marketing Division',
    shortName: 'SOCIAL MKT',
    lead: 'Gary Vaynerchuk',
    leadTitle: 'Head of Social Media & Virality',
    totalLegendsCount: 11,
    specialists: [
      'Eugene Schwartz',
      'MrBeast',
      'Gary Halbert',
      'Robert Cialdini',
      'Russell Brunson',
      'Neil Patel',
      'Joe Sugarman',
      'Daniel Kahneman',
      'Brian Dean',
      'Seth Godin'
    ],
    specialistDetails: [
      { name: 'Eugene Schwartz', title: 'Awareness Stages', focus: 'Targeting Solution-Aware Hadoti contractors and hardware store owners' },
      { name: 'MrBeast', title: 'High-Retention Visuals', focus: 'Thumb-stopping water-jet scratch test videos on Swatch Rustic boards' },
      { name: 'Gary Halbert', title: 'Compelling Direct Copy', focus: 'Direct WhatsApp broadcast copy showing dealer margin comparisons' },
      { name: 'Robert Cialdini', title: 'Ethical Influence', focus: 'Local Bundi painter testimonials and live unboxing of the ₹50 token' },
      { name: 'Russell Brunson', title: 'Lead Funnels', focus: '1-tap WhatsApp lead generation to CEO-approved sales reps' },
      { name: 'Neil Patel', title: 'Local Search & Geofencing', focus: 'Google Maps & local SEO for Sharma Industries Bundi plant & dealer hubs' },
      { name: 'Joe Sugarman', title: 'Psychological Triggers', focus: 'Creating irresistible urge for painters to check bags for ₹50 tokens' },
      { name: 'Daniel Kahneman', title: 'Fast Behavioral Decision', focus: 'Optimizing instant counter visual cues for quick painter purchase decision' },
      { name: 'Brian Dean', title: 'Backlinko SEO & Skyscraper Authority', focus: 'Technical paint SEO, contractor search rankings, and regional "Near Me" organic inbound dominance' },
      { name: 'Seth Godin', title: 'Permission Funnels & Tribe Building', focus: 'Craftsman permission marketing, painter VIP WhatsApp community & Purple Cow attention loops' }
    ],
    themeColor: '#8b5cf6',
    accentColor: '#7c3aed',
    floorColor: '#ede9fe',
    cabinPos: [28, 0, 26],
    boardroomSeatPos: [4.5, 0, -1.8],
    cameraFocus: [28, 2.5, 26],
    role: 'WhatsApp Promos, Dealer Scheme Teasers & Virality',
    activeFocus: '1ft x 1ft Swatch demo boards video demonstrations & contractor loyalty outreach',
    currentTask: 'Generating weekly WhatsApp Status reels demonstrating Swatch Rustic water-repellent finish & painter token.',
    currentTaskHindi: '11 लीजेंड्स द्वारा यूट्यूब व व्हाट्सएप स्टेटस रील्स, ब्रायन डीन एसईओ व वॉटर-रेपेलेंट फिनिश के डेमो वीडियो तैयार हो रहे हैं।',
    currentTaskProgress: 82,
    taskStatus: '🟢 Video Editing & Campaigning',
    recentActivity: [
      '16:15 - Produced 15-second contractor demo clip for Kota dealer WhatsApp groups',
      '15:05 - Drafted 1-click CEO approval batch for tomorrow morning 08:00 AM status',
      '13:50 - Documented painter cash token unboxing reaction video framework'
    ],
    kpis: [
      { label: 'Weekly Content', value: '14 Reels', sub: 'Multi-platform ready', status: 'good' },
      { label: 'Approval Speed', value: '1-Click CEO', sub: 'Via WhatsApp & App', status: 'good' },
      { label: 'Contractor Reach', value: 'Hadoti Base', sub: 'Targeted Distribution', status: 'good' }
    ],
    kpiTitle: 'Social Footprint',
    kpiValue: 'Weekly Buzz',
    avatarSpecs: {
      suitColor: '#2e1065',
      shirtColor: '#c084fc',
      hairColor: '#1e293b'
    },
    speechScript: 'Social Marketing Division (11 Legends): YouTube, WhatsApp Status campaigns, Brian Dean SEO aur contractor demo videos ready hain. Dealers me buzz build ho raha hai!'
  },
  {
    id: 'hr',
    name: 'HR & Talent Division',
    shortName: 'HR & TALENT',
    lead: 'Jack Welch',
    leadTitle: 'Head of People & Performance Ops',
    totalLegendsCount: 10,
    specialists: [
      'Laszlo Bock',
      'Dave Ulrich',
      'Patrick Lencioni',
      'Mark Roberge',
      'Keith Ferrazzi',
      'Simon Sinek',
      'Harsh Mariwala',
      'Dr. T.V. Rao',
      'Dr. Udai Pareek'
    ],
    specialistDetails: [
      { name: 'Laszlo Bock', title: 'Structured Hiring', focus: 'AI WhatsApp interview desk scoring candidates (≥75 threshold)' },
      { name: 'Mark Roberge', title: 'Sales Force Science', focus: 'Enforcing ₹2,00,000 monthly rep billing quota + 2.5% incentive' },
      { name: 'Dave Ulrich', title: 'HR Architecture', focus: '1st-of-month automated salary ledger with factory product deductions' },
      { name: 'Patrick Lencioni', title: 'Team Health', focus: 'Plant floor harmony between chemists, warehouse staff and executives' },
      { name: 'Keith Ferrazzi', title: 'Relationship Architecture', focus: 'Contractor community loyalty meetings & painter fellowship dinners' },
      { name: 'Simon Sinek', title: 'Purpose & Mission', focus: 'Instilling company pride: "Building honest Indian infrastructure"' },
      { name: 'Harsh Mariwala', title: 'Culture of Empowerment', focus: 'Nurturing intrapreneurial spirit in on-ground field executives' },
      { name: 'Dr. T.V. Rao', title: 'Father of Indian HRD & Competency Science', focus: 'Integrated sales capability development, 360-degree coaching & role clarity for plant and field teams' },
      { name: 'Dr. Udai Pareek', title: 'Indian OB & OCTAPACE Culture', focus: 'Openness, Trust, Collaboration and high field sales morale across Hadoti territory' }
    ],
    themeColor: '#14b8a6',
    accentColor: '#0d9488',
    floorColor: '#ccfbf1',
    cabinPos: [0, 0, 32],
    boardroomSeatPos: [0, 0, -3.8],
    cameraFocus: [0, 2.5, 32],
    role: 'Sales Quota Engineering & Monthly 1st Payroll Ledger',
    activeFocus: 'Sales Execs (₹15k base + ₹3k TA/DA + 2.5% incentive > ₹2L) & automated staff deductions',
    currentTask: 'Compiling 1st-of-month employee payroll ledger & factory personal product purchase deductions.',
    currentTaskHindi: '10 लीजेंड्स द्वारा 1 तारीख के पेरोल लेजर, डॉ. टीवी राव सेल्स कॉम्पिटेंसी व डॉ. उदय पारीक OCTAPACE कल्चर का संचालन।',
    currentTaskProgress: 96,
    taskStatus: '🟢 Ledger Reconciled',
    recentActivity: [
      '16:20 - Audited Shahrukh bhai fixed flat salary record (₹24,000 / month, zero allowances)',
      '15:35 - Calculated Om Prakash Saini dispatch loading allowance (₹1.00 / bag handled)',
      '14:10 - Processed candidate screening for Hadoti field sales executive role (Score 82/100)'
    ],
    kpis: [
      { label: 'Payroll Date', value: '1st of Month', sub: 'Strict CEO schedule', status: 'good' },
      { label: 'Shahrukh Base', value: '₹24,000', sub: 'Senior Chemist Flat', status: 'good' },
      { label: 'Om Prakash Base', value: '₹12k + ₹1/bag', sub: 'Logistics Helper', status: 'good' }
    ],
    kpiTitle: 'Rep Quota Lock',
    kpiValue: '200 Bags / Mo',
    avatarSpecs: {
      suitColor: '#134e4a',
      shirtColor: '#5eead4',
      hairColor: '#334155'
    },
    speechScript: 'HR & Talent Division (10 Legends): 1st-of-month payroll ledger reconciled. Dr. T.V. Rao sales competency model aur Udai Pareek OCTAPACE culture field team me active hai!'
  }
];

export const PLANT_PILLARS = {
  chemistLab: {
    id: 'chemist-lab',
    name: 'QC & Formulation Lab',
    subtitle: 'Viscosity, Quartz Ratio & Weather-Proof Testing',
    pos: [14, 0, -30] as [number, number, number],
    personnel: {
      name: 'Shahrukh bhai',
      phone: '+91 7340090063',
      role: 'Human Senior Chemist',
      pos: [14, 0, -29] as [number, number, number],
      status: 'Batch Viscosity: 110 Krebs (Passed Quality Assurance)'
    }
  },
  baggingLine: {
    id: 'bagging-line',
    name: 'Swatch Rustic Bagging & Conveyor Line',
    subtitle: 'Automatic 25kg Packing & ₹50 Token Insertion Hopper',
    pos: [-14, 0, -30] as [number, number, number],
    status: '₹50 Painters Growth Tokens Loaded • Continuous Sealing Active'
  },
  warehouseDock: {
    id: 'warehouse-dock',
    name: 'Finished Goods Warehouse & Loading Dock',
    subtitle: 'Truck Dispatch & Sonu Kumar B2B Wholesale Counter',
    pos: [0, 0, -42] as [number, number, number],
    personnel: {
      name: 'Om Prakash Saini',
      phone: '+91 9571412351',
      role: 'Human Warehouse & Logistics Helper',
      pos: [-4, 0, -41] as [number, number, number],
      status: 'Loading Dispatch: 100 Rustic Bags (Truck RJ-08-GA-4412)'
    },
    distributor: {
      name: 'Sonu Kumar',
      phone: '+91 9057501926',
      role: 'Independent B2B Trade Distributor',
      pos: [4, 0, -41] as [number, number, number],
      status: 'Transfer Floor Rate: ₹430/bag (200 bags/month committed volume)'
    }
  },
  ceoSuite: {
    id: 'ceo-suite',
    name: 'Executive Command Suite',
    subtitle: 'Ashutosh Sharma (CEO) & Suresh Kumar Sharma (Founder)',
    pos: [0, 0, -10] as [number, number, number],
    role: 'Central AI Command & Financial CA Management'
  },
  boardroom: {
    id: 'boardroom',
    name: 'Central AI Boardroom',
    subtitle: '7-Division Round-Robin Executive Standup & Strategic Synthesis',
    pos: [0, 0, 6] as [number, number, number]
  }
};
