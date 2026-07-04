"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Truck, Calculator, CreditCard } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getRawMaterials, submitPurchaseBill } from "@/actions/purchaseActions";
import { useRouter } from "next/navigation";

export default function AddPurchaseBillPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Fetched State
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [headerInfo, setHeaderInfo] = useState({
    supplier_name: "",
    supplier_gstin: "",
    invoice_no: "",
    bill_date: new Date().toISOString().split("T")[0],
    vehicle_no: "",
    lr_no: "",
    payment_status: "UNPAID",
    payment_type: "CREDIT"
  });

  const [items, setItems] = useState([
    { id: Date.now().toString(), raw_material_id: "", quantity: 0, rate: 0 },
  ]);

  const [taxes, setTaxes] = useState({
    igst_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
  });

  useEffect(() => {
    async function loadData() {
      const rmRes = await getRawMaterials();
      if (rmRes.success) setRawMaterials(rmRes.data || []);
    }
    loadData();
  }, []);

  const subTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return subTotal + Number(taxes.igst_amount) + Number(taxes.cgst_amount) + Number(taxes.sgst_amount);
  }, [subTotal, taxes]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setHeaderInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxes(prev => ({ ...prev, [e.target.name]: Number(e.target.value) || 0 }));
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItemRow = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), raw_material_id: "", quantity: 0, rate: 0 }]);
  };

  const removeItemRow = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("supplier_name", headerInfo.supplier_name);
    formData.append("supplier_gstin", headerInfo.supplier_gstin);
    formData.append("invoice_no", headerInfo.invoice_no);
    formData.append("bill_date", headerInfo.bill_date);
    formData.append("payment_status", headerInfo.payment_status);
    formData.append("payment_type", headerInfo.payment_type);
    formData.append("transport_details", JSON.stringify({ vehicle_no: headerInfo.vehicle_no, lr_no: headerInfo.lr_no }));
    
    formData.append("items", JSON.stringify(items));
    
    formData.append("sub_total", String(subTotal));
    formData.append("igst_amount", String(taxes.igst_amount));
    formData.append("cgst_amount", String(taxes.cgst_amount));
    formData.append("sgst_amount", String(taxes.sgst_amount));
    formData.append("total_amount", String(grandTotal));

    const res = await submitPurchaseBill(formData);
    setIsSubmitting(false);

    if (res.success) {
      alert("Purchase Bill Saved Successfully!");
      router.push("/dashboard/purchase"); // Return to ledger
    } else {
      alert("Error saving bill: " + res.error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <FileText className="text-primary" size={32} /> {t("New Purchase Bill")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("Record incoming raw materials and update inventory.")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Header Information */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-primary/20 p-1.5 rounded-lg text-primary"><FileText size={18} /></span> 
            {t("Supplier & Invoice Details")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Supplier Name")}</label>
              <input 
                type="text" 
                name="supplier_name"
                value={headerInfo.supplier_name}
                onChange={handleHeaderChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Supplier GSTIN")}</label>
              <input 
                type="text" 
                name="supplier_gstin"
                value={headerInfo.supplier_gstin}
                onChange={handleHeaderChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Invoice No")}</label>
              <input 
                type="text" 
                name="invoice_no"
                value={headerInfo.invoice_no}
                onChange={handleHeaderChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Bill Date")}</label>
              <input 
                type="date" 
                name="bill_date"
                value={headerInfo.bill_date}
                onChange={handleHeaderChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {/* Payment & Transport Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><CreditCard size={18} /></span> 
                {t("Payment Details")}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Payment Status")}</label>
                  <select 
                    name="payment_status"
                    value={headerInfo.payment_status}
                    onChange={handleHeaderChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground"
                  >
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Payment Type")}</label>
                  <select 
                    name="payment_type"
                    value={headerInfo.payment_type}
                    onChange={handleHeaderChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground"
                  >
                    <option value="CREDIT">Credit (30/60 Days)</option>
                    <option value="CASH">Cash / Bank Transfer</option>
                    <option value="ADVANCE">Advance Paid</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400"><Truck size={18} /></span> 
                {t("Transport Details")}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Vehicle No")}</label>
                  <input 
                    type="text" 
                    name="vehicle_no"
                    value={headerInfo.vehicle_no}
                    onChange={handleHeaderChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("LR No")}</label>
                  <input 
                    type="text" 
                    name="lr_no"
                    value={headerInfo.lr_no}
                    onChange={handleHeaderChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Items Grid */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-foreground mb-6">{t("Item Details")}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  <th className="pb-4 pr-4 w-1/3">{t("Raw Material")}</th>
                  <th className="pb-4 px-4 w-1/6">{t("Quantity")}</th>
                  <th className="pb-4 px-4 w-1/6">{t("Rate (₹)")}</th>
                  <th className="pb-4 px-4 w-1/6 text-right">{t("Amount (₹)")}</th>
                  <th className="pb-4 pl-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border/30">
                    <td className="py-4 pr-4">
                      <select 
                        value={item.raw_material_id}
                        onChange={(e) => handleItemChange(item.id, "raw_material_id", e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none"
                        required
                      >
                        <option value="" disabled>Select Material</option>
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.material_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <input 
                        type="number" 
                        min="0" step="any"
                        value={item.quantity || ""}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        required
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input 
                        type="number" 
                        min="0" step="any"
                        value={item.rate || ""}
                        onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        required
                      />
                    </td>
                    <td className="py-4 px-4 text-right font-black text-foreground">
                      {(item.quantity * item.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button 
                        type="button"
                        onClick={() => removeItemRow(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <button 
              type="button" 
              onClick={addItemRow}
              className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors border border-primary/20"
            >
              <Plus size={16} /> {t("Add Item")}
            </button>
          </div>
        </div>

        {/* Taxes & Footer Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tax Inputs */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Calculator size={18} /></span> 
              {t("Taxes & Adjustments")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-muted-foreground w-1/3">IGST (₹)</label>
                <input 
                  type="number" name="igst_amount" min="0" step="any"
                  value={taxes.igst_amount || ""} onChange={handleTaxChange}
                  className="w-2/3 bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-muted-foreground w-1/3">CGST (₹)</label>
                <input 
                  type="number" name="cgst_amount" min="0" step="any"
                  value={taxes.cgst_amount || ""} onChange={handleTaxChange}
                  className="w-2/3 bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-muted-foreground w-1/3">SGST (₹)</label>
                <input 
                  type="number" name="sgst_amount" min="0" step="any"
                  value={taxes.sgst_amount || ""} onChange={handleTaxChange}
                  className="w-2/3 bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-right"
                />
              </div>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="bg-background border-2 border-primary/20 rounded-3xl p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-semibold">{t("Sub-total")}</span>
                <span className="font-bold text-foreground">₹{subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-semibold">{t("Total Taxes")}</span>
                <span className="font-bold text-foreground">₹{(Number(taxes.igst_amount) + Number(taxes.cgst_amount) + Number(taxes.sgst_amount)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                <span className="text-xl font-bold uppercase tracking-wider text-foreground">{t("Grand Total")}</span>
                <span className="text-3xl font-black text-primary drop-shadow-md">
                  ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-black text-lg shadow-md hover:shadow-md transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <Save size={24} /> {isSubmitting ? t("Saving...") : t("Save Purchase Bill")}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
