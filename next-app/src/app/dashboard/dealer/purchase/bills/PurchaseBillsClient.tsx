"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  FileText, Plus, Download, Search, Sparkles, X, PlusCircle, CreditCard,
  Building2, CheckCircle2, Clock, Eye, IndianRupee, Filter, Upload, FileUp, File,
  Trash2, Calculator, Truck
} from "lucide-react";
import { createDealerPurchaseBill } from "../../actions";

interface LineItem {
  id: string;
  material_name: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  gst_tax: number;
}

interface Bill {
  id: string;
  invoice_no: string;
  bill_date: string;
  supplier_name: string;
  supplier_gstin?: string | null;
  sub_total?: number | null;
  gst_amount?: number | null;
  total_amount: number;
  payment_status: string;
  payment_type?: string | null;
  bill_file_path?: string | null;
  notes?: string | null;
  items?: LineItem[] | null;
}

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  gstin?: string | null;
}

interface Props {
  initialData: Bill[];
  suppliers: Supplier[];
}

const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function PurchaseBillsClient({ initialData = [], suppliers = [] }: Props) {
  const [list, setList] = useState<Bill[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Preview Modal state
  const [selectedBillForPreview, setSelectedBillForPreview] = useState<Bill | null>(null);

  // Form State (CEO Mode Parity)
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || "Asian Paints Regional Depot");
  const [supplierGstin, setSupplierGstin] = useState(suppliers[0]?.gstin || "08AAPCS4939B1Z8");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentType, setPaymentType] = useState("Bank Transfer");
  const [taxType, setTaxType] = useState<"LOCAL" | "INTERSTATE">("LOCAL");
  const [vehicleNo, setVehicleNo] = useState("");
  const [lrNo, setLrNo] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [labourCost, setLabourCost] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Line Items Engine
  const [items, setItems] = useState<LineItem[]>([
    {
      id: "ITEM_1",
      material_name: "Royale Luxury Emulsion 20L",
      hsn_code: "3209",
      quantity: 10,
      unit: "Pails",
      rate: 4500,
      gst_tax: 18,
    },
    {
      id: "ITEM_2",
      material_name: "Acrylic Wall Primer 20L",
      hsn_code: "3208",
      quantity: 15,
      unit: "Pails",
      rate: 2200,
      gst_tax: 18,
    },
  ]);

  // Line Item Helper Functions
  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        id: `ITEM_${Date.now()}`,
        material_name: "",
        hsn_code: "3209",
        quantity: 1,
        unit: "pcs",
        rate: 0,
        gst_tax: 18,
      },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length <= 1) {
      alert("At least one product line item is required.");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Line Item Calculations
  const calculatedTaxableSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0)), 0);
  }, [items]);

  const calculatedGstTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const lineSub = Number(item.quantity || 0) * Number(item.rate || 0);
      return sum + lineSub * (Number(item.gst_tax || 18) / 100);
    }, 0);
  }, [items]);

  const extraCostsTotal = (Number(transportCost) || 0) + (Number(labourCost) || 0);
  const calculatedGrandTotal = calculatedTaxableSubtotal + calculatedGstTotal + extraCostsTotal;

  // Summary Metrics
  const totalExpenses = useMemo(() => {
    return list.reduce((s, b) => s + Number(b.total_amount || 0), 0);
  }, [list]);

  const paidTotal = useMemo(() => {
    return list
      .filter((b) => b.payment_status === "paid" || b.payment_status === "PAID")
      .reduce((s, b) => s + Number(b.total_amount || 0), 0);
  }, [list]);

  const pendingTotal = useMemo(() => {
    return list
      .filter((b) => b.payment_status !== "paid" && b.payment_status !== "PAID")
      .reduce((s, b) => s + Number(b.total_amount || 0), 0);
  }, [list]);

  // Filtered List
  const filteredBills = useMemo(() => {
    return list.filter((bill) => {
      const matchSearch =
        !search ||
        bill.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
        bill.supplier_name?.toLowerCase().includes(search.toLowerCase());
      const isPaid = bill.payment_status === "paid" || bill.payment_status === "PAID";
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Paid" && isPaid) ||
        (statusFilter === "Pending" && !isPaid);
      return matchSearch && matchStatus;
    });
  }, [list, search, statusFilter]);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Add Purchase Bill Handler (CEO Mode Form Parity)
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo || !supplierName) {
      alert("Please enter invoice number and supplier name.");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("invoice_no", invoiceNo);
      fd.append("supplier_name", supplierName);
      fd.append("supplier_gstin", supplierGstin);
      fd.append("bill_date", billDate);
      fd.append("sub_total", calculatedTaxableSubtotal.toString());
      fd.append("gst_amount", calculatedGstTotal.toString());
      fd.append("total_amount", calculatedGrandTotal.toString());
      fd.append("payment_status", paymentStatus);
      fd.append("payment_type", paymentType);
      fd.append("notes", notes);
      fd.append("items", JSON.stringify(items));
      if (selectedFile) {
        fd.append("file", selectedFile);
      }

      const res = await createDealerPurchaseBill(fd);

      if (res.success && res.data) {
        setList((prev) => [res.data, ...prev]);
        setShowAddBillModal(false);
        // Reset form
        setInvoiceNo("");
        setNotes("");
        setSelectedFile(null);
        alert("Purchase bill & product line items saved successfully!");
      } else {
        alert(res.error || "Failed to save purchase bill");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Dealer Purchase Bills Registry</h1>
            <p className="text-xs text-muted-foreground">
              Trace stock inward expenses, supplier product line items, PDF/Image attachments & settlements (CEO Mode Form)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddBillModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
        >
          <Plus size={14} /> Upload PDF / Record Purchase Bill
        </button>
      </div>

      {/* Expense Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <IndianRupee size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Purchase Expenses</span>
            <span className="text-lg font-black text-foreground">{fmt(totalExpenses)}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Settled / Paid Bills</span>
            <span className="text-lg font-black text-emerald-600">{fmt(paidTotal)}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Pending / Unpaid Bills</span>
            <span className="text-lg font-black text-amber-600">{fmt(pendingTotal)}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          {["All", "Paid", "Pending"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                statusFilter === st ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border uppercase font-black text-[10px] text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4 text-right">Total Amount (Incl. Tax)</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Uploaded Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {filteredBills.map((bill) => {
                const isPaid = bill.payment_status === "paid" || bill.payment_status === "PAID";
                return (
                  <tr key={bill.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{bill.invoice_no}</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {bill.bill_date ? new Date(bill.bill_date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {bill.supplier_name}
                      {bill.supplier_gstin && <span className="block text-[10px] font-mono text-muted-foreground">GST: {bill.supplier_gstin}</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-foreground">{fmt(bill.total_amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border font-mono ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {bill.bill_file_path ? (
                        <button
                          onClick={() => setSelectedBillForPreview(bill)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg"
                        >
                          <Eye size={13} /> View Bill
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-[10px] italic">No File Attached</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground font-medium">
                    No purchase bills found. Click "Upload PDF / Record Purchase Bill" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CEO MODE RECORD PURCHASE BILL & LINE ITEMS MODAL ────────────────── */}
      {showAddBillModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Add New Purchase Bill (Products & Items Entry)
              </h3>
              <button onClick={() => setShowAddBillModal(false)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-5 text-xs">
              {/* PDF / Image Document Dropzone */}
              <div className="p-4 border-2 border-dashed border-primary/30 bg-primary/5 rounded-2xl text-center space-y-2">
                <FileUp size={24} className="mx-auto text-primary" />
                <div>
                  <span className="font-bold text-foreground block text-xs">Attach Original Supplier Purchase Bill Document (PDF or Image)</span>
                  <span className="text-[10px] text-muted-foreground">Supported formats: PDF, PNG, JPG, JPEG</span>
                </div>

                <div className="flex justify-center pt-1">
                  <label className="px-4 py-1.5 bg-primary text-white rounded-xl font-bold cursor-pointer hover:bg-primary/90 text-xs shadow-2xs flex items-center gap-1.5">
                    <Upload size={13} /> Select File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold text-xs pt-1">
                    <File size={13} /> Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Header Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-2xl border border-border/50">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Supplier / Vendor Name *</label>
                  <input
                    required
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Asian Paints Regional Depot, Berger Paints"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Supplier GSTIN</label>
                  <input
                    type="text"
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value.toUpperCase())}
                    placeholder="08AAPCS4939B1Z8"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono uppercase outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Invoice / Bill Number *</label>
                  <input
                    required
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="e.g. TAX-9482"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Bill Date *</label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Tax Type</label>
                  <select
                    value={taxType}
                    onChange={(e: any) => setTaxType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                  >
                    <option value="LOCAL">LOCAL (CGST + SGST)</option>
                    <option value="INTERSTATE">INTERSTATE (IGST)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                  >
                    <option value="pending">Pending / Credit</option>
                    <option value="paid">Paid / Settled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Payment Mode</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Vehicle / LR No (Optional)</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="e.g. RJ14 GB 9821"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* ── PRODUCTS & LINE ITEMS TABLE (CEO MODE PARITY) ────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-extrabold text-foreground text-xs flex items-center gap-2">
                    <Building2 size={16} className="text-primary" /> Product Line Items ({items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus size={13} /> + Add Item Row
                  </button>
                </div>

                <div className="border border-border rounded-2xl overflow-hidden bg-background">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 border-b border-border uppercase font-black text-[10px] text-muted-foreground">
                        <tr>
                          <th className="py-2.5 px-3">Item / Product Name</th>
                          <th className="py-2.5 px-2 w-20">HSN</th>
                          <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                          <th className="py-2.5 px-2 w-24">Unit</th>
                          <th className="py-2.5 px-2 w-28 text-right">Rate (₹)</th>
                          <th className="py-2.5 px-2 w-20 text-center">GST %</th>
                          <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                          <th className="py-2.5 px-2 w-10 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        {items.map((item, idx) => {
                          const lineSub = Number(item.quantity || 0) * Number(item.rate || 0);
                          const lineGst = lineSub * (Number(item.gst_tax || 18) / 100);
                          const lineTotal = lineSub + lineGst;
                          return (
                            <tr key={item.id} className="hover:bg-muted/20">
                              <td className="p-2">
                                <input
                                  type="text"
                                  required
                                  value={item.material_name}
                                  onChange={(e) => handleUpdateItem(item.id, "material_name", e.target.value)}
                                  placeholder="e.g. Royale Luxury Emulsion 20L"
                                  className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground font-bold outline-none focus:border-primary text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.hsn_code}
                                  onChange={(e) => handleUpdateItem(item.id, "hsn_code", e.target.value)}
                                  placeholder="3209"
                                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-foreground font-mono outline-none text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-foreground font-bold text-center outline-none text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleUpdateItem(item.id, "unit", e.target.value)}
                                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-foreground font-medium outline-none text-xs"
                                >
                                  {["pcs", "Pails", "L", "KG", "Bags", "Boxes"].map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.rate}
                                  onChange={(e) => handleUpdateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-foreground font-black text-right outline-none text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={item.gst_tax}
                                  onChange={(e) => handleUpdateItem(item.id, "gst_tax", parseFloat(e.target.value) || 0)}
                                  className="w-full bg-background border border-border rounded-lg px-1.5 py-1.5 text-foreground font-bold text-center outline-none text-xs"
                                >
                                  {[18, 12, 5, 28, 0].map((g) => (
                                    <option key={g} value={g}>{g}%</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2 text-right font-black text-foreground">
                                ₹{lineTotal.toFixed(2)}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemRow(item.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Transport Costs & Financial Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                  <h5 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Truck size={14} className="text-primary" /> Additional Inward Freight & Labour Costs
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Transport Cost (₹)</label>
                      <input
                        type="number"
                        value={transportCost}
                        onChange={(e) => setTransportCost(e.target.value)}
                        placeholder="₹0.00"
                        className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Labour Cost (₹)</label>
                      <input
                        type="number"
                        value={labourCost}
                        onChange={(e) => setLabourCost(e.target.value)}
                        placeholder="₹0.00"
                        className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-medium outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-primary/30 p-4 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Subtotal:</span>
                    <span className="font-bold text-foreground">₹{calculatedTaxableSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total GST Tax:</span>
                    <span className="font-bold text-foreground">₹{calculatedGstTotal.toFixed(2)}</span>
                  </div>
                  {extraCostsTotal > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Freight & Labour:</span>
                      <span className="font-bold text-foreground">₹{extraCostsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-foreground pt-2 border-t border-border">
                    <span>GRAND TOTAL:</span>
                    <span className="text-primary font-mono text-base">₹{calculatedGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Stock inward batch #4920"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 size={16} /> Submit & Save Purchase Bill (₹{calculatedGrandTotal.toFixed(0)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View File / Bill Preview Modal ────────────────────────────────────── */}
      {selectedBillForPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground font-mono">Invoice #{selectedBillForPreview.invoice_no}</h3>
                <p className="text-xs text-muted-foreground">{selectedBillForPreview.supplier_name}</p>
              </div>
              <button onClick={() => setSelectedBillForPreview(null)}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                <div><span>Bill Date:</span> <strong className="text-foreground">{selectedBillForPreview.bill_date}</strong></div>
                <div><span>Total Amount:</span> <strong className="text-primary font-mono text-sm">{fmt(selectedBillForPreview.total_amount)}</strong></div>
                <div><span>Status:</span> <strong className="uppercase text-emerald-600">{selectedBillForPreview.payment_status}</strong></div>
                <div><span>Payment Mode:</span> <strong className="text-foreground">{selectedBillForPreview.payment_type || "Bank Transfer"}</strong></div>
              </div>

              {selectedBillForPreview.bill_file_path && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase block">Attached Invoice Document</span>
                  {selectedBillForPreview.bill_file_path.endsWith(".pdf") ? (
                    <iframe
                      src={selectedBillForPreview.bill_file_path}
                      className="w-full h-96 rounded-xl border border-border"
                      title="Bill PDF View"
                    />
                  ) : (
                    <img
                      src={selectedBillForPreview.bill_file_path}
                      alt="Uploaded Bill"
                      className="w-full max-h-96 object-contain rounded-xl border border-border bg-black/5"
                    />
                  )}

                  <a
                    href={selectedBillForPreview.bill_file_path}
                    target="_blank"
                    download
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Download size={14} /> Download Original Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
