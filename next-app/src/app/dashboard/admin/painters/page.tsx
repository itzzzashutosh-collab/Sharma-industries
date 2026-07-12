import { createClient } from "@supabase/supabase-js";
import PaintersClient from "./client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PaintersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("si_session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  if (session.role !== "ceo" && session.role !== "admin") {
    // Allow for now, redirect if needed
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all painters
  const { data: painters, error: paintersErr } = await supabase
    .from("painters")
    .select("*")
    .order("name", { ascending: true });

  if (paintersErr) {
    console.error("Error fetching painters:", paintersErr);
  }

  // Fetch scanned QR registry entries
  const { data: qrRegistry, error: qrErr } = await supabase
    .from("qr_registry")
    .select("qr_code, scanned_by, scanned_at, token_value, product_id, dealer_id, invoice_id")
    .eq("is_scanned", true);

  if (qrErr) {
    console.error("Error fetching qrRegistry:", qrErr);
  }

  // Fetch all invoices
  const { data: invoices, error: invErr } = await supabase
    .from("invoices")
    .select("id, items, client_details");

  if (invErr) {
    console.error("Error fetching invoices:", invErr);
  }

  // Fetch all products for lookup
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, product_name");

  if (prodErr) {
    console.error("Error fetching products:", prodErr);
  }

  // Fetch all dealers for lookup
  const { data: dealers, error: dealersErr } = await supabase
    .from("users")
    .select("id, name, phone, address, territory")
    .eq("role", "dealer");

  if (dealersErr) {
    console.error("Error fetching dealers:", dealersErr);
  }

  // Fetch rewards catalog
  const { data: dbRewards, error: rewardsErr } = await supabase
    .from("rewards_catalog")
    .select("*")
    .order("points", { ascending: true });

  if (rewardsErr) {
    console.error("Error fetching rewards:", rewardsErr);
  }

  // Fetch schemes
  const { data: dbSchemes, error: schemesErr } = await supabase
    .from("schemes")
    .select("*")
    .order("created_at", { ascending: false });

  if (schemesErr) {
    console.error("Error fetching schemes:", schemesErr);
  }

  // Fetch competitions
  const { data: dbCompetitions, error: compErr } = await supabase
    .from("competitions")
    .select("*")
    .order("created_at", { ascending: false });

  if (compErr) {
    console.error("Error fetching competitions:", compErr);
  }

  // Map scans to painters programmatically
  const paintersWithHistory = (painters || []).map((p) => {
    const scans = (qrRegistry || [])
      .filter((qr) => qr.scanned_by === p.id)
      .map((qr) => {
        const prod = (products || []).find((pr) => pr.id === qr.product_id);
        const dlr = (dealers || []).find((d) => d.id === qr.dealer_id);
        
        // Find quantity from invoice if available
        let qty = 1; // Default fallback
        if (qr.invoice_id) {
          const inv = (invoices || []).find((i) => i.id === qr.invoice_id);
          if (inv && inv.items && Array.isArray(inv.items)) {
            const matchedItem = inv.items.find((item: any) => item.id === qr.product_id);
            if (matchedItem && matchedItem.qty) {
              qty = Number(matchedItem.qty);
            }
          }
        }

        return {
          qr_code: qr.qr_code,
          scanned_at: qr.scanned_at,
          token_value: qr.token_value,
          product_name: prod ? prod.product_name : "Unknown Product",
          invoice_qty: qty,
          dealer_name: dlr ? dlr.name : "Direct Scan / Unknown Dealer",
          dealer_phone: dlr ? dlr.phone : "N/A",
          dealer_address: dlr ? (dlr.address || "No address listed") : "N/A",
          dealer_locality: dlr ? (dlr.territory || "No locality listed") : "N/A"
        };
      });

    return {
      ...p,
      scans
    };
  });

  return (
    <PaintersClient 
      initialPainters={paintersWithHistory} 
      initialRewards={dbRewards || []}
      initialSchemes={dbSchemes || []}
      initialCompetitions={dbCompetitions || []}
    />
  );
}
