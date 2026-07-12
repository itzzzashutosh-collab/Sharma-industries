"use client";

import { useState, useEffect } from "react";
import { Plus, Package, UploadCloud, X, Tag, Sparkles, Landmark, Trash2, Import, Award, Percent, Layers, ShieldAlert } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useLanguage } from "@/components/LanguageProvider";
import { createMasterProduct, deleteMasterProduct, importMasterProducts, updateBulkPrices } from "./actions";
import { EditProductModal } from "./EditProductModal";
import { motion, AnimatePresence } from "framer-motion";

export default function CEOProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  // Form States for creating a product
  const [formData, setFormData] = useState({
    name: "",
    hsn_code: "",
    manufacturing_cost: "",
    selling_cost: "",
    mrp: "",
    tax_rate: "18",
    stock: "0",
    min_stock: "10",
    category: "Emulsions"
  });
  
  // Tags/Variations State (e.g., 2mm Rustic, Superfine)
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [isImportPending, setIsImportPending] = useState(false);

  // Bulk Pricing State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingFormList, setPricingFormList] = useState<any[]>([]);
  const [isPricingPending, setIsPricingPending] = useState(false);
  const [pricingAdjustmentField, setPricingAdjustmentField] = useState<"selling_cost" | "mfg_cost" | "mrp">("selling_cost");
  const [pricingAdjustmentPct, setPricingAdjustmentPct] = useState("");

  // Categories State
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch Products on Load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_master_product", true)
      .order("created_at", { ascending: false });
    
    if (data) setProducts(data);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`${t("Are you sure you want to delete this product?")} (${name})`)) {
      try {
        const res = await deleteMasterProduct(id);
        if (res.success) {
          fetchProducts();
        } else {
          alert(t("Failed to delete product: ") + res.error);
        }
      } catch (err: any) {
        console.error("Error deleting product:", err);
        alert(t("An error occurred while deleting the product."));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Math logic: margin = selling cost − manufacturing cost
  const manufacturingCost = parseFloat(formData.manufacturing_cost) || 0;
  const sellingCost = parseFloat(formData.selling_cost) || 0;
  const profitMargin = sellingCost - manufacturingCost;
  const marginPct = manufacturingCost > 0 ? ((profitMargin / manufacturingCost) * 100).toFixed(1) : "0.0";

  const handleSaveProduct = async () => {
    if (!formData.name) {
      alert("Product name is required.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("hsn_code", formData.hsn_code);
    payload.append("manufacturing_price", manufacturingCost.toString());
    payload.append("selling_price", sellingCost.toString());
    payload.append("mrp", formData.mrp);
    payload.append("tax_rate", formData.tax_rate);
    payload.append("stock", formData.stock);
    payload.append("min_stock", formData.min_stock);
    payload.append("category", formData.category);
    payload.append("tags", JSON.stringify(tags));

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      const res = await createMasterProduct(payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchProducts(); // Refresh list
        setTags([]); // Reset tags
        setImageFile(null); // Reset image
        // Reset form data
        setFormData({
          name: "",
          hsn_code: "",
          manufacturing_cost: "",
          selling_cost: "",
          mrp: "",
          tax_rate: "18",
          stock: "0",
          min_stock: "10",
          category: "Emulsions"
        });
      } else {
        alert("Error saving product: " + res.error);
      }
    } catch (err: any) {
      console.error("Exception saving product:", err);
      alert("Exception saving product: " + err.message);
    }
  };

  // CSV importer handler (Packaging fields removed)
  const handleImportCSV = async () => {
    if (!csvData.trim()) {
      alert(t("Please paste CSV data first."));
      return;
    }
    setIsImportPending(true);
    try {
      const lines = csvData.split("\n");
      const parsedProducts = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const [
          name,
          hsn_code,
          mfg_cost,
          selling_cost,
          mrp,
          stock,
          min_stock,
          category
        ] = line.split(",").map(item => item?.trim() || "");

        if (!name || name.toLowerCase() === "name") continue; // Skip header if present

        parsedProducts.push({
          name,
          hsn_code: hsn_code || "3209",
          mfg_cost: parseFloat(mfg_cost) || 0,
          selling_cost: parseFloat(selling_cost) || 0,
          mrp: parseFloat(mrp) || 0,
          stock: parseFloat(stock) || 0,
          min_stock: parseFloat(min_stock) || 10,
          category: category || "Emulsions",
          tags: ""
        });
      }

      if (parsedProducts.length === 0) {
        alert(t("No valid product rows parsed. Check format."));
        setIsImportPending(false);
        return;
      }

      const res = await importMasterProducts(parsedProducts);
      if (res.success) {
        setIsImportModalOpen(false);
        setCsvData("");
        fetchProducts();
        alert(`Successfully imported ${parsedProducts.length} products!`);
      } else {
        alert("Failed to import products: " + res.error);
      }
    } catch (err: any) {
      alert("Error importing CSV: " + err.message);
    } finally {
      setIsImportPending(false);
    }
  };

  // Bulk Pricing Modal helper
  const openBulkPricing = () => {
    setPricingFormList(products.map(p => ({
      id: p.id,
      name: p.product_name,
      mfg_cost: p.mfg_cost || 0,
      selling_cost: p.selling_cost || 0,
      mrp: p.mrp || 0
    })));
    setIsPricingModalOpen(true);
  };

  const updatePricingFormItem = (idx: number, field: string, val: number) => {
    setPricingFormList(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const applyGlobalPricingAdjustment = () => {
    const pct = parseFloat(pricingAdjustmentPct);
    if (isNaN(pct)) {
      alert(t("Please enter a valid percentage number."));
      return;
    }
    const factor = 1 + (pct / 100);
    setPricingFormList(prev => prev.map(item => ({
      ...item,
      [pricingAdjustmentField]: Math.round(item[pricingAdjustmentField] * factor)
    })));
  };

  const handleSaveBulkPricing = async () => {
    setIsPricingPending(true);
    try {
      const res = await updateBulkPrices(pricingFormList);
      if (res.success) {
        setIsPricingModalOpen(false);
        fetchProducts();
        alert(t("Bulk pricing updated successfully!"));
      } else {
        alert("Failed to update bulk pricing: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsPricingPending(false);
    }
  };

  const displayedProducts = selectedCategoryFilter 
    ? products.filter(p => p.category === selectedCategoryFilter)
    : products;

  return (
    <div className="p-6 bg-transparent min-h-screen text-foreground transition-colors duration-300 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2">
        <span>{t("Home")}</span>
        <span className="text-muted-foreground/45">/</span>
        <span className="text-foreground">{t("Products")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Package className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t("Products")}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("Manage formulations, product parameters, pricing, and master registry.")}</p>
          </div>
        </div>

        {/* Quick Actions Row (Packaging Button Removed) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} /> {t("New Product")}
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            {t("Import")}
          </button>
          <button 
            onClick={openBulkPricing}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            {t("Pricing")}
          </button>
          <button 
            onClick={() => setIsCategoriesModalOpen(true)}
            className="bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl text-xs font-bold border border-border/60 transition-colors cursor-pointer"
          >
            {t("Categories")}
          </button>
        </div>
      </div>

      {/* Active Category Filter Indicator */}
      {selectedCategoryFilter && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold text-primary w-fit animate-in fade-in duration-300">
          <span>{t("Filtering category")}: <strong>{selectedCategoryFilter}</strong></span>
          <button 
            onClick={() => setSelectedCategoryFilter(null)}
            className="text-muted-foreground hover:text-rose-500 font-black cursor-pointer bg-transparent border-none ml-2"
          >
            ✕ {t("Clear Filter")}
          </button>
        </div>
      )}

      {/* Products Grid with Stock Indicator (Packaging fields removed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedProducts.map((product: any) => (
          <div 
            key={product.id} 
            onClick={() => setSelectedProduct(product)}
            className="bg-card border border-border rounded-2xl p-5 relative shadow-sm cursor-pointer hover:border-primary/45 transition-all"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                product.actual_stock > (product.min_stock_threshold || 10) ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {product.actual_stock} {t("in Stock")}
              </div>
              <EditProductModal product={product} onSuccess={fetchProducts} />
              <button
                onClick={() => handleDeleteProduct(product.id, product.product_name)}
                className="p-2 bg-transparent hover:bg-rose-500 hover:text-white text-muted-foreground rounded-lg transition-colors border border-border hover:border-rose-500 shadow-sm cursor-pointer"
                title={t("Delete Product")}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {product.image_url ? (
              <img src={product.image_url} alt={product.product_name} className="h-40 w-full object-cover rounded-xl mb-4" />
            ) : (
              <div className="h-40 w-full bg-background border border-border rounded-xl flex items-center justify-center mb-4 text-muted-foreground">
                <Package size={40} />
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground">{product.product_name}</h3>
            
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                {product.category || "Emulsions"}
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("Mfg Cost")}</p>
                  <p className="text-base font-bold text-foreground">₹{product.mfg_cost ?? "—"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t("Selling Cost")}</p>
                  <p className="text-base font-bold text-primary">₹{product.selling_cost ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("MRP")}</p>
                  <p className="text-base font-bold text-foreground">₹{product.mrp ?? "—"}</p>
                </div>
              </div>
              {product.mfg_cost && product.selling_cost && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t("Your Margin")}</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{(product.selling_cost - product.mfg_cost).toFixed(0)}
                    <span className="text-xs font-bold ml-1 opacity-70">
                      ({((( product.selling_cost - product.mfg_cost) / product.mfg_cost) * 100).toFixed(1)}%)
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Tags Display */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(typeof product.tags === 'string' ? product.tags.split(',') : product.tags).map((tag: string, i: number) => (
                  <span key={i} className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {displayedProducts.length === 0 && (
          <div className="col-span-3 border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground font-black">
            {t("No products found in this category.")}
          </div>
        )}
      </div>

      {/* Add New Product Modal (Packaging Details section removed) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 mx-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-foreground">{t("Create New Product")}</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Details */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Product Name")}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  placeholder={t("e.g., Rustic Royale")}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("HSN Code")}</label>
                <input 
                  type="text" 
                  value={formData.hsn_code}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" 
                  onChange={e => setFormData({...formData, hsn_code: e.target.value})} 
                />
              </div>

              {/* Pricing Section */}
              <div className="col-span-2 border-t border-border pt-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  {t("Pricing Details")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Manufacturing Cost (₹)")}</label>
                    <input 
                      type="number" 
                      value={formData.manufacturing_cost}
                      placeholder="e.g. 850"
                      className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary font-medium" 
                      onChange={e => setFormData({...formData, manufacturing_cost: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Selling Cost (₹)")}</label>
                    <input 
                      type="number" 
                      value={formData.selling_cost}
                      placeholder="e.g. 1100"
                      className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary font-medium" 
                      onChange={e => setFormData({...formData, selling_cost: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("MRP (₹)")}</label>
                    <input 
                      type="number" 
                      value={formData.mrp}
                      placeholder="e.g. 1350"
                      className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary font-medium" 
                      onChange={e => setFormData({...formData, mrp: e.target.value})} 
                    />
                  </div>
                </div>
                {/* Margin Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t("Your Margin (₹)")}</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{profitMargin.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-primary">{t("Margin %")}</span>
                    <span className="text-lg font-black text-primary">{marginPct}%</span>
                  </div>
                </div>
              </div>

              {/* Stock Details */}
              <div className="col-span-2 grid grid-cols-2 gap-6 border-t border-border pt-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Current Stock")}</label>
                  <input 
                     type="number" 
                     value={formData.stock}
                     className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary font-medium" 
                     onChange={e => setFormData({...formData, stock: e.target.value})} 
                   />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Min Stock Alert")}</label>
                  <input 
                    type="number" 
                    value={formData.min_stock}
                    className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary font-medium" 
                    onChange={e => setFormData({...formData, min_stock: e.target.value})} 
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="col-span-2 border-t border-border pt-4">
                <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Category")}</label>
                <select
                  value={formData.category}
                  className="w-full bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary font-semibold"
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Emulsions">Emulsions</option>
                  <option value="Putty">Putty</option>
                  <option value="Primers">Primers</option>
                  <option value="Textures">Textures</option>
                  <option value="Distempers">Distempers</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              {/* Tags / Variations */}
              <div className="col-span-2 border-t border-border pt-4">
                <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Variations / Tags (e.g., 2mm, Superfine)")}</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" 
                    placeholder="Type variation and click Add"
                  />
                  <button 
                    onClick={handleAddTag} 
                    className="bg-muted hover:bg-muted/80 border border-border px-5 rounded-xl flex items-center gap-1.5 text-foreground transition-all font-semibold cursor-pointer"
                  >
                    <Tag size={16}/> Add
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, index) => (
                    <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 border border-primary/20">
                      {tag} <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => handleRemoveTag(tag)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="col-span-2 border-t border-border pt-4">
                <label className="block text-sm font-semibold text-muted-foreground mb-2">{t("Product Image")}</label>
                <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/45 transition-all cursor-pointer">
                  <UploadCloud size={32} className="mb-2 text-primary" />
                  <input type="file" className="text-sm text-foreground cursor-pointer" accept="image/*" onChange={(e) => { if(e.target.files) setImageFile(e.target.files[0]) }} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSaveProduct}
              className="w-full mt-8 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {t("Save Product to Database")}
            </button>
          </div>
        </div>
      )}

      {/* CSV Import Modal (Packaging Fields Removed) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl mx-4">
            <button onClick={() => setIsImportModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-foreground">{t("Import Products via CSV")}</h2>
            <p className="text-xs text-muted-foreground mb-4">
              {t("Paste CSV data below. Format: Name, HSN, Mfg Cost, Selling Cost, MRP, Stock, Min Stock, Category")}
            </p>
            <textarea
              value={csvData}
              onChange={e => setCsvData(e.target.value)}
              placeholder="Rustic Royale Superfine, 3209, 1200, 1500, 1800, 200, 10, Emulsions"
              rows={8}
              className="w-full bg-muted/45 border border-border rounded-xl p-3 text-xs font-mono text-foreground outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                disabled={isImportPending}
                onClick={handleImportCSV}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isImportPending ? t("Importing...") : t("Import Products")}
              </button>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Pricing Modal */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl mx-4">
            <button onClick={() => setIsPricingModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2 text-foreground">{t("Bulk Pricing Adjustment Manager")}</h2>
            
            {/* Global adjustments tool */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 mb-4 flex items-center flex-wrap gap-4 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">{t("Quick Markup Utility")}:</span>
              <select
                value={pricingAdjustmentField}
                onChange={e => setPricingAdjustmentField(e.target.value as any)}
                className="bg-background border border-border rounded-lg px-2.5 py-1.5 font-bold outline-none"
              >
                <option value="selling_cost">{t("Selling Price")}</option>
                <option value="mfg_cost">{t("Manufacturing Cost")}</option>
                <option value="mrp">{t("MRP")}</option>
              </select>
              <input
                type="number"
                placeholder="Percentage % (e.g., 5 or -10)"
                value={pricingAdjustmentPct}
                onChange={e => setPricingAdjustmentPct(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 font-medium w-32 outline-none"
              />
              <button
                type="button"
                onClick={applyGlobalPricingAdjustment}
                className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                {t("Apply Adjustment")}
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded-xl mb-4 max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/65 text-muted-foreground font-black uppercase tracking-wider sticky top-0 bg-card z-10">
                  <tr>
                    <th className="p-3">{t("Product Name")}</th>
                    <th className="p-3">{t("Mfg Cost (₹)")}</th>
                    <th className="p-3">{t("Selling Price (₹)")}</th>
                    <th className="p-3">{t("MRP (₹)")}</th>
                    <th className="p-3 text-right">{t("Margin")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pricingFormList.map((item: any, idx: number) => {
                    const margin = item.selling_cost - item.mfg_cost;
                    const marginPercent = item.mfg_cost > 0 ? ((margin / item.mfg_cost) * 100).toFixed(1) : "0";
                    return (
                      <tr key={item.id} className="hover:bg-muted/15">
                        <td className="p-3 font-bold text-foreground">{item.name}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.mfg_cost}
                            onChange={e => updatePricingFormItem(idx, "mfg_cost", Number(e.target.value))}
                            className="bg-background border border-border rounded-lg px-2 py-1 w-24 text-center font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.selling_cost}
                            onChange={e => updatePricingFormItem(idx, "selling_cost", Number(e.target.value))}
                            className="bg-background border border-border rounded-lg px-2 py-1 w-24 text-center font-bold text-primary"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.mrp}
                            onChange={e => updatePricingFormItem(idx, "mrp", Number(e.target.value))}
                            className="bg-background border border-border rounded-lg px-2 py-1 w-24 text-center font-bold"
                          />
                        </td>
                        <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          ₹{margin.toFixed(0)} ({marginPercent}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                disabled={isPricingPending}
                onClick={handleSaveBulkPricing}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isPricingPending ? t("Saving...") : t("Save Pricing Changes")}
              </button>
              <button
                onClick={() => setIsPricingModalOpen(false)}
                className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Filtering Modal */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl mx-4">
            <button onClick={() => setIsCategoriesModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2 text-foreground">{t("Product Categories")}</h2>
            <p className="text-xs text-muted-foreground mb-4">
              {t("Filter the product catalog by selecting a category below or clear the filters.")}
            </p>
            <div className="space-y-2 mb-6">
              <button
                onClick={() => { setSelectedCategoryFilter(null); setIsCategoriesModalOpen(false); }}
                className={`w-full flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedCategoryFilter === null 
                    ? "bg-primary/10 border-primary text-primary" 
                    : "bg-muted/40 border-border hover:bg-muted text-foreground"
                }`}
              >
                <span>{t("All Categories")}</span>
                <span className="bg-muted px-2 py-0.5 rounded-md text-[10px] text-muted-foreground">{products.length}</span>
              </button>
              {Object.entries(
                products.reduce((acc: any, p: any) => {
                  const cat = p.category || "Emulsions";
                  acc[cat] = (acc[cat] || 0) + 1;
                  return acc;
                }, {})
              ).map(([cat, count]: [string, any]) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategoryFilter(cat); setIsCategoriesModalOpen(false); }}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedCategoryFilter === cat 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-muted/40 border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="bg-muted px-2 py-0.5 rounded-md text-[10px] text-muted-foreground">{count}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCategoriesModalOpen(false)}
              className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-xl transition-all cursor-pointer"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      )}


      {/* Product Detail Drawer */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Package size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">{selectedProduct.product_name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* General Info */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("General Information")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">{t("HSN Code")}</p>
                      <p className="font-semibold text-foreground mt-0.5">{selectedProduct.hsn_code || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("Category")}</p>
                      <p className="font-bold text-primary mt-0.5">{selectedProduct.category || "Emulsions"}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Pricing Details")}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground">{t("Mfg Cost")}</p>
                      <p className="font-black text-foreground mt-0.5">₹{selectedProduct.mfg_cost ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("Selling Price")}</p>
                      <p className="font-black text-primary mt-0.5">₹{selectedProduct.selling_cost ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("MRP")}</p>
                      <p className="font-black text-foreground mt-0.5">₹{selectedProduct.mrp ?? "—"}</p>
                    </div>
                  </div>
                  {selectedProduct.mfg_cost && selectedProduct.selling_cost && (
                    <div className="mt-3 pt-3 border-t border-border/40 flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{t("Calculated Profit Margin")}</span>
                      <span>
                        ₹{(selectedProduct.selling_cost - selectedProduct.mfg_cost).toFixed(0)}{" "}
                        ({(((selectedProduct.selling_cost - selectedProduct.mfg_cost) / selectedProduct.mfg_cost) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">{t("Stock Level")}</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground">{t("Current Inventory")}</p>
                      <p className="text-lg font-black text-foreground mt-0.5">{selectedProduct.actual_stock} {t("Units")}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border ${
                      selectedProduct.actual_stock > (selectedProduct.min_stock_threshold || 10) 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    }`}>
                      {selectedProduct.actual_stock > (selectedProduct.min_stock_threshold || 10) ? t("Healthy Stock") : t("Reorder Required")}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Controls Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
                <button 
                  onClick={() => { setSelectedProduct(null); }}
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
