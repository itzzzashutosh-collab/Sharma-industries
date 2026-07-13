import type { Metadata } from "next";
import SalesmanOrdersClient from "./SalesmanOrdersClient";
import { getSalesmanDashboardData } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Order Pipeline | Sales Executive" };
}

export default async function Page() {
  const res = await getSalesmanDashboardData();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        <p className="font-bold text-red-500">Failed to load order book</p>
        <p className="mt-1">{res.error}</p>
      </div>
    );
  }

  // Pre-seed dynamic mock orders list matching search
  const orders = [
    {
      id: "ORD-9481",
      date: new Date().toISOString().slice(0, 10),
      dealer_name: (res.dealers && res.dealers[0]?.name) || "Shree Ram Paints",
      total_amount: 45000,
      payment_terms: "30 Days Credit",
      status: "Pending Approval",
      order_items: [
        { id: "1", product_name: "Swatch Rustic Royale", size: "20L", quantity: 5, unit_price: 6500, stock_status: "In Stock" },
        { id: "2", product_name: "Swatch Shine Emulsion", size: "10L", quantity: 5, unit_price: 2375, stock_status: "In Stock" }
      ]
    }
  ];

  const payload = {
    dealers: res.dealers || [],
    orders
  };

  return <SalesmanOrdersClient initialData={payload} />;
}
