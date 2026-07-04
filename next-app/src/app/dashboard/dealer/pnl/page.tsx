import { createClient } from "@/utils/supabase/server";
import { ExpenseButtons } from "./ExpenseButtons";

export const metadata = {
  title: "P&L Dashboard | Sharma ERP",
};

export default async function PnLDashboard() {
  const supabase = await createClient();

  // Fetch Sales & Commissions from invoices
  const { data: invoices } = await supabase.from("invoices").select("grand_total, hidden_commission_amount");
  
  const totalSales = invoices?.reduce((acc, inv) => acc + (Number(inv.grand_total) || 0), 0) || 0;
  const totalCommission = invoices?.reduce((acc, inv) => acc + (Number(inv.hidden_commission_amount) || 0), 0) || 0;

  // Approximate Purchase Cost (70% of sales for demo purposes)
  const purchaseCost = totalSales * 0.7;

  // Fetch Expenses
  const { data: expenses } = await supabase.from("dealer_expenses").select("amount");
  const totalExpenses = expenses?.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0) || 0;

  // Calculate True Profit
  const trueProfit = totalSales - purchaseCost - totalExpenses - totalCommission;

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">True P&L Dashboard</h1>
        <p className="text-slate-400 mt-2">Track your real margins, expenses, and hidden commissions.</p>
      </div>

      <ExpenseButtons />

      <div className="bg-slate-900/50  border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        {/* Glow effect for profit */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <h2 className="text-xl font-bold text-white mb-8 relative z-10">True Profit Calculator</h2>

        <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-between items-center text-lg">
            <span className="text-slate-300">Total Sales Revenue</span>
            <span className="font-semibold text-white">₹{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex justify-between items-center text-lg text-rose-400/80">
            <span>Minus (-) Purchase Cost <span className="text-sm text-slate-500 ml-2">(Est. 70%)</span></span>
            <span>- ₹{purchaseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center text-lg text-rose-400/80">
            <span>Minus (-) Operational Expenses</span>
            <span>- ₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center text-lg text-rose-400/80 pb-6 border-b border-slate-700/50">
            <span>Minus (-) Hidden Painter Commissions</span>
            <span>- ₹{totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-end pt-4">
            <div>
              <span className="text-xl font-bold text-white block">Actual In-Hand Profit</span>
              <span className="text-sm text-emerald-400/80">Your true net margin</span>
            </div>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              ₹{trueProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
