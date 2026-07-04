const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app/dashboard/ceo/invoices');
const destDir = path.join(__dirname, 'src/app/dashboard/ceo/quotations');

function copyAndTransform(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    let destName = entry.name.replace(/Invoice/g, 'Quotation').replace(/invoice/g, 'quotation');
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      copyAndTransform(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Perform string replacements
      // Capitalized
      content = content.replace(/Invoice/g, 'Quotation');
      content = content.replace(/Invoices/g, 'Quotations');
      content = content.replace(/INVOICE/g, 'QUOTATION');
      // Lowercase
      content = content.replace(/invoice/g, 'quotation');
      content = content.replace(/invoices/g, 'quotations');
      
      // Special logic for semantic IDs
      // "SP(INV)-0001" -> "SP(Qno.)-001"
      content = content.replace(/SP\(INV\)-/g, 'SP(Qno.)-');
      // Format 0001 -> 001 for Qno.? 
      // The user requested: "qoutation no.is start with SP(Qno.)-001"
      // Wait, let's just make the padStart 3 instead of 4 if they strictly want 001.
      content = content.replace(/padStart\(4, '0'\)/g, "padStart(3, '0')");

      fs.writeFileSync(destPath, content);
      console.log(`Copied and transformed: ${destPath}`);
    }
  }
}

copyAndTransform(srcDir, destDir);

// Also copy the api route
const apiSrcDir = path.join(__dirname, 'src/app/api/invoices');
const apiDestDir = path.join(__dirname, 'src/app/api/quotations');

copyAndTransform(apiSrcDir, apiDestDir);

console.log("Done copying API and Dashboard folders!");
