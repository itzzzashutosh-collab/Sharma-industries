"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { addFactoryExpense, addFactoryAsset } from "./actions";
import { ExpensePieChart } from "./ExpensePieChart";
import { Factory, Wrench, PlusCircle, Building2 } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  amount: number;
  created_at: string;
}

interface Asset {
  id: string;
  name: string;
  purchase_value: number;
  current_value: number;
  purchase_date: string;
  created_at: string;
}

interface PieChartDataPoint {
  name: string;
  value: number;
}

interface Props {
  expenses: Expense[];
  assets: Asset[];
  pieChartData: PieChartDataPoint[];
  totalExpenses: number;
  totalAssetValue: number;
}

export function FactoryExpensesClient({
  expenses,
  assets,
  pieChartData,
  totalExpenses,
  totalAssetValue,
}: Props) {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddExpense = async (formData: FormData) => {
    await addFactoryExpense(formData);
  };

  const handleAddAsset = async (formData: FormData) => {
    await addFactoryAsset(formData);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Building2 className="text-primary animate-pulse" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {t("Factory Operations & Expense Ledger")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("Log fixed factory costs and manage the master permanent asset registry.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Entry Forms */}
        <div className="space-y-6">
          {/* Add Factory Expense Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PlusCircle size={18} className="text-primary" />
              {t("Log Factory Expense")}
            </h3>
            <form action={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  {t("Category")}
                </label>
                <div className="relative">
                  <select
                    name="category"
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary appearance-none"
                  >
                    <option value="Factory Rent">{t("Factory Rent")}</option>
                    <option value="Heavy Machinery Maintenance">
                      {t("Heavy Machinery Maintenance")}
                    </option>
                    <option value="Electricity">{t("Electricity")}</option>
                    <option value="Transport/Logistics">{t("Transport/Logistics")}</option>
                    <option value="Miscellaneous">{t("Miscellaneous")}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  {t("Amount (₹)")}
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary"
                  placeholder="e.g. 45000"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-md hover:shadow-md hover:bg-primary-hover transition-all"
              >
                {t("Submit Expense")}
              </button>
            </form>
          </div>

          {/* Add Factory Asset Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Wrench size={18} className="text-primary" />
              {t("Register Permanent Asset")}
            </h3>
            <form action={handleAddAsset} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  {t("Asset Name")}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary"
                  placeholder="e.g. Twin Shaft Mixer 500L"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("Purchase Val")}
                  </label>
                  <input
                    type="number"
                    name="purchase_value"
                    required
                    min="1"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary"
                    placeholder="₹"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    {t("Current Val")}
                  </label>
                  <input
                    type="number"
                    name="current_value"
                    required
                    min="1"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary"
                    placeholder="₹"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-md hover:shadow-md hover:bg-primary-hover transition-all"
              >
                {t("Add Asset to Registry")}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Visuals & Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breakdown Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">{t("Monthly Running Cost Breakdown")}</h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                  {t("Total Output")}
                </p>
                <p className="text-2xl font-black text-primary font-mono">
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
            <ExpensePieChart data={pieChartData} />
          </div>

          {/* Asset Registry List */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Factory size={20} className="text-primary" />
                {t("Master Asset Registry")}
              </h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                  {t("Depreciated Book Val")}
                </p>
                <p className="text-2xl font-black text-primary font-mono">
                  ₹{totalAssetValue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="text-sm uppercase tracking-wider text-muted-foreground border-b border-border bg-background/50">
                    <th className="p-4 font-semibold">{t("Asset Name")}</th>
                    <th className="p-4 font-semibold">{t("Reg. Date")}</th>
                    <th className="p-4 font-semibold text-right">{t("Purchase Value")}</th>
                    <th className="p-4 font-semibold text-right">{t("Current Book Val")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 font-medium text-foreground">{asset.name}</td>
                      <td className="p-4 text-muted-foreground font-mono">
                        {isMounted
                          ? new Date(asset.purchase_date || asset.created_at).toLocaleDateString()
                          : (asset.purchase_date || asset.created_at)}
                      </td>
                      <td className="p-4 text-right text-muted-foreground font-mono line-through opacity-70">
                        ₹{Number(asset.purchase_value).toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-primary">
                        ₹{Number(asset.current_value).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        {t("No factory assets registered yet.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
