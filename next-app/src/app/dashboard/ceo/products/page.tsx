"use client";

import { useState, useEffect } from "react";
import { Plus, Package, UploadCloud, X, Tag, Sparkles, Landmark, Trash2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useLanguage } from "@/components/LanguageProvider";
import { createMasterProduct, deleteMasterProduct } from "./actions";
import { EditProductModal } from "./EditProductModal";

export default function CEOProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    hsn_code: "",
    manufacturing_cost: "",
    selling_cost: "",
    mrp: "",
    tax_rate: "18",
    stock: "0",
    min_stock: "10",
    packaging_type: "Bucket",
    packing_size_amount: "",
    packing_size_unit: "Litre"
  });
  
  // Tags/Variations State (e.g., 2mm Rustic, Superfine)
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    payload.append("packaging_type", formData.packaging_type);
    payload.append("packing_size_amount", formData.packing_size_amount);
    payload.append("packing_size_unit", formData.packing_size_unit);
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
          packaging_type: "Bucket",
          packing_size_amount: "",
          packing_size_unit: "Litre"
        });
      } else {
        alert("Error saving product: " + res.error);
      }
    } catch (err: any) {
      console.error("Exception saving product:", err);
      alert("Exception saving product: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-transparent min-h-screen text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">{t("Master Inventory")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage formulations, pricing, and factory stock.")}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all hover:shadow-md"
        >
          <Plus size={20} /> {t("Add New Product")}
        </button>
      </div>

      {/* Products Grid with Stock Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="bg-card border border-border rounded-2xl p-5 relative shadow-sm">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                product.stock > (product.min_stock || 10) ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {product.stock} {t("in Stock")}
              </div>
              <EditProductModal product={product} onSuccess={fetchProducts} />
              <button
                onClick={() => handleDeleteProduct(product.id, product.product_name)}
                className="p-2 bg-transparent hover:bg-rose-500 hover:text-white text-muted-foreground rounded-lg transition-colors border border-border hover:border-rose-500 shadow-sm"
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
            {product.package_type && product.package_size && (
              <p className="text-sm text-primary font-bold mb-1">
                {product.package_size} {product.package_size_unit} {product.package_type}
              </p>
            )}
            
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
                  <span key={i} className="bg-muted text-muted-foreground text-sm font-medium px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 mx-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t("Create New Product")}</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Details */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Product Name")}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  placeholder={t("e.g., Rustic Royale")}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("HSN Code")}</label>
                <input 
                  type="text" 
                  value={formData.hsn_code}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                  onChange={e => setFormData({...formData, hsn_code: e.target.value})} 
                />
              </div>

              {/* Pricing Section */}
              <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  {t("Pricing Details")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Manufacturing Cost (₹)")}</label>
                    <input 
                      type="number" 
                      value={formData.manufacturing_cost}
                      placeholder="e.g. 850"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium" 
                      onChange={e => setFormData({...formData, manufacturing_cost: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Selling Cost (₹)")}</label>
                    <input 
                      type="number" 
                      value={formData.selling_cost}
                      placeholder="e.g. 1100"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium" 
                      onChange={e => setFormData({...formData, selling_cost: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("MRP (₹)")}</label>
                    <input 
                      type="number" 
                      value={formData.mrp}
                      placeholder="e.g. 1350"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium" 
                      onChange={e => setFormData({...formData, mrp: e.target.value})} 
                    />
                  </div>
                </div>
                {/* Margin Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{t("Your Margin (₹)")}</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{profitMargin.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{t("Margin %")}</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">{marginPct}%</span>
                  </div>
                </div>
              </div>

              {/* Stock Details */}
              <div className="col-span-2 grid grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Current Stock")}</label>
                  <input 
                    type="number" 
                    value={formData.stock}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium" 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Min Stock Alert")}</label>
                  <input 
                    type="number" 
                    value={formData.min_stock}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium" 
                    onChange={e => setFormData({...formData, min_stock: e.target.value})} 
                  />
                </div>
              </div>

              {/* Packaging Details */}
              <div className="col-span-2 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Packaging Type")}</label>
                  <select 
                    value={formData.packaging_type}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                    onChange={e => setFormData({...formData, packaging_type: e.target.value})}
                  >
                    <option value="Bucket">Bucket</option>
                    <option value="Container">Container</option>
                    <option value="Bag">Bag</option>
                    <option value="Pouch">Pouch</option>
                    <option value="Drum">Drum</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Size / Amount")}</label>
                  <input 
                    type="number" 
                    value={formData.packing_size_amount}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                    placeholder="e.g. 20" 
                    onChange={e => setFormData({...formData, packing_size_amount: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Unit")}</label>
                  <select 
                    value={formData.packing_size_unit}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                    onChange={e => setFormData({...formData, packing_size_unit: e.target.value})}
                  >
                    <option value="Litre">Litre (L)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="Gram">Gram (g)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="Piece">Piece</option>
                  </select>
                </div>
              </div>

              {/* Tags / Variations */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Variations / Tags (e.g., 2mm, Superfine)")}</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                    placeholder="Type variation and click Add"
                  />
                  <button 
                    onClick={handleAddTag} 
                    className="bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 px-5 rounded-xl flex items-center gap-1.5 text-slate-900 dark:text-white transition-all font-semibold"
                  >
                    <Tag size={16}/> Add
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, index) => (
                    <span key={index} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 border border-blue-200 dark:border-blue-700">
                      {tag} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(tag)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t("Product Image")}</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-blue-400 transition-all cursor-pointer">
                  <UploadCloud size={32} className="mb-2 text-blue-500" />
                  <input type="file" className="text-sm text-slate-600 dark:text-slate-300" accept="image/*" onChange={(e) => { if(e.target.files) setImageFile(e.target.files[0]) }} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSaveProduct}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {t("Save Product to Database")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
