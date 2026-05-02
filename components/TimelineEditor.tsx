"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { TimelineItem } from "@/lib/types";
import { generateId, parseTime, normalizeTime } from "@/lib/time-utils";
import { Plus, Trash2, ChevronDown, ChevronUp, Clock, Pencil, GripVertical } from "lucide-react";
import { TimeShiftPanel } from "./TimeShiftPanel";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function TimelineEditor() {
  const { event, setEvent } = useAppState();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showTimeShift, setShowTimeShift] = useState(false);
  const [addingToSection, setAddingToSection] = useState<{ dayIdx: number; secIdx: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function updateItem(dayIdx: number, secIdx: number, itemIdx: number, updates: Partial<TimelineItem>) {
    const next = structuredClone(event);
    Object.assign(next.days[dayIdx].sections[secIdx].items[itemIdx], updates);
    setEvent(next);
  }

  function deleteItem(dayIdx: number, secIdx: number, itemIdx: number) {
    const next = structuredClone(event);
    next.days[dayIdx].sections[secIdx].items.splice(itemIdx, 1);
    setEvent(next);
  }

  function handleDragEnd(dayIdx: number, secIdx: number, e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const next = structuredClone(event);
    const items = next.days[dayIdx].sections[secIdx].items;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    next.days[dayIdx].sections[secIdx].items = arrayMove(items, oldIndex, newIndex);
    setEvent(next);
  }

  // All party initials for the chip picker
  const allInitials = [
    "ALL",
    ...event.parties.map((p) => p.initials),
  ];

  return (
    <div className="space-y-6">
      {/* Time Shift toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-navy">Wedding Timeline</h2>
          <p className="text-muted text-sm">{event.venue} — {event.guestCounts.map(g => `${g.count} ${g.label}`).join(", ")}</p>
        </div>
        <button
          onClick={() => setShowTimeShift(!showTimeShift)}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-sans font-medium hover:bg-navy/90 transition-colors"
        >
          <Clock size={16} />
          Time Shift
          {showTimeShift ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {showTimeShift && <TimeShiftPanel onClose={() => setShowTimeShift(false)} />}

      {/* Days and sections */}
      {event.days.map((day, dayIdx) => (
        <div key={dayIdx} className="space-y-4">
          <h3 className="text-lg font-serif font-bold text-navy border-b-2 border-navy pb-2 tracking-wide">
            {day.label}
          </h3>

          {day.sections.map((section, secIdx) => (
            <div key={secIdx} className="bg-surface rounded-xl border border-divider overflow-hidden shadow-sm">
              {section.title && (
                <div className="bg-cream px-5 py-3 border-b border-divider">
                  <h4 className="text-xs font-sans font-semibold tracking-[0.2em] text-muted uppercase">
                    {section.title}
                  </h4>
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(dayIdx, secIdx, e)}
              >
                <SortableContext
                  items={section.items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-border/50">
                    {section.items.map((item, itemIdx) => (
                      <SortableTimelineItem
                        key={item.id}
                        item={item}
                        isEditing={editingItemId === item.id}
                        onStartEdit={() => setEditingItemId(item.id)}
                        onStopEdit={() => setEditingItemId(null)}
                        onUpdate={(updates) => updateItem(dayIdx, secIdx, itemIdx, updates)}
                        onDelete={() => deleteItem(dayIdx, secIdx, itemIdx)}
                        allInitials={allInitials}
                      />
                    ))}

                    {/* Add new item form */}
                    {addingToSection?.dayIdx === dayIdx && addingToSection?.secIdx === secIdx ? (
                      <NewItemForm
                        allInitials={allInitials}
                        onSave={(item) => {
                          const next = structuredClone(event);
                          next.days[dayIdx].sections[secIdx].items.push(item);
                          next.days[dayIdx].sections[secIdx].items.sort(
                            (a, b) => parseTime(a.time) - parseTime(b.time)
                          );
                          setEvent(next);
                          setAddingToSection(null);
                        }}
                        onCancel={() => setAddingToSection(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setAddingToSection({ dayIdx, secIdx })}
                        className="w-full px-5 py-3 text-sm text-muted hover:text-gold hover:bg-cream/50 transition-colors flex items-center gap-2 font-sans"
                      >
                        <Plus size={14} />
                        Add item
                      </button>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Sortable wrapper ─────────────────────────────────────── */

function SortableTimelineItem(props: {
  item: TimelineItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (updates: Partial<TimelineItem>) => void;
  onDelete: () => void;
  allInitials: string[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TimelineItemRow
        {...props}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

/* ── Item row ─────────────────────────────────────────────── */

function TimelineItemRow({
  item,
  isEditing,
  onStartEdit,
  onStopEdit,
  onUpdate,
  onDelete,
  allInitials,
  dragListeners,
}: {
  item: TimelineItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (updates: Partial<TimelineItem>) => void;
  onDelete: () => void;
  allInitials: string[];
  dragListeners?: Record<string, unknown>;
  isDragging?: boolean;
}) {
  const [editState, setEditState] = useState<Partial<TimelineItem>>({});

  if (isEditing) {
    const current = { ...item, ...editState };
    const currentInitials = editState.initials ?? item.initials;

    return (
      <div className="px-5 py-4 bg-cream/30 space-y-3">
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <TimeInput
            value={current.time}
            onChange={(time) => setEditState({ ...editState, time })}
          />
          <input
            type="text"
            value={current.description}
            onChange={(e) => setEditState({ ...editState, description: e.target.value })}
            className="px-3 py-2 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold"
            placeholder="Description"
          />
        </div>

        {/* Initials chip picker */}
        <div>
          <p className="text-xs font-sans text-muted mb-1.5">Assigned to:</p>
          <InitialsChipPicker
            selected={currentInitials}
            allInitials={allInitials}
            onChange={(initials) => setEditState({ ...editState, initials })}
          />
        </div>

        <div className="grid grid-cols-[110px_1fr] gap-3">
          <label className="flex items-center gap-2 text-xs text-muted font-sans">
            <input
              type="checkbox"
              checked={current.isBold ?? false}
              onChange={(e) => setEditState({ ...editState, isBold: e.target.checked })}
              className="accent-gold"
            />
            Key moment
          </label>
          <input
            type="text"
            value={current.subNote ?? ""}
            onChange={(e) => setEditState({ ...editState, subNote: e.target.value || undefined })}
            className="px-3 py-2 border border-divider rounded-lg text-sm font-sans italic bg-white focus:outline-none focus:ring-1 focus:ring-gold"
            placeholder="Sub-note (italic)"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { onStopEdit(); setEditState({}); }}
            className="px-3 py-1.5 text-sm text-muted hover:text-primary transition-colors font-sans"
          >
            Cancel
          </button>
          <button
            onClick={() => { onUpdate(editState); onStopEdit(); setEditState({}); }}
            className="px-4 py-1.5 bg-navy text-white rounded-lg text-sm font-sans font-medium hover:bg-navy/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group px-5 py-3 flex items-start gap-3 hover:bg-cream/30 transition-colors cursor-pointer ${
        item.isBold ? "bg-gold/5" : ""
      }`}
      onClick={onStartEdit}
    >
      {/* Drag handle */}
      <button
        className="flex-shrink-0 mt-0.5 p-0.5 text-muted hover:text-navy transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
        {...dragListeners}
      >
        <GripVertical size={14} />
      </button>

      {/* Time */}
      <div className="w-[80px] flex-shrink-0 text-right">
        <span className={`text-sm font-sans tabular-nums ${item.isBold ? "font-bold text-navy" : "text-primary"}`}>
          {item.time}
        </span>
      </div>

      {/* Initials */}
      <div className="w-[80px] flex-shrink-0 flex flex-wrap gap-1">
        {item.initials.map((ini) => (
          <span
            key={ini}
            className={`text-xs font-sans font-semibold px-1.5 py-0.5 rounded ${
              ini === "ALL"
                ? "bg-gold/20 text-gold"
                : "bg-navy/10 text-navy"
            }`}
          >
            {ini}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-sans ${item.isBold ? "font-bold text-navy" : "text-primary"}`}>
          {item.description}
        </p>
        {item.subNote && (
          <p className="text-xs text-muted italic mt-0.5 font-sans">{item.subNote}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
          className="p-1 text-muted hover:text-navy transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-muted hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Initials chip picker ─────────────────────────────────── */

function InitialsChipPicker({
  selected,
  allInitials,
  onChange,
}: {
  selected: string[];
  allInitials: string[];
  onChange: (initials: string[]) => void;
}) {
  function toggle(ini: string) {
    if (ini === "ALL") {
      onChange(selected.includes("ALL") ? [] : ["ALL"]);
      return;
    }
    // If selecting a specific person, remove ALL
    let next = selected.filter((s) => s !== "ALL");
    if (next.includes(ini)) {
      next = next.filter((s) => s !== ini);
    } else {
      next = [...next, ini];
    }
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {allInitials.map((ini) => (
        <button
          key={ini}
          type="button"
          onClick={() => toggle(ini)}
          className={`px-2 py-1 text-xs font-sans font-semibold rounded transition-colors ${
            selected.includes(ini)
              ? ini === "ALL"
                ? "bg-gold text-white"
                : "bg-navy text-white"
              : "bg-white border border-divider text-muted hover:border-navy hover:text-navy"
          }`}
        >
          {ini}
        </button>
      ))}
    </div>
  );
}

/* ── Time input with auto-format ──────────────────────────── */

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [raw, setRaw] = useState(value);
  const [error, setError] = useState(false);

  function handleBlur() {
    const normalized = normalizeTime(raw);
    if (normalized) {
      setRaw(normalized);
      onChange(normalized);
      setError(false);
    } else if (raw.trim()) {
      setError(true);
    }
  }

  return (
    <input
      type="text"
      value={raw}
      onChange={(e) => { setRaw(e.target.value); setError(false); }}
      onBlur={handleBlur}
      className={`px-3 py-2 border rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold ${
        error ? "border-red-400" : "border-divider"
      }`}
      placeholder="5:30 PM"
    />
  );
}

/* ── New item form ────────────────────────────────────────── */

function NewItemForm({
  onSave,
  onCancel,
  allInitials,
}: {
  onSave: (item: TimelineItem) => void;
  onCancel: () => void;
  allInitials: string[];
}) {
  const [time, setTime] = useState("");
  const [initials, setInitials] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [subNote, setSubNote] = useState("");
  const [isBold, setIsBold] = useState(false);

  return (
    <div className="px-5 py-4 bg-gold/5 space-y-3 border-t border-gold/20">
      <div className="grid grid-cols-[110px_1fr] gap-3">
        <TimeInput value={time} onChange={setTime} />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 border border-divider rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="Description"
          autoFocus
        />
      </div>

      {/* Initials chip picker */}
      <div>
        <p className="text-xs font-sans text-muted mb-1.5">Assigned to:</p>
        <InitialsChipPicker
          selected={initials}
          allInitials={allInitials}
          onChange={setInitials}
        />
      </div>

      <div className="grid grid-cols-[110px_1fr] gap-3">
        <label className="flex items-center gap-2 text-xs text-muted font-sans">
          <input
            type="checkbox"
            checked={isBold}
            onChange={(e) => setIsBold(e.target.checked)}
            className="accent-gold"
          />
          Key moment
        </label>
        <input
          type="text"
          value={subNote}
          onChange={(e) => setSubNote(e.target.value)}
          className="px-3 py-2 border border-divider rounded-lg text-sm font-sans italic bg-white focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="Sub-note (optional)"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-muted hover:text-primary transition-colors font-sans"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!time || !description || initials.length === 0) return;
            onSave({
              id: generateId(),
              time,
              initials,
              description,
              subNote: subNote || undefined,
              isBold,
            });
          }}
          disabled={!time || !description || initials.length === 0}
          className="px-4 py-1.5 bg-gold text-white rounded-lg text-sm font-sans font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Item
        </button>
      </div>
    </div>
  );
}
