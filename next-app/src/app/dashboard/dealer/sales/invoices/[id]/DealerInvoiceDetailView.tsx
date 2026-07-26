"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Download, Landmark, ArrowLeft, CheckCircle, Printer, Share2, Ban, Copy,
  Plus, Building2, CreditCard, Sparkles, FileText, Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DealerSettlementModal } from "./DealerSettlementModal";
import { cancelDealerInvoice } from "./actions";
import { getDealerUPIConfig, generateUPIPaymentURI, getUPIQRCodeURL } from "@/lib/upi";

const SWATCH_PAINTS_LOGO_URL = "https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Swatchpaints.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1N3YXRjaHBhaW50cy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1MDQ5OTIyLCJleHAiOjMzMzIxMDQ5OTIyfQ.bnnDOZgHJLx_KMlknv0Wd6PnUb72JIZBiEp24TK5Vu8";

interface Props {
  invoice: any;
}

export function DealerInvoiceDetailView({ invoice }: Props) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Template Theme Selector State
  const [selectedTemplate, setSelectedTemplate] = useState<"thermal" | "classic" | "modern" | "brand">("classic");

  // Dealer UPI Config State
  const [dealerUPI, setDealerUPI] = useState({ upiId: "sharmadealer@upi", payeeName: "Shree Ram Paints & Hardware" });

  useEffect(() => {
    setIsMounted(true);
    const cfg = getDealerUPIConfig();
    if (cfg && cfg.payeeName) {
      setDealerUPI(cfg);
    }
  }, []);

  const isPaid = (invoice.balance_due ?? 0) <= 0 || invoice.status === "Paid";
  const isCancelled = invoice.status === "Cancelled";

  const shopTitle = dealerUPI.payeeName || "Shree Ram Paints & Hardware";

  const getCustomerName = () => {
    if (typeof invoice.customer === "object" && invoice.customer !== null) {
      return invoice.customer.name || "Retail Customer";
    }
    return invoice.customer || invoice.client_details?.name || "Retail Customer";
  };

  const getCustomerPhone = () => {
    if (typeof invoice.customer === "object" && invoice.customer !== null) {
      return invoice.customer.phone || invoice.client_details?.phone || "";
    }
    return invoice.client_details?.phone || "";
  };

  const getCustomerAddress = () => {
    return invoice.client_details?.address || "";
  };

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const grandTotal = Number(invoice.grand_total || 0);
  const subtotal = Number(invoice.subtotal || grandTotal / 1.18);
  const totalTax = Number(invoice.total_gst || (grandTotal - subtotal));

  // Print Handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Share Handler
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

  // Cancel Handler
  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this invoice? This cannot be undone.")) {
      const res = await cancelDealerInvoice(invoice.id);
      if (res.success) {
        alert("Invoice cancelled successfully!");
        router.refresh();
      } else {
        alert(res.error || "Failed to cancel invoice.");
      }
    }
  };

  // PDF Generator Handler
  const handleGeneratePDF = async () => {
    if (!previewRef.current) return;
    try {
      const originalStyle = previewRef.current.style.transform;
      previewRef.current.style.transform = "none";

      const opt = {
        margin: 0,
        filename: `Invoice_${invoice.invoice_no}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(previewRef.current).save();

      previewRef.current.style.transform = originalStyle;
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. You can also use the Print button to Save as PDF.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-16">
      {/* ── Top Header Navigation & Controls Bar ──────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/dealer/sales/invoices"
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground flex items-center gap-2">
              Invoice #{invoice.invoice_no}
            </h1>
            <p className="text-xs text-muted-foreground">
              Customer: <strong className="text-foreground">{getCustomerName()}</strong> · {invoice.date}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/dealer/sales/invoices"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white font-bold rounded-xl text-xs shadow-2xs hover:bg-primary/90 transition-all"
          >
            <Plus size={14} /> + New POS Bill
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border"
          >
            <Printer size={14} /> Print
          </button>

          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-1.5 bg-secondary hover:opacity-95 text-secondary-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border"
          >
            <Download size={14} /> PDF
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-xl font-bold transition-all text-xs border border-border"
          >
            <Share2 size={14} /> Share
          </button>

          {!isCancelled && !isPaid && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl font-bold transition-all text-xs shadow-2xs"
            >
              <Landmark size={14} /> Mark Paid
            </button>
          )}

          {isPaid && (
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold text-xs">
              <CheckCircle size={14} /> Fully Paid
            </span>
          )}
        </div>
      </div>

      {/* ── Template Theme Switcher Bar ───────────────────────────────────── */}
      <div className="bg-card border border-border p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-xs font-black text-foreground uppercase tracking-wider">Select Invoice Template Theme:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "thermal", name: "⚡ Thermal (80mm)" },
            { id: "classic", name: "🏛️ Classic GST (A4)" },
            { id: "modern", name: "✨ Modern Minimal" },
            { id: "brand", name: "🎨 Paint Brand Theme" },
          ].map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedTemplate === tpl.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live Interactive Invoice Preview Canvas ────────────────────────── */}
      <div className="bg-muted/40 p-4 rounded-3xl border border-border/60 overflow-x-auto shadow-inner flex justify-center">
        {/* Template 1: Thermal Slip 80mm */}
        {selectedTemplate === "thermal" && (
          <div id="print-content" className="relative overflow-hidden bg-white text-black p-5 rounded-2xl text-xs font-mono border border-slate-300 space-y-3 w-full max-w-sm shadow-md">
            {/* Big Swatch Paints Logo Image Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.10] select-none z-0">
              <img
                src={SWATCH_PAINTS_LOGO_URL}
                alt="Swatch Paints Watermark"
                className="w-48 h-48 object-contain transform -rotate-12"
              />
            </div>

            <div className="relative z-10 text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
              <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">{shopTitle}</h2>
              <p className="text-[10px] text-slate-600 font-sans">Authorized Swatch Paints Dealer · GSTIN: 08AABCU9603R1ZX</p>
              <p className="text-[10px] text-slate-600 font-sans">POS RECEIPT · #{invoice.invoice_no}</p>
              <p className="text-[10px] text-slate-500 font-sans">{invoice.date}</p>
            </div>

            <div className="relative z-10 text-[11px] border-b border-dashed border-slate-400 pb-2 space-y-0.5 font-sans">
              <p><strong>Customer:</strong> {getCustomerName()}</p>
              {getCustomerPhone() && <p><strong>Phone:</strong> {getCustomerPhone()}</p>}
              {getCustomerAddress() && <p><strong>Address:</strong> {getCustomerAddress()}</p>}
              <p><strong>Payment Mode:</strong> {invoice.payment_mode || "Cash"}</p>
            </div>

            <div className="relative z-10 space-y-1 py-1 border-b border-dashed border-slate-400">
              <div className="grid grid-cols-12 font-bold text-[10px] uppercase border-b border-slate-200 pb-1">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Amt</span>
              </div>
              {items.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 text-[10px] leading-snug">
                  <span className="col-span-6 font-semibold truncate">{item.name}</span>
                  <span className="col-span-2 text-center">{item.qty}</span>
                  <span className="col-span-4 text-right font-bold">₹{Number(item.amount || item.total || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10 space-y-0.5 pt-1 text-[11px] font-sans">
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>GST (18%):</span><span>₹{totalTax.toFixed(2)}</span></div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-800">
                <span>GRAND TOTAL:</span><span>₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            {/* Embedded Dealer UPI QR Code */}
            <div className="relative z-10 text-center pt-3 border-t border-dashed border-slate-400 space-y-1 font-sans">
              <span className="text-[10px] font-bold text-slate-700 block">Scan to Pay via UPI</span>
              <img
                src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, grandTotal, `Bill ${invoice.invoice_no}`), 140)}
                alt="Dealer UPI Payment QR"
                className="w-28 h-28 mx-auto object-contain bg-slate-50 p-1.5 rounded-lg border border-slate-200"
              />
              <p className="text-[10px] font-mono font-bold text-slate-800">{dealerUPI.upiId}</p>
              <p className="text-[9px] text-slate-500 pt-1">Thank you for your business! · Visit Again</p>
            </div>
          </div>
        )}

        {/* Template 2: Classic GST Tax Invoice (A4) */}
        {selectedTemplate === "classic" && (
          <div
            ref={previewRef}
            id="print-content"
            className="relative overflow-hidden bg-white text-slate-900 p-8 rounded-2xl text-xs font-sans border border-slate-300 space-y-5 w-[794px] min-h-[1050px] shadow-lg"
          >
            {/* Big Swatch Paints Logo Image Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.10] select-none z-0">
              <img
                src={SWATCH_PAINTS_LOGO_URL}
                alt="Swatch Paints Watermark"
                className="w-96 h-96 object-contain transform -rotate-12"
              />
            </div>

            <div className="relative z-10 flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{shopTitle}</h1>
                <p className="text-xs font-bold text-slate-700">Authorized Swatch Paints Dealer Outlet</p>
                <p className="text-[11px] text-slate-600">Bundi Road, Rajasthan · Phone: +91 98290 12345 · GSTIN: 08AABCU9603R1ZX</p>
              </div>
              <div className="text-right space-y-1">
                <span className="px-3.5 py-1 bg-slate-900 text-white font-black text-xs uppercase rounded-md tracking-wider">
                  TAX INVOICE
                </span>
                <p className="text-sm font-mono font-bold text-slate-900 pt-1">#{invoice.invoice_no}</p>
                <p className="text-[11px] text-slate-600">Date: {invoice.date}</p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Billed To (Customer):</span>
                <p className="font-black text-slate-900 text-sm">{getCustomerName()}</p>
                {getCustomerPhone() && <p className="text-slate-600">Phone: {getCustomerPhone()}</p>}
                {getCustomerAddress() && <p className="text-slate-600">Address: {getCustomerAddress()}</p>}
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Payment & Billing Info:</span>
                <p className="font-bold text-slate-900">Mode: {invoice.payment_mode || "Cash"}</p>
                <p className="text-slate-600">Status: <strong className="uppercase text-emerald-700">{invoice.status || "Paid"}</strong></p>
              </div>
            </div>

            <div className="relative z-10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                    <th className="p-2.5 pl-3">S.No</th>
                    <th className="p-2.5">Product Description</th>
                    <th className="p-2.5 text-center">HSN</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate (₹)</th>
                    <th className="p-2.5 text-right pr-3">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-300 font-medium text-slate-800">
                  {items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 pl-3 text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-2.5 text-center font-mono text-slate-600">{item.hsn_code || item.hsn || "3209"}</td>
                      <td className="p-2.5 text-center font-bold">{item.qty}</td>
                      <td className="p-2.5 text-right font-mono">₹{Number(item.rate || item.selling_price || 0).toFixed(2)}</td>
                      <td className="p-2.5 text-right pr-3 font-bold font-mono">₹{Number(item.amount || item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Embedded Dealer UPI QR Code */}
            <div className="relative z-10 grid grid-cols-12 gap-6 pt-4 border-t border-slate-300">
              <div className="col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <img
                  src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, grandTotal, `Bill ${invoice.invoice_no}`), 160)}
                  alt="Dealer UPI Payment QR"
                  className="w-28 h-28 object-contain bg-white p-1 rounded-lg border border-slate-300 shrink-0"
                />
                <div className="text-[11px] space-y-1">
                  <span className="font-black text-slate-900 text-xs block">Scan to Pay Dealer via UPI</span>
                  <p className="font-mono text-slate-800 font-bold">{dealerUPI.upiId}</p>
                  <p className="text-[10px] text-slate-500">Payee: {dealerUPI.payeeName}</p>
                  <p className="text-[10px] text-emerald-700 font-bold pt-1">Direct Bank Instant Settlement</p>
                </div>
              </div>

              <div className="col-span-5 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600"><span>Taxable Amount:</span><span className="font-mono font-bold">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>CGST (9%):</span><span className="font-mono font-bold">₹{(totalTax / 2).toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>SGST (9%):</span><span className="font-mono font-bold">₹{(totalTax / 2).toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Grand Total:</span><span className="font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template 3: Modern Minimal */}
        {selectedTemplate === "modern" && (
          <div
            ref={previewRef}
            id="print-content"
            className="relative overflow-hidden bg-slate-950 text-white p-8 rounded-2xl text-xs font-sans border border-slate-800 space-y-5 w-[794px] min-h-[1050px] shadow-lg"
          >
            {/* Big Swatch Paints Logo Image Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.12] select-none z-0">
              <img
                src={SWATCH_PAINTS_LOGO_URL}
                alt="Swatch Paints Watermark"
                className="w-96 h-96 object-contain transform -rotate-12 filter brightness-200"
              />
            </div>

            <div className="relative z-10 flex items-start justify-between border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-primary text-white font-black text-[10px] rounded uppercase tracking-wider">OFFICIAL POS INVOICE</span>
                <h1 className="text-2xl font-black text-white uppercase">{shopTitle}</h1>
                <p className="text-xs text-slate-400">Authorized Swatch Paints Dealer Outlet · GSTIN: 08AABCU9603R1ZX</p>
              </div>
              <div className="text-right">
                <p className="text-base font-mono font-black text-primary">#{invoice.invoice_no}</p>
                <p className="text-xs text-slate-400">Date: {invoice.date}</p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Customer</span>
                <p className="font-bold text-white text-sm">{getCustomerName()}</p>
                {getCustomerPhone() && <p className="text-slate-400">{getCustomerPhone()}</p>}
                {getCustomerAddress() && <p className="text-slate-400">{getCustomerAddress()}</p>}
              </div>
              <div className="text-right">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Payment Mode</span>
                <p className="font-bold text-emerald-400 text-sm">{invoice.payment_mode || "Cash"}</p>
              </div>
            </div>

            <div className="relative z-10 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right pr-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                  {items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-center font-bold">{item.qty}</td>
                      <td className="p-3 text-right pr-4 font-black font-mono text-white">₹{Number(item.amount || item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="relative z-10 grid grid-cols-12 gap-6 pt-4 border-t border-slate-800">
              <div className="col-span-7 bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <img
                  src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, grandTotal, `Bill ${invoice.invoice_no}`), 160)}
                  alt="Dealer UPI Payment QR"
                  className="w-28 h-28 object-contain bg-white p-1 rounded-lg border border-slate-700 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-xs font-black text-white block">Instant UPI Payment</span>
                  <p className="font-mono text-primary font-bold text-xs">{dealerUPI.upiId}</p>
                  <p className="text-[10px] text-slate-400">Scan using GPay, PhonePe, Paytm</p>
                </div>
              </div>

              <div className="col-span-5 space-y-1 text-right self-center">
                <span className="text-slate-400 text-xs uppercase font-bold block">Total Amount Due</span>
                <span className="text-3xl font-black text-primary font-mono block">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Template 4: Paint Brand Theme */}
        {selectedTemplate === "brand" && (
          <div
            ref={previewRef}
            id="print-content"
            className="relative overflow-hidden bg-gradient-to-br from-amber-500/5 via-primary/5 to-rose-500/5 text-slate-900 p-8 rounded-2xl text-xs font-sans border-2 border-primary/20 space-y-5 w-[794px] min-h-[1050px] shadow-lg"
          >
            {/* Big Swatch Paints Logo Image Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.10] select-none z-0">
              <img
                src={SWATCH_PAINTS_LOGO_URL}
                alt="Swatch Paints Watermark"
                className="w-96 h-96 object-contain transform -rotate-12"
              />
            </div>

            <div className="relative z-10 flex items-start justify-between border-b-2 border-primary/30 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <img src={SWATCH_PAINTS_LOGO_URL} alt="Swatch Paints Logo" className="w-9 h-9 object-contain" />
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{shopTitle}</h1>
                </div>
                <p className="text-xs font-bold text-primary">Authorized Swatch Paints Dealer</p>
              </div>
              <div className="text-right space-y-1">
                <span className="px-3.5 py-1 bg-primary text-white font-black text-xs uppercase rounded-full shadow-2xs">PAINT BILL</span>
                <p className="text-xs font-mono font-bold text-slate-900 pt-1">#{invoice.invoice_no}</p>
                <p className="text-[11px] text-slate-600">{invoice.date}</p>
              </div>
            </div>

            <div className="relative z-10 bg-white rounded-xl border border-primary/20 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-primary text-white font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-3 pl-4">Paint Product / Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right pr-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 pl-4 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 text-center font-bold">{item.qty}</td>
                      <td className="p-3 text-right pr-4 font-black font-mono text-primary">₹{Number(item.amount || item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="relative z-10 grid grid-cols-12 gap-6 pt-4 border-t-2 border-primary/20">
              <div className="col-span-7 bg-white p-4 rounded-xl border border-primary/20 flex items-center gap-4">
                <img
                  src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, grandTotal, `Bill ${invoice.invoice_no}`), 160)}
                  alt="Dealer UPI Payment QR"
                  className="w-28 h-28 object-contain bg-amber-50/50 p-1 rounded-lg border border-amber-200 shrink-0"
                />
                <div className="space-y-1 text-[11px]">
                  <span className="font-black text-slate-900 text-xs block">Scan to Pay Dealer</span>
                  <p className="font-mono text-primary font-bold">{dealerUPI.upiId}</p>
                  <p className="text-[10px] text-slate-500">Payee: {dealerUPI.payeeName}</p>
                </div>
              </div>

              <div className="col-span-5 space-y-1 text-right self-center">
                <span className="text-slate-500 text-xs font-bold block">NET AMOUNT PAID</span>
                <span className="text-3xl font-black text-primary font-mono block">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settlement Modal */}
      {showModal && (
        <DealerSettlementModal
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
