const fs = require("fs");
const path = require("path");

const base = "src/app/dashboard/dealer";

const pages = [
  // Purchase
  { dir: "purchase/bills", title: "Purchase Bills", key: "bills", action: "getDealerPurchaseBills" },
  { dir: "purchase/suppliers", title: "Suppliers Directory", key: "suppliers", action: "getDealerSuppliers" },
  { dir: "purchase/factory-orders", title: "Factory Orders Log", key: "orders", action: "getDealerFactoryOrders" },

  // Products
  { dir: "products/list", title: "Products Catalogue", key: "products", action: "getDealerProductsList" },
  { dir: "products/inventory", title: "Stock Levels", key: "inventory", action: "getDealerProductsList" },
  { dir: "products/stock-register", title: "Stock Register", key: "register", action: "getDealerProductsList" },
  { dir: "products/warehouse", title: "Warehouse Locations", key: "warehouse", action: "getDealerProductsList" },

  // Finance
  { dir: "finance/revenue", title: "Revenue Summary", key: "revenue", action: "getDealerInvoices" },
  { dir: "finance/expenses", title: "Business Expenses", key: "expenses", action: "getDealerInvoices" },
  { dir: "finance/pnl", title: "Estimated Profit & Loss", key: "pnl", action: "getDealerInvoices" },
  { dir: "finance/cash-flow", title: "Cash Flow Ledger", key: "cashflow", action: "getDealerInvoices" },
  { dir: "finance/payments", title: "Payment Registry", key: "payments", action: "getDealerInvoices" },

  // Painters
  { dir: "painters/list", title: "Painters Portfolio", key: "painters", action: "getDealerPainters" },
  { dir: "painters/coupons", title: "Coupons Auditing", key: "coupons", action: "getDealerCoupons" },
  { dir: "painters/schemes", title: "Loyalty Schemes", key: "schemes", action: "getDealerSchemes" },
  { dir: "painters/meetings", title: "Meetings Log", key: "meetings", action: "getDealerMeetings" },
  { dir: "painters/competitions", title: "Contests Board", key: "competitions", action: "getDealerCompetitions" },
  { dir: "painters/portfolio", title: "Work Portfolio Review", key: "portfolio", action: "getDealerPainters" },

  // Settings
  { dir: "settings/shop", title: "Shop Profile Settings", key: "profile", action: "getDealerShopProfile" },
  { dir: "settings/business", title: "Invoice Customizer", key: "business", action: "getDealerShopProfile" },
  { dir: "settings/app", title: "App Settings Preferences", key: "app", action: "getDealerShopProfile" }
];

async function run() {
  for (const p of pages) {
    const fullDir = path.join(base, p.dir);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }

    // Write Client Component
    const clientName = p.title.replace(/\s+/g, "") + "Client";
    const clientCode = `"use client";
import React, { useState } from "react";
import { ClipboardList, Download, Search, Sparkles } from "lucide-react";

export function ${clientName}({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const filtered = (initialData || []).filter(item => {
    return !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <span>Dealer Workspace</span><span className="opacity-40">/</span><span>${p.dir.split("/")[0]}</span><span className="opacity-40">/</span><span className="text-foreground">${p.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20"><ClipboardList size={20} className="text-primary" /></div>
            <div>
              <h1 className="text-xl font-black text-foreground">${p.title}</h1>
              <p className="text-xs text-muted-foreground">Live dealer registry tracking log</p>
            </div>
          </div>
          <button onClick={() => alert("Exporting data...")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={16} className="text-primary mt-0.5 shrink-0 animate-pulse" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">AI Insight:</span> Dynamic overview of active ${p.title.toLowerCase()} configurations.
        </div>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <Search size={13} className="text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter search results..." className="flex-1 bg-transparent text-xs text-foreground outline-none" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 text-xs text-muted-foreground">
        {filtered.length === 0 ? (
          <p className="text-center py-6">No matching records found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-3 border border-border/40 hover:bg-muted/10 rounded-xl flex items-center justify-between text-foreground font-semibold">
                <span>{item.name || item.title || item.invoice_no || item.id || "Record Entry"}</span>
                <span className="text-muted-foreground font-mono text-[10px]">{item.date || item.bill_date || item.created_at || "Active"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(path.join(fullDir, `${clientName}.tsx`), clientCode);

    // Write Page Wrapper
    const pageCode = `import type { Metadata } from "next";
import { ${clientName} } from "./${clientName}";
import { ${p.action} } from "../../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "${p.title} | Dealer Workspace" };
}

export default async function Page() {
  const res = await ${p.action}();
  const data = (res as any).list || ((res as any).data ? [(res as any).data] : []);
  return <${clientName} initialData={data} />;
}
`;
    fs.writeFileSync(path.join(fullDir, "page.tsx"), pageCode);
    console.log(`Generated page and client for ${p.title}`);
  }
  console.log("All views completed!");
}

run();
