import { createClient } from "@/utils/supabase/server";
import { MarketIntelligenceClient } from "./MarketIntelligenceClient";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: "Market Intelligence | Sharma ERP",
  };
}
export const dynamic = "force-dynamic";

export default async function MarketIntelligence() {
  const supabase = await createClient();

  // 1. Fetch Approved Dealers
  const { data: dealers } = await supabase
    .from("users")
    .select("id, name, phone, territory")
    .eq("role", "dealer")
    .eq("is_approved", true);

  // 2. Fetch Invoices for revenue and udhaar
  const { data: invoices } = await supabase
    .from("invoices")
    .select("customer_id, grand_total, balance_due, items");

  // 3. Fetch Competitor Products
  const { data: rawCompetitorProducts } = await supabase
    .from("competitor_products")
    .select("*");

  // 4. Fetch Fleet, Dispatches and Routes
  const { data: dbVehicles } = await supabase.from("fleet_vehicles").select("*");
  const { data: dbDispatches } = await supabase.from("delivery_dispatches").select("*");
  const { data: dbRoutes } = await supabase.from("delivery_routes").select("*");

  // Aggregate dealer performance
  const dealerPerformance =
    dealers
      ?.map((dealer) => {
        const dealerInvoices = invoices?.filter((inv) => inv.customer_id === dealer.id) || [];
        const totalRevenue = dealerInvoices.reduce(
          (sum, inv) => sum + (Number(inv.grand_total) || 0),
          0
        );
        const outstanding = dealerInvoices.reduce(
          (sum, inv) => sum + (Number(inv.balance_due) || 0),
          0
        );

        // Calculate Top Product
        const productCounts: Record<string, number> = {};
        dealerInvoices.forEach(inv => {
           if (inv.items && Array.isArray(inv.items)) {
             inv.items.forEach((item: any) => {
                if (item.name) {
                   productCounts[item.name] = (productCounts[item.name] || 0) + (Number(item.qty || item.quantity) || 1);
                }
             });
           }
        });
        
        let topProduct = "None";
        let maxCount = 0;
        for (const [name, count] of Object.entries(productCounts)) {
          if (count > maxCount) {
            maxCount = count;
            topProduct = name;
          }
        }

        const territory = dealer.territory || "Unknown Territory";

        return {
          ...dealer,
          totalRevenue,
          outstanding,
          mockPincode: territory,
          mockTopProduct: topProduct,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue) || [];

  // Real Heatmap Data based on Territories
  const territorySales: Record<string, number> = {};
  dealerPerformance.forEach(dp => {
    if (dp.totalRevenue > 0 && dp.mockPincode !== "Unknown Territory") {
      territorySales[dp.mockPincode] = (territorySales[dp.mockPincode] || 0) + dp.totalRevenue;
    }
  });

  const sortedTerritories = Object.entries(territorySales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5 regions

  const maxSales = sortedTerritories.length > 0 ? sortedTerritories[0][1] : 1;

  const heatmapData = sortedTerritories.map(([location, sales]) => {
     const salesText = sales >= 100000 ? `₹${(sales/100000).toFixed(1)}L` : `₹${sales.toLocaleString()}`;
     const widthPercent = Math.max(5, Math.round((sales / maxSales) * 100));
     return {
       location,
       sales: salesText,
       intensity: "bg-primary",
       width: `${widthPercent}%`,
     };
  });

  if (heatmapData.length === 0) {
    heatmapData.push({
      location: "No Sales Data",
      sales: "₹0",
      intensity: "bg-primary",
      width: "5%",
    });
  }

  // Map competitor products
  const competitorSpyData: any[] = [];
  if (rawCompetitorProducts && invoices && dealers) {
    rawCompetitorProducts.forEach((cp) => {
      let totalQty = 0;
      let soldByDealerIds = new Set<string>();
      
      invoices.forEach(inv => {
        if (inv.items && Array.isArray(inv.items)) {
          inv.items.forEach((item: any) => {
            if (item.productId === cp.id || item.product_id === cp.id) {
              totalQty += Number(item.qty || item.quantity) || 0;
              if (inv.customer_id) {
                soldByDealerIds.add(inv.customer_id);
              }
            }
          });
        }
      });
      
      const sellingPrice = Number(cp.mrp) || 0;
      const mfgCost = sellingPrice * 0.7; // Estimated manufacturing cost
      const margin = sellingPrice - mfgCost;
      const marginPercent = mfgCost > 0 ? (margin / mfgCost) * 100 : 0;
      
      const dealerNames = Array.from(soldByDealerIds).map(id => {
         const d = dealers.find(d => d.id === id);
         return d ? d.name : "Unknown Retailer";
      });

      competitorSpyData.push({
        id: cp.id,
        name: `[${cp.brand}] ${cp.product_name} ${cp.pack_size || ""}`.trim(),
        purchase_price: mfgCost.toFixed(2),
        selling_price: sellingPrice,
        dealerName: dealerNames.length > 0 ? dealerNames.join(", ") : "No Sales Yet",
        margin,
        marginPercent,
        owner_id: "",
        sentiment: cp.sentiment,
        totalQtySold: totalQty
      });
    });
  }

  // Map fleet vehicles, dispatches, and routes
  const vehicles = dbVehicles ? dbVehicles.map((v: any) => ({
    id: v.id,
    plateNumber: v.plate_number || "",
    driverName: v.driver_name || "",
    driverPhone: v.driver_phone || "",
    type: v.vehicle_type || "",
    status: v.status || "Idle",
    capacity: v.capacity || "",
    currentRoute: v.current_route || "Unassigned"
  })) : [];

  const dispatches = dbDispatches ? dbDispatches.map((d: any) => ({
    id: d.id,
    dealerName: d.dealer_name || "",
    location: d.location || "",
    items: d.items || "",
    value: Number(d.value) || 0,
    vehiclePlate: d.vehicle_plate || "",
    status: d.status || "Pending",
    date: d.dispatch_date || ""
  })) : [];

  const routes = dbRoutes ? dbRoutes.map((r: any) => ({
    id: r.id,
    name: r.route_name || "",
    stopsCount: Number(r.stops_count) || 0,
    mappedDealers: r.mapped_dealers || [],
    assignedVehicle: r.assigned_vehicle || "",
    progress: Number(r.progress) || 0
  })) : [];

  return (
    <MarketIntelligenceClient
      dealerPerformance={dealerPerformance}
      competitorSpyData={competitorSpyData}
      heatmapData={heatmapData}
      initialVehicles={vehicles}
      initialDispatches={dispatches}
      initialRoutes={routes}
    />
  );
}
