const fs = require('fs');
const file = 'src/app/dashboard/ceo/quotations/new/QuotationEngine.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const varsToRemove = [
  'transportMode', 'setTransportMode', 'vehicleNo', 'setVehicleNo', 
  'transportDate', 'setTransportDate', 'paymentMode', 'setPaymentMode', 
  'advancePaid', 'setAdvancePaid', 'creditDays', 'setCreditDays'
];

let newLines = [];
let inTransportOrPaymentBlock = false;
let openDivs = 0;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  if (line.includes('{/* Transport & Dispatch Section */}')) {
    inTransportOrPaymentBlock = true;
    openDivs = 0;
  }
  
  if (inTransportOrPaymentBlock) {
    if (line.includes('<div')) openDivs += (line.match(/<div/g) || []).length;
    if (line.includes('</div')) openDivs -= (line.match(/<\/div/g) || []).length;
    
    // We expect the blocks to end before "Action Buttons"
    if (line.includes('{/* Action Buttons */}')) {
      inTransportOrPaymentBlock = false;
      newLines.push(line);
      continue;
    }
    
    // Skip all lines in this block
    continue;
  }

  // Remove lines that still reference the variables (e.g. in templates)
  let skip = false;
  for (const v of varsToRemove) {
    // If it's a template line displaying a removed variable, just skip the line or replace it.
    // For HTML/JSX tags like <td>{transportMode}</td>, if we skip it we might leave unclosed tags.
    // We will just do a string replacement for these instead of skipping the line.
  }

  if (!skip) {
    newLines.push(line);
  }
}

let content = newLines.join('\n');

// Now aggressively replace any remaining variables in the template output with empty string or 'N/A'
content = content.replace(/\{transportMode\}/g, '"N/A"');
content = content.replace(/\{vehicleNo(?: \|\| "N\/A")?\}/g, '"N/A"');
content = content.replace(/\{transportDate(?: \|\| "N\/A")?\}/g, '"N/A"');
content = content.replace(/\{paymentMode === "Credit"[\s\S]*?\}/g, '"N/A"');
content = content.replace(/\{paymentMode\}/g, '"N/A"');
content = content.replace(/\{creditDays\}/g, '0');
content = content.replace(/\{(?:advancePaid(?: \|\| 0)?)\}/g, '0');
content = content.replace(/advancePaid/g, '0'); // Any lingering advancePaid math like grandTotal - 0

// Also fix some specific syntax errors in the template strings
content = content.replace(/₹\{\(0\)\.toLocaleString\(\)\}/g, '₹0');
content = content.replace(/\{\(grandTotal - 0\)\.toLocaleString\(/g, '{(grandTotal).toLocaleString(');

fs.writeFileSync(file, content);
console.log("Cleanup script 2 completed!");
