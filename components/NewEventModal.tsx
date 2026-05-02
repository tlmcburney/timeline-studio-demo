"use client";

import { useState } from "react";
import { Event, Party } from "@/lib/types";
import { templates } from "@/lib/templates";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreate: (event: Event) => void;
}

const defaultPlanningTeam: Party[] = [
  {
    initials: "LP",
    name: "Lead Planner",
    role: "Lead Planner",
    category: "PLANNING_TEAM",
    email: "lead@sampleevents.demo",
    scope: { preEvent: true, duringEvent: true, postEvent: true },
  },
  {
    initials: "AP",
    name: "Asst Planner",
    role: "Senior Coordinator",
    category: "PLANNING_TEAM",
    email: "coordinator@sampleevents.demo",
    scope: { preEvent: true, duringEvent: true, postEvent: true },
  },
  {
    initials: "C1",
    name: "Coordinator 1",
    role: "Coordinator",
    category: "PLANNING_TEAM",
    email: "coord1@sampleevents.demo",
    scope: { preEvent: true, duringEvent: true, postEvent: true },
  },
  {
    initials: "C2",
    name: "Coordinator 2",
    role: "Coordinator",
    category: "PLANNING_TEAM",
    email: "coord2@sampleevents.demo",
    scope: { preEvent: true, duringEvent: true, postEvent: true },
  },
  {
    initials: "A1",
    name: "Assistant 1",
    role: "Assistant",
    category: "PLANNING_TEAM",
    email: "asst1@sampleevents.demo",
    scope: { preEvent: true, duringEvent: true, postEvent: true },
  },
  {
    initials: "A2",
    name: "Assistant 2",
    role: "Assistant",
    category: "PLANNING_TEAM",
    email: "asst2@sampleevents.demo",
    scope: { preEvent: true, duringEvent: true, postEvent: true },
  },
];

export function NewEventModal({ onClose, onCreate }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [coupleName, setCoupleName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const canProceed = coupleName.trim() && date.trim() && venue.trim();

  function handleCreate() {
    if (selectedTemplate === null) return;
    const template = templates[selectedTemplate];
    const event: Event = {
      coupleName: coupleName.trim(),
      date: date.trim(),
      venue: venue.trim(),
      guestCounts: [{ label: "Wedding", count: 0 }],
      attire: [{ occasion: "Wedding", dress: "" }],
      parties: [...defaultPlanningTeam],
      days: template.days(),
    };
    onCreate(event);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-divider">
          <div>
            <h2 className="text-xl font-serif font-semibold text-navy">
              {step === 1 ? "New Event" : "Choose a Template"}
            </h2>
            <p className="text-sm font-sans text-muted mt-0.5">
              {step === 1
                ? "Enter the basic event details"
                : "Select a timeline template to start from"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="px-8 py-6 space-y-5">
            <div>
              <label className="block text-xs font-sans font-medium text-muted uppercase tracking-wider mb-1.5">
                Couple Name
              </label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="e.g. Sarah & Michael"
                className="w-full px-4 py-2.5 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold placeholder:text-muted/40"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-muted uppercase tracking-wider mb-1.5">
                Event Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Saturday, June 14, 2025"
                className="w-full px-4 py-2.5 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold placeholder:text-muted/40"
              />
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-muted uppercase tracking-wider mb-1.5">
                Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. The Grand Ballroom"
                className="w-full px-4 py-2.5 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold placeholder:text-muted/40"
              />
            </div>
          </div>
        )}

        {/* Step 2: Template Picker */}
        {step === 2 && (
          <div className="px-8 py-6">
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTemplate(i)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedTemplate === i
                      ? "border-gold bg-gold/5 shadow-sm"
                      : "border-divider hover:border-gold/50 hover:bg-cream/50"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-semibold text-navy">
                        {t.name}
                      </p>
                      <p className="text-xs font-sans text-muted mt-0.5 leading-relaxed">
                        {t.description}
                      </p>
                      <p className="text-[10px] font-sans text-muted/50 mt-1.5">
                        {t.days().length} {t.days().length === 1 ? "day" : "days"} &middot;{" "}
                        {t.days().reduce(
                          (sum, d) =>
                            sum + d.sections.reduce((s, sec) => s + sec.items.length, 0),
                          0
                        )}{" "}
                        items
                      </p>
                    </div>
                    {selectedTemplate === i && (
                      <Check size={18} className="text-gold flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-divider bg-cream/30">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-sans font-medium text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-sans font-semibold hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Choose Template
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={selectedTemplate === null}
              className="flex items-center gap-2 px-6 py-2.5 bg-gold text-white rounded-lg text-sm font-sans font-semibold hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={16} />
              Create Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
