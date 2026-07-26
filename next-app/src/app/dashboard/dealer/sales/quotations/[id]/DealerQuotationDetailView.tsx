"use client";

import { useRef, useState, useEffect } from "react";
import { Download, ArrowLeft, Printer, Share2, Copy, FileCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateDealerQuotationStatus } from "./actions";

function numberToWords(num: number): string {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function g(n: number): string { if(n<20)return a[n]; const d=n%10; return b[Math.floor(n/10)]+(d?"-"+a[d]:""); }
  function h(n: number): string { if(n<100)return g(n); return a[Math.floor(n/100)]+" Hundred"+(n%100?" and "+g(n%100):""); }
  function convert(n: number): string { if(n===0)return"Zero"; const l=Math.floor(n/100000),t=Math.floor((n%100000)/1000),r=n%1000; let s=""; if(l>0)s+=h(l)+" Lakh "; if(t>0)s+=h(t)+" Thousand "; if(r>0)s+=h(r); return s.trim(); }
  const parts=Math.max(0,num).toFixed(2).split("."); const whole=parseInt(parts[0]); const dec=parseInt(parts[1]);
  return convert(whole)+(dec>0?" and "+convert(dec)+" Paise":"");
}

export function DealerQuotationDetailView({ quotation }: { quotation: any }) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState(quotation.status || "Draft");

  useEffect(() => setIsMounted(true), []);

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
    const res = await updateDealerQuotationStatus(quotation.id, newStatus);
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
      const opt = {
        margin: 0,
        filename: `${quotation.quotation_no}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(previewRef.current).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF.");
    }
  };

  const custName = typeof quotation.customer === 'object' && quotation.customer !== null 
    ? (quotation.customer.name || '') 
    : (typeof quotation.customer === 'string' ? quotation.customer : quotation.client_details?.name || '');

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const grandTotal = quotation.grand_total || 0;
  const subtotal = quotation.subtotal || 0;
  const totalTax = quotation.total_tax || quotation.tax_breakdown?.cgst ? ((quotation.tax_breakdown?.cgst || 0) + (quotation.tax_breakdown?.sgst || 0) + (quotation.tax_breakdown?.igst || 0)) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/dashboard/dealer/sales/quotations" className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors text-xs">
          <ArrowLeft size={16} /> Back to History
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/dashboard/dealer/sales/invoices/new?convert_quotation_id=${quotation.id}`}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold transition-all text-xs shadow-xs"
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
            className="flex items-center gap-1.5 bg-primary text-white hover:bg-primary/90 px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border shadow-xs"
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
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Converted">Converted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* A4 Preview Container */}
      <div className="overflow-x-auto bg-card border border-border p-8 rounded-2xl shadow-sm">
        <div ref={previewRef} className="bg-white text-black p-10 min-h-[1123px] w-[794px] mx-auto shadow-md">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">QUOTATION</h1>
              <p className="text-slate-500 font-medium mt-1">Quotation No: {quotation.quotation_no}</p>
              <p className="text-slate-500 font-medium" suppressHydrationWarning>
                Date: {isMounted && quotation.date ? new Date(quotation.date).toLocaleDateString("en-IN") : quotation.date}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-800">Sharma Industries</h2>
              <p className="text-slate-600">GSTIN: 08AABCU9603R1ZX</p>
              <p className="text-slate-500 text-sm">Bundi, Rajasthan</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quoted To</p>
              <p className="font-bold text-slate-800 text-lg">{custName || "Retail Customer"}</p>
              {quotation.client_details?.address && <p className="text-slate-600 text-sm">{quotation.client_details.address}</p>}
              {quotation.client_details?.gstin && <p className="text-slate-600 text-sm">GSTIN: {quotation.client_details.gstin}</p>}
              {quotation.client_details?.phone && <p className="text-slate-600 text-sm">📞 {quotation.client_details.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details</p>
              <p className="text-slate-700 font-semibold">Status: {status}</p>
              {quotation.client_type && <p className="text-xs text-slate-400 mt-1">Client Type: {quotation.client_type}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                <th className="py-3 px-3 text-left font-bold rounded-tl-lg">Item</th>
                <th className="py-3 px-2 text-left font-bold">Brand</th>
                <th className="py-3 px-2 text-right font-bold">HSN</th>
                <th className="py-3 px-2 text-right font-bold">Qty</th>
                <th className="py-3 px-2 text-right font-bold">Rate</th>
                <th className="py-3 px-2 text-right font-bold">Taxable</th>
                <th className="py-3 px-3 text-right font-bold rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const qty = item.qty || item.quantity || 1;
                const rate = item.rate || 0;
                const lineTotal = item.amount || item.total || qty * rate;
                return (
                  <tr key={idx} className="border-b border-slate-100 text-sm">
                    <td className="py-3 px-3 text-slate-800 font-semibold">{item.name}</td>
                    <td className="py-3 px-2 text-slate-500 text-xs">{item.brand || "—"}</td>
                    <td className="py-3 px-2 text-right text-slate-600 text-xs">{item.hsn_code || item.hsn || "3209"}</td>
                    <td className="py-3 px-2 text-right text-slate-800 font-semibold">{qty}</td>
                    <td className="py-3 px-2 text-right text-slate-800">₹{rate.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-2 text-right text-slate-800">₹{(item.taxableValue || lineTotal).toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-800 font-bold">₹{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pricing summary */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {totalTax > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm">
                  <span>GST</span>
                  <span className="font-semibold">₹{totalTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-lg font-black text-slate-800 border-b-2 border-slate-800 mt-2">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Amount in Words</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">Rupees {numberToWords(grandTotal)} Only</p>
          </div>

          {quotation.notes && (
            <div className="mt-4 p-4 border border-slate-200 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-600">{quotation.notes}</p>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center">
            <p>This is a quotation only. No payment is due until a formal invoice is issued.</p>
            <p className="mt-1">Sharma Industries · Bundi, Rajasthan · GSTIN: 08AABCU9603R1ZX</p>
          </div>
        </div>
      </div>
    </div>
  );
}
