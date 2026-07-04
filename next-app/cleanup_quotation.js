const fs = require('fs');
const file = 'src/app/dashboard/ceo/quotations/new/QuotationEngine.tsx';
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

// 5. Remove Transport UI section (we can match the HTML comments)
content = content.replace(/\{\/\* Transport & Dispatch Section \*\/\}[\s\S]*?\{\/\* Advance Payment & Credit Terms \*\/}/g, '{/* Advance Payment & Credit Terms */}');
content = content.replace(/\{\/\* Advance Payment & Credit Terms \*\/\}[\s\S]*?\{\/\* Action Buttons \*\/}/g, '{/* Action Buttons */}');

// 6. Remove due date disable
content = content.replace(/disabled=\{paymentMode === "Credit"\}/g, '');

// 7. Remove advancePaid from balance calculation
content = content.replace(/grandTotal - advancePaid/g, 'grandTotal');

// 8. In templates, remove transport/payment blocks
// We will simply regex out the exact lines if possible, or just leave them as blank since removing exact TSX blocks via regex is tricky.
// Let's replace {transportMode} and {paymentMode} with 'N/A' or remove the table rows entirely.
content = content.replace(/<td[^>]*>[\s]*Transport:[\s]*<\/td>\s*<td[^>]*>[\s]*\{transportMode\}.*?<\/td>/g, '');
content = content.replace(/<td[^>]*>[\s]*Payment:[\s]*<\/td>\s*<td[^>]*>[\s]*\{paymentMode.*?\}.*?<\/td>/g, '');
content = content.replace(/<td[^>]*>[\s]*Advance Paid:[\s]*<\/td>\s*<td[^>]*>[\s]*.*?advancePaid.*?<\/td>/g, '');
content = content.replace(/<div[^>]*>[\s]*<span[^>]*>Transport Date<\/span>\s*<span[^>]*>.*?transportDate.*?<\/span>[\s]*<\/div>/g, '');
content = content.replace(/<div[^>]*>[\s]*<span[^>]*>Vehicle No<\/span>\s*<span[^>]*>.*?transportMode.*?<\/span>[\s]*<\/div>/g, '');
content = content.replace(/<div[^>]*>[\s]*<span[^>]*>Payment Terms<\/span>\s*<span[^>]*>.*?paymentMode.*?<\/span>[\s]*<\/div>/g, '');
content = content.replace(/<div[^>]*>[\s]*<span[^>]*>Advance Paid<\/span>\s*<span[^>]*>.*?advancePaid.*?<\/span>[\s]*<\/div>/g, '');

fs.writeFileSync(file, content);
console.log("Cleanup script completed!");
