"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Landmark, ArrowLeft, CheckCircle, Printer, Share2, Ban, Edit3, Copy, FileCheck } from "lucide-react";
import Link from "next/link";
import { SettlementModal } from "./SettlementModal";
import { useRouter } from "next/navigation";
import { updateQuotationStatus } from "./actions";

export function QuotationDetailView({ quotation }: { quotation: any }) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState(quotation.status || "Pending");

  useEffect(() => setIsMounted(true), []);

  const isPaid = quotation.balance_due <= 0;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      if (quotation.pdf_url) {
        window.open(quotation.pdf_url, "_blank");
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
          title: `Quotation ${quotation.quotation_no}`,
          text: `Quotation details for ${quotation.quotation_no}`,
          url: url,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Quotation link copied to clipboard!");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    const res = await updateQuotationStatus(quotation.id, newStatus);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Failed to update status.");
    }
  };

  const handleGeneratePDF = async () => {
    if (quotation.pdf_url) {
      const link = document.createElement("a");
      link.href = quotation.pdf_url;
      link.target = "_blank";
      link.download = `${quotation.quotation_no}.pdf`;
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
        filename: `${quotation.quotation_no}.pdf`,
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
        <Link href="/dashboard/ceo/quotations" className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={16} /> Back to History
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/dashboard/ceo/quotations/new?edit_id=${quotation.id}`}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Edit3 size={14} /> Edit
          </Link>
          <Link
            href={`/dashboard/ceo/quotations/new?duplicate_id=${quotation.id}`}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
          >
            <Copy size={14} /> Duplicate
          </Link>
          <Link
            href={`/dashboard/ceo/invoices/new?convert_quotation_id=${quotation.id}`}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-2 rounded-xl font-bold transition-all text-xs shadow-xs"
          >
            <FileCheck size={14} /> Convert to Invoice
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

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-card text-foreground border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none focus:border-primary transition-all"
            >
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotation Preview (Read-only view) */}
      <div className="overflow-x-auto bg-card border border-border p-8 rounded-2xl shadow-sm">
        <div ref={previewRef} className="bg-white text-black p-10 min-h-[1123px] w-[794px] mx-auto shadow-md" style={{ transformOrigin: 'top center' }}>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">TAX QUOTATION</h1>
              <p className="text-slate-500 font-medium mt-1">Quotation No: {quotation.quotation_no}</p>
              <p className="text-slate-500 font-medium" suppressHydrationWarning>Date: {isMounted ? new Date(quotation.date).toLocaleDateString() : quotation.date}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-800">{quotation.seller}</h2>
              <p className="text-slate-600">GSTIN: {quotation.client_details?.gstin || "N/A"}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-bold text-slate-800 text-lg">{quotation.customer}</p>
              <p className="text-slate-600">{quotation.client_details?.address || "Address not provided"}</p>
              <p className="text-slate-600">GSTIN: {quotation.client_details?.gstin || "Unregistered"}</p>
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
              {quotation.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-800 font-semibold">{item.name}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{item.hsn_code}</td>
                  <td className="py-3 px-4 text-right text-slate-800">{item.qty}</td>
                  <td className="py-3 px-4 text-right text-slate-800">₹{item.rate}</td>
                  <td className="py-3 px-4 text-right text-slate-800">₹{item.amount}</td>
                  <td className="py-3 px-4 text-right text-slate-800 font-bold">₹{item.amount}</td>
                </tr>
              ))}
              {Array.isArray(quotation.additional_charges) && quotation.additional_charges.map((charge: any, idx: number) => (
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
                <span className="font-semibold text-slate-800">₹{quotation.subtotal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
                <span>Total Tax (GST)</span>
                <span className="font-semibold text-slate-800">₹{quotation.total_gst}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-black text-slate-800 border-b-2 border-slate-800 mt-2">
                <span>Grand Total</span>
                <span>₹{quotation.grand_total}</span>
              </div>
              {/* Balance due removed for quotations */}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <SettlementModal 
          quotation={quotation} 
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
