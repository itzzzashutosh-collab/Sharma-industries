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
let blockOpenDivs = 0;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  if (line.includes('{/* Transport & Dispatch Section */}') || line.includes('{/* Advance Payment & Credit Terms */}')) {
    inTransportOrPaymentBlock = true;
    blockOpenDivs = 0;
  }
  
  if (inTransportOrPaymentBlock) {
    if (line.includes('<div')) {
        let matches = line.match(/<div/g);
        if(matches) blockOpenDivs += matches.length;
    }
    if (line.includes('</div')) {
        let matches = line.match(/<\/div/g);
        if(matches) blockOpenDivs -= matches.length;
    }
    
    // We expect the blocks to end when divs hit 0 and it's an end tag line, but they are siblings to each other.
    // Let's just remove the exact blocks based on known line numbers or content if we know it.
    // Instead of parsing, let's just use string replacement on the whole file using regex that balances divs? Too hard.
  }
}

// Just regex out the variables:
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Transport State
content = content.replace(/const \[transportMode.*?useState.*?\n/g, '');
content = content.replace(/const \[vehicleNo.*?useState.*?\n/g, '');
content = content.replace(/const \[transportDate.*?useState.*?\n/g, '');
content = content.replace(/const \[grrNo.*?useState.*?\n/g, '');

// 2. Remove Payment State
content = content.replace(/const \[advancePaid.*?useState.*?\n/g, '');
content = content.replace(/const \[paymentMode.*?useState.*?\n/g, '');
content = content.replace(/const \[creditDays.*?useState.*?\n/g, '');

// 3. Remove Due Date useEffect (lines 222-230ish)
content = content.replace(/useEffect\(\(\) => \{\s*if \(paymentMode === "Credit"[\s\S]*?\}, \[paymentMode, quotationDate, creditDays\]\);\n/g, '');

// 4. Remove payload fields in handleSave (lines 511-522ish)
content = content.replace(/transport_details: \{[\s\S]*?\},/g, '');
content = content.replace(/payment_terms: \{[\s\S]*?\},/g, '');

// 5. Remove due date disable
content = content.replace(/disabled=\{paymentMode === "Credit"\}/g, '');

// 6. Remove advancePaid from balance calculation
content = content.replace(/grandTotal - advancePaid/g, 'grandTotal');

// 7. Regex to remove Transport Section completely
// Transport section starts at {/* Transport & Dispatch Section */}
// and ends right before {/* Advance Payment & Credit Terms */}
content = content.replace(/\{\/\* Transport & Dispatch Section \*\/\}[\s\S]*?(?=\{\/\* Advance Payment & Credit Terms \*\/})/g, '');

// 8. Regex to remove Payment Terms Section completely
// Payment terms section starts at {/* Advance Payment & Credit Terms */}
// and ends right before {/* Action Buttons */}
content = content.replace(/\{\/\* Advance Payment & Credit Terms \*\/\}[\s\S]*?(?=\{\/\* Action Buttons \*\/})/g, '');

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
console.log("Cleanup script 3 completed!");
