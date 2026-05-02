import * as XLSX from "xlsx";
import { Day, Section, TimelineItem } from "./types";
import { generateId, normalizeTime } from "./time-utils";

interface RawRow {
  Day?: string;
  Section?: string;
  Time?: string;
  Initials?: string;
  Description?: string;
  "Sub-note"?: string;
  Bold?: string | boolean | number;
}

export interface ImportResult {
  days: Day[];
  itemCount: number;
  sectionCount: number;
  errors: string[];
}

/**
 * Parse an Excel/CSV file buffer into Day[] that can be merged into an event.
 */
export function parseSpreadsheet(buffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });

  const errors: string[] = [];
  const dayMap = new Map<string, Map<string, TimelineItem[]>>();
  let itemCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed, plus header row

    const dayLabel = String(row.Day || "").trim();
    const sectionTitle = String(row.Section || "").trim();
    const rawTime = String(row.Time || "").trim();
    const rawInitials = String(row.Initials || "").trim();
    const description = String(row.Description || "").trim();
    const subNote = String(row["Sub-note"] || "").trim();
    const boldRaw = row.Bold;

    if (!description) {
      if (rawTime || rawInitials) {
        errors.push(`Row ${rowNum}: has time/initials but no description — skipped`);
      }
      continue;
    }

    if (!dayLabel) {
      errors.push(`Row ${rowNum}: missing Day — skipped`);
      continue;
    }

    const time = rawTime ? normalizeTime(rawTime) : null;
    if (rawTime && !time) {
      errors.push(`Row ${rowNum}: could not parse time "${rawTime}" — using as-is`);
    }

    const initials = rawInitials
      ? rawInitials.split(/[,\/\s]+/).filter(Boolean).map((s) => s.toUpperCase())
      : ["ALL"];

    const isBold =
      boldRaw === true ||
      boldRaw === 1 ||
      String(boldRaw).toLowerCase() === "true" ||
      String(boldRaw).toLowerCase() === "yes" ||
      String(boldRaw).toLowerCase() === "y";

    const item: TimelineItem = {
      id: generateId(),
      time: time || rawTime || "",
      initials,
      description,
      subNote: subNote || undefined,
      isBold: isBold || undefined,
    };

    if (!dayMap.has(dayLabel)) {
      dayMap.set(dayLabel, new Map());
    }
    const sectionMap = dayMap.get(dayLabel)!;
    const secKey = sectionTitle || "IMPORTED ITEMS";
    if (!sectionMap.has(secKey)) {
      sectionMap.set(secKey, []);
    }
    sectionMap.get(secKey)!.push(item);
    itemCount++;
  }

  const days: Day[] = [];
  let sectionCount = 0;

  Array.from(dayMap.entries()).forEach(([dayLabel, sectionMap]) => {
    const sections: Section[] = [];
    Array.from(sectionMap.entries()).forEach(([title, items]) => {
      sections.push({ title: title.toUpperCase(), items });
      sectionCount++;
    });
    days.push({ label: dayLabel, sections });
  });

  return { days, itemCount, sectionCount, errors };
}

/**
 * Merge imported days into existing event days.
 * If a day label matches an existing day, sections are appended.
 * Otherwise, a new day is created.
 */
export function mergeDays(existing: Day[], imported: Day[]): Day[] {
  const result = structuredClone(existing);

  for (const impDay of imported) {
    const match = result.find(
      (d) => d.label.toLowerCase() === impDay.label.toLowerCase()
    );
    if (match) {
      for (const impSec of impDay.sections) {
        const secMatch = match.sections.find(
          (s) =>
            (s.title || "").toLowerCase() === (impSec.title || "").toLowerCase()
        );
        if (secMatch) {
          secMatch.items.push(...impSec.items);
        } else {
          match.sections.push(impSec);
        }
      }
    } else {
      result.push(impDay);
    }
  }

  return result;
}

/**
 * Generate a blank template workbook as an ArrayBuffer for download.
 */
export function generateBlankTemplate(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const data = [
    ["Day", "Section", "Time", "Initials", "Description", "Sub-note", "Bold"],
    ["Saturday — Wedding Day", "CEREMONY", "5:30 PM", "ALL", "Ceremony begins", "Processional order confirmed", "yes"],
    ["Saturday — Wedding Day", "CEREMONY", "6:00 PM", "ALL", "Ceremony concludes", "", "yes"],
    ["Saturday — Wedding Day", "RECEPTION", "7:00 PM", "ALL", "Grand entrance", "", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws["!cols"] = [
    { wch: 30 }, // Day
    { wch: 28 }, // Section
    { wch: 12 }, // Time
    { wch: 12 }, // Initials
    { wch: 40 }, // Description
    { wch: 30 }, // Sub-note
    { wch: 6 },  // Bold
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Timeline");
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}
