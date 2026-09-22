import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

  // Fetch pending users, ledger, products, painters concurrently
  const [userRes, ledgRes, prodRes, paintRes] = await Promise.allSettled([
    supabaseAdmin.from("users").select("*").eq("status", "PENDING").order("created_at", { ascending: false }),
    supabaseAdmin.from("painter_ledger").select("*"),
    supabaseAdmin.from("products").select("id, product_name, token_value, package_size, package_size_unit").order("product_name", { ascending: true }),
    supabaseAdmin.from("painters").select("id, name, total_tokens, phone").order("name", { ascending: true })
  ]);

  const pendingUsers = userRes.status === "fulfilled" && !userRes.value.error ? userRes.value.data : [];
  const ledgerData = ledgRes.status === "fulfilled" && !ledgRes.value.error ? ledgRes.value.data : [];
  const products = prodRes.status === "fulfilled" && !prodRes.value.error ? prodRes.value.data : [];
  const painters = paintRes.status === "fulfilled" && !paintRes.value.error ? paintRes.value.data : [];

  return (
    <ApprovalsClient
      initialUsers={pendingUsers || []}
      ledgerData={ledgerData || []}
      products={products || []}
      painters={painters || []}
    />
  );
}
