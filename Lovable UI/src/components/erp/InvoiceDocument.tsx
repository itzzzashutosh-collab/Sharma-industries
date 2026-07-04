import { COMPANY, computeGst, amountInWords } from "@/lib/company";
import { formatINR, type Dealer, type Invoice } from "@/lib/data";

export type TemplateId = "classic" | "modern" | "minimal";

export const INVOICE_TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic (bordered)" },
  { id: "modern", label: "Modern (accent)" },
  { id: "minimal", label: "Minimal (clean)" },
];

const NAVY = "#1a3658";
const ORANGE = "#f5821f";
const INK = "#1f2937";
const MUT = "#6b7280";
const LINE = "#e5e7eb";

const inr = (n: number) => formatINR(Math.round(n));

function useInvoiceData(invoice: Invoice, dealer?: Dealer | null) {
  const gst = computeGst(invoice.items, dealer);
  return { gst };
}

/* ------------------------------------------------------------------ */
/* CLASSIC — traditional bordered tax invoice                          */
/* ------------------------------------------------------------------ */
function Classic({ invoice, dealer }: { invoice: Invoice; dealer?: Dealer | null }) {
  const { gst } = useInvoiceData(invoice, dealer);
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: INK, fontSize: 12, border: `1px solid ${INK}`, background: "#fff" }}>
      <div style={{ background: NAVY, color: "#fff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>{COMPANY.name}</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{COMPANY.tagline}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 18, fontWeight: 700, color: ORANGE }}>TAX INVOICE</div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${INK}` }}>
        <div style={{ flex: 1, padding: "12px 20px", borderRight: `1px solid ${INK}` }}>
          <div style={{ fontWeight: 700 }}>{COMPANY.name}</div>
          <div style={{ color: MUT, lineHeight: 1.5 }}>{COMPANY.address}</div>
          <div><strong>GSTIN:</strong> {COMPANY.gstin}</div>
          <div><strong>State:</strong> {COMPANY.stateName} ({COMPANY.stateCode})</div>
          <div>{COMPANY.phone} · {COMPANY.email}</div>
        </div>
        <div style={{ width: 230, padding: "12px 20px" }}>
          <Row k="Invoice No." v={invoice.number} />
          <Row k="Date" v={invoice.date} />
          <Row k="Status" v={invoice.status.toUpperCase()} />
          <Row k="Place of Supply" v={dealer?.city || "—"} />
        </div>
      </div>

      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${INK}` }}>
        <div style={{ fontSize: 11, color: MUT, marginBottom: 2 }}>BILL TO</div>
        <div style={{ fontWeight: 700 }}>{dealer?.name || invoice.dealerName}</div>
        {dealer && (
          <div style={{ color: MUT }}>
            {dealer.contact} · {dealer.phone} · {dealer.city}<br />
            <strong>GSTIN:</strong> {dealer.gstin || "Unregistered"}
          </div>
        )}
      </div>

      <ItemsTable invoice={invoice} headBg={NAVY} headColor="#fff" />

      <div style={{ display: "flex", borderTop: `1px solid ${INK}` }}>
        <div style={{ flex: 1, padding: "12px 20px", borderRight: `1px solid ${INK}` }}>
          <div style={{ fontSize: 11, color: MUT }}>Amount in words</div>
          <div style={{ fontWeight: 600 }}>{amountInWords(gst.grandTotal)}</div>
          <div style={{ marginTop: 12, fontSize: 11, color: MUT }}>Bank Details</div>
          <div>{COMPANY.bankName} · A/C {COMPANY.bankAccount} · IFSC {COMPANY.bankIfsc}</div>
        </div>
        <div style={{ width: 280, padding: "12px 20px" }}>
          <Totals gst={gst} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MODERN — orange accent, airy spacing                                */
/* ------------------------------------------------------------------ */
function Modern({ invoice, dealer }: { invoice: Invoice; dealer?: Dealer | null }) {
  const { gst } = useInvoiceData(invoice, dealer);
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: INK, fontSize: 12, background: "#fff", padding: 4 }}>
      <div style={{ borderTop: `6px solid ${ORANGE}`, padding: "20px 8px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{COMPANY.name}</div>
            <div style={{ color: MUT }}>{COMPANY.tagline}</div>
            <div style={{ color: MUT, marginTop: 6, maxWidth: 280, lineHeight: 1.5 }}>{COMPANY.address}</div>
            <div style={{ marginTop: 4 }}><strong>GSTIN:</strong> {COMPANY.gstin}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: ORANGE, letterSpacing: 1 }}>INVOICE</div>
            <div style={{ marginTop: 8 }}><strong>{invoice.number}</strong></div>
            <div style={{ color: MUT }}>{invoice.date}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
          <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: ORANGE, fontWeight: 700 }}>BILLED TO</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{dealer?.name || invoice.dealerName}</div>
            {dealer && (
              <div style={{ color: MUT }}>
                {dealer.contact} · {dealer.phone}<br />
                {dealer.city} · GSTIN: {dealer.gstin || "Unregistered"}
              </div>
            )}
          </div>
          <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: ORANGE, fontWeight: 700 }}>SUPPLY DETAILS</div>
            <Row k="Place of Supply" v={dealer?.city || "—"} />
            <Row k="GST Type" v={gst.interState ? "IGST (Inter-state)" : "CGST + SGST"} />
            <Row k="Status" v={invoice.status.toUpperCase()} />
          </div>
        </div>

        <ItemsTable invoice={invoice} headBg="#f1f5f9" headColor={NAVY} rounded />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <div style={{ width: 300 }}>
            <Totals gst={gst} accent={ORANGE} />
          </div>
        </div>

        <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: MUT }}>Amount in words</div>
          <div style={{ fontWeight: 600 }}>{amountInWords(gst.grandTotal)}</div>
          <div style={{ marginTop: 8, color: MUT }}>
            Bank: {COMPANY.bankName} · A/C {COMPANY.bankAccount} · IFSC {COMPANY.bankIfsc}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MINIMAL — monochrome, light lines                                   */
/* ------------------------------------------------------------------ */
function Minimal({ invoice, dealer }: { invoice: Invoice; dealer?: Dealer | null }) {
  const { gst } = useInvoiceData(invoice, dealer);
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: INK, fontSize: 12, background: "#fff", padding: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 12, borderBottom: `2px solid ${INK}` }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{COMPANY.name}</div>
          <div style={{ color: MUT }}>{COMPANY.tagline}</div>
        </div>
        <div style={{ textAlign: "right", color: MUT, fontSize: 11 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: INK, letterSpacing: 2 }}>TAX INVOICE</div>
          {invoice.number} · {invoice.date}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0", fontSize: 11 }}>
        <div>
          <div style={{ color: MUT }}>FROM</div>
          <div style={{ fontWeight: 700 }}>{COMPANY.name}</div>
          <div style={{ color: MUT, maxWidth: 260, lineHeight: 1.5 }}>{COMPANY.address}</div>
          <div>GSTIN: {COMPANY.gstin}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: MUT }}>TO</div>
          <div style={{ fontWeight: 700 }}>{dealer?.name || invoice.dealerName}</div>
          {dealer && (
            <div style={{ color: MUT }}>
              {dealer.city}<br />GSTIN: {dealer.gstin || "Unregistered"}
            </div>
          )}
        </div>
      </div>

      <ItemsTable invoice={invoice} headBg="#fff" headColor={INK} bordered={false} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <div style={{ width: 280 }}>
          <Totals gst={gst} />
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${LINE}`, color: MUT, fontSize: 11 }}>
        {amountInWords(gst.grandTotal)}
      </div>
      <Footer minimal />
    </div>
  );
}

