const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MOCK_PAINTERS = [
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114401",
    name: "Rajesh Kumar",
    phone: "9876543210",
    swatch_id: "SW-JAIPUR-001",
    address: "Mansarovar Sector 5, Jaipur, Rajasthan",
    aadhar_no: "123456789012",
    locality: "Jaipur Depot",
    total_tokens: 850,
    total_redeemed: 300,
    status: "approved"
  },
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114402",
    name: "Amit Sharma",
    phone: "9988776655",
    swatch_id: "SW-JAIPUR-002",
    address: "Malviya Nagar, Jaipur, Rajasthan",
    aadhar_no: "987654321098",
    locality: "Jaipur Depot",
    total_tokens: 1200,
    total_redeemed: 800,
    status: "approved"
  },
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114403",
    name: "Vikram Singh",
    phone: "9812345678",
    swatch_id: "SW-JODHPUR-003",
    address: "Sardarpura Near Depot, Jodhpur, Rajasthan",
    aadhar_no: "456789012345",
    locality: "Jodhpur Depot",
    total_tokens: 450,
    total_redeemed: 100,
    status: "approved"
  },
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114404",
    name: "Suresh Yadav",
    phone: "9414012345",
    swatch_id: "SW-AJMER-004",
    address: "Vaishali Nagar, Ajmer, Rajasthan",
    aadhar_no: "567890123456",
    locality: "Ajmer Area",
    total_tokens: 600,
    total_redeemed: 150,
    status: "approved"
  },
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114405",
    name: "Mahendra Choudhary",
    phone: "9413098765",
    swatch_id: "SW-KOTA-005",
    address: "Vigyan Nagar, Kota, Rajasthan",
    aadhar_no: "789012345678",
    locality: "Kota Area",
    total_tokens: 1100,
    total_redeemed: 500,
    status: "approved"
  },
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114406",
    name: "Ram Charan",
    phone: "9785123456",
    swatch_id: "SW-AJMER-006",
    address: "Pushkar Road, Ajmer, Rajasthan",
    aadhar_no: "112233445566",
    locality: "Ajmer Area",
    total_tokens: 0,
    total_redeemed: 0,
    status: "pending"
  },
  {
    id: "b83ad898-0c6a-4c2c-8ab5-3343a4114407",
    name: "Hari Prasad",
    phone: "9875987654",
    swatch_id: "SW-KOTA-007",
    address: "Talwandi Area, Kota, Rajasthan",
    aadhar_no: "998877665544",
    locality: "Kota Area",
    total_tokens: 0,
    total_redeemed: 0,
    status: "pending"
  }
];

async function seed() {
  try {
    console.log("Fetching live products and dealers to prevent foreign key violations...");
    const { data: dbProducts } = await supabase.from("products").select("id").limit(2);
    const { data: dbDealers } = await supabase.from("dealers").select("id").limit(2);

    const productId = dbProducts && dbProducts[0] ? dbProducts[0].id : null;
    const dealerId = dbDealers && dbDealers[0] ? dbDealers[0].id : null;

    console.log("Using Product ID:", productId);
    console.log("Using Dealer ID:", dealerId);

    console.log("Seeding painters...");
    // Clear existing if any
    await supabase.from("painters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    const { data: pData, error: pErr } = await supabase.from("painters").insert(MOCK_PAINTERS).select();
    if (pErr) {
      console.error("Error inserting painters:", pErr);
      return;
    }
    console.log(`Successfully seeded ${pData.length} painters!`);

    console.log("Seeding qr_registry...");
    // Clear existing scans if any
    await supabase.from("qr_registry").delete().neq("qr_code", "");

    const mockScans = [
      { qr_code: "QR-100001", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114401", scanned_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), token_value: 100, is_scanned: true, product_id: productId, dealer_id: dealerId },
      { qr_code: "QR-100002", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114401", scanned_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(), token_value: 50, is_scanned: true, product_id: productId, dealer_id: dealerId },
      { qr_code: "QR-100003", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114402", scanned_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), token_value: 150, is_scanned: true, product_id: productId, dealer_id: dealerId },
      { qr_code: "QR-100004", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114402", scanned_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), token_value: 200, is_scanned: true, product_id: productId, dealer_id: dealerId },
      { qr_code: "QR-100005", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114403", scanned_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), token_value: 100, is_scanned: true, product_id: productId, dealer_id: dealerId },
      { qr_code: "QR-100006", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114404", scanned_at: new Date(Date.now() - 6 * 24 * 3600000).toISOString(), token_value: 100, is_scanned: true, product_id: productId, dealer_id: dealerId },
      { qr_code: "QR-100007", scanned_by: "b83ad898-0c6a-4c2c-8ab5-3343a4114405", scanned_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), token_value: 150, is_scanned: true, product_id: productId, dealer_id: dealerId }
    ];

    const { data: qData, error: qErr } = await supabase.from("qr_registry").insert(mockScans).select();
    if (qErr) {
      console.error("Error inserting qr_registry:", qErr);
    } else {
      console.log(`Successfully seeded ${qData.length} scanned coupons!`);
    }
  } catch (e) {
    console.error(e);
  }
}

seed();
