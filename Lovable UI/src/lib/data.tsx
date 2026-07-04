import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  reorder: number;
  hsn?: string;
};

export type Dealer = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  city: string;
  gstin: string;
  balance: number;
};

export type InvoiceItem = {
  productId: string;
  name: string;
  qty: number;
  rate: number;
  hsn?: string;
  unit?: string;
};

export type Invoice = {
  id: string;
  number: string;
  dealerId: string;
  dealerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal?: number;
  taxTotal?: number;
  total: number;
  status: "paid" | "pending" | "partial";
  template?: string;
  notes?: string;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  joinDate: string;
  status: "active" | "inactive";
};

export type Purchase = {
  id: string;
  date: string;
  supplier: string;
  item: string;
  amount: number;
  status: "paid" | "pending";
};

export type LedgerEntry = {
  id: string;
  date: string;
  party: string;
  type: "credit" | "debit";
  amount: number;
  note: string;
};

export type DataState = {
  products: Product[];
  dealers: Dealer[];
  invoices: Invoice[];
  expenses: Expense[];
  employees: Employee[];
  purchases: Purchase[];
  ledger: LedgerEntry[];
};

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const seed: DataState = {
  products: [
    { id: "p1", name: "Premium Emulsion White", sku: "EMU-WHT-20L", category: "Interior Emulsion", unit: "20L Bucket", price: 4200, stock: 180, reorder: 50, hsn: "3209" },
    { id: "p2", name: "Weather Shield Exterior", sku: "EXT-WS-10L", category: "Exterior", unit: "10L Bucket", price: 3800, stock: 42, reorder: 50, hsn: "3209" },
    { id: "p3", name: "Enamel Gloss Black", sku: "ENM-BLK-4L", category: "Enamel", unit: "4L Can", price: 1450, stock: 320, reorder: 80, hsn: "3208" },
    { id: "p4", name: "Wood Primer", sku: "PRM-WD-1L", category: "Primer", unit: "1L Can", price: 480, stock: 18, reorder: 40, hsn: "3208" },
    { id: "p5", name: "Distemper Ivory", sku: "DST-IVY-5KG", category: "Distemper", unit: "5Kg Bag", price: 620, stock: 250, reorder: 60, hsn: "3210" },
    { id: "p6", name: "Metal Primer Red Oxide", sku: "PRM-MTL-4L", category: "Primer", unit: "4L Can", price: 980, stock: 95, reorder: 30, hsn: "3208" },
  ],
  dealers: [
    { id: "d1", name: "Agarwal Paints", contact: "Rohit Agarwal", phone: "98290 11223", city: "Jaipur", gstin: "08ABCDE1234F1Z5", balance: 84500 },
    { id: "d2", name: "Shree Hardware", contact: "Mahesh Gupta", phone: "99280 44556", city: "Jodhpur", gstin: "08PQRST5678G2Z1", balance: 12000 },
    { id: "d3", name: "Maa Color House", contact: "Suresh Jain", phone: "94140 77889", city: "Udaipur", gstin: "08LMNOP9012H3Z9", balance: 0 },
    { id: "d4", name: "Royal Decor", contact: "Anil Sharma", phone: "90010 33445", city: "Ajmer", gstin: "08UVWXY3456J4Z3", balance: 31200 },
  ],
  invoices: [
    { id: "i1", number: "INV-1042", dealerId: "d1", dealerName: "Agarwal Paints", date: daysAgo(2), items: [{ productId: "p1", name: "Premium Emulsion White", qty: 10, rate: 4200 }], total: 49560, status: "pending" },
    { id: "i2", number: "INV-1041", dealerId: "d3", dealerName: "Maa Color House", date: daysAgo(5), items: [{ productId: "p3", name: "Enamel Gloss Black", qty: 20, rate: 1450 }], total: 34220, status: "paid" },
    { id: "i3", number: "INV-1040", dealerId: "d2", dealerName: "Shree Hardware", date: daysAgo(9), items: [{ productId: "p5", name: "Distemper Ivory", qty: 30, rate: 620 }], total: 21948, status: "partial" },
    { id: "i4", number: "INV-1039", dealerId: "d4", dealerName: "Royal Decor", date: daysAgo(14), items: [{ productId: "p2", name: "Weather Shield Exterior", qty: 8, rate: 3800 }], total: 35872, status: "paid" },
  ],
  expenses: [
    { id: "e1", date: daysAgo(3), category: "Electricity", amount: 48200, note: "Factory power bill" },
    { id: "e2", date: daysAgo(6), category: "Raw Material Transport", amount: 18500, note: "Pigment delivery" },
    { id: "e3", date: daysAgo(10), category: "Machine Maintenance", amount: 22000, note: "Mixer servicing" },
    { id: "e4", date: daysAgo(12), category: "Packaging", amount: 31000, note: "Buckets & labels" },
    { id: "e5", date: daysAgo(18), category: "Rent", amount: 65000, note: "Factory premises" },
  ],
  employees: [
    { id: "em1", name: "Ramesh Kumar", role: "Plant Supervisor", phone: "98765 12340", salary: 32000, joinDate: "2021-04-12", status: "active" },
    { id: "em2", name: "Sunita Devi", role: "Quality Inspector", phone: "98765 56781", salary: 26000, joinDate: "2022-08-01", status: "active" },
    { id: "em3", name: "Vikram Singh", role: "Machine Operator", phone: "98765 99012", salary: 21000, joinDate: "2023-02-15", status: "active" },
    { id: "em4", name: "Pooja Sharma", role: "Accountant", phone: "98765 33445", salary: 28000, joinDate: "2020-11-20", status: "active" },
    { id: "em5", name: "Imran Khan", role: "Loader", phone: "98765 66778", salary: 16000, joinDate: "2024-01-05", status: "inactive" },
  ],
  purchases: [
    { id: "pu1", date: daysAgo(4), supplier: "Asian Pigments Ltd", item: "Titanium Dioxide 500kg", amount: 145000, status: "paid" },
    { id: "pu2", date: daysAgo(8), supplier: "Resin Suppliers Co", item: "Acrylic Resin 1000L", amount: 210000, status: "pending" },
    { id: "pu3", date: daysAgo(15), supplier: "PackWell Industries", item: "20L Buckets x2000", amount: 76000, status: "paid" },
    { id: "pu4", date: daysAgo(22), supplier: "ChemTrade", item: "Solvents 800L", amount: 98000, status: "pending" },
  ],
  ledger: [
    { id: "l1", date: daysAgo(2), party: "Agarwal Paints", type: "debit", amount: 49560, note: "INV-1042" },
    { id: "l2", date: daysAgo(5), party: "Maa Color House", type: "credit", amount: 34220, note: "Payment received" },
    { id: "l3", date: daysAgo(8), party: "Resin Suppliers Co", type: "debit", amount: 210000, note: "Purchase pending" },
    { id: "l4", date: daysAgo(12), party: "Royal Decor", type: "credit", amount: 35872, note: "INV-1039 settled" },
  ],
};

