"use client";
import { QRCodeSVG } from "qrcode.react";

import React, {
  useState,
  useRef,
  useTransition,
  useMemo,
  useEffect,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Layers,
  Sparkles,
  Landmark,
  User,
  FileText,
  PenTool,
  Upload,
  X,
  Check,
  Search,
  QrCode,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { INVOICE_TEMPLATES, ThemeConfig } from "./themes";
import { INDIAN_STATES } from "@/lib/constants";
import { getNextInvoiceNumber } from "./actions";
import { getDealers } from "@/app/dashboard/ceo/dealers/actions";

// Alias for strict compliance with requested coding standards
const useTranslation = useLanguage;

function numberToWords(num: number): string {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function g(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? "-" + a[digit] : "");
  }

  function h(n: number): string {
    if (n < 100) return g(n);
    return (
      a[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " and " + g(n % 100) : "")
    );
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
  if (decimals > 0) {
    words += " and " + convert(decimals) + " Paise";
  }
  return words;
}

interface Product {
  id: string;
  name: string;
  hsn_code: string;
  selling_price: number;
  tags?: any;
  packing_size_unit?: string;
}

interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  hsn: string;
  qty: number;
  rate: number;
  taxPercent: number;
  taxableValue: number;
  taxAmount: number;
  total: number;
  per?: string;
  qrRange?: string;
}

interface SellerDetails {
  companyName: string;
  ownerName: string;
  gstin: string;
  phone: string;
  address: string;
  stateCode: string;
  pincode?: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  logo?: string;
  upiId: string;
  termsAndConditions?: string;
  notes?: string;
  companyStampUrl?: string | null;
}

const DEFAULT_SELLER: SellerDetails = {
  companyName: "Sharma Industries",
  ownerName: "Ashutosh Sharma",
  gstin: "08AABCU9603R1ZX",
  phone: "+91 98765 43210",
  address: "Bundi, Rajasthan, India",
  stateCode: "08",
  bankName: "State Bank of India",
  termsAndConditions: "",
  notes: "",
  companyStampUrl: null,
  accountNumber: "32104567890",
  ifsc: "SBIN0001234",
  upiId: "sharma@upi",
};

