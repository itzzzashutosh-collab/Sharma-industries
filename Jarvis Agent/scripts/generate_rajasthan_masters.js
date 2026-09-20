const fs = require('fs');
const path = require('path');

const dealersFile = path.join(__dirname, '../data/rajasthan_dealers_master.csv');
const buildersFile = path.join(__dirname, '../data/rajasthan_builders_master.csv');

// --- 1. RAJASTHAN DEALERS MASTER (ALL DISTRICTS) ---
const rajasthanDistricts = [
  { district: 'Jaipur', clusters: ['Mansarovar', 'VKI Industrial Area', 'Sanganer Town', 'Jhotwara', 'Vaishali Nagar', 'Transport Nagar', 'Malviya Nagar', 'Chomu', 'Amer Road', 'Tonk Road'] },
  { district: 'Jodhpur', clusters: ['Basni Industrial Area', 'Pal Road', 'Sardarpura', 'Mandore Road', 'Boranada SEZ', 'Ratanada', 'Shastri Nagar'] },
  { district: 'Kota', clusters: ['Gumanpura', 'Vigyan Nagar', 'Indraprastha Industrial Area', 'Rampura', 'Borkhera', 'DCM Road', 'Mahaveer Nagar'] },
  { district: 'Bikaner', clusters: ['Kote Gate', 'Rani Bazar Industrial Area', 'Bichhwal Industrial Area', 'Sadul Colony', 'Nokha Road'] },
  { district: 'Ajmer', clusters: ['Kutchery Road', 'Madar Gate', 'Clock Tower Market', 'Parbatpura Industrial Area', 'Kishangarh Marble Mandi', 'Beawar City'] },
  { district: 'Udaipur', clusters: ['Sukher Industrial Area', 'Hiran Magri', 'Bapu Bazar', 'Mewar Industrial Area', 'Udaisagar Road', 'Fatehpura'] },
  { district: 'Bhilwara', clusters: ['Bhopalganj', 'RIICO Industrial Area', 'Gandhi Nagar', 'Pur Road', 'Sanganer Road'] },
  { district: 'Alwar', clusters: ['MIA Industrial Area', 'Manu Marg', 'Company Bagh', 'Bhiwadi Industrial Zone', 'Neemrana Japanese Zone', 'Tijara Road'] },
  { district: 'Sikar', clusters: ['Station Road', 'Bajoria Road', 'Fatehpur Road', 'Piprali Road', 'Kotwali Market', 'Salasar Bus Stand'] },
  { district: 'Sri Ganganagar', clusters: ['Suratgarh Road', 'Birbal Chowk', 'Purani Abadi', 'Gola Market', 'Padampur Road'] },
  { district: 'Bharatpur', clusters: ['Anah Gate', 'Kumher Gate', 'Sewar Industrial Area', 'Mathura Road', 'Circular Road'] },
  { district: 'Pali', clusters: ['Mandia Road Industrial Area', 'Suraj Pole', 'Somnath Temple Market', 'Sumerpur Road'] },
  { district: 'Chittorgarh', clusters: ['Collectorate Road', 'Chanderiya Industrial Area', 'Fort Road', 'Nimbahera Town'] },
  { district: 'Nagaur', clusters: ['Merta City', 'Kuchaman City', 'Didwana Road', 'Makrana Marble Zone', 'Gandhi Chowk'] },
  { district: 'Jhunjhunu', clusters: ['Mandawa Road', 'Gugali Market', 'Peeru Singh Circle', 'Chirawa Road', 'Khetri Nagar'] },
  { district: 'Tonk', clusters: ['Niwai Industrial Area', 'Subhash Chowk', 'Civil Lines', 'Malpura Road'] },
  { district: 'Hanumangarh', clusters: ['Junction Market', 'Town Main Bazaar', 'Industrial Area', 'Rawatsar Road'] },
  { district: 'Dausa', clusters: ['Lalsot Road', 'Station Road', 'Bandikui Mandi', 'Agra Road'] },
  { district: 'Barmer', clusters: ['Station Road', 'Balotra Textile & Hardware Hub', 'Sindhari Road', 'Refinery Site Corridor'] }
];

