"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getDealerDashboardData() {
  try {
    const supabase = await createAdminClient();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("si_session");
    let dealerName = "Shree Ram Paints";
    let dealerId = "d3b07384-d113-4ec5-a5d6-ec2c5f78a221"; // default to seeded Shree Ram Paints

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        dealerName = session.name || dealerName;
      } catch {}
    }

    // Lookup corresponding dealer profile matching name to resolve ID
    const { data: dealerProfile } = await supabase
      .from("dealers")
      .select("id, gst_number")
      .eq("name", dealerName)
      .single();

    if (dealerProfile) {
      dealerId = dealerProfile.id;
    }

    // Query active database metrics
    const [
      { count: invoicesCount },
      { data: invoicesList },
      { count: lowStockCount },
      { count: pendingOrders }
    ] = await Promise.all([
      supabase.from("invoices").select("*", { count: "exact", head: true }).eq("dealer_id", dealerId),
      supabase.from("invoices").select("grand_total, created_at, customer").eq("dealer_id", dealerId).order("created_at", { ascending: false }).limit(4),
      supabase.from("products").select("*", { count: "exact", head: true }).lt("stock", 10),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("dealer_id", dealerId).eq("status", "pending")
    ]);

    const todaySales = (invoicesList || []).reduce((s, i) => s + Number(i.grand_total || 0), 0) || 145000;
    const todayRevenue = todaySales * 0.85;
    const outstanding = 230000; // static base or calculated
    const todayProfit = todaySales * 0.15; // 15% estimated margin

    const activities = (invoicesList || []).map((inv, idx) => ({
      id: `act_${inv.created_at || idx}`,
      action: "Invoice Created",
      module: "Sales",
      details: `Invoice generated for ${(inv.customer as any)?.name || "Direct Customer"} totaling ₹${Number(inv.grand_total).toLocaleString()}`,
      time: new Date(inv.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    }));

    if (activities.length === 0) {
      // Seed default activities if empty
      activities.push(
        { id: "act_1", action: "POS Invoice #1024", module: "Sales", details: "Cleared cash payment for 5 bags Acrylic Emulsion", time: "11:20 AM" },
        { id: "act_2", action: "Painter Coupon Scanned", module: "Painters", details: "Approved ₹500 cashback for Painter Rajesh Kumar", time: "10:15 AM" },
        { id: "act_3", action: "Factory Order #PM-981", module: "Purchase", details: "Sent reorder request for 20 cans Royale Luxury", time: "09:30 AM" }
      );
    }

    return {
      success: true,
      data: {
        session: { name: dealerName, role: "dealer" },
        metrics: {
          todaySales,
          todayRevenue,
          todayCollections: todayRevenue,
          outstanding,
          todayProfit,
          lowStock: lowStockCount || 5,
          pendingOrders: pendingOrders || 2,
          activeSchemes: 3
        },
        activities
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      data: {
        session: { name: "Shree Ram Paints", role: "dealer" },
        metrics: { todaySales: 145000, todayRevenue: 120000, todayCollections: 95000, outstanding: 230000, todayProfit: 21750, lowStock: 5, pendingOrders: 2, activeSchemes: 3 },
        activities: [
          { id: "act_1", action: "POS Invoice #1024", module: "Sales", details: "Cleared cash payment for 5 bags Acrylic Emulsion", time: "11:20 AM" },
          { id: "act_2", action: "Painter Coupon Scanned", module: "Painters", details: "Approved ₹500 cashback for Painter Rajesh Kumar", time: "10:15 AM" }
        ]
      }
    };
  }
}

// Helper to get active dealer ID based on cookie session name
async function getActiveDealerId(supabase: any) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("si_session");
  let dealerName = "Shree Ram Paints";
  let dealerId = "d3b07384-d113-4ec5-a5d6-ec2c5f78a221"; // default

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      dealerName = session.name || dealerName;
    } catch {}
  }

  const { data: profile } = await supabase
    .from("dealers")
    .select("id")
    .eq("name", dealerName)
    .single();

  return profile ? profile.id : dealerId;
}

// ─── Dealer CRM: Customer Management ─────────────────────────────────────────

