const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const dummyDealers = [
  { name: '[TEST] Master Paints & Co.', territory: 'South Delhi', address: '123 Main Bazaar, South Delhi' },
  { name: '[TEST] Royal Traders', territory: 'Gurugram', address: 'Shop 45, Sector 14, Gurugram' },
  { name: '[TEST] Supreme Hardware', territory: 'Noida', address: 'Plot 2, Industrial Area, Noida' },
  { name: '[TEST] Capital Colors', territory: 'Jaipur', address: 'MI Road, Jaipur' },
  { name: '[TEST] Apex Supplies', territory: 'Ahmedabad', address: 'CG Road, Ahmedabad' },
];

const sampleProducts = [
  { description: 'Rustic Royale 20L', price: 4500 },
  { description: 'WeatherGuard 10L', price: 2800 },
  { description: 'SilkTouch Interior 5L', price: 1500 },
  { description: 'Primer White 20L', price: 1200 },
  { description: 'Enamel Gloss 1L', price: 350 },
  { description: 'Waterproofing Chemical 5kg', price: 900 }
];

async function run() {
  console.log("Starting dummy data seeding directly to DB...");

  // Delete old test users
  console.log("Cleaning up old test users from public.users...");
  await supabase.from('users').delete().like('name', '[TEST]%');

  // 1. Create Dealers directly in public.users
  const createdDealers = [];
  for (let i = 0; i < dummyDealers.length; i++) {
    const d = dummyDealers[i];
    
    // Generate a random phone number that definitely won't conflict
    const phone = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
    const id = require('crypto').randomUUID();

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        id: id,
        name: d.name,
        phone: phone,
        password_hash: 'dummy_hash',
        role: 'dealer',
        is_approved: true,
        is_active: true,
        territory: d.territory,
        address: d.address
      }])
      .select()
      .single();

    if (error) {
      console.error(`Error inserting ${d.name}:`, error);
    } else {
      console.log(`Dealer ${d.name} inserted into public.users`);
      
      // Insert into clients table to satisfy foreign key for invoices
      const {error: clientError} = await supabase.from('clients').insert([{
        id: id,
        name: d.name,
        phone: phone,
        address: d.address
      }]);
      if (clientError) console.error("Client insert error:", clientError);

      createdDealers.push(user);
    }
  }

  // 2. Create Invoices for each Dealer
  console.log("\nCreating Invoices...");
  for (const dealer of createdDealers) {
    const numInvoices = Math.floor(Math.random() * 3) + 2; // 2 to 4 invoices
    for (let i = 0; i < numInvoices; i++) {
      const invoiceNo = `INV-TEST-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const prod = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        const qty = Math.floor(Math.random() * 10) + 1;
        const total = qty * prod.price;
        subtotal += total;
        items.push({
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          description: prod.description,
          qty,
          price: prod.price,
          total
        });
      }
      
      const tax_amount = subtotal * 0.18; // 18% GST
      const grand_total = subtotal + tax_amount;
      
      // Random past date within last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const createdAtDate = new Date();
      createdAtDate.setDate(createdAtDate.getDate() - daysAgo);

      const { data: inv, error: invError } = await supabase
        .from('invoices')
        .insert([{
          id: require('crypto').randomUUID(),
          invoice_no: invoiceNo,
          customer: dealer.name,
          client_type: 'Dealer',
          customer_id: dealer.id,
          client_id: dealer.id,
          date: createdAtDate.toISOString().split('T')[0], // yyyy-mm-dd format
          items,
          seller: 'Company',
          subtotal,
          total_gst: tax_amount,
          grand_total,
          balance_due: Math.random() > 0.3 ? 0 : grand_total,
          payment_status: Math.random() > 0.3 ? 'Paid' : 'Unpaid'
        }])
        .select();
        
      if (invError) {
         console.error(`Error creating invoice for ${dealer.name}:`, invError);
      } else {
         console.log(`Created Invoice ${invoiceNo} for ${dealer.name} - Total: ₹${grand_total.toLocaleString()}`);
      }
    }
  }

  console.log("\nSeeding complete!");
}

run();