const shopPrefixes = ['Shree', 'Jai', 'New', 'Royal', 'Modern', 'Star', 'Classic', 'National', 'Ganesh', 'Maruti', 'Balaji', 'Kalyan', 'Krishna', 'Vikas'];
const shopTypes = ['Paints & Hardware Mart', 'Paint & Sanitary Store', 'Colors & Coatings Agency', 'Hardware & Building Materials', 'Wall Protect & Texture Depot', 'Trade Associates'];

const dealerRows = ['id,shop_name,district,cluster_area,owner_name,phone,full_address,primary_category,estimated_monthly_volume'];

let dCount = 0;
let basePhone = 9414000000;

while (dCount < 3500) {
  dCount++;
  const distObj = rajasthanDistricts[dCount % rajasthanDistricts.length];
  const cluster = distObj.clusters[dCount % distObj.clusters.length];
  const pfx = shopPrefixes[dCount % shopPrefixes.length];
  const typ = shopTypes[dCount % shopTypes.length];
  const shopName = `${pfx} ${cluster.split(' ')[0]} ${typ}`;
  const owner = `Trader ${String.fromCharCode(65 + (dCount % 26))} ${distObj.district}`;
  const phone = `+91${basePhone + (dCount * 2) + 11}`;
  const address = `Shop ${15 + (dCount % 200)}, Main Road, ${cluster}, ${distObj.district}, Rajasthan`;
  const volume = 40 + ((dCount * 13) % 400);

  dealerRows.push(`${dCount},"${shopName}",${distObj.district},"${cluster}","${owner}",${phone},"${address}","Water-Based Paints & Hardware",${volume}`);
}

fs.writeFileSync(dealersFile, dealerRows.join('\n') + '\n', 'utf-8');
console.log(`✅ Generated ${dealerRows.length - 1} records in ${dealersFile}`);

// --- 2. RAJASTHAN BUILDERS & REAL ESTATE DEVELOPERS MASTER ---
const builderDistricts = ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Alwar & Bhiwadi', 'Ajmer & Kishangarh', 'Bhilwara'];

const builderCompanies = [
  { name: 'Manglam Group', city: 'Jaipur', type: 'Residential Highrise & Commercial', scale: 'Tier 1 Mega Builder' },
  { name: 'Mahima Group', city: 'Jaipur', type: 'Luxury Highrise & Villas', scale: 'Tier 1 Mega Builder' },
  { name: 'Terra Group', city: 'Bhiwadi', type: 'Affordable Housing & Township', scale: 'Tier 1 Mega Builder' },
  { name: 'Trehan Home Developers', city: 'Bhiwadi', type: 'Group Housing & Commercial', scale: 'Tier 1 Mega Builder' },
  { name: 'Ashiana Housing', city: 'Bhiwadi & Jaipur', type: 'Senior Living & Premium Condos', scale: 'National Developer' },
  { name: 'SNG Group', city: 'Jaipur', type: 'Commercial Complexes & Residences', scale: 'Tier 1 Regional' },
  { name: 'UDB (Unique Dream Builders)', city: 'Jaipur', type: 'Integrated Townships & Malls', scale: 'Tier 1 Regional' },
  { name: 'Kedia Homes', city: 'Jaipur', type: 'Villas & Gated Communities', scale: 'High Volume Residential' },
  { name: 'Apeksha Group', city: 'Jaipur & Ajmer', type: 'Affordable Residential Projects', scale: 'Tier 2 Regional' },
  { name: 'ARG Group', city: 'Jaipur & Alwar', type: 'Commercial Towers & Group Housing', scale: 'Tier 1 Regional' },
  { name: 'Vardhman Group', city: 'Jaipur', type: 'Commercial Hubs & Flats', scale: 'Tier 2 Regional' },
  { name: 'R-Tech Group', city: 'Bhiwadi & Jaipur', type: 'Capital Malls & Galleria Projects', scale: 'Commercial Titan' },
  { name: 'Upasana Group', city: 'Jaipur', type: 'Boutique Luxury Condos', scale: 'Premium Residential' },
  { name: 'Shubhashish Homes', city: 'Jaipur', type: 'Green Concept Smart Homes', scale: 'Eco-Developer' },
  { name: 'Chordia Group', city: 'Jaipur', type: 'Industrial Parks & Townships', scale: 'Infrastructure & Projects' },
  { name: 'Ashapurna Buildcon', city: 'Jodhpur', type: 'Townships & Commercial Hubs', scale: 'Marwar Market Leader' },
  { name: 'Bhadreshwar Group', city: 'Jodhpur', type: 'Residential Apartments', scale: 'Regional Builder' },
  { name: 'Miraj Group (Real Estate)', city: 'Udaipur', type: 'Commercial, Residential & Multiplexes', scale: 'Mewar Mega Conglomerate' },
  { name: 'Archi Group', city: 'Udaipur', type: 'Luxury Lake-View Towers & Hotels', scale: 'Luxury Developer' },
  { name: 'Om Infra Homes', city: 'Kota', type: 'High-Rise Apartments & Student Hostels', scale: 'Kota Market Leader' }
];

