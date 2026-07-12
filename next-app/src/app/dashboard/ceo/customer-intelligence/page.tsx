"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, Plus, Sparkles, ShoppingCart, AlertCircle, Award, X, RefreshCw, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { DataTable } from "@/components/executive/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { INDIAN_STATES } from "@/lib/constants";

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  purchasesCount: number;
  totalSpent: string;
  totalSpentNum: number;
  outstanding: string;
  outstandingNum: number;
  favProduct: string;
  status: "Active" | "Inactive";
}

export default function CustomerWorkspacePage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  
  // Data loading states
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New Customer Form States
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGstin, setNewGstin] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newStateCode, setNewStateCode] = useState("Rajasthan"); // Rajasthan default
  const [newPincode, setNewPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters State
  const [filterMode, setFilterMode] = useState<"all" | "purchases" | "outstanding" | "favorites">("all");

  // Fetch live clients and invoices from backend APIs
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [clientRes, invoiceRes] = await Promise.all([
          fetch("/api/clients").then((r) => r.json()),
          fetch("/api/invoices").then((r) => r.json()),
        ]);
        if (clientRes.success && clientRes.data) {
          setClients(clientRes.data);
        }
        if (invoiceRes.success && invoiceRes.data) {
          setInvoices(invoiceRes.data);
        }
      } catch (err) {
        console.error("Failed to load customer details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  // Map clients to CustomerItems with live aggregated metrics
  const customers: CustomerItem[] = useMemo(() => {
    return clients.map((client) => {
      // Find invoices belonging to this client (handling both client_id and customer_id fields)
      const clientInvoices = invoices.filter(
        (inv) => inv.client_id === client.id || inv.customer_id === client.id
      );
      
      const purchasesCount = clientInvoices.length;
      const totalSpentNum = clientInvoices.reduce(
        (sum, inv) => sum + (Number(inv.grand_total) || 0),
        0
      );
      const outstandingNum = clientInvoices.reduce(
        (sum, inv) => sum + (Number(inv.balance_due) || 0),
        0
      );

      // Extract the product with highest purchase count
      const productCounts: Record<string, number> = {};
      clientInvoices.forEach((inv) => {
        if (inv.items && Array.isArray(inv.items)) {
          inv.items.forEach((item: any) => {
            if (item.name) {
              productCounts[item.name] = (productCounts[item.name] || 0) + (Number(item.qty) || 1);
            }
          });
        }
      });

      let favProduct = "Rustic Royale Superfine";
      let maxCount = 0;
      Object.entries(productCounts).forEach(([name, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favProduct = name;
        }
      });

      return {
        id: client.id,
        name: client.name,
        phone: client.phone || "N/A",
        purchasesCount,
        totalSpent: `₹${totalSpentNum.toLocaleString("en-IN")}`,
        totalSpentNum,
        outstanding: `₹${outstandingNum.toLocaleString("en-IN")}`,
        outstandingNum,
        favProduct,
        status: purchasesCount > 0 ? ("Active" as const) : ("Inactive" as const),
      };
    });
  }, [clients, invoices]);

  // Apply filters and sorting modes
  const filtered = useMemo(() => {
    let list = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    if (filterMode === "purchases") {
      list = [...list].sort((a, b) => b.purchasesCount - a.purchasesCount);
    } else if (filterMode === "outstanding") {
      list = list.filter((c) => c.outstandingNum > 0);
    } else if (filterMode === "favorites") {
      list = [...list].sort((a, b) => a.favProduct.localeCompare(b.favProduct));
    }

    return list;
  }, [customers, searchTerm, filterMode]);

  // Handle New Customer submission to backend API
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert(t("Please fill in the Customer/Company Name."));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone || null,
          gstin: newGstin || null,
          address: newAddress || null,
          state_code: newStateCode,
          pincode: newPincode || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(t("Customer created successfully!"));
        // Reset form fields
        setNewName("");
        setNewPhone("");
        setNewGstin("");
        setNewAddress("");
        setNewStateCode("08");
        setNewPincode("");
        setShowNewModal(false);
        // Trigger live refresh
        setRefreshTrigger((prev) => prev + 1);
      } else {
        alert(data.error || t("Failed to save customer."));
      }
    } catch (err) {
      console.error(err);
      alert(t("Communication error with client API."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Customers")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Users className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Customers")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("Manage end-user profiles, project allocations, and customer transaction history.")}
            </p>
          </div>
        </div>

        {/* Quick Actions Row (Projects button removed) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> {t("New Customer")}
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              filterMode === "all"
                ? "bg-muted text-foreground border-border/80"
                : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Customer List")}
          </button>
          <button
            onClick={() => setFilterMode("purchases")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              filterMode === "purchases"
                ? "bg-muted text-foreground border-border/80"
                : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Purchase History")}
          </button>
          <button
            onClick={() => setFilterMode("outstanding")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              filterMode === "outstanding"
                ? "bg-muted text-foreground border-border/80"
                : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Outstanding")}
          </button>
          <button
            onClick={() => setFilterMode("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              filterMode === "favorites"
                ? "bg-muted text-foreground border-border/80"
                : "bg-background text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {t("Favourite Products")}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Search by Customer Name or Phone")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-xs text-muted-foreground font-semibold">
            <RefreshCw size={14} className="animate-spin text-primary" />
            {t("Loading customers from database...")}
          </div>
        ) : (
          <DataTable
            columns={[
              {
                header: "Customer Name",
                accessor: (c: CustomerItem) => <span className="font-bold text-foreground">{c.name}</span>,
              },
              {
                header: "Phone No",
                accessor: (c: CustomerItem) => <span className="text-muted-foreground font-mono">{c.phone}</span>,
              },
              {
                header: "Purchases",
                align: "center",
                accessor: (c: CustomerItem) => (
                  <span className="font-semibold text-foreground">
                    {c.purchasesCount} orders ({c.totalSpent})
                  </span>
                ),
              },
              {
                header: "Outstanding Balance",
                align: "right",
                accessor: (c: CustomerItem) => (
                  <span
                    className={`font-black ${
                      c.outstanding !== "₹0" ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {c.outstanding}
                  </span>
                ),
              },
              {
                header: "Favourite Paint Product",
                accessor: (c: CustomerItem) => <span className="font-medium text-primary">{c.favProduct}</span>,
              },
              {
                header: "Status",
                align: "right",
                accessor: (c: CustomerItem) => (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border/80"
                    }`}
                  >
                    {t(c.status)}
                  </span>
                ),
              },
            ]}
            data={filtered}
            onRowClick={(c) => setSelectedCustomer(c)}
          />
        )}
      </div>

      {/* Bottom Grid: Recent Activity & AI suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">{t("Recent Activity")}</p>
          <div className="space-y-3.5">
            <div className="flex justify-between items-start text-xs border-b border-border/40 pb-2">
              <div>
                <p className="font-bold text-foreground">{t("Customer Feedbacks")}</p>
                <p className="text-muted-foreground mt-0.5">{t("Highly active customer accounts synchronized with ledger status.")}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{t("Active")}</span>
            </div>
            <div className="flex justify-between items-start text-xs border-b border-border/40 pb-2">
              <div>
                <p className="font-bold text-foreground">{t("Outstanding Invoices Tracked")}</p>
                <p className="text-muted-foreground mt-0.5">{t("Outstanding invoices auto-calculated based on balance due payments.")}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{t("Live")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Creation Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowNewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <Plus className="text-primary" size={18} />
                  <span className="text-sm font-black text-foreground uppercase tracking-wider">{t("New Customer Profile")}</span>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs font-semibold text-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("Customer / Company Name")} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma, Jaipur Builders"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("Phone Number")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 99999 99999"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("GSTIN (Optional)")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 08AAAAA0000A1Z1"
                      value={newGstin}
                      onChange={(e) => setNewGstin(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("Billing Address")}
                    </label>
                    <textarea
                      placeholder="Street, Area, Building Details"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("State")}
                    </label>
                    <select
                      value={newStateCode}
                      onChange={(e) => setNewStateCode(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t("Pincode")}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 302001"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                {/* Submit Controls */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    {t("Save Customer")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Details Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedCustomer(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                    {selectedCustomer.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">{selectedCustomer.name}</h3>
                    <p className="text-xs text-muted-foreground font-semibold">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* General Information */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">{t("General Info")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">ID</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5">{selectedCustomer.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase mt-1 border ${
                          selectedCustomer.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border/80"
                        }`}
                      >
                        {t(selectedCustomer.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <p className="font-semibold text-foreground mt-0.5">
                        {selectedCustomer.purchasesCount} dispatches
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedCustomer.totalSpent}</p>
                    </div>
                  </div>
                </div>

                {/* Account Balances */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">{t("Outstanding Balance")}</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground">{t("Current Outstanding")}</p>
                      <p
                        className={`text-lg font-black mt-0.5 ${
                          selectedCustomer.outstanding !== "₹0" ? "text-rose-500" : "text-emerald-500"
                        }`}
                      >
                        {selectedCustomer.outstanding}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">{t("Product Preferences")}</h4>
                  <div>
                    <p className="text-muted-foreground">{t("Most Ordered Product")}</p>
                    <p className="font-bold text-primary mt-0.5">{selectedCustomer.favProduct}</p>
                  </div>
                </div>

              </div>

              {/* Action Controls Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
                >
                  {t("Close")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
