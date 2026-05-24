import type { jsPDF } from "jspdf";

const WATERMARK_LINES = [
  "MINISTRY OF HEALTH",
  "NATIONAL REFERRAL HUB",
  "AGGREGATE DATA ONLY",
];

/** Diagonal watermark on every page of an MoH analytics PDF export */
export function addMohPdfWatermark(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    // Draw behind content (call before save; re-call after content if needed — we run after tables)
    const gState = (doc as jsPDF & { GState?: new (opts: { opacity: number }) => unknown })
      .GState;
    if (gState) {
      doc.setGState(new gState({ opacity: 0.12 }));
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);

    WATERMARK_LINES.forEach((line, index) => {
      doc.setFontSize(index === 0 ? 42 : 18);
      doc.text(line, centerX, centerY - 20 + index * 22, {
        align: "center",
        angle: 35,
      });
    });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    if (gState) {
      doc.setGState(new gState({ opacity: 1 }));
    }
  }
}