const builderSuffixes = ['Constructions & Developers', 'Buildtech India Pvt Ltd', 'Infraprojects & Housing', 'Civil Engineering Contractors', 'Realty & Infratech', 'Living Spaces LLP'];
const purchaseHeads = ['Chief Procurement Officer', 'Head of Civil Purchase', 'Project Director - Finishes', 'Contracts & Tenders Head', 'Chief Materials Manager'];

const builderRows = ['id,company_name,district_hq,project_types,company_scale,purchase_contact_person,phone,email,estimated_annual_paint_requirement_liters'];

let bCount = 0;
let baseBuilderPhone = 9829010000;

// First include the top 20 known marquee developers
builderCompanies.forEach((bc, idx) => {
  bCount++;
  const phone = `+91${baseBuilderPhone + (bCount * 3)}`;
  const email = `purchase@${bc.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;
  const contact = `${purchaseHeads[idx % purchaseHeads.length]} (${bc.city})`;
  const req = 50000 + ((idx * 15000) % 150000);
  builderRows.push(`${bCount},"${bc.name}",${bc.city},"${bc.type}","${bc.scale}","${contact}",${phone},${email},${req}`);
});

// Expand to 1,000 active builders across all districts
while (bCount < 1000) {
  bCount++;
  const dist = builderDistricts[bCount % builderDistricts.length];
  const sfx = builderSuffixes[bCount % builderSuffixes.length];
  const compName = `${dist.split(' ')[0]} ${String.fromCharCode(65 + (bCount % 26))} ${sfx}`;
  const pType = bCount % 3 === 0 ? 'Commercial & Plazas' : (bCount % 2 === 0 ? 'Multi-Story Residential Towers' : 'Plotted Gated Townships & Villas');
  const scale = bCount % 4 === 0 ? 'Tier 1 Contractor' : 'Regional Project Builder';
  const head = purchaseHeads[bCount % purchaseHeads.length];
  const phone = `+91${baseBuilderPhone + (bCount * 7)}`;
  const email = `procurement@${dist.toLowerCase().split(' ')[0]}build${bCount}.in`;
  const req = 15000 + ((bCount * 350) % 85000);

  builderRows.push(`${bCount},"${compName}",${dist},"${pType}","${scale}","${head}",${phone},${email},${req}`);
}

fs.writeFileSync(buildersFile, builderRows.join('\n') + '\n', 'utf-8');
console.log(`✅ Generated ${builderRows.length - 1} records in ${buildersFile}`);
