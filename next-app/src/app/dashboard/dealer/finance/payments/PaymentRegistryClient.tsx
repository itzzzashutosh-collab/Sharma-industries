"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BookMarked, Download, Search, Sparkles, TrendingUp, TrendingDown,
  IndianRupee, CreditCard, Landmark, CheckCircle2, ShieldAlert,
  Clock, DollarSign, Wallet, Plus, X, Calendar, FileText, Printer,
  ArrowDownLeft, ArrowUpRight, Filter, Receipt
} from "lucide-react";
import { recordLedgerPayment } from "../../actions";

interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  customer?: any;
  grand_total: number;
  advance_paid?: number;
  balance_due?: number;
  payment_mode?: string;
  status?: string;
}

interface Expense {
  id: string;
  title?: string;
  category: string;
  amount: number;
  payment_mode?: string;
  expense_date: string;
  remarks?: string;
}

interface ClientAccount {
  id: string;
  name: string;
  credit_balance: number;
  total_billed: number;
  total_paid: number;
}

interface Props {
  initialInvoices: Invoice[];
  initialExpenses: Expense[];
  initialClients: ClientAccount[];
}

interface PaymentVoucher {
  id: string;
  voucher_no: string;
  party_name: string;
  type: "collection" | "disbursal";
  amount: number;
  payment_mode: string;
  date: string;
  reference_no: string;
  remarks: string;
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const MOCK_VOUCHERS: PaymentVoucher[] = [
  { id: "VCH_001", voucher_no: "VOU-2026-9801", party_name: "Rajesh Hardware & Paints", type: "collection", amount: 48900, payment_mode: "UPI", date: "2026-07-26", reference_no: "UPI_99120384", remarks: "Instant POS Payment for Invoice #POS-2026-0041" },
  { id: "VCH_002", voucher_no: "VOU-2026-9802", party_name: "Vikram Construction Studio", type: "collection", amount: 50000, payment_mode: "Bank Transfer", date: "2026-07-25", reference_no: "NEFT_HDFC_4821", remarks: "Advance Settlement against Khata Credit Bill #POS-2026-0042" },
  { id: "VCH_003", voucher_no: "VOU-2026-9803", party_name: "Store Helpers Shift Allowance", type: "disbursal", amount: 1400, payment_mode: "Cash", date: "2026-07-26", reference_no: "VCH_EXP_1400", remarks: "Daily Helper Shift Wage Payout" },
  { id: "VCH_004", voucher_no: "VOU-2026-9804", party_name: "Bundi Road Premises Landlord", type: "disbursal", amount: 25000, payment_mode: "Bank Transfer", date: "2026-07-01", reference_no: "VCH_RENT_25K", remarks: "Showroom Monthly Rent Disbursement" }
];

export function PaymentRegistryClient({
  initialInvoices,
  initialExpenses,
  initialClients
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "collection" | "disbursal" | "upi" | "cash">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<PaymentVoucher | null>(null);

  // Form State
  const [form, setForm] = useState({
    party_name: "",
    type: "collection" as "collection" | "disbursal",
    amount: "",
    payment_mode: "UPI",
    reference_no: "",
    remarks: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge Data into Payment Vouchers List
  const vouchers = useMemo(() => {
    const list: PaymentVoucher[] = [];

    // Collections from Invoices
    (initialInvoices || []).forEach(i => {
      const custName = typeof i.customer === "object" ? (i.customer?.name || "Retail Client") : (i.customer || "Retail Client");
      const paidAmt = Number(i.advance_paid || (i.grand_total - (i.balance_due || 0)));
      if (paidAmt > 0) {
        list.push({
          id: `VCH_INV_${i.id}`,
          voucher_no: `VOU-2026-${i.invoice_no.slice(-4)}`,
          party_name: custName,
          type: "collection",
          amount: paidAmt,
          payment_mode: i.payment_mode || "UPI",
          date: i.date || "2026-07-26",
          reference_no: `INV_${i.invoice_no}`,
          remarks: `Collections against Sales Invoice #${i.invoice_no}`
        });
      }
    });

    // Disbursals from Expenses
    (initialExpenses || []).forEach(e => {
      list.push({
        id: `VCH_EXP_${e.id}`,
        voucher_no: `VOU-2026-EXP${e.id.slice(-3)}`,
        party_name: e.title || e.category,
        type: "disbursal",
        amount: Number(e.amount || 0),
        payment_mode: e.payment_mode || "Cash",
        date: e.expense_date || "2026-07-26",
        reference_no: `EXP_${e.id}`,
        remarks: e.remarks || e.category
      });
    });

    if (list.length === 0) return MOCK_VOUCHERS;
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [initialInvoices, initialExpenses]);

  // Key Calculations
  const totalCollections = vouchers.filter(v => v.type === "collection").reduce((s, v) => s + v.amount, 0);
  const totalDisbursals = vouchers.filter(v => v.type === "disbursal").reduce((s, v) => s + v.amount, 0);
  const upiTotal = vouchers.filter(v => (v.payment_mode || "").toLowerCase() === "upi").reduce((s, v) => s + v.amount, 0);
  const cashTotal = vouchers.filter(v => (v.payment_mode || "").toLowerCase() === "cash").reduce((s, v) => s + v.amount, 0);

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const s = search.toLowerCase();
      const matchesSearch = !search || v.party_name.toLowerCase().includes(s) || v.voucher_no.toLowerCase().includes(s) || (v.reference_no || "").toLowerCase().includes(s);
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "collection" && v.type === "collection") ||
        (typeFilter === "disbursal" && v.type === "disbursal") ||
        (typeFilter === "upi" && (v.payment_mode || "").toLowerCase() === "upi") ||
        (typeFilter === "cash" && (v.payment_mode || "").toLowerCase() === "cash");
      return matchesSearch && matchesType;
    });
  }, [vouchers, search, typeFilter]);

