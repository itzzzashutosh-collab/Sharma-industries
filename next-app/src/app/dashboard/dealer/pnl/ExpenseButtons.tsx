"use client";

import { useState, useTransition } from "react";
import { addExpense } from "./actions";
import { Home, Zap, Users, Coffee, Truck, X } from "lucide-react";

const EXPENSE_CATEGORIES = [
  { name: "Rent", icon: Home, color: "text-blue-400", bg: "bg-blue-500/20" },
  { name: "Electricity", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/20" },
  { name: "Staff Salary", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  { name: "Chai-Paani", icon: Coffee, color: "text-orange-400", bg: "bg-orange-500/20" },
  { name: "Transport", icon: Truck, color: "text-violet-400", bg: "bg-violet-500/20" },
];

export function ExpenseButtons() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = (category: string) => {
    setActiveCategory(category);
  };

  const handleClose = () => {
    setActiveCategory(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("category", activeCategory || "");

    startTransition(async () => {
      await addExpense(formData);
      handleClose();
    });
  };

  return (
    <div className="bg-slate-900/50  border border-slate-800 rounded-3xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Quick Add Expense</h2>
      
      <div className="flex flex-wrap gap-4">
        {EXPENSE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => handleOpen(cat.name)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                <Icon size={20} />
              </div>
              <span className="font-medium text-slate-300">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Add {activeCategory} Expense
              </h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <label className="text-sm text-slate-400 uppercase tracking-wider mb-2 block font-semibold">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                min="1"
                required
                autoFocus
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg outline-none focus:border-violet-500 transition-colors mb-6"
              />
              
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 transition-all"
              >
                {isPending ? "Saving..." : "Save Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
