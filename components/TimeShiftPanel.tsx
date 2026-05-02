"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { shiftTime, parseTime } from "@/lib/time-utils";
import { ArrowRight, X, Check } from "lucide-react";

const PRESETS = [15, 30, 45, 60];

export function TimeShiftPanel({ onClose }: { onClose: () => void }) {
  const { event, setEvent } = useAppState();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showPreview, setShowPreview] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const day = event.days[selectedDay];
  const section = day?.sections[selectedSection];
  const delta = direction === "forward" ? minutes : -minutes;

  function applyShift() {
    const next = structuredClone(event);
    const items = next.days[selectedDay].sections[selectedSection].items;
    for (const item of items) {
      item.time = shiftTime(item.time, delta);
    }
    items.sort((a, b) => parseTime(a.time) - parseTime(b.time));
    setEvent(next);
    setShowPreview(false);
    setJustApplied(true);
    setTimeout(() => {
      setJustApplied(false);
      onClose();
    }, 2000);
  }

  return (
    <div className="bg-surface rounded-xl border border-divider p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-navy">Global Time Shift</h3>
        <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Applied confirmation */}
      {justApplied && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gold/10 border border-gold/30 rounded-lg animate-pulse">
          <Check size={16} className="text-gold" />
          <span className="text-sm font-sans font-medium text-navy">
            Time shift applied — {direction === "forward" ? "+" : "−"}{minutes} minutes to {section?.title || "section"}
          </span>
        </div>
      )}

      {!justApplied && (
        <>
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            {/* Day selector */}
            <div>
              <label className="block text-xs font-sans font-medium text-muted mb-1 uppercase tracking-wider">Day</label>
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(Number(e.target.value));
                  setSelectedSection(0);
                  setShowPreview(false);
                }}
                className="w-full px-3 py-2 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {event.days.map((d, i) => (
                  <option key={i} value={i}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Section selector */}
            <div>
              <label className="block text-xs font-sans font-medium text-muted mb-1 uppercase tracking-wider">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(Number(e.target.value));
                  setShowPreview(false);
                }}
                className="w-full px-3 py-2 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {day?.sections.map((s, i) => (
                  <option key={i} value={i}>{s.title || `Section ${i + 1}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Direction */}
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-divider overflow-hidden">
              <button
                onClick={() => { setDirection("forward"); setShowPreview(false); }}
                className={`px-4 py-2 text-sm font-sans font-medium transition-colors ${
                  direction === "forward" ? "bg-navy text-white" : "bg-white text-muted hover:bg-cream"
                }`}
              >
                Later (+)
              </button>
              <button
                onClick={() => { setDirection("backward"); setShowPreview(false); }}
                className={`px-4 py-2 text-sm font-sans font-medium transition-colors border-l border-divider ${
                  direction === "backward" ? "bg-navy text-white" : "bg-white text-muted hover:bg-cream"
                }`}
              >
                Earlier (−)
              </button>
            </div>

            {/* Preset buttons */}
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setMinutes(p); setShowPreview(false); }}
                  className={`px-3 py-2 text-sm font-sans font-medium rounded-lg transition-colors ${
                    minutes === p
                      ? "bg-gold text-white"
                      : "bg-cream border border-divider text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {p}m
                </button>
              ))}
            </div>

            {/* Custom minutes input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minutes}
                onChange={(e) => {
                  setMinutes(Math.max(1, parseInt(e.target.value) || 0));
                  setShowPreview(false);
                }}
                min={1}
                max={480}
                className="w-16 px-2 py-2 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold text-center"
              />
              <span className="text-xs font-sans text-muted">min</span>
            </div>

            {/* Preview button */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="ml-auto px-4 py-2 bg-cream border border-divider rounded-lg text-sm font-sans font-medium text-navy hover:bg-gold/10 transition-colors"
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </button>
          </div>

          {/* Preview */}
          {showPreview && section && (
            <div className="bg-cream rounded-lg border border-divider overflow-hidden">
              <div className="px-4 py-2 bg-navy/5 border-b border-divider">
                <p className="text-xs font-sans font-semibold text-navy uppercase tracking-wider">
                  {section.title} — {direction === "forward" ? "+" : "−"}{minutes} min
                </p>
              </div>
              <div className="divide-y divide-border/50">
                {section.items.map((item) => (
                  <div key={item.id} className="px-4 py-2 flex items-center gap-4">
                    <span className="text-sm font-sans tabular-nums text-muted w-[80px] text-right line-through">
                      {item.time}
                    </span>
                    <ArrowRight size={14} className="text-gold flex-shrink-0" />
                    <span className="text-sm font-sans tabular-nums text-navy font-semibold w-[80px]">
                      {shiftTime(item.time, delta)}
                    </span>
                    <span className="text-sm font-sans text-primary truncate">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply */}
          {showPreview && (
            <div className="flex justify-end">
              <button
                onClick={applyShift}
                className="px-6 py-2.5 bg-gold text-white rounded-lg text-sm font-sans font-semibold hover:bg-gold/90 transition-colors"
              >
                Apply Time Shift
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
