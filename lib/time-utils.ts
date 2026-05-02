/**
 * Parse a time string like "5:00 AM" or "12:30 PM" into total minutes from midnight.
 */
export function parseTime(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;

  return hours * 60 + minutes;
}

/**
 * Format total minutes from midnight back to a time string like "5:00 AM".
 */
export function formatTime(totalMinutes: number): string {
  // Handle wrapping past midnight
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Shift a time string by a given number of minutes.
 */
export function shiftTime(time: string, deltaMinutes: number): string {
  return formatTime(parseTime(time) + deltaMinutes);
}

/**
 * Normalize a loosely-typed time string into "H:MM AM/PM" format.
 * Handles: "530p" → "5:30 PM", "3p" → "3:00 PM", "1130a" → "11:30 AM",
 * "5:30 PM" → "5:30 PM" (passthrough), "14:30" → "2:30 PM".
 * Returns null if unparseable.
 */
export function normalizeTime(input: string): string | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;

  // Already valid format
  const validMatch = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (validMatch) {
    return formatTime(parseTime(input));
  }

  // Shorthand: "530p", "3p", "1130a", "530pm", "3am"
  const shortMatch = s.match(/^(\d{1,4})(a|p|am|pm)$/);
  if (shortMatch) {
    const numStr = shortMatch[1];
    const period = shortMatch[2].startsWith("p") ? "PM" : "AM";

    let hours: number;
    let minutes: number;

    if (numStr.length <= 2) {
      hours = parseInt(numStr, 10);
      minutes = 0;
    } else if (numStr.length === 3) {
      hours = parseInt(numStr[0], 10);
      minutes = parseInt(numStr.slice(1), 10);
    } else {
      hours = parseInt(numStr.slice(0, 2), 10);
      minutes = parseInt(numStr.slice(2), 10);
    }

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    return formatTime(parseTime(`${hours}:${minutes.toString().padStart(2, "0")} ${period}`));
  }

  // 24-hour format: "14:30", "8:00"
  const milMatch = s.match(/^(\d{1,2}):(\d{2})$/);
  if (milMatch) {
    const h = parseInt(milMatch[1], 10);
    const m = parseInt(milMatch[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return formatTime(h * 60 + m);
  }

  return null;
}

/**
 * Generate a unique ID.
 */
let counter = 1000;
export function generateId(): string {
  return String(++counter);
}
