async function runTest() {
  console.log("Running internal unit test for /api/invoices...");
  
  const payload = {
    invoice_no: "TEST-INV-" + Date.now(),
    date: new Date().toISOString().split("T")[0],
    client_id: null,
    client_details: {
      name: "Debug Client",
      phone: "1234567890",
      address: "Test Address",
      state_code: "MH",
      pincode: "400001"
    },
    items: [
      { id: "item-1", description: "Test Service", hsn_sac: "9988", qty: 1, rate: 1000, taxPercent: 18, taxableValue: 1000, taxAmount: 180, total: 1180 }
    ],
    tax_breakdown: {
      cgst: 90,
      sgst: 90,
      igst: 0
    },
    subtotal: 1000,
    total_tax: 180,
    grand_total: 1180,
    is_tax_inclusive: false
  };

  try {
    const res = await fetch("http://localhost:3000/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      console.log("Test Passed! Invoice created with ID:", data.data.id);
    } else {
      console.error("Test Failed! Error:", data);
      process.exit(1);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    process.exit(1);
  }
}
runTest();
