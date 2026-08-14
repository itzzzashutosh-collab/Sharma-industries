import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch all invoices
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("date, subtotal, cgst, sgst, igst");
      
    if (error) throw error;

    // Group by month
    const monthlyData: Record<string, any> = {};

    if (invoices) {
      invoices.forEach(inv => {
        const dateStr = inv.date || "";
        if (!dateStr) return;
        
        // Format: YYYY-MM
        const monthKey = dateStr.substring(0, 7);
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            total_taxable: 0,
            total_cgst: 0,
            total_sgst: 0,
            total_igst: 0,
            invoice_count: 0
          };
        }

        monthlyData[monthKey].invoice_count += 1;
        monthlyData[monthKey].total_taxable += Number(inv.subtotal || 0);
        
        monthlyData[monthKey].total_cgst += Number(inv.cgst || 0);
        monthlyData[monthKey].total_sgst += Number(inv.sgst || 0);
        monthlyData[monthKey].total_igst += Number(inv.igst || 0);
      });
    }

    // Convert to sorted array (newest month first)
    const sortedData = Object.values(monthlyData).sort((a: any, b: any) => 
      b.month.localeCompare(a.month)
    );

    return NextResponse.json({ success: true, data: sortedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