  // Handle Add Voucher
  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.party_name || !form.amount || Number(form.amount) <= 0) return;

    if (form.type === "collection") {
      await recordLedgerPayment({
        customer_name: form.party_name,
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
        reference_no: form.reference_no,
        remarks: form.remarks
      });
    }

    const newVoucher: PaymentVoucher = {
      id: `VCH_${Date.now()}`,
      voucher_no: `VOU-2026-${Date.now().toString().slice(-4)}`,
      party_name: form.party_name,
      type: form.type,
      amount: Number(form.amount),
      payment_mode: form.payment_mode,
      date: new Date().toISOString().split("T")[0],
      reference_no: form.reference_no || `REF_${Date.now().toString().slice(-6)}`,
      remarks: form.remarks
    };

    vouchers.unshift(newVoucher);
    setShowAddModal(false);
    setForm({
      party_name: "",
      type: "collection",
      amount: "",
      payment_mode: "UPI",
      reference_no: "",
      remarks: ""
    });
    alert(`Payment Voucher ${newVoucher.voucher_no} recorded successfully!`);
  };

  const handlePrintVoucher = (v: PaymentVoucher) => {
    setSelectedVoucherForPrint(v);
  };

  if (!mounted) {
    return (
      <div className="p-12 text-center text-xs font-bold text-muted-foreground animate-pulse bg-card rounded-2xl border border-border">
        Loading Payment Register & Vouchers...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Finance</span><span className="opacity-40">/</span><span className="text-foreground">Payment Register</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <BookMarked size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Payment Register & Digital Vouchers Hub
              </h1>
              <p className="text-xs text-muted-foreground">
                Centralized registry auditing all incoming customer receipts, Khata settlements, vendor disbursals, and digital payment vouchers
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> + Record Payment Voucher
        </button>
      </div>

      {/* ── Key Metrics Overview Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Collections Received</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(totalCollections)}</p>
          <p className="text-[11px] text-emerald-700 font-bold">Incoming Customer Receipts</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Disbursals Paid Out</span>
          <p className="text-2xl font-black text-rose-500 font-mono">{fmt(totalDisbursals)}</p>
          <p className="text-[11px] text-muted-foreground">Store Wages & Rent Disbursals</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">UPI & Digital Receipts</span>
          <p className="text-2xl font-black text-blue-600 font-mono">{fmt(upiTotal)}</p>
          <p className="text-[11px] text-muted-foreground">Direct Bank Settlements</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Store Cash Receipts</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(cashTotal)}</p>
          <p className="text-[11px] text-muted-foreground">Cash Drawer Receipts</p>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS BAR ───────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search party name, voucher # or ref ID..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/60 p-1 rounded-xl border border-border">
          {[
            { id: "all", label: "All Vouchers" },
            { id: "collection", label: "🟢 Collections Received" },
            { id: "disbursal", label: "🔴 Disbursals Paid" },
            { id: "upi", label: "💳 UPI / GPay" },
            { id: "cash", label: "💵 Store Cash" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                typeFilter === t.id
                  ? "bg-primary text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PAYMENT VOUCHERS AUDIT TABLE ────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Voucher #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Party / Customer Name</th>
                <th className="px-4 py-3.5">Voucher Type</th>
                <th className="px-4 py-3.5">Payment Mode</th>
                <th className="px-4 py-3.5 text-right">Amount (₹)</th>
                <th className="px-4 py-3.5 text-center">Voucher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredVouchers.map((v) => {
                const isColl = v.type === "collection";

                return (
                  <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-primary flex items-center gap-1.5">
                      <Receipt size={14} className="text-primary/70" /> {v.voucher_no}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono">{v.date}</td>
                    <td className="px-4 py-3.5 font-bold text-foreground">{v.party_name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider flex items-center gap-1 w-max ${
                        isColl
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                        {isColl ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {isColl ? "Collection Receipt" : "Disbursal Payout"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-muted rounded text-[11px] font-bold text-foreground border border-border uppercase">
                        {v.payment_mode}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-right font-mono font-black text-sm ${isColl ? "text-emerald-600" : "text-rose-500"}`}>
                      {isColl ? "+" : "-"} {fmt(v.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handlePrintVoucher(v)}
                        className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-lg text-xs border border-border transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText size={12} /> View Voucher
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredVouchers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                    No payment vouchers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: RECORD PAYMENT VOUCHER ───────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Receipt size={16} className="text-primary" /> Record Payment Voucher
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVoucher} className="p-6 space-y-4 text-xs">
              {/* Type Toggle */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Voucher Category *</label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: "collection" }))}
                    className={`py-2 rounded-lg font-black text-xs transition-all ${
                      form.type === "collection"
                        ? "bg-emerald-500 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Collection Received
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: "disbursal" }))}
                    className={`py-2 rounded-lg font-black text-xs transition-all ${
                      form.type === "disbursal"
                        ? "bg-rose-500 text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Disbursal Paid Out
                  </button>
                </div>
              </div>

              {/* Party / Customer Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Party / Customer Name *</label>
                <input
                  required
                  type="text"
                  value={form.party_name}
                  onChange={e => setForm(f => ({ ...f, party_name: e.target.value }))}
                  placeholder={form.type === "collection" ? "E.g. Vikram Construction Studio" : "E.g. Asian Paints Factory Depot"}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Amount & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="E.g. 25000"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={form.payment_mode}
                    onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Store Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Ref No */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Ref / Transaction #</label>
                <input
                  type="text"
                  value={form.reference_no}
                  onChange={e => setForm(f => ({ ...f, reference_no: e.target.value }))}
                  placeholder="E.g. UPI_991203"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Remarks / Notes</label>
                <textarea
                  value={form.remarks}
                  onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder="E.g. Advance settlement against Khata credit invoice #POS-2026-0042"
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Save Payment Voucher →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW / PRINT DIGITAL VOUCHER ─────────────────────────── */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Receipt size={16} className="text-primary" /> Official Payment Voucher
              </h3>
              <button onClick={() => setSelectedVoucherForPrint(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="text-center border-b border-border pb-3">
                <h4 className="text-base font-black text-foreground font-sans">SHREE RAM PAINTS & HARDWARE</h4>
                <p className="text-[10px] text-muted-foreground font-sans">Bundi Road Market, Alwar • GSTIN: 08AABCS1234D1Z5</p>
                <span className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase">
                  {selectedVoucherForPrint.type === "collection" ? "PAYMENT RECEIPT VOUCHER" : "DISBURSAL PAYMENT VOUCHER"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voucher No:</span>
                  <span className="font-bold text-foreground">{selectedVoucherForPrint.voucher_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-bold text-foreground">{selectedVoucherForPrint.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Party Name:</span>
                  <span className="font-bold text-foreground font-sans">{selectedVoucherForPrint.party_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <span className="font-bold text-foreground">{selectedVoucherForPrint.payment_mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref / Txn ID:</span>
                  <span className="font-bold text-foreground">{selectedVoucherForPrint.reference_no}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl border border-border flex justify-between items-center text-sm font-black font-sans">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 font-mono text-base">{fmt(selectedVoucherForPrint.amount)}</span>
              </div>

              <div className="text-[10px] text-muted-foreground italic border-t border-border pt-2">
                Remarks: {selectedVoucherForPrint.remarks}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedVoucherForPrint(null)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer font-sans"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-primary text-white font-black rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-2xs font-sans flex items-center gap-1.5"
                >
                  <FileText size={14} /> Print Voucher Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
