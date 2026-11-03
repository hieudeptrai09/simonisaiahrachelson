// Picking the expected name from a year's list.

import { perBasin, type Basin } from "./basins";
import type { NameHit, NameLists, NamesResponse } from "./types";

/** Set used once a year's main list runs out. */
export const SUPPLEMENTAL_SET = 6;

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

/** The expected name(s) in each basin for its average storm count. */
export function expectedNames(
  lists: NameLists,
  average: Record<Basin, number>,
  set: number,
): NamesResponse["names"] {
  return perBasin((basin) =>
    namePositions(average[basin]).map((position) => ({
      position,
      hit: lookupName(lists, basin, set, position),
    })),
  );
}
