const fs = require('fs');
const path = require('path');

// Function to clean a file
function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Alex Hormozi files
  content = content.replace(/\* \*\*Factory Base Cost\*\*: ₹100\.00\/L \(20L = ₹2,000\.00\) \| \*\*MRP\*\*: ₹205\.00\/L \(20L = ₹4,100\.00\)/g,
    '* **Authorized Dealer Price**: ₹2,255.00–₹2,460.00 (20L) | **Retail MRP**: ₹4,100.00 (₹205.00/L) | **Dealer Profit**: ₹1,640–₹1,845 (40–45% Gross Margin)');
  content = content.replace(/\* \*\*Factory Base Cost\*\*: ₹130\.00\/L \| \*\*MRP\*\*: 1L = ₹360\.00, 5L = ₹1,800\.00/g,
    '* **Authorized Dealer Price**: 1L = ₹180.00–₹200.00, 5L = ₹900.00–₹1,000.00 | **Retail MRP**: 1L = ₹360.00, 5L = ₹1,800.00 | **Dealer Profit**: 40–45% Gross Margin');
  content = content.replace(/\* \*\*Factory Base Cost\*\*: ₹250\.00\/L \| \*\*MRP\*\*: 1L = ₹500\.00, 5L = ₹2,500\.00/g,
    '* **Authorized Dealer Price**: 1L = ₹320.00–₹350.00, 5L = ₹1,600.00–₹1,750.00 | **Retail MRP**: 1L = ₹500.00, 5L = ₹2,500.00 | **Dealer Profit**: 40% Gross Margin');
  content = content.replace(/\*Hormozi Calculation Note\*: Factory base cost is ₹450[\s\S]*?with hyper-velocity volume!/g,
    '*Hormozi Calculation Note*: Diamond Tier (₹620) delivers maximum volume velocity while strictly respecting official bulk dealer pricing tiers.');

  // 2. Victor Antonio ROI Selling
  content = content.replace(/- \*\*Factory Base Cost\*\*: ₹450\.00\r?\n- \*\*Landed Company Cost\*\*: ₹635\.00 \(Freight ₹30 \+ Rep Loading ₹72 \+ Painter Token ₹50 \+ Schemes ₹20 \+ 2% CD Buffer ₹13\)\r?\n- \*\*Standard Dealer Price\*\*: ₹690\.00 \(Net Company Profit = ₹55\.00\/bag; Hurdle \$\\ge ₹100\$ overall blended\)/g,
    '- **Standard Dealer Price**: ₹690.00 (Bulk 50+ Bags: ₹640–₹650.00)\n- **Retail MRP**: ₹1,150.00 (Homeowner 20% Off: ₹920.00)\n- **Dealer Net Cash Profit**: ₹460.00–₹517.50 per bag (40–45% Gross Margin)');
  content = content.replace(/- \*\*Factory Base Cost\*\*: ₹500\.00\r?\n- \*\*Standard Dealer Price\*\*: ₹632\.50–₹690\.00 \(40–45% Gross Margin\)\r?\n- \*\*Retail MRP\*\*: ₹1,150\.00\r?\n- \*\*Company Hurdle Rate\*\*: \$\\ge ₹132\/\\text\{bag\}\$ strictly enforced\./g,
    '- **Standard Dealer Price**: ₹632.50–₹690.00 (40–45% Gross Margin)\n- **Retail MRP**: ₹1,150.00\n- **Dealer Net Cash Profit**: ₹460.00–₹517.50 per bag');
  content = content.replace(/- \*\*Factory Base Cost\*\*: ₹2,000\.00 \(₹100\/L\)\r?\n- \*\*Standard Dealer Price\*\*: ₹2,255\.00–₹2,460\.00 \(20L\)\r?\n- \*\*Retail MRP\*\*: ₹4,100\.00\r?\n- \*\*Dealer Net Profit\*\*: ₹1,640\.00–₹1,845\.00 per 20L bucket \(40–45% Gross Margin\)/g,
    '- **Standard Dealer Price**: ₹2,255.00–₹2,460.00 (20L Bucket)\n- **Retail MRP**: ₹4,100.00\n- **Dealer Net Cash Profit**: ₹1,640.00–₹1,845.00 per 20L bucket (40–45% Gross Margin)');
  content = content.replace(/- \*\*Factory Base Cost\*\*: ₹650\.00 \(₹130\/L\)\r?\n- \*\*Standard Dealer Price\*\*: ₹900\.00–₹1,000\.00 \(5L\)\r?\n- \*\*Retail MRP\*\*: ₹1,800\.00\r?\n- \*\*Dealer Net Profit\*\*: ₹800\.00–₹900\.00 per 5L can \(45% Gross Margin\)/g,
    '- **Standard Dealer Price**: ₹900.00–₹1,000.00 (5L Can)\n- **Retail MRP**: ₹1,800.00\n- **Dealer Net Cash Profit**: ₹800.00–₹900.00 per 5L can (45% Gross Margin)');
  content = content.replace(/4\. \*\*Hurdle Rate Defense\*\*: Company net profit must strictly never drop below ₹100\/bag for Swatch Rustic or ₹132\/bag for Swatch Roller Coat\./g,
    '4. **Price Slab Defense**: Sales reps must strictly defend authorized dealer pricing tiers (₹632.50–₹690 for Rustic & Roller Coat). Never quote below official dealer purchase tiers.');

  // 3. Chet Holmes Dream 100
  content = content.replace(/4\. \*\*Hurdle Net Profit per Unit\*\*:[\s\S]*?- Swatch Roller Coat: \$\\ge ₹132\/\\text\{bag\}\$/g,
    '4. **Official Dealer Pricing Slabs & Margins**:\n   - Swatch Rustic: Dealer ₹632.50–₹690 | Retail MRP ₹1,150 (40–45% Dealer Margin)\n   - Swatch Roller Coat: Dealer ₹632.50–₹690 | Retail MRP ₹1,150 (40–45% Dealer Margin)');
  content = content.replace(/- ❌ \*\*Never discount below the company hurdle rate\*\* \(\$\\ge ₹100\/\\text\{bag\}\$ net profit\)\./g,
    '- ❌ **Never discount below authorized dealer price slabs**.');

  // 4. Grant Cardone 10X
  content = content.replace(/- ❌ \*\*NEVER compromise the company hurdle rate\*\* \(\$\\ge ₹100\/\\text\{bag\}\$ net profit on Rustic, \$\\ge ₹132\$ on Roller Coat\)\./g,
    '- ❌ **NEVER discount below authorized dealer billing tiers**.');

  // 5. Chris Voss
  content = content.replace(/Never discount to close a deal\. Protect company hurdle rate \$\\ge ₹100\/\\text\{bag\}\$\./g,
    'Never discount to close a deal. Strictly defend authorized dealer pricing slabs and dealer 40–45% margins.');
  content = content.replace(/without compromising pricing hurdles or company margins/g,
    'without compromising authorized dealer price slabs or retail margins');

  // 6. Generic confidentiality re-phrase
  content = content.replace(/Factory base costs and internal margins are strictly confidential executive secrets\./g,
    'Internal manufacturing economics and profit margins are strictly confidential executive secrets (CEO & CFO only).');
  content = content.replace(/Factory base costs and company internal margins are strictly confidential executive secrets\./g,
    'Internal manufacturing economics and profit margins are strictly confidential executive secrets (CEO & CFO only).');
  content = content.replace(/Factory manufacturing base costs and internal margins are strictly confidential executive secrets\./g,
    'Internal manufacturing economics and profit margins are strictly confidential executive secrets (CEO & CFO only).');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned file:', filePath);
  }
}

// Walk directories
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git') {
        walk(full);
      }
    } else if (item.name.endsWith('.md')) {
      cleanFile(full);
    }
  }
}

console.log('Cleaning sales and marketing skills...');
walk('.hermes/skills');
walk('C:/Users/itzzz/.hermes/skills/experts');
walk('marketing-team');
walk('data');
console.log('Done cleaning sales and marketing skills!');
