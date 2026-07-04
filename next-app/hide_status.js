const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/ceo/quotations/[id]/QuotationDetailView.tsx', 'utf8');

c = c.replace(/{!isPaid \? \([\s\S]*?\)\}/, '{/* Paid status hidden */}');
c = c.replace(/<div className="flex justify-between py-2 text-rose-500 font-bold mt-2">/g, '<div className="hidden flex justify-between py-2 text-rose-500 font-bold mt-2">');
c = c.replace(/<div className="flex justify-between py-2 text-emerald-600 font-bold mt-2">/g, '<div className="hidden flex justify-between py-2 text-emerald-600 font-bold mt-2">');

fs.writeFileSync('src/app/dashboard/ceo/quotations/[id]/QuotationDetailView.tsx', c);
