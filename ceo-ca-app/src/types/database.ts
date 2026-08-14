export interface CompanyDetails {
  id: string;
  company_name: string;
  address: string;
  state_code: string;
  gstin: string | null;
  phone: string | null;
  bank_details: {
    bank_name: string;
    ac_number: string;
    ifsc: string;
    upi_id: string;
  } | null;
  signature_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  gstin: string | null;
  address: string | null;
  state_code: string | null;
  pincode: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientDetailsSnapshot {
  name: string;
  phone: string;
  gstin: string;
  address: string;
  state_code: string;
  pincode: string;
}

export interface InvoiceItem {
  product_id?: string;
  name: string;
  hsn_code: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface TaxBreakdown {
  cgst: number;
  sgst: number;
  igst: number;
}

export interface TransportDetails {
  transport_mode: string;
  vehicle_no: string;
  transport_date: string;
  destination: string;
  is_same_as_billing: boolean;
}

export interface PaymentTerms {
  payment_mode: string;
  advance_paid: number;
  credit_days: number;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  due_date?: string;
  client_id: string | null;
  client_details: ClientDetailsSnapshot;
  items: InvoiceItem[];
  tax_breakdown: TaxBreakdown;
  transport_details?: TransportDetails;
  payment_terms?: PaymentTerms;
  subtotal: number;
  total_tax: number;
  grand_total: number;
  balance_due?: number;
  is_tax_inclusive: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  client_id: string | null;
  payment_date: string;
  amount: number;
  payment_mode: string;
  reference_no: string | null;
  created_at?: string;
}

export interface LedgerEntry {
  id: string;
  client_id: string | null;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  created_at?: string;
}
