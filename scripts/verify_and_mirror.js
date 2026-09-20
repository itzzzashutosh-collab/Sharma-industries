const fs = require('fs');
const path = require('path');

const list = [
  'thomas-edison', 'w-edwards-deming', 'henry-ford', 'soichiro-honda', 'paul-oneill',
  'v-krishnamurthy', 'eiji-toyoda', 'radhakishan-damani', 'brijmohan-munjal', 'fred-smith',
  'verghese-kurien', 'harsh-mariwala', 'j-d-rockefeller', 'ram-charan', 'uday-kotak',
  'nani-palkhivala', 'herb-kelleher', 'chet-holmes', 'keith-ferrazzi', 'piyush-pandey',
  'ck-prahalad', 'rama-bijapurkar', 'mrbeast'
];

const srcDir = 'C:\\Users\\itzzz\\.hermes\\skills\\experts';
const destDir = path.join(process.env.LOCALAPPDATA, 'hermes', 'skills', 'experts');

console.log('--- VERIFYING AND MIRRORING TO LOCALAPPDATA ---');
let allGood = true;

list.forEach(legend => {
  const srcSkill = path.join(srcDir, legend, 'SKILL.md');
  const destLegendDir = path.join(destDir, legend);
  const destSkill = path.join(destLegendDir, 'SKILL.md');

  if (!fs.existsSync(srcSkill)) {
    console.error('MISSING in .hermes:', legend);
    allGood = false;
    return;
  }
  const size = fs.statSync(srcSkill).size;

  // Mirror to LOCALAPPDATA
  if (!fs.existsSync(destLegendDir)) {
    fs.mkdirSync(destLegendDir, { recursive: true });
  }
  fs.copyFileSync(srcSkill, destSkill);
  console.log('OK: ' + legend.padEnd(22) + ' (' + size + ' bytes) -> mirrored');
});

console.log('\nAll 23 skills successfully verified and mirrored: ' + allGood);

// Count total skills in both directories
const totalSrc = fs.readdirSync(srcDir).filter(f => fs.existsSync(path.join(srcDir, f, 'SKILL.md'))).length;
const totalDest = fs.readdirSync(destDir).filter(f => fs.existsSync(path.join(destDir, f, 'SKILL.md'))).length;
console.log('Total valid expert skills in C:\\Users\\itzzz\\.hermes: ' + totalSrc);
console.log('Total valid expert skills in LOCALAPPDATA: ' + totalDest);
