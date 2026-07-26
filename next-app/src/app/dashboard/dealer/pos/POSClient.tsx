// POS Counter Billing with live invoice preview, template switcher, client address & pincode registration, and embedded dealer UPI payment QR code
"use client";

import React, { useState, useEffect, useMemo, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Printer, Download, Check, X, ShieldAlert, User, Phone,
  Sparkles, RefreshCw, ChevronDown, CheckCircle2, Package,
  ArrowRight, FileText, LayoutGrid, List, Clock, History,
  LayoutTemplate, FileDown, ExternalLink, IndianRupee, Copy
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { getDealerNextPOSInvoiceNumber, saveDealerPOSInvoice } from "./actions";
import { getDealerUPIConfig, generateUPIPaymentURI, getUPIQRCodeURL } from "@/lib/upi";

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

interface POSCartItem {
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
  unit?: string;
}

type ClientType = "Customer" | "Contractor/Painter";
type PaymentMode = "Cash" | "UPI / QR" | "Card" | "Net Banking" | "Credit";
type ActiveTab = "pos" | "history" | "templates" | "drafts";

const INDIAN_STATES = [
  "Rajasthan", "Delhi", "Maharashtra", "Gujarat", "Punjab", "Haryana",
  "Uttar Pradesh", "Madhya Pradesh", "Karnataka", "Tamil Nadu", "West Bengal",
  "Bihar", "Telangana", "Andhra Pradesh", "Kerala", "Other State"
];

const CREDIT_PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days (1 Month)", value: 30 },
  { label: "45 Days", value: 45 },
  { label: "60 Days (2 Months)", value: 60 },
  { label: "90 Days (3 Months)", value: 90 },
  { label: "Custom Days", value: "custom" },
];

const INVOICE_TEMPLATES = [
  {
    id: "standard",
    name: "Standard Tax Invoice",
    desc: "GST-compliant tax invoice with full CGST/SGST/IGST breakdown and MRP display",
    tag: "Most Used",
    tagColor: "bg-primary/10 text-primary border-primary/20",
    fields: ["Customer/Contractor", "Brand Selection", "CGST/SGST/IGST", "MRP Display"],
    mode: "Cash" as PaymentMode,
  },
  {
    id: "advance",
    name: "Advance Payment Invoice",
    desc: "Invoice for partial/advance payment with balance due tracking and credit terms",
    tag: "Finance",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    fields: ["Customer Details", "Advance Amount", "Balance Due", "Credit Terms"],
    mode: "Credit" as PaymentMode,
  },
  {
    id: "painter-invoice",
    name: "Contractor & Painter Invoice",
    desc: "Quick counter billing for paint contractors with hidden internal referral commission",
    tag: "Painter",
    tagColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    fields: ["Painter Selection", "Internal Commission", "Brand Rates", "GST"],
    mode: "Cash" as PaymentMode,
  },
  {
    id: "credit-note",
    name: "Credit Sale Invoice",
    desc: "Deferred credit billing with clear payment period terms (7, 15, 30, 60, 90 days)",
    tag: "Credit Sale",
    tagColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    fields: ["Client Select", "Credit Time Period", "Due Date", "Balance Due"],
    mode: "Credit" as PaymentMode,
  },
];

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

