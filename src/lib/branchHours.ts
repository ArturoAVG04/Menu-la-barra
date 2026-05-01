import type { Branch } from "@/types";

export const BUSINESS_TIME_ZONE = "America/Mexico_City";

export const WEEK_DAYS = [
  { id: "monday", label: "Lunes", shortLabel: "Lun." },
  { id: "tuesday", label: "Martes", shortLabel: "Mar." },
  { id: "wednesday", label: "Miércoles", shortLabel: "Mié." },
  { id: "thursday", label: "Jueves", shortLabel: "Jue." },
  { id: "friday", label: "Viernes", shortLabel: "Vie." },
  { id: "saturday", label: "Sábado", shortLabel: "Sáb." },
  { id: "sunday", label: "Domingo", shortLabel: "Dom." }
] as const;

export type NormalizedWeeklyHoursSlot = {
  days: string[];
  open: string;
  close: string;
  allDay?: boolean;
};

const DEFAULT_SLOT: NormalizedWeeklyHoursSlot = {
  days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  open: "13:00",
  close: "22:00"
};

const WEEK_DAY_ORDER = new Map<string, number>(WEEK_DAYS.map((day, index) => [day.label, index]));
const WEEK_DAY_LOOKUP = new Set<string>(WEEK_DAYS.map((day) => day.label));
const JS_DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
] as const;
const WEEK_DAY_FROM_FORMATTER = new Map(
  JS_DAY_LABELS.map((label) => [label.toLocaleLowerCase("es-MX"), label])
);
const mexicoCityClockFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function sortDays(days: string[]) {
  return [...days].sort(
    (left, right) => (WEEK_DAY_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER) - (WEEK_DAY_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER)
  );
}

function getMexicoCityTimeParts(currentDate: Date) {
  const parts = mexicoCityClockFormatter.formatToParts(currentDate);
  const weekdayValue = parts.find((part) => part.type === "weekday")?.value.toLocaleLowerCase("es-MX") ?? "";
  const hourValue = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minuteValue = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekday = WEEK_DAY_FROM_FORMATTER.get(weekdayValue) ?? JS_DAY_LABELS[currentDate.getDay()];

  return {
    weekday,
    currentMinutes: (hourValue % 24) * 60 + minuteValue
  };
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function normalizeGroupedSlot(slot: {
  days: string[];
  open: string;
  close: string;
  allDay?: boolean;
}) {
  const days = sortDays(
    Array.from(new Set(slot.days.filter((day) => WEEK_DAY_LOOKUP.has(day))))
  );

  return {
    days,
    open: slot.open || "13:00",
    close: slot.close || "22:00",
    ...(slot.allDay ? { allDay: true } : {})
  };
}

export function defaultWeeklyHours() {
  return [{ ...DEFAULT_SLOT, days: [...DEFAULT_SLOT.days] }];
}

export function normalizeWeeklyHours(
  weeklyHours?: Branch["weeklyHours"]
): NormalizedWeeklyHoursSlot[] {
  if (!weeklyHours?.length) {
    return defaultWeeklyHours();
  }

  const groupedSlots = weeklyHours.filter((item): item is NormalizedWeeklyHoursSlot & { allDay?: boolean } =>
    "days" in item
  );

  if (groupedSlots.length) {
    const normalized = groupedSlots
      .map(normalizeGroupedSlot)
      .filter((slot) => slot.days.length > 0);

    return normalized.length ? normalized : defaultWeeklyHours();
  }

  const legacySlots = weeklyHours.filter((item): item is Extract<NonNullable<Branch["weeklyHours"]>[number], { day: string }> =>
    "day" in item
  );

  const grouped = new Map<string, NormalizedWeeklyHoursSlot>();

  for (const item of legacySlots) {
    if (!item.enabled || !WEEK_DAY_LOOKUP.has(item.day)) continue;
    const allDay = item.open === "00:00" && item.close === "23:59";
    const key = `${item.open}-${item.close}-${allDay ? "all-day" : "timed"}`;
    const current = grouped.get(key);

    if (current) {
      current.days.push(item.day);
      continue;
    }

    grouped.set(key, {
      days: [item.day],
      open: item.open,
      close: item.close,
      ...(allDay ? { allDay: true } : {})
    });
  }

  const normalized = Array.from(grouped.values())
    .map(normalizeGroupedSlot)
    .filter((slot) => slot.days.length > 0);

  return normalized.length ? normalized : defaultWeeklyHours();
}

export function isBranchOpenAt(branch: Branch | null, currentDate: Date) {
  if (!branch) return false;
  if (!branch.isOpen) return false;

  const slots = normalizeWeeklyHours(branch.weeklyHours);
  if (!slots.length) return branch.isOpen;

  const { weekday: todayLabel, currentMinutes } = getMexicoCityTimeParts(currentDate);
  const { weekday: previousDayLabel } = getMexicoCityTimeParts(
    new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
  );

  return slots.some((slot) => {
    const openMinutes = parseTimeToMinutes(slot.open);
    const closeMinutes = parseTimeToMinutes(slot.close);
    const isOvernight = openMinutes !== null && closeMinutes !== null && closeMinutes <= openMinutes;

    if (slot.days.includes(todayLabel)) {
      if (slot.allDay) return true;
      if (openMinutes === null || closeMinutes === null) return branch.isOpen;

      if (isOvernight) {
        return currentMinutes >= openMinutes;
      }

      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }

    if (!slot.days.includes(previousDayLabel) || !isOvernight || closeMinutes === null) {
      return false;
    }

    return currentMinutes < closeMinutes;
  });
}
