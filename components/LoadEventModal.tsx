"use client";

import { useState, useEffect } from "react";
import { loadEvents, deleteEvent, SavedEvent } from "@/lib/supabase";
import { Event } from "@/lib/types";
import { X, Loader2, Trash2, FolderOpen } from "lucide-react";

interface Props {
  onClose: () => void;
  onLoad: (event: Event, id: string) => void;
}

export function LoadEventModal({ onClose, onLoad }: Props) {
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this saved event?")) return;
    const ok = await deleteEvent(id);
    if (ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-divider">
          <div>
            <h2 className="text-xl font-serif font-semibold text-navy">Load Event</h2>
            <p className="text-sm font-sans text-muted mt-0.5">
              Choose a previously saved event
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen size={40} className="mx-auto text-divider mb-3" />
              <p className="text-muted font-serif text-lg">No saved events</p>
              <p className="text-muted/60 text-sm mt-1">
                Save an event from the editor to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 p-4 rounded-lg border border-divider hover:border-gold/50 hover:bg-cream/50 transition-all cursor-pointer group"
                  onClick={() => onLoad(ev.data, ev.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-semibold text-navy truncate">
                      {ev.couple_name}
                    </p>
                    <p className="text-xs font-sans text-muted truncate">
                      {ev.event_date} &middot; {ev.venue}
                    </p>
                    <p className="text-[10px] font-sans text-muted/50 mt-0.5">
                      Last saved{" "}
                      {new Date(ev.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ev.id);
                    }}
                    className="p-2 text-muted/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end px-8 py-4 border-t border-divider bg-cream/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-sans font-semibold hover:bg-navy/90 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
