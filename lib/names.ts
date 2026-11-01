// Pure name-selection logic, shared by the API route and the UI.

export const BASINS = ["E", "L"] as const;
export type Basin = (typeof BASINS)[number];

export const BASIN_LABELS: Record<Basin, string> = {
  E: "Eastern Pacific",
  L: "Atlantic",
};

/** Lists start in 1966 — the first season in the hurricanes table. */
export const FIRST_YEAR = 1966;
/** Set used once a year's main list runs out. */
export const SUPPLEMENTAL_SET = 6;

/** names[basin][set] is the ordered list for that set (index 0 = seq 1). */
export type NameLists = Record<Basin, string[][]>;

export type NameHit = {
  position: number;
  /** Set the name was actually taken from (the year's set, or 6 on overflow). */
  set: number;
  seq: number;
  name: string;
};

/** Index of the year's list: year mod 6. */
export function setForYear(year: number): number {
  return ((year % 6) + 6) % 6;
}

/**
 * Positions to show in one basin for its average count: floor and ceiling,
 * deduplicated when the average is whole. Paired across basins this gives the
 * floor case (floor E, floor L) and the ceiling case (ceil E, ceil L). With no
 * storms yet, the first name is shown.
 */
export function namePositions(avg: number): number[] {
  const low = Math.max(1, Math.floor(avg));
  const high = Math.max(1, Math.ceil(avg));
  return low === high ? [low] : [low, high];
}

/**
 * Name at a 1-based position in the year's list. Positions past the end of
 * that list continue into the supplemental set. Returns null for a position
 * past both lists.
 */
export function lookupName(
  lists: NameLists,
  basin: Basin,
  set: number,
  position: number,
): NameHit | null {
  const main = lists[basin][set] ?? [];
  if (position <= main.length) {
    return { position, set, seq: position, name: main[position - 1] };
  }

  const supplemental = lists[basin][SUPPLEMENTAL_SET] ?? [];
  const seq = position - main.length;
  if (seq <= supplemental.length) {
    return {
      position,
      set: SUPPLEMENTAL_SET,
      seq,
      name: supplemental[seq - 1],
    };
  }
  return null;
}

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

export type NamesResponse = {
  date: string;
  set: number;
  years: { from: number; to: number; count: number };
  average: Record<Basin, number>;
  names: Record<Basin, { position: number; hit: NameHit | null }[]>;
};
