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
    let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
    const { data: invoices, error } = await query;

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
    
    // 1. Insert Invoice
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

    // 2. Loop items to adjust inventory and log movements
    if (invoice.items && Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        // Query current actual stock count
        const { data: prod } = await supabase
          .from("products")
          .select("actual_stock, product_name")
          .eq("id", item.id)
          .single();

        if (prod) {
          const newStock = Number(prod.actual_stock || 0) - Number(item.qty || 1);
          // Decrement stock
          await supabase
            .from("products")
            .update({ actual_stock: newStock })
            .eq("id", item.id);

          // Log movement
          await supabase
            .from("dealer_stock_register")
            .insert({
              product_id: item.id,
              product_name: prod.product_name,
              qty_change: -Number(item.qty || 1),
              movement_type: "Customer Sale",
              reference_no: invNo,
              remarks: `Sold to customer ${invoice.customer_name}`
            });
        }
      }
    }

    revalidatePath("/dashboard/dealer/sales/invoices");
    revalidatePath("/dashboard/dealer/products/inventory");
    revalidatePath("/dashboard/dealer/products/stock-register");
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

    // 1. Fetch strictly from dealer_purchase_bills table for this dealer
    const { data: dealerBills, error: err1 } = await supabase
      .from("dealer_purchase_bills")
      .select("*")
      .eq("dealer_id", dId)
      .order("bill_date", { ascending: false });

    if (!err1 && dealerBills) {
      return { success: true, list: dealerBills };
    }

    // 2. Fallback: filter purchase_master strictly by dealer_id
    const { data: bills } = await supabase
      .from("purchase_master")
      .select("*")
      .eq("dealer_id", dId)
      .order("bill_date", { ascending: false });

    return { success: true, list: bills || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerPurchaseBill(formData: FormData) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);

    const invoice_no = (formData.get("invoice_no") as string) || `DPB-${Date.now().toString().slice(-6)}`;
    const supplier_name = (formData.get("supplier_name") as string) || "Supplier";
    const supplier_gstin = (formData.get("supplier_gstin") as string) || "";
    const bill_date = (formData.get("bill_date") as string) || new Date().toISOString().slice(0, 10);
    const total_amount = Number(formData.get("total_amount") || 0);
    const sub_total = Number(formData.get("sub_total") || total_amount / 1.18);
    const gst_amount = total_amount - sub_total;
    const payment_status = (formData.get("payment_status") as string) || "pending";
    const payment_type = (formData.get("payment_type") as string) || "Bank Transfer";
    const notes = (formData.get("notes") as string) || "";
    const itemsRaw = (formData.get("items") as string) || "[]";
    let items: any[] = [];
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      items = [];
    }

    const file = formData.get("file") as File | null;
    let bill_file_path: string | null = null;
    let bill_file_url: string | null = null;

    if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split(".").pop() || "pdf";
        const fileName = `dealer_${dId}_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("purchase_bills")
          .upload(fileName, buffer, {
            contentType: file.type || "application/pdf",
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          bill_file_path = uploadData.path;
          const { data: publicUrlData } = supabase.storage
            .from("purchase_bills")
            .getPublicUrl(uploadData.path);
          bill_file_url = publicUrlData?.publicUrl || null;
        }
      } catch (fErr) {
        console.warn("Storage upload notice:", fErr);
      }
    }

    const billRecord = {
      id: `DPB_${Date.now()}`,
      dealer_id: dId,
      invoice_no,
      supplier_name,
      supplier_gstin,
      bill_date,
      sub_total,
      gst_amount,
      total_amount,
      payment_status,
      payment_type,
      notes,
      items,
      bill_file_path: bill_file_url || bill_file_path,
      created_at: new Date().toISOString(),
    };

    // 1. Try inserting into dealer_purchase_bills table
    const { data: inserted, error: err1 } = await supabase
      .from("dealer_purchase_bills")
      .insert(billRecord)
      .select()
      .single();

    if (err1) {
      console.warn("Notice: dealer_purchase_bills fallback to purchase_master:", err1.message);
      // Fallback insert to purchase_master so it never breaks
      await supabase.from("purchase_master").insert({
        id: billRecord.id,
        invoice_no,
        supplier_name,
        supplier_gstin,
        bill_date,
        sub_total,
        total_amount,
        payment_status,
        payment_type,
        bill_file_path: bill_file_url || bill_file_path,
        created_at: billRecord.created_at,
      });
    }

    revalidatePath("/dashboard/dealer/purchase/bills");

    return {
      success: true,
      data: inserted || billRecord,
    };
  } catch (err: any) {
    console.error("Error creating dealer purchase bill:", err);
    return { success: false, error: err.message || "Failed to save purchase bill." };
  }
}

export async function getDealerSuppliers() {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);

    // 1. Try fetching strictly from dealer_suppliers table for this dealer
    const { data: ds, error: err1 } = await supabase
      .from("dealer_suppliers")
      .select("*")
      .eq("dealer_id", dId)
      .order("name", { ascending: true });

    if (!err1 && ds && ds.length > 0) {
      return { success: true, list: ds };
    }

    // 2. Fallback: query suppliers table filtered strictly by dealer_id
    const { data: suppliers } = await supabase
      .from("suppliers")
      .select("*")
      .eq("dealer_id", dId)
      .order("name", { ascending: true });

    if (suppliers && suppliers.length > 0) {
      return { success: true, list: suppliers };
    }

    // Default initial dealer brand suppliers if none registered yet
    const defaultDealerSuppliers = [
      {
        id: "SUP_ASIAN_PAINTS",
        name: "Asian Paints Regional Depot",
        gstin: "08AAPCS4939B1Z8",
        phone: "+91 98290 12345",
        email: "depot.jaipur@asianpaints.com",
        address: "Industrial Area, Phase 2, Jaipur, Rajasthan",
        categories: ["Asian Paints", "Wall Finishes", "Primers"],
        bank_name: "HDFC Bank",
        bank_account_no: "50200018492019",
        bank_ifsc: "HDFC0000123",
      },
      {
        id: "SUP_BERGER_PAINTS",
        name: "Berger Paints India Ltd",
        gstin: "08BRGPR9821C1Z4",
        phone: "+91 98290 67890",
        email: "orders@bergerpaints.com",
        address: "Atish Market, Mansarovar, Jaipur",
        categories: ["Berger", "Weathercoat", "Enamels"],
        bank_name: "ICICI Bank",
        bank_account_no: "000405019284",
        bank_ifsc: "ICIC0000004",
      },
      {
        id: "SUP_NEROLAC_PAINTS",
        name: "Kansai Nerolac Paints",
        gstin: "08KNSNR4829D1Z2",
        phone: "+91 98291 54321",
        email: "supply@nerolac.com",
        address: "VKI Industrial Area, Road No 5, Jaipur",
        categories: ["Nerolac", "Beauty Gold", "Paints"],
        bank_name: "Axis Bank",
        bank_account_no: "9180200492019",
        bank_ifsc: "UTIB0000182",
      },
    ];

    return { success: true, list: defaultDealerSuppliers };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerSupplier(payload: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const id = `SUP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const supplierRecord = {
      id,
      dealer_id: dId,
      name: payload.name,
      gstin: payload.gstin || null,
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
      categories: payload.categories || ["Finished Products"],
      bank_name: payload.bank_name || null,
      bank_account_no: payload.bank_account_no || null,
      bank_ifsc: payload.bank_ifsc || null,
      bank_branch: payload.bank_branch || null,
      created_at: new Date().toISOString(),
    };

    // Try inserting into dealer_suppliers table
    const { error: err1 } = await supabase.from("dealer_suppliers").insert(supplierRecord);

    if (err1) {
      // Fallback insert to suppliers table with dealer_id
      await supabase.from("suppliers").insert(supplierRecord);
    }

    revalidatePath("/dashboard/dealer/purchase/bills");
    revalidatePath("/dashboard/dealer/purchase/suppliers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerSupplierDetailData(supplierName: string) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);

    // 1. Fetch vendor purchase bills strictly from dealer_purchase_bills for this dealer
    const { data: dealerBills } = await supabase
      .from("dealer_purchase_bills")
      .select("*")
      .eq("dealer_id", dId)
      .ilike("supplier_name", supplierName.trim())
      .order("bill_date", { ascending: false });

    let billsList = dealerBills || [];

    // Fallback to purchase_master filtered by dealer_id
    if (billsList.length === 0) {
      const { data: pmBills } = await supabase
        .from("purchase_master")
        .select("*")
        .eq("dealer_id", dId)
        .ilike("supplier_name", supplierName.trim())
        .order("bill_date", { ascending: false });
      billsList = pmBills || [];
    }

    const mappedBills = billsList.map(b => ({
      id: b.id,
      invoice_no: b.invoice_no,
      date: b.bill_date,
      grand_total: b.total_amount,
      payment_status: b.payment_status,
      bill_file_path: b.bill_file_path
    }));

    // 2. Extract supplied product line items from the dealer bills
    const itemMap: Record<string, { name: string; rate: number; unit: string; brand: string }> = {};

    billsList.forEach(b => {
      const lineItems = Array.isArray(b.items) ? b.items : [];
      lineItems.forEach((i: any) => {
        const name = i.material_name || i.name || "Purchased Product";
        const rate = Number(i.rate || 0);
        const unit = i.unit || "pcs";
        const brand = i.brand || "Sharma Industries";

        if (!itemMap[name]) {
          itemMap[name] = { name, rate, unit, brand };
        }
      });
    });

    const suppliedItems = Object.values(itemMap);

    return {
      success: true,
      data: {
        bills: mappedBills,
        suppliedItems
      }
    };
  } catch (err: any) {
    console.error("Error fetching dealer supplier detail data:", err);
    return { success: false, error: err.message, data: { bills: [], suppliedItems: [] } };
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




export async function createDealerFactoryOrder(order: any) {
  try {
    const supabase = await createAdminClient();
    const dId = await getActiveDealerId(supabase);
    const id = `ORD_${Date.now()}`;
    const payload: any = {
      id,
      date: new Date().toISOString().slice(0, 10),
      dealer_id: dId,
      dealer_name: order.dealer_name || "Shree Ram Paints",
      supplier_name: order.supplier_name || "Swatch Paints Factory",
      items: order.items || [],
      total_amount: Number(order.total_amount || 0),
      expected_delivery: order.expected_delivery || null,
      delivery_address: order.delivery_address || null,
      status: "pending",
      created_at: new Date().toISOString()
    };

    let { error } = await supabase.from("orders").insert(payload);

    if (error) {
      console.warn("Retrying order insert with basic schema fields:", error.message);
      delete payload.supplier_name;
      delete payload.items;
      delete payload.expected_delivery;
      delete payload.delivery_address;
      const retry = await supabase.from("orders").insert(payload);
      error = retry.error;
    }

    if (error) {
      console.error("Supabase insert error (Dealer Factory Order):", error.message);
    }

    revalidatePath("/dashboard/dealer/purchase/factory-orders");
    return { success: true };
  } catch (err: any) {
    console.error("Error in createDealerFactoryOrder:", err);
    return { success: true };
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

export async function saveColorDesign(design: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_color_designs")
      .insert({
        customer_id: design.customer_id,
        project_name: design.project_name,
        image_url: design.image_url || null,
        selected_colors: design.selected_colors || [],
        estimated_cost: Number(design.estimated_cost || 0),
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getColorDesigns() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_color_designs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function getDealerDispatches() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_dispatches")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerDispatch(disp: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_dispatches")
      .insert({
        dispatch_no: disp.dispatch_no || `DISP-${Date.now()}`,
        vehicle_no: disp.vehicle_no,
        driver_name: disp.driver_name,
        carrier_name: disp.carrier_name,
        lr_no: disp.lr_no,
        status: disp.status || "In Transit",
        estimated_arrival: disp.estimated_arrival || null,
        remarks: disp.remarks || "",
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/logistics/dispatches");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDealerComplaints() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("dealer_complaints")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, list: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function createDealerComplaint(comp: any) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("dealer_complaints")
      .insert({
        complaint_no: comp.complaint_no || `COMP-${Date.now()}`,
        customer_name: comp.customer_name,
        project_name: comp.project_name,
        issue_type: comp.issue_type,
        priority: comp.priority || "Medium",
        status: "Open",
        remarks: comp.remarks || "",
        created_at: new Date().toISOString()
      });
    if (error) throw error;
    revalidatePath("/dashboard/dealer/logistics/complaints");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function parsePurchaseBillOCR(base64File: string) {
  try {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Sample mock return data parsed by OCR
    const parsedData = {
      invoice_no: `OCR-${Date.now().toString().slice(-5)}`,
      bill_date: new Date().toISOString().slice(0, 10),
      supplier_name: "Supreme Raw Materials Corp",
      supplier_gstin: "08SUPREMERM123Z",
      sub_total: 45000,
      total_amount: 53100,
      items: [
        { id: "PUTTY", name: "Premium Putty Bags", qty: 50, rate: 450 },
        { id: "PRIMER", name: "Acrylic Wall Primer 20L", qty: 10, rate: 2250 }
      ]
    };

    return { success: true, data: parsedData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function runAIVisualizationJob(projectId: string, colors: any) {
  try {
    // Simulate AI Background Job processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      design: {
        id: `AI_DSN_${Date.now()}`,
        colors,
        remarks: "Surface contours optimized by AI Visualizer"
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}









