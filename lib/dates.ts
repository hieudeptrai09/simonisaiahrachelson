import dayjs from "dayjs";

export const ISO = "YYYY-MM-DD";

/** Parses a strict YYYY-MM-DD string; returns null if malformed or not a real date. */
export function parseIsoDate(value: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day)
    return null;

  return { year, monthDay: `${match[2]}-${match[3]}` };
}

export type Today = { iso: string; year: number; monthDay: string };

/**
 * "Today" is the viewer's local date (?today=), so cutoffs move at their
 * midnight rather than UTC's; falls back to the server's local date.
 */
export function resolveToday(param: string | null): Today {
  const iso = parseIsoDate(param) ? param! : dayjs().format(ISO);
  return { iso, ...parseIsoDate(iso)! };
}

/** The latest season in which `monthDay` ("MM-DD") has already happened. */
export function lastSeasonReaching(
  monthDay: string,
  today: Pick<Today, "year" | "monthDay">,
) {
  return monthDay <= today.monthDay ? today.year : today.year - 1;
}

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** "MM-DD" for every day of a leap year, 1 Jan to 31 Dec. */
export const SEASON_DAYS = Array.from({ length: 366 }, (_, i) =>
  new Date(Date.UTC(2024, 0, 1 + i)).toISOString().slice(5, 10),
);
/** Index of 31 Dec in SEASON_DAYS. */
export const LAST_DAY = SEASON_DAYS.length - 1;

/** YYYY-MM-DD → "D MMM". */
export const isoDayLabel = (iso: string) => dayjs(iso, ISO).format("D MMM");

/** "MM-DD" → "D MMM", read against the leap year SEASON_DAYS is built on. */
export const dayLabel = (monthDay: string) => isoDayLabel(`2024-${monthDay}`);

/** "MM-DD" → "MMM". */
export const monthLabel = (monthDay: string) =>
  dayjs(`2024-${monthDay}`, ISO).format("MMM");

/** "D MMM – D MMM" between two YYYY-MM-DD dates. */
export const isoRange = (from: string, to: string) =>
  `${isoDayLabel(from)} – ${isoDayLabel(to)}`;

/** "D MMM – D MMM" between two "MM-DD" days. */
export const dayRange = (from: string, to: string) =>
  isoRange(`2024-${from}`, `2024-${to}`);