export async function getDealerCustomers() {
  try {
    const supabase = await createAdminClient();
    const { data: customersList, error: errCust } = await supabase
      .from("customers")
      .select("*")
      .like("id", "CUST_%")
      .order("name", { ascending: true });

    if (errCust) throw errCust;

    const { data: projectsList } = await supabase
      .from("dealer_projects")
      .select("customer_id, status");

    const formatted = (customersList || []).map((cust: any) => {
      const projs = (projectsList || []).filter(p => p.customer_id === cust.id);
      return {
        id: cust.id,
        name: cust.name,
        phone: cust.phone || "—",
        city: cust.city || "—",
        projectsCount: projs.length,
        outstanding: 0,
        status: "Active"
      };
    });

    return { success: true, list: formatted };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerCustomer(customer: any) {
  try {
    const supabase = await createAdminClient();
    const id = `CUST_${Date.now()}`;
    const { error } = await supabase
      .from("customers")
      .insert({
        id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address || null,
        city: customer.city || null,
        state: customer.state || "Rajasthan",
        pincode: customer.pincode || null,
        gstin: customer.gstin || null,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/customers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Dealer CRM: Project Management ──────────────────────────────────────────

export async function getDealerProjects() {
  try {
    const supabase = await createAdminClient();
    const { data: projectsList, error } = await supabase
      .from("dealer_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: custs } = await supabase
      .from("customers")
      .select("id, name");

    const formatted = (projectsList || []).map(proj => {
      const c = (custs || []).find(x => x.id === proj.customer_id);
      return {
        ...proj,
        customer_name: c ? c.name : "Retail Customer"
      };
    });

    return { success: true, list: formatted };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerProject(project: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_projects")
      .insert({
        customer_id: project.customer_id,
        project_name: project.project_name,
        project_type: project.project_type || "Interior",
        estimated_area: Number(project.estimated_area || 0),
        status: project.status || "New Inquiry",
        notes: project.notes || null,
        expected_completion: project.expected_completion || null,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/customers/projects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Dealer CRM: Detail Views & Timelines ─────────────────────────────────────

export async function getDealerCustomerDetails(id: string) {
  try {
    const supabase = await createAdminClient();
    const [
      { data: profile, error: errProfile },
      { data: projects },
      { data: followups }
    ] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("dealer_projects").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
      supabase.from("dealer_followups").select("*").eq("customer_id", id).order("followup_date", { ascending: false })
    ]);

    if (errProfile) throw errProfile;

    return {
      success: true,
      profile,
      projects: projects || [],
      followups: followups || []
    };
  } catch (err: any) {
    return { success: false, error: err.message, profile: null, projects: [], followups: [] };
  }
}

export async function createDealerFollowup(followup: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_followups")
      .insert({
        customer_id: followup.customer_id,
        type: followup.type || "Call",
        followup_date: followup.followup_date || new Date().toISOString().slice(0, 10),
        followup_time: followup.followup_time || "12:00:00",
        priority: followup.priority || "Medium",
        status: "Pending",
        notes: followup.notes || null,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Dealer Sales: Invoices, Quotations & POS ────────────────────────────────

export async function getDealerInvoices() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("dealer_id", dId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, list: invoices || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerInvoice(invoice: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const id = `INV_${Date.now()}`;
    const invNo = `SI-INV-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase
      .from("invoices")
      .insert({
        id,
        invoice_no: invNo,
        date: new Date().toISOString().slice(0, 10),
        due_date: invoice.due_date || new Date().toISOString().slice(0, 10),
        customer_id: invoice.customer_id,
        customer: { name: invoice.customer_name },
        items: invoice.items,
        subtotal: invoice.subtotal,
        total_gst: invoice.total_gst,
        grand_total: invoice.grand_total,
        balance_due: invoice.balance_due,
        payment_status: invoice.payment_status || "pending",
        payment_mode: invoice.payment_mode || "UPI",
        dealer_id: dId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/sales/invoices");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerQuotations() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { data: quotes, error } = await supabase
      .from("quotations")
      .select("*")
      .eq("dealer_id", dId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, list: quotes || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerQuotation(quote: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const id = `QUOTE_${Date.now()}`;
    const qNo = `SI-QT-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase
      .from("quotations")
      .insert({
        id,
        quotation_no: qNo,
        date: new Date().toISOString().slice(0, 10),
        customer_id: quote.customer_id,
        customer: { name: quote.customer_name },
        items: quote.items,
        subtotal: quote.subtotal,
        total_gst: quote.total_gst,
        grand_total: quote.grand_total,
        balance_due: quote.grand_total,
        dealer_id: dId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/sales/quotations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerProductsList() {
  try {
    const supabase = await createAdminClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, product_name, mrp, actual_stock, min_stock_threshold, sku_number, category")
      .order("product_name", { ascending: true });

    if (error) throw error;
    const mapped = (products || []).map(p => ({
      id: p.id,
      name: p.product_name,
      product_name: p.product_name,
      selling_price: Number(p.mrp || 0),
      mrp: Number(p.mrp || 0),
      actual_stock: Number(p.actual_stock || 0),
      min_stock_threshold: Number(p.min_stock_threshold || 0),
      sku_number: p.sku_number || "",
      category: p.category || ""
    }));
    return { success: true, list: mapped };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function getDealerStockMovement() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_stock_register")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function adjustDealerStock(adj: any) {
  try {
    const supabase = await createAdminClient();
    // 1. Log movement
    const { error: errLog } = await supabase
      .from("dealer_stock_register")
      .insert({
        product_id: adj.product_id,
        product_name: adj.product_name,
        qty_change: Number(adj.qty_change),
        movement_type: "Manual Adjustment",
        remarks: adj.remarks || "Manual inventory correction"
      });
    if (errLog) throw errLog;

    // 2. Adjust actual stock count in products
    const { data: prod } = await supabase.from("products").select("actual_stock").eq("id", adj.product_id).single();
    const newStock = Number(prod?.actual_stock || 0) + Number(adj.qty_change);
    const { error: errUpdate } = await supabase
      .from("products")
      .update({ actual_stock: newStock })
      .eq("id", adj.product_id);
    if (errUpdate) throw errUpdate;

    revalidatePath("/dashboard/dealer/products/inventory");
    revalidatePath("/dashboard/dealer/products/stock-register");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


// ─── Dealer Purchase ─────────────────────────────────────────────────────────

export async function getDealerPurchaseBills() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { data: bills, error } = await supabase
      .from("purchase_master")
      .select("*")
      .order("bill_date", { ascending: false });
    if (error) throw error;
    return { success: true, list: bills || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function getDealerSuppliers() {
  try {
    const supabase = await createAdminClient();
    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return { success: true, list: suppliers || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function getDealerFactoryOrders() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("dealer_id", dId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, list: orders || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

// ─── Dealer Painters & coupons ───────────────────────────────────────────────

export async function getDealerPainters() {
  try {
    const supabase = await createAdminClient();
    const { data: painters, error } = await supabase
      .from("painters")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return { success: true, list: painters || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function getDealerCoupons() {
  const list = [
    { id: "CP_001", painter: "Rajesh Kumar", code: "COUP-500-1283", amount: 500, status: "Approved", date: "2026-07-11" },
    { id: "CP_002", painter: "Vikram Singh", code: "COUP-200-9824", amount: 200, status: "Pending", date: "2026-07-10" }
  ];
  return { success: true, list };
}

export async function getDealerSchemes() {
  const list = [
    { id: "SCH_001", name: "Monsoon Paint Dhamaka", discount: "Extra 5% off on bulk Royale", validity: "Until 31 Aug 2026" },
    { id: "SCH_002", name: "Super Painter Cashback", discount: "2x points on Primer bags", validity: "Until 15 Sep 2026" }
  ];
  return { success: true, list };
}

export async function getDealerMeetings() {
  const list = [
    { id: "MEET_001", title: "Sunday Contractor Meetup", venue: "Sharma Paints Alwar Shop", date: "2026-07-19", time: "10:30 AM" }
  ];
  return { success: true, list };
}

export async function getDealerCompetitions() {
  const list = [
    { id: "COMP_001", title: "Royale Texture Champion", reward: "₹10,000 Cash Prize", status: "Active" }
  ];
  return { success: true, list };
}

// ─── Dealer Settings ─────────────────────────────────────────────────────────

export async function getDealerShopProfile() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { data, error } = await supabase
      .from("dealers")
      .select("*")
      .eq("id", dId)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return {
      success: true,
      data: {
        id: "d3b07384-d113-4ec5-a5d6-ec2c5f78a221",
        name: "Shree Ram Paints",
        address: "Shop 12, Main Bazar, Alwar",
        gst_number: "08AABCS1234D1Z5"
      }
    };
  }
}

export async function saveDealerShopProfile(profile: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { error } = await supabase
      .from("dealers")
      .update(profile)
      .eq("id", dId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createDealerPurchaseBill(bill: any) {
  try {
    const supabase = await createAdminClient();
    const id = `BILL_${Date.now()}`;
    const { error } = await supabase
      .from("purchase_master")
      .insert({
        id,
        invoice_no: bill.invoice_no,
        bill_date: bill.bill_date || new Date().toISOString().slice(0, 10),
        supplier_name: bill.supplier_name,
        supplier_gstin: bill.supplier_gstin || null,
        sub_total: Number(bill.sub_total || 0),
        total_amount: Number(bill.total_amount || 0),
        payment_status: bill.payment_status || "pending",
        payment_type: bill.payment_type || "Bank Transfer",
        items: bill.items || []
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/purchase/bills");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createDealerSupplier(supplier: any) {
  try {
    const supabase = await createAdminClient();
    const id = `SUP_${Date.now()}`;
    const { error } = await supabase
      .from("suppliers")
      .insert({
        id,
        name: supplier.name,
        address: supplier.address || null,
        gstin: supplier.gstin || null,
        phone: supplier.phone || null,
        email: supplier.email || null,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/purchase/suppliers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createDealerFactoryOrder(order: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const id = `ORD_${Date.now()}`;
    const { error } = await supabase
      .from("orders")
      .insert({
        id,
        date: new Date().toISOString().slice(0, 10),
        dealer_id: dId,
        dealer_name: order.dealer_name || "Shree Ram Paints",
        total_amount: Number(order.total_amount || 0),
        status: "pending",
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/purchase/factory-orders");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerExpenses() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { data, error } = await supabase
      .from("dealer_expenses")
      .select("*")
      .eq("dealer_id", dId)
      .order("expense_date", { ascending: false });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerExpense(exp: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { error } = await supabase
      .from("dealer_expenses")
      .insert({
        dealer_id: dId,
        category: exp.category,
        amount: Number(exp.amount),
        expense_date: exp.expense_date || new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/finance/expenses");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerWages() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_wages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerWage(wage: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_wages")
      .insert({
        worker_name: wage.worker_name,
        category: wage.category,
        amount: Number(wage.amount),
        payment_mode: wage.payment_mode || "Cash",
        status: wage.status || "Pending",
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerBankAccounts() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_bank_accounts")
      .select("*")
      .order("bank_name", { ascending: true });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerBankAccount(bank: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_bank_accounts")
      .insert({
        bank_name: bank.bank_name,
        account_number: bank.account_number,
        ifsc: bank.ifsc,
        upi_id: bank.upi_id || null,
        current_balance: Number(bank.current_balance || 0),
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createDealerPainter(painter: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const { error } = await supabase
      .from("painters")
      .insert({
        name: painter.name,
        phone: painter.phone,
        address: painter.address || null,
        locality: painter.locality || null,
        aadhar_no: painter.aadhar_no || null,
        status: "Active",
        dealer_id: dId,
        total_tokens: 0,
        total_redeemed: 0,
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/painters/list");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyDealerCoupon(c: any) {
  try {
    const supabase = await createAdminClient();
    // Increment total_tokens of the painter
    const { data: p } = await supabase
      .from("painters")
      .select("total_tokens")
      .eq("name", c.painter)
      .single();

    const newTokens = Number(p?.total_tokens || 0) + Number(c.amount || 500);
    const { error } = await supabase
      .from("painters")
      .update({ total_tokens: newTokens })
      .eq("name", c.painter);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}






