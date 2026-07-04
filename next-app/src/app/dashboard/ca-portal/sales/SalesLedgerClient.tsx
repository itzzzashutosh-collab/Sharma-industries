"use client";

import React, { useState, useMemo } from "react";
import { Download, ChevronDown, ChevronUp, Search, Calendar as CalendarIcon, FileText, CheckCircle2 } from "lucide-react";

// --- TYPES ---
interface InvoiceItem {
  name: string;
  hsnCode: string;
  quantity: number;
  priceInclusive: number; // Single unit inclusive price
  taxRate: number; // e.g., 18
}

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dealerName: string;
  gstin: string;
  items: InvoiceItem[];
}

// --- MOCK DATA ---
const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-2026-001",
    invoiceNo: "SHARMA/26-27/001",
    date: "2026-07-01",
    dealerName: "Apex Buildmart Pvt Ltd",
    gstin: "27AADCA1234B1Z5",
    items: [
      { name: "Rustic Royale - 20L", hsnCode: "3209", quantity: 50, priceInclusive: 5000, taxRate: 18 },
      { name: "Wall Putty - 40kg", hsnCode: "3214", quantity: 100, priceInclusive: 850, taxRate: 18 },
    ]
  },
  {
    id: "INV-2026-002",
    invoiceNo: "SHARMA/26-27/002",
    date: "2026-07-03",
    dealerName: "Metro Hardware Traders",
    gstin: "27BBNPM5678C2Z1",
    items: [
      { name: "WeatherGuard Exterior - 10L", hsnCode: "3209", quantity: 30, priceInclusive: 3200, taxRate: 18 },
      { name: "Enamel Gloss - 1L", hsnCode: "3208", quantity: 150, priceInclusive: 350, taxRate: 18 },
    ]
  },
  {
    id: "INV-2026-003",
    invoiceNo: "SHARMA/26-27/003",
    date: "2026-07-04",
    dealerName: "Krishna Colors & Co",
    gstin: "27CKLPP9012D3Z4",
    items: [
      { name: "Interior Emulsion - 20L", hsnCode: "3209", quantity: 40, priceInclusive: 4100, taxRate: 18 },
    ]
  }
];

// --- REVERSE CALCULATION ENGINE ---
const calculateItemTaxes = (item: InvoiceItem) => {
  const totalInclusive = item.priceInclusive * item.quantity;
  const taxableBase = totalInclusive / (1 + (item.taxRate / 100));
  const gstAmount = totalInclusive - taxableBase;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  
  return {
    totalInclusive,
    taxableBase,
    gstAmount,
    cgst,
    sgst
  };
};

// Calculate Invoice Totals based on Reverse Engine
const calculateInvoiceTotals = (invoice: Invoice) => {
  let totalTaxable = 0;
  let totalGST = 0;
  let grandTotal = 0;

  invoice.items.forEach(item => {
    const calc = calculateItemTaxes(item);
    totalTaxable += calc.taxableBase;
    totalGST += calc.gstAmount;
    grandTotal += calc.totalInclusive;
  });

  return { totalTaxable, totalGST, grandTotal };
};

