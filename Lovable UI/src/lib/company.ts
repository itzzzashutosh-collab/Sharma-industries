import type { Dealer, InvoiceItem } from "@/lib/data";

/** Seller / company details shown on every GST invoice. */
export const COMPANY = {
  name: "Sharma Industries",
  tagline: "Paint Manufacturing Co.",
  address: "Plot 14-16, Industrial Area Phase II, Jaipur, Rajasthan 302013",
  gstin: "08ABCDS1234A1Z2",
  stateName: "Rajasthan",
  stateCode: "08",
  pan: "ABCDS1234A",
  phone: "+91 98290 00000",
  email: "accounts@sharmaindustries.in",
  bankName: "HDFC Bank",
  bankAccount: "50200012345678",
  bankIfsc: "HDFC0000123",
};

export const GST_RATE = 0.18; // 18% total for paints

export type GstBreakdown = {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxTotal: number;
  grandTotal: number;
  roundOff: number;
  interState: boolean;
  rate: number; // percent
};

/** Compute GST split based on the buyer's state vs the company state. */
export function computeGst(
  items: InvoiceItem[],
  dealer?: Dealer | null,
): GstBreakdown {
  const subtotal = items.reduce((s, l) => s + l.qty * l.rate, 0);
  const dealerState = (dealer?.gstin || "").slice(0, 2);
  const interState = dealerState !== "" && dealerState !== COMPANY.stateCode;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (interState) {
    igst = subtotal * GST_RATE;
  } else {
    cgst = subtotal * (GST_RATE / 2);
    sgst = subtotal * (GST_RATE / 2);
  }
  const taxTotal = cgst + sgst + igst;
  const rawTotal = subtotal + taxTotal;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  return {
    subtotal,
    cgst,
    sgst,
    igst,
    taxTotal,
    grandTotal,
    roundOff,
    interState,
    rate: GST_RATE * 100,
  };
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let out = "";
  if (hundred) out += `${ONES[hundred]} Hundred`;
  if (rest) out += `${hundred ? " " : ""}${twoDigits(rest)}`;
  return out;
}

/** Indian numbering system amount in words (e.g. "One Lakh Twenty Thousand Rupees Only"). */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  let words = parts.join(" ").trim();
  words = words ? `${words} Rupees` : "Rupees";
  if (paise) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
}
