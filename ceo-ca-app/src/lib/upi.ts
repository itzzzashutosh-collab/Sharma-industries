// Helper for Dealer UPI ID configuration and dynamic UPI Payment QR Generation

export function getDealerUPIConfig() {
  if (typeof window === "undefined") {
    return {
      upiId: "sharmadealer@upi",
      payeeName: "Sharma Paint Traders",
      bankName: "HDFC Bank",
      accountNumber: "5010023456789",
      ifscCode: "HDFC0001234",
    };
  }
  const upiId = localStorage.getItem("dealer_upi_id") || "sharmadealer@upi";
  const payeeName = localStorage.getItem("dealer_payee_name") || "Sharma Paint Traders";
  const bankName = localStorage.getItem("dealer_bank_name") || "HDFC Bank";
  const accountNumber = localStorage.getItem("dealer_account_no") || "5010023456789";
  const ifscCode = localStorage.getItem("dealer_ifsc_code") || "HDFC0001234";

  return { upiId, payeeName, bankName, accountNumber, ifscCode };
}

export function saveDealerUPIConfig(config: {
  upiId: string;
  payeeName: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}) {
  if (typeof window === "undefined") return;
  if (config.upiId) localStorage.setItem("dealer_upi_id", config.upiId);
  if (config.payeeName) localStorage.setItem("dealer_payee_name", config.payeeName);
  if (config.bankName !== undefined) localStorage.setItem("dealer_bank_name", config.bankName);
  if (config.accountNumber !== undefined) localStorage.setItem("dealer_account_no", config.accountNumber);
  if (config.ifscCode !== undefined) localStorage.setItem("dealer_ifsc_code", config.ifscCode);
}

export function generateUPIPaymentURI(upiId: string, payeeName: string, amount: number, note: string) {
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim() || "Paint Purchase Bill");
  const formattedAmt = amount > 0 ? amount.toFixed(2) : "";
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}${formattedAmt ? `&am=${formattedAmt}` : ""}&cu=INR&tn=${cleanNote}`;
}

export function getUPIQRCodeURL(upiUri: string, size = 250) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUri)}`;
}
