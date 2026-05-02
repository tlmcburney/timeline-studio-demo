import jsPDF from "jspdf";
import { Event } from "./types";

const NAVY = "#1C1C2E";
const GOLD = "#C9A84C";
const MUTED = "#6B6B6B";
const BLACK = "#1A1A1A";

const PAGE_W = 215.9; // US Letter mm
const PAGE_H = 279.4;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2; // 175.9mm

const COL_INITIALS_X = 55;       // 55mm
const COL_DESC_X = 80;           // 80mm
const COL_DESC_W = MARGIN + CONTENT_W - COL_DESC_X; // wraps to right margin

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

/**
 * Split text into lines that fit within maxWidth at the current font settings.
 */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (doc.getTextWidth(test) > maxWidth) {
      if (current) lines.push(current);
      // If a single word is wider than maxWidth, force it on its own line
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function drawPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(
      `Page ${i} of ${pageCount}`,
      PAGE_W / 2,
      PAGE_H - 10,
      { align: "center" }
    );
  }
}

export function generatePDF(event: Event): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });
  let y = MARGIN;

  // ── Cover header ──────────────────────────────────────

  // "THE WEDDING CELEBRATION OF"
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.setCharSpace(1.5);
  doc.text("THE WEDDING CELEBRATION OF", PAGE_W / 2, y, { align: "center" });
  doc.setCharSpace(0);
  y += 8;

  // Couple name
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  doc.text(event.coupleName, PAGE_W / 2, y, { align: "center" });
  y += 7;

  // Date
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(event.date, PAGE_W / 2, y, { align: "center" });
  y += 5;

  // Venue
  doc.text(event.venue, PAGE_W / 2, y, { align: "center" });
  y += 6;

  // Guest counts
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  const guestStr = event.guestCounts
    .map((gc) => `${gc.label}: ${gc.count} guests`)
    .join("  |  ");
  doc.text(guestStr, PAGE_W / 2, y, { align: "center" });
  y += 5;

  // Attire
  const attireStr =
    "Attire: " +
    event.attire.map((a) => `${a.occasion}: ${a.dress}`).join("  |  ");
  doc.setFont("Helvetica", "italic");
  doc.text(attireStr, PAGE_W / 2, y, { align: "center" });
  y += 4;

  // Gold divider
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 8;

  // ── Days and sections ─────────────────────────────────

  for (const day of event.days) {
    // Day header
    y = ensureSpace(doc, y, 14);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(NAVY);
    const dayLabel = day.label
      .replace(/---/g, "\u2014")
      .replace(/ — /g, " \u2014 ")
      .toUpperCase();
    doc.text(dayLabel, MARGIN, y);
    y += 2;

    // Gold rule under day header
    doc.setDrawColor(GOLD);
    doc.setLineWidth(0.5 * 0.352778); // 0.5pt in mm
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 6;

    for (const section of day.sections) {
      // Section header
      if (section.title) {
        y = ensureSpace(doc, y, 10);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NAVY);
        doc.text(section.title.toUpperCase(), MARGIN, y);
        y += 5;
      }

      // Timeline items
      for (const item of section.items) {
        // Pre-calculate description height for page break check
        const descFont = item.isBold ? "bold" : "normal";
        doc.setFont("Helvetica", descFont);
        doc.setFontSize(9);
        const descLines = wrapText(doc, item.description, COL_DESC_W);
        const descHeight = descLines.length * 3.5;

        let subLines: string[] = [];
        let subHeight = 0;
        if (item.subNote) {
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(8);
          subLines = wrapText(doc, item.subNote, COL_DESC_W);
          subHeight = subLines.length * 3.2;
        }

        const rowHeight = descHeight + subHeight + 2;
        y = ensureSpace(doc, y, rowHeight);

        // Time column
        const timeFont = item.isBold ? "bold" : "normal";
        doc.setFont("Helvetica", timeFont);
        doc.setFontSize(9);
        doc.setTextColor(item.isBold ? NAVY : BLACK);
        doc.text(item.time, COL_INITIALS_X - 3, y, { align: "right" });

        // Initials column
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NAVY);
        doc.text(item.initials.join("/"), COL_INITIALS_X, y);

        // Description column
        doc.setFont("Helvetica", descFont);
        doc.setFontSize(9);
        doc.setTextColor(item.isBold ? NAVY : BLACK);
        for (let i = 0; i < descLines.length; i++) {
          doc.text(descLines[i], COL_DESC_X, y + i * 3.5);
        }
        y += descHeight;

        // Sub-note
        if (item.subNote && subLines.length > 0) {
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(MUTED);
          for (let i = 0; i < subLines.length; i++) {
            doc.text(subLines[i], COL_DESC_X, y + i * 3.2);
          }
          y += subHeight;
        }

        y += 2; // row gap
      }

      y += 3; // section gap
    }

    y += 4; // day gap
  }

  // ── Vendor contact table ──────────────────────────────

  const vendorParties = event.parties.filter(
    (p) => p.category === "VENDOR" || p.category === "VENUE"
  );

  if (vendorParties.length > 0) {
    y = ensureSpace(doc, y, 20);

    // Section header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(NAVY);
    doc.text("VENDOR CONTACT DIRECTORY", MARGIN, y);
    y += 2;
    doc.setDrawColor(NAVY);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 5;

    const colLeft = MARGIN;
    const colRight = MARGIN + CONTENT_W / 2 + 5;

    for (let i = 0; i < vendorParties.length; i++) {
      const v = vendorParties[i];
      y = ensureSpace(doc, y, 8);

      // Left: initials + name
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(NAVY);
      doc.text(v.initials, colLeft, y);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(BLACK);
      doc.text(v.name, colLeft + 12, y);

      // Right: role + phone + email
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(MUTED);
      const contactParts = [v.role];
      if (v.phone) contactParts.push(v.phone);
      if (v.email) contactParts.push(v.email);
      doc.text(contactParts.join("  |  "), colRight, y);

      y += 4;

      // Divider line between rows
      if (i < vendorParties.length - 1) {
        doc.setDrawColor("#E8E2D9");
        doc.setLineWidth(0.15);
        doc.line(MARGIN, y - 1, MARGIN + CONTENT_W, y - 1);
      }
    }

    y += 4;
  }

  // ── Planning Team table ──────────────────────────────

  const planningTeam = event.parties.filter((p) => p.category === "PLANNING_TEAM");

  if (planningTeam.length > 0) {
    y = ensureSpace(doc, y, 20);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(NAVY);
    doc.text("PLANNING TEAM", MARGIN, y);
    y += 2;
    doc.setDrawColor(NAVY);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 5;

    const colLeft = MARGIN;
    const colRight = MARGIN + CONTENT_W / 2 + 5;

    for (let i = 0; i < planningTeam.length; i++) {
      const m = planningTeam[i];
      y = ensureSpace(doc, y, 8);

      // Left: initials + name
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(NAVY);
      doc.text(m.initials, colLeft, y);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(BLACK);
      doc.text(m.name, colLeft + 12, y);

      // Right: role + email
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(MUTED);
      const parts = [m.role];
      if (m.email) parts.push(m.email);
      doc.text(parts.join("  |  "), colRight, y);

      y += 4;

      if (i < planningTeam.length - 1) {
        doc.setDrawColor("#E8E2D9");
        doc.setLineWidth(0.15);
        doc.line(MARGIN, y - 1, MARGIN + CONTENT_W, y - 1);
      }
    }
  }

  // ── Page numbers ──────────────────────────────────────
  drawPageNumbers(doc);

  // ── Download ──────────────────────────────────────────
  const safeName = event.coupleName.replace(/[^a-zA-Z0-9\s&]/g, "").replace(/\s+/g, "-");
  doc.save(`Timeline-${safeName}.pdf`);
}
