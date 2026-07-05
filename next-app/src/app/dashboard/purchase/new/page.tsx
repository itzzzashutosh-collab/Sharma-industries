"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Truck, Calculator, CreditCard, UploadCloud, X, Upload } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getRawMaterials, submitPurchaseBill, analyzeInvoiceTextWithAI, getSuppliers, getSupplierByName } from "@/actions/purchaseActions";
import { useRouter } from "next/navigation";

// Dynamic CDN loaders for PDF.js and Tesseract.js (running fully client-side)
const loadPdfJs = (): Promise<any> => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).pdfjsLib) return Promise.resolve((window as any).pdfjsLib);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve((window as any).pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const loadTesseract = (): Promise<any> => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).Tesseract) return Promise.resolve((window as any).Tesseract);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = () => resolve((window as any).Tesseract);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const extractTextFromPdf = async (file: File): Promise<string> => {
  const pdfjsLib = await loadPdfJs();
  if (!pdfjsLib) return "";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

const extractTextFromImage = async (file: File): Promise<string> => {
  const Tesseract = await loadTesseract();
  if (!Tesseract) return "";
  const worker = await Tesseract.createWorker("eng");
  const ret = await worker.recognize(file);
  await worker.terminate();
  return ret.data.text;
};

// Deterministic rules engine to parse extracted text
const parseInvoiceText = (text: string, rawMaterialsList: any[]) => {
  // 1. Supplier GSTIN
  const gstinRegex = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}\b/gi;
  const gstinMatches = text.match(gstinRegex);
  let supplier_gstin = "";
  if (gstinMatches && gstinMatches.length > 0) {
    supplier_gstin = gstinMatches[0].toUpperCase();
  }

  // 2. Invoice No
  const invPatterns = [
    /(?:invoice\s*no|invoice\s*number|bill\s*no|bill\s*number|inv\s*no|invoice\s*#)[:\s\-]+([A-Z0-9\-\/\\_]+)/i,
    /invoice\s*[:\s\-]+([A-Z0-9\-\/\\_]+)/i,
    /inv\s*[:\s\-]+([A-Z0-9\-\/\\_]+)/i,
  ];
  let invoice_no = "";
  for (const pattern of invPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      invoice_no = match[1].trim();
      break;
    }
  }

  // 3. Bill Date
  const datePatterns = [
    /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/, // YYYY-MM-DD
    /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/  // DD-MM-YYYY
  ];
  
  // Custom month parser for formats like 04-Jul-2026
  const dateMMMRegex = /\b(\d{1,2})[-/\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-/\s](\d{2,4})\b/i;
  
  let bill_date = new Date().toISOString().split("T")[0];
  const mmmMatch = text.match(dateMMMRegex);
  
  if (mmmMatch) {
    try {
      const day = Number(mmmMatch[1]);
      const monthStr = mmmMatch[2].toLowerCase();
      let year = Number(mmmMatch[3]);
      if (year < 100) year += 2000;
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = months[monthStr];
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        bill_date = parsedDate.toISOString().split("T")[0];
      }
    } catch (e) {
      // ignore
    }
  } else {
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          let parsedDate: Date;
          if (pattern === datePatterns[0]) {
            parsedDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
          } else {
            let year = Number(match[3]);
            if (year < 100) year += 2000;
            parsedDate = new Date(year, Number(match[2]) - 1, Number(match[1]));
          }
          if (!isNaN(parsedDate.getTime())) {
            bill_date = parsedDate.toISOString().split("T")[0];
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }

  // 4. Supplier Name (Advanced extraction heuristic)
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let supplier_name = "";
  const skipKeywords = [
    /tax\s*invoice/i, /invoice/i, /challan/i, /bill/i, /original/i, /duplicate/i, 
    /triplicate/i, /gstin/i, /date/i, /phone/i, /email/i, /mobile/i, /tel/i,
    /page/i, /delivery/i, /purchase/i, /order/i, /welcome/i, /receipt/i, /buyer/i,
    /consignee/i, /customer/i, /client/i
  ];
  
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (skipKeywords.some(kw => kw.test(line))) continue;
    if (line.length < 3 || line.length > 60) continue;
    // Skip if it looks like an address start
    if (/^(?:plot|sector|road|street|phase|h\.?no|shop|booth|gala|village|dist|state|near)\b/i.test(line)) continue;
    if (line.includes("@") || line.includes("www.") || line.includes(".com")) continue;
    
    const digitCount = (line.match(/\d/g) || []).length;
    if (digitCount > line.length * 0.3) continue; // Skip lines containing too many numbers (like phone numbers/GST)

    supplier_name = line;
    break;
  }
  
  if (!supplier_name && lines.length > 0) {
    supplier_name = lines[0].substring(0, 50);
  }

  // 5. Taxes (CGST, SGST, IGST)
  const cgstPattern = /cgst\s*(?:amount|amt)?\s*(?:[@\d%]*\s*)?[:\s\-₹rs\.]+(\d+(?:\.\d+)?)/i;
  const sgstPattern = /sgst\s*(?:amount|amt)?\s*(?:[@\d%]*\s*)?[:\s\-₹rs\.]+(\d+(?:\.\d+)?)/i;
  const igstPattern = /igst\s*(?:amount|amt)?\s*(?:[@\d%]*\s*)?[:\s\-₹rs\.]+(\d+(?:\.\d+)?)/i;

  const cgstMatch = text.match(cgstPattern);
  const sgstMatch = text.match(sgstPattern);
  const igstMatch = text.match(igstPattern);

  const cgst_amount = cgstMatch ? Number(cgstMatch[1]) : 0;
  const sgst_amount = sgstMatch ? Number(sgstMatch[1]) : 0;
  const igst_amount = igstMatch ? Number(igstMatch[1]) : 0;

  // 6. Items Matching
  const matchedItems: any[] = [];
  for (const rm of rawMaterialsList) {
    const name = rm.material_name;
    const matchingLine = lines.find(line => line.toLowerCase().includes(name.toLowerCase()));
    if (matchingLine) {
      const words = matchingLine.split(/[\s,]+/);
      const nums: number[] = [];
      for (const w of words) {
        const cleaned = w.replace(/[,₹]/g, "");
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
          if (num > 100000) continue; // Skip likely HSN codes
          nums.push(num);
        }
      }

      // Mathematical Invoice Heuristic: search for (qty, rate) pair
      let quantity = 0;
      let rate = 0;
      let foundPair = false;

      for (let j = 0; j < nums.length; j++) {
        for (let k = 0; k < nums.length; k++) {
          if (j === k) continue;
          const a = nums[j];
          const b = nums[k];
          const product = a * b;
          const matchingTotal = nums.find((c, idx) => idx !== j && idx !== k && Math.abs(c - product) < 2);
          if (matchingTotal) {
            if (j < k) {
              quantity = a;
              rate = b;
            } else {
              quantity = b;
              rate = a;
            }
            foundPair = true;
            break;
          }
        }
        if (foundPair) break;
      }

      if (!foundPair && nums.length > 0) {
        if (nums.length >= 2) {
          quantity = nums[0];
          rate = nums[1];
        } else {
          quantity = nums[0];
          rate = Number(rm.rate || 0);
        }
      }

      if (quantity === 0) quantity = 1;
      if (rate === 0) rate = Number(rm.rate || 0);

      matchedItems.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        material_name: name,
        raw_material_id: rm.id,
        quantity,
        rate
      });
    }
  }

  return {
    supplier_name,
    supplier_gstin,
    invoice_no,
    bill_date,
    cgst_amount,
    sgst_amount,
    igst_amount,
    items: matchedItems.length > 0 ? matchedItems : [{ id: Date.now().toString(), material_name: "", raw_material_id: "", quantity: 0, rate: 0 }]
  };
};

