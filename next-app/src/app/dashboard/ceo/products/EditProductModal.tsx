"use client";

import { useState, useTransition, useEffect } from "react";
import { Edit2, X, Settings2, Trash2, Tag, UploadCloud, Sparkles } from "lucide-react";
import { updateMasterProduct, deleteMasterProduct } from "./actions";
import { useLanguage } from "@/components/LanguageProvider";

export function EditProductModal({ product, onSuccess }: { product: any; onSuccess?: () => void }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Sync state with product details on open
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.product_name || "",
        hsn_code: product.hsn_code || "",
        manufacturing_cost: product.mfg_cost?.toString() || "",
        selling_cost: product.selling_cost?.toString() || "",
        mrp: product.mrp?.toString() || "",
        tax_rate: product.tax_rate?.toString() || "18",
        stock: product.actual_stock?.toString() || "0",
        min_stock: product.min_stock_threshold?.toString() || "10",
        packaging_type: product.package_type || "Bucket",
        packing_size_amount: product.package_size?.toString() || "",
        packing_size_unit: product.package_size_unit || "Litre"
      });
      const initialTags = product.tags 
        ? (typeof product.tags === 'string' ? product.tags.split(',') : product.tags)
        : [];
      setTags(initialTags);
      setImageFile(null);
    }
  }, [isOpen, product]);

  const handleDelete = async () => {
    if (confirm(`${t("Are you sure you want to delete this product?")} (${product.name})`)) {
      startTransition(async () => {
        try {
          const res = await deleteMasterProduct(product.id);
          if (res.success) {
            setIsOpen(false);
            onSuccess?.();
          } else {
            alert(t("Failed to delete product: ") + res.error);
          }
        } catch (err: any) {
          console.error("Error deleting product:", err);
          alert(t("An error occurred while deleting the product."));
        }
      });
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Product name is required.");
      return;
    }

    const payload = new FormData();
    payload.append("product_id", product.id);
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

    startTransition(async () => {
      try {
        const res = await updateMasterProduct(payload);
        if (res.success) {
          setIsOpen(false);
          onSuccess?.();
        } else {
          alert("Error updating product: " + res.error);
        }
      } catch (err: any) {
        console.error("Exception updating product:", err);
        alert("Exception updating product: " + err.message);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-transparent hover:bg-primary hover:text-white dark:hover:text-white text-muted-foreground rounded-lg transition-colors border border-border hover:border-primary shadow-sm cursor-pointer"
        title={t("Edit Product")}
      >
        <Edit2 size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/40  animate-in fade-in duration-200">
          <div className="bg-card border-l border-border h-full w-full max-w-lg shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col rounded-l-3xl">
            <div className="flex justify-between items-center p-6 border-b border-border bg-transparent/50 rounded-tl-3xl">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Settings2 size={20} className="text-primary" />
                {t("Edit Product")}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form id={`edit-form-${product.id}`} onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Info */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("Product Name")}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    required
                    placeholder={t("e.g., Rustic Royale")}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium"
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("HSN Code")}
                  </label>
                  <input
                    type="text"
                    value={formData.hsn_code}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium"
                    onChange={e => setFormData({ ...formData, hsn_code: e.target.value })}
                  />
                </div>



                {/* Pricing Details */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    {t("Pricing Details")}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("Manufacturing Cost (₹)")}</label>
                      <input
                        type="number"
                        value={formData.manufacturing_cost}
                        placeholder="e.g. 850"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary text-sm font-medium"
                        onChange={e => setFormData({ ...formData, manufacturing_cost: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("Selling Cost (₹)")}</label>
                      <input
                        type="number"
                        value={formData.selling_cost}
                        placeholder="e.g. 1100"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary text-sm font-medium"
                        onChange={e => setFormData({ ...formData, selling_cost: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Live Margin Preview */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t("Your Margin (₹)")}</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{profitMargin.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5">
                      <span className="text-xs font-bold text-primary">{t("Margin %")}</span>
                      <span className="text-base font-black text-primary">{marginPct}%</span>
                    </div>
                  </div>
                </div>

                {/* MRP */}
                <div className="border-t border-border pt-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("MRP (₹)")}
                    </label>
                    <input
                      type="number"
                      value={formData.mrp}
                      placeholder="e.g. 1350"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium"
                      onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                    />
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Current Stock")}
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium"
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {t("Min Stock Alert")}
                    </label>
                    <input
                      type="number"
                      value={formData.min_stock}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary text-sm font-medium"
                      onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                    />
                  </div>
                </div>

                {/* Packaging Details */}
                <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">{t("Pkg Type")}</label>
                    <select
                      value={formData.packaging_type}
                      className="w-full bg-background border border-border rounded-xl px-2 py-2 text-foreground text-sm outline-none focus:border-primary"
                      onChange={e => setFormData({ ...formData, packaging_type: e.target.value })}
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
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">{t("Size")}</label>
                    <input
                      type="number"
                      value={formData.packing_size_amount}
                      className="w-full bg-background border border-border rounded-xl px-2 py-2 text-foreground text-sm outline-none focus:border-primary"
                      onChange={e => setFormData({ ...formData, packing_size_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-1">{t("Unit")}</label>
                    <select
                      value={formData.packing_size_unit}
                      className="w-full bg-background border border-border rounded-xl px-2 py-2 text-foreground text-sm outline-none focus:border-primary"
                      onChange={e => setFormData({ ...formData, packing_size_unit: e.target.value })}
                    >
                      <option value="Litre">Litre (L)</option>
                      <option value="kg">kg</option>
                      <option value="Gram">Gram (g)</option>
                      <option value="ml">ml</option>
                      <option value="Piece">Piece</option>
                    </select>
                  </div>
                </div>



                {/* Variations / Tags */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("Variations / Tags")}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none focus:border-primary"
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-transparent hover:bg-card border border-border px-3 rounded-xl flex items-center text-sm text-foreground font-bold cursor-pointer"
                    >
                      {t("Add")}
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((tag, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-primary/20">
                        {tag} <X size={12} className="cursor-pointer hover:text-foreground" onClick={() => handleRemoveTag(tag)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("Replace Image")}
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-all cursor-pointer">
                    <UploadCloud size={24} className="mb-1 text-primary" />
                    <input type="file" className="text-sm" accept="image/*" onChange={(e) => { if(e.target.files) setImageFile(e.target.files[0]) }} />
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-border bg-transparent/50 rounded-bl-3xl space-y-3">
              <button
                type="submit"
                form={`edit-form-${product.id}`}
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-primary text-white text-white font-bold shadow-md hover:shadow-md hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer"
              >
                {isPending ? t("Saving...") : t("Save Changes")}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white font-bold disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {t("Delete Product")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
