"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { generateDocx } from "@/lib/docx-export";
import { generatePDF } from "@/lib/pdf-export";
import { FileDown, Check, Loader2 } from "lucide-react";
import { LogoBadgeSVG } from "./LogoBadge";

export function ExportView() {
  const { event } = useAppState();
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportedDocx, setExportedDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);

  async function handleExportDocx() {
    setExportingDocx(true);
    try {
      await generateDocx(event);
      setExportedDocx(true);
      setTimeout(() => setExportedDocx(false), 3000);
    } catch (err) {
      console.error("DOCX export failed:", err);
      alert("DOCX export failed. Check console for details.");
    } finally {
      setExportingDocx(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      generatePDF(event);
      setExportedPdf(true);
      setTimeout(() => setExportedPdf(false), 3000);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Check console for details.");
    } finally {
      setExportingPdf(false);
    }
  }

  // Count stats
  const totalItems = event.days.reduce(
    (sum, d) => sum + d.sections.reduce((s2, sec) => s2 + sec.items.length, 0),
    0
  );
  const vendors = event.parties.filter((p) => p.category === "VENDOR");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold text-navy">Export Timeline</h2>
        <p className="text-muted text-sm">Generate a branded document for your event</p>
      </div>

      {/* Preview card */}
      <div className="bg-surface rounded-xl border border-divider overflow-hidden max-w-xl mx-auto shadow-sm">
        {/* Doc preview header */}
        <div className="px-8 py-8 text-center border-b border-divider">
          <div className="flex justify-center mb-4">
            <LogoBadgeSVG size={72} variant="light" />
          </div>
          <p className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase">
            The Wedding Celebration of
          </p>
          <h3 className="text-2xl font-serif font-bold text-navy mt-2">
            {event.coupleName}
          </h3>
          <p className="text-sm font-serif text-muted mt-1">{event.date}</p>
          <p className="text-sm font-serif text-muted">{event.venue}</p>
        </div>

        {/* Document stats */}
        <div className="px-8 py-5 bg-cream/50 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-serif font-bold text-navy">{event.days.length}</p>
            <p className="text-xs font-sans text-muted uppercase tracking-wider">Days</p>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-navy">{totalItems}</p>
            <p className="text-xs font-sans text-muted uppercase tracking-wider">Items</p>
          </div>
          <div>
            <p className="text-2xl font-serif font-bold text-navy">{vendors.length}</p>
            <p className="text-xs font-sans text-muted uppercase tracking-wider">Vendors</p>
          </div>
        </div>

        {/* Export contents */}
        <div className="px-8 py-5 space-y-3">
          <p className="text-xs font-sans font-semibold text-muted uppercase tracking-wider">
            Document Contents
          </p>
          <ul className="space-y-2 text-sm font-sans text-primary">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Branded header with monogram
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Event details (guest counts, attire, venue)
            </li>
            {event.days.map((day, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-navy" />
                {day.label} ({day.sections.reduce((s, sec) => s + sec.items.length, 0)} items)
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Vendor contact directory ({vendors.length} vendors)
            </li>
          </ul>
        </div>

        {/* Export buttons */}
        <div className="px-8 py-6 border-t border-divider bg-cream/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <button
                onClick={handleExportDocx}
                disabled={exportingDocx}
                className={`w-full py-3 rounded-lg text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-all ${
                  exportedDocx
                    ? "bg-green-600 text-white"
                    : "bg-navy text-white hover:bg-navy/90"
                } disabled:opacity-70`}
              >
                {exportingDocx ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : exportedDocx ? (
                  <>
                    <Check size={16} />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <FileDown size={16} />
                    Download DOCX
                  </>
                )}
              </button>
              <p className="text-center text-xs text-muted mt-2">Microsoft Word</p>
            </div>
            <div>
              <button
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className={`w-full py-3 rounded-lg text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-all ${
                  exportedPdf
                    ? "bg-green-600 text-white"
                    : "bg-navy text-white hover:bg-navy/90"
                } disabled:opacity-70`}
              >
                {exportingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : exportedPdf ? (
                  <>
                    <Check size={16} />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <FileDown size={16} />
                    Download PDF
                  </>
                )}
              </button>
              <p className="text-center text-xs text-muted mt-2">Adobe PDF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
