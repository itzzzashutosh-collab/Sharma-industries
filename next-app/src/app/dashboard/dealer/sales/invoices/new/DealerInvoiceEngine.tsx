"use client";

import React, {
  useState,
  useRef,
  useTransition,
  useMemo,
  useEffect,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Trash2,
  Download,
  Layers,
  Sparkles,
  Landmark,
  User,
  FileText,
  X,
  Check,
  Search,
  Tag,
  Package,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { INDIAN_STATES } from "@/lib/constants";
import { getDealerNextInvoiceNumber } from "@/app/dashboard/dealer/sales/actions";
import { createClient } from "@/utils/supabase/client";

const useTranslation = useLanguage;

// ─── Types ────────────────────────────────────────────────────────────────────

interface DealerProduct {
  id: string;
  name: string;
  brand: string;          // "Sharma Industries" | "Swatch" | "Asian Paints" | etc.
  brandType: string;
  hsn_code: string;
  purchase_price: number;
  selling_price: number;
  mrp: number;
  discount_percent: number;
  packing_size_unit?: string;
  tags?: any;
}

interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  hsn: string;
  qty: number;
  purchasePrice: number;
  rate: number;
  mrp: number;
  taxPercent: number;
  taxableValue: number;
  taxAmount: number;
  total: number;
  per?: string;
}

type ClientType = "Customer" | "Contractor/Painter";

// ─── Helper: number to words ───────────────────────────────────────────────
function numberToWords(num: number): string {
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function g(n: number): string {
    if (n < 20) return a[n];
    const d = n % 10;
    return b[Math.floor(n / 10)] + (d ? "-" + a[d] : "");
  }
  function h(n: number): string {
    if (n < 100) return g(n);
    return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + g(n % 100) : "");
  }
  function convert(n: number): string {
    if (n === 0) return "Zero";
    const lakh = Math.floor(n / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = n % 1000;
    let res = "";
    if (lakh > 0) res += h(lakh) + " Lakh ";
    if (thousand > 0) res += h(thousand) + " Thousand ";
    if (hundred > 0) res += h(hundred);
    return res.trim();
  }
  const parts = Math.max(0, num).toFixed(2).split(".");
  const whole = parseInt(parts[0]);
  const decimals = parseInt(parts[1]);
  let words = convert(whole);
  if (decimals > 0) words += " and " + convert(decimals) + " Paise";
  return words;
}

