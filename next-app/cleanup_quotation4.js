const fs = require('fs');
const file = 'src/app/dashboard/ceo/quotations/new/QuotationEngine.tsx';
let content = fs.readFileSync(file, 'utf8');

// Just remove the API payload usage so it compiles and doesn't break DB
content = content.replace(/transport_details: \{[\s\S]*?\},/g, '');
content = content.replace(/payment_terms: \{[\s\S]*?\},/g, '');
content = content.replace(/disabled=\{paymentMode === "Credit"\}/g, '');

// We can hide the UI blocks via CSS class hidden
content = content.replace(/\{\/\* Transport & Dispatch Section \*\/\}[\s\S]*?(?=\{\/\* Advance Payment & Credit Terms \*\/})/g, (match) => {
    return match.replace(/<div className="bg-card/g, '<div className="hidden bg-card');
});

content = content.replace(/\{\/\* Advance Payment & Credit Terms \*\/\}[\s\S]*?(?=\{\/\* Action Buttons \*\/})/g, (match) => {
    return match.replace(/<div className="bg-card/g, '<div className="hidden bg-card');
});

// For templates, we can just hide the specific TD elements
content = content.replace(/<td className="p-3 text-muted-foreground">[\s]*Transport:[\s]*<\/td>/g, '<td className="hidden">Transport:</td>');
content = content.replace(/<td className="p-3 font-semibold text-foreground">[\s]*\{transportMode\}.*?<\/td>/g, '<td className="hidden"></td>');
content = content.replace(/<td className="p-3 text-muted-foreground">[\s]*Payment:[\s]*<\/td>/g, '<td className="hidden">Payment:</td>');
content = content.replace(/<td className="p-3 font-semibold text-foreground">[\s]*\{paymentMode.*?<\/td>/g, '<td className="hidden"></td>');
content = content.replace(/<td className="p-3 text-muted-foreground">[\s]*Advance Paid:[\s]*<\/td>/g, '<td className="hidden">Advance Paid:</td>');
content = content.replace(/<td className="p-3 font-semibold text-foreground">[\s]*₹\{\(advancePaid \|\| 0\)\.toLocaleString\(\)\}[\s]*<\/td>/g, '<td className="hidden"></td>');

// Some other templates use flex div rows
content = content.replace(/<div className="flex justify-between items-center py-2 border-b border-border\/30">[\s]*<span className="text-muted-foreground">Transport Date<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between items-center py-2 border-b border-border\/30">[\s]*<span className="text-muted-foreground">Vehicle No<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between items-center py-2 border-b border-border\/30">[\s]*<span className="text-muted-foreground">Payment Terms<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between items-center py-2 border-b border-border\/30">[\s]*<span className="text-muted-foreground">Advance Paid<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between text-sm py-2 border-b border-border\/50">[\s]*<span className="text-muted-foreground">Payment Terms<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between text-sm py-2 border-b border-border\/50">[\s]*<span className="text-muted-foreground">Advance Paid<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between text-sm py-2 border-b border-border\/50">[\s]*<span className="text-muted-foreground">Transport Date<\/span>[\s\S]*?<\/div>/g, '');
content = content.replace(/<div className="flex justify-between text-sm py-2 border-b border-border\/50">[\s]*<span className="text-muted-foreground">Transport<\/span>[\s\S]*?<\/div>/g, '');

// Balance Due logic update
// It shows: {(grandTotal - advancePaid).toLocaleString(
content = content.replace(/grandTotal - advancePaid/g, 'grandTotal');

fs.writeFileSync(file, content);
console.log("Cleanup script 4 completed!");
