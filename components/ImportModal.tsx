"use client";

import { useState, useRef, useCallback } from "react";
import { useAppState } from "@/lib/store";
import { parseSpreadsheet, mergeDays, generateBlankTemplate } from "@/lib/excel-import";
import { X, Upload, FileSpreadsheet, Check, AlertTriangle, Download } from "lucide-react";

export function ImportModal({ onClose }: { onClose: () => void }) {
  const { event, setEvent } = useAppState();
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{
    itemCount: number;
    sectionCount: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "csv" && ext !== "xls") {
        setError("Unsupported file type. Please use .xlsx, .xls, or .csv");
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const parsed = parseSpreadsheet(buffer);

        if (parsed.itemCount === 0) {
          setError("No items found in the spreadsheet. Check column headers: Day, Section, Time, Initials, Description, Sub-note, Bold");
          return;
        }

        const mergedDays = mergeDays(event.days, parsed.days);
        const next = structuredClone(event);
        next.days = mergedDays;
        setEvent(next);

        setResult({
          itemCount: parsed.itemCount,
          sectionCount: parsed.sectionCount,
          errors: parsed.errors,
        });
      } catch (err) {
        console.error("Import failed:", err);
        setError("Failed to parse file. Ensure it's a valid spreadsheet.");
      }
    },
    [event, setEvent]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDownloadTemplate() {
    const buf = generateBlankTemplate();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-divider">
          <div>
            <h2 className="text-xl font-serif font-semibold text-navy">
              Import from Spreadsheet
            </h2>
            <p className="text-sm font-sans text-muted mt-0.5">
              Upload an Excel or CSV file to add timeline items
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Success message */}
          {result && (
            <div className="flex items-start gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-sans font-semibold text-green-800">
                  Imported {result.itemCount} items across {result.sectionCount} sections
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs font-sans text-amber-700">
                        <AlertTriangle size={12} className="inline mr-1" />
                        {e}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-red-700">{error}</p>
            </div>
          )}

          {/* Drop zone */}
          {!result && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-gold bg-gold/5"
                  : "border-divider hover:border-gold/50 hover:bg-cream/50"
              }`}
            >
              <Upload
                size={40}
                className={`mx-auto mb-3 ${dragOver ? "text-gold" : "text-divider"}`}
              />
              <p className="text-sm font-sans font-medium text-navy">
                Drop a spreadsheet here or click to browse
              </p>
              <p className="text-xs font-sans text-muted mt-1">
                Supports .xlsx, .xls, .csv
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Column spec */}
          <div className="bg-cream/50 rounded-lg border border-divider px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet size={14} className="text-navy" />
              <p className="text-xs font-sans font-semibold text-navy uppercase tracking-wider">
                Expected Columns
              </p>
            </div>
            <div className="grid grid-cols-4 gap-x-3 gap-y-1 text-xs font-sans">
              <span className="text-navy font-medium">Day</span>
              <span className="text-navy font-medium">Section</span>
              <span className="text-navy font-medium">Time</span>
              <span className="text-navy font-medium">Initials</span>
              <span className="text-navy font-medium">Description</span>
              <span className="text-navy font-medium">Sub-note</span>
              <span className="text-navy font-medium">Bold</span>
              <span />
            </div>
            <p className="text-[10px] font-sans text-muted mt-2">
              Initials: comma or space separated (e.g. &quot;LP, AP&quot;). Bold: yes/no.
            </p>
          </div>

          {/* Download template */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm font-sans font-medium text-gold hover:text-gold/80 transition-colors"
          >
            <Download size={14} />
            Download blank template (.xlsx)
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-8 py-4 border-t border-divider bg-cream/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-sans font-semibold hover:bg-navy/90 transition-colors"
          >
            {result ? "Done" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
