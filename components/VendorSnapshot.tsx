"use client";

import { useState, useMemo } from "react";
import { useAppState } from "@/lib/store";
import { Party, Section } from "@/lib/types";
import { LogoBadgeSVG } from "./LogoBadge";

import { Users, Printer, EyeOff } from "lucide-react";

type Phase = "preEvent" | "duringEvent" | "postEvent";

/**
 * Classify a section title into a timeline phase based on keywords.
 */
function classifySection(title: string): Phase {
  const t = (title || "").toLowerCase();

  // Pre-event: setup, preparation, hair, makeup, getting ready, rehearsal, welcome, load-in, arrivals
  const preKeywords = [
    "setup", "preparation", "hair", "makeup", "getting ready",
    "rehearsal", "welcome", "load-in", "arrivals", "vendor setup",
    "first look", "photography", "photo", "detail shot",
  ];
  for (const kw of preKeywords) {
    if (t.includes(kw)) return "preEvent";
  }

  // Post-event: sendoff, departure, breakdown, strike, wrap, post
  const postKeywords = [
    "sendoff", "send-off", "departure", "breakdown",
    "strike", "wrap", "post", "after-party", "after party",
  ];
  for (const kw of postKeywords) {
    if (t.includes(kw)) return "postEvent";
  }

  // Default: during event (ceremony, reception, cocktail, dinner, program, etc.)
  return "duringEvent";
}

