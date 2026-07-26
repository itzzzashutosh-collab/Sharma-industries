"use client";

import React, { useState, useTransition } from "react";
import {
  BookMarked, Plus, Search, Sparkles, X, User, Phone, MapPin,
  IndianRupee, CreditCard, Landmark, CheckCircle2, Clock, ShieldAlert,
  FileText, ArrowDownLeft, ArrowUpRight, Filter, ChevronRight, AlertCircle
} from "lucide-react";
import { recordLedgerPayment } from "../../actions";

interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  customer?: any;
  client_details?: any;
  grand_total: number;
  advance_paid?: number;
  balance_due?: number;
  payment_mode?: string;
  credit_days?: number;
  status?: string;
}

interface ClientAccount {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  pincode?: string;
  total_billed: number;
  total_paid: number;
  credit_balance: number;
  credit_limit?: number;
  credit_period_days?: number;
}

interface Props {
  initialInvoices: Invoice[];
  initialClients: any[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const INITIAL_MOCK_CLIENTS: ClientAccount[] = [
  {
    id: "CL_001",
    name: "Vikram Construction Studio",
    phone: "+91 98290 33445",
    address: "Bundi Road Market, Alwar, Rajasthan - 301001",
    total_billed: 185000,
    total_paid: 110000,
    credit_balance: 75000,
    credit_limit: 150000,
    credit_period_days: 15
  },
  {
    id: "CL_002",
    name: "Rajesh Hardware & Paints",
    phone: "+91 98290 11223",
    address: "Shop 14, Main Bazaar, Bundi - 323001",
    total_billed: 94000,
    total_paid: 94000,
    credit_balance: 0,
    credit_limit: 100000,
    credit_period_days: 30
  },
  {
    id: "CL_003",
    name: "Sharma Paint Decorators",
    phone: "+91 98290 55667",
    address: "Near Old Bus Stand, Bundi - 323001",
    total_billed: 62500,
    total_paid: 40000,
    credit_balance: 22500,
    credit_limit: 50000,
    credit_period_days: 7
  }
];

const INITIAL_MOCK_INVOICES: Invoice[] = [
  {
    id: "INV_001",
    invoice_no: "POS-2026-0041",
    date: "2026-07-26",
    customer: { name: "Rajesh Hardware & Paints", phone: "+91 98290 11223" },
    grand_total: 48900,
    advance_paid: 48900,
    balance_due: 0,
    payment_mode: "UPI",
    status: "Paid"
  },
  {
    id: "INV_002",
    invoice_no: "POS-2026-0042",
    date: "2026-07-25",
    customer: { name: "Vikram Construction Studio", phone: "+91 98290 33445" },
    grand_total: 125000,
    advance_paid: 50000,
    balance_due: 75000,
    payment_mode: "Credit",
    credit_days: 15,
    status: "Partial"
  },
  {
    id: "INV_003",
    invoice_no: "POS-2026-0043",
    date: "2026-07-24",
    customer: { name: "Sharma Paint Decorators", phone: "+91 98290 55667" },
    grand_total: 34500,
    advance_paid: 12000,
    balance_due: 22500,
    payment_mode: "Credit",
    credit_days: 7,
    status: "Partial"
  }
];

export function CustomerLedgerClient({ initialInvoices, initialClients }: Props) {
  const [invoices] = useState<Invoice[]>(() => {
    if (initialInvoices && initialInvoices.length > 0) return initialInvoices;
    return INITIAL_MOCK_INVOICES;
  });

  const [clients, setClients] = useState<ClientAccount[]>(() => {
    if (initialClients && initialClients.length > 0) {
      return initialClients.map(c => ({
        id: c.id,
        name: c.name || "Client",
        phone: c.phone || "",
        address: c.address || "",
        total_billed: Number(c.total_billed || 0),
        total_paid: Number(c.total_paid || 0),
        credit_balance: Number(c.credit_balance || c.balance || 0),
        credit_period_days: Number(c.credit_period_days || 15)
      }));
    }
    return INITIAL_MOCK_CLIENTS;
  });

  const [activeTab, setActiveTab] = useState<"accounts" | "invoices">("accounts");
  const [search, setSearch] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedClientForPay, setSelectedClientForPay] = useState<ClientAccount | null>(null);
  const [isPending, startTransition] = useTransition();

  // Payment Form State
  const [payForm, setPayForm] = useState({
    customer_name: "",
    amount: "",
    payment_mode: "UPI",
    reference_no: "",
    remarks: "Khata Credit Balance Settlement"
  });

  // Key Metrics
  const totalBilled = clients.reduce((s, c) => s + c.total_billed, 0);
  const totalPaid = clients.reduce((s, c) => s + c.total_paid, 0);
  const totalCreditDue = clients.reduce((s, c) => s + c.credit_balance, 0);

  // Filtered Clients
  const filteredClients = clients.filter(c => {
    const s = search.toLowerCase();
    return !search || c.name.toLowerCase().includes(s) || (c.phone || "").includes(s);
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const s = search.toLowerCase();
    const invNo = inv.invoice_no || "";
    const custName = typeof inv.customer === "object" ? (inv.customer?.name || "") : (inv.customer || "");
    return !search || invNo.toLowerCase().includes(s) || custName.toLowerCase().includes(s);
  });

  // Open Payment Settlement Modal
  const openPaymentModal = (client?: ClientAccount) => {
    if (client) {
      setSelectedClientForPay(client);
      setPayForm({
        customer_name: client.name,
        amount: String(client.credit_balance || ""),
        payment_mode: "UPI",
        reference_no: `PAY_${Date.now().toString().slice(-6)}`,
        remarks: `Khata Credit Settlement for ${client.name}`
      });
    } else {
      setSelectedClientForPay(null);
      setPayForm({
        customer_name: clients[0]?.name || "",
        amount: "",
        payment_mode: "UPI",
        reference_no: `PAY_${Date.now().toString().slice(-6)}`,
        remarks: "Khata Credit Balance Settlement"
      });
    }
    setShowPaymentModal(true);
  };

  // Submit Payment Settlement
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.customer_name || !payForm.amount || Number(payForm.amount) <= 0) return;

