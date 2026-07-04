"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Landmark, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { SettlementModal } from "./SettlementModal";
import { useRouter } from "next/navigation";

export function InvoiceDetailView({ invoice }: { invoice: any }) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const isPaid = invoice.balance_due <= 0;

  const handleGeneratePDF = async () => {
    if (!previewRef.current) return;
    try {
      const originalStyle = previewRef.current.style.transform;
      previewRef.current.style.transform = "none";
      
      const opt = {
        margin: 0,
        filename: `${invoice.invoice_no}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(previewRef.current).save();
      
      previewRef.current.style.transform = originalStyle;
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/ceo/invoices" className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={16} /> Back to History
        </Link>
        <div className="flex gap-3">
          <button onClick={handleGeneratePDF} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm">
            <Download size={18} /> Download PDF
          </button>
          {!isPaid ? (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm">
              <Landmark size={18} /> Mark as Paid
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-2 rounded-xl font-bold">
              <CheckCircle size={18} /> Fully Paid
            </div>
          )}
        </div>
      </div>

      {/* Invoice Preview (Read-only view) */}
      <div className="overflow-x-auto bg-card border border-border p-8 rounded-2xl shadow-sm">
        <div ref={previewRef} className="bg-white text-black p-10 min-h-[1123px] w-[794px] mx-auto shadow-md" style={{ transformOrigin: 'top center' }}>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">TAX INVOICE</h1>
              <p className="text-slate-500 font-medium mt-1">Invoice No: {invoice.invoice_no}</p>
              <p className="text-slate-500 font-medium">Date: {isMounted ? new Date(invoice.date).toLocaleDateString() : invoice.date}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-800">{invoice.seller}</h2>
              <p className="text-slate-600">GSTIN: {invoice.client_details?.gstin || "N/A"}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-bold text-slate-800 text-lg">{invoice.customer}</p>
              <p className="text-slate-600">{invoice.client_details?.address || "Address not provided"}</p>
              <p className="text-slate-600">GSTIN: {invoice.client_details?.gstin || "Unregistered"}</p>
            </div>
            <div className="text-right">
              {/* Optional Shipping info can go here */}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 text-left font-bold rounded-tl-lg">Item</th>
                <th className="py-3 px-4 text-right font-bold">HSN</th>
                <th className="py-3 px-4 text-right font-bold">Qty</th>
                <th className="py-3 px-4 text-right font-bold">Rate</th>
                <th className="py-3 px-4 text-right font-bold">Taxable</th>
                <th className="py-3 px-4 text-right font-bold rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-800 font-semibold">{item.name}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{item.hsn_code}</td>
                  <td className="py-3 px-4 text-right text-slate-800">{item.qty}</td>
                  <td className="py-3 px-4 text-right text-slate-800">₹{item.rate}</td>
                  <td className="py-3 px-4 text-right text-slate-800">₹{item.amount}</td>
                  <td className="py-3 px-4 text-right text-slate-800 font-bold">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/2">
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{invoice.subtotal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Total Tax (GST)</span>
                <span className="font-semibold text-slate-800">₹{invoice.total_gst}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-black text-slate-800 border-b-2 border-slate-800 mt-2">
                <span>Grand Total</span>
                <span>₹{invoice.grand_total}</span>
              </div>
              {invoice.balance_due < invoice.grand_total && (
                <div className="flex justify-between py-2 text-emerald-600 font-bold mt-2">
                  <span>Balance Due</span>
                  <span>₹{invoice.balance_due}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <SettlementModal 
          invoice={invoice} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            router.refresh();
          }} 
        />
      )}
    </div>
  );
}
