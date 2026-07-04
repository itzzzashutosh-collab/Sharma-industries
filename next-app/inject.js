const fs = require('fs');
let t = fs.readFileSync('src/app/dashboard/ceo/invoices/new/InvoiceEngine.tsx', 'utf-8');

const regex = /(<\/>\s*)\)}/g;
const replacement = `$1)}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}`;

t = t.replace(regex, replacement);

fs.writeFileSync('src/app/dashboard/ceo/invoices/new/InvoiceEngine.tsx', t);
