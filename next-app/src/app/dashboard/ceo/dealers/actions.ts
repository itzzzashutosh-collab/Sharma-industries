"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── 1. FETCH MASTER DEALERS ───
export async function getDealers() {
  try {
    const supabase = await createAdminClient();
    
    // First try the 'dealers' table
    const { data: dealers, error: dealersErr } = await supabase
      .from("dealers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!dealersErr && dealers && dealers.length > 0) {
      return { success: true, data: dealers };
    }

    // Fallback to 'users' table with role 'dealer'
    const { data: users, error: usersErr } = await supabase
      .from("users")
      .select("*")
      .eq("role", "dealer")
      .order("created_at", { ascending: false });

    if (usersErr) throw usersErr;

    // Normalize user records to dealer format
    const normalized = (users || []).map(u => ({
      id: u.id,
      name: u.name || u.display_name || "Partner " + u.id.slice(-4),
      address: u.address || "Pending Address",
      localities: u.territory || "Unassigned",
      designation: u.role === "dealer" ? "Dealer" : "Distributor",
      gst_number: u.gst_number || "",
      assigned_salesman_id: u.salesperson_id || "Unassigned",
      pan_card_url: "",
      aadhaar_front_url: "",
      aadhaar_back_url: "",
      created_at: u.created_at
    }));

    return { success: true, data: normalized };
  } catch (err: any) {
    console.error("Error in getDealers action:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─── 2. FETCH DEALER ORDERS ───
export async function getDealerOrders() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Error fetching dealer orders:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─── 3. APPROVE / REJECT ORDER ───
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;
    revalidatePath("/dashboard/ceo/dealers");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating order status:", err);
    return { success: false, error: err.message };
  }
}

// ─── 4. FETCH OUTSTANDING INVOICES ───
export async function getDealerOutstanding() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .neq("payment_status", "Paid")
      .order("date", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Error fetching dealer outstanding:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// ─── 5. RECORD OUTSTANDING PAYMENT ───
export async function recordOutstandingPayment(invoiceId: string, amountPaid: number, referenceNo: string, paymentMode: string) {
  try {
    const supabase = await createAdminClient();
    
    // Fetch invoice details
    const { data: inv, error: fetchErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (fetchErr || !inv) throw new Error("Invoice not found");

    const grandTotal = Number(inv.grand_total) || 0;
    const isPaidNow = amountPaid >= grandTotal;

    // Update payment status
    const { error: updateErr } = await supabase
      .from("invoices")
      .update({ 
        payment_status: isPaidNow ? "Paid" : "Partially Paid"
      })
      .eq("id", invoiceId);

    if (updateErr) throw updateErr;

    // Log to ledger_entries
    const ledgerId = `LEDGER-PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await supabase.from("ledger_entries").insert([{
      id: ledgerId,
      date: new Date().toISOString().split("T")[0],
      client_id: inv.client_id || inv.customer_id,
      credit: amountPaid,
      debit: 0,
      payment_mode: paymentMode,
      reference_no: referenceNo,
      collected_by: "CEO Office",
      is_gst_billed: true
    }]);

    revalidatePath("/dashboard/ceo/dealers");
    return { success: true };
  } catch (err: any) {
    console.error("Error recording payment:", err);
    return { success: false, error: err.message };
  }
}

// ─── 6. BASIC MANAGEMENT ACTIONS ───
export async function approveDealer(userId: string) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ is_approved: true, is_active: true })
      .eq("id", userId);

    if (error) throw error;
    revalidatePath("/dashboard/ceo/dealers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleDealerStatus(userId: string, isActive: boolean) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) throw error;
    revalidatePath("/dashboard/ceo/dealers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateDealerProfile(userId: string, data: { address: string; territory: string }) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ address: data.address, territory: data.territory })
      .eq("id", userId);

    if (error) throw error;
    revalidatePath("/dashboard/ceo/dealers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerInvoices(dealerId: string) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", dealerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Error fetching dealer invoices:", err);
    return [];
  }
}

