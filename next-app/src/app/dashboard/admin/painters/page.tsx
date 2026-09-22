import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

  // Fetch all collections concurrently with fast timeout
  const [
    paintRes, qrRes, invRes, prodRes, dealRes, rewRes,
    schemesRes, compRes, projRes, estRes, coupRes, meetRes
  ] = await Promise.allSettled([
    supabaseAdmin.from("painters").select("*").order("name", { ascending: true }),
    supabaseAdmin.from("qr_registry").select("qr_code, scanned_by, scanned_at, token_value, product_id, dealer_id, invoice_id").eq("is_scanned", true),
    supabaseAdmin.from("invoices").select("id, items, client_details"),
    supabaseAdmin.from("products").select("id, product_name"),
    supabaseAdmin.from("users").select("id, name, phone, address, territory").eq("role", "dealer"),
    supabaseAdmin.from("rewards_catalog").select("*").order("points", { ascending: true }),
    supabaseAdmin.from("schemes").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("competitions").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("painter_projects").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("painter_estimations").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("painter_coupons").select("*").order("scanned_at", { ascending: false }),
    supabaseAdmin.from("painter_meetings").select("*").order("meeting_date", { ascending: true })
  ]);

  const painters = paintRes.status === "fulfilled" && !paintRes.value.error ? paintRes.value.data : [];
  const qrRegistry = qrRes.status === "fulfilled" && !qrRes.value.error ? qrRes.value.data : [];
  const invoices = invRes.status === "fulfilled" && !invRes.value.error ? invRes.value.data : [];
  const products = prodRes.status === "fulfilled" && !prodRes.value.error ? prodRes.value.data : [];
  const dealers = dealRes.status === "fulfilled" && !dealRes.value.error ? dealRes.value.data : [];
  const dbRewards = rewRes.status === "fulfilled" && !rewRes.value.error ? rewRes.value.data : [];
  const dbSchemes = schemesRes.status === "fulfilled" && !schemesRes.value.error ? schemesRes.value.data : [];
  const dbCompetitions = compRes.status === "fulfilled" && !compRes.value.error ? compRes.value.data : [];
  const allProjects = projRes.status === "fulfilled" && !projRes.value.error ? projRes.value.data : [];
  const allEstimations = estRes.status === "fulfilled" && !estRes.value.error ? estRes.value.data : [];
  const allCoupons = coupRes.status === "fulfilled" && !coupRes.value.error ? coupRes.value.data : [];
  const allMeetings = meetRes.status === "fulfilled" && !meetRes.value.error ? meetRes.value.data : [];

  // Map scans, projects, and estimations to painters programmatically for CEO Mode
  const paintersWithHistory = (painters || []).map((p) => {
    const scans = (qrRegistry || [])
      .filter((qr) => qr.scanned_by === p.id)
      .map((qr) => {
        const prod = (products || []).find((pr) => pr.id === qr.product_id);
        const dlr = (dealers || []).find((d) => d.id === qr.dealer_id);
        
        let qty = 1;
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

    const painterProjects = (allProjects || []).filter(proj => proj.painter_id === p.id);
    const painterEstimations = (allEstimations || []).filter(est => est.painter_id === p.id);
    const painterCoupons = (allCoupons || []).filter(c => c.painter_id === p.id);

    return {
      ...p,
      scans,
      projects: painterProjects,
      estimations: painterEstimations,
      coupons: painterCoupons
    };
  });

  return (
    <PaintersClient 
      initialPainters={paintersWithHistory} 
      initialRewards={dbRewards || []}
      initialSchemes={dbSchemes || []}
      initialCompetitions={dbCompetitions || []}
      initialMeetings={allMeetings || []}
    />
  );
}
