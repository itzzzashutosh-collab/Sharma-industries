"use client";

import React, { useState, useRef, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Download, Layers, Landmark, User, FileText,
  X, Check, Search, Tag, Package,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { INDIAN_STATES } from "@/lib/constants";
import { getDealerNextQuotationNumber, saveDealerQuotation } from "@/app/dashboard/dealer/sales/actions";
import { createClient } from "@/utils/supabase/client";

const useTranslation = useLanguage;

// ─── Types ────────────────────────────────────────────────────────────────────

interface DealerProduct {
  id: string;
  name: string;
  brand: string;
  brandType: string;
  hsn_code: string;
  purchase_price: number;
  selling_price: number;
  mrp: number;
  discount_percent: number;
  packing_size_unit?: string;
  tags?: any;
}

interface QuotationItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  hsn: string;
  qty: number;
  purchasePrice?: number;
  rate: number;
  mrp: number;
  taxPercent: number;
  taxableValue: number;
  taxAmount: number;
  total: number;
  per?: string;
}

type ClientType = "Customer" | "Contractor/Painter";

// ─── Brand helpers ─────────────────────────────────────────────────────────────
const BRAND_COLORS: Record<string, string> = {
  "Sharma Industries": "bg-primary/10 text-primary border-primary/20",
  "Swatch": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Asian Paints": "bg-red-500/10 text-red-600 border-red-500/20",
  "Berger": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Nerolac": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "Dulux": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Nippon": "bg-rose-500/10 text-rose-600 border-rose-500/20",
};
const PALETTES = [
  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "bg-rose-500/10 text-rose-600 border-rose-500/20",
  "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  "bg-orange-500/10 text-orange-600 border-orange-500/20",
];

const getBrandColor = (brand: string) => {
  if (!brand) return "bg-muted/50 text-muted-foreground border-border";
  if (brand === "Sharma Industries") return "bg-primary/10 text-primary border-primary/20";
  if (BRAND_COLORS[brand]) return BRAND_COLORS[brand];
  let hash = 0;
  for (let i = 0; i < brand.length; i++) hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
};