export function InvoiceEngine() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const previewRef = useRef<HTMLDivElement>(null);

  // CRM States
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [clientType, setClientType] = useState<"Customer" | "Dealer" | "Contractor/Painter">("Customer");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    phone: "",
    gstin: "",
    address: "",
    state_code: "",
    pincode: "",
  });

  // Seller/Company Profile State
  const [sellerDetails, setSellerDetails] =
    useState<SellerDetails>(DEFAULT_SELLER);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(
    "exclusive",
  );
  const [template, setTemplate] = useState<string>("classic_default");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState<string>("");
  const [qrRange, setQrRange] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  // Transport Details State
  const [transportMode, setTransportMode] = useState<string>("Road");
  const [vehicleNo, setVehicleNo] = useState<string>("");
  const [transportDate, setTransportDate] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [isSameAsBilling, setIsSameAsBilling] = useState<boolean>(false);

  // Payment Terms State
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>("Credit");
  const [creditDays, setCreditDays] = useState<number>(15);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<{name: string, amount: number}[]>([]);
  const [enableRoundOff, setEnableRoundOff] = useState<boolean>(false);

  // Signature State
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  useEffect(() => {
    if (paymentMode === "Credit" && invoiceDate) {
      const dateObj = new Date(invoiceDate);
      dateObj.setDate(dateObj.getDate() + creditDays);
      setDueDate(dateObj.toISOString().split("T")[0]);
    } else if (paymentMode !== "Credit") {
      setDueDate("");
    }
  }, [paymentMode, invoiceDate, creditDays]);

  // Load company settings via APIs
  useEffect(() => {
    setIsMounted(true);
    getNextInvoiceNumber().then((no) => setInvoiceNo(no));
    setInvoiceDate(new Date().toISOString().split("T")[0]);

    const savedTemplate = localStorage.getItem("invoice_template");
    if (savedTemplate) {
      setTemplate(savedTemplate);
    }

    async function loadInitialData() {
      try {
        const [compRes, prodRes, clientRes, dealerRes, compProductsRes] = await Promise.all([
          fetch("/api/company").then((r) => r.json()),
          fetch("/api/products").then((r) => r.json()),
          fetch("/api/clients").then((r) => r.json()),
          getDealers(),
          fetch("/api/competitor-products").then((r) => r.json().catch(() => ({ success: false }))),
        ]);

        if (compRes.success && compRes.data) {
          setSellerDetails(compRes.data);
          setSignatureUrl(compRes.data.signature_url);
        }
        
        let allProducts: any[] = [];
        if (prodRes.success && prodRes.data) {
          allProducts = [...prodRes.data];
        }
        if (compProductsRes && compProductsRes.success && compProductsRes.data) {
          const mappedCompProducts = compProductsRes.data.map((cp: any) => ({
             id: cp.id,
             name: `[${cp.brand}] ${cp.product_name} ${cp.pack_size || ""}`.trim(),
             hsn_code: "3209",
             selling_price: cp.mrp,
             tags: ["Competitor"],
             packing_size_unit: cp.pack_size || "pcs"
          }));
          allProducts = [...allProducts, ...mappedCompProducts];
        }
        setProducts(allProducts);
        
        if (clientRes.success && clientRes.data) setClients(clientRes.data);
        if (dealerRes && Array.isArray(dealerRes)) setDealers(dealerRes);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    }
    loadInitialData();
  }, []);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setGstin("");
      setState("");
      return;
    }
    if (clientType === "Dealer") {
      const dealer = dealers.find((d) => d.id === clientId);
      if (dealer) {
        setCustomerName(dealer.name || "");
        setCustomerPhone(dealer.phone || "");
        setCustomerAddress(dealer.address || "");
        setGstin("");
        setState("");
        setPincode("");
      }
    } else {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setCustomerName(client.name || "");
        setCustomerPhone(client.phone || "");
        setCustomerAddress(client.address || "");
        setGstin(client.gstin || "");
        setState(client.state_code || "");
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
        setClients([...clients, data.data]);
        setSelectedClientId(data.data.id);
        setCustomerName(data.data.name);
        setCustomerPhone(data.data.phone || "");
        setCustomerAddress(data.data.address || "");
        setGstin(data.data.gstin || "");
        setState(data.data.state_code || "");
        setPincode(data.data.pincode || "");
        setShowAddClientModal(false);
        setNewClientData({
          name: "",
          phone: "",
          gstin: "",
          address: "",
          state_code: "",
          pincode: "",
        });
      } else {
        alert(data.error || "Failed to save client");
      }
    } catch (err) {
      alert("Error saving client");
    }
  };

  // Derived state comparison: Intra-state (CGST/SGST) vs Inter-state (IGST)
  const isIGST = useMemo(() => {
    if (!state) return false;
    const cleanClientState = state.trim().toLowerCase();

    // Extract company state name from address (second to last part usually, e.g. Bundi, Rajasthan, India)
    const companyAddressParts = sellerDetails.address.split(",");
    let extractedCompanyState = "rajasthan";
    if (companyAddressParts.length >= 2) {
      extractedCompanyState = companyAddressParts[
        companyAddressParts.length - 2
      ]
        .trim()
        .toLowerCase();
    }

    const companyStateCode = (sellerDetails.stateCode || "08")
      .trim()
      .toLowerCase();

    // If client state matches company state name or state code, it's intra-state. Otherwise inter-state.
    const isIntraState =
      cleanClientState === extractedCompanyState ||
      cleanClientState === companyStateCode;
    return !isIntraState;
  }, [state, sellerDetails.address, sellerDetails.stateCode]);

  // Recalculate financial math for a single item row
  const recalculateItem = (
    item: InvoiceItem,
    type: "inclusive" | "exclusive",
  ) => {
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
      hsn: "",
      qty: 1,
      rate: 0,
      taxPercent: 18,
      taxableValue: 0,
      taxAmount: 0,
      total: 0,
      per: "pcs",
      qrRange: "",
    };
    setItems([...items, recalculateItem(newItem, taxType)]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: any,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          let updated = { ...item, [field]: value };

          // Auto-fill product details if product changed
          if (field === "productId" && value) {
            const prod = products.find((p) => p.id === value);
            if (prod) {
              updated.name = prod.name;
              updated.hsn = prod.hsn_code || "3209";
              updated.rate = prod.selling_price;
              updated.per = prod.packing_size_unit || "pcs";
            }
          }

          return recalculateItem(updated, taxType);
        }
        return item;
      }),
    );
  };

  const handleTaxTypeChange = (newType: "inclusive" | "exclusive") => {
    setTaxType(newType);
    setItems((prevItems) =>
      prevItems.map((item) => recalculateItem(item, newType)),
    );
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTemplate(val);
    localStorage.setItem("invoice_template", val);
  };

  const currentTheme = useMemo(() => {
    return (
      INVOICE_TEMPLATES.find((t) => t.id === template) || INVOICE_TEMPLATES[0]
    );
  }, [template]);

  const layout = currentTheme.layout;

  // Tax and total sums
  const subtotal = items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const additionalChargesTotal = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  const baseGrandTotal = Math.max(0, items.reduce((sum, item) => sum + item.total, 0) - discountAmount + additionalChargesTotal);
  const roundOffDiff = enableRoundOff ? Math.round(baseGrandTotal) - baseGrandTotal : 0;
  const grandTotal = baseGrandTotal + roundOffDiff;

  const cgst = isIGST ? 0 : totalTax / 2;
  const sgst = isIGST ? 0 : totalTax / 2;
  const igst = isIGST ? totalTax : 0;

  const taxSlabs = useMemo(() => {
    const slabs: { [key: number]: { taxable: number; tax: number } } = {};
    items.forEach((item) => {
      const pct = item.taxPercent;
      if (!slabs[pct]) {
        slabs[pct] = { taxable: 0, tax: 0 };
      }
      slabs[pct].taxable += item.taxableValue;
      slabs[pct].tax += item.taxAmount;
    });
    return slabs;
  }, [items]);

  const hsnSlabs = useMemo(() => {
    const slabs: {
      [key: string]: { taxable: number; taxPercent: number; tax: number };
    } = {};
    items.forEach((item) => {
      const hsn = item.hsn || "3209";
      if (!slabs[hsn]) {
        slabs[hsn] = { taxable: 0, taxPercent: item.taxPercent, tax: 0 };
      }
      slabs[hsn].taxable += item.taxableValue;
      slabs[hsn].tax += item.taxAmount;
    });
    return slabs;
  }, [items]);

  // Signature logic moved to settings.

  
  const handleResetForNext = async () => {
    setSelectedClientId("");
    setCustomerName("");
    setCustomerPhone("");
    setGstin("");
    setCustomerAddress("");
    setPincode("");
    setItems([]);
    setDiscountAmount(0);
    setAdditionalCharges([]);
    setEnableRoundOff(false);
    setSavedInvoiceId(null);
    setTransportMode("Road");
    setVehicleNo("");
    setDestination("");
    setIsSameAsBilling(false);
    setAdvancePaid(0);
    setPaymentMode("Cash");
    setCreditDays(0);
    setCurrentStep(1);
    
    const nextNo = await getNextInvoiceNumber();
    setInvoiceNo(nextNo);
  };

  const handleSaveAndNext = async () => {
    if (!customerName || !customerPhone || items.length === 0) {
      alert(t("Please fill out the client details and add at least one item."));
      return;
    }

    try {
      // Execute the database save
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: savedInvoiceId,
          date: invoiceDate,
          due_date: dueDate,
          invoice_no: invoiceNo,
          client_type: clientType,
          client_id: selectedClientId || null,
          client_details: {
            name: customerName,
            phone: customerPhone,
            gstin: gstin,
            address: customerAddress,
            state_code: state,
            pincode: pincode || "000000",
          },
          items: items.map((item) => ({
            product_id: item.productId,
            name: item.name,
            hsn_code: item.hsn,
            qty: item.qty,
            rate: item.rate,
            amount: item.total,
            qr_range: item.qrRange || null,
          })),
          tax_breakdown: { cgst, sgst, igst },
          transport_details: {
            transport_mode: transportMode,
            vehicle_no: vehicleNo,
            transport_date: transportDate,
            destination: destination,
            is_same_as_billing: isSameAsBilling,
          },
          payment_terms: {
            advance_paid: advancePaid,
            payment_mode: paymentMode,
            credit_days: creditDays,
          },
          subtotal,
          total_tax: totalTax,
          grand_total: grandTotal,
          discount_amount: discountAmount,
            additional_charges: additionalCharges,
            round_off: roundOffDiff,
          is_tax_inclusive: taxType === "inclusive",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSavedInvoiceId(data.data.id);
        setCurrentStep(2);
        // Pre-fetch the next invoice number so it's ready when user starts the next invoice
        const nextNo = await getNextInvoiceNumber();
        setInvoiceNo(nextNo);
      } else {
        alert(data.error || t("Error saving invoice data."));
      }
    } catch (err) {
      alert(t("Failed to communicate with API."));
    }
  };

  const handleGeneratePDF = async () => {
    if (!customerName) return alert(t("Please enter Client Name."));
    if (items.length === 0) return alert(t("Please add at least one item."));
    if (!previewRef.current) return;

    try {
      // Temporary scaling fix for html2canvas representation
      const originalStyle = previewRef.current.style.transform;
      previewRef.current.style.transform = "none";
      previewRef.current.style.marginBottom = "0";

      // Temporarily patch getComputedStyle to convert oklch/oklab colors
      const originalGetComputedStyle = window.getComputedStyle;
      const colorCache = new Map<string, string>();
      const convertCssColorToRgb = (colorString: string) => {
        if (colorCache.has(colorString)) return colorCache.get(colorString)!;
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return colorString;
          ctx.fillStyle = colorString;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          const rgbStr =
            a === 255
              ? `rgb(${r}, ${g}, ${b})`
              : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
          colorCache.set(colorString, rgbStr);
          return rgbStr;
        } catch (e) {
          return colorString;
        }
      };
      const replaceModernColors = (str: string) => {
        if (typeof str !== "string") return str;
        if (
          !str.includes("oklch") &&
          !str.includes("oklab") &&
          !str.includes("lch") &&
          !str.includes("lab")
        )
          return str;
        return str.replace(/(oklch|oklab|lch|lab)\([^)]+\)/gi, (match) =>
          convertCssColorToRgb(match),
        );
      };

      window.getComputedStyle = function (el, pseudoElt) {
        const style = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (typeof prop === "string") {
              if (prop === "getPropertyValue") {
                return function (propertyName: string) {
                  return replaceModernColors(
                    target.getPropertyValue(propertyName),
                  );
                };
              }
              const val = target[prop as any];
              if (typeof val === "string") return replaceModernColors(val);
            }
            const value = target[prop as any];
            return typeof value === "function"
              ? (value as any).bind(target)
              : value;
          },
        });
      };

      try {
        const opt = {
          margin: 0,
          filename: `${invoiceNo}_${customerName}.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
          pagebreak: { mode: "avoid-all" },
          jsPDF: {
            unit: "mm",
            format: "a4" as const,
            orientation: "portrait" as const,
          },
        };

        const html2pdf = (await import("html2pdf.js")).default;
        await html2pdf().set(opt).from(previewRef.current).save();
        
        // Redirect to invoice history after successful generation
        router.push("/dashboard/ceo/invoices");
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(t("Failed to generate PDF."));
    }
  };

  return (
    <div className="space-y-6">
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 ">
          <div className="bg-card border border-border rounded-2xl p-6 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-foreground">
                {t("Add New Client")}
              </h3>
              <button onClick={() => setShowAddClientModal(false)}>
                <X
                  size={20}
                  className="text-muted-foreground hover:text-foreground"
                />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Name"
                value={newClientData.name}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, name: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
              <input
                placeholder="Phone"
                value={newClientData.phone}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, phone: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
              <input
                placeholder="GSTIN"
                value={newClientData.gstin}
                onChange={(e) =>
                  setNewClientData({ ...newClientData, gstin: e.target.value })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2">
                <select
                  value={newClientData.state_code}
                  onChange={(e) =>
                    setNewClientData({
                      ...newClientData,
                      state_code: e.target.value,
                    })
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  <option value="" disabled>
                    State
                  </option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Pincode"
                  value={newClientData.pincode}
                  onChange={(e) =>
                    setNewClientData({
                      ...newClientData,
                      pincode: e.target.value,
                    })
                  }
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                />
              </div>
              <textarea
                placeholder="Address"
                value={newClientData.address}
                onChange={(e) =>
                  setNewClientData({
                    ...newClientData,
                    address: e.target.value,
                  })
                }
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
              <button
                onClick={handleSaveNewClient}
                className="w-full py-2 mt-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg"
              >
                {t("Save Client")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <FileText className="text-primary" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {t("Smart GST Invoicing & PDF Engine")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(
              "Create professional tax invoices with zero-storage client-side PDF generation.",
            )}
          </p>
        </div>
      </div>

      <div>
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* LEFT COLUMN: EDITOR */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-8">
              {/* Company Settings summary box */}
              <div className="flex justify-between items-center bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm">
                <div>
                  <span className="font-bold text-primary">
                    {t("Company Profile")}:{" "}
                  </span>
                  <span className="text-foreground font-semibold">
                    {sellerDetails.companyName} ({sellerDetails.stateCode})
                  </span>
                </div>
                <Link
                  href="/dashboard/ceo/settings"
                  className="text-sm text-primary hover:underline font-extrabold flex items-center gap-1"
                >
                  {t("Edit Settings")}
                </Link>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Layers size={20} className="text-primary" />
                  {t("Invoice Parameters")}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {t("Template")}:
                  </label>
                  <select
                    value={template}
                    onChange={handleTemplateChange}
                    className="px-3 py-1.5 bg-background border border-border text-foreground rounded-xl text-sm font-semibold transition-all outline-none focus:border-primary shadow-sm"
                  >
                    {INVOICE_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Invoice Metadata Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  {t("Invoice Metadata")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Invoice No.")}
                    </label>
                    <input
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Invoice Date")}
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Due Date")}
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                      disabled={paymentMode === "Credit"}
                    />
                  </div>
                </div>
              </div>

              {/* Client Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  {t("Client Details")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        {t("Client Type")}
                      </label>
                      <select
                        value={clientType}
                        onChange={(e) => {
                          setClientType(e.target.value as any);
                          setSelectedClientId("");
                          setCustomerName("");
                          setCustomerPhone("");
                          setCustomerAddress("");
                        }}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium appearance-none"
                      >
                        <option value="Customer">{t("Customer")}</option>
                        <option value="Dealer">{t("Dealer")}</option>
                        <option value="Contractor/Painter">{t("Contractor / Painter")}</option>
                      </select>
                    </div>

                    <div className="flex-[2]">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        {t("Select Client")}
                      </label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <select
                            value={selectedClientId}
                            onChange={(e) => handleClientSelect(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium appearance-none"
                          >
                            <option value="">{t("-- Manual Entry --")}</option>
                            {clientType === "Dealer"
                              ? dealers.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} ({d.phone || "No Phone"})
                                  </option>
                                ))
                              : clients.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name} ({c.phone || "No Phone"})
                                  </option>
                                ))}
                          </select>
                        </div>
                        {clientType !== "Dealer" && (
                          <button
                            onClick={() => setShowAddClientModal(true)}
                            className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl border border-primary/20 transition-all font-bold text-sm whitespace-nowrap flex items-center gap-2"
                          >
                            <Plus size={16} /> {t("Add New")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("clientName")} ({t("Override")})
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("Customer / Dealer Name")}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("clientGstin")}
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="08XXXXXXXXXXX"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("contactNumber")}
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 99999 99999"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("State")}
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    >
                      <option value="" disabled>
                        {t("Select State")}
                      </option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Pincode")}
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder={t("e.g. 324005")}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>



                  <div className="flex flex-col justify-end">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Tax Mode")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleTaxTypeChange("exclusive")}
                        className={`py-2 px-3 text-sm font-bold rounded-xl border transition-all ${
                          taxType === "exclusive"
                            ? "bg-primary text-background text-white border-primary"
                            : "bg-background text-foreground border-border hover:bg-card"
                        }`}
                      >
                        {t("Tax Exclusive")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTaxTypeChange("inclusive")}
                        className={`py-2 px-3 text-sm font-bold rounded-xl border transition-all ${
                          taxType === "inclusive"
                            ? "bg-primary text-background text-white border-primary"
                            : "bg-background text-foreground border-border hover:bg-card"
                        }`}
                      >
                        {t("Tax Inclusive")}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("fullAddress")}
                    </label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      rows={2}
                      placeholder={t("fullAddress")}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Transport & Dispatch Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  {t("Transport & Dispatch")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Transport Mode")}
                    </label>
                    <select
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    >
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Vehicle Number")}
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. RJ02 AB 1234"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Transport Date")}
                    </label>
                    <input
                      type="date"
                      value={transportDate}
                      onChange={(e) => setTransportDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block flex justify-between items-center mb-2">
                      {t("Destination")}
                      <label className="flex items-center gap-1 cursor-pointer text-sm text-primary lowercase normal-case">
                        <input
                          type="checkbox"
                          checked={isSameAsBilling}
                          onChange={(e) => {
                            setIsSameAsBilling(e.target.checked);
                            if (e.target.checked)
                              setDestination(customerAddress);
                          }}
                          className="accent-primary"
                        />
                        Same as Billing
                      </label>
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Destination"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Credit Terms Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Landmark size={16} className="text-primary" />
                  {t("Payment & Credit Terms")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Payment Mode")}
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Advance Paid">Advance Paid</option>
                      <option value="Cheque">Cheque</option>
                      <option value="UPI">UPI</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Advance Paid (₹)")}
                    </label>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={(e) =>
                        setAdvancePaid(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                      disabled={paymentMode === "Credit"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Markdown / Discount (₹)")}
                    </label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) =>
                        setDiscountAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">
                      {t("Additional Charges (Labour, Transport, etc.)")}
                    </label>
                    {additionalCharges.map((charge, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Charge Name"
                          value={charge.name}
                          onChange={(e) => {
                            const newCharges = [...additionalCharges];
                            newCharges[idx].name = e.target.value;
                            setAdditionalCharges(newCharges);
                          }}
                          className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                        />
                        <input
                          type="number"
                          placeholder="Amount (₹)"
                          value={charge.amount}
                          onChange={(e) => {
                            const newCharges = [...additionalCharges];
                            newCharges[idx].amount = parseFloat(e.target.value) || 0;
                            setAdditionalCharges(newCharges);
                          }}
                          className="w-32 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setAdditionalCharges(additionalCharges.filter((_, i) => i !== idx))}
                          className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAdditionalCharges([...additionalCharges, { name: "", amount: 0 }])}
                      className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add Custom Field
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={enableRoundOff}
                        onChange={(e) => setEnableRoundOff(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      {t("Round Off Grand Total")}
                    </label>
                  </div>

                  {paymentMode === "Credit" && (
                    <div className="md:col-span-2 animate-in fade-in zoom-in duration-300">
                      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        {t("Credit Period (Days)")}
                      </label>
                      <select
                        value={creditDays}
                        onChange={(e) =>
                          setCreditDays(parseInt(e.target.value))
                        }
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary transition-all text-sm font-medium"
                      >
                        <option value={15}>15 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={45}>45 Days</option>
                        <option value={60}>60 Days</option>
                        <option value={90}>90 Days</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/20 mt-2">
                  <span className="text-sm font-bold text-foreground">
                    {t("Balance Due:")}
                  </span>
                  <span className="text-lg font-black text-primary">
                    ₹{(grandTotal - advancePaid).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Product List Table / Items */}
              <div>
                <div className="flex justify-between items-end mb-4 border-t border-border pt-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} className="text-primary" />
                    {t("Line Items")}
                  </h3>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all"
                  >
                    <Plus size={14} /> {t("Add Product")}
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 bg-background border border-border rounded-2xl relative group shadow-sm"
                    >
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all shadow-md"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-4">
                          <label className="text-sm text-muted-foreground uppercase font-bold block mb-1">
                            {t("Product Name")}
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "productId",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white dark:bg-white text-slate-900 dark:text-slate-900 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary font-medium"
                          >
                            <option
                              className="bg-white text-slate-900"
                              value=""
                            >
                              {t("-- Select Product --")}
                            </option>
                            {products.map((p) => {
                              let parsedTags: string[] = [];
                              if (Array.isArray(p.tags)) {
                                parsedTags = p.tags;
                              } else if (typeof p.tags === "string") {
                                try {
                                  parsedTags = JSON.parse(p.tags);
                                } catch {
                                  parsedTags = p.tags
                                    ? p.tags
                                        .split(",")
                                        .map((t: any) => t.trim())
                                    : [];
                                }
                              }
                              const tagsStr =
                                parsedTags.length > 0
                                  ? ` [${parsedTags.join(", ")}]`
                                  : "";
                              return (
                                <option
                                  className="bg-white text-slate-900"
                                  key={p.id}
                                  value={p.id}
                                >
                                  {p.name}
                                  {tagsStr}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className="text-sm text-muted-foreground uppercase font-bold block mb-1">
                            {t("HSN Code")}
                          </label>
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) =>
                              handleItemChange(item.id, "hsn", e.target.value)
                            }
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary text-center"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className="text-sm text-muted-foreground uppercase font-bold block mb-1">
                            {t("Qty")}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "qty",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-card border border-border rounded-xl px-2 py-2 text-lg font-black text-foreground outline-none focus:border-primary text-center shadow-sm"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-1.5">
                          <label className="text-sm text-muted-foreground uppercase font-bold block mb-1">
                            {t("Rate")} (₹)
                          </label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "rate",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary text-right font-medium"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-1.5">
                          <label className="text-sm text-muted-foreground uppercase font-bold block mb-1">
                            {t("GST Slab")}
                          </label>
                          <select
                            value={item.taxPercent}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "taxPercent",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full bg-white dark:bg-white text-slate-900 dark:text-slate-900 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary text-center font-medium"
                          >
                            <option
                              className="bg-white text-slate-900"
                              value="0"
                            >
                              0%
                            </option>
                            <option
                              className="bg-white text-slate-900"
                              value="5"
                            >
                              5%
                            </option>
                            <option
                              className="bg-white text-slate-900"
                              value="12"
                            >
                              12%
                            </option>
                            <option
                              className="bg-white text-slate-900"
                              value="18"
                            >
                              18%
                            </option>
                            <option
                              className="bg-white text-slate-900"
                              value="28"
                            >
                              28%
                            </option>
                          </select>
                        </div>

                        <div className="col-span-12 md:col-span-2">
                          <label className="text-sm text-muted-foreground uppercase font-bold block mb-1">
                            {t("Total Amount")}
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={`₹${item.total.toFixed(2)}`}
                            className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none text-right font-bold"
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-border/40 pt-3">
                        <div className="flex flex-col">
                          <label className="text-xs text-muted-foreground uppercase font-bold mb-1">
                            {t("Assign QR Range")}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1000-1050"
                            value={item.qrRange || ""}
                            onChange={(e) =>
                              handleItemChange(item.id, "qrRange", e.target.value)
                            }
                            className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary font-medium w-full max-w-[200px]"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-sm text-muted-foreground border-t border-border/50 pt-2 px-1">
                        <div>
                          {t("Taxable Amount")}:{" "}
                          <span className="font-semibold text-foreground">
                            ₹{item.taxableValue.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          {t("Tax")}:{" "}
                          <span className="font-semibold text-foreground">
                            ₹{item.taxAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="font-bold text-primary">
                          {t("Line Total")}:{" "}
                          <span>₹{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-2xl">
                      {t("No items added. Click 'Add Product' to begin.")}
                    </p>
                  )}
                </div>
              </div>

              {/* Save & Next Action */}
              <div className="pt-6 border-t border-border">
                <button
                  onClick={handleSaveAndNext}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-xl transition-all shadow-lg"
                >
                  {t("Save & Next")}
                </button>
              </div>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* RIGHT COLUMN: LIVE PREVIEW (A4 Aspect Ratio) */}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-muted text-muted-foreground hover:bg-muted/80 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all w-48"
              >
                <PenTool className="w-5 h-5" />
                {t("Edit Details")}
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isPending}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25"
              >
                <Download className="w-5 h-5" />
                {isPending ? t("Generating...") : t("Generate PDF")}
              </button>
              <button
                onClick={handleResetForNext}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all w-64 shadow-lg shadow-emerald-500/25"
              >
                <Plus className="w-5 h-5" />
                {t("Create Next Invoice")}
              </button>
            </div>

            <div className="relative w-full bg-muted/30 dark:bg-card border border-border rounded-3xl shadow-lg flex items-start justify-center p-6 h-[950px] overflow-hidden">
              {/* Scaled Wrapper for Web Preview */}
              <div className="w-full h-full overflow-auto custom-scrollbar pb-32 flex justify-center">
                <div className="transform scale-[0.6] sm:scale-[0.7] xl:scale-[0.85] origin-top transition-transform pb-[200px]">
                  {/* We use a wrapper with fixed aspect ratio approximating A4 (210 x 297) */}
                  <div
                    ref={previewRef}
                    className="w-[210mm] min-h-[297mm] shrink-0 mx-auto bg-white text-black relative shadow-2xl overflow-hidden py-[20mm] px-[15mm] origin-top rounded-none [-webkit-print-color-adjust:exact] print-color-adjust-exact print:block print:w-full print:h-auto print:shadow-none print:border-none print:m-0 print:p-0 print:overflow-visible print:min-h-0"
                  >
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
                      <img
                        src="https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Swatchpaints.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1N3YXRjaHBhaW50cy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgyMzY5MTA5LCJleHAiOjI0MTMwODkxMDl9.hH-BwxYouUsynp-yYXqAMhQdoodbrOZyYLeARyTI3VY"
                        alt="Watermark"
                        className="w-[55%] object-contain opacity-[0.06]"
                      />
                    </div>

                    {/* PDF CONTENT START */}
                    <div className="relative z-10 flex flex-col">
                      {layout === "zenith" ? (
                        // ZENITH CORPORATE (Clean Blue/Grey layout)
                        <div
                          className={`bg-white ${currentTheme.colors.primaryText} relative z-10 p-6 flex flex-col h-full overflow-hidden text-[11px]`}
                        >
                          {/* Header Section */}
                          <div
                            className={`flex justify-between items-start border-b-[3px] ${currentTheme.colors.borderMain} pb-6 mb-6`}
                          >
                            <div className="flex flex-col gap-2">
                              <img
                                src={
                                  sellerDetails.logo ||
                                  "https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Sharmaindustries.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1NoYXJtYWluZHVzdHJpZXMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MjM3MDU0NSwiZXhwIjoyNDEzMDkwNTQ1fQ.JuhGIoK2TxLgKSG1t63HJAqmQUXeAgpvj_TljDqDL30"
                                }
                                alt="Logo"
                                className="h-16 object-contain origin-left"
                              />
                              <div className="text-[10px] text-slate-700 leading-tight">
                                <p>
                                  {sellerDetails.address}
                                  {sellerDetails.pincode
                                    ? ", " + sellerDetails.pincode
                                    : ""}
                                </p>
                                <p>
                                  {sellerDetails.phone} | {sellerDetails.gstin}
                                </p>
                              </div>
                            </div>
                            <div className="text-right pt-2">
                              <h1
                                className={`text-4xl font-black uppercase tracking-tight ${currentTheme.colors.accentText}`}
                              >
                                INVOICE
                              </h1>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-8 mb-6 text-[11px]">
                            <div>
                              <h3
                                className={`font-bold mb-2 text-[10px] uppercase ${currentTheme.colors.primaryText}`}
                              >
                                INVOICE TO:
                              </h3>
                              <p className="font-bold text-[12px]">
                                {customerName || "Client Name"}
                              </p>
                              {customerAddress && (
                                <p className="text-slate-700 whitespace-pre-line leading-snug">
                                  {customerAddress}
                                </p>
                              )}
                              {customerPhone && (
                                <p className="text-slate-700">
                                  {customerPhone}
                                </p>
                              )}
                              {gstin && (
                                <p className="text-slate-700 font-semibold mt-1">
                                  GSTIN: {gstin}
                                </p>
                              )}
                            </div>
                            <div className="flex justify-end">
                              <div className="text-left w-[85%]">
                                <h3
                                  className={`font-bold mb-2 text-[10px] uppercase ${currentTheme.colors.primaryText}`}
                                >
                                  INVOICE DETAILS
                                </h3>
                                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                                  <span className="font-semibold text-slate-700">
                                    Invoice #:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {isMounted ? invoiceNo : ""}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    Date:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {isMounted ? invoiceDate : ""}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    Due Date:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {isMounted && dueDate
                                      ? dueDate
                                      : "Immediate"}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    Payment Terms:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {paymentMode === "Credit"
                                      ? `${creditDays} Days`
                                      : paymentMode}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Table */}
                          <table className="w-full text-left border-collapse mb-6 flex-1">
                            <thead>
                              <tr
                                className={`${currentTheme.colors.bgHeader} text-white text-[10px] uppercase`}
                              >
                                <th className="py-2.5 px-3 font-semibold w-10 text-center">
                                  Sr.
                                </th>
                                <th className="py-2.5 px-3 font-semibold">
                                  Description
                                </th>
                                <th className="py-2.5 px-3 font-semibold text-center w-24">
                                  HSN/SAC
                                </th>
                                <th className="py-2.5 px-3 font-semibold text-center w-16">
                                  Qty
                                </th>
                                <th className="py-2.5 px-3 font-semibold text-right w-24">
                                  Unit Price
                                </th>
                                <th className="py-2.5 px-3 font-semibold text-right w-28">
                                  Total (INR)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-[11px] text-slate-800 align-top">
                              {items.length > 0 ? (
                                items.map((item, i) => (
                                  <tr
                                    key={item.id}
                                    className={`${i % 2 === 0 ? currentTheme.colors.bgAccent : "bg-transparent"} border-b border-slate-200`}
                                  >
                                    <td className="py-2.5 px-3 text-center border-x border-slate-200">
                                      {i + 1}.
                                    </td>
                                    <td className="py-2.5 px-3 font-medium border-r border-slate-200 leading-snug">
                                      {item.name || "-"}
                                    </td>
                                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                                      {item.hsn || "-"}
                                    </td>
                                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                                      {item.qty}
                                    </td>
                                    <td className="py-2.5 px-3 text-right border-r border-slate-200">
                                      {item.rate.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="py-2.5 px-3 text-right border-r border-slate-200 font-medium">
                                      {item.taxableValue.toLocaleString(
                                        undefined,
                                        { minimumFractionDigits: 2 },
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="py-4 text-center text-slate-400 italic border border-slate-200"
                                  >
                                    Add items to populate the invoice.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                          {/* Totals Section */}
                          <div className="flex justify-end mb-6">
                            <div className="w-72">
                              <div className="flex justify-between py-1.5 text-[11px]">
                                <span className="font-semibold text-slate-700">
                                  Subtotal
                                </span>
                                <span className="text-slate-900">
                                  {subtotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              {isIGST ? (
                                <div className="flex justify-between py-1.5 text-[11px]">
                                  <span className="font-semibold text-slate-700">
                                    IGST
                                  </span>
                                  <span className="text-slate-900">
                                    {igst.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className="flex justify-between py-1.5 text-[11px]">
                                    <span className="font-semibold text-slate-700">
                                      CGST
                                    </span>
                                    <span className="text-slate-900">
                                      {cgst.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
                                    <span className="font-semibold text-slate-700">
                                      SGST
                                    </span>
                                    <span className="text-slate-900">
                                      {sgst.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                </>
                              )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}


{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px]">
    <span className="font-semibold text-foreground">{charge.name}</span>
    <span className="text-foreground">+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px]">
    <span className="font-semibold text-foreground">Round Off</span>
    <span className="text-foreground">{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                              <div
                                className={`flex justify-between items-center py-2.5 mt-1.5 border-b-[3px] border-t-[3px] ${currentTheme.colors.borderMain}`}
                              >
                                <span
                                  className={`font-bold text-[13px] ${currentTheme.colors.primaryText}`}
                                >
                                  Total Amount
                                </span>
                                <span
                                  className={`font-bold text-[14px] ${currentTheme.colors.primaryText}`}
                                >
                                  {grandTotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  INR
                                </span>
                              </div>
                              <div className="mt-1 text-[8px] text-right font-medium text-slate-500 uppercase">
                                Amount in words: {numberToWords(grandTotal)}{" "}
                                Only
                              </div>
                            </div>
                          </div>

                          {/* Bottom Section (Payment & Notes) */}
                          <div className="grid grid-cols-2 gap-8 text-[10px] mt-auto pb-4">
                            <div>
                              <h3
                                className={`font-bold uppercase mb-1.5 tracking-wider border-b pb-1 ${currentTheme.colors.borderLight} ${currentTheme.colors.primaryText}`}
                              >
                                PAYMENT METHODS
                              </h3>
                              <div className="grid grid-cols-[80px_1fr] gap-y-0.5 mt-2">
                                <span className="text-slate-500">
                                  Bank Transfer:
                                </span>{" "}
                                <span className="font-semibold">
                                  {sellerDetails.bankName}
                                </span>
                                <span className="text-slate-500">
                                  Account Title:
                                </span>{" "}
                                <span className="font-semibold">
                                  {sellerDetails.ownerName}
                                </span>
                                <span className="text-slate-500">
                                  A/C Number:
                                </span>{" "}
                                <span className="font-semibold">
                                  {sellerDetails.accountNumber}
                                </span>
                                <span className="text-slate-500">
                                  IFSC Code:
                                </span>{" "}
                                <span className="font-semibold">
                                  {sellerDetails.ifsc}
                                </span>
                                {sellerDetails.upiId && (
                                  <>
                                    <span className="text-slate-500 mt-1">
                                      UPI:
                                    </span>{" "}
                                    <span className="font-semibold mt-1">
                                      {sellerDetails.upiId}
                                    </span>
                                  </>
                                )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                              </div>
                            </div>
                            <div>
                              <h3
                                className={`font-bold uppercase mb-1.5 tracking-wider border-b pb-1 ${currentTheme.colors.borderLight} ${currentTheme.colors.primaryText}`}
                              >
                                NOTES:
                              </h3>
                              <p className="text-slate-700 leading-relaxed whitespace-pre-line mt-2">
                                {notes ||
                                  "Thank you for your business!\nPlease make payment by the due date. Reference Invoice # on payment."}
                              </p>
                              {signatureUrl ? (
                                <div className="mt-6 flex flex-col items-end">
                                  <img
                                    src={signatureUrl}
                                    alt="Signature"
                                    className="h-10 object-contain mix-blend-multiply mb-1"
                                  />
                                  <span className="border-t border-slate-300 pt-1 text-[9px] w-32 text-center text-slate-500">
                                    Authorized Signature
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-10 flex flex-col items-end">
                                  <span className="border-t border-slate-300 pt-1 text-[9px] w-32 text-center text-slate-500">
                                    Authorized Signature
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Strip */}
                          <div
                            className={`mt-2 py-2.5 px-6 ${currentTheme.colors.bgHeader} text-white flex justify-between items-center text-[10px] tracking-wide rounded-sm absolute bottom-0 left-0 right-0`}
                          >
                            <div className="flex gap-4">
                              <span>GSTIN: {sellerDetails.gstin}</span>
                            </div>
                            <div className="flex gap-4 opacity-90">
                              <span>{sellerDetails.phone}</span>
                              <span>{sellerDetails.address}</span>
                            </div>
                          </div>
                        </div>
                      ) : layout === "swipe" ? (
                        // SWIPE FORMAL (Strict grid, black and white, QR Code)
                        <div
                          className={`bg-white ${currentTheme.colors.primaryText} relative z-10 flex flex-col h-full text-[9px] leading-tight border ${currentTheme.colors.borderMain}`}
                        >
                          <div className="flex text-[10px]">
                            <div
                              className={`flex-1 flex justify-center items-center font-bold tracking-widest text-[#4caf50] uppercase py-1 border-r border-b ${currentTheme.colors.borderMain}`}
                            >
                              TAX INVOICE
                            </div>
                            <div
                              className={`w-40 flex justify-center items-center font-bold py-1 border-b ${currentTheme.colors.borderMain}`}
                            >
                              ORIGINAL FOR RECIPIENT
                            </div>
                          </div>
                          {/* Header Row */}
                          <div
                            className={`flex border-b ${currentTheme.colors.borderMain}`}
                          >
                            <div
                              className={`w-[60%] flex border-r ${currentTheme.colors.borderMain}`}
                            >
                              <div className="w-1/3 flex items-center justify-center p-2">
                                <img
                                  src={
                                    sellerDetails.logo ||
                                    "/logo_day_cropped.png"
                                  }
                                  alt="Logo"
                                  className="w-full max-h-16 object-contain"
                                />
                              </div>
                              <div className="w-2/3 p-2">
                                <p className="font-bold text-[11px] uppercase mb-0.5">
                                  {sellerDetails.companyName}
                                </p>
                                <p>
                                  GSTIN:{" "}
                                  <span className="font-semibold">
                                    {sellerDetails.gstin}
                                  </span>
                                </p>
                                <p className="whitespace-pre-line leading-snug">
                                  {sellerDetails.address}
                                  {sellerDetails.pincode
                                    ? ", " + sellerDetails.pincode
                                    : ""}
                                </p>
                                <p>Phone: {sellerDetails.phone}</p>
                              </div>
                            </div>
                            <div className="w-[40%]">
                              <div
                                className={`flex border-b ${currentTheme.colors.borderMain}`}
                              >
                                <div
                                  className={`flex-1 p-2 border-r ${currentTheme.colors.borderMain}`}
                                >
                                  <p className="text-slate-600">Invoice #:</p>
                                  <p className="font-bold">
                                    {isMounted ? invoiceNo : ""}
                                  </p>
                                </div>
                                <div className="flex-1 p-2">
                                  <p className="text-slate-600">
                                    Invoice Date:
                                  </p>
                                  <p className="font-bold">
                                    {isMounted ? invoiceDate : ""}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`flex border-b ${currentTheme.colors.borderMain}`}
                              >
                                <div
                                  className={`flex-1 p-2 border-r ${currentTheme.colors.borderMain}`}
                                >
                                  <p className="text-slate-600">
                                    Place of Supply:
                                  </p>
                                  <p className="font-bold">{state}</p>
                                </div>
                                <div className="flex-1 p-2">
                                  <p className="text-slate-600">Due Date:</p>
                                  <p className="font-bold">
                                    {isMounted && dueDate
                                      ? dueDate
                                      : "On Receipt"}
                                  </p>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Parties Row */}
                          <div
                            className={`flex border-b ${currentTheme.colors.borderMain}`}
                          >
                            <div
                              className={`w-[60%] p-2 border-r ${currentTheme.colors.borderMain}`}
                            >
                              <p className="text-slate-600 mb-0.5">
                                Customer Details:
                              </p>
                              <p className="font-bold uppercase">
                                {customerName}
                              </p>
                              {gstin && (
                                <p>
                                  GSTIN:{" "}
                                  <span className="font-bold">{gstin}</span>
                                </p>
                              )}
                              <p className="mt-1 font-semibold text-slate-700">
                                Billing address:
                              </p>
                              {customerAddress && (
                                <p className="whitespace-pre-line leading-snug">
                                  {customerAddress}
                                </p>
                              )}
                              {customerPhone && <p>Ph: {customerPhone}</p>}
                            </div>
                            <div className="w-[40%] flex flex-col">
                              <div
                                className={`flex-1 flex items-center justify-center border-b ${currentTheme.colors.borderMain} p-2`}
                              >
                                {sellerDetails.upiId ? (
    <QRCodeSVG 
      value={`upi://pay?pa=${sellerDetails.upiId}&pn=${sellerDetails.ownerName || sellerDetails.companyName}&am=${grandTotal}&cu=INR`} 
      size={80} 
      level="M" 
    />
  ) : (
    <QrCode className="w-20 h-20 text-slate-800 opacity-80" />
  )}
                              </div>
                              <div className="flex-1 p-2 bg-slate-50/50">
                                <p className="font-semibold text-slate-700 mb-0.5">
                                  Shipping address:
                                </p>
                                {customerAddress && (
                                  <p className="whitespace-pre-line leading-snug">
                                    {customerAddress}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Table */}
                          <table
                            className={`w-full text-left border-collapse border-b ${currentTheme.colors.borderMain} flex-1`}
                          >
                            <thead>
                              <tr
                                className={`border-b ${currentTheme.colors.borderMain} ${currentTheme.colors.bgHeader} font-bold`}
                              >
                                <th
                                  className={`p-1 text-center border-r ${currentTheme.colors.borderMain} w-8`}
                                >
                                  #
                                </th>
                                <th
                                  className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                >
                                  Item
                                </th>
                                <th
                                  className={`p-1 text-center border-r ${currentTheme.colors.borderMain} w-16`}
                                >
                                  HSN/SAC
                                </th>
                                <th
                                  className={`p-1 text-center border-r ${currentTheme.colors.borderMain} w-12`}
                                >
                                  Tax
                                </th>
                                <th
                                  className={`p-1 text-center border-r ${currentTheme.colors.borderMain} w-12`}
                                >
                                  Qty
                                </th>
                                <th
                                  className={`p-1 text-right border-r ${currentTheme.colors.borderMain} w-20`}
                                >
                                  Rate/Item
                                </th>
                                <th
                                  className={`p-1 text-center border-r ${currentTheme.colors.borderMain} w-10`}
                                >
                                  Per
                                </th>
                                <th className={`p-1 text-right w-24`}>
                                  Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="align-top">
                              {items.map((item, i) => (
                                <tr key={item.id}>
                                  <td
                                    className={`p-1 text-center border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    {i + 1}
                                  </td>
                                  <td
                                    className={`p-1 font-bold border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    {item.name}
                                  </td>
                                  <td
                                    className={`p-1 text-center border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    {item.hsn}
                                  </td>
                                  <td
                                    className={`p-1 text-center border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    {item.taxPercent}%
                                  </td>
                                  <td
                                    className={`p-1 text-center border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    {item.qty}
                                  </td>
                                  <td
                                    className={`p-1 text-right border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    {item.rate.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td
                                    className={`p-1 text-center border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    Nos
                                  </td>
                                  <td className="p-1 text-right">
                                    {item.taxableValue.toLocaleString(
                                      undefined,
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {/* Totals inline in table body */}
                              <tr className="h-10">
                                <td
                                  colSpan={5}
                                  className={`border-r ${currentTheme.colors.borderMain}`}
                                ></td>
                                <td
                                  colSpan={2}
                                  className={`p-1 text-right font-bold border-r ${currentTheme.colors.borderMain}`}
                                >
                                  Taxable Amount
                                </td>
                                <td className="p-1 text-right font-bold">
                                  ₹
                                  {subtotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                              {isIGST ? (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className={`border-r ${currentTheme.colors.borderMain}`}
                                  ></td>
                                  <td
                                    colSpan={2}
                                    className={`p-1 text-right font-bold border-r ${currentTheme.colors.borderMain}`}
                                  >
                                    IGST
                                  </td>
                                  <td className="p-1 text-right font-bold">
                                    ₹
                                    {igst.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              ) : (
                                <>
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className={`border-r ${currentTheme.colors.borderMain}`}
                                    ></td>
                                    <td
                                      colSpan={2}
                                      className={`p-1 text-right font-bold border-r ${currentTheme.colors.borderMain}`}
                                    >
                                      CGST
                                    </td>
                                    <td className="p-1 text-right font-bold">
                                      ₹
                                      {cgst.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className={`border-r ${currentTheme.colors.borderMain}`}
                                    ></td>
                                    <td
                                      colSpan={2}
                                      className={`p-1 text-right font-bold border-r ${currentTheme.colors.borderMain}`}
                                    >
                                      SGST
                                    </td>
                                    <td className="p-1 text-right font-bold">
                                      ₹
                                      {sgst.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                </>
                              )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                              <tr
                                className={`border-t border-b ${currentTheme.colors.borderMain} font-bold`}
                              >
                                <td
                                  colSpan={4}
                                  className={`p-1 text-right border-r ${currentTheme.colors.borderMain}`}
                                >
                                  Total
                                </td>
                                <td
                                  className={`p-1 text-center border-r ${currentTheme.colors.borderMain}`}
                                >
                                  {items.reduce((s, i) => s + i.qty, 0)}
                                </td>
                                <td
                                  colSpan={2}
                                  className={`border-r ${currentTheme.colors.borderMain}`}
                                ></td>
                                <td className="p-1 text-right text-[11px]">
                                  ₹
                                  {grandTotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Amount in words */}
                          <div
                            className={`border-b ${currentTheme.colors.borderMain} p-1 flex justify-between`}
                          >
                            <span>
                              Amount Chargeable (in words):{" "}
                              <b>INR {numberToWords(grandTotal)} Only.</b>
                            </span>
                            <span className="italic font-bold">E & O.E</span>
                          </div>

                          {/* Tax Breakup Table */}
                          <table
                            className={`w-full text-center border-collapse border-b ${currentTheme.colors.borderMain}`}
                          >
                            <thead>
                              <tr
                                className={`border-b ${currentTheme.colors.borderMain} ${currentTheme.colors.bgHeader}`}
                              >
                                <th
                                  className={`p-1 border-r ${currentTheme.colors.borderMain} text-left`}
                                  rowSpan={2}
                                >
                                  HSN/SAC
                                </th>
                                <th
                                  className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                  rowSpan={2}
                                >
                                  Taxable Value
                                </th>
                                {isIGST ? (
                                  <th
                                    className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                    colSpan={2}
                                  >
                                    Integrated Tax
                                  </th>
                                ) : (
                                  <>
                                    <th
                                      className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                      colSpan={2}
                                    >
                                      Central Tax
                                    </th>
                                    <th
                                      className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                      colSpan={2}
                                    >
                                      State Tax
                                    </th>
                                  </>
                                )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                <th className="p-1" rowSpan={2}>
                                  Total Tax Amount
                                </th>
                              </tr>
                              <tr
                                className={`border-b ${currentTheme.colors.borderMain} ${currentTheme.colors.bgHeader}`}
                              >
                                <th
                                  className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                >
                                  Rate
                                </th>
                                <th
                                  className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                >
                                  Amount
                                </th>
                                {!isIGST && (
                                  <>
                                    <th
                                      className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                    >
                                      Rate
                                    </th>
                                    <th
                                      className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                    >
                                      Amount
                                    </th>
                                  </>
                                )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(hsnSlabs).map(([hsn, slab]) => {
                                const pct = slab.taxPercent;
                                return (
                                  <tr key={hsn}>
                                    <td
                                      className={`p-1 border-r ${currentTheme.colors.borderMain} text-left`}
                                    >
                                      {hsn}
                                    </td>
                                    <td
                                      className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                    >
                                      ₹
                                      {slab.taxable.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                    {isIGST ? (
                                      <>
                                        <td
                                          className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                        >
                                          {pct}%
                                        </td>
                                        <td
                                          className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                        >
                                          ₹
                                          {slab.tax.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td
                                          className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                        >
                                          {pct / 2}%
                                        </td>
                                        <td
                                          className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                        >
                                          ₹
                                          {(slab.tax / 2).toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 },
                                          )}
                                        </td>
                                        <td
                                          className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                        >
                                          {pct / 2}%
                                        </td>
                                        <td
                                          className={`p-1 border-r ${currentTheme.colors.borderMain}`}
                                        >
                                          ₹
                                          {(slab.tax / 2).toLocaleString(
                                            undefined,
                                            { minimumFractionDigits: 2 },
                                          )}
                                        </td>
                                      </>
                                    )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                    <td className="p-1">
                                      ₹
                                      {slab.tax.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Footer Section */}
                          <div className="flex flex-1">
                            <div
                              className={`w-[55%] border-r ${currentTheme.colors.borderMain} p-2 flex flex-col justify-between`}
                            >
                              <div>
                                <p className="font-bold underline mb-1">
                                  Bank Details:
                                </p>
                                <div className="grid grid-cols-[60px_1fr] gap-y-0.5">
                                  <span className="text-slate-600">Bank:</span>{" "}
                                  <span className="font-bold">
                                    {sellerDetails.bankName}
                                  </span>
                                  <span className="text-slate-600">
                                    Account #:
                                  </span>{" "}
                                  <span className="font-bold">
                                    {sellerDetails.accountNumber}
                                  </span>
                                  <span className="text-slate-600">IFSC:</span>{" "}
                                  <span className="font-bold">
                                    {sellerDetails.ifsc}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 text-[8px]">
                                <p className="font-bold underline">Notes:</p>
                                <p>{notes || "Thank you for choosing us!"}</p>
                              </div>
                            </div>
                            <div className="w-[45%] flex flex-col justify-between">
                              <div
                                className={`flex border-b ${currentTheme.colors.borderMain}`}
                              >
                                <div
                                  className={`w-1/2 p-2 border-r ${currentTheme.colors.borderMain}`}
                                >
                                  <p className="font-bold text-slate-600 mb-1">
                                    Pay using UPI:
                                  </p>
                                  {sellerDetails.upiId ? (
    <QRCodeSVG 
      value={`upi://pay?pa=${sellerDetails.upiId}&pn=${sellerDetails.ownerName || sellerDetails.companyName}&am=${grandTotal}&cu=INR`} 
      size={64} 
      level="M" 
    />
  ) : (
    <QrCode className="w-16 h-16 opacity-90" />
  )}
                                </div>
                                <div className="w-1/2 p-2 text-right relative flex flex-col items-end">
                                  {sellerDetails.companyStampUrl && (
                                    <img
                                      src={sellerDetails.companyStampUrl}
                                      alt="Stamp"
                                      className="absolute right-6 bottom-1 h-14 object-contain mix-blend-multiply pointer-events-none opacity-80"
                                      style={{ transform: "rotate(-8deg)" }}
                                    />
                                  )}
                                  
                                  <p className="font-bold text-[11px] mb-8">
                                    For {sellerDetails.companyName}
                                  </p>
                                  {signatureUrl ? (
                                    <img
                                      src={signatureUrl}
                                      alt="Signature"
                                      className="h-8 object-contain mix-blend-multiply ml-auto"
                                    />
                                  ) : (
                                    <div className="h-8 italic text-[7px] text-slate-400">
                                      Digitally Signed
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="p-2 text-[8px] border-t border-slate-200">
                                 {sellerDetails.notes && (
                                   <div className="mb-2 font-bold text-slate-700">
                                     Notes: <span className="font-normal">{sellerDetails.notes}</span>
                                   </div>
                                 )}
                                 <p className="font-bold underline mb-1">
                                   Terms and Conditions:
                                 </p>
                                 <div className="whitespace-pre-line leading-normal text-slate-600">
                                   {sellerDetails.termsAndConditions || "Subject to local jurisdiction. Goods once sold will not be taken back."}
                                 </div>
                               </div>
                            </div>
                          </div>
                        </div>
                      ) : layout === "eztax" ? (
                        // EZTAX VIBRANT (Red/Blue with numbered circles)
                        <div
                          className={`bg-white ${currentTheme.colors.primaryText} relative z-10 p-6 flex flex-col h-full overflow-hidden text-[10px]`}
                        >
                          {/* Header Section */}
                          <div className="flex justify-between items-start mb-6 border-b border-slate-300 pb-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={
                                  sellerDetails.logo || "/logo_day_cropped.png"
                                }
                                alt="Logo"
                                className="h-10 object-contain"
                              />
                              <h1 className="text-2xl font-black text-[#8b0000] tracking-tight">
                                {sellerDetails.companyName}
                              </h1>
                            </div>
                            <div className="text-right">
                              <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
                                Tax Invoice
                              </h2>
                            </div>
                          </div>

                          {/* Grid 4 Columns */}
                          <div className="flex justify-between mb-6">
                            {/* Column 1: Seller */}
                            <div className="w-1/4 pr-2">
                              <div className="flex items-center gap-1 mb-1">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                                  1
                                </div>
                                <h3 className="font-bold text-[#e11d48] uppercase tracking-wide">
                                  Seller Info
                                </h3>
                              </div>
                              <div className="mt-2 text-slate-800 leading-snug">
                                <p className="font-bold text-slate-900">
                                  {sellerDetails.companyName}
                                </p>
                                <p>{sellerDetails.address}</p>
                                <p>{sellerDetails.phone}</p>
                                <p>
                                  GSTIN:{" "}
                                  <span className="font-semibold">
                                    {sellerDetails.gstin}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {/* Column 2: Buyer */}
                            <div className="w-1/4 px-2">
                              <div className="flex items-center gap-1 mb-1">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                                  2
                                </div>
                                <h3 className="font-bold text-[#e11d48] uppercase tracking-wide">
                                  Buyer / Consignee
                                </h3>
                              </div>
                              <div className="mt-2 text-slate-800 leading-snug">
                                <p className="font-bold text-slate-900 uppercase">
                                  {customerName}
                                </p>
                                {customerPhone && <p>{customerPhone}</p>}
                                {gstin && (
                                  <p>
                                    GSTIN:{" "}
                                    <span className="font-semibold">
                                      {gstin}
                                    </span>
                                  </p>
                                )}
                                <p className="mt-1 font-semibold text-[#e11d48]">
                                  Bill To / Ship To
                                </p>
                                {customerAddress && <p>{customerAddress}</p>}
                                <p className="mt-1">
                                  Place of Supply:{" "}
                                  <span className="font-semibold">{state}</span>
                                </p>
                              </div>
                            </div>
                            {/* Column 3: Invoice Info */}
                            <div className="w-1/4 px-2">
                              <div className="flex items-center gap-1 mb-1">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                                  3
                                </div>
                                <h3 className="font-bold text-[#e11d48] uppercase tracking-wide">
                                  Invoice No
                                </h3>
                              </div>
                              <div className="mt-2 bg-[#e11d48] text-white flex justify-between px-2 py-1 font-bold rounded-sm shadow-sm mb-2">
                                <span>Invoice Amt</span>
                                <span>
                                  ₹
                                  {grandTotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-y-1 text-slate-800">
                                <span>Invoice No:</span>{" "}
                                <span className="font-bold text-right">
                                  {isMounted ? invoiceNo : ""}
                                </span>
                                <span>Invoice Date:</span>{" "}
                                <span className="text-right">
                                  {isMounted ? invoiceDate : ""}
                                </span>
                                <span>Due Date:</span>{" "}
                                <span className="text-right">
                                  {isMounted && dueDate ? dueDate : ""}
                                </span>
                              </div>
                            </div>
                            {/* Column 4: References */}
                            <div className="w-1/4 pl-2 flex flex-col items-end text-right">
                              <div className="flex items-center gap-1 mb-1 self-end">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs">
                                  4
                                </div>
                              </div>
                              <div className="mt-2 text-slate-800 font-semibold space-y-1">
                                <p>Ref: PO#N/A</p>
                                <p>Shipping Order#N/A</p>
                              </div>
                            </div>
                          </div>

                          {/* Items Table */}
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              5
                            </div>
                          </div>
                          <table className="w-full text-left border-collapse border-b border-t-2 border-[#e11d48] mb-4">
                            <thead>
                              <tr className="bg-[#e11d48] text-white text-[9px]">
                                <th className="py-1.5 px-2 w-8">S.No</th>
                                <th className="py-1.5 px-2">
                                  Product / Service
                                </th>
                                <th className="py-1.5 px-2 w-16 text-center">
                                  HSN/SAC
                                </th>
                                <th className="py-1.5 px-2 w-10 text-center">
                                  Qty
                                </th>
                                <th className="py-1.5 px-2 w-10 text-center">
                                  UoM
                                </th>
                                <th className="py-1.5 px-2 w-20 text-right">
                                  Price Per Unit
                                </th>
                                <th className="py-1.5 px-2 w-24 text-right">
                                  Taxable Amount
                                </th>
                                <th className="py-1.5 px-2 w-14 text-center">
                                  Tax Rate
                                </th>
                                <th className="py-1.5 px-2 w-20 text-right">
                                  Line Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="align-top">
                              {items.map((item, i) => (
                                <tr
                                  key={item.id}
                                  className="border-b border-slate-200"
                                >
                                  <td className="py-2 px-2 text-center">
                                    {i + 1}
                                  </td>
                                  <td className="py-2 px-2 font-semibold">
                                    {item.name}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    {item.hsn}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    {item.qty}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    Units
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {item.rate.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {item.taxableValue.toLocaleString(
                                      undefined,
                                      { minimumFractionDigits: 2 },
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    {item.taxPercent}%
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {item.total.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-[#fff1f2] font-bold text-[#e11d48]">
                                <td
                                  colSpan={6}
                                  className="py-2 px-2 text-right"
                                >
                                  Total
                                </td>
                                <td className="py-2 px-2 text-right">
                                  {subtotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="py-2 px-2"></td>
                                <td className="py-2 px-2 text-right">
                                  {grandTotal.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {/* Tax Breakup & Totals */}
                          <div className="flex gap-4 mb-4">
                            <div className="flex-1 flex gap-2">
                              <div className="flex flex-col items-start gap-1">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  6
                                </div>
                              </div>
                              {isIGST ? (
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-500 mb-1">
                                    IGST Tax Breakup
                                  </div>
                                  <table className="w-full border-collapse bg-slate-50 text-[9px]">
                                    <thead>
                                      <tr className="border-b border-slate-300">
                                        <th className="p-1 text-left">Rate</th>
                                        <th className="p-1 text-right">
                                          Taxable Amount
                                        </th>
                                        <th className="p-1 text-right">
                                          Amount
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(hsnSlabs).map(
                                        ([hsn, slab]) => (
                                          <tr key={`igst-${hsn}`}>
                                            <td className="p-1">
                                              {slab.taxPercent}%
                                            </td>
                                            <td className="p-1 text-right">
                                              {slab.taxable.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 },
                                              )}
                                            </td>
                                            <td className="p-1 text-right">
                                              {slab.tax.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 },
                                              )}
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-500 mb-1">
                                      CGST Tax Breakup
                                    </div>
                                    <table className="w-full border-collapse bg-slate-50 text-[9px]">
                                      <thead>
                                        <tr className="border-b border-slate-300">
                                          <th className="p-1 text-left">
                                            Rate
                                          </th>
                                          <th className="p-1 text-right">
                                            Taxable Amount
                                          </th>
                                          <th className="p-1 text-right">
                                            Amount
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(hsnSlabs).map(
                                          ([hsn, slab]) => (
                                            <tr key={`cgst-${hsn}`}>
                                              <td className="p-1">
                                                {slab.taxPercent / 2}%
                                              </td>
                                              <td className="p-1 text-right">
                                                {slab.taxable.toLocaleString(
                                                  undefined,
                                                  { minimumFractionDigits: 2 },
                                                )}
                                              </td>
                                              <td className="p-1 text-right">
                                                {(slab.tax / 2).toLocaleString(
                                                  undefined,
                                                  { minimumFractionDigits: 2 },
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-slate-500 mb-1">
                                      SGST Tax Breakup
                                    </div>
                                    <table className="w-full border-collapse bg-slate-50 text-[9px]">
                                      <thead>
                                        <tr className="border-b border-slate-300">
                                          <th className="p-1 text-left">
                                            Rate
                                          </th>
                                          <th className="p-1 text-right">
                                            Taxable Amount
                                          </th>
                                          <th className="p-1 text-right">
                                            Amount
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(hsnSlabs).map(
                                          ([hsn, slab]) => (
                                            <tr key={`sgst-${hsn}`}>
                                              <td className="p-1">
                                                {slab.taxPercent / 2}%
                                              </td>
                                              <td className="p-1 text-right">
                                                {slab.taxable.toLocaleString(
                                                  undefined,
                                                  { minimumFractionDigits: 2 },
                                                )}
                                              </td>
                                              <td className="p-1 text-right">
                                                {(slab.tax / 2).toLocaleString(
                                                  undefined,
                                                  { minimumFractionDigits: 2 },
                                                )}
                                              </td>
                                            </tr>
                                          ),
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                            </div>

                            <div className="w-64 grid grid-cols-2 gap-y-1 font-semibold text-slate-800 text-[10px]">
                              <span className="text-right">
                                Total Taxable Amount
                              </span>{" "}
                              <span className="text-right">
                                {subtotal.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                              <span className="text-right">Total Tax</span>{" "}
                              <span className="text-right">
                                {(isIGST ? igst : cgst + sgst).toLocaleString(
                                  undefined,
                                  { minimumFractionDigits: 2 },
                                )}
                              </span>
                              <span className="text-right text-[#1e3a8a] font-bold mt-1">
                                Total Amount
                              </span>{" "}
                              <span className="text-right text-[#1e3a8a] font-bold mt-1">
                                ₹
                                {grandTotal.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Footer Section */}
                          <div className="mt-auto flex justify-between pt-4 border-t border-slate-300">
                            <div className="w-[60%] flex gap-2">
                              <div className="flex flex-col items-start gap-1">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  7
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-[#e11d48]">
                                  Terms & Conditions
                                </h4>
                                <p className="text-slate-600 text-[9px] mb-2">
                                  All Invoices are due with in 7 days from date
                                  of issue. No refunds accepted after delivery!
                                </p>

                                <h4 className="font-bold text-[#e11d48] mt-2">
                                  Payment Instructions:
                                </h4>
                                <p className="text-slate-700 text-[9px] font-semibold">
                                  {sellerDetails.ownerName} | Bank:{" "}
                                  {sellerDetails.bankName} | ACCT#{" "}
                                  {sellerDetails.accountNumber} | IFSC#{" "}
                                  {sellerDetails.ifsc}
                                </p>
                              </div>
                            </div>
                            <div className="w-[35%] flex gap-2">
                              <div className="flex flex-col items-start gap-1">
                                <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  8
                                </div>
                              </div>
                              <div className="flex-1 flex flex-col items-center">
                                <p className="italic text-slate-500 mb-2">
                                  For {sellerDetails.companyName}
                                </p>
                                {signatureUrl ? (
                                  <img
                                    src={signatureUrl}
                                    alt="Signature"
                                    className="h-10 object-contain mix-blend-multiply"
                                  />
                                ) : (
                                  <div className="h-10"></div>
                                )}
                                <p className="font-bold text-slate-800 border-t border-slate-300 w-full text-center mt-1 pt-1">
                                  Authorised Signature
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : layout === "modern" ? (
                        // MODERN MINIMALIST (Sleek Bill style)
                        <>
                          {/* MODERN MINIMALIST HEADER */}
                          <div
                            className={`flex justify-between items-start mb-6 pb-4 border-b ${currentTheme.colors.borderLight}`}
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src="https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Sharmaindustries.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1NoYXJtYWluZHVzdHJpZXMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MjM3MDU0NSwiZXhwIjoyNDEzMDkwNTQ1fQ.JuhGIoK2TxLgKSG1t63HJAqmQUXeAgpvj_TljDqDL30"
                                alt="Logo"
                                className="w-20 h-20 object-contain"
                              />
                              <div>
                                <h1
                                  className={`text-xl font-extrabold tracking-tight uppercase ${currentTheme.colors.primaryText}`}
                                >
                                  {sellerDetails.companyName}
                                </h1>
                                <p className="text-sm text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                                  {sellerDetails.address}
                                  {sellerDetails.pincode
                                    ? ", " + sellerDetails.pincode
                                    : ""}
                                </p>
                                <div className="mt-1 text-sm text-slate-600 space-y-0.5">
                                  <p>
                                    <span className="font-semibold">
                                      GSTIN:
                                    </span>{" "}
                                    {sellerDetails.gstin}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Phone:
                                    </span>{" "}
                                    {sellerDetails.phone}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end text-right">
                              <h2
                                className={`text-xl font-black uppercase tracking-widest ${currentTheme.colors.primaryText}`}
                              >
                                Tax Invoice
                              </h2>
                              <p
                                className={`text-sm mt-1 ${currentTheme.colors.secondaryText}`}
                              >
                                <span className="font-bold">Invoice No:</span>{" "}
                                {isMounted ? invoiceNo : ""}
                              </p>
                              <p
                                className={`text-sm ${currentTheme.colors.secondaryText}`}
                              >
                                <span className="font-bold">Date:</span>{" "}
                                {isMounted ? invoiceDate : ""}
                              </p>
                              <p
                                className={`text-sm ${currentTheme.colors.secondaryText}`}
                              >
                                <span className="font-bold">Due Date:</span>{" "}
                                {isMounted && dueDate ? dueDate : "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Bill To & Supply Info */}
                          <div className="mb-4 grid grid-cols-2 gap-4 relative z-10">
                            <div
                              className={`p-3 border rounded-lg bg-transparent ${currentTheme.colors.borderLight}`}
                            >
                              <h3
                                className={`text-[9px] font-black uppercase tracking-wider mb-1 pb-1 border-b ${currentTheme.colors.secondaryText} ${currentTheme.colors.borderLight}`}
                              >
                                Billed To
                              </h3>
                              <p
                                className={`font-bold text-[11px] ${currentTheme.colors.primaryText}`}
                              >
                                {customerName || "Client Name"}
                              </p>
                              {customerAddress && (
                                <p className="text-sm text-slate-600 mt-0.5 leading-tight whitespace-pre-line">
                                  {customerAddress}
                                  {pincode ? ", " + pincode : ""}
                                </p>
                              )}
                              {customerPhone && (
                                <p className="text-sm text-slate-500 mt-0.5">
                                  Phone: {customerPhone}
                                </p>
                              )}
                              {gstin && (
                                <p className="text-sm text-slate-800 mt-0.5">
                                  GSTIN:{" "}
                                  <span className="font-bold">{gstin}</span>
                                </p>
                              )}
                            </div>

                            <div
                              className={`p-3 border rounded-lg flex flex-col justify-between bg-transparent ${currentTheme.colors.borderLight}`}
                            >
                              <div>
                                <h3
                                  className={`text-[9px] font-black uppercase tracking-wider mb-1 pb-1 border-b ${currentTheme.colors.secondaryText} ${currentTheme.colors.borderLight}`}
                                >
                                  Transportation / Supply Details
                                </h3>
                                <div className="grid grid-cols-2 gap-y-0.5 text-sm mt-1">
                                  <span className="text-slate-500">
                                    State of Supply:
                                  </span>{" "}
                                  <span className="font-bold text-slate-955">
                                    {state || "Rajasthan"}
                                  </span>
                                  <span className="text-slate-500">
                                    Tax Mechanism:
                                  </span>{" "}
                                  <span className="font-semibold text-slate-850 uppercase">
                                    {taxType === "inclusive"
                                      ? "Inclusive"
                                      : "Exclusive"}
                                  </span>
                                  <span className="text-slate-500">
                                    Transport:
                                  </span>{" "}
                                  <span className="font-semibold text-slate-850">
                                    {transportMode} - {vehicleNo || "N/A"}
                                  </span>
                                  <span className="text-slate-500">
                                    Destination:
                                  </span>{" "}
                                  <span className="font-semibold text-slate-850">
                                    {destination || "N/A"}
                                  </span>
                                  <span className="text-slate-500">
                                    Dispatch Date:
                                  </span>{" "}
                                  <span className="font-semibold text-slate-850">
                                    {transportDate || "N/A"}
                                  </span>
                                  <span className="text-slate-500">
                                    Pay Terms:
                                  </span>{" "}
                                  <span className="font-semibold text-slate-850">
                                    {paymentMode === "Credit"
                                      ? `${creditDays} Days Credit`
                                      : paymentMode}
                                  </span>
                                  <span className="text-slate-500">
                                    Advance:
                                  </span>{" "}
                                  <span className="font-semibold text-slate-850">
                                    ₹{(advancePaid || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Table */}
                          <table className="w-full text-left border-collapse mb-6 relative z-10">
                            <thead>
                              <tr
                                className={`text-[9px] uppercase tracking-wider border-b-2 font-bold ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText} ${currentTheme.colors.bgHeader}`}
                              >
                                <th className="py-1.5 px-2 text-center w-10">
                                  S.No
                                </th>
                                <th className="py-1.5 px-2">
                                  Description of Goods
                                </th>
                                <th className="py-1.5 px-2 text-center w-20">
                                  HSN/SAC
                                </th>
                                <th className="py-1.5 px-2 text-center w-16">
                                  Qty
                                </th>
                                <th className="py-1.5 px-2 text-right w-24">
                                  Rate
                                </th>
                                <th className="py-1.5 px-2 text-right w-24">
                                  Taxable Val
                                </th>
                                <th className="py-1.5 px-2 text-center w-16">
                                  GST %
                                </th>
                                <th className="py-1.5 px-2 text-right w-24">
                                  Total Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {items.length > 0 ? (
                                items.map((item, i) => (
                                  <tr
                                    key={item.id}
                                    className={`border-b ${currentTheme.colors.borderLight}`}
                                  >
                                    <td
                                      className={`py-1.5 px-2 text-center border-x ${currentTheme.colors.borderLight}`}
                                    >
                                      {i + 1}
                                    </td>
                                    <td
                                      className={`py-1.5 px-2 font-bold border-x ${currentTheme.colors.borderLight}`}
                                    >
                                      {item.name || "-"}
                                    </td>
                                    <td className="py-1.5 px-2 text-center border-x border-slate-100 text-slate-500">
                                      {item.hsn || "-"}
                                    </td>
                                    <td className="py-1.5 px-2 text-center border-x border-slate-100">
                                      {item.qty}
                                    </td>
                                    <td className="py-1.5 px-2 text-right border-x border-slate-100">
                                      ₹
                                      {item.rate.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="py-1.5 px-2 text-right border-x border-slate-100">
                                      ₹
                                      {item.taxableValue.toLocaleString(
                                        undefined,
                                        { minimumFractionDigits: 2 },
                                      )}
                                    </td>
                                    <td className="py-1.5 px-2 text-center border-x border-slate-100">
                                      {item.taxPercent}%
                                    </td>
                                    <td className="py-1.5 px-2 text-right border-x border-slate-100 font-bold">
                                      ₹
                                      {item.total.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="p-4 text-center text-slate-400 border border-slate-200 italic"
                                  >
                                    Add items to populate the invoice.
                                  </td>
                                </tr>
                              )}
                              {/* Empty rows to fill space */}
                              {items.length > 0 &&
                                Array.from({
                                  length: Math.max(0, 5 - items.length),
                                }).map((_, i) => (
                                  <tr
                                    key={`empty-${i}`}
                                    className="border-b border-slate-100"
                                  >
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                    <td className="py-1 border-x border-slate-100 text-transparent">
                                      -
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          {/* Totals & Tax Split Summary */}
                          <div className="flex justify-between items-start mb-4 relative z-10 text-[9px]">
                            {/* Bank Details on Left */}
                            <div className="w-[45%] p-2.5 border border-slate-200 rounded-lg space-y-0.5 bg-transparent">
                              <p className="font-bold text-slate-850 text-sm flex items-center gap-1 mb-1 border-b border-slate-200 pb-0.5">
                                <Landmark
                                  size={11}
                                  className="text-slate-600"
                                />
                                Bank & UPI Details
                              </p>
                              <p>
                                <span className="text-slate-500">
                                  Bank Name:
                                </span>{" "}
                                <span className="font-semibold text-slate-900">
                                  {sellerDetails.bankName || "SBI"}
                                </span>
                              </p>
                              <p>
                                <span className="text-slate-500">
                                  A/C Number:
                                </span>{" "}
                                <span className="font-semibold text-slate-900">
                                  {sellerDetails.accountNumber}
                                </span>
                              </p>
                              <p>
                                <span className="text-slate-500">
                                  IFSC Code:
                                </span>{" "}
                                <span className="font-semibold text-slate-900">
                                  {sellerDetails.ifsc}
                                </span>
                              </p>
                              <p>
                                <span className="text-slate-500">UPI ID:</span>{" "}
                                <span className="font-semibold text-slate-900">
                                  {sellerDetails.upiId}
                                </span>
                              </p>
                            </div>

                            {/* Totals Table on Right */}
                            <div className="w-[48%]">
                              <table className="w-full text-sm border-collapse">
                                <tbody>
                                  <tr className="border-b border-slate-100">
                                    <td className="py-0.5 px-1 font-bold text-slate-500 text-right">
                                      Taxable Amount:
                                    </td>
                                    <td className="py-0.5 px-1 text-right font-semibold">
                                      ₹
                                      {subtotal.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                  {isIGST ? (
                                    <tr className="border-b border-slate-100">
                                      <td className="py-0.5 px-1 font-bold text-slate-500 text-right">
                                        IGST (Inter-state):
                                      </td>
                                      <td className="py-0.5 px-1 text-right font-semibold text-slate-900">
                                        ₹
                                        {igst.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                    </tr>
                                  ) : (
                                    <>
                                      <tr className="border-b border-slate-100">
                                        <td className="py-0.5 px-1 font-bold text-slate-500 text-right">
                                          CGST (Intra-state):
                                        </td>
                                        <td className="py-0.5 px-1 text-right font-semibold text-slate-900">
                                          ₹
                                          {cgst.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                        </td>
                                      </tr>
                                      <tr className="border-b border-slate-100">
                                        <td className="py-0.5 px-1 font-bold text-slate-500 text-right">
                                          SGST (Intra-state):
                                        </td>
                                        <td className="py-0.5 px-1 text-right font-semibold text-slate-900">
                                          ₹
                                          {sgst.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                          })}
                                        </td>
                                      </tr>
                                    </>
                                  )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                  <tr className="border-b border-slate-100">
                                    <td className="py-0.5 px-1 font-bold text-slate-500 text-right">
                                      Total GST Tax:
                                    </td>
                                    <td className="py-0.5 px-1 text-right font-semibold">
                                      ₹
                                      {totalTax.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                  <tr className="text-[11px] font-black border-t border-slate-300 text-slate-955 border-b-2 border-slate-955">
                                    <td className="py-1.5 px-1 text-right">
                                      Grand Total:
                                    </td>
                                    <td className="py-1.5 px-1 text-right font-black text-sm text-slate-955">
                                      ₹
                                      {grandTotal.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Footer / Signatory / Terms */}
                          <div className="mt-8 pt-4 flex justify-between items-end border-t border-slate-200 relative z-10 text-[8px] text-slate-500">
                            <div className="max-w-[55%] leading-relaxed space-y-0.5">
                              <p className="font-bold text-slate-800 text-[9px] mb-0.5">
                                  Terms & Conditions:
                                </p>
                                <div className="whitespace-pre-line text-slate-600 leading-normal">
                                  {sellerDetails.termsAndConditions || "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. charged on delay.\n3. Subject to jurisdiction."}
                                </div>
                                {sellerDetails.notes && (
                                  <div className="mt-2 text-[8px] font-bold text-slate-700">
                                    Notes: <span className="font-normal">{sellerDetails.notes}</span>
                                  </div>
                                )}
                            </div>
                            <div className="text-center relative flex flex-col items-center">
                              {sellerDetails.companyStampUrl && (
                                <img
                                  src={sellerDetails.companyStampUrl}
                                  alt="Stamp"
                                  className="absolute left-1/2 -translate-x-1/2 bottom-2 h-14 object-contain mix-blend-multiply pointer-events-none opacity-80"
                                  style={{ transform: "rotate(-8deg)" }}
                                />
                              )}
                              
                              {signatureUrl ? (
                                <div className="h-12 w-40 mb-1 flex items-end justify-center pb-0.5">
                                  <img
                                    src={signatureUrl}
                                    alt="Signature"
                                    className="max-h-12 object-contain mix-blend-multiply"
                                  />
                                </div>
                              ) : (
                                <div className="h-12 w-40 border-b-2 border-slate-300 border-dashed mb-1 flex items-end justify-center pb-0.5">
                                  <span className="text-slate-300 italic text-[8px] select-none">
                                    Digitally Signed by{" "}
                                    {sellerDetails.ownerName}
                                  </span>
                                </div>
                              )}
                              <p className="font-bold text-[9px] text-slate-800">
                                Authorized Signatory
                              </p>
                              <p className="text-[8px] text-slate-500">
                                For {sellerDetails.companyName}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        // TALLY PRIME CLASSIC GST INVOICE LAYOUT (Strict grid, rounded-none, border-black)
                        <div
                          className={`border ${currentTheme.colors.borderMain} text-[9px] leading-tight ${currentTheme.colors.primaryText} flex flex-col rounded-none relative overflow-hidden bg-white z-10`}
                        >
                          {/* Logo Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-[0.06]">
                            <img
                              src="https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Sharmaindustries.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1NoYXJtYWluZHVzdHJpZXMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MjM3MDU0NSwiZXhwIjoyNDEzMDkwNTQ1fQ.JuhGIoK2TxLgKSG1t63HJAqmQUXeAgpvj_TljDqDL30"
                              alt="watermark"
                              className="w-[80%] max-w-[400px] object-contain grayscale"
                            />
                          </div>

                          {/* Centered Top Title */}
                          <div
                            className={`text-center border-b ${currentTheme.colors.borderMain} py-0.5 font-bold text-sm tracking-wider uppercase relative z-10 ${currentTheme.colors.bgHeader}`}
                          >
                            Tax Invoice
                          </div>

                          {/* Top Section: Company & Invoice Info */}
                          <div
                            className={`grid grid-cols-12 border-b ${currentTheme.colors.borderMain}`}
                          >
                            {/* Company Details */}
                            <div className="col-span-7 p-1.5 flex gap-3">
                              <img
                                src="https://mwqjdhwlfuwhyslqtpwd.supabase.co/storage/v1/object/sign/Company%20Assets%20(logos,%20Watermarks)/Sharmaindustries.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YTU1YTAxNi0xYzI2LTRlZjctYjlkNy1iYWU1NTFkN2Q1ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb21wYW55IEFzc2V0cyAobG9nb3MsIFdhdGVybWFya3MpL1NoYXJtYWluZHVzdHJpZXMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MjM3MDU0NSwiZXhwIjoyNDEzMDkwNTQ1fQ.JuhGIoK2TxLgKSG1t63HJAqmQUXeAgpvj_TljDqDL30"
                                alt="Logo"
                                className="w-20 h-20 object-contain"
                              />
                              <div className="space-y-0.5">
                                <h1
                                  className={`text-sm font-bold uppercase tracking-wide leading-none ${currentTheme.colors.primaryText}`}
                                >
                                  {sellerDetails.companyName}
                                </h1>
                                {sellerDetails.ownerName && (
                                  <p
                                    className={`text-[9px] font-medium ${currentTheme.colors.secondaryText}`}
                                  >
                                    Proprietor: {sellerDetails.ownerName}
                                  </p>
                                )}
                                <p
                                  className={`text-[8px] max-w-[320px] leading-tight ${currentTheme.colors.secondaryText}`}
                                >
                                  {sellerDetails.address}
                                  {sellerDetails.pincode
                                    ? ", " + sellerDetails.pincode
                                    : ""}
                                </p>
                                <p
                                  className={`text-[8px] ${currentTheme.colors.secondaryText}`}
                                >
                                  Contact: {sellerDetails.phone}
                                </p>
                                <p
                                  className={`text-[9px] ${currentTheme.colors.primaryText}`}
                                >
                                  GSTIN/UIN:{" "}
                                  <span className="font-bold">
                                    {sellerDetails.gstin}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {/* Invoice Details */}
                            <div
                              className={`col-span-5 border-l ${currentTheme.colors.borderMain} text-[8px] divide-y ${currentTheme.colors.borderMain} flex flex-col relative z-10`}
                            >
                              <div
                                className={`grid grid-cols-2 divide-x ${currentTheme.colors.borderMain}`}
                              >
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Invoice No.
                                  </span>
                                  <span
                                    className={`font-bold ${currentTheme.colors.primaryText}`}
                                  >
                                    {isMounted ? invoiceNo : ""}
                                  </span>
                                </div>
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Dated
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    {isMounted ? invoiceDate : ""}
                                  </span>
                                </div>
                              </div>

                              {/* Dates */}
                              <div
                                className={`grid grid-cols-2 divide-x ${currentTheme.colors.borderMain}`}
                              >
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Due Date
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    {isMounted && dueDate ? dueDate : "N/A"}
                                  </span>
                                </div>
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Transport Date
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    {transportDate || "N/A"}
                                  </span>
                                </div>
                              </div>

                              {/* Dispatch Details */}
                              <div
                                className={`grid grid-cols-2 divide-x ${currentTheme.colors.borderMain}`}
                              >
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Dispatch Mode / Vehicle
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    {transportMode} - {vehicleNo || "N/A"}
                                  </span>
                                </div>
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Destination
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    {destination || "N/A"}
                                  </span>
                                </div>
                              </div>

                              {/* Terms of Payment Box */}
                              <div
                                className={`grid grid-cols-2 divide-x ${currentTheme.colors.borderMain}`}
                              >
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Terms of Payment
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    {paymentMode === "Credit"
                                      ? `${creditDays} Days Credit`
                                      : paymentMode}
                                  </span>
                                </div>
                                <div className="p-1">
                                  <span
                                    className={`block text-[6px] uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                  >
                                    Advance Recd.
                                  </span>
                                  <span
                                    className={`font-semibold ${currentTheme.colors.primaryText}`}
                                  >
                                    ₹{(advancePaid || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className="p-1 flex-1 bg-primary/10">
                                <span
                                  className={`block text-[6px] uppercase font-bold text-primary`}
                                >
                                  Balance Due
                                </span>
                                <span
                                  className={`font-black text-sm text-primary`}
                                >
                                  ₹
                                  {(grandTotal - advancePaid).toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 2 },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Buyer / Shipped To Info */}
                          <div
                            className={`grid grid-cols-12 border-b ${currentTheme.colors.borderMain}`}
                          >
                            <div className="col-span-6 p-1.5">
                              <span
                                className={`block text-[6px] uppercase font-bold mb-0.5 ${currentTheme.colors.secondaryText}`}
                              >
                                Buyer (Bill to)
                              </span>
                              <h2
                                className={`font-bold text-[9px] leading-tight ${currentTheme.colors.primaryText}`}
                              >
                                {customerName || "Client Name"}
                              </h2>
                              {customerAddress && (
                                <p className="text-[8px] text-slate-700 mt-0.5 leading-tight whitespace-pre-line">
                                  {customerAddress}
                                  {pincode ? ", " + pincode : ""}
                                </p>
                              )}
                              {customerPhone && (
                                <p className="text-[8px] text-slate-600 mt-0.5 font-medium">
                                  Phone: {customerPhone}
                                </p>
                              )}
                              {gstin && (
                                <p className="text-[8px] text-slate-800 mt-0.5">
                                  GSTIN/UIN:{" "}
                                  <span className="font-bold">{gstin}</span>
                                </p>
                              )}
                            </div>
                            <div
                              className={`col-span-6 border-l ${currentTheme.colors.borderMain} p-1.5`}
                            >
                              <span
                                className={`block text-[6px] uppercase font-bold mb-0.5 ${currentTheme.colors.secondaryText}`}
                              >
                                Consignee (Ship to)
                              </span>
                              <h2
                                className={`font-bold text-[9px] leading-tight ${currentTheme.colors.primaryText}`}
                              >
                                {customerName || "Client Name"}
                              </h2>
                              {customerAddress && (
                                <p className="text-[8px] text-slate-700 mt-0.5 leading-tight whitespace-pre-line">
                                  {customerAddress}
                                  {pincode ? ", " + pincode : ""}
                                </p>
                              )}
                              {customerPhone && (
                                <p className="text-[8px] text-slate-600 mt-0.5 font-medium">
                                  Phone: {customerPhone}
                                </p>
                              )}
                              {gstin && (
                                <p className="text-[8px] text-slate-800 mt-0.5">
                                  GSTIN/UIN:{" "}
                                  <span className="font-bold">{gstin}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Dense Itemized Table */}
                          <div className="relative z-10">
                            <table className="w-full text-left border-collapse text-[8px] leading-tight border-none rounded-none relative z-10">
                              <thead>
                                <tr
                                  className={`border-b divide-x text-center font-bold tracking-wider text-[7px] uppercase ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText} ${currentTheme.colors.bgHeader}`}
                                >
                                  <th className="py-1 px-1 w-6">S.No</th>
                                  <th className="py-1 px-2 text-left">
                                    Description of Goods
                                  </th>
                                  <th className="py-1 px-1 w-14">HSN/SAC</th>
                                  <th className="py-1 px-1 w-12 text-center">
                                    Quantity
                                  </th>
                                  <th className="py-1 px-1 w-16 text-right">
                                    Rate
                                  </th>
                                  <th className="py-1 px-1 w-20 text-right">
                                    Amount
                                  </th>
                                </tr>
                              </thead>
                              <tbody
                                className={`divide-y ${currentTheme.colors.borderLight}`}
                              >
                                {items.map((item, i) => (
                                  <tr
                                    key={item.id}
                                    className={`divide-x ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText}`}
                                  >
                                    <td className="py-0.5 px-1 text-center font-medium">
                                      {i + 1}
                                    </td>
                                    <td className="py-0.5 px-2 font-bold">
                                      {item.name || "-"}
                                    </td>
                                    <td className="py-0.5 px-1 text-center text-slate-500">
                                      {item.hsn || "-"}
                                    </td>
                                    <td className="py-0.5 px-1 text-center font-semibold">
                                      {item.qty}
                                    </td>
                                    <td className="py-0.5 px-1 text-right">
                                      ₹
                                      {item.rate.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="py-0.5 px-1 text-right">
                                      ₹
                                      {item.taxableValue.toLocaleString(
                                        undefined,
                                        { minimumFractionDigits: 2 },
                                      )}
                                    </td>
                                  </tr>
                                ))}

                                {/* Tally GST ledger rows inside table */}
                                {Object.entries(taxSlabs).map(
                                  ([pctStr, slab]) => {
                                    const pct = parseFloat(pctStr);
                                    if (pct === 0) return null;
                                    if (isIGST) {
                                      return (
                                        <tr
                                          key={`igst-${pct}`}
                                          className={`divide-x ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText}`}
                                        >
                                          <td className="py-0.5 px-1 text-center"></td>
                                          <td className="py-0.5 px-2 font-bold italic">
                                            IGST @ {pct}%
                                          </td>
                                          <td className="py-0.5 px-1 text-center"></td>
                                          <td className="py-0.5 px-1 text-center"></td>
                                          <td className="py-0.5 px-1 text-right"></td>
                                          <td className="py-0.5 px-1 text-right font-bold">
                                            ₹
                                            {slab.tax.toLocaleString(
                                              undefined,
                                              { minimumFractionDigits: 2 },
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    } else {
                                      return (
                                        <React.Fragment key={pct}>
                                          <tr
                                            className={`divide-x ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText}`}
                                          >
                                            <td className="py-0.5 px-1 text-center"></td>
                                            <td className="py-0.5 px-2 font-bold italic">
                                              CGST @ {pct / 2}%
                                            </td>
                                            <td className="py-0.5 px-1 text-center"></td>
                                            <td className="py-0.5 px-1 text-center"></td>
                                            <td className="py-0.5 px-1 text-right"></td>
                                            <td className="py-0.5 px-1 text-right font-bold">
                                              ₹
                                              {(slab.tax / 2).toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 },
                                              )}
                                            </td>
                                          </tr>
                                          <tr
                                            className={`divide-x ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText}`}
                                          >
                                            <td className="py-0.5 px-1 text-center"></td>
                                            <td className="py-0.5 px-2 font-bold italic">
                                              SGST @ {pct / 2}%
                                            </td>
                                            <td className="py-0.5 px-1 text-center"></td>
                                            <td className="py-0.5 px-1 text-center"></td>
                                            <td className="py-0.5 px-1 text-right"></td>
                                            <td className="py-0.5 px-1 text-right font-bold">
                                              ₹
                                              {(slab.tax / 2).toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 },
                                              )}
                                            </td>
                                          </tr>
                                        </React.Fragment>
                                      );
                                    }
                                  },
                                )}

                                {/* Blank filler rows to guarantee decent heights */}
                                {Array.from({
                                  length: Math.max(
                                    1,
                                    10 -
                                      (items.length +
                                        Object.keys(taxSlabs).filter(
                                          (p) => parseFloat(p) > 0,
                                        ).length *
                                          (isIGST ? 1 : 2)),
                                  ),
                                }).map((_, idx) => (
                                  <tr
                                    key={`filler-${idx}`}
                                    className={`divide-x ${currentTheme.colors.borderMain} text-transparent`}
                                  >
                                    <td className="py-0.5 px-1">-</td>
                                    <td className="py-0.5 px-2">-</td>
                                    <td className="py-0.5 px-1">-</td>
                                    <td className="py-0.5 px-1">-</td>
                                    <td className="py-0.5 px-1">-</td>
                                    <td className="py-0.5 px-1">-</td>
                                  </tr>
                                ))}

                                {/* Total row in table */}
                                <tr
                                  className={`divide-x ${currentTheme.colors.borderMain} border-t ${currentTheme.colors.borderMain} font-bold uppercase tracking-wider text-[7.5px] ${currentTheme.colors.primaryText}`}
                                >
                                  <td
                                    className="py-0.5 px-2 text-left"
                                    colSpan={3}
                                  >
                                    Total
                                  </td>
                                  <td className="py-0.5 px-1 text-center">
                                    {items.reduce(
                                      (sum, item) => sum + item.qty,
                                      0,
                                    )}
                                  </td>
                                  <td className="py-0.5 px-1"></td>
                                  <td className="py-0.5 px-1 text-right font-black">
                                    ₹
                                    {grandTotal.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* GST Tax Analysis Table */}
                          <div
                            className={`border-t ${currentTheme.colors.borderMain}`}
                          >
                            <div
                              className={`border-b ${currentTheme.colors.borderMain} text-center font-bold text-[7px] uppercase tracking-wider py-0.5 ${currentTheme.colors.primaryText} ${currentTheme.colors.bgHeader}`}
                            >
                              GST Tax Analysis
                            </div>
                            <table className="w-full text-left border-collapse text-[7px] leading-tight">
                              <thead>
                                <tr
                                  className={`border-b ${currentTheme.colors.borderMain} divide-x ${currentTheme.colors.borderMain} text-center font-bold ${currentTheme.colors.primaryText} ${currentTheme.colors.bgHeader}`}
                                >
                                  <th className="py-0.5 px-1" rowSpan={2}>
                                    HSN/SAC
                                  </th>
                                  <th
                                    className="py-0.5 px-1 text-right w-20"
                                    rowSpan={2}
                                  >
                                    Taxable Value
                                  </th>
                                  {isIGST ? (
                                    <th
                                      className="py-0.5 px-1 text-center"
                                      colSpan={2}
                                    >
                                      Integrated Tax
                                    </th>
                                  ) : (
                                    <>
                                      <th
                                        className="py-0.5 px-1 text-center"
                                        colSpan={2}
                                      >
                                        Central Tax
                                      </th>
                                      <th
                                        className="py-0.5 px-1 text-center"
                                        colSpan={2}
                                      >
                                        State Tax
                                      </th>
                                    </>
                                  )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                  <th
                                    className="py-0.5 px-1 text-right w-20"
                                    rowSpan={2}
                                  >
                                    Total Tax Amount
                                  </th>
                                </tr>
                                <tr
                                  className={`border-b ${currentTheme.colors.borderMain} divide-x ${currentTheme.colors.borderMain} text-center font-bold ${currentTheme.colors.primaryText} ${currentTheme.colors.bgHeader}`}
                                >
                                  {isIGST ? (
                                    <>
                                      <th className="py-0.5 px-1 w-12">Rate</th>
                                      <th className="py-0.5 px-1 w-16 text-right">
                                        Amount
                                      </th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="py-0.5 px-1 w-10">Rate</th>
                                      <th className="py-0.5 px-1 w-14 text-right">
                                        Amount
                                      </th>
                                      <th className="py-0.5 px-1 w-10">Rate</th>
                                      <th className="py-0.5 px-1 w-14 text-right">
                                        Amount
                                      </th>
                                    </>
                                  )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                </tr>
                              </thead>
                              <tbody
                                className={`divide-y ${currentTheme.colors.borderLight}`}
                              >
                                {Object.entries(hsnSlabs).map(([hsn, slab]) => {
                                  const pct = slab.taxPercent;
                                  return (
                                    <tr
                                      key={hsn}
                                      className={`divide-x ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText}`}
                                    >
                                      <td className="py-0.5 px-1 text-center font-medium">
                                        {hsn}
                                      </td>
                                      <td className="py-0.5 px-1 text-right">
                                        ₹
                                        {slab.taxable.toLocaleString(
                                          undefined,
                                          { minimumFractionDigits: 2 },
                                        )}
                                      </td>
                                      {isIGST ? (
                                        <>
                                          <td className="py-0.5 px-1 text-center">
                                            {pct}%
                                          </td>
                                          <td className="py-0.5 px-1 text-right">
                                            ₹
                                            {slab.tax.toLocaleString(
                                              undefined,
                                              { minimumFractionDigits: 2 },
                                            )}
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td className="py-0.5 px-1 text-center">
                                            {pct / 2}%
                                          </td>
                                          <td className="py-0.5 px-1 text-right">
                                            ₹
                                            {(slab.tax / 2).toLocaleString(
                                              undefined,
                                              { minimumFractionDigits: 2 },
                                            )}
                                          </td>
                                          <td className="py-0.5 px-1 text-center">
                                            {pct / 2}%
                                          </td>
                                          <td className="py-0.5 px-1 text-right">
                                            ₹
                                            {(slab.tax / 2).toLocaleString(
                                              undefined,
                                              { minimumFractionDigits: 2 },
                                            )}
                                          </td>
                                        </>
                                      )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                      <td className="py-0.5 px-1 text-right font-bold">
                                        ₹
                                        {slab.tax.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr
                                  className={`divide-x ${currentTheme.colors.borderMain} font-bold border-t ${currentTheme.colors.borderMain} ${currentTheme.colors.primaryText}`}
                                >
                                  <td className="py-0.5 px-1 text-center">
                                    Total
                                  </td>
                                  <td className="py-0.5 px-1 text-right">
                                    ₹
                                    {subtotal.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  {isIGST ? (
                                    <>
                                      <td></td>
                                      <td className="py-0.5 px-1 text-right">
                                        ₹
                                        {igst.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td></td>
                                      <td className="py-0.5 px-1 text-right">
                                        ₹
                                        {cgst.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                      <td></td>
                                      <td className="py-0.5 px-1 text-right">
                                        ₹
                                        {sgst.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                        })}
                                      </td>
                                    </>
                                  )}
{discountAmount > 0 && (
  <div className="flex justify-between py-1.5 text-[11px] border-b border-slate-300">
    <span className="font-semibold text-rose-600">Markdown/Discount</span>
    <span className="text-rose-600">-₹{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
)}
{additionalCharges.map((charge, idx) => (
  <div key={'add_'+idx} className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">{charge.name}</span>
    <span>+₹{charge.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
  </div>
))}
{enableRoundOff && roundOffDiff !== 0 && (
  <div className="flex justify-between py-1 text-[11px] font-medium">
    <span className="opacity-80">Round Off</span>
    <span>{roundOffDiff > 0 ? '+' : ''}₹{roundOffDiff.toFixed(2)}</span>
  </div>
)}

                                  <td className="py-0.5 px-1 text-right">
                                    ₹
                                    {totalTax.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Amount in Words & Bank Details */}
                          <div
                            className={`grid grid-cols-12 border-t ${currentTheme.colors.borderMain} text-[8.5px] ${currentTheme.colors.primaryText}`}
                          >
                            <div
                              className={`col-span-7 p-1.5 divide-y ${currentTheme.colors.borderLight} space-y-1`}
                            >
                              <div>
                                <span
                                  className={`font-bold uppercase text-[6px] block ${currentTheme.colors.secondaryText}`}
                                >
                                  Amount Chargeable (in words)
                                </span>
                                <span
                                  className={`font-bold ${currentTheme.colors.primaryText}`}
                                >
                                  {numberToWords(grandTotal)} Rupees Only
                                </span>
                              </div>
                              <div
                                className={`pt-1 mt-1 border-t ${currentTheme.colors.borderLight}`}
                              >
                                <p
                                  className={`font-bold text-[7px] flex items-center gap-1 mb-0.5 ${currentTheme.colors.primaryText}`}
                                >
                                  <Landmark
                                    size={9}
                                    className={
                                      currentTheme.colors.secondaryText
                                    }
                                  />
                                  Bank & UPI Details
                                </p>
                                <div
                                  className={`grid grid-cols-2 text-[7px] leading-tight ${currentTheme.colors.secondaryText}`}
                                >
                                  <p>
                                    <span>Bank Name:</span>{" "}
                                    <span
                                      className={`font-semibold ${currentTheme.colors.primaryText}`}
                                    >
                                      {sellerDetails.bankName || "SBI"}
                                    </span>
                                  </p>
                                  <p>
                                    <span>A/C Number:</span>{" "}
                                    <span
                                      className={`font-semibold ${currentTheme.colors.primaryText}`}
                                    >
                                      {sellerDetails.accountNumber}
                                    </span>
                                  </p>
                                  <p>
                                    <span>IFSC Code:</span>{" "}
                                    <span
                                      className={`font-semibold ${currentTheme.colors.primaryText}`}
                                    >
                                      {sellerDetails.ifsc}
                                    </span>
                                  </p>
                                  <p>
                                    <span>UPI ID:</span>{" "}
                                    <span
                                      className={`font-semibold ${currentTheme.colors.primaryText}`}
                                    >
                                      {sellerDetails.upiId}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Signatory Box */}
                            <div
                              className={`col-span-5 border-l ${currentTheme.colors.borderMain} p-1.5 flex flex-col justify-between text-right min-h-[70px]`}
                            >
                              <div>
                                <span
                                  className={`text-[6.5px] block uppercase font-bold ${currentTheme.colors.secondaryText}`}
                                >
                                  For {sellerDetails.companyName.toUpperCase()}
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                {signatureUrl ? (
                                  <div className="h-8 mb-1 flex items-end justify-center pb-0.5">
                                    <img
                                      src={signatureUrl}
                                      alt="Signature"
                                      className="max-h-8 object-contain mix-blend-multiply"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className={`h-8 border-b ${currentTheme.colors.borderMain} border-dashed mb-1 flex items-end justify-center pb-0.5 text-[5.5px] italic select-none ${currentTheme.colors.secondaryText}`}
                                  >
                                    Digitally Signed by{" "}
                                    {sellerDetails.ownerName}
                                  </div>
                                )}
                                <span
                                  className={`font-bold block text-[7px] uppercase tracking-wider ${currentTheme.colors.primaryText}`}
                                >
                                  Authorized Signatory
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Declaration Box */}
                          <div
                            className={`border-t ${currentTheme.colors.borderMain} p-1.5 text-[6.5px] leading-tight grid grid-cols-12 ${currentTheme.colors.secondaryText}`}
                          >
                            <div className="col-span-8">
                              <p className={`font-bold uppercase tracking-wider text-[6.5px] mb-0.5 ${currentTheme.colors.primaryText}`}>
                                  Declaration & Notes:
                                </p>
                                {sellerDetails.notes && (
                                  <p className="mb-1 text-slate-700 font-semibold">{sellerDetails.notes}</p>
                                )}
                                <p className="opacity-80">
                                  We declare that this document shows the actual price of the goods described.
                                </p>
                                <div className="whitespace-pre-line mt-1 opacity-80">
                                  {sellerDetails.termsAndConditions || "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. charged on delay."}
                                </div>
                            </div>
                            <div className="col-span-4 text-right flex flex-col justify-end">
                              <p
                                className={`font-bold uppercase tracking-wider text-[6.5px] mb-0.5 ${currentTheme.colors.primaryText}`}
                              >
                                SUBJECT TO BUNDI JURISDICTION
                              </p>
                              <p className="text-[5.5px]">
                                This is a Computer Generated Invoice
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* PDF CONTENT */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* TAILWIND SAFELIST FOR THEMES */}
        <div className="hidden text-black text-slate-500 border-black border-black/20 text-blue-950 text-blue-700 text-blue-800 border-blue-950 border-blue-900/20 bg-blue-50/50 text-emerald-950 text-emerald-700 text-emerald-800 border-emerald-950 border-emerald-900/20 bg-emerald-50/50 text-rose-950 text-rose-700 text-rose-800 border-rose-950 border-rose-900/20 bg-rose-50/50 text-slate-900 text-slate-800 border-slate-900 border-slate-200 bg-slate-50 bg-transparent text-blue-900 text-blue-600 border-blue-900 border-blue-200 bg-blue-50 text-green-900 text-green-600 text-green-700 border-green-900 border-green-200 bg-green-50 bg-green-50/50 text-amber-900 text-amber-600 text-amber-700 border-amber-900 border-amber-200 bg-amber-50 bg-amber-50/50 text-purple-900 text-purple-600 text-purple-700 border-purple-900 border-purple-200 bg-purple-50 bg-purple-50/50 text-pink-900 text-pink-600 text-pink-700 border-pink-900 border-pink-200 bg-pink-50 bg-pink-50/50"></div>
      </div>
    </div>
  );
}