const STORAGE_KEY = "si-erp-data-v1";

type DataCtx = {
  data: DataState;
  add: <K extends keyof DataState>(
    key: K,
    item: Omit<DataState[K][number], "id">,
  ) => void;
  update: <K extends keyof DataState>(
    key: K,
    id: string,
    patch: Partial<DataState[K][number]>,
  ) => void;
  remove: <K extends keyof DataState>(key: K, id: string) => void;
};

const DataContext = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataState>(seed);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(seed);
      }
    }
  }, []);

  const persist = useCallback((next: DataState) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback<DataCtx["add"]>(
    (key, item) => {
      setData((prev) => {
        const next = {
          ...prev,
          [key]: [{ ...item, id: uid() }, ...prev[key]],
        } as DataState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const update = useCallback<DataCtx["update"]>((key, id, patch) => {
    setData((prev) => {
      const next = {
        ...prev,
        [key]: (prev[key] as Array<{ id: string }>).map((row) =>
          row.id === id ? { ...row, ...patch } : row,
        ),
      } as DataState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback<DataCtx["remove"]>((key, id) => {
    setData((prev) => {
      const next = {
        ...prev,
        [key]: (prev[key] as Array<{ id: string }>).filter(
          (row) => row.id !== id,
        ),
      } as DataState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  void persist;

  const value = useMemo(
    () => ({ data, add, update, remove }),
    [data, add, update, remove],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
