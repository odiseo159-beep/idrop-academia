import eventsData from "../../content/calendar/events.json";
import type { Locale } from "@/lib/types";

export const CALENDAR_CATEGORIES = [
  "airdrop_tge",
  "hackathon",
  "event",
  "commemorative",
  "idrop",
] as const;

export type CalendarCategory = (typeof CALENDAR_CATEGORIES)[number];

export type CalendarEvent = {
  id: string;
  date: string;
  endDate?: string;
  category: CalendarCategory;
  title: { es: string; en: string };
  summary: { es: string; en: string };
  source?: string;
  link?: string;
};

export type CalendarData = {
  version: number;
  lastUpdated: string;
  events: CalendarEvent[];
};

type CategoryStyle = {
  color: string;
  bgSoft: string;
  border: string;
  bgChip: string;
};

export const CATEGORY_STYLE: Record<CalendarCategory, CategoryStyle> = {
  airdrop_tge: {
    color: "#f0b90b",
    bgSoft: "rgba(240, 185, 11, 0.12)",
    border: "rgba(240, 185, 11, 0.36)",
    bgChip: "rgba(240, 185, 11, 0.08)",
  },
  hackathon: {
    color: "#38bdf8",
    bgSoft: "rgba(56, 189, 248, 0.13)",
    border: "rgba(56, 189, 248, 0.36)",
    bgChip: "rgba(56, 189, 248, 0.08)",
  },
  event: {
    color: "#c1c3cc",
    bgSoft: "rgba(193, 195, 204, 0.08)",
    border: "rgba(193, 195, 204, 0.26)",
    bgChip: "rgba(193, 195, 204, 0.05)",
  },
  commemorative: {
    color: "#b89ad9",
    bgSoft: "rgba(184, 154, 217, 0.12)",
    border: "rgba(184, 154, 217, 0.34)",
    bgChip: "rgba(184, 154, 217, 0.08)",
  },
  idrop: {
    color: "#e88258",
    bgSoft: "rgba(232, 130, 88, 0.13)",
    border: "rgba(232, 130, 88, 0.36)",
    bgChip: "rgba(232, 130, 88, 0.08)",
  },
};

export function getCalendarData(): CalendarData {
  return eventsData as CalendarData;
}

export function parseEventDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isoForDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function eventCoversDate(event: CalendarEvent, date: Date): boolean {
  const day = startOfDay(date).getTime();
  const start = parseEventDate(event.date).getTime();
  const end = event.endDate ? parseEventDate(event.endDate).getTime() : start;
  return day >= start && day <= end;
}

export function eventDurationDays(event: CalendarEvent): number {
  if (!event.endDate) return 1;
  const start = parseEventDate(event.date).getTime();
  const end = parseEventDate(event.endDate).getTime();
  return Math.round((end - start) / 86_400_000) + 1;
}

export function compareEventsByDate(a: CalendarEvent, b: CalendarEvent): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

export type MonthMatrixCell = {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
};

// 6 rows × 7 cols, Monday-first. Always 6 rows so the grid height is
// stable across the year (some months span 4-5 visual weeks, padding
// to 6 keeps the layout from jumping).
export function buildMonthMatrix(year: number, month: number, today: Date): MonthMatrixCell[] {
  const firstOfMonth = new Date(year, month, 1);
  // Mon=0 .. Sun=6
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstWeekday);
  const cells: MonthMatrixCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      date: d,
      inMonth: d.getMonth() === month,
      isToday: sameDay(d, today),
    });
  }
  return cells;
}

export function eventsInRange(
  events: CalendarEvent[],
  start: Date,
  end: Date,
  categories?: ReadonlySet<CalendarCategory>
): CalendarEvent[] {
  const startMs = startOfDay(start).getTime();
  const endMs = startOfDay(end).getTime();
  return events
    .filter((ev) => {
      if (categories && categories.size > 0 && !categories.has(ev.category)) return false;
      const evStart = parseEventDate(ev.date).getTime();
      const evEnd = ev.endDate ? parseEventDate(ev.endDate).getTime() : evStart;
      return evEnd >= startMs && evStart <= endMs;
    })
    .sort(compareEventsByDate);
}

export function eventsForMonth(
  events: CalendarEvent[],
  year: number,
  month: number,
  categories?: ReadonlySet<CalendarCategory>
): CalendarEvent[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return eventsInRange(events, start, end, categories);
}

export function eventsForDay(
  events: CalendarEvent[],
  date: Date,
  categories?: ReadonlySet<CalendarCategory>
): CalendarEvent[] {
  return events
    .filter((ev) => {
      if (categories && categories.size > 0 && !categories.has(ev.category)) return false;
      return eventCoversDate(ev, date);
    })
    .sort(compareEventsByDate);
}

export function pickLocalized<T extends { es: string; en: string }>(
  field: T,
  locale: Locale
): string {
  return field[locale] ?? field.es;
}
