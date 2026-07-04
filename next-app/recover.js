const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\itzzz\\.gemini\\antigravity-ide\\brain\\4dbb7985-f552-49ac-8b4d-5e7d15b8b038\\.system_generated\\logs\\transcript_full.jsonl', 'utf-8');
const lines = data.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    const content = obj.content || '';
    if (content.includes('Total Lines: 2122') && content.includes('InvoiceEngine.tsx') && content.includes('1: "use client";')) {
      const match = content.match(/(1: "use client";[\s\S]*)The above content/);
      if (match) {
        let clean = match[1].replace(/^[0-9]+: /gm, '');
        fs.writeFileSync('d:\\Sharma Industries\\next-app\\recovered.txt', clean, 'utf-8');
        console.log('Recovered!');
        process.exit(0);
      }
    }
  } catch(e) {}
}
console.log('Not found');
