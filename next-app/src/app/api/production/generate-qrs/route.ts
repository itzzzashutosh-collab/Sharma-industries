import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import QRCode from "qrcode";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing productId or quantity." },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity must be a positive number." },
        { status: 400 }
      );
    }

    if (qty > 1000) {
      return NextResponse.json(
        { success: false, error: "Maximum quantity limit is 1000 codes per request." },
        { status: 400 }
      );
    }

    // 1. Get product details to compute tag
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("product_name, token_value, package_size, package_size_unit")
      .eq("id", productId)
      .single();

    if (prodErr || !product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    // Generate product tag (e.g. "Rustic Royale 20L" -> "RR20L")
    const nameInitials = product.product_name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase();
    const size = Math.round(Number(product.package_size) || 0);
    const unit = (product.package_size_unit || "L").toUpperCase().replace("ITERS", "").replace("ITER", "");
    const tag = `${nameInitials}${size}${unit}`;

    // 2. Fetch the last generated QR code for this product tag
    const { data: lastQr, error: lastQrErr } = await supabase
      .from("qr_registry")
      .select("qr_code")
      .like("qr_code", `SP-${tag}-%`)
      .order("qr_code", { ascending: false })
      .limit(1);

    let lastIndex = 0;
    if (!lastQrErr && lastQr && lastQr.length > 0) {
      const parts = lastQr[0].qr_code.split("-");
      const numPart = parts[parts.length - 1];
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        lastIndex = parsed;
      }
    }

    const points = product.token_value || 10;
    const qrRows = [];
    const qrCodesList: string[] = [];

    // 3. Generate sequential QR codes
    for (let i = 1; i <= qty; i++) {
      const currentIndex = lastIndex + i;
      const serialString = currentIndex.toString().padStart(5, "0");
      const code = `SP-${tag}-${serialString}`;
      
      qrCodesList.push(code);
      qrRows.push({
        qr_code: code,
        product_id: productId,
        token_value: points,
        status: "AVAILABLE",
        is_scanned: false,
      });
    }

    // 4. Save to registry
    const { error: insertErr } = await supabase
      .from("qr_registry")
      .upsert(qrRows, { onConflict: "qr_code" });

    if (insertErr) throw insertErr;

    // 5. Create ZIP
    const zip = new JSZip();
    const folder = zip.folder("qr_codes");
    if (folder) {
      for (const code of qrCodesList) {
        // Generate actual working QR Code SVG string
        const qrSvg = await QRCode.toString(code, { type: "svg", margin: 2 });
        folder.file(`${code}.svg`, qrSvg);

        // Also add the label details as helper text
        const labelText = `Sharma Industries QR Code Label\n--------------------------------\nProduct: ${product.product_name}\nTag: ${tag}\nQR Code: ${code}\nPoints Value: ${points}\nScan to redeem.`;
        folder.file(`${code}.txt`, labelText);
      }
      
      zip.file("index_list.txt", `Sharma Industries - Generated QRs List\nProduct: ${product.product_name}\nTag: ${tag}\nCreated: ${new Date().toISOString()}\nTotal QRs: ${qrCodesList.length}\nRange: ${qrCodesList[0]} to ${qrCodesList[qrCodesList.length - 1]}\n\nQRs:\n` + qrCodesList.join("\n"));
    }

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
    
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=qrs_${tag}_${qty}.zip`,
      },
    });
  } catch (err: any) {
    console.error("Generate QRs error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