// --- COMPONENT ---
export default function SalesLedgerClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    return MOCK_INVOICES.filter(inv => 
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.gstin.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  // --- CSV EXPORT ENGINE (FLAT ITEMIZATION) ---
  const handleExportCSV = () => {
    const headers = [
      "Invoice No", "Date", "Dealer Name", "GSTIN", "Item Name", "HSN Code", 
      "Quantity", "Taxable Value", "CGST Amount", "SGST Amount", "IGST Amount", "Total Value"
    ];

    const rows = [];
    
    // Flat Loop: GSTR-1 / Tally requires itemized lines, not grouped invoices
    for (const inv of filteredInvoices) {
      for (const item of inv.items) {
        const calc = calculateItemTaxes(item);
        
        // Escape strings for CSV
        const rowData = [
          `"${inv.invoiceNo}"`,
          `"${inv.date.split("-").reverse().join("/")}"`,
          `"${inv.dealerName}"`,
          `"${inv.gstin}"`,
          `"${item.name}"`,
          `"${item.hsnCode}"`,
          item.quantity.toString(),
          calc.taxableBase.toFixed(2),
          calc.cgst.toFixed(2),
          calc.sgst.toFixed(2),
          "0.00", // Assuming intra-state for mockup
          calc.totalInclusive.toFixed(2)
        ];
        rows.push(rowData.join(","));
      }
    }

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GSTR1_Export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FileText className="text-emerald-500 w-8 h-8" />
            Sales Invoices Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Auditor Mode</span>
            Strict Read-Only compliance view. Reverse GST calculations applied.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Download size={18} />
            Export for Tally (CSV)
          </button>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Invoice No, Dealer, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Period:</span>
          <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option>Current Month</option>
            <option>Last Quarter</option>
            <option>Custom Range...</option>
          </select>
        </div>
      </div>

      {/* 3. Master Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 w-12"></th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs whitespace-nowrap">Invoice No</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs whitespace-nowrap">Date</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs whitespace-nowrap">Dealer Name</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs whitespace-nowrap">GSTIN</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right whitespace-nowrap">Taxable Value</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right whitespace-nowrap">Total GST</th>
                <th className="py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-xs text-right whitespace-nowrap">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No invoices found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isExpanded = expandedRowId === inv.id;
                  const totals = calculateInvoiceTotals(inv);
                  
                  return (
                    <React.Fragment key={inv.id}>
                      <tr className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${isExpanded ? 'bg-slate-50' : ''}`}>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : inv.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200/50"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-800 whitespace-nowrap">{inv.invoiceNo}</td>
                        <td className="py-4 px-6 font-medium text-slate-600 whitespace-nowrap">{inv.date.split("-").reverse().join("/")}</td>
                        <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">{inv.dealerName}</td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">{inv.gstin}</td>
                        <td className="py-4 px-6 font-mono text-right text-slate-700 font-semibold whitespace-nowrap">
                          {formatCurrency(totals.totalTaxable)}
                        </td>
                        <td className="py-4 px-6 font-mono text-right text-rose-600 font-bold whitespace-nowrap">
                          {formatCurrency(totals.totalGST)}
                        </td>
                        <td className="py-4 px-6 font-mono text-right text-slate-900 font-black whitespace-nowrap">
                          {formatCurrency(totals.grandTotal)}
                        </td>
                      </tr>

                      {/* Expandable Itemized Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={8} className="p-0 border-b border-slate-200">
                            <div className="p-6 pb-8 pl-20">
                              <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Itemized Audit Breakdown (Reverse Calculated)</h4>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-100/50 border-b border-slate-200">
                                    <tr className="text-slate-500 uppercase tracking-wider font-bold">
                                      <th className="py-3 px-4">Product Name</th>
                                      <th className="py-3 px-4 text-center">HSN</th>
                                      <th className="py-3 px-4 text-right">Qty</th>
                                      <th className="py-3 px-4 text-right">Unit Rate (Inc)</th>
                                      <th className="py-3 px-4 text-right bg-slate-100/50">Taxable Value</th>
                                      <th className="py-3 px-4 text-center">GST Rate</th>
                                      <th className="py-3 px-4 text-right bg-rose-50/30">Tax Amount</th>
                                      <th className="py-3 px-4 text-right font-black">Total (Inc)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {inv.items.map((item, idx) => {
                                      const calc = calculateItemTaxes(item);
                                      return (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0 font-medium text-slate-700 hover:bg-slate-50">
                                          <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                                          <td className="py-3 px-4 text-center font-mono text-slate-500">{item.hsnCode}</td>
                                          <td className="py-3 px-4 text-right font-mono">{item.quantity}</td>
                                          <td className="py-3 px-4 text-right font-mono">₹{item.priceInclusive.toLocaleString("en-IN")}</td>
                                          <td className="py-3 px-4 text-right font-mono font-semibold bg-slate-50/50 text-slate-800">
                                            ₹{calc.taxableBase.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                          <td className="py-3 px-4 text-center font-bold text-violet-600">{item.taxRate}%</td>
                                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 bg-rose-50/10">
                                            ₹{calc.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </td>
                                          <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                                            ₹{calc.totalInclusive.toLocaleString("en-IN")}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