/* ------------------------------- shared ------------------------------- */
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "1px 0" }}>
      <span style={{ color: MUT }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function ItemsTable({
  invoice,
  headBg,
  headColor,
  bordered = true,
  rounded = false,
}: {
  invoice: Invoice;
  headBg: string;
  headColor: string;
  bordered?: boolean;
  rounded?: boolean;
}) {
  const cell: React.CSSProperties = {
    padding: "8px 10px",
    borderBottom: `1px solid ${LINE}`,
    ...(bordered ? { borderRight: `1px solid ${LINE}` } : {}),
  };
  const num: React.CSSProperties = { ...cell, textAlign: "right" };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, overflow: rounded ? "hidden" : undefined, borderRadius: rounded ? 8 : 0 }}>
      <thead>
        <tr style={{ background: headBg, color: headColor }}>
          <th style={{ ...cell, textAlign: "left", width: 28 }}>#</th>
          <th style={{ ...cell, textAlign: "left" }}>Description</th>
          <th style={{ ...cell, textAlign: "left", width: 60 }}>HSN</th>
          <th style={{ ...num, width: 50 }}>Qty</th>
          <th style={{ ...num, width: 80 }}>Rate</th>
          <th style={{ ...num, width: 90, borderRight: "none" }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((it, i) => (
          <tr key={i}>
            <td style={cell}>{i + 1}</td>
            <td style={{ ...cell, fontWeight: 600 }}>{it.name}</td>
            <td style={cell}>{it.hsn || "3209"}</td>
            <td style={num}>{it.qty}</td>
            <td style={num}>{inr(it.rate)}</td>
            <td style={{ ...num, borderRight: "none" }}>{inr(it.qty * it.rate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Totals({
  gst,
  accent = NAVY,
}: {
  gst: ReturnType<typeof computeGst>;
  accent?: string;
}) {
  return (
    <div style={{ fontSize: 12 }}>
      <Row k="Taxable Value" v={inr(gst.subtotal)} />
      {gst.interState ? (
        <Row k={`IGST @ ${gst.rate}%`} v={inr(gst.igst)} />
      ) : (
        <>
          <Row k={`CGST @ ${gst.rate / 2}%`} v={inr(gst.cgst)} />
          <Row k={`SGST @ ${gst.rate / 2}%`} v={inr(gst.sgst)} />
        </>
      )}
      {Math.abs(gst.roundOff) >= 0.5 && (
        <Row k="Round Off" v={inr(gst.roundOff)} />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          padding: "10px 12px",
          background: accent,
          color: "#fff",
          borderRadius: 6,
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        <span>Grand Total</span>
        <span>{inr(gst.grandTotal)}</span>
      </div>
    </div>
  );
}

function Footer({ minimal }: { minimal?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: minimal ? "24px 0 0" : "20px", color: MUT, fontSize: 10 }}>
      <div style={{ maxWidth: 300, lineHeight: 1.5 }}>
        Goods once sold will not be taken back. Subject to {COMPANY.stateName} jurisdiction. E. &amp; O.E.
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ height: 40 }} />
        <div style={{ borderTop: `1px solid ${MUT}`, paddingTop: 4, fontWeight: 600, color: INK }}>
          For {COMPANY.name}
        </div>
        <div>Authorised Signatory</div>
      </div>
    </div>
  );
}

export function InvoiceDocument({
  invoice,
  dealer,
  template,
}: {
  invoice: Invoice;
  dealer?: Dealer | null;
  template: TemplateId;
}) {
  if (template === "modern") return <Modern invoice={invoice} dealer={dealer} />;
  if (template === "minimal") return <Minimal invoice={invoice} dealer={dealer} />;
  return <Classic invoice={invoice} dealer={dealer} />;
}