// ─── Brand Config ─────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function DealerInvoiceEngine() {
  const supabase = createClient();
  const { t } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const previewRef = useRef<HTMLDivElement>(null);

  // ── Data ──
  const [dealerClients, setDealerClients] = useState<any[]>([]);
  const [dealerPainters, setDealerPainters] = useState<any[]>([]);
  const [products, setProducts] = useState<DealerProduct[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [productSearch, setProductSearch] = useState<string>("");

  // ── Client ──
  const [clientType, setClientType] = useState<ClientType>("Customer");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");

  // ── Add client modal ──
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: "", phone: "", gstin: "", address: "", state_code: "", pincode: "" });

  // ── Add product / catalog modal ──
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogQuantities, setCatalogQuantities] = useState<Record<string, number>>({});
  const [targetItemRowId, setTargetItemRowId] = useState<string | null>(null);
  const [newProductData, setNewProductData] = useState({
    name: "",
    brand: "Sharma Industries",
    hsn_code: "3209",
    purchase_price: 0,
    selling_price: 0,
    mrp: 0,
    discount_percent: 0,
    packing_size_unit: "pcs",
  });

  const [creditPeriod, setCreditPeriod] = useState("30");

  // ── Invoice fields ──
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">("exclusive");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [advancePaid, setAdvancePaid] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [enableRoundOff, setEnableRoundOff] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState<{ name: string; amount: number }[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // ─── Load initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    getDealerNextInvoiceNumber().then((no) => setInvoiceNo(no));
    setInvoiceDate(new Date().toISOString().split("T")[0]);

    async function loadData() {
      try {
        const [clientRes, prodRes, compRes, paintersRes] = await Promise.all([
          fetch("/api/clients").then((r) => r.json()),
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/competitor-products").then((r) => r.json().catch(() => ({ success: false }))),
          supabase.from("painters").select("id, name, phone, city").order("name"),
        ]);

        // Dealer customers from /api/clients (real customers table)
        if (clientRes.success && clientRes.data) {
          setDealerClients(clientRes.data);
        }

        // Painters
        if (paintersRes.data) {
          setDealerPainters(paintersRes.data);
        }

        // Build unified product list with brand info
        let allProducts: DealerProduct[] = [];

        // Main products (Sharma Industries and registered brands)
        if (prodRes.success && prodRes.data) {
          const mainProds: DealerProduct[] = prodRes.data.map((p: any) => {
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
          });
          allProducts = [...allProducts, ...mainProds];
        }

        // All brand products (Asian Paints, Berger, Nerolac, Swatch, Dulux, etc.)
        if (compRes.success && compRes.data) {
          const compProds: DealerProduct[] = compRes.data.map((cp: any) => ({
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
          }));
          allProducts = [...allProducts, ...compProds];
        }

        setProducts(allProducts);

        // Handle convert_quotation_id or duplicate_id from searchParams
        const searchParams = new URLSearchParams(window.location.search);
        const convertQId = searchParams.get("convert_quotation_id");
        const dupId = searchParams.get("duplicate_id");

        if (convertQId) {
          const { data: q } = await supabase.from("quotations").select("*").eq("id", convertQId).single();
          if (q) {
            setCustomerName(q.client_details?.name || typeof q.customer === "string" ? q.customer : q.customer?.name || "");
            setCustomerPhone(q.client_details?.phone || "");
            setCustomerAddress(q.client_details?.address || "");
            setGstin(q.client_details?.gstin || "");
            setState(q.client_details?.state || "");
            if (q.client_type) setClientType(q.client_type as any);
            if (q.notes) setNotes(q.notes);

            if (q.items && Array.isArray(q.items)) {
              setItems(
                q.items.map((it: any, idx: number) => ({
                  id: `${Date.now()}-${idx}`,
                  productId: it.product_id || it.productId || "",
                  name: it.name || "",
                  brand: it.brand || "Sharma Industries",
                  hsn: it.hsn_code || it.hsn || "3209",
                  qty: Number(it.qty || it.quantity || 1),
                  rate: Number(it.rate || 0),
                  mrp: Number(it.mrp || 0),
                  taxPercent: Number(it.tax_rate || it.taxPercent || 18),
                  taxableValue: Number(it.taxableValue || (it.qty || 1) * (it.rate || 0)),
                  taxAmount: Number(it.taxAmount || 0),
                  total: Number(it.amount || it.total || (it.qty || 1) * (it.rate || 0)),
                  per: "pcs",
                }))
              );
            }
          }
        } else if (dupId) {
          const { data: inv } = await supabase.from("invoices").select("*").eq("id", dupId).single();
          if (inv) {
            setCustomerName(inv.client_details?.name || typeof inv.customer === "string" ? inv.customer : inv.customer?.name || "");
            setCustomerPhone(inv.client_details?.phone || "");
            setCustomerAddress(inv.client_details?.address || "");
            setGstin(inv.client_details?.gstin || "");
            setState(inv.client_details?.state || "");
            if (inv.client_type) setClientType(inv.client_type as any);
            if (inv.notes) setNotes(inv.notes);

            if (inv.items && Array.isArray(inv.items)) {
              setItems(
                inv.items.map((it: any, idx: number) => ({
                  id: `${Date.now()}-${idx}`,
                  productId: it.product_id || it.productId || "",
                  name: it.name || "",
                  brand: it.brand || "Sharma Industries",
                  hsn: it.hsn_code || it.hsn || "3209",
                  qty: Number(it.qty || it.quantity || 1),
                  rate: Number(it.rate || 0),
                  mrp: Number(it.mrp || 0),
                  taxPercent: Number(it.tax_rate || it.taxPercent || 18),
                  taxableValue: Number(it.taxableValue || (it.qty || 1) * (it.rate || 0)),
                  taxAmount: Number(it.taxAmount || 0),
                  total: Number(it.amount || it.total || (it.qty || 1) * (it.rate || 0)),
                  per: "pcs",
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load dealer invoice data:", err);
      }
    }
    loadData();
  }, []);

  // ─── Client select ──────────────────────────────────────────────────────────
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) {
      setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); setGstin(""); setState(""); setPincode("");
      return;
    }

    if (clientType === "Contractor/Painter") {
      const painter = dealerPainters.find((p) => p.id === clientId);
      if (painter) {
        setCustomerName(painter.name || "");
        setCustomerPhone(painter.phone || "");
        setCustomerAddress(painter.city || "");
        setGstin("");
        setState("");
        setPincode("");
      }
    } else {
      const client = dealerClients.find((c) => c.id === clientId);
      if (client) {
        setCustomerName(client.name || "");
        setCustomerPhone(client.phone || "");
        setCustomerAddress(client.address || "");
        setGstin(client.gstin || "");
        setState(client.state_code || client.state || "");
        setPincode(client.pincode || "");
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
        setState(data.data.state_code || "");
        setPincode(data.data.pincode || "");
        setShowAddClientModal(false);
        setNewClientData({ name: "", phone: "", gstin: "", address: "", state_code: "", pincode: "" });
      } else {
        alert(data.error || "Failed to save client");
      }
    } catch {
      alert("Error saving client");
    }
  };

  // ─── Product math ───────────────────────────────────────────────────────────
  const recalculateItem = (item: InvoiceItem, type: "inclusive" | "exclusive"): InvoiceItem => {
    const qty = item.qty;
    const rate = item.rate;
    const taxPercent = item.taxPercent;
    if (type === "exclusive") {
      const taxableValue = qty * rate;
      const taxAmount = taxableValue * (taxPercent / 100);
      const total = taxableValue + taxAmount;
      return { ...item, taxableValue, taxAmount, total };
    } else {
      const total = qty * rate;
      const taxableValue = total / (1 + taxPercent / 100);
      const taxAmount = total - taxableValue;
      return { ...item, taxableValue, taxAmount, total };
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: "",
      name: "",
      brand: "",
      hsn: "3209",
      qty: 1,
      purchasePrice: 0,
      rate: 0,
      mrp: 0,
      taxPercent: 18,
      taxableValue: 0,
      taxAmount: 0,
      total: 0,
      per: "pcs",
    };
    setItems([...items, recalculateItem(newItem, taxType)]);
  };

  const handleRemoveItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        let updated = { ...item, [field]: value };
        if (field === "productId" && value) {
          const prod = products.find((p) => p.id === value);
          if (prod) {
            updated.name = prod.name;
            updated.brand = prod.brand;
            updated.hsn = prod.hsn_code || "3209";
            updated.purchasePrice = prod.purchase_price;
            updated.rate = prod.selling_price;
            updated.mrp = prod.mrp;
            updated.per = prod.packing_size_unit || "pcs";
          }
        }
        return recalculateItem(updated, taxType);
      })
    );
  };

  const handleTaxTypeChange = (newType: "inclusive" | "exclusive") => {
    setTaxType(newType);
    setItems((prev) => prev.map((item) => recalculateItem(item, newType)));
  };

  // ─── Add to Cart / Catalog helper ───────────────────────────────────────────
  const handleAddToCart = (product: DealerProduct, qty: number = 1) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      const existing = updatedItems[existingIndex];
      const newQty = existing.qty + qty;
      updatedItems[existingIndex] = recalculateItem({ ...existing, qty: newQty }, taxType);
      setItems(updatedItems);
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        productId: product.id,
        name: product.name,
        brand: product.brand,
        hsn: product.hsn_code || "3209",
        qty: qty,
        purchasePrice: product.purchase_price,
        rate: product.selling_price,
        mrp: product.mrp,
        taxPercent: 18,
        taxableValue: 0,
        taxAmount: 0,
        total: 0,
        per: product.packing_size_unit || "pcs",
      };
      setItems((prev) => [...prev, recalculateItem(newItem, taxType)]);
    }
  };

  // ─── Save new product inline ─────────────────────────────────────────────────
  const handleSaveNewProduct = async () => {
    if (!newProductData.name.trim()) { alert("Product name is required"); return; }
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
        if (targetItemRowId) handleItemChange(targetItemRowId, "productId", created.id);
        setShowAddProductModal(false);
        setNewProductData({ name: "", brand: "Sharma Industries", hsn_code: "3209", purchase_price: 0, selling_price: 0, mrp: 0, discount_percent: 0, packing_size_unit: "pcs" });
        setTargetItemRowId(null);
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch {
      alert("Error saving product");
    }
  };

  // ─── Totals ──────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.taxableValue, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const additionalChargesTotal = additionalCharges.reduce((s, c) => s + (c.amount || 0), 0);
  const baseGrandTotal = Math.max(0, items.reduce((s, i) => s + i.total, 0) - discountAmount + additionalChargesTotal);
  const roundOffDiff = enableRoundOff ? Math.round(baseGrandTotal) - baseGrandTotal : 0;
  const grandTotal = baseGrandTotal + roundOffDiff;
  const balanceDue = grandTotal - advancePaid;

  // ─── IGST vs CGST/SGST ───────────────────────────────────────────────────────
  const isIGST = useMemo(() => {
    if (!state) return false;
    const cs = state.trim().toLowerCase();
    return cs !== "rajasthan" && cs !== "08";
  }, [state]);

  const cgst = isIGST ? 0 : totalTax / 2;
  const sgst = isIGST ? 0 : totalTax / 2;
  const igst = isIGST ? totalTax : 0;

  // ─── Brand list for filter ────────────────────────────────────────────────────
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => brands.add(p.brand));
    return ["All", ...Array.from(brands).sort()];
  }, [products]);

  // ─── Filtered products for item select ───────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchBrand = brandFilter === "All" || p.brand === brandFilter;
      const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [products, brandFilter, productSearch]);

  // ─── Save and submit ──────────────────────────────────────────────────────────
  const handleSaveAndNext = () => {
    if (!customerName || !customerPhone || items.length === 0) {
      alert("Please fill out client details and add at least one item.");
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmitInvoice = async () => {
    if (!customerName || items.length === 0) {
      alert("Please complete the invoice before submitting.");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          invoice_no: invoiceNo,
          date: invoiceDate,
          due_date: dueDate || invoiceDate,
          customer: { name: customerName, phone: customerPhone },
          client_details: { name: customerName, phone: customerPhone, address: customerAddress, gstin, state_code: state, pincode },
          client_type: clientType,
          items: items.map((i) => ({ product_id: i.productId, name: i.name, brand: i.brand, hsn_code: i.hsn, qty: i.qty, rate: i.rate, mrp: i.mrp, amount: i.total, tax_rate: i.taxPercent })),
          subtotal,
          total_gst: totalTax,
          cgst, sgst, igst,
          grand_total: grandTotal,
          balance_due: balanceDue,
          payment_mode: paymentMode,
          advance_paid: advancePaid,
          discount: discountAmount,
          notes,
          is_tax_inclusive: taxType === "inclusive",
        };
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setSavedInvoiceId(data.data.id);
          alert("Invoice saved successfully!");
          router.push(`/dashboard/dealer/sales/invoices/${data.data.id}`);
        } else {
          alert(data.error || "Failed to save invoice.");
        }
      } catch (err) {
        alert("Error saving invoice.");
      }
    });
  };

  const handleGeneratePDF = async () => {
    if (!previewRef.current) return;
    try {
      const opt = {
        margin: 0,
        filename: `${invoiceNo}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set(opt).from(previewRef.current).save();
    } catch {
      alert("Failed to generate PDF.");
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────

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
              {[
                { placeholder: "Name *", key: "name", value: newClientData.name },
                { placeholder: "Phone *", key: "phone", value: newClientData.phone },
                { placeholder: "GSTIN (optional)", key: "gstin", value: newClientData.gstin },
                { placeholder: "Pincode", key: "pincode", value: newClientData.pincode },
              ].map(({ placeholder, key, value }) => (
                <input key={key} placeholder={placeholder} value={value}
                  onChange={(e) => setNewClientData({ ...newClientData, [key]: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              ))}
              <select value={newClientData.state_code} onChange={(e) => setNewClientData({ ...newClientData, state_code: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                <option value="" disabled>State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea placeholder="Address" value={newClientData.address} onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" rows={2} />
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
                <input placeholder="e.g. Rustic Royale Premium 20L" value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Brand Name *</label>
                <input
                  placeholder="e.g. Asian Paints, Swatch, Berger, etc."
                  list="invoice-brand-suggestions"
                  value={newProductData.brand}
                  onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground text-xs outline-none focus:border-primary font-medium"
                />
                <datalist id="invoice-brand-suggestions">
                  {allBrands.filter((b) => b !== "All").map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">HSN Code</label>
                <input placeholder="3209" value={newProductData.hsn_code}
                  onChange={(e) => setNewProductData({ ...newProductData, hsn_code: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Purchase Price (₹)</label>
                <input type="number" placeholder="0" value={newProductData.purchase_price || ""}
                  onChange={(e) => setNewProductData({ ...newProductData, purchase_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Selling Price (₹)</label>
                <input type="number" placeholder="0" value={newProductData.selling_price || ""}
                  onChange={(e) => setNewProductData({ ...newProductData, selling_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">MRP (₹)</label>
                <input type="number" placeholder="0" value={newProductData.mrp || ""}
                  onChange={(e) => setNewProductData({ ...newProductData, mrp: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Discount %</label>
                <input type="number" placeholder="0" value={newProductData.discount_percent || ""}
                  onChange={(e) => setNewProductData({ ...newProductData, discount_percent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Pack Size / Unit</label>
                <input placeholder="e.g. 20L, 40Kg, pcs" value={newProductData.packing_size_unit}
                  onChange={(e) => setNewProductData({ ...newProductData, packing_size_unit: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" />
              </div>
            </div>
            {/* Price preview */}
            {newProductData.selling_price > 0 && newProductData.mrp > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs flex gap-4">
                <span>Margin: <strong className="text-emerald-600">₹{(newProductData.selling_price - newProductData.purchase_price).toFixed(0)}</strong></span>
                <span>vs MRP: <strong className="text-primary">-{(((newProductData.mrp - newProductData.selling_price) / newProductData.mrp) * 100).toFixed(1)}%</strong></span>
              </div>
            )}
            <button onClick={handleSaveNewProduct} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <Check size={16} /> Create & Add to Invoice
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
                  Browse products by brand, view MRP & selling rates, and add directly to your invoice
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
                        <span className="text-xs text-muted-foreground">Not in invoice</span>
                      )}
                      <button
                        onClick={() => handleAddToCart(prod, 1)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Plus size={14} /> Add to Invoice
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
                Done & Review Invoice
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
          <h1 className="text-2xl font-black text-foreground tracking-tight">GST Invoice Engine</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Dealer Portal · Generate tax invoices for customers, contractors & painters</p>
        </div>
        <div className="ml-auto">
          <Link href="/dashboard/dealer/sales/invoices" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded-xl px-3 py-2 hover:bg-muted/40 transition-colors">
            ← Back to Invoices
          </Link>
        </div>
      </div>

      {/* Step 1: Invoice Form */}
      {currentStep === 1 && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-8">

            {/* Invoice Metadata */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-primary" /> Invoice Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Invoice No.", value: invoiceNo, setter: setInvoiceNo, type: "text" },
                  { label: "Invoice Date", value: invoiceDate, setter: setInvoiceDate, type: "date" },
                  { label: "Due Date", value: dueDate, setter: setDueDate, type: "date" },
                ].map(({ label, value, setter, type }) => (
                  <div key={label}>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
                    <input type={type} value={value} onChange={(e) => setter(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                  </div>
                ))}
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-primary" /> Client Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client type selector */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Client Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Customer", "Contractor/Painter"] as ClientType[]).map((ct) => (
                      <button key={ct} type="button"
                        onClick={() => { setClientType(ct); setSelectedClientId(""); setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${clientType === ct ? "bg-primary text-white border-primary" : "bg-background border-border text-foreground hover:bg-muted/40"}`}>
                        {ct === "Customer" ? "👤 Customer" : "🎨 Contractor / Painter"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Client */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Select Client</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <select value={selectedClientId} onChange={(e) => handleClientSelect(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium appearance-none">
                        <option value="">-- Manual Entry --</option>
                        {clientType === "Contractor/Painter"
                          ? dealerPainters.map((p) => <option key={p.id} value={p.id}>{p.name} {p.city ? `· ${p.city}` : ""}</option>)
                          : dealerClients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone || "No Phone"})</option>)}
                      </select>
                    </div>
                    <button onClick={() => setShowAddClientModal(true)}
                      className="px-3 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl border border-primary/20 transition-all font-bold text-xs whitespace-nowrap flex items-center gap-1">
                      <Plus size={14} /> New
                    </button>
                  </div>
                </div>

                {/* Customer Name */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Client Name</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer / Contractor / Painter Name"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">GSTIN (if applicable)</label>
                  <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="08XXXXXXXXXXX"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Contact Number</label>
                  <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 99999 99999"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium">
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Pincode</label>
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 324005"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Tax Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["exclusive", "inclusive"] as const).map((tt) => (
                      <button key={tt} type="button" onClick={() => handleTaxTypeChange(tt)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${taxType === tt ? "bg-primary text-white border-primary" : "bg-background border-border hover:bg-muted/40"}`}>
                        Tax {tt.charAt(0).toUpperCase() + tt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Full Address</label>
                  <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={2} placeholder="Delivery / Billing Address"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Landmark size={14} className="text-primary" /> Payment Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium">
                    {["Cash", "UPI", "Bank Transfer", "Cheque", "Credit"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Advance Paid (₹)</label>
                  <input type="number" value={advancePaid || ""} onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)} placeholder="0.00"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Discount / Markdown (₹)</label>
                  <input type="number" value={discountAmount || ""} onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} placeholder="0.00"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
                </div>
              </div>

              {/* Conditional Credit Time Period Option (Only visible when Payment Mode === "Credit") */}
              {paymentMode === "Credit" && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      💳 Credit Time Period (Days)
                    </label>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                      Credit Payment Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {["7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"].map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setCreditPeriod(period.replace(" Days", ""))}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          creditPeriod === period.replace(" Days", "") || creditPeriod === period
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-background border-border text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                    <div className="col-span-1 sm:col-span-2 md:col-span-2">
                      <input
                        type="text"
                        placeholder="Custom Credit Days (e.g. 120)"
                        value={creditPeriod}
                        onChange={(e) => setCreditPeriod(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional charges */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Additional Charges (Labour, etc.)</label>
                {additionalCharges.map((charge, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Charge Name" value={charge.name}
                      onChange={(e) => { const c = [...additionalCharges]; c[idx].name = e.target.value; setAdditionalCharges(c); }}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm" />
                    <input type="number" placeholder="₹" value={charge.amount || ""}
                      onChange={(e) => { const c = [...additionalCharges]; c[idx].amount = parseFloat(e.target.value) || 0; setAdditionalCharges(c); }}
                      className="w-28 bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none focus:border-primary text-sm" />
                    <button type="button" onClick={() => setAdditionalCharges(additionalCharges.filter((_, i) => i !== idx))}
                      className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"><Plus size={12} /> Add Charge</button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-foreground">
                <input type="checkbox" checked={enableRoundOff} onChange={(e) => setEnableRoundOff(e.target.checked)} className="w-4 h-4 accent-primary" />
                Round Off Grand Total
              </label>

              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-sm font-bold text-foreground">Balance Due:</span>
                <span className="text-lg font-black text-primary">₹{balanceDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Line Items with Brand filter */}
            <div>
              <div className="flex justify-between items-end mb-4 border-t border-border pt-4">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Layers size={14} className="text-primary" /> Line Items
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowCatalogModal(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-all">
                    <Package size={14} /> 🛍️ Visual Brand Catalog & Cart
                  </button>
                  <button onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all">
                    <Plus size={14} /> Add Row
                  </button>
                </div>
              </div>

              {/* Brand filter bar */}
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/20 rounded-xl border border-border/50">
                <div className="flex items-center gap-1.5 mr-1">
                  <Tag size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Brand Filter:</span>
                </div>
                {allBrands.map((brand) => (
                  <button key={brand} onClick={() => setBrandFilter(brand)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${brandFilter === brand ? "bg-foreground text-background border-foreground" : `${getBrandColor(brand)} hover:opacity-80`}`}>
                    {brand}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <Search size={13} className="text-muted-foreground" />
                  <input type="text" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-1 text-xs outline-none focus:border-primary w-40" />
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-4 bg-background border border-border rounded-2xl relative group shadow-sm">
                    <button onClick={() => handleRemoveItem(item.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-md">
                      <Trash2 size={13} />
                    </button>

                    <div className="grid grid-cols-12 sm:grid-cols-12 lg:grid-cols-12 gap-2.5 items-end">
                      {/* Product select */}
                      <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-muted-foreground uppercase font-black">Product Name</label>
                          <button type="button" onClick={() => { setTargetItemRowId(item.id); setShowAddProductModal(true); }}
                            className="text-[10px] text-primary hover:underline font-extrabold flex items-center gap-0.5">
                            <Plus size={11} /> New
                          </button>
                        </div>
                        <select value={item.productId} onChange={(e) => handleItemChange(item.id, "productId", e.target.value)}
                          className="w-full bg-white dark:bg-white text-slate-900 dark:text-slate-900 border border-border rounded-xl px-2.5 py-2 text-xs outline-none focus:border-primary font-medium">
                          <option className="bg-white text-slate-900" value="">-- Select Product --</option>
                          {filteredProducts.map((p) => (
                            <option className="bg-white text-slate-900" key={p.id} value={p.id}>
                              [{p.brand}] {p.name} — ₹{p.selling_price} (MRP: ₹{p.mrp})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Brand badge */}
                      <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Brand</label>
                        <div className={`px-2 py-2 rounded-xl border text-[10px] font-black text-center truncate ${item.brand ? getBrandColor(item.brand) : "bg-muted text-muted-foreground border-border"}`}>
                          {item.brand || "—"}
                        </div>
                      </div>

                      {/* HSN */}
                      <div className="col-span-6 sm:col-span-3 lg:col-span-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">HSN</label>
                        <input type="text" value={item.hsn} onChange={(e) => handleItemChange(item.id, "hsn", e.target.value)}
                          className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-primary text-center" />
                      </div>

                      {/* Qty */}
                      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Qty</label>
                        <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, "qty", parseInt(e.target.value) || 0)}
                          className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs font-black text-foreground outline-none focus:border-primary text-center" />
                      </div>

                      {/* Purchase Rate ₹ — Editable */}
                      <div className="col-span-4 sm:col-span-2 lg:col-span-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Purchase ₹</label>
                        <input type="number" value={item.purchasePrice || ""} onChange={(e) => handleItemChange(item.id, "purchasePrice", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-primary text-right" />
                      </div>

                      {/* Selling Rate ₹ — Editable */}
                      <div className="col-span-4 sm:col-span-2 lg:col-span-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Selling ₹</label>
                        <input type="number" value={item.rate} onChange={(e) => handleItemChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                          className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-primary text-right font-bold text-primary" />
                      </div>

                      {/* MRP ₹ — Editable */}
                      <div className="col-span-4 sm:col-span-2 lg:col-span-1.5">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">MRP ₹</label>
                        <input type="number" value={item.mrp || ""} onChange={(e) => handleItemChange(item.id, "mrp", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-card border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-primary text-right" />
                      </div>

                      {/* GST% */}
                      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">GST%</label>
                        <select value={item.taxPercent} onChange={(e) => handleItemChange(item.id, "taxPercent", parseFloat(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-white text-slate-900 border border-border rounded-xl px-1.5 py-2 text-xs outline-none focus:border-primary text-center font-medium">
                          {[0, 5, 12, 18, 28].map((v) => <option key={v} className="bg-white text-slate-900" value={v}>{v}%</option>)}
                        </select>
                      </div>

                      {/* Total */}
                      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
                        <label className="text-[10px] text-muted-foreground uppercase font-black block mb-1">Total</label>
                        <input readOnly value={`₹${item.total.toFixed(0)}`}
                          className="w-full bg-muted border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none text-right font-bold" />
                      </div>
                    </div>

                    {/* MRP and summary */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                      <div className="flex gap-3">
                        {item.mrp > 0 && (
                          <span>MRP: <strong className="text-foreground">₹{item.mrp}</strong></span>
                        )}
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
                    <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Product" to start building your invoice</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Notes / Remarks</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional: delivery instructions, remarks, etc."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex gap-4">
              <button type="button" onClick={() => router.push("/dashboard/dealer/sales/invoices")}
                className="flex-1 py-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground font-extrabold rounded-xl border border-border transition-all">
                Cancel
              </button>
              <button type="button" onClick={handleSaveAndNext}
                className="flex-[2] py-4 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-xl transition-all shadow-lg">
                Preview & Confirm →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview + Confirm */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl px-4 py-2 hover:bg-muted/40 transition-colors">
              ← Edit Invoice
            </button>
            <div className="flex gap-3">
              <button onClick={handleGeneratePDF} className="flex items-center gap-2 px-5 py-2.5 bg-muted border border-border text-foreground font-bold rounded-xl text-sm hover:bg-muted/80 transition-all">
                <Download size={15} /> Download PDF
              </button>
              <button onClick={handleSubmitInvoice}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-md">
                <Check size={15} /> Submit Invoice
              </button>
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="overflow-x-auto bg-card border border-border p-8 rounded-2xl shadow-sm">
            <div ref={previewRef} className="bg-white text-black p-10 min-h-[1123px] w-[794px] mx-auto shadow-md" style={{ transformOrigin: "top center" }}>
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">TAX INVOICE</h1>
                  <p className="text-slate-500 font-medium mt-1">Invoice No: {invoiceNo}</p>
                  <p className="text-slate-500 font-medium" suppressHydrationWarning>
                    Date: {isMounted && invoiceDate ? new Date(invoiceDate).toLocaleDateString("en-IN") : invoiceDate}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-slate-800">Sharma Industries</h2>
                  <p className="text-slate-600">GSTIN: 08AABCU9603R1ZX</p>
                  <p className="text-slate-500 text-sm">Bundi, Rajasthan</p>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                  <p className="font-bold text-slate-800 text-lg">{customerName}</p>
                  <p className="text-slate-600 text-sm">{customerAddress}</p>
                  {gstin && <p className="text-slate-600 text-sm">GSTIN: {gstin}</p>}
                  <p className="text-slate-600 text-sm">📞 {customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment</p>
                  <p className="text-slate-700 font-semibold">
                    {paymentMode} {paymentMode === "Credit" && creditPeriod ? `(${creditPeriod} Days)` : ""}
                  </p>
                  {dueDate && <p className="text-slate-600 text-sm mt-1">Due: {isMounted ? new Date(dueDate).toLocaleDateString("en-IN") : dueDate}</p>}
                  <p className="text-xs text-slate-400 mt-1">Client: {clientType}</p>
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
                    <th className="py-3 px-2 text-right font-bold">MRP</th>
                    <th className="py-3 px-2 text-right font-bold">Taxable</th>
                    <th className="py-3 px-3 text-right font-bold rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-3 px-3 text-slate-800 font-semibold text-sm">{item.name}</td>
                      <td className="py-3 px-2 text-slate-500 text-xs">{item.brand}</td>
                      <td className="py-3 px-2 text-right text-slate-600 text-xs">{item.hsn}</td>
                      <td className="py-3 px-2 text-right text-slate-800 text-sm">{item.qty}</td>
                      <td className="py-3 px-2 text-right text-slate-800 text-sm">₹{item.rate.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-2 text-right text-slate-500 text-xs">₹{item.mrp > 0 ? item.mrp.toLocaleString("en-IN") : "—"}</td>
                      <td className="py-3 px-2 text-right text-slate-800 text-sm">₹{item.taxableValue.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-slate-800 font-bold text-sm">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm">
                    <span>Subtotal</span><span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {!isIGST && totalTax > 0 && (
                    <>
                      <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm">
                        <span>CGST</span><span className="font-semibold">₹{cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm">
                        <span>SGST</span><span className="font-semibold">₹{sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {isIGST && totalTax > 0 && (
                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 text-sm">
                      <span>IGST</span><span className="font-semibold">₹{igst.toFixed(2)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-600 text-sm">
                      <span>Discount</span><span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {enableRoundOff && (
                    <div className="flex justify-between py-2 border-b border-slate-100 text-slate-500 text-sm">
                      <span>Round Off</span><span>₹{roundOffDiff.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 text-lg font-black text-slate-800 border-b-2 border-slate-800 mt-2">
                    <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                  {balanceDue < grandTotal && (
                    <div className="flex justify-between py-2 text-emerald-600 font-bold text-sm mt-1">
                      <span>Advance Paid</span><span>₹{advancePaid.toFixed(2)}</span>
                    </div>
                  )}
                  {balanceDue > 0 && (
                    <div className="flex justify-between py-2 text-rose-600 font-bold mt-1">
                      <span>Balance Due</span><span>₹{balanceDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount in words */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Amount in Words</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">Rupees {numberToWords(grandTotal)} Only</p>
              </div>

              {notes && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-slate-600">{notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
