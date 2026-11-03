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
 * Positions to show in one basin for its average count: the ceiling. With no
 * storms yet, the first name is shown.
 */
export function namePositions(avg: number): number[] {
  return [Math.max(1, Math.ceil(avg))];
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

/** "TWENTY-TWO" → "Twenty-Two"; the hurricanes table mixes upper and title case. */
export function titleCase(name: string): string {
  return name.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, sep, ch) =>
    sep + ch.toUpperCase(),
  );
}

/** A storm that was at tropical-storm strength on a given date. */
export type ActiveStorm = {
  year: number;
  name: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD */
  end: string;
};

export type NamesResponse = {
  date: string;
  set: number;
  years: { from: number; to: number; count: number };
  average: Record<Basin, number>;
  names: Record<Basin, { position: number; hit: NameHit | null }[]>;
  /** Storms active on `date`, or null when the date is after today. */
  active: Record<Basin, ActiveStorm[]> | null;
  /**
   * Latest storm formed in `date`'s season up to `date`, per basin (null if
   * none yet), or null when the date is after today.
   */
  lastFormed: Record<Basin, ActiveStorm | null> | null;
};

/** "MM-DD" for every day of a leap year, 1 Jan to 31 Dec. */
export const SEASON_DAYS = Array.from({ length: 366 }, (_, i) =>
  new Date(Date.UTC(2024, 0, 1 + i)).toISOString().slice(5, 10),
);

export type SeasonResponse = {
  years: { from: number; to: number };
  /** Average named storms formed by each day, in SEASON_DAYS order. */
  average: Record<Basin, number[]>;
};
