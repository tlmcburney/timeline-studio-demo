"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AppContext } from "@/lib/store";
import { Event } from "@/lib/types";
import { sampleEvent } from "@/lib/sample-data";
import { LogoBadgeSVG } from "@/components/LogoBadge";
import { TimelineEditor } from "@/components/TimelineEditor";
import { VendorSnapshot } from "@/components/VendorSnapshot";
import { ExportView } from "@/components/ExportView";
import { NewEventModal } from "@/components/NewEventModal";
import { ImportModal } from "@/components/ImportModal";
import { LoadEventModal } from "@/components/LoadEventModal";
import { isSupabaseConfigured, saveEvent } from "@/lib/supabase";
import { Clock, Users, FileDown, Plus, FileSpreadsheet, FolderOpen, Save, Check, Loader2 } from "lucide-react";

type View = "editor" | "vendor" | "export";

const navItems: { key: View; label: string; icon: typeof Clock }[] = [
  { key: "editor", label: "Timeline", icon: Clock },
  { key: "vendor", label: "Vendors", icon: Users },
  { key: "export", label: "Export", icon: FileDown },
];

const viewTitles: Record<View, { title: string; subtitle: (e: Event) => string }> = {
  editor: {
    title: "Wedding Timeline",
    subtitle: (e) => `${e.coupleName} — ${e.date}`,
  },
  vendor: {
    title: "Vendor Snapshot",
    subtitle: (e) => `${e.coupleName} — ${e.venue}`,
  },
  export: {
    title: "Export Timeline",
    subtitle: (e) => `${e.coupleName} — ${e.date}`,
  },
};

export default function Home() {
  const [event, setEvent] = useState<Event>(structuredClone(sampleEvent));
  const [activeView, setActiveView] = useState<View>("editor");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showLoadEvent, setShowLoadEvent] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const hasSupabase = isSupabaseConfigured();
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSetEvent = useCallback((e: Event) => setEvent(e), []);

  // Auto-save with 3-second debounce when Supabase is configured
  useEffect(() => {
    if (!hasSupabase) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      const id = await saveEvent(event, eventId || undefined);
      if (id) {
        setEventId(id);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("idle");
      }
    }, 3000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [event, hasSupabase, eventId]);

  async function handleManualSave() {
    if (!hasSupabase) return;
    setSaveStatus("saving");
    const id = await saveEvent(event, eventId || undefined);
    if (id) {
      setEventId(id);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("idle");
    }
  }
  const { title, subtitle } = viewTitles[activeView];

  return (
    <AppContext.Provider value={{ event, setEvent: handleSetEvent }}>
      <div className="flex flex-row min-h-screen">
        {/* ── Sidebar ─────────────────────────────────── */}
        <aside className="w-[240px] flex-shrink-0 bg-navy flex flex-col h-screen sticky top-0">
          {/* Brand */}
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <LogoBadgeSVG size={40} variant="dark" />
              <div>
                <h1 className="text-white text-lg font-serif font-semibold tracking-wide leading-tight">
                  Timeline Studio
                </h1>
                <p className="text-gold text-[10px] font-sans tracking-widest uppercase" style={{ fontVariant: "small-caps" }}>
                  Sample Events Studio
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gold/40" />

          {/* Event info */}
          <div className="px-5 py-4">
            <p className="text-white/80 text-sm font-serif leading-snug">{event.coupleName}</p>
            <p className="text-white/50 text-xs font-sans mt-0.5">{event.date}</p>
            <p className="text-white/40 text-xs font-sans mt-0.5">{event.venue}</p>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gold/40" />

          {/* Nav */}
          <nav className="flex-1 py-4">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-sans font-medium transition-colors relative ${
                  activeView === key
                    ? "text-gold"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                {activeView === key && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-gold rounded-r" />
                )}
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="px-5 pb-3 space-y-2">
            <button
              onClick={() => setShowNewEvent(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold/20 text-gold rounded-lg text-sm font-sans font-medium hover:bg-gold/30 transition-colors border border-gold/30"
            >
              <Plus size={16} />
              New Event
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white/40 text-xs font-sans font-medium hover:text-white/60 transition-colors"
            >
              <FileSpreadsheet size={14} />
              Import Spreadsheet
            </button>
            {hasSupabase && (
              <button
                onClick={() => setShowLoadEvent(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white/40 text-xs font-sans font-medium hover:text-white/60 transition-colors"
              >
                <FolderOpen size={14} />
                Load Event
              </button>
            )}
          </div>

          {/* Version */}
          <div className="px-5 pb-5">
            <p className="text-white/20 text-[10px] font-sans">v1.0 prototype</p>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────── */}
        <main className="flex-1 bg-cream overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {/* Page title bar */}
            <div className="flex items-end justify-between pb-5 mb-6 border-b border-gold/20">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-navy">{title}</h2>
                <p className="text-muted text-sm font-sans mt-0.5">{subtitle(event)}</p>
              </div>
              {/* Save button */}
              {hasSupabase && (
                <button
                  onClick={handleManualSave}
                  disabled={saveStatus === "saving"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all ${
                    saveStatus === "saved"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : saveStatus === "saving"
                      ? "bg-cream text-muted border border-divider"
                      : "bg-navy text-white hover:bg-navy/90"
                  }`}
                >
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <Check size={14} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save
                    </>
                  )}
                </button>
              )}
            </div>

            {activeView === "editor" && <TimelineEditor />}
            {activeView === "vendor" && <VendorSnapshot />}
            {activeView === "export" && <ExportView />}
          </div>
        </main>
      </div>

      {showNewEvent && (
        <NewEventModal
          onClose={() => setShowNewEvent(false)}
          onCreate={(newEvent) => {
            setEvent(newEvent);
            setEventId(null);
            setShowNewEvent(false);
            setActiveView("editor");
          }}
        />
      )}
      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} />
      )}
      {showLoadEvent && (
        <LoadEventModal
          onClose={() => setShowLoadEvent(false)}
          onLoad={(loadedEvent, id) => {
            setEvent(loadedEvent);
            setEventId(id);
            setShowLoadEvent(false);
            setActiveView("editor");
          }}
        />
      )}
    </AppContext.Provider>
  );
}
