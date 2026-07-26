"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import {
  QrCode, CreditCard, Plus, Search, Download, Copy, Check, X,
  IndianRupee, ShieldCheck, ArrowRight, Filter, RefreshCw,
  CheckCircle2, Clock, FileText, Building2, User, Phone, Sparkles
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getDealerUPIConfig,
  saveDealerUPIConfig,
  generateUPIPaymentURI,
  getUPIQRCodeURL,
} from "@/lib/upi";
import { recordCustomerPayment } from "./actions";

interface PaymentsClientProps {
  initialPayments: any[];
  initialInvoices: any[];
}

type ActiveTab = "upi-setup" | "collections" | "qr-generator";

export function PaymentsClient({ initialPayments = [], initialInvoices = [] }: PaymentsClientProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<ActiveTab>("upi-setup");

  // Dealer UPI Config state
  const [upiId, setUpiId] = useState("sharmadealer@upi");
  const [payeeName, setPayeeName] = useState("Sharma Paint Traders");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = useState("5010023456789");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Test QR generator state
  const [testAmount, setTestAmount] = useState<number>(500);
  const [testNote, setTestNote] = useState("Paint Bill Payment");

  // Data lists
  const [payments, setPayments] = useState<any[]>(initialPayments);
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);

  // Filters & search
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any | null>(null);
  const [recordForm, setRecordForm] = useState({
    customerName: "",
    customerPhone: "",
    invoiceId: "",
    invoiceNo: "",
    amount: 0,
    paymentMode: "UPI / QR",
    referenceNo: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ amount: number; invoiceNo: string; customerName: string } | null>(null);

  // Load UPI config on mount
  useEffect(() => {
    const config = getDealerUPIConfig();
    if (config.upiId) setUpiId(config.upiId);
    if (config.payeeName) setPayeeName(config.payeeName);
    if (config.bankName) setBankName(config.bankName);
    if (config.accountNumber) setAccountNumber(config.accountNumber);
    if (config.ifscCode) setIfscCode(config.ifscCode);
  }, []);

  // Save UPI Config
  const handleSaveUPIConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveDealerUPIConfig({
      upiId,
      payeeName,
      bankName,
      accountNumber,
      ifscCode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Copy UPI ID
  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // UPI URI & QR URL for test generator
  const currentUPIURI = useMemo(() => {
    return generateUPIPaymentURI(upiId, payeeName, testAmount, testNote);
  }, [upiId, payeeName, testAmount, testNote]);

  const currentQRURL = useMemo(() => {
    return getUPIQRCodeURL(currentUPIURI, 280);
  }, [currentUPIURI]);

  // Outstanding Dues & Totals
  const pendingInvoices = useMemo(() => {
    return invoices.filter((inv) => Number(inv.balance_due || inv.grand_total) > 0);
  }, [invoices]);

  const totalOutstandingDues = useMemo(() => {
    return pendingInvoices.reduce((s, i) => s + Number(i.balance_due || i.grand_total || 0), 0);
  }, [pendingInvoices]);

  const totalCollectionsMonth = useMemo(() => {
    return payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [payments]);

  const digitalCollections = useMemo(() => {
    return payments.filter((p) => p.payment_mode !== "Cash").reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [payments]);

  const cashCollections = useMemo(() => {
    return payments.filter((p) => p.payment_mode === "Cash").reduce((s, p) => s + Number(p.amount || 0), 0);
  }, [payments]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = !search || p.customer_name?.toLowerCase().includes(search.toLowerCase()) || p.receipt_no?.toLowerCase().includes(search.toLowerCase()) || p.invoice_no?.toLowerCase().includes(search.toLowerCase());
      const matchMode = modeFilter === "All" || p.payment_mode === modeFilter;
      return matchSearch && matchMode;
    });
  }, [payments, search, modeFilter]);

  // Handle Record Payment Submit
  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.amount || recordForm.amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    startTransition(async () => {
      const res = await recordCustomerPayment(recordForm);
      if (res.success) {
        setPayments([res.data, ...payments]);
        // Update local invoices list
        if (recordForm.invoiceId) {
          setInvoices((prev) =>
            prev.map((inv) => {
              if (inv.id === recordForm.invoiceId) {
                const currentDue = Number(inv.balance_due ?? inv.grand_total);
                const newDue = Math.max(0, currentDue - Number(recordForm.amount));
                return { ...inv, balance_due: newDue, payment_status: newDue <= 0 ? "Paid" : "Partial" };
              }
              return inv;
            })
          );
        }
        setShowRecordModal(false);
        setRecordForm({
          customerName: "",
          customerPhone: "",
          invoiceId: "",
          invoiceNo: "",
          amount: 0,
          paymentMode: "UPI / QR",
          referenceNo: "",
          notes: "",
          paymentDate: new Date().toISOString().split("T")[0],
        });
        alert(`Payment of ₹${recordForm.amount} recorded successfully!`);
      } else {
        alert(res.error || "Failed to record payment.");
      }
    });
  };

  const handleOpenQRForInvoice = (inv: any) => {
    const amount = Number(inv.balance_due || inv.grand_total);
    const custName = typeof inv.customer === "object" && inv.customer !== null ? inv.customer.name : inv.customer || "Customer";
    setQrModalData({ amount, invoiceNo: inv.invoice_no, customerName: custName });
    setShowQRModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ── Top Page Header ────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
            <QrCode size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground flex items-center gap-2">
              Dealer Payment Hub & UPI QR Setup
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure dealer UPI ID for invoice QR codes, collect customer settlements & track payments
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-muted p-1 rounded-xl border border-border gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("upi-setup")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "upi-setup" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode size={13} /> UPI ID & QR Setup
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "collections" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard size={13} /> Collections & Ledger ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("qr-generator")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "qr-generator" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IndianRupee size={13} /> Invoice QR Generator ({pendingInvoices.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: DEALER UPI ID & QR SETUP ───────────────────────────────── */}
      {activeTab === "upi-setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          {/* Left Column: Form Setup (7 Cols) */}
          <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 size={18} className="text-primary" /> Dealer Business & UPI Configuration
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set up your business UPI ID and bank details. This UPI ID will automatically populate on POS counter bills, A4 invoices, and payment QR codes!
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} /> Dealer UPI Configuration saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveUPIConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Dealer UPI ID (VPA) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. dealer.sharma@okicici, 9876543210@paytm"
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono font-bold outline-none focus:border-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="px-3.5 py-2.5 bg-muted text-foreground border border-border hover:bg-muted/80 rounded-xl font-bold flex items-center gap-1 transition-all"
                    >
                      {copiedUpi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      {copiedUpi ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Supported by Google Pay, PhonePe, Paytm, BHIM, Amazon Pay & All UPI Apps.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Business / Payee Display Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Ramesh Traders & Paint Depot"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-medium outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Bank Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="50100XXXXXXXX"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    IFSC Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="HDFC0001234"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono font-bold outline-none focus:border-primary uppercase"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Check size={16} /> Save & Apply Dealer Payment Settings
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Dynamic Test QR Code Preview (5 Cols) */}
          <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                LIVE PREVIEW
              </span>
              <h3 className="text-base font-black text-foreground">Dynamic UPI QR Code</h3>
              <p className="text-xs text-muted-foreground">Scan with Google Pay, PhonePe, Paytm or BHIM</p>
            </div>

            {/* QR Card */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 shadow-md text-center space-y-4 max-w-xs mx-auto">
              <div className="space-y-0.5">
                <h4 className="font-black text-sm text-slate-900">{payeeName || "Sharma Paint Traders"}</h4>
                <p className="text-[11px] font-mono font-bold text-slate-600">{upiId}</p>
              </div>

              {/* QR Image */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block">
                <img
                  src={currentQRURL}
                  alt="Dealer UPI Payment QR"
                  className="w-48 h-48 mx-auto object-contain rounded-md"
                />
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-black block">Test Amount</span>
                <span className="text-xl font-black text-slate-900">₹{testAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Test Controls */}
            <div className="space-y-2 text-xs pt-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase block">
                Test Amount Generator
              </label>
              <div className="flex gap-2">
                {[100, 500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTestAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      testAmount === amt ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Custom Test Amount"
                  className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-bold outline-none"
                />
                <a
                  href={currentQRURL}
                  target="_blank"
                  download="dealer-upi-qr.png"
                  className="px-3.5 py-1.5 bg-muted text-foreground border border-border hover:bg-muted/80 rounded-xl font-bold flex items-center gap-1 transition-all text-xs"
                >
                  <Download size={13} /> QR Image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COLLECTIONS & LEDGER TABLE ──────────────────────────────── */}
      {activeTab === "collections" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Summary Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">
                <IndianRupee size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Collections</span>
                <span className="text-lg font-black text-foreground">₹{totalCollectionsMonth.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Credit Outstanding Dues</span>
                <span className="text-lg font-black text-rose-600">₹{totalOutstandingDues.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                <QrCode size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">UPI / Digital Collections</span>
                <span className="text-lg font-black text-foreground">₹{digitalCollections.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 font-bold">
                <CreditCard size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Cash Collections</span>
                <span className="text-lg font-black text-foreground">₹{cashCollections.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Search & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search receipt no, customer name, invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {["All", "UPI / QR", "Cash", "Card", "Net Banking"].map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    modeFilter === m ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus size={14} /> Record Customer Payment
            </button>
          </div>

          {/* Payments Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border uppercase font-black text-[10px] text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Receipt Ref</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Invoice Ref</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{p.receipt_no || p.id}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.payment_date || p.created_at ? new Date(p.payment_date || p.created_at).toLocaleDateString("en-IN") : "-"}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{p.customer_name || "Walk-In Customer"}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{p.invoice_no || "-"}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{p.payment_mode || "Cash"}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">₹{Number(p.amount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {p.status || "Success"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                        No payments recorded yet. Click "Record Customer Payment" to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: UNPAID INVOICE QR GENERATOR ───────────────────────────── */}
      {activeTab === "qr-generator" && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-sm font-bold text-foreground">Pending Credit Bills & Instant QR Codes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select any pending customer invoice to open an instant UPI payment QR code with your configured dealer UPI ID ({upiId})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvoices.map((inv) => {
              const custName = typeof inv.customer === "object" && inv.customer !== null ? inv.customer.name : inv.customer || "Customer";
              const amount = Number(inv.balance_due || inv.grand_total);
              return (
                <div key={inv.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:border-primary/50 transition-all shadow-2xs group">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono font-bold text-xs text-primary">{inv.invoice_no}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Balance Due
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-sm leading-snug">{custName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Date: {inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "-"}</p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase block">Due Amount</span>
                      <span className="text-base font-black text-rose-600">₹{amount.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => handleOpenQRForInvoice(inv)}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <QrCode size={14} /> Open Payment QR
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingInvoices.length === 0 && (
              <div className="col-span-full text-center py-16 border border-dashed border-border rounded-2xl">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500/40 mb-2" />
                <p className="text-sm font-bold text-foreground">No Pending Credit Bills</p>
                <p className="text-xs text-muted-foreground mt-1">All customer invoices are fully settled!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Record Customer Payment Modal ──────────────────────────────────── */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <CreditCard size={18} className="text-primary" /> Record Customer Payment
              </h3>
              <button onClick={() => setShowRecordModal(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Select Pending Invoice (Optional)</label>
                <select
                  value={recordForm.invoiceId}
                  onChange={(e) => {
                    const invId = e.target.value;
                    const inv = pendingInvoices.find((i) => i.id === invId);
                    if (inv) {
                      const custName = typeof inv.customer === "object" && inv.customer !== null ? inv.customer.name : inv.customer || "";
                      setRecordForm({
                        ...recordForm,
                        invoiceId: inv.id,
                        invoiceNo: inv.invoice_no,
                        customerName: custName,
                        amount: Number(inv.balance_due || inv.grand_total),
                      });
                    } else {
                      setRecordForm({ ...recordForm, invoiceId: "", invoiceNo: "" });
                    }
                  }}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium outline-none"
                >
                  <option value="">-- Direct Customer Settlement (No specific invoice) --</option>
                  {pendingInvoices.map((i) => {
                    const name = typeof i.customer === "object" && i.customer !== null ? i.customer.name : i.customer || "Customer";
                    return (
                      <option key={i.id} value={i.id}>
                        {i.invoice_no} · {name} (Due: ₹{Number(i.balance_due || i.grand_total).toFixed(2)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Customer Name *</label>
                  <input
                    required
                    type="text"
                    value={recordForm.customerName}
                    onChange={(e) => setRecordForm({ ...recordForm, customerName: e.target.value })}
                    placeholder="Customer Name"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Amount Received (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={recordForm.amount || ""}
                    onChange={(e) => setRecordForm({ ...recordForm, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="₹0.00"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-black text-sm outline-none text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Payment Mode *</label>
                  <select
                    value={recordForm.paymentMode}
                    onChange={(e) => setRecordForm({ ...recordForm, paymentMode: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none"
                  >
                    {["UPI / QR", "Cash", "Card", "Net Banking", "Cheque"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Ref / UTR / Transaction No</label>
                  <input
                    type="text"
                    value={recordForm.referenceNo}
                    onChange={(e) => setRecordForm({ ...recordForm, referenceNo: e.target.value })}
                    placeholder="e.g. 409182749102"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="e.g. Final settlement for bill"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 size={16} /> Submit & Update Customer Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Invoice Payment QR Code Modal ───────────────────────────────────── */}
      {showQRModal && qrModalData && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <QrCode size={16} className="text-primary" /> Invoice Payment QR Code
              </h3>
              <button onClick={() => setShowQRModal(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>

            <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-300 shadow-md space-y-3">
              <div>
                <h4 className="font-black text-sm text-slate-900">{payeeName}</h4>
                <p className="text-[11px] font-mono font-bold text-slate-600">{upiId}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Invoice: {qrModalData.invoiceNo} · {qrModalData.customerName}</p>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 inline-block">
                <img
                  src={getUPIQRCodeURL(generateUPIPaymentURI(upiId, payeeName, qrModalData.amount, `Invoice ${qrModalData.invoiceNo}`), 260)}
                  alt="Invoice Payment QR"
                  className="w-48 h-48 mx-auto object-contain rounded-md"
                />
              </div>

              <div className="pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-black block">Balance Due</span>
                <span className="text-xl font-black text-slate-900">₹{qrModalData.amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generateUPIPaymentURI(upiId, payeeName, qrModalData.amount, `Invoice ${qrModalData.invoiceNo}`));
                alert("UPI Payment URI copied to clipboard!");
              }}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Copy size={14} /> Copy Payment UPI URI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
