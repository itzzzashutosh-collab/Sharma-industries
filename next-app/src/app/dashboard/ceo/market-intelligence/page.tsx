import { createClient } from "@/utils/supabase/server";
import { MarketIntelligenceClient } from "./MarketIntelligenceClient";

export const metadata = {
  title: "Market Intelligence | Sharma ERP",
};

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

  // Map competitor products to the dealers who are buying them (using invoices)
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

  return (
    <MarketIntelligenceClient
      dealerPerformance={dealerPerformance}
      competitorSpyData={competitorSpyData}
      heatmapData={heatmapData}
    />
  );
}