    const amt = Number(payForm.amount);

    startTransition(async () => {
      await recordLedgerPayment(payForm);

      // Update local client credit balance
      setClients(prev => prev.map(c => {
        if (c.name.toLowerCase() === payForm.customer_name.toLowerCase()) {
          const newPaid = c.total_paid + amt;
          const newBal = Math.max(0, c.credit_balance - amt);
          return { ...c, total_paid: newPaid, credit_balance: newBal };
        }
        return c;
      }));

      setShowPaymentModal(false);
      alert(`Payment of ₹${amt.toLocaleString("en-IN")} recorded successfully for ${payForm.customer_name}!`);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* ── Top Header Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-2xs">
        <div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span>Dealer Workspace</span><span className="opacity-40">/</span><span>Finance</span><span className="opacity-40">/</span><span className="text-foreground">Customer Ledger</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <BookMarked size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                Customer & Client Khata Ledger
              </h1>
              <p className="text-xs text-muted-foreground">
                Track client accounts, credit sales history, instant/advance invoice payments, and outstanding Khata balances
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => openPaymentModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-2xs cursor-pointer"
        >
          <Plus size={15} /> + Receive Khata Payment
        </button>
      </div>

      {/* ── Key Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Billed to Clients</span>
          <p className="text-2xl font-black text-foreground font-mono">{fmt(totalBilled)}</p>
          <p className="text-[11px] text-muted-foreground">All Customer Invoice Sales</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Payments Received</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{fmt(totalPaid)}</p>
          <p className="text-[11px] text-emerald-700 font-bold">Paid Instant & Khata Collections</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block">Outstanding Credit Balance</span>
          <p className="text-2xl font-black text-amber-500 font-mono">{fmt(totalCreditDue)}</p>
          <p className="text-[11px] text-amber-600 font-bold">Khata Due from {clients.filter(c => c.credit_balance > 0).length} Clients</p>
        </div>
      </div>

      {/* ── Tabs & Search Filter Controls ────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "accounts"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={14} /> Client Khata Accounts ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "invoices"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText size={14} /> Invoiced Ledger Entries ({invoices.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client name or phone..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── TAB 1: CLIENT KHATA ACCOUNTS TABLE ───────────────────────────── */}
      {activeTab === "accounts" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Client / Customer Name</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5 text-right">Total Billed</th>
                  <th className="px-4 py-3.5 text-right">Total Paid</th>
                  <th className="px-4 py-3.5 text-right">Outstanding Credit</th>
                  <th className="px-4 py-3.5 text-center">Credit Term</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filteredClients.map((client) => {
                  const hasDue = client.credit_balance > 0;

                  return (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <User size={15} className="text-primary" />
                          <div>
                            <span className="block text-xs font-bold text-foreground">{client.name}</span>
                            {client.address && <span className="text-[10px] text-muted-foreground block truncate max-w-xs">{client.address}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-muted-foreground">{client.phone || "—"}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(client.total_billed)}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-bold">{fmt(client.total_paid)}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-sm">
                        <span className={hasDue ? "text-amber-500" : "text-emerald-600"}>
                          {fmt(client.credit_balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-mono font-bold text-foreground border border-border">
                          {client.credit_period_days || 15} Days
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {hasDue ? (
                          <button
                            onClick={() => openPaymentModal(client)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <IndianRupee size={12} /> Receive Payment
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                            <CheckCircle2 size={12} /> Account Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                      No client khata accounts found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: INVOICED TRANSACTIONS LEDGER ──────────────────────────── */}
      {activeTab === "invoices" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 uppercase font-black text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Payment Terms</th>
                  <th className="px-4 py-3.5 text-right">Invoice Total</th>
                  <th className="px-4 py-3.5 text-right">Advance / Paid</th>
                  <th className="px-4 py-3.5 text-right">Balance Due</th>
                  <th className="px-4 py-3.5 text-center">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filteredInvoices.map((inv) => {
                  const custName = typeof inv.customer === "object" ? (inv.customer?.name || "Retail Customer") : (inv.customer || "Retail Customer");
                  const bal = Number(inv.balance_due ?? 0);
                  const adv = Number(inv.advance_paid ?? (inv.grand_total - bal));
                  const isPaid = bal <= 0 || inv.status === "Paid";

                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-primary flex items-center gap-1.5">
                        <FileText size={14} className="text-primary/70" /> {inv.invoice_no}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground font-mono">{inv.date}</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">{custName}</td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <span className="px-2 py-0.5 bg-muted rounded text-[11px] font-bold text-foreground border border-border uppercase">
                          {inv.payment_mode || "Cash"} {inv.credit_days ? `(${inv.credit_days}d)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">{fmt(inv.grand_total)}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-bold">{fmt(adv)}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-sm">
                        <span className={bal > 0 ? "text-amber-500" : "text-emerald-600"}>{fmt(bal)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase font-mono tracking-wider ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                          {isPaid ? "Paid (Instant)" : "Credit Due"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground font-medium">
                      No invoiced ledger transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PAYMENT COLLECTION & SETTLEMENT MODAL ───────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <IndianRupee size={16} className="text-emerald-600" /> Record Khata Payment Collection
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Select Client / Customer *</label>
                <select
                  required
                  value={payForm.customer_name}
                  onChange={e => setPayForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Credit Due: ₹{c.credit_balance.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Amount Collected (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="E.g. 25000"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={payForm.payment_mode}
                    onChange={e => setPayForm(f => ({ ...f, payment_mode: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-foreground"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Store Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Ref / Transaction #</label>
                  <input
                    type="text"
                    value={payForm.reference_no}
                    onChange={e => setPayForm(f => ({ ...f, reference_no: e.target.value }))}
                    placeholder="E.g. UPI_991203"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Remarks / Notes</label>
                <textarea
                  value={payForm.remarks}
                  onChange={e => setPayForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder="E.g. Part payment against credit bill #POS-2026-0042"
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-border bg-background text-foreground font-bold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                >
                  {isPending ? "Recording..." : "Record Payment →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
