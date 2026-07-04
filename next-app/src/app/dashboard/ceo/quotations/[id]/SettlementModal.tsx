"use client";

import { useState } from "react";
import { markQuotationAsPaid } from "./actions";
import { X, Landmark, Check } from "lucide-react";

export function SettlementModal({ quotation, onClose, onSuccess }: { quotation: any, onClose: () => void, onSuccess: () => void }) {
  const [amount, setAmount] = useState(quotation.balance_due.toString());
  const [mode, setMode] = useState("Bank");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSettle = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > quotation.balance_due) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    const res = await markQuotationAsPaid(quotation.id, val, mode, notes);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      alert(res.error || "Failed to process settlement.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Landmark className="text-primary" size={20} /> Record Payment
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Amount (₹)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-bold outline-none focus:border-primary" 
              max={quotation.balance_due}
            />
            <p className="text-xs text-muted-foreground mt-1">Balance Due: ₹{quotation.balance_due}</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Payment Mode</label>
            <select 
              value={mode} 
              onChange={e => setMode(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary"
            >
              <option value="Bank">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-1">Notes / Reference No</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. UTR Number"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-primary" 
            />
          </div>

          <button 
            onClick={handleSettle}
            disabled={isSubmitting}
            className="w-full py-3 mt-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : <><Check size={18} /> Confirm Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
}