export default function AddPurchaseBillPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Fetched State
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-Fill State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    setIsExtracting(true);
    setExtractionStatus(t("Reading file..."));

    try {
      let text = "";
      if (file.type === "application/pdf") {
        setExtractionStatus(t("Extracting text from PDF..."));
        text = await extractTextFromPdf(file);
      } else if (file.type.startsWith("image/")) {
        setExtractionStatus(t("Running OCR on image..."));
        text = await extractTextFromImage(file);
      } else {
        setNotification({ type: "error", message: t("Unsupported file type. Please upload a PDF or Image.") });
        setIsExtracting(false);
        return;
      }

      if (!text || text.trim().length === 0) {
        throw new Error(t("No readable text found in the document."));
      }

      setExtractionStatus(t("AI Agent extracting invoice details..."));
      const aiRes = await analyzeInvoiceTextWithAI(text);
      if (!aiRes.success) {
        throw new Error(aiRes.error);
      }

      const parsedData = aiRes.data;

      // Match raw material IDs or Product IDs on the client side based on name matches
      const itemsWithIds = (parsedData.items || []).map((item: any) => {
        const matchRm = rawMaterials.find(rm => 
          rm.material_name && item.material_name && (
            rm.material_name.toLowerCase().includes(item.material_name.toLowerCase()) || 
            item.material_name.toLowerCase().includes(rm.material_name.toLowerCase())
          )
        );
        const matchProd = products.find(p => 
          p.product_name && item.material_name && (
            p.product_name.toLowerCase().includes(item.material_name.toLowerCase()) || 
            item.material_name.toLowerCase().includes(p.product_name.toLowerCase())
          )
        );

        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          material_name: item.material_name,
          raw_material_id: matchRm ? matchRm.id : "",
          product_id: matchProd ? matchProd.id : "",
          hsn_code: item.hsn_code || (matchRm ? matchRm.hsn_code : "") || (matchProd ? matchProd.hsn_code : "") || "",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || (matchRm ? matchRm.unit_of_measure : "") || (matchProd ? matchProd.package_size_unit : "") || "KG",
          rate: Number(item.rate) || 0,
          gst_tax: Number(item.gst_tax) || 18
        };
      });

      const finalItems = itemsWithIds.length > 0 ? itemsWithIds : [{
        id: Date.now().toString(),
        material_name: "",
        hsn_code: "",
        quantity: 0,
        unit: "KG",
        rate: 0,
        gst_tax: 18,
        raw_material_id: "",
        product_id: ""
      }];

      const isAdvancePaid = parsedData.bill_date && parsedData.due_date && 
        (parsedData.bill_date === parsedData.due_date);

      setHeaderInfo(prev => ({
        ...prev,
        supplier_name: parsedData.supplier_name || prev.supplier_name,
        supplier_gstin: parsedData.supplier_gstin || prev.supplier_gstin,
        supplier_address: parsedData.supplier_address || prev.supplier_address,
        invoice_no: parsedData.invoice_no || prev.invoice_no,
        bill_date: parsedData.bill_date || prev.bill_date,
        payment_type: isAdvancePaid ? "ADVANCE" : prev.payment_type,
        payment_status: isAdvancePaid ? "PAID" : prev.payment_status,
        bank_name: parsedData.bank_name || prev.bank_name,
        bank_account_no: parsedData.bank_account_no || prev.bank_account_no,
        bank_ifsc: parsedData.bank_ifsc || prev.bank_ifsc,
        bank_branch: parsedData.bank_branch || prev.bank_branch
      }));

      setItems(finalItems);

      setNotification({ type: "success", message: t("Bill details populated successfully! Please review the form before saving.") });
    } catch (err: any) {
      console.error(err);
      setNotification({ type: "error", message: t("Failed to parse invoice: ") + err.message });
    } finally {
      setIsExtracting(false);
      setExtractionStatus("");
    }
  };

  // Form State
  const [headerInfo, setHeaderInfo] = useState({
    supplier_name: "",
    supplier_gstin: "",
    supplier_address: "",
    invoice_no: "",
    bill_date: new Date().toISOString().split("T")[0],
    vehicle_no: "",
    lr_no: "",
    payment_status: "UNPAID",
    payment_type: "CREDIT",
    tax_type: "LOCAL", // LOCAL or INTERSTATE
    bank_name: "",
    bank_account_no: "",
    bank_ifsc: "",
    bank_branch: ""
  });

  const [savedSuppliers, setSavedSuppliers] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getSuppliers().then(res => {
      if (res.success && res.data) setSavedSuppliers(res.data);
    });
  }, []);

  const handleSelectSupplier = (supplier: any) => {
    setHeaderInfo(prev => ({
      ...prev,
      supplier_name: supplier.name,
      supplier_gstin: supplier.gstin || prev.supplier_gstin,
      supplier_address: supplier.address || prev.supplier_address,
      bank_name: supplier.bank_name || prev.bank_name,
      bank_account_no: supplier.bank_account_no || prev.bank_account_no,
      bank_ifsc: supplier.bank_ifsc || prev.bank_ifsc,
      bank_branch: supplier.bank_branch || prev.bank_branch
    }));
    setShowSuggestions(false);
  };

  const handleSupplierBlur = async () => {
    if (!headerInfo.supplier_name) return;
    setTimeout(async () => {
      const res = await getSupplierByName(headerInfo.supplier_name);
      if (res.success && res.data) {
        const supplier = res.data;
        setHeaderInfo(prev => ({
          ...prev,
          supplier_gstin: supplier.gstin || prev.supplier_gstin,
          supplier_address: supplier.address || prev.supplier_address,
          bank_name: supplier.bank_name || prev.bank_name,
          bank_account_no: supplier.bank_account_no || prev.bank_account_no,
          bank_ifsc: supplier.bank_ifsc || prev.bank_ifsc,
          bank_branch: supplier.bank_branch || prev.bank_branch
        }));
      }
    }, 200);
  };

  const suggestions = useMemo(() => {
    if (!headerInfo.supplier_name) return [];
    return savedSuppliers.filter(s => 
      s.name.toLowerCase().includes(headerInfo.supplier_name.toLowerCase()) &&
      s.name.toLowerCase() !== headerInfo.supplier_name.toLowerCase()
    );
  }, [headerInfo.supplier_name, savedSuppliers]);

  const [items, setItems] = useState([
    {
      id: Date.now().toString(),
      material_name: "",
      hsn_code: "",
      quantity: 0,
      unit: "KG",
      rate: 0,
      gst_tax: 18,
      raw_material_id: "",
      product_id: ""
    },
  ]);

  useEffect(() => {
    async function loadData() {
      const rmRes = await getRawMaterials();
      if (rmRes.success) setRawMaterials(rmRes.data || []);
      
      const prodRes = await fetch("/api/products").then(res => res.json());
      if (prodRes.success) setProducts(prodRes.data || []);
    }
    loadData();
  }, []);

  const computedTotals = useMemo(() => {
    let sub = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    items.forEach(item => {
      const amt = Number(item.quantity || 0) * Number(item.rate || 0);
      sub += amt;
      const gstRate = Number(item.gst_tax || 18);
      const gstAmt = amt * (gstRate / 100);

      if (headerInfo.tax_type === "LOCAL") {
        cgst += gstAmt / 2;
        sgst += gstAmt / 2;
      } else {
        igst += gstAmt;
      }
    });

    const total = sub + cgst + sgst + igst;
    return {
      subTotal: sub,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      grandTotal: Math.round(total)
    };
  }, [items, headerInfo.tax_type]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setHeaderInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      // Auto-resolution if they change the material_name / product_name
      if (field === "material_name") {
        const matchRm = rawMaterials.find(rm => rm.material_name && value && rm.material_name.toLowerCase() === String(value).trim().toLowerCase());
        const matchProd = products.find(p => p.product_name && value && p.product_name.toLowerCase() === String(value).trim().toLowerCase());
        
        if (matchRm) {
          updated.raw_material_id = matchRm.id;
          updated.product_id = "";
          updated.hsn_code = matchRm.hsn_code || updated.hsn_code;
          updated.unit = matchRm.unit_of_measure || updated.unit;
        } else if (matchProd) {
          updated.product_id = matchProd.id;
          updated.raw_material_id = "";
          updated.hsn_code = matchProd.hsn_code || updated.hsn_code;
          updated.unit = matchProd.package_size_unit || updated.unit;
        } else {
          updated.raw_material_id = "";
          updated.product_id = "";
        }
      }
      return updated;
    }));
  };

  const addItemRow = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      material_name: "",
      hsn_code: "",
      quantity: 0,
      unit: "KG",
      rate: 0,
      gst_tax: 18,
      raw_material_id: "",
      product_id: ""
    }]);
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
    if (selectedFile) {
      formData.append("bill_file", selectedFile);
    }
    formData.append("supplier_name", headerInfo.supplier_name);
    formData.append("supplier_gstin", headerInfo.supplier_gstin);
    formData.append("supplier_address", headerInfo.supplier_address);
    formData.append("bank_name", headerInfo.bank_name);
    formData.append("bank_account_no", headerInfo.bank_account_no);
    formData.append("bank_ifsc", headerInfo.bank_ifsc);
    formData.append("bank_branch", headerInfo.bank_branch);
    formData.append("invoice_no", headerInfo.invoice_no);
    formData.append("bill_date", headerInfo.bill_date);
    formData.append("payment_status", headerInfo.payment_status);
    formData.append("payment_type", headerInfo.payment_type);
    formData.append("tax_type", headerInfo.tax_type);
    formData.append("transport_details", JSON.stringify({ vehicle_no: headerInfo.vehicle_no, lr_no: headerInfo.lr_no }));
    
    formData.append("items", JSON.stringify(items));
    
    formData.append("sub_total", String(computedTotals.subTotal));
    formData.append("igst_amount", String(computedTotals.igst_amount));
    formData.append("cgst_amount", String(computedTotals.cgst_amount));
    formData.append("sgst_amount", String(computedTotals.sgst_amount));
    formData.append("total_amount", String(computedTotals.grandTotal));

    const res = await submitPurchaseBill(formData);
    setIsSubmitting(false);

    if (res.success) {
      setNotification({ type: "success", message: "Purchase Bill Saved Successfully! Redirecting..." });
      setTimeout(() => {
        router.push("/dashboard/purchase");
      }, 2000);
    } else {
      setNotification({ type: "error", message: res.message || ("Error saving bill: " + res.error) });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 relative">
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-muted/50 rounded-lg transition-colors ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <FileText className="text-primary" size={32} /> {t("New Purchase Bill")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("Record incoming raw materials and update inventory.")}</p>
      </div>

      {/* Dynamic PDF/Image Smart Auto-Filler */}
      <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-indigo-500/10 border border-primary/20 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
            <span className="text-primary animate-pulse">✨</span> {t("Smart Auto-Fill Agent")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("Upload purchase bill (PDF or image like JPG, PNG) to extract supplier, tax, items and populate form.")}
          </p>
        </div>
        
        <div className="relative shrink-0 w-full md:w-auto">
          {isExtracting ? (
            <div className="flex items-center justify-center gap-3 px-8 py-4 bg-background/50 border border-primary/30 rounded-2xl text-sm font-semibold text-primary">
              <svg className="w-5 h-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{extractionStatus}</span>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-3 px-8 py-4 bg-white/70 dark:bg-black/50 hover:bg-primary/5 hover:border-primary/50 border-2 border-dashed border-border rounded-2xl text-sm font-bold text-foreground hover:text-primary transition-all duration-300 cursor-pointer shadow-sm">
              <UploadCloud size={20} className="text-primary" />
              <span>{t("Upload PDF / Image Bill")}</span>
              <input 
                type="file" 
                accept="application/pdf,image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Header Information */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-primary/20 p-1.5 rounded-lg text-primary"><FileText size={18} /></span> 
            {t("Supplier & Invoice Details")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-muted-foreground">{t("Supplier Name")}</label>
              <input 
                type="text" 
                name="supplier_name"
                value={headerInfo.supplier_name}
                onChange={handleHeaderChange}
                onBlur={handleSupplierBlur}
                onFocus={() => setShowSuggestions(true)}
                required
                autoComplete="off"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[84px] left-0 right-0 bg-card border border-border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {suggestions.map((s, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onMouseDown={() => handleSelectSupplier(s)}
                      className="w-full text-left px-4 py-2 hover:bg-muted text-sm font-semibold text-foreground transition-colors border-b border-border/30 last:border-b-0"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
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
          
          <div className="space-y-2 mt-4">
            <label className="text-sm font-semibold text-muted-foreground">{t("Supplier Address")}</label>
            <input 
              type="text" 
              name="supplier_address"
              value={headerInfo.supplier_address}
              onChange={handleHeaderChange}
              placeholder="Enter supplier physical address"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>

          {/* Payment & Transport Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><CreditCard size={18} /></span> 
                {t("Payment Details")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Tax Type")}</label>
                  <select 
                    name="tax_type"
                    value={headerInfo.tax_type}
                    onChange={handleHeaderChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-foreground"
                  >
                    <option value="LOCAL">Local (CGST + SGST)</option>
                    <option value="INTERSTATE">Interstate (IGST)</option>
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

        {/* Supplier Banking Details */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Calculator size={18} /></span> 
            {t("Supplier Banking Details")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Bank Name")}</label>
              <input 
                type="text" 
                name="bank_name"
                value={headerInfo.bank_name}
                onChange={handleHeaderChange}
                placeholder="e.g. HDFC Bank"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Account Number")}</label>
              <input 
                type="text" 
                name="bank_account_no"
                value={headerInfo.bank_account_no}
                onChange={handleHeaderChange}
                placeholder="e.g. 50200105374819"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("IFSC Code")}</label>
              <input 
                type="text" 
                name="bank_ifsc"
                value={headerInfo.bank_ifsc}
                onChange={handleHeaderChange}
                placeholder="e.g. HDFC0008546"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("Branch Name")}</label>
              <input 
                type="text" 
                name="bank_branch"
                value={headerInfo.bank_branch}
                onChange={handleHeaderChange}
                placeholder="e.g. New Atish Market, Jaipur"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Items Grid */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-foreground mb-6">{t("Item Details")}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  <th className="pb-4 pr-4 w-1/4">{t("Item / Product Name")}</th>
                  <th className="pb-4 px-4 w-[110px]">{t("HSN Code")}</th>
                  <th className="pb-4 px-4 w-[100px]">{t("Quantity")}</th>
                  <th className="pb-4 px-4 w-[90px]">{t("Unit")}</th>
                  <th className="pb-4 px-4 w-[110px]">{t("Rate (₹)")}</th>
                  <th className="pb-4 px-4 w-[90px]">{t("GST (%)")}</th>
                  <th className="pb-4 px-4 text-right">{t("Tax (₹)")}</th>
                  <th className="pb-4 px-4 text-right">{t("Total (₹)")}</th>
                  <th className="pb-4 pl-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const amount = Number(item.quantity || 0) * Number(item.rate || 0);
                  const gstRate = Number(item.gst_tax || 18);
                  const gstAmount = amount * (gstRate / 100);
                  const totalWithGst = amount + gstAmount;

                  return (
                    <tr key={item.id} className="border-b border-border/30">
                      <td className="py-4 pr-4">
                        <input 
                          type="text"
                          value={item.material_name || ""}
                          onChange={(e) => handleItemChange(item.id, "material_name", e.target.value)}
                          placeholder="Enter item or material name"
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                          required
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input 
                          type="text"
                          value={item.hsn_code || ""}
                          onChange={(e) => handleItemChange(item.id, "hsn_code", e.target.value)}
                          placeholder="e.g. 3209"
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        />
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
                          type="text"
                          value={item.unit || "KG"}
                          onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                          placeholder="KG/LTR"
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
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
                      <td className="py-4 px-4">
                        <input 
                          type="number" 
                          min="0" max="100" step="any"
                          value={item.gst_tax}
                          onChange={(e) => handleItemChange(item.id, "gst_tax", Number(e.target.value))}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                          required
                        />
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-muted-foreground text-sm">
                        ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right font-black text-foreground">
                        ₹{totalWithGst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                  );
                })}
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
          
          {/* Tax Outputs */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400"><Calculator size={18} /></span> 
              {t("Taxes & Adjustments")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">IGST (Auto-calculated)</span>
                <span className="font-mono text-lg font-bold text-foreground">₹{computedTotals.igst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">CGST (Auto-calculated)</span>
                <span className="font-mono text-lg font-bold text-foreground">₹{computedTotals.cgst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">SGST (Auto-calculated)</span>
                <span className="font-mono text-lg font-bold text-foreground">₹{computedTotals.sgst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="bg-background border-2 border-primary/20 rounded-3xl p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-semibold">{t("Sub-total")}</span>
                <span className="font-bold text-foreground">₹{computedTotals.subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="font-semibold">{t("Total Taxes")}</span>
                <span className="font-bold text-foreground">₹{(computedTotals.igst_amount + computedTotals.cgst_amount + computedTotals.sgst_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                <span className="text-xl font-bold uppercase tracking-wider text-foreground">{t("Grand Total")}</span>
                <span className="text-3xl font-black text-primary drop-shadow-md">
                  ₹{computedTotals.grandTotal.toLocaleString('en-IN')}
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
