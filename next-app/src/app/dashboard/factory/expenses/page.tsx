"use client";

import React, { useState, useEffect } from "react";
import { Receipt, Plus, X, Calendar, CheckCircle2, Wallet, RefreshCw } from "lucide-react";
import { getExpenses, markAsPaid, recordExpense } from "@/actions/expenseActions";

export default function FactoryExpensesPage() {
  const [daily, setDaily] = useState<any[]>([]);
  const [permanent, setPermanent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  
  // Selected expense for payment
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState("CASH");

  // Record Form state
  const [formData, setFormData] = useState({
    expense_name: "",
    category: "DAILY",
    amount: "",
    due_date: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await getExpenses();
    if (res.success && res.data) {
      setDaily(res.data.daily);
      setPermanent(res.data.permanent);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expense_name || !formData.amount) return alert("Fill required fields");

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    const res = await recordExpense(payload);
    if (res.success) {
      setIsRecordModalOpen(false);
      setFormData({ expense_name: "", category: "DAILY", amount: "", due_date: "" });
      fetchData();
    } else {
      alert("Error recording expense.");
    }
  };

  const handleMarkPaidClick = (expense: any) => {
    setSelectedExpense(expense);
    setPaymentMode("CASH");
    setIsPayModalOpen(true);
  };

  const submitPayment = async () => {
    if (!selectedExpense) return;
    
    const res = await markAsPaid(selectedExpense.id, { payment_mode: paymentMode });
    if (res.success) {
      setIsPayModalOpen(false);
      setSelectedExpense(null);
      fetchData(); // Refresh UI
    } else {
      alert("Error marking as paid.");
    }
  };

  const ExpenseCard = ({ exp }: { exp: any }) => {
    const isPaid = exp.status === 'PAID';
    return (
      <div className={`p-4 rounded-2xl border transition-all ${isPaid ? 'border-border/50 bg-muted/10 opacity-70' : 'border-border bg-card shadow-sm hover:border-primary/50'}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`font-bold ${isPaid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{exp.expense_name}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 font-mono">
              <Calendar size={12} /> {exp.due_date ? `Due: ${exp.due_date}` : new Date(exp.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className={`font-black font-mono ${isPaid ? 'text-muted-foreground' : 'text-primary'}`}>
            ₹{parseFloat(exp.amount).toLocaleString()}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
          <span className={`text-sm font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {exp.status}
          </span>
          
          {!isPaid ? (
            <button 
              onClick={() => handleMarkPaidClick(exp)}
              className="text-sm font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:shadow-md transition-all flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Mark Paid
            </button>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center gap-1 font-mono">
              <Wallet size={12} /> {exp.payment_mode} - {exp.paid_date}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Receipt className="text-primary" size={32} /> Factory Expenses
          </h1>
          <p className="text-muted-foreground mt-2">Manage daily overheads and permanent fixed costs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-muted/80 transition-all border border-border"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus size={20} /> Record Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground font-semibold">Loading expenses...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Daily Overheads */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h2 className="text-xl font-bold text-foreground">Daily Overheads</h2>
            </div>
            
            {daily.length === 0 ? (
              <p className="text-muted-foreground text-sm border border-dashed border-border p-6 rounded-2xl text-center">No daily expenses recorded.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {daily.map(exp => <ExpenseCard key={exp.id} exp={exp} />)}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Permanent Expenses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-foreground">Permanent / Fixed Costs</h2>
            </div>
            
            {permanent.length === 0 ? (
              <p className="text-muted-foreground text-sm border border-dashed border-border p-6 rounded-2xl text-center">No permanent expenses recorded.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {permanent.map(exp => <ExpenseCard key={exp.id} exp={exp} />)}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Record Expense Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80  p-4 animate-in fade-in">
          <div className="bg-background border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Plus size={20} className="text-primary" /> New Expense
              </h2>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRecordSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase">Expense Name</label>
                <input 
                  type="text" 
                  value={formData.expense_name}
                  onChange={e => setFormData({...formData, expense_name: e.target.value})}
                  placeholder="e.g. Factory Rent, Tea/Coffee"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition-colors outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition-colors outline-none font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition-colors outline-none"
                  >
                    <option value="DAILY" className="text-black">Daily Overhead</option>
                    <option value="PERMANENT" className="text-black">Permanent / Fixed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase">Due Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-primary transition-colors outline-none"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full px-4 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-md">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {isPayModalOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80  p-4 animate-in fade-in">
          <div className="bg-background border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-lg font-bold text-foreground">Mark as Paid</h2>
              <button onClick={() => setIsPayModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Paying for {selectedExpense.expense_name}</p>
                <p className="text-3xl font-black font-mono text-primary">₹{parseFloat(selectedExpense.amount).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase text-center block">Select Payment Mode</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['CASH', 'UPI', 'BANK'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 rounded-lg text-sm font-bold border transition-colors ${paymentMode === mode ? 'bg-primary border-primary text-white' : 'bg-muted border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={submitPayment} className="w-full px-4 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-md">
                <CheckCircle2 size={18} /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
