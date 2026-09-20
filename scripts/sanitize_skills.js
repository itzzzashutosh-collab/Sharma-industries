const fs = require('fs');
const path = require('path');

const dirs = [
  'C:\\Users\\itzzz\\.hermes\\skills\\experts',
  path.join(process.env.LOCALAPPDATA, 'hermes', 'skills', 'experts')
];

dirs.forEach(baseDir => {
  const folders = fs.readdirSync(baseDir);
  folders.forEach(f => {
    const p = path.join(baseDir, f, 'SKILL.md');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      let updated = content
        .replace(/Strictly NEVER use the word ["']mandi["']\. Always use ["']Market["'], ["']B2B Market["'], or ["']Retail Trade Network["']\./gi, 'Always use positive trade terms: **"Market"**, **"B2B Market"**, or **"Retail Trade Network"**.')
        .replace(/Never uses? the word ["']mandi["']/gi, 'Strictly uses positive trade terminology ("Market" / "B2B Market")')
        .replace(/Strictly never mention ["']mandi["']/gi, 'Strictly uses positive trade terms ("Market" / "B2B Market")')
        .replace(/rural mandis/gi, 'rural B2B Markets')
        .replace(/\bmandi\b/gi, 'Market');
      if (updated !== content) {
        fs.writeFileSync(p, updated, 'utf8');
        console.log('Sanitized: ' + f + ' in ' + (baseDir.includes('.hermes') ? '.hermes' : 'LOCALAPPDATA'));
      }
    }
  });
});
console.log('Sanitization complete!');
