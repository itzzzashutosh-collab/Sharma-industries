"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Landmark, ArrowLeft, CheckCircle, Printer, Share2, Ban, Edit3, Copy } from "lucide-react";
import Link from "next/link";
import { SettlementModal } from "./SettlementModal";
import { useRouter } from "next/navigation";
import { cancelInvoice } from "./actions";

export function InvoiceDetailView({ invoice }: { invoice: any }) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const isPaid = invoice.balance_due <= 0;
  const isCancelled = invoice.status === "Cancelled";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      if (invoice.pdf_url) {
        window.open(invoice.pdf_url, "_blank");
      } else {
        window.print();
      }
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoice_no}`,
          text: `Invoice details for ${invoice.invoice_no}`,
          url: url,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Invoice link copied to clipboard!");
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this invoice? This cannot be undone.")) {
      const res = await cancelInvoice(invoice.id);
      if (res.success) {
        alert("Invoice cancelled successfully!");
        router.refresh();
      } else {
        alert(res.error || "Failed to cancel invoice.");
      }
    }
  };

  const handleGeneratePDF = async () => {
    if (invoice.pdf_url) {
      const link = document.createElement("a");
      link.href = invoice.pdf_url;
      link.target = "_blank";
      link.download = `${invoice.invoice_no}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

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
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/dashboard/ceo/invoices/new?edit_id=${invoice.id}`}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Edit3 size={14} /> Edit
          </Link>
          <Link
            href={`/dashboard/ceo/invoices/new?duplicate_id=${invoice.id}`}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Copy size={14} /> Duplicate
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Printer size={14} /> Print
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-1.5 bg-secondary hover:opacity-95 text-secondary-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Download size={14} /> PDF
          </button>

          {isCancelled ? (
            <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3.5 py-2 rounded-xl font-bold text-xs">
              <Ban size={14} /> Cancelled
            </div>
          ) : (
            <>
              {!isPaid && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-3.5 py-2 rounded-xl font-bold transition-all text-xs"
                >
                  <Ban size={14} /> Cancel
                </button>
              )}
              {!isPaid ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold transition-all text-xs shadow-xs animate-pulse"
                >
                  <Landmark size={14} /> Mark Paid
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-650 border border-emerald-500/20 px-3.5 py-2 rounded-xl font-bold text-xs">
                  <CheckCircle size={14} /> Fully Paid
                </div>
              )}
            </>
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
              <p className="text-slate-500 font-medium" suppressHydrationWarning>Date: {isMounted ? new Date(invoice.date).toLocaleDateString() : invoice.date}</p>
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
              {Array.isArray(invoice.additional_charges) && invoice.additional_charges.map((charge: any, idx: number) => (
                <tr key={`charge-${idx}`} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-800 font-bold">{charge.name || "Charge"}</td>
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                  <td className="py-3 px-4 text-right text-slate-400">-</td>
                  <td className="py-3 px-4 text-right text-slate-800">₹{charge.amount}</td>
                  <td className="py-3 px-4 text-right text-slate-800">₹{charge.amount}</td>
                  <td className="py-3 px-4 text-right text-slate-800 font-bold">₹{charge.amount}</td>
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