// ─── numberToWords helper ──────────────────────────────────────────────────────
function numberToWords(num: number): string {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function g(n: number): string { if(n<20)return a[n]; const d=n%10; return b[Math.floor(n/10)]+(d?"-"+a[d]:""); }
  function h(n: number): string { if(n<100)return g(n); return a[Math.floor(n/100)]+" Hundred"+(n%100?" and "+g(n%100):""); }
  function convert(n: number): string { if(n===0)return"Zero"; const l=Math.floor(n/100000),t=Math.floor((n%100000)/1000),r=n%1000; let s=""; if(l>0)s+=h(l)+" Lakh "; if(t>0)s+=h(t)+" Thousand "; if(r>0)s+=h(r); return s.trim(); }
  const parts=Math.max(0,num).toFixed(2).split("."); const whole=parseInt(parts[0]); const dec=parseInt(parts[1]);
  return convert(whole)+(dec>0?" and "+convert(dec)+" Paise":"");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DealerQuotationEngine() {
  const supabase = createClient();
  const { t } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const previewRef = useRef<HTMLDivElement>(null);

  // Data
  const [dealerClients, setDealerClients] = useState<any[]>([]);
  const [dealerPainters, setDealerPainters] = useState<any[]>([]);
  const [products, setProducts] = useState<DealerProduct[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [productSearch, setProductSearch] = useState<string>("");

  // Client
  const [clientType, setClientType] = useState<ClientType>("Customer");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");

  // Modals
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", phone: "", gstin: "", address: "", state_code: "", pincode: "" });
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [targetItemRowId, setTargetItemRowId] = useState<string | null>(null);
  const [newProductData, setNewProductData] = useState({ name: "", brand: "Sharma Industries", hsn_code: "3209", purchase_price: 0, selling_price: 0, mrp: 0, discount_percent: 0, packing_size_unit: "pcs" });

  // Quotation fields
  const [quotationNo, setQuotationNo] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">("exclusive");
  const [quotationTheme, setQuotationTheme] = useState("classic");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isMounted, setIsMounted] = useState(false);

  // ─── Load data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    getDealerNextQuotationNumber().then((no) => setQuotationNo(no));
    setQuotationDate(new Date().toISOString().split("T")[0]);
    // Default valid until: 30 days
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().split("T")[0]);

    async function loadData() {
      try {
        const [clientRes, prodRes, compRes, paintersRes] = await Promise.all([
          fetch("/api/clients").then((r) => r.json()),
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/competitor-products").then((r) => r.json().catch(() => ({ success: false }))),
          supabase.from("painters").select("id, name, phone, city").order("name"),
        ]);

        if (clientRes.success && clientRes.data) setDealerClients(clientRes.data);
        if (paintersRes.data) setDealerPainters(paintersRes.data);

        let allProducts: DealerProduct[] = [];
        if (prodRes.success && prodRes.data) {
          allProducts = [...allProducts, ...prodRes.data.map((p: any): DealerProduct => {
            const brandName = p.brand || (Array.isArray(p.tags) && p.tags[0]) || "Sharma Industries";
            return {
              id: p.id, name: p.product_name || p.name || "", brand: brandName, brandType: brandName === "Sharma Industries" ? "sharma" : "brand",
              hsn_code: p.hsn_code || "3209", purchase_price: Number(p.purchase_price || 0),
              selling_price: Number(p.selling_price || 0), mrp: Number(p.mrp || p.selling_price || 0),
              discount_percent: 0, packing_size_unit: p.packing_size_unit || "pcs", tags: p.tags,
            };
          })];
        }
        if (compRes.success && compRes.data) {
          allProducts = [...allProducts, ...compRes.data.map((cp: any): DealerProduct => ({
            id: cp.id, name: cp.product_name || "", brand: cp.brand || "Other Brands",
            brandType: "brand",
            hsn_code: "3209", purchase_price: Number(cp.trade_price || cp.purchase_price || cp.dealer_price || 0),
            selling_price: Number(cp.selling_price || cp.mrp || 0), mrp: Number(cp.mrp || 0),
            discount_percent: Number(cp.discount_percent || 0), packing_size_unit: cp.pack_size || "pcs", tags: [cp.brand || "Other Brands"],
          }))];
        }
        setProducts(allProducts);
      } catch (err) { console.error("Failed to load data:", err); }
    }
    loadData();
  }, []);

  // ─── Client select ─────────────────────────────────────────────────────────
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) { setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); setGstin(""); setState(""); setPincode(""); return; }
    if (clientType === "Contractor/Painter") {
      const p = dealerPainters.find((x) => x.id === clientId);
      if (p) { setCustomerName(p.name || ""); setCustomerPhone(p.phone || ""); setCustomerAddress(p.city || ""); }
    } else {
      const c = dealerClients.find((x) => x.id === clientId);
      if (c) { setCustomerName(c.name || ""); setCustomerPhone(c.phone || ""); setCustomerAddress(c.address || ""); setGstin(c.gstin || ""); setState(c.state_code || ""); setPincode(c.pincode || ""); }
    }
  };

  const handleSaveNewClient = async () => {
    try {
      const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newClientData) });
      const data = await res.json();
      if (data.success && data.data) {
        setDealerClients([...dealerClients, data.data]);
        setSelectedClientId(data.data.id);
        setCustomerName(data.data.name); setCustomerPhone(data.data.phone || ""); setCustomerAddress(data.data.address || ""); setGstin(data.data.gstin || ""); setState(data.data.state_code || ""); setPincode(data.data.pincode || "");
        setShowAddClientModal(false);
        setNewClientData({ name: "", phone: "", gstin: "", address: "", state_code: "", pincode: "" });
      } else { alert(data.error || "Failed to save client"); }
    } catch { alert("Error saving client"); }
  };

  // ─── Item math ─────────────────────────────────────────────────────────────
  const recalculate = (item: QuotationItem, type: "inclusive" | "exclusive"): QuotationItem => {
    const { qty, rate, taxPercent } = item;
    if (type === "exclusive") {
      const taxableValue = qty * rate, taxAmount = taxableValue * (taxPercent / 100), total = taxableValue + taxAmount;
      return { ...item, taxableValue, taxAmount, total };
    } else {
      const total = qty * rate, taxableValue = total / (1 + taxPercent / 100), taxAmount = total - taxableValue;
      return { ...item, taxableValue, taxAmount, total };
    }
  };

  const handleAddItem = () => {
    const newItem: QuotationItem = { id: Date.now().toString(), productId: "", name: "", brand: "", hsn: "3209", qty: 1, rate: 0, mrp: 0, taxPercent: 18, taxableValue: 0, taxAmount: 0, total: 0, per: "pcs" };
    setItems([...items, recalculate(newItem, taxType)]);
  };

  const handleAddToCart = (product: DealerProduct, qty: number = 1) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      const existing = updatedItems[existingIndex];
      const newQty = existing.qty + qty;
      updatedItems[existingIndex] = recalculate({ ...existing, qty: newQty }, taxType);
      setItems(updatedItems);
    } else {
      const newItem: QuotationItem = {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        productId: product.id,
        name: product.name,
        brand: product.brand,
        hsn: product.hsn_code || "3209",
        qty: qty,
        rate: product.selling_price,
        mrp: product.mrp,
        taxPercent: 18,
        taxableValue: 0,
        taxAmount: 0,
        total: 0,
        per: product.packing_size_unit || "pcs",
      };
      setItems((prev) => [...prev, recalculate(newItem, taxType)]);
    }
  };

  const handleRemoveItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const handleItemChange = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      let updated = { ...item, [field]: value };
      if (field === "productId" && value) {
        const prod = products.find((p) => p.id === value);
        if (prod) { updated.name = prod.name; updated.brand = prod.brand; updated.hsn = prod.hsn_code || "3209"; updated.rate = prod.selling_price; updated.mrp = prod.mrp; updated.per = prod.packing_size_unit || "pcs"; }
      }
      return recalculate(updated, taxType);
    }));
  };

  const handleTaxTypeChange = (t: "inclusive" | "exclusive") => {
    setTaxType(t);
    setItems((prev) => prev.map((item) => recalculate(item, t)));
  };

  // ─── New product modal ─────────────────────────────────────────────────────
  const handleSaveNewProduct = async () => {
    if (!newProductData.name.trim()) { alert("Product name is required"); return; }
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_name: newProductData.name, hsn_code: newProductData.hsn_code, selling_price: newProductData.selling_price, mrp: newProductData.mrp, purchase_price: newProductData.purchase_price, discount_percent: newProductData.discount_percent, packing_size_unit: newProductData.packing_size_unit, tags: [newProductData.brand], stock: 0, min_stock: 10, tax_rate: 18 }) });
      const data = await res.json();
      if (data.success && data.data) {
        const created: DealerProduct = { id: data.data.id, name: newProductData.name, brand: newProductData.brand, brandType: "sharma", hsn_code: newProductData.hsn_code, purchase_price: newProductData.purchase_price, selling_price: newProductData.selling_price, mrp: newProductData.mrp, discount_percent: newProductData.discount_percent, packing_size_unit: newProductData.packing_size_unit };
        setProducts([...products, created]);
        if (targetItemRowId) handleItemChange(targetItemRowId, "productId", created.id);
        setShowAddProductModal(false);
        setNewProductData({ name: "", brand: "Sharma Industries", hsn_code: "3209", purchase_price: 0, selling_price: 0, mrp: 0, discount_percent: 0, packing_size_unit: "pcs" });
        setTargetItemRowId(null);
      } else { alert(data.error || "Failed to save product"); }
    } catch { alert("Error saving product"); }
  };

  // ─── Totals ────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.taxableValue, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = Math.max(0, items.reduce((s, i) => s + i.total, 0) - discountAmount);

  const isIGST = useMemo(() => {
    if (!state) return false;
    const cs = state.trim().toLowerCase();
    return cs !== "rajasthan" && cs !== "08";
  }, [state]);

  const cgst = isIGST ? 0 : totalTax / 2;
  const sgst = isIGST ? 0 : totalTax / 2;
  const igst = isIGST ? totalTax : 0;

  // Brand filter
  const allBrands = useMemo(() => {
    const b = new Set<string>();
    products.forEach((p) => b.add(p.brand));
    return ["All", ...Array.from(b).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchBrand = brandFilter === "All" || p.brand === brandFilter;
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
    return matchBrand && matchSearch;
  }), [products, brandFilter, productSearch]);

  // ─── Save draft ────────────────────────────────────────────────────────────
  const saveDraft = () => {
    if (!customerName) { alert("Enter a client name to save draft."); return; }
    const id = `qdraft-${Date.now()}`;
    const draft = { id, title: `Quotation ${quotationNo || "Draft"}`, customer: customerName, amount: grandTotal, savedAt: new Date().toISOString(), data: { clientType, customerName, customerPhone, customerAddress, state, pincode, gstin, taxType, items, quotationNo, quotationDate, validUntil, notes, discountAmount } };
    const raw = localStorage.getItem("dealer_quotation_drafts");
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem("dealer_quotation_drafts", JSON.stringify([draft, ...existing]));
    alert("Draft saved!");
    router.push("/dashboard/dealer/sales/quotations");
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!customerName || items.length === 0) { alert("Fill client details and add at least one item."); return; }
    startTransition(async () => {
      const res = await saveDealerQuotation({ quotationNo, clientType, customerName, customerPhone, customerAddress, gstin, state, pincode, taxType, items: items.map((i) => ({ product_id: i.productId, name: i.name, brand: i.brand, hsn_code: i.hsn, qty: i.qty, rate: i.rate, mrp: i.mrp, amount: i.total, tax_rate: i.taxPercent })), subtotal, totalTax, cgst, sgst, igst, grandTotal, notes });
      if (res.success) {
        alert("Quotation saved successfully!");
        router.push("/dashboard/dealer/sales/quotations");
      } else {
        alert(res.error || "Failed to save quotation.");
      }
    });
  };

  const handleGeneratePDF = async () => {
    if (!previewRef.current) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({ margin: 0, filename: `${quotationNo}.pdf`, image: { type: "jpeg" as const, quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const } }).from(previewRef.current).save();
    } catch { alert("Failed to generate PDF."); }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground">Add New Client</h3>
              <button onClick={() => setShowAddClientModal(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[{ ph: "Name *", k: "name", v: newClientData.name }, { ph: "Phone *", k: "phone", v: newClientData.phone }, { ph: "GSTIN (optional)", k: "gstin", v: newClientData.gstin }, { ph: "Pincode", k: "pincode", v: newClientData.pincode }].map(({ ph, k, v }) => (
                <input key={k} placeholder={ph} value={v} onChange={(e) => setNewClientData({ ...newClientData, [k]: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              ))}
              <select value={newClientData.state_code} onChange={(e) => setNewClientData({ ...newClientData, state_code: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                <option value="" disabled>State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea placeholder="Address" value={newClientData.address} onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" rows={2} />
              <button onClick={handleSaveNewClient} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">Save Client</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><Package size={18} className="text-primary" /> Create New Product</h3>
              <button onClick={() => setShowAddProductModal(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Product Name *</label>
                <input placeholder="e.g. Rustic Royale Premium 20L" value={newProductData.name} onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Brand Name *</label>
                <input
                  placeholder="e.g. Asian Paints, Swatch, Berger, etc."
                  list="quotation-brand-suggestions"
                  value={newProductData.brand}
                  onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground text-xs outline-none focus:border-primary font-medium"
                />
                <datalist id="quotation-brand-suggestions">
                  {allBrands.filter((b) => b !== "All").map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">HSN Code</label>
                <input placeholder="3209" value={newProductData.hsn_code} onChange={(e) => setNewProductData({ ...newProductData, hsn_code: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              {[
                { label: "Purchase Price (₹)", key: "purchase_price" },
                { label: "Selling Price (₹)", key: "selling_price" },
                { label: "MRP (₹)", key: "mrp" },
                { label: "Discount %", key: "discount_percent" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
                  <input type="number" placeholder="0" value={(newProductData as any)[key] || ""} onChange={(e) => setNewProductData({ ...newProductData, [key]: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Pack Size / Unit</label>
                <input placeholder="e.g. 20L, 40Kg, pcs" value={newProductData.packing_size_unit} onChange={(e) => setNewProductData({ ...newProductData, packing_size_unit: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
            </div>
            <button onClick={handleSaveNewProduct} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <Check size={16} /> Create & Add to Quotation
            </button>
          </div>
        </div>
      )}

      {/* Visual Brand & Product Catalog Modal ("Add to Cart" style picker) */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Package size={22} className="text-primary" /> Visual Brand & Product Catalog
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse products by brand, view MRP & selling rates, and add directly to your quotation
                </p>
              </div>
              <button onClick={() => setShowCatalogModal(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Brand Selection Tabs */}
            <div className="px-5 py-3 border-b border-border bg-background flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2">Brands:</span>
              {allBrands.map((b) => {
                const count = b === "All" ? products.length : products.filter((p) => p.brand === b).length;
                return (
                  <button
                    key={b}
                    onClick={() => setBrandFilter(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 ${
                      brandFilter === b ? "bg-primary text-white border-primary shadow-xs" : `${getBrandColor(b)} hover:opacity-90`
                    }`}
                  >
                    {b} <span className="opacity-75 text-[10px]">({count})</span>
                  </button>
                );
              })}
              <div className="ml-auto relative w-full sm:w-64 mt-2 sm:mt-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search catalog…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-muted/10">
              {filteredProducts.map((prod) => {
                const inCartCount = items.filter((i) => i.productId === prod.id).reduce((s, i) => s + i.qty, 0);
                const margin = prod.selling_price - prod.purchase_price;
                return (
                  <div key={prod.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs group">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${getBrandColor(prod.brand)}`}>
                          {prod.brand}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">HSN: {prod.hsn_code}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2 mt-1 mb-2">
                        <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors leading-snug flex-1">
                          {prod.name}
                        </h3>
                        <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                          {prod.packing_size_unit || "pcs"}
                        </span>
                      </div>

                      {/* Price display */}
                      <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-center bg-muted/30 rounded-xl p-2">
                        <div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase block">MRP</span>
                          <span className="text-xs font-semibold line-through text-muted-foreground">₹{prod.mrp}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase block">Selling</span>
                          <span className="text-xs font-black text-emerald-600">₹{prod.selling_price}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase block">Margin</span>
                          <span className="text-xs font-bold text-primary">₹{margin > 0 ? margin : 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4 pt-3 flex items-center justify-between border-t border-border/40">
                      {inCartCount > 0 ? (
                        <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                          <Check size={14} /> Added ({inCartCount})
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not in quotation</span>
                      )}
                      <button
                        onClick={() => handleAddToCart(prod, 1)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Plus size={14} /> Add to Quotation
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-card flex items-center justify-between">
              <div className="text-xs font-bold text-foreground">
                Selected Items: <span className="text-primary font-black">{items.length} products</span> (Subtotal: ₹{subtotal.toFixed(2)})
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Done & Review Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <FileText className="text-primary" size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Quotation Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Dealer Portal · Create quotations for customers, contractors & painters</p>
        </div>
        <div className="ml-auto">
          <Link href="/dashboard/dealer/sales/quotations" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded-xl px-3 py-2 hover:bg-muted/40 transition-colors">
            ← Back to Quotations
          </Link>
        </div>
      </div>

      {/* STEP 1 */}
      {currentStep === 1 && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-8">

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2"><FileText size={14} className="text-primary" /> Quotation Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ label: "Quotation No.", value: quotationNo, setter: setQuotationNo, type: "text" }, { label: "Quotation Date", value: quotationDate, setter: setQuotationDate, type: "date" }, { label: "Valid Until", value: validUntil, setter: setValidUntil, type: "date" }].map(({ label, value, setter, type }) => (
                  <div key={label}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
                    <input type={type} value={value} onChange={(e) => setter(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                  </div>
                ))}
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2"><User size={14} className="text-primary" /> Client Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Client Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Customer", "Contractor/Painter"] as ClientType[]).map((ct) => (
                      <button key={ct} type="button" onClick={() => { setClientType(ct); setSelectedClientId(""); setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${clientType === ct ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground hover:bg-muted/40"}`}>
                        {ct === "Customer" ? "👤 Customer" : "🎨 Contractor / Painter"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Select Client</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <select value={selectedClientId} onChange={(e) => handleClientSelect(e.target.value)} className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium appearance-none">
                        <option value="">-- Manual Entry --</option>
                        {clientType === "Contractor/Painter"
                          ? dealerPainters.map((p) => <option key={p.id} value={p.id}>{p.name}{p.city ? ` · ${p.city}` : ""}</option>)
                          : dealerClients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone || "No Phone"})</option>)}
                      </select>
                    </div>
                    <button onClick={() => setShowAddClientModal(true)} className="px-3 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl border border-primary/20 font-bold text-xs flex items-center gap-1">
                      <Plus size={14} /> New
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Client Name</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer / Contractor / Painter Name" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">GSTIN (if applicable)</label>
                  <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="08XXXXXXXXXXX" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Contact Number</label>
                  <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 99999 99999" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium">
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Pincode</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 324005" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Tax Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["exclusive", "inclusive"] as const).map((tt) => (
                      <button key={tt} type="button" onClick={() => handleTaxTypeChange(tt)} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${taxType === tt ? "bg-primary text-white border-primary" : "bg-background border-border hover:bg-muted/40"}`}>
                        Tax {tt.charAt(0).toUpperCase() + tt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Address</label>
                  <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={2} placeholder="Billing / Site Address" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2"><Landmark size={14} className="text-primary" /> Discount</h3>
              <div className="max-w-xs">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Discount / Markdown (₹)</label>
                <input type="number" value={discountAmount || ""} onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/20 max-w-xs">
                <span className="text-sm font-bold text-foreground">Quoted Total:</span>
                <span className="text-lg font-black text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-end mb-4 border-t border-border pt-4">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2"><Layers size={14} className="text-primary" /> Line Items</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowCatalogModal(true)} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-all">
                    <Package size={14} /> 🛍️ Visual Brand Catalog & Cart
                  </button>
                  <button onClick={handleAddItem} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all">
                    <Plus size={14} /> Add Row
                  </button>
                </div>
              </div>

              {/* Brand filter */}
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex items-center gap-1.5 mr-1"><Tag size={12} className="text-muted-foreground" /><span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Brand:</span></div>
                {allBrands.map((brand) => (
                  <button key={brand} onClick={() => setBrandFilter(brand)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${brandFilter === brand ? "bg-foreground text-background border-foreground" : `${getBrandColor(brand)} hover:opacity-80`}`}>{brand}</button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <Search size={13} className="text-muted-foreground" />
                  <input type="text" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-1 text-xs outline-none focus:border-primary w-40" />
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-4 bg-background border border-border rounded-2xl relative shadow-sm">
                    <button onClick={() => handleRemoveItem(item.id)} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md"><Trash2 size={13} /></button>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-muted-foreground uppercase font-black">Product</label>
                          <button type="button" onClick={() => { setTargetItemRowId(item.id); setShowAddProductModal(true); }} className="text-[10px] text-primary hover:underline font-extrabold flex items-center gap-0.5"><Plus size={11} /> New</button>
                        </div>
                        <select value={item.productId} onChange={(e) => handleItemChange(item.id, "productId", e.target.value)} className="w-full bg-white dark:bg-white text-slate-900 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary font-medium">
                          <option className="bg-white text-slate-900" value="">-- Select Product --</option>
                          {filteredProducts.map((p) => <option className="bg-white text-slate-900" key={p.id} value={p.id}>[{p.brand}] {p.name} — ₹{p.selling_price} (MRP: ₹{p.mrp})</option>)}
                        </select>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="text-xs text-muted-foreground uppercase font-black block mb-1">Brand</label>
                        <div className={`px-2 py-2 rounded-xl border text-[10px] font-black text-center truncate ${item.brand ? getBrandColor(item.brand) : "bg-muted text-muted-foreground border-border"}`}>{item.brand || "—"}</div>
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <label className="text-xs text-muted-foreground uppercase font-black block mb-1">HSN</label>
                        <input type="text" value={item.hsn} onChange={(e) => handleItemChange(item.id, "hsn", e.target.value)} className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-primary text-center" />
                      </div>
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-xs text-muted-foreground uppercase font-black block mb-1">Qty</label>
                        <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, "qty", parseInt(e.target.value) || 0)} className="w-full bg-card border border-border rounded-xl px-2 py-2 text-sm font-black text-foreground outline-none focus:border-primary text-center" />
                      </div>
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-xs text-muted-foreground uppercase font-black block mb-1">Rate ₹</label>
                        <input type="number" value={item.rate} onChange={(e) => handleItemChange(item.id, "rate", parseFloat(e.target.value) || 0)} className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-primary text-right" />
                      </div>
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-xs text-muted-foreground uppercase font-black block mb-1">GST%</label>
                        <select value={item.taxPercent} onChange={(e) => handleItemChange(item.id, "taxPercent", parseFloat(e.target.value) || 0)} className="w-full bg-white dark:bg-white text-slate-900 border border-border rounded-xl px-2 py-2 text-xs outline-none focus:border-primary text-center font-medium">
                          {[0, 5, 12, 18, 28].map((v) => <option key={v} className="bg-white text-slate-900" value={v}>{v}%</option>)}
                        </select>
                      </div>
                      <div className="col-span-12 md:col-span-1">
                        <label className="text-xs text-muted-foreground uppercase font-black block mb-1">Total</label>
                        <input readOnly value={`₹${item.total.toFixed(0)}`} className="w-full bg-muted border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none text-right font-bold" />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                      <div className="flex gap-3">
                        {item.mrp > 0 && <span>MRP: <strong className="text-foreground">₹{item.mrp}</strong></span>}
                        <span>Taxable: <strong className="text-foreground">₹{item.taxableValue.toFixed(2)}</strong></span>
                        <span>Tax: <strong className="text-foreground">₹{item.taxAmount.toFixed(2)}</strong></span>
                      </div>
                      <span className="font-bold text-primary">Line Total: ₹{item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                    <Package size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No items added yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Product" to build your quotation</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Notes / Terms</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="e.g. Prices valid for 30 days, GST extra, delivery charges applicable…" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex gap-4">
              <button type="button" onClick={saveDraft} className="flex-1 py-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-extrabold rounded-xl border border-border transition-all">Save Draft</button>
              <button type="button" onClick={() => { if (!customerName || items.length === 0) { alert("Fill client details and add at least one item."); return; } setCurrentStep(2); }} className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-xl transition-all shadow-lg">
                Preview & Confirm →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Preview */}
      {currentStep === 2 && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
            <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl px-4 py-2 hover:bg-muted/40 transition-colors">← Edit Quotation</button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Template Theme:</span>
              <select
                value={quotationTheme}
                onChange={(e) => setQuotationTheme(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
              >
                <option value="classic">Classic GST</option>
                <option value="modern">Modern Minimalist</option>
                <option value="executive">Executive Corporate</option>
                <option value="compact">Clean Compact</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={handleGeneratePDF} className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border text-foreground font-bold rounded-xl text-sm hover:bg-muted/80 transition-all"><Download size={15} /> Download PDF</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-md"><Check size={15} /> Submit Quotation</button>
            </div>
          </div>

          <div className="overflow-x-auto bg-card border border-border p-8 rounded-2xl shadow-sm">
            <div ref={previewRef} className="bg-white text-black p-10 min-h-[1123px] w-[794px] mx-auto shadow-md">
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">QUOTATION</h1>
                  <p className="text-slate-500 font-medium mt-1">Quotation No: {quotationNo}</p>
                  <p className="text-slate-500 font-medium" suppressHydrationWarning>Date: {isMounted && quotationDate ? new Date(quotationDate).toLocaleDateString("en-IN") : quotationDate}</p>
                  <p className="text-slate-500 font-medium" suppressHydrationWarning>Valid Until: {isMounted && validUntil ? new Date(validUntil).toLocaleDateString("en-IN") : validUntil}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-slate-800">Sharma Industries</h2>
                  <p className="text-slate-600">GSTIN: 08AABCU9603R1ZX</p>
                  <p className="text-slate-500 text-sm">Bundi, Rajasthan</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quoted To</p>
                  <p className="font-bold text-slate-800 text-lg">{customerName}</p>
                  <p className="text-slate-600 text-sm">{customerAddress}</p>
                  {gstin && <p className="text-slate-600 text-sm">GSTIN: {gstin}</p>}
                  <p className="text-slate-600 text-sm">📞 {customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Validity</p>
                  <p className="text-slate-700 font-semibold" suppressHydrationWarning>{isMounted && validUntil ? new Date(validUntil).toLocaleDateString("en-IN") : validUntil}</p>
                  <p className="text-xs text-slate-400 mt-1">{clientType}</p>
                </div>
              </div>
              <table className="w-full mb-8">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                    {["Item", "Brand", "HSN", "Qty", "Rate", "MRP", "Taxable", "Total"].map((h, i) => (
                      <th key={h} className={`py-3 px-2 font-bold ${i === 0 ? "text-left rounded-tl-lg" : i === 7 ? "text-right rounded-tr-lg" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3 px-2 text-slate-800 font-semibold text-sm">{item.name}</td>
                      <td className="py-3 px-2 text-slate-500 text-xs">{item.brand}</td>
                      <td className="py-3 px-2 text-right text-slate-600 text-xs">{item.hsn}</td>
                      <td className="py-3 px-2 text-right text-slate-800 text-sm">{item.qty}</td>
                      <td className="py-3 px-2 text-right text-slate-800 text-sm">₹{item.rate.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-2 text-right text-slate-500 text-xs">₹{item.mrp > 0 ? item.mrp.toLocaleString("en-IN") : "—"}</td>
                      <td className="py-3 px-2 text-right text-slate-800 text-sm">₹{item.taxableValue.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right font-bold text-slate-800 text-sm">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm"><span>Subtotal</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span></div>
                  {!isIGST && totalTax > 0 && (<><div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm"><span>CGST</span><span className="font-semibold">₹{cgst.toFixed(2)}</span></div><div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm"><span>SGST</span><span className="font-semibold">₹{sgst.toFixed(2)}</span></div></>)}
                  {isIGST && totalTax > 0 && <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm"><span>IGST</span><span className="font-semibold">₹{igst.toFixed(2)}</span></div>}
                  {discountAmount > 0 && <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-600 text-sm"><span>Discount</span><span className="font-semibold">-₹{discountAmount.toFixed(2)}</span></div>}
                  <div className="flex justify-between py-3 text-lg font-black text-slate-800 border-b-2 border-slate-800 mt-2"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Amount in Words</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">Rupees {numberToWords(grandTotal)} Only</p>
              </div>
              {notes && <div className="mt-4 p-4 border border-slate-200 rounded-xl"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes & Terms</p><p className="text-sm text-slate-600">{notes}</p></div>}
              <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center"><p>This is a quotation only. No payment is due until a formal invoice is issued.</p><p className="mt-1">Sharma Industries · Bundi, Rajasthan · GSTIN: 08AABCU9603R1ZX</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
