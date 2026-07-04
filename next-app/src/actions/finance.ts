'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 1. Update Existing Ledger Fetching Logic
export async function getLedgerClients({
  dateRange = 'All', // 'Weekly', 'Monthly', 'Yearly', 'All'
  sort = 'highest_outstanding', // 'highest_outstanding', 'highest_revenue', 'maximum_products_bought'
  searchQuery = ''
}: {
  dateRange?: string;
  sort?: string;
  searchQuery?: string;
}) {
  try {
    // Perform ILIKE search if searchQuery is provided
    let query = supabaseAdmin.from('clients').select(`
      id, 
      name, 
      phone,
      invoices ( grand_total, created_at ),
      ledger_entries ( debit, credit, date )
    `);

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data: clients, error } = await query;
    if (error) throw error;

    // Filter dates manually here due to complex relation joins
    const now = new Date();
    let pastDate = new Date(0); // 'All'

    if (dateRange === 'Weekly') pastDate = new Date(now.setDate(now.getDate() - 7));
    if (dateRange === 'Monthly') pastDate = new Date(now.setMonth(now.getMonth() - 1));
    if (dateRange === 'Yearly') pastDate = new Date(now.setFullYear(now.getFullYear() - 1));

    let processedClients = (clients || []).map(client => {
      // Apply date filters to nested relations
      const validInvoices = (client.invoices || []).filter((i: any) => new Date(i.created_at) >= pastDate);
      const validLedger = (client.ledger_entries || []).filter((l: any) => new Date(l.date) >= pastDate);

      const totalRevenue = validInvoices.reduce((sum: number, i: any) => sum + (Number(i.grand_total) || 0), 0);
      const totalPaid = validLedger.reduce((sum: number, l: any) => sum + (Number(l.credit) || 0), 0);
      
      const outstanding = totalRevenue - totalPaid;

      return {
        ...client,
        totalRevenue,
        outstanding,
        productCount: validInvoices.length // Approximate max products bought by invoice count
      };
    });

    // Handle Sorting
    if (sort === 'highest_outstanding') {
      processedClients.sort((a, b) => b.outstanding - a.outstanding);
    } else if (sort === 'highest_revenue') {
      processedClients.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sort === 'maximum_products_bought') {
      processedClients.sort((a, b) => b.productCount - a.productCount);
    }

    return { success: true, data: processedClients, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

// 2. Update Client Deep-Dive Logic
export async function getClientDeepDive(clientId: string) {
  try {
    // Fetch sales invoices
    const { data: invoices, error: invError } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_no, date, grand_total, items, payment_status, document_url')
      .eq('client_id', clientId);
    if (invError) throw invError;

    // Fetch financial ledger (payments)
    const { data: payments, error: payError } = await supabaseAdmin
      .from('ledger_entries')
      .select('id, date, credit, payment_mode, reference_no, collected_by, document_url, is_gst_billed')
      .eq('client_id', clientId);
    if (payError) throw payError;

    // Merge into chronological timeline
    const timeline = [
      ...(invoices || []).map(i => ({ 
        id: i.id,
        type: 'invoice', 
        reference: i.invoice_no,
        amount: Number(i.grand_total) || 0, 
        date: new Date(i.date || Date.now()),
        status: i.payment_status || 'Pending',
        document_url: i.document_url,
        items: i.items || [] // { product_name, quantity, rate, amount }
      })),
      ...(payments || []).map(p => ({ 
        id: p.id,
        type: 'payment', 
        reference: p.reference_no,
        amount: Number(p.credit) || 0, 
        date: new Date(p.date || Date.now()),
        payment_mode: p.payment_mode,
        collected_by: p.collected_by,
        document_url: p.document_url,
        is_gst_billed: p.is_gst_billed
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Chronological (newest first)

    return { success: true, data: timeline, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

// 2.5. PDF Handling Action
export async function downloadInvoicePDF(invoiceId: string) {
  try {
    // 1. Fetch invoice details from Supabase
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    if (!invoice) throw new Error('Invoice not found');

    // 2. If PDF already generated and stored, return the signed URL for direct download
    if (invoice.document_url) {
      // Assuming document_url is a full URL, or you can generate a signed URL here if it's a storage path
      return { success: true, data: { url: invoice.document_url }, error: null };
    }

    // 3. IF NO PDF EXISTS: Outline for on-the-fly generation
    /*
      LOGIC OUTLINE FOR SERVER-SIDE PDF GENERATION:
      const { jsPDF } = require("jspdf");
      require("jspdf-autotable");
      
      const doc = new jsPDF();
      
      // Header: Sharma Industries
      doc.setFontSize(22);
      doc.text("SHARMA INDUSTRIES", 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.text("Paint Manufacturing ERP - Tax Invoice", 105, 28, { align: "center" });
      
      // Client Details
      doc.text(`Invoice No: ${invoice.invoice_no}`, 14, 45);
      doc.text(`Date: ${invoice.date}`, 14, 50);
      doc.text(`Client: ${invoice.client_details?.name || 'Cash'}`, 14, 55);
      
      // Itemized Table (jsPDF-AutoTable)
      const tableColumn = ["Product Name", "Quantity", "Rate", "Amount"];
      const tableRows = [];
      
      invoice.items.forEach(item => {
        tableRows.push([
          item.product_name || item.name,
          item.quantity,
          `Rs. ${item.rate}`,
          `Rs. ${item.amount}`
        ]);
      });
      
      doc.autoTable({
        startY: 65,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [180, 255, 54], textColor: [0, 0, 0] } // Neon Lime Header
      });
      
      // GST Breakdown & Grand Total
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.text(`Total Taxable: Rs. ${invoice.total_taxable}`, 140, finalY + 10);
      doc.text(`CGST: Rs. ${invoice.cgst}`, 140, finalY + 15);
      doc.text(`SGST: Rs. ${invoice.sgst}`, 140, finalY + 20);
      doc.text(`Grand Total: Rs. ${invoice.grand_total}`, 140, finalY + 25);
      
      // Generate Buffer
      const pdfBuffer = doc.output('arraybuffer');
      
      // (Optional) Upload this buffer to Supabase Storage and save the URL to `document_url` in the database.
      // Then return the URL.
      
      // For this outline, we return a mocked success indicating generation is ready to be hooked up.
    */

    return { 
      success: true, 
      data: { 
        url: null, 
        message: "PDF Generation logic ready. Awaiting jsPDF implementation or client-side rendering fallback." 
      }, 
      error: null 
    };

  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

// 3. Update Payment Recording Action
export async function logTransaction(data: {
  party_id: string;
  reference_type: string;
  payment_mode: string;
  collected_by?: string;
  reference_no?: string;
  document_url?: string;
  is_gst_billed?: boolean;
  credit_amount?: number;
  debit_amount?: number;
  description?: string;
}) {
  try {
    // Validation for CASH
    if (data.payment_mode === 'CASH' && !data.collected_by) {
      throw new Error('collected_by (Salesman) is strictly required when payment mode is CASH.');
    }
    
    // Validation for CHEQUE
    if (data.payment_mode === 'CHEQUE' && !data.reference_no) {
      throw new Error('reference_no (Cheque Number) is strictly required when payment mode is CHEQUE.');
    }

    // Prepare payload
    const payload = {
      id: `LED_${Date.now()}`,
      client_id: data.party_id,
      payment_mode: data.payment_mode,
      collected_by: data.collected_by || null,
      reference_no: data.reference_no || null,
      document_url: data.document_url || null,
      is_gst_billed: data.is_gst_billed ?? true,
      credit: data.credit_amount || 0,
      debit: data.debit_amount || 0,
      description: data.description || 'Payment Received',
      date: new Date().toISOString()
    };

    const { data: result, error } = await supabaseAdmin
      .from('ledger_entries')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: result, error: null };
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}
