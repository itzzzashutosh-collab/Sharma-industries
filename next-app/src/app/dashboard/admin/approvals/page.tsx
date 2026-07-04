import { createClient } from "@supabase/supabase-js";
import ApprovalsClient from "./client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
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
    // Allow for now
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch pending users
  const { data: pendingUsers } = await supabase
    .from("users")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  // Fetch painter ledger data
  const { data: ledgerData } = await supabase
    .from("painter_ledger")
    .select("*");

  // Fetch products list for QR Generator
  const { data: products } = await supabase
    .from("products")
    .select("id, product_name, token_value, package_size, package_size_unit")
    .order("product_name", { ascending: true });

  // Fetch painters for Scan Simulator & Withdrawal panel
  const { data: painters } = await supabase
    .from("painters")
    .select("id, name, total_tokens, phone")
    .order("name", { ascending: true });

  return (
    <ApprovalsClient
      initialUsers={pendingUsers || []}
      ledgerData={ledgerData || []}
      products={products || []}
      painters={painters || []}
    />
  );
}
