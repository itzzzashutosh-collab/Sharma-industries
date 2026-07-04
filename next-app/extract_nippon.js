const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\itzzz\\.gemini\\antigravity-ide\\brain\\1e492320-9765-4cb7-b8be-335ea3320027\\.system_generated\\steps\\2266\\content.md', 'utf8');

// Print first 1000 characters
console.log("=== FIRST 1000 CHARS ===");
console.log(content.substring(0, 1000));

// Check for markdown tables
console.log("\n=== CHECK TABLES ===");
const lines = content.split('\n');
let tableLines = 0;
lines.forEach((line, idx) => {
  if (line.includes('|')) {
    tableLines++;
    if (tableLines <= 30) {
      console.log(`${idx+1}: ${line}`);
    }
  }
});
console.log(`Total table lines: ${tableLines}`);