export function VendorSnapshot() {
  const { event, setEvent } = useAppState();
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  const categories = {
    PLANNING_TEAM: event.parties.filter((p) => p.category === "PLANNING_TEAM"),
    VENDOR: event.parties.filter((p) => p.category === "VENDOR"),
    VENUE: event.parties.filter((p) => p.category === "VENUE"),
  };

  // Pre-compute section phase classifications
  const sectionPhases = useMemo(() => {
    const phases = new Map<string, Phase>();
    for (const day of event.days) {
      for (const section of day.sections) {
        const key = `${day.label}::${section.title || ""}`;
        phases.set(key, classifySection(section.title || ""));
      }
    }
    return phases;
  }, [event]);

  // Check if a section is visible for a given party's scope
  function isSectionInScope(dayLabel: string, section: Section, party: Party): boolean {
    const key = `${dayLabel}::${section.title || ""}`;
    const phase = sectionPhases.get(key) || "duringEvent";
    return party.scope[phase];
  }

  // Pre-compute scope-filtered item counts per party
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const totalCounts: Record<string, number> = {};
    for (const party of event.parties) {
      counts[party.initials] = 0;
      totalCounts[party.initials] = 0;
    }
    for (const day of event.days) {
      for (const section of day.sections) {
        for (const item of section.items) {
          for (const ini of item.initials) {
            if (ini === "ALL") {
              for (const party of event.parties) {
                totalCounts[party.initials] = (totalCounts[party.initials] || 0) + 1;
                if (isSectionInScope(day.label, section, party)) {
                  counts[party.initials] = (counts[party.initials] || 0) + 1;
                }
              }
            } else {
              const party = event.parties.find((p) => p.initials === ini);
              if (party) {
                totalCounts[ini] = (totalCounts[ini] || 0) + 1;
                if (isSectionInScope(day.label, section, party)) {
                  counts[ini] = (counts[ini] || 0) + 1;
                }
              }
            }
          }
        }
      }
    }
    return { filtered: counts, total: totalCounts };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, sectionPhases]);

  const selectedPartyInfo = event.parties.find((p) => p.initials === selectedParty);

  // Collect matching items across all days/sections, respecting scope
  const filteredDays = useMemo(() => {
    if (!selectedParty || !selectedPartyInfo) return [];

    return event.days
      .map((day) => ({
        label: day.label,
        items: day.sections
          .filter((section) => isSectionInScope(day.label, section, selectedPartyInfo))
          .flatMap((section) =>
            section.items.filter(
              (item) =>
                item.initials.includes(selectedParty) || item.initials.includes("ALL")
            )
          ),
      }))
      .filter((day) => day.items.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, selectedParty, selectedPartyInfo, sectionPhases]);

  const totalFilteredItems = filteredDays.reduce((sum, d) => sum + d.items.length, 0);
  const totalUnfilteredItems = selectedParty
    ? itemCounts.total[selectedParty] || 0
    : 0;
  const hiddenCount = totalUnfilteredItems - totalFilteredItems;

  return (
    <div className="space-y-6">
      {/* Filter bar — hidden when printing */}
      <div className="no-print space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-navy">Vendor Snapshot</h2>
            <p className="text-muted text-sm">Select a team member or vendor to see their timeline</p>
          </div>
          {selectedParty && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-sans font-medium hover:bg-navy/90 transition-colors"
            >
              <Printer size={16} />
              Print View
            </button>
          )}
        </div>

        {/* Category groups */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-sans font-semibold text-muted uppercase tracking-wider mb-2">Planning Team</p>
            <div className="flex flex-wrap gap-2">
              {categories.PLANNING_TEAM.map((party) => (
                <PartyChip
                  key={party.initials}
                  party={party}
                  itemCount={itemCounts.filtered[party.initials] || 0}
                  isSelected={selectedParty === party.initials}
                  onClick={() =>
                    setSelectedParty(selectedParty === party.initials ? null : party.initials)
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-sans font-semibold text-muted uppercase tracking-wider mb-2">Vendors</p>
            <div className="flex flex-wrap gap-2">
              {categories.VENDOR.map((party) => (
                <PartyChip
                  key={party.initials}
                  party={party}
                  itemCount={itemCounts.filtered[party.initials] || 0}
                  isSelected={selectedParty === party.initials}
                  onClick={() =>
                    setSelectedParty(selectedParty === party.initials ? null : party.initials)
                  }
                />
              ))}
            </div>
          </div>
          {categories.VENUE.length > 0 && (
            <div>
              <p className="text-xs font-sans font-semibold text-muted uppercase tracking-wider mb-2">Venue</p>
              <div className="flex flex-wrap gap-2">
                {categories.VENUE.map((party) => (
                  <PartyChip
                    key={party.initials}
                    party={party}
                    itemCount={itemCounts.filtered[party.initials] || 0}
                    isSelected={selectedParty === party.initials}
                    onClick={() =>
                      setSelectedParty(selectedParty === party.initials ? null : party.initials)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snapshot view — this is what gets printed */}
      {selectedParty && selectedPartyInfo && (
        <div className="bg-surface rounded-xl border border-divider overflow-hidden shadow-sm print:rounded-none print:border-0 print:shadow-none">
          {/* Header for print */}
          <div className="px-8 py-6 border-b border-divider text-center print:border-b-2 print:border-navy/20 print:py-8">
            <div className="flex justify-center mb-3">
              <LogoBadgeSVG size={56} variant="light" />
            </div>
            <p className="text-[10px] font-sans tracking-[0.3em] text-muted uppercase" style={{ fontVariant: "small-caps" }}>
              Sample Events Studio
            </p>
            <p className="text-[10px] font-sans tracking-[0.25em] text-muted/60 uppercase mt-1">
              The Wedding Celebration of
            </p>
            <h3 className="text-xl font-serif font-semibold text-navy mt-1">{event.coupleName}</h3>
            <p className="text-sm font-serif text-muted mt-0.5">{event.date} — {event.venue}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-navy/5 rounded-full">
              <Users size={14} className="text-navy" />
              <span className="text-sm font-sans font-semibold text-navy">
                {selectedPartyInfo.name}
              </span>
              <span className="text-xs font-sans text-muted">
                — {selectedPartyInfo.role}
              </span>
              <span className="text-xs font-sans text-muted/60">
                ({totalFilteredItems} items)
              </span>
            </div>
          </div>

          {/* Scope editor */}
          <div className="no-print px-8 py-3 border-b border-divider bg-cream/50 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {(["preEvent", "duringEvent", "postEvent"] as const).map((key) => {
                const labels = { preEvent: "Pre-Event", duringEvent: "During Event", postEvent: "Post-Event" };
                const isOn = selectedPartyInfo.scope[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      const next = structuredClone(event);
                      const party = next.parties.find((p) => p.initials === selectedParty);
                      if (party) {
                        party.scope[key] = !party.scope[key];
                        setEvent(next);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-sans font-medium transition-colors border ${
                      isOn
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-muted border-divider hover:border-navy"
                    }`}
                  >
                    {labels[key]}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-sans text-muted/60 italic">
              Controls which timeline phases this vendor receives.
            </p>
          </div>

          {/* Hidden items note */}
          {hiddenCount > 0 && (
            <div className="no-print px-8 py-2 bg-gold/5 border-b border-divider flex items-center gap-2">
              <EyeOff size={13} className="text-gold" />
              <p className="text-xs font-sans text-gold">
                {hiddenCount} {hiddenCount === 1 ? "item" : "items"} hidden by scope filter
              </p>
            </div>
          )}

          {/* Filtered timeline */}
          <div className="divide-y divide-divider">
            {filteredDays.map((day, dayIdx) => (
              <div key={dayIdx}>
                <div className="px-8 py-3 bg-cream">
                  <h4 className="text-sm font-serif font-bold text-navy tracking-wide">
                    {day.label}
                  </h4>
                </div>
                <div className="divide-y divide-divider/50">
                  {day.items.map((item) => (
                    <div key={item.id} className="px-8 py-3 flex items-start gap-4">
                      <span
                        className={`w-[90px] flex-shrink-0 text-right text-sm font-sans tabular-nums ${
                          item.isBold ? "font-bold text-navy" : "text-primary"
                        }`}
                      >
                        {item.time}
                      </span>
                      <div className="w-[60px] flex-shrink-0 flex flex-wrap gap-1">
                        {item.initials.map((ini) => (
                          <span
                            key={ini}
                            className={`text-xs font-sans font-semibold px-1.5 py-0.5 rounded ${
                              ini === selectedParty
                                ? "bg-gold/20 text-gold"
                                : ini === "ALL"
                                ? "bg-gold/10 text-gold/70"
                                : "bg-navy/5 text-navy/50"
                            }`}
                          >
                            {ini}
                          </span>
                        ))}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-sans ${
                            item.isBold ? "font-bold text-navy" : "text-primary"
                          }`}
                        >
                          {item.description}
                        </p>
                        {item.subNote && (
                          <p className="text-xs text-muted italic mt-0.5 font-sans">
                            {item.subNote}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          {selectedPartyInfo.email || selectedPartyInfo.phone ? (
            <div className="px-8 py-4 bg-cream border-t border-divider">
              <p className="text-xs font-sans font-semibold text-muted uppercase tracking-wider mb-1">Contact</p>
              <div className="flex gap-4 text-sm font-sans">
                {selectedPartyInfo.email && (
                  <span className="text-navy">{selectedPartyInfo.email}</span>
                )}
                {selectedPartyInfo.phone && (
                  <span className="text-muted">{selectedPartyInfo.phone}</span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {!selectedParty && (
        <div className="bg-surface rounded-xl border border-divider p-12 text-center">
          <Users size={48} className="mx-auto text-divider mb-4" />
          <p className="text-muted font-serif text-lg">Select a team member or vendor above</p>
          <p className="text-muted/60 text-sm mt-1">Their personalized timeline will appear here</p>
        </div>
      )}
    </div>
  );
}

function PartyChip({
  party,
  itemCount,
  isSelected,
  onClick,
}: {
  party: Party;
  itemCount: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-sans transition-all border ${
        isSelected
          ? "bg-navy text-white border-navy shadow-sm"
          : "bg-white text-primary border-divider hover:border-gold hover:bg-gold/5"
      }`}
    >
      <span className="font-semibold">{party.initials}</span>
      <span className="ml-1.5 text-xs opacity-70">{party.name}</span>
      <span className={`ml-1.5 text-[10px] ${isSelected ? "text-white/60" : "text-muted/50"}`}>
        ({itemCount})
      </span>
    </button>
  );
}
