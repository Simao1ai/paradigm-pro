import PDFDocument from "pdfkit";

interface CertificateData {
  userName: string;
  courseName: string;
  issuedAt: Date;
  uniqueCode: string;
  verifyUrl: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;

    // ── Background ────────────────────────────────────────────────────────
    doc.rect(0, 0, W, H).fill("#0B1628");

    // Gradient strips (left → right: indigo → orange)
    for (let i = 0; i < W; i++) {
      const t = i / W;
      const r = Math.round(99 + (249 - 99) * t);
      const g = Math.round(102 + (115 - 102) * t);
      const b = Math.round(241 + (22 - 241) * t);
      doc.rect(i, 0, 1, 12).fill(`rgb(${r},${g},${b})`);
      doc.rect(i, H - 12, 1, 12).fill(`rgb(${r},${g},${b})`);
    }

    // Gold side bars
    doc.rect(0, 12, 6, H - 24).fill("#C9A84C");
    doc.rect(W - 6, 12, 6, H - 24).fill("#C9A84C");

    // Inner border
    doc.rect(30, 30, W - 60, H - 60)
      .lineWidth(1.5)
      .stroke("#C9A84C");

    // ── Header ────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#C9A84C")
      .text("PARADIGM PRO", 0, 55, { align: "center" });

    doc.font("Helvetica")
      .fontSize(8)
      .fillColor("#818cf8")
      .text("CERTIFICATE OF COMPLETION", 0, 72, { align: "center" });

    // Decorative line
    doc.moveTo(W / 2 - 100, 88).lineTo(W / 2 + 100, 88)
      .lineWidth(0.5).stroke("#C9A84C");

    // ── Main text ─────────────────────────────────────────────────────────
    doc.font("Helvetica")
      .fontSize(13)
      .fillColor("#c7d2fe")
      .text("This certifies that", 0, 108, { align: "center" });

    // Student name
    doc.font("Helvetica-Bold")
      .fontSize(36)
      .fillColor("#FFFFFF")
      .text(data.userName, 50, 128, { align: "center", width: W - 100 });

    doc.moveTo(W / 2 - 160, 180).lineTo(W / 2 + 160, 180)
      .lineWidth(0.5).stroke("#C9A84C");

    doc.font("Helvetica")
      .fontSize(13)
      .fillColor("#c7d2fe")
      .text("has successfully completed", 0, 190, { align: "center" });

    // Course name
    doc.font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#f97316")
      .text(data.courseName, 50, 210, { align: "center", width: W - 100 });

    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#c7d2fe")
      .text("A transformational 12-lesson program by Bob Proctor", 0, 244, { align: "center" });

    // ── Date + code ───────────────────────────────────────────────────────
    const dateStr = data.issuedAt.toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#94a3b8")
      .text(`Issued: ${dateStr}`, 60, H - 90);

    doc.font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(`Verification Code: ${data.uniqueCode}`, 60, H - 75);

    doc.font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(`Verify at: ${data.verifyUrl}`, 60, H - 62);

    // Signature line
    doc.moveTo(W - 220, H - 78).lineTo(W - 60, H - 78)
      .lineWidth(0.5).stroke("#C9A84C");
    doc.font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#C9A84C")
      .text("Paradigm Pro", W - 200, H - 68, { align: "center", width: 140 });
    doc.font("Helvetica")
      .fontSize(7)
      .fillColor("#64748b")
      .text("Authorized Signature", W - 200, H - 58, { align: "center", width: 140 });

    doc.end();
  });
}
