"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Save, FileText, Truck, Calculator, CreditCard, UploadCloud } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getRawMaterials, submitPurchaseBill } from "@/actions/purchaseActions";
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
    /(?:invoice\s*no|invoice\s*number|bill\s*no|bill\s*number|inv\s*no|invoice\s*#)[:\s\-]+([A-Z0-9\-\/]+)/i,
    /invoice\s*[:\s\-]+([A-Z0-9\-\/]+)/i,
    /inv\s*[:\s\-]+([A-Z0-9\-\/]+)/i,
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
  let bill_date = new Date().toISOString().split("T")[0];
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

  // 4. Supplier Name
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let supplier_name = "";
  const supplierKeywords = [/ltd/i, /pvt/i, /enterprise/i, /chemical/i, /paint/i, /industry/i, /logistics/i, /co\./i, /corporation/i];
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (supplierKeywords.some(kw => kw.test(line)) && 
        !line.includes("@") && 
        !line.toLowerCase().includes("gstin") && 
        !line.toLowerCase().includes("invoice") &&
        line.length < 50) {
      supplier_name = line;
      break;
    }
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
    items: matchedItems.length > 0 ? matchedItems : [{ id: Date.now().toString(), raw_material_id: "", quantity: 0, rate: 0 }]
  };
};

export default function AddPurchaseBillPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Fetched State
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Fill State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        alert(t("Unsupported file type. Please upload a PDF or Image."));
        setIsExtracting(false);
        return;
      }

      if (!text || text.trim().length === 0) {
        throw new Error(t("No readable text found in the document."));
      }

      setExtractionStatus(t("Parsing invoice fields..."));
      const parsedData = parseInvoiceText(text, rawMaterials);

      setHeaderInfo(prev => ({
        ...prev,
        supplier_name: parsedData.supplier_name || prev.supplier_name,
        supplier_gstin: parsedData.supplier_gstin || prev.supplier_gstin,
        invoice_no: parsedData.invoice_no || prev.invoice_no,
        bill_date: parsedData.bill_date || prev.bill_date,
      }));

      setTaxes({
        cgst_amount: parsedData.cgst_amount,
        sgst_amount: parsedData.sgst_amount,
        igst_amount: parsedData.igst_amount,
      });

      setItems(parsedData.items);

      alert(t("Bill details populated successfully! Please review the form before saving."));
    } catch (err: any) {
      console.error(err);
      alert(t("Failed to parse invoice: ") + err.message);
    } finally {
      setIsExtracting(false);
      setExtractionStatus("");
    }
  };

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