export function POSClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "pos";

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [isPending, startTransition] = useTransition();

  // Invoices History State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Bill Meta
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">("exclusive");

  // Client Selection
  const [clientType, setClientType] = useState<ClientType>("Customer");
  const [dealerClients, setDealerClients] = useState<any[]>([]);
  const [dealerPainters, setDealerPainters] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customerName, setCustomerName] = useState("Walk-In Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [state, setState] = useState("Rajasthan");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");

  // Payment Details
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [creditPeriodOption, setCreditPeriodOption] = useState<number | "custom">(30);
  const [customCreditDays, setCustomCreditDays] = useState<number>(30);

  // Internal Painter Commission
  const [painterId, setPainterId] = useState("");
  const [hiddenCommissionAmount, setHiddenCommissionAmount] = useState(0);

  // Products & Cart
  const [products, setProducts] = useState<DealerProduct[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [productSearch, setProductSearch] = useState<string>("");
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [enableRoundOff, setEnableRoundOff] = useState(true);
  const [notes, setNotes] = useState("");

  // Modals
  const [showThermalSlipModal, setShowThermalSlipModal] = useState(false);
  const [previewTemplateTheme, setPreviewTemplateTheme] = useState<"thermal" | "classic" | "modern" | "brand">("thermal");
  const [lastSavedInvoice, setLastSavedInvoice] = useState<any | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", phone: "", gstin: "", address: "", state_code: "Rajasthan", pincode: "" });
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductData, setNewProductData] = useState({ name: "", brand: "Sharma Industries", hsn_code: "3209", purchase_price: 0, selling_price: 0, mrp: 0, discount_percent: 0, packing_size_unit: "pcs" });

  // Dealer UPI Config
  const [dealerUPI, setDealerUPI] = useState({ upiId: "sharmadealer@upi", payeeName: "Sharma Paint Traders" });

  // Initial Load
  useEffect(() => {
    setDealerUPI(getDealerUPIConfig());
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    getDealerNextPOSInvoiceNumber().then((no) => setInvoiceNo(no));

    async function loadData() {
      try {
        const [prodRes, compRes, clientRes, paintersRes, invsRes] = await Promise.all([
          fetch("/api/products").then((r) => r.json().catch(() => ({ success: false }))),
          fetch("/api/competitor-products").then((r) => r.json().catch(() => ({ success: false }))),
          fetch("/api/clients").then((r) => r.json().catch(() => ({ success: false }))),
          fetch("/api/painters").then((r) => r.json().catch(() => ({ success: false }))),
          fetch("/api/invoices").then((r) => r.json().catch(() => ({ success: false }))),
        ]);

        if (clientRes.success && clientRes.data) setDealerClients(clientRes.data);
        if (paintersRes.success && paintersRes.data) setDealerPainters(paintersRes.data);
        if (invsRes.success && invsRes.data) setInvoices(invsRes.data);

        let allProds: DealerProduct[] = [];
        if (prodRes.success && prodRes.data) {
          allProds = [...allProds, ...prodRes.data.map((p: any): DealerProduct => {
            const brandName = p.brand || (Array.isArray(p.tags) && p.tags[0]) || "Sharma Industries";
            return {
              id: p.id,
              name: p.product_name || p.name || "",
              brand: brandName,
              brandType: brandName === "Sharma Industries" ? "sharma" : "brand",
              hsn_code: p.hsn_code || "3209",
              purchase_price: Number(p.purchase_price || p.cost_price || 0),
              selling_price: Number(p.selling_price || 0),
              mrp: Number(p.mrp || p.selling_price || 0),
              discount_percent: 0,
              packing_size_unit: p.packing_size_unit || "pcs",
              tags: p.tags,
            };
          })];
        }

        if (compRes.success && compRes.data) {
          allProds = [...allProds, ...compRes.data.map((cp: any): DealerProduct => ({
            id: cp.id,
            name: cp.product_name || "",
            brand: cp.brand || "Other Brands",
            brandType: "brand",
            hsn_code: "3209",
            purchase_price: Number(cp.trade_price || cp.purchase_price || cp.dealer_price || 0),
            selling_price: Number(cp.selling_price || cp.mrp || 0),
            mrp: Number(cp.mrp || 0),
            discount_percent: Number(cp.discount_percent || 0),
            packing_size_unit: cp.pack_size || "pcs",
            tags: [cp.brand || "Other Brands"],
          }))];
        }

        setProducts(allProds);
      } catch (err) {
        console.error("Failed to load POS data:", err);
      }
    }
    loadData();
  }, []);

  // Client Selection logic
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) {
      setCustomerName("Walk-In Customer");
      setCustomerPhone("");
      setCustomerAddress("");
      setGstin("");
      setState("Rajasthan");
      setPincode("");
      return;
    }
    if (clientType === "Contractor/Painter") {
      const p = dealerPainters.find((x) => x.id === clientId);
      if (p) {
        setCustomerName(p.name || "");
        setCustomerPhone(p.phone || "");
        setCustomerAddress(p.city || "");
      }
    } else {
      const c = dealerClients.find((x) => x.id === clientId);
      if (c) {
        setCustomerName(c.name || "");
        setCustomerPhone(c.phone || "");
        setCustomerAddress(c.address || "");
        setGstin(c.gstin || "");
        setState(c.state_code || "Rajasthan");
        setPincode(c.pincode || "");
      }
    }
  };

  const handleSaveNewClient = async () => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDealerClients([...dealerClients, data.data]);
        setSelectedClientId(data.data.id);
        setCustomerName(data.data.name);
        setCustomerPhone(data.data.phone || "");
        setCustomerAddress(data.data.address || "");
        setGstin(data.data.gstin || "");
        setState(data.data.state_code || "Rajasthan");
        setPincode(data.data.pincode || "");
        setShowAddClientModal(false);
        setNewClientData({ name: "", phone: "", gstin: "", address: "", state_code: "Rajasthan", pincode: "" });
      }
    } catch {
      alert("Error saving client");
    }
  };

  // Cart Management
  const addToCart = (product: DealerProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) => {
          if (item.productId === product.id) {
            const newQty = item.qty + 1;
            const taxableValue = taxType === "inclusive" ? (newQty * item.rate) / (1 + item.taxPercent / 100) : newQty * item.rate;
            const taxAmount = taxType === "inclusive" ? newQty * item.rate - taxableValue : taxableValue * (item.taxPercent / 100);
            const total = taxType === "inclusive" ? newQty * item.rate : taxableValue + taxAmount;
            return { ...item, qty: newQty, taxableValue, taxAmount, total };
          }
          return item;
        });
      }
      const qty = 1;
      const rate = product.selling_price;
      const taxPercent = 18;
      const taxableValue = taxType === "inclusive" ? (qty * rate) / (1 + taxPercent / 100) : qty * rate;
      const taxAmount = taxType === "inclusive" ? qty * rate - taxableValue : taxableValue * (taxPercent / 100);
      const total = taxType === "inclusive" ? qty * rate : taxableValue + taxAmount;
      return [
        ...prev,
        {
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          productId: product.id,
          name: product.name,
          brand: product.brand,
          hsn: product.hsn_code,
          qty,
          purchasePrice: product.purchase_price,
          rate,
          mrp: product.mrp,
          taxPercent,
          taxableValue,
          taxAmount,
          total,
          unit: product.packing_size_unit,
        },
      ];
    });
  };

  const updateCartQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const taxableValue = taxType === "inclusive" ? (newQty * item.rate) / (1 + item.taxPercent / 100) : newQty * item.rate;
          const taxAmount = taxType === "inclusive" ? newQty * item.rate - taxableValue : taxableValue * (item.taxPercent / 100);
          const total = taxType === "inclusive" ? newQty * item.rate : taxableValue + taxAmount;
          return { ...item, qty: newQty, taxableValue, taxAmount, total };
        }
        return item;
      })
    );
  };

  const updateCartRate = (id: string, field: "rate" | "mrp" | "taxPercent", val: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          const qty = updated.qty;
          const rate = updated.rate;
          const taxPercent = updated.taxPercent;
          const taxableValue = taxType === "inclusive" ? (qty * rate) / (1 + taxPercent / 100) : qty * rate;
          const taxAmount = taxType === "inclusive" ? qty * rate - taxableValue : taxableValue * (taxPercent / 100);
          const total = taxType === "inclusive" ? qty * rate : taxableValue + taxAmount;
          return { ...updated, taxableValue, taxAmount, total };
        }
        return item;
      })
    );
  };

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCreateNewProduct = async () => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: newProductData.name,
          hsn_code: newProductData.hsn_code,
          selling_price: newProductData.selling_price,
          mrp: newProductData.mrp,
          purchase_price: newProductData.purchase_price,
          discount_percent: newProductData.discount_percent,
          packing_size_unit: newProductData.packing_size_unit,
          tags: [newProductData.brand],
          stock: 0,
          min_stock: 10,
          tax_rate: 18,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const created: DealerProduct = {
          id: data.data.id,
          name: newProductData.name,
          brand: newProductData.brand,
          brandType: "sharma",
          hsn_code: newProductData.hsn_code,
          purchase_price: newProductData.purchase_price,
          selling_price: newProductData.selling_price,
          mrp: newProductData.mrp,
          discount_percent: newProductData.discount_percent,
          packing_size_unit: newProductData.packing_size_unit,
        };
        setProducts([...products, created]);
        addToCart(created);
        setShowAddProductModal(false);
        setNewProductData({ name: "", brand: "Sharma Industries", hsn_code: "3209", purchase_price: 0, selling_price: 0, mrp: 0, discount_percent: 0, packing_size_unit: "pcs" });
      }
    } catch {
      alert("Error creating product");
    }
  };


  // Calculations
  const subtotal = cartItems.reduce((s, i) => s + i.taxableValue, 0);
  const totalTax = cartItems.reduce((s, i) => s + i.taxAmount, 0);
  const baseGrandTotal = Math.max(0, cartItems.reduce((s, i) => s + i.total, 0) - discountAmount);
  const roundOffDiff = enableRoundOff ? Math.round(baseGrandTotal) - baseGrandTotal : 0;
  const grandTotal = baseGrandTotal + roundOffDiff;

  const isIGST = useMemo(() => {
    if (!state) return false;
    const cs = state.trim().toLowerCase();
    return cs !== "rajasthan" && cs !== "08";
  }, [state]);

  const cgst = isIGST ? 0 : totalTax / 2;
  const sgst = isIGST ? 0 : totalTax / 2;
  const igst = isIGST ? totalTax : 0;

  const finalCreditDays = creditPeriodOption === "custom" ? customCreditDays : Number(creditPeriodOption);

  // Dynamic Brands
  const allBrands = useMemo(() => {
    const setB = new Set<string>();
    products.forEach((p) => setB.add(p.brand));
    return ["All", ...Array.from(setB).sort()];
  }, [products]);

  // Filtered catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchBrand = brandFilter === "All" || p.brand === brandFilter;
      const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [products, brandFilter, productSearch]);

  // Filtered Invoices History
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const name = typeof inv.customer === "object" && inv.customer !== null ? inv.customer.name || "" : inv.customer || "";
      const matchSearch = !historySearch || inv.invoice_no?.toLowerCase().includes(historySearch.toLowerCase()) || name.toLowerCase().includes(historySearch.toLowerCase());
      const matchFilter = historyFilter === "All" || inv.payment_status === historyFilter || (historyFilter === "Credit" && inv.payment_mode === "Credit");
      return matchSearch && matchFilter;
    });
  }, [invoices, historySearch, historyFilter]);

  // Submit POS Bill Handler
  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty! Add products before checking out.");
      return;
    }

    startTransition(async () => {
      const payload = {
        invoiceNo,
        date: invoiceDate,
        customerName: customerName || "Walk-In Customer",
        customerPhone,
        customerAddress,
        gstin,
        state,
        pincode,
        clientType,
        items: cartItems.map((i) => ({
          product_id: i.productId,
          name: i.name,
          brand: i.brand,
          hsn_code: i.hsn,
          qty: i.qty,
          rate: i.rate,
          mrp: i.mrp,
          amount: i.total,
          tax_rate: i.taxPercent,
        })),
        subtotal,
        totalTax,
        cgst,
        sgst,
        igst,
        grandTotal,
        balanceDue: paymentMode === "Credit" ? grandTotal : 0,
        paymentMode,
        creditPeriodDays: paymentMode === "Credit" ? finalCreditDays : null,
        advancePaid: paymentMode === "Credit" ? 0 : grandTotal,
        discountAmount,
        notes,
        taxType,
        painterId: painterId || null,
        hiddenCommissionAmount: hiddenCommissionAmount || 0,
      };

      const res = await saveDealerPOSInvoice(payload);
      if (res.success && res.data) {
        setLastSavedInvoice(res.data);
        setInvoices([res.data, ...invoices]);
        // Open live template preview modal with template themes & embedded UPI QR code
        setShowThermalSlipModal(true);
        // Auto-update invoice number immediately for next bill
        getDealerNextPOSInvoiceNumber().then((nextNo) => setInvoiceNo(nextNo));
      } else {
        alert(res.error || "Failed to save POS invoice.");
      }
    });
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleApplyTemplate = (tpl: typeof INVOICE_TEMPLATES[0]) => {
    setPaymentMode(tpl.mode);
    setActiveTab("pos");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* ── Top Header Navigation Bar ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
            POS
          </span>
          <div>
            <h1 className="text-lg font-black text-foreground flex items-center gap-2">
              POS Billing & Invoice Hub
            </h1>
            <p className="text-xs text-muted-foreground">
              Counter POS sales, invoice history, thermal slip printing & templates
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-muted p-1 rounded-xl border border-border gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "pos" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ⚡ POS Billing
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "history" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History size={13} /> Invoice History ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "templates" ? "bg-primary text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutTemplate size={13} /> Templates
          </button>
        </div>
      </div>

      {/* ── TAB 1: POS BILLING COUNTER ────────────────────────────────────── */}
      {activeTab === "pos" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Controls sub-bar */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                Bill No: <strong className="text-primary font-mono text-sm">{invoiceNo || "DL(POS)-XXXX"}</strong>
                <button
                  onClick={() => getDealerNextPOSInvoiceNumber().then((no) => setInvoiceNo(no))}
                  title="Auto-refresh Invoice Number"
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <RefreshCw size={12} />
                </button>
              </span>
              <span>· Date: {invoiceDate}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-muted p-1 rounded-xl border border-border text-xs font-bold">
                <button
                  onClick={() => setTaxType("exclusive")}
                  className={`px-3 py-1 rounded-lg transition-all ${taxType === "exclusive" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}
                >
                  Tax Exclusive
                </button>
                <button
                  onClick={() => setTaxType("inclusive")}
                  className={`px-3 py-1 rounded-lg transition-all ${taxType === "inclusive" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}
                >
                  Tax Inclusive
                </button>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <Plus size={14} /> Custom Product
              </button>

              <button
                onClick={() => setCartItems([])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:text-rose-600 border border-border rounded-xl text-xs font-bold transition-all"
              >
                <RefreshCw size={14} /> Clear Cart
              </button>
            </div>
          </div>

          {/* Dual Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Panel: Catalog */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search products by name, brand, HSN..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0">Brands:</span>
                    {allBrands.map((b) => {
                      const count = b === "All" ? products.length : products.filter((p) => p.brand === b).length;
                      return (
                        <button
                          key={b}
                          onClick={() => setBrandFilter(b)}
                          className={`px-3 py-1 rounded-xl text-xs font-black border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            brandFilter === b ? "bg-primary text-white border-primary shadow-2xs" : `${getBrandColor(b)} hover:opacity-90`
                          }`}
                        >
                          {b} <span className="opacity-75 text-[10px]">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
                  {filteredProducts.map((prod) => {
                    const inCart = cartItems.find((i) => i.productId === prod.id);
                    return (
                      <div
                        key={prod.id}
                        className="bg-background border border-border hover:border-primary/50 rounded-xl p-3.5 flex flex-col justify-between transition-all group shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${getBrandColor(prod.brand)}`}>
                              {prod.brand}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">HSN: {prod.hsn_code}</span>
                          </div>

                          <div className="flex items-start justify-between gap-2 mt-1 mb-2">
                            <h3 className="font-bold text-foreground text-xs group-hover:text-primary transition-colors leading-snug flex-1">
                              {prod.name}
                            </h3>
                            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-primary/10 text-primary border border-primary/20">
                              {prod.packing_size_unit || "pcs"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black text-muted-foreground block uppercase">Selling Price</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-emerald-600">₹{prod.selling_price}</span>
                              {prod.mrp > prod.selling_price && (
                                <span className="text-[10px] font-semibold line-through text-muted-foreground">₹{prod.mrp}</span>
                              )}
                            </div>
                          </div>

                          {inCart ? (
                            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-lg p-1">
                              <button onClick={() => updateCartQty(inCart.id, inCart.qty - 1)} className="w-6 h-6 rounded bg-card flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white">-</button>
                              <span className="text-xs font-black px-2 text-primary">{inCart.qty}</span>
                              <button onClick={() => updateCartQty(inCart.id, inCart.qty + 1)} className="w-6 h-6 rounded bg-card flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white">+</button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(prod)} className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs">
                              <Plus size={13} /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Cart & Payment */}
            <div className="lg:col-span-5 space-y-4">
              {/* Customer Selection */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <User size={16} className="text-primary" /> Customer & Client Details
                  </h3>
                  <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border text-[11px] font-bold">
                    <button onClick={() => { setClientType("Customer"); setSelectedClientId(""); setCustomerName("Walk-In Customer"); }} className={`px-2 py-1 rounded ${clientType === "Customer" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}>Customer</button>
                    <button onClick={() => { setClientType("Contractor/Painter"); setSelectedClientId(""); setCustomerName(""); }} className={`px-2 py-1 rounded ${clientType === "Contractor/Painter" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}>Painter</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="col-span-2 flex gap-2">
                    <select value={selectedClientId} onChange={(e) => handleClientSelect(e.target.value)} className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-foreground font-medium outline-none">
                      <option value="">-- Quick Walk-In Customer --</option>
                      {clientType === "Contractor/Painter"
                        ? dealerPainters.map((p) => <option key={p.id} value={p.id}>{p.name}{p.city ? ` · ${p.city}` : ""}</option>)
                        : dealerClients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone || "No Phone"})</option>)}
                    </select>
                    <button onClick={() => setShowAddClientModal(true)} className="px-2.5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold">+ New</button>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Name</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name" className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-medium outline-none text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Phone</label>
                    <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 99999 99999" className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-medium outline-none text-xs" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Customer / Site Address</label>
                    <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="e.g. Plot 42, Civil Lines, Bundi, Rajasthan" className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground font-medium outline-none focus:border-primary text-xs" />
                  </div>
                </div>
              </div>

              {/* Order Cart */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <ShoppingCart size={16} className="text-primary" /> Order Items ({cartItems.length})
                  </h3>
                  <span className="text-xs font-black text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-background border border-border rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black ${getBrandColor(item.brand)}`}>{item.brand}</span>
                          <h4 className="font-bold text-xs text-foreground mt-1">{item.name}</h4>
                        </div>
                        <button onClick={() => removeCartItem(item.id)} className="text-muted-foreground hover:text-rose-500 p-1"><Trash2 size={13} /></button>
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center text-xs pt-1 border-t border-border/40">
                        <div className="col-span-4 flex items-center gap-1">
                          <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="w-5 h-5 rounded bg-muted flex items-center justify-center font-bold text-foreground">-</button>
                          <input type="number" min="1" value={item.qty} onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)} className="w-10 bg-card border border-border rounded text-center py-0.5 text-xs font-bold text-foreground" />
                          <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="w-5 h-5 rounded bg-muted flex items-center justify-center font-bold text-foreground">+</button>
                          {item.unit && <span className="text-[10px] text-muted-foreground font-bold">{item.unit}</span>}
                        </div>
                        <div className="col-span-4">
                          <input type="number" value={item.rate} onChange={(e) => updateCartRate(item.id, "rate", parseFloat(e.target.value) || 0)} className="w-full bg-card border border-border rounded px-1.5 py-0.5 text-xs text-right font-bold text-foreground" />
                        </div>
                        <div className="col-span-4 text-right">
                          <span className="font-black text-xs text-emerald-600">₹{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cartItems.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-border rounded-xl">
                      <ShoppingCart size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-xs text-muted-foreground font-medium">Cart is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Mode & Credit Terms */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" /> Payment Mode & Terms
                </h3>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {(["Cash", "UPI / QR", "Card", "Net Banking", "Credit"] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        paymentMode === mode ? "bg-primary text-white border-primary shadow-2xs" : "bg-background border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Dynamic UPI QR Code Display */}
                {paymentMode === "UPI / QR" && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-2 text-center animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                        Scan & Pay via UPI ({dealerUPI.upiId})
                      </span>
                      <Link href="/dashboard/dealer/sales/payments" className="text-[10px] font-bold text-primary hover:underline">
                        Change UPI ID
                      </Link>
                    </div>
                    <div className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 inline-block shadow-2xs">
                      <img
                        src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, grandTotal, `Bill ${invoiceNo}`), 180)}
                        alt="POS Counter Payment QR"
                        className="w-36 h-36 mx-auto object-contain"
                      />
                      <span className="text-xs font-black text-slate-900 block mt-1">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Conditional Credit Period Selector */}
                {paymentMode === "Credit" && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 animate-in fade-in">
                    <label className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                      Credit Time Period *
                    </label>
                    <select
                      value={creditPeriodOption}
                      onChange={(e) => setCreditPeriodOption(e.target.value === "custom" ? "custom" : Number(e.target.value))}
                      className="w-full bg-background border border-amber-500/30 rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none"
                    >
                      {CREDIT_PERIOD_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    {creditPeriodOption === "custom" && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Enter custom credit days (e.g. 20)"
                          value={customCreditDays}
                          onChange={(e) => setCustomCreditDays(parseInt(e.target.value) || 0)}
                          className="w-full bg-background border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none"
                        />
                        <span className="text-xs font-bold text-amber-600">Days</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Internal Painter Referral Commission */}
              <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                  <ShieldAlert size={15} /> Painter Referral Commission (Internal)
                </div>
                <p className="text-[10px] text-rose-500/80 font-medium">
                  ⚠️ Hidden internal referral payout. Will NOT show on customer PDF / slip.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    value={painterId}
                    onChange={(e) => setPainterId(e.target.value)}
                    className="bg-background border border-rose-500/30 rounded-xl px-2.5 py-1.5 text-foreground font-medium outline-none"
                  >
                    <option value="">-- Select Painter --</option>
                    {dealerPainters.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phone || "No Phone"})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Commission (₹)"
                    value={hiddenCommissionAmount || ""}
                    onChange={(e) => setHiddenCommissionAmount(parseFloat(e.target.value) || 0)}
                    className="bg-background border border-rose-500/30 rounded-xl px-2.5 py-1.5 text-foreground font-bold outline-none text-right"
                  />
                </div>
              </div>

              {/* Billing Summary & Checkout */}
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground"><span>Taxable Subtotal</span><span className="font-bold text-foreground">₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Total Tax (GST 18%)</span><span className="font-bold text-foreground">₹{totalTax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border">
                    <span>Grand Total</span>
                    <span className="text-primary font-mono text-lg">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  disabled={isPending || cartItems.length === 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isPending ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={18} />}
                  Print & Save POS Bill (₹{grandTotal.toFixed(0)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INVOICE HISTORY TABLE ─────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoice no, client name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {["All", "Paid", "Pending", "Credit"].map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    historyFilter === f ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border uppercase font-black text-[10px] text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {filteredInvoices.map((inv) => {
                    const custName = typeof inv.customer === "object" && inv.customer !== null ? inv.customer.name || "" : inv.customer || "Walk-In Customer";
                    return (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{inv.invoice_no}</td>
                        <td className="py-3 px-4 text-muted-foreground">{inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "-"}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{custName}</td>
                        <td className="py-3 px-4 text-muted-foreground font-semibold">{inv.payment_mode || "Cash"}</td>
                        <td className="py-3 px-4 text-right font-black text-foreground">₹{Number(inv.grand_total || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            inv.payment_status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            {inv.payment_status || "Paid"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => { setLastSavedInvoice(inv); setShowThermalSlipModal(true); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20"
                          >
                            <Printer size={12} /> Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: INVOICE TEMPLATES ──────────────────────────────────────── */}
      {activeTab === "templates" && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-sm font-bold text-foreground">Invoice Templates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pre-configured sales invoice templates to load instantly into POS Counter</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {INVOICE_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <LayoutTemplate size={18} className="text-primary" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${tpl.tagColor}`}>{tpl.tag}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{tpl.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tpl.desc}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tpl.fields.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-muted/50 border border-border rounded-lg text-[10px] font-semibold text-muted-foreground">{f}</span>
                  ))}
                </div>
                <button
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-transparent rounded-xl text-xs font-bold transition-all"
                >
                  <Plus size={13} /> Load Template into POS Counter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── POS INVOICE PREVIEW, TEMPLATE SWITCHER & UPI QR CODE PRINTABLE MODAL ── */}
      {showThermalSlipModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex flex-wrap items-center justify-between border-b border-border pb-3 gap-3">
              <div>
                <h3 className="font-black text-base text-foreground flex items-center gap-2">
                  <Printer size={18} className="text-primary" /> POS Billing & Invoice Template Preview
                </h3>
                <p className="text-[11px] text-muted-foreground">Select an invoice template design below to preview & print</p>
              </div>
              <button onClick={() => setShowThermalSlipModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Template Selector Bar */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border">
              {[
                { id: "thermal", name: "⚡ Thermal (80mm)" },
                { id: "classic", name: "🏛️ Classic GST (A4)" },
                { id: "modern", name: "✨ Modern Minimal" },
                { id: "brand", name: "🎨 Paint Brand Theme" },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setPreviewTemplateTheme(tpl.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    previewTemplateTheme === tpl.id
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>

            {/* Live Interactive Invoice Preview Container */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 max-h-[60vh] overflow-y-auto">
              {/* Template 1: Thermal Slip 80mm */}
              {previewTemplateTheme === "thermal" && (
                <div id="print-content" className="bg-white text-black p-5 rounded-xl text-xs font-mono border border-slate-300 space-y-3 max-w-sm mx-auto shadow-sm">
                  <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
                    <h2 className="text-base font-black text-slate-900 tracking-tight">SHARMA INDUSTRIES</h2>
                    <p className="text-[10px] text-slate-600 font-sans">{dealerUPI.payeeName} · GSTIN: 08AABCU9603R1ZX</p>
                    <p className="text-[10px] text-slate-600 font-sans">POS RECEIPT · {lastSavedInvoice?.invoice_no || invoiceNo}</p>
                    <p className="text-[10px] text-slate-500 font-sans">{new Date().toLocaleString("en-IN")}</p>
                  </div>

                  <div className="text-[11px] border-b border-dashed border-slate-400 pb-2 space-y-0.5 font-sans">
                    <p><strong>Customer:</strong> {lastSavedInvoice?.customer?.name || customerName}</p>
                    {(lastSavedInvoice?.customer?.phone || customerPhone) && <p><strong>Phone:</strong> {lastSavedInvoice?.customer?.phone || customerPhone}</p>}
                    {(lastSavedInvoice?.client_details?.address || customerAddress) && <p><strong>Address:</strong> {lastSavedInvoice?.client_details?.address || customerAddress}</p>}
                    <p><strong>Mode:</strong> {lastSavedInvoice?.payment_mode || paymentMode} {paymentMode === "Credit" ? `(${finalCreditDays} Days)` : ""}</p>
                  </div>

                  <div className="space-y-1 py-1 border-b border-dashed border-slate-400">
                    <div className="grid grid-cols-12 font-bold text-[10px] uppercase border-b border-slate-200 pb-1">
                      <span className="col-span-6">Item</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-4 text-right">Amt</span>
                    </div>
                    {(lastSavedInvoice?.items || cartItems).map((item: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 text-[10px] leading-snug">
                        <span className="col-span-6 font-semibold truncate">{item.name}</span>
                        <span className="col-span-2 text-center">{item.qty}</span>
                        <span className="col-span-4 text-right font-bold">₹{Number(item.amount || item.total || 0).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 pt-1 text-[11px] font-sans">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{Number(lastSavedInvoice?.subtotal || subtotal).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>GST (18%):</span><span>₹{Number(lastSavedInvoice?.total_gst || totalTax).toFixed(2)}</span></div>
                    <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-800">
                      <span>GRAND TOTAL:</span><span>₹{Number(lastSavedInvoice?.grand_total || grandTotal).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-dashed border-slate-400 space-y-1 font-sans">
                    <span className="text-[10px] font-bold text-slate-700 block">Scan to Pay via UPI</span>
                    <img
                      src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, Number(lastSavedInvoice?.grand_total || grandTotal), `Bill ${lastSavedInvoice?.invoice_no || invoiceNo}`), 140)}
                      alt="Dealer UPI Payment QR"
                      className="w-28 h-28 mx-auto object-contain bg-slate-50 p-1.5 rounded-lg border border-slate-200"
                    />
                    <p className="text-[10px] font-mono font-bold text-slate-800">{dealerUPI.upiId}</p>
                    <p className="text-[9px] text-slate-500 pt-1">Thank you for your business! · Visit Again</p>
                  </div>
                </div>
              )}

              {/* Template 2: Classic GST Tax Invoice (A4) */}
              {previewTemplateTheme === "classic" && (
                <div id="print-content" className="bg-white text-slate-900 p-6 rounded-xl text-xs font-sans border border-slate-300 space-y-4 max-w-2xl mx-auto shadow-sm">
                  <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">SHARMA INDUSTRIES</h2>
                      <p className="text-xs font-bold text-slate-700">{dealerUPI.payeeName}</p>
                      <p className="text-[11px] text-slate-600">Bundi, Rajasthan · GSTIN: 08AABCU9603R1ZX</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase rounded">TAX INVOICE</span>
                      <p className="text-xs font-mono font-bold text-slate-900 pt-1">#{lastSavedInvoice?.invoice_no || invoiceNo}</p>
                      <p className="text-[11px] text-slate-600">Date: {new Date().toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">Billed To (Customer):</span>
                      <p className="font-bold text-slate-900 text-xs">{lastSavedInvoice?.customer?.name || customerName}</p>
                      {(lastSavedInvoice?.customer?.phone || customerPhone) && <p className="text-slate-600">Phone: {lastSavedInvoice?.customer?.phone || customerPhone}</p>}
                      {(lastSavedInvoice?.client_details?.address || customerAddress) && <p className="text-slate-600">Address: {lastSavedInvoice?.client_details?.address || customerAddress}</p>}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">Payment Terms:</span>
                      <p className="font-bold text-slate-900">Mode: {lastSavedInvoice?.payment_mode || paymentMode}</p>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                        <th className="p-2 pl-3">S.No</th>
                        <th className="p-2">Item Description</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right pr-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-b border-slate-300 font-medium">
                      {(lastSavedInvoice?.items || cartItems).map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 pl-3 text-slate-500">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900">{item.name}</td>
                          <td className="p-2 text-center font-bold">{item.qty}</td>
                          <td className="p-2 text-right font-mono">₹{Number(item.selling_price || item.price || 0).toFixed(2)}</td>
                          <td className="p-2 text-right pr-3 font-bold font-mono">₹{Number(item.amount || item.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid grid-cols-12 gap-4 pt-2 border-t border-slate-300">
                    <div className="col-span-7 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                      <img
                        src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, Number(lastSavedInvoice?.grand_total || grandTotal), `Bill ${lastSavedInvoice?.invoice_no || invoiceNo}`), 140)}
                        alt="Dealer UPI Payment QR"
                        className="w-24 h-24 object-contain bg-white p-1 rounded border border-slate-300 shrink-0"
                      />
                      <div className="text-[11px] space-y-0.5">
                        <span className="font-bold text-slate-900 text-xs block">Scan to Pay via UPI</span>
                        <p className="font-mono text-slate-700 font-bold">{dealerUPI.upiId}</p>
                        <p className="text-[10px] text-slate-500">Payee: {dealerUPI.payeeName}</p>
                        <p className="text-[10px] text-emerald-700 font-bold pt-1">Instant Bank Settlement</p>
                      </div>
                    </div>

                    <div className="col-span-5 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600"><span>Taxable:</span><span className="font-mono font-bold">₹{Number(lastSavedInvoice?.subtotal || subtotal).toFixed(2)}</span></div>
                      <div className="flex justify-between text-slate-600"><span>GST (18%):</span><span className="font-mono font-bold">₹{Number(lastSavedInvoice?.total_gst || totalTax).toFixed(2)}</span></div>
                      <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-900">
                        <span>Grand Total:</span><span className="font-mono">₹{Number(lastSavedInvoice?.grand_total || grandTotal).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Template 3: Modern Minimal */}
              {previewTemplateTheme === "modern" && (
                <div id="print-content" className="bg-slate-950 text-white p-6 rounded-xl text-xs font-sans border border-slate-800 space-y-4 max-w-2xl mx-auto shadow-sm">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 bg-primary text-white font-black text-[10px] rounded uppercase tracking-wider">OFFICIAL POS INVOICE</span>
                      <h2 className="text-xl font-black text-white">{dealerUPI.payeeName}</h2>
                      <p className="text-xs text-slate-400">Sharma Industries Authorized Paint Depot · GSTIN: 08AABCU9603R1ZX</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-black text-primary">#{lastSavedInvoice?.invoice_no || invoiceNo}</p>
                      <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Customer</span>
                      <p className="font-bold text-white text-sm">{lastSavedInvoice?.customer?.name || customerName}</p>
                      {(lastSavedInvoice?.customer?.phone || customerPhone) && <p className="text-slate-400">{lastSavedInvoice?.customer?.phone || customerPhone}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">Payment Mode</span>
                      <p className="font-bold text-emerald-400 text-sm">{lastSavedInvoice?.payment_mode || paymentMode}</p>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="p-3">Item Description</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right pr-4">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
                        {(lastSavedInvoice?.items || cartItems).map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-3 font-bold text-white">{item.name}</td>
                            <td className="p-3 text-center font-bold">{item.qty}</td>
                            <td className="p-3 text-right pr-4 font-black font-mono text-white">₹{Number(item.amount || item.total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-12 gap-4 pt-2 border-t border-slate-800">
                    <div className="col-span-7 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                      <img
                        src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, Number(lastSavedInvoice?.grand_total || grandTotal), `Bill ${lastSavedInvoice?.invoice_no || invoiceNo}`), 140)}
                        alt="Dealer UPI Payment QR"
                        className="w-24 h-24 object-contain bg-white p-1 rounded-lg border border-slate-700 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white block">Instant UPI Payment</span>
                        <p className="font-mono text-primary font-bold text-xs">{dealerUPI.upiId}</p>
                        <p className="text-[10px] text-slate-400">Scan using GPay, PhonePe, Paytm</p>
                      </div>
                    </div>

                    <div className="col-span-5 space-y-1 text-right self-center">
                      <span className="text-slate-400 text-xs uppercase font-bold block">Total Amount Due</span>
                      <span className="text-2xl font-black text-primary font-mono block">₹{Number(lastSavedInvoice?.grand_total || grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Template 4: Paint Brand Theme */}
              {previewTemplateTheme === "brand" && (
                <div id="print-content" className="bg-gradient-to-br from-amber-500/5 via-primary/5 to-rose-500/5 text-slate-900 p-6 rounded-xl text-xs font-sans border-2 border-primary/20 space-y-4 max-w-2xl mx-auto shadow-sm">
                  <div className="flex items-start justify-between border-b-2 border-primary/30 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary text-white font-black flex items-center justify-center text-sm shadow-xs">SI</span>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">SHARMA INDUSTRIES</h2>
                      </div>
                      <p className="text-xs font-bold text-primary">{dealerUPI.payeeName} · Authorized Paint Dealer</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="px-3 py-1 bg-primary text-white font-black text-xs uppercase rounded-full shadow-2xs">PAINT BILL</span>
                      <p className="text-xs font-mono font-bold text-slate-900 pt-1">#{lastSavedInvoice?.invoice_no || invoiceNo}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-primary/20 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-primary text-white font-bold text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5 pl-3">Paint Product / Item</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right pr-3">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {(lastSavedInvoice?.items || cartItems).map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-2.5 pl-3 font-bold text-slate-900">{item.name}</td>
                            <td className="p-2.5 text-center font-bold">{item.qty}</td>
                            <td className="p-2.5 text-right pr-3 font-black font-mono text-primary">₹{Number(item.amount || item.total || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-12 gap-4 pt-2 border-t-2 border-primary/20">
                    <div className="col-span-7 bg-white p-3.5 rounded-xl border border-primary/20 flex items-center gap-3">
                      <img
                        src={getUPIQRCodeURL(generateUPIPaymentURI(dealerUPI.upiId, dealerUPI.payeeName, Number(lastSavedInvoice?.grand_total || grandTotal), `Bill ${lastSavedInvoice?.invoice_no || invoiceNo}`), 140)}
                        alt="Dealer UPI Payment QR"
                        className="w-24 h-24 object-contain bg-amber-50/50 p-1 rounded-lg border border-amber-200 shrink-0"
                      />
                      <div className="space-y-1 text-[11px]">
                        <span className="font-black text-slate-900 text-xs block">Scan to Pay Dealer</span>
                        <p className="font-mono text-primary font-bold">{dealerUPI.upiId}</p>
                        <p className="text-[10px] text-slate-500">Payee: {dealerUPI.payeeName}</p>
                      </div>
                    </div>

                    <div className="col-span-5 space-y-1 text-right self-center">
                      <span className="text-slate-500 text-xs font-bold block">NET AMOUNT PAID</span>
                      <span className="text-2xl font-black text-primary font-mono block">₹{Number(lastSavedInvoice?.grand_total || grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Printer size={15} /> Print / Save PDF Invoice
                </button>
              </div>

              <button
                onClick={() => {
                  setShowThermalSlipModal(false);
                  setCartItems([]);
                  getDealerNextPOSInvoiceNumber().then((no) => setInvoiceNo(no));
                }}
                className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border font-bold rounded-xl text-xs"
              >
                Next POS Bill →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Client Modal ───────────────────────────────────────────── */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                <User size={18} className="text-primary" /> Create & Register New Client
              </h3>
              <button onClick={() => setShowAddClientModal(false)}>
                <X size={18} className="text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Client / Customer Name *</label>
                <input
                  placeholder="e.g. Ramesh Kumar, Vertex Heights Site"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-bold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Phone Number *</label>
                <input
                  placeholder="+91 98290 12345"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-medium outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">GSTIN (Optional)</label>
                <input
                  placeholder="08AABCU9603R1ZX"
                  value={newClientData.gstin}
                  onChange={(e) => setNewClientData({ ...newClientData, gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-mono uppercase outline-none focus:border-primary"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Full Site / Billing Address *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Plot #42, Civil Lines, Kota Road, Bundi, Rajasthan"
                  value={newClientData.address}
                  onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-medium outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Pincode *</label>
                <input
                  placeholder="323001"
                  value={newClientData.pincode}
                  onChange={(e) => setNewClientData({ ...newClientData, pincode: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">State</label>
                <input
                  placeholder="Rajasthan"
                  value={newClientData.state_code}
                  onChange={(e) => setNewClientData({ ...newClientData, state_code: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground font-medium outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={handleSaveNewClient}
                className="col-span-2 py-3 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs shadow-xs mt-2 flex items-center justify-center gap-1.5 transition-all"
              >
                <User size={15} /> Save & Select Client for POS Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Custom Product Modal ───────────────────────────────────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2"><Package size={18} className="text-primary" /> Create Custom Product</h3>
              <button onClick={() => setShowAddProductModal(false)}><X size={18} className="text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Product Name *</label>
                <input placeholder="e.g. Wall Putty Super 40Kg" value={newProductData.name} onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground outline-none font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Brand Name *</label>
                <input placeholder="e.g. Asian Paints" list="pos-brand-list-mod" value={newProductData.brand} onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground outline-none font-medium" />
                <datalist id="pos-brand-list-mod">
                  {allBrands.filter((b) => b !== "All").map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">HSN Code</label>
                <input placeholder="3209" value={newProductData.hsn_code} onChange={(e) => setNewProductData({ ...newProductData, hsn_code: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground outline-none font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">Selling Price (₹)</label>
                <input type="number" value={newProductData.selling_price || ""} onChange={(e) => setNewProductData({ ...newProductData, selling_price: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground outline-none font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase block mb-1">MRP (₹)</label>
                <input type="number" value={newProductData.mrp || ""} onChange={(e) => setNewProductData({ ...newProductData, mrp: parseFloat(e.target.value) || 0 })} className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-foreground outline-none font-medium" />
              </div>
              <button onClick={handleCreateNewProduct} className="col-span-2 py-2.5 bg-primary text-white font-bold rounded-xl text-xs mt-2">
                Save & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
