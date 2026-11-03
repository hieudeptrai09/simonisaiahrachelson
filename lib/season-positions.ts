// Which name is expected on each day of the season, from the average curve.

import { BASINS, perBasin, type Basin } from "./basins";
import { LAST_DAY, SEASON_DAYS, dayRange, isLeapYear } from "./dates";
import type { SeasonAverage } from "./types";

/** First SEASON_DAYS index on which a basin's average reaches `value`, or null. */
export function firstReaching(
  average: SeasonAverage,
  basin: Basin,
  value: number,
) {
  const i = average[basin].findIndex((v) => v >= value);
  return i < 0 ? null : i;
}

/**
 * When name #position is the expected one: from the first day the average
 * reaches position − 1 to the first day it reaches position (or 31 Dec).
 * Null if the average never gets there.
 */
export function nameSpan(
  average: SeasonAverage,
  basin: Basin,
  position: number,
) {
  const from = firstReaching(average, basin, position - 1);
  if (from === null) return null;
  const to = firstReaching(average, basin, position) ?? LAST_DAY;
  return dayRange(SEASON_DAYS[from], SEASON_DAYS[to]);
}

/** How many names either basin's average starts by 31 Dec. */
export function namesReached(average: SeasonAverage) {
  return Math.max(
    ...BASINS.map((basin) => Math.floor(average[basin][LAST_DAY]) + 1),
  );
}

/** Name position per SEASON_DAYS index, as the name table counts it. */
export function positionsByDay(average: SeasonAverage, basin: Basin) {
  const positions = SEASON_DAYS.map(() => 1);
  for (let n = 2; ; n++) {
    const from = firstReaching(average, basin, n - 1);
    if (from === null) return positions;
    positions.fill(n, from);
  }
}

export type Stretch = { start: number; positions: Record<Basin, number> };

export type SeasonCalendar = {
  /** SEASON_DAYS indexes in the year (29 Feb only in a leap year). */
  days: number[];
  /** Expected name position per basin and SEASON_DAYS index. */
  positions: Record<Basin, number[]>;
  /** Runs of days over which neither basin's expected name changes. */
  stretches: Stretch[];
  /** Stretch index per SEASON_DAYS index. */
  stretchOf: Map<number, number>;
};

/** `year`'s days, split into stretches of unchanged expected names. */
export function seasonCalendar(
  average: SeasonAverage,
  year: number,
): SeasonCalendar {
  const leap = isLeapYear(year);
  const days = SEASON_DAYS.flatMap((day, i) =>
    leap || day !== "02-29" ? [i] : [],
  );

  const positions = perBasin((basin) => positionsByDay(average, basin));
  const stretches: Stretch[] = [];
  const stretchOf = new Map<number, number>();
  for (const i of days) {
    const prev = stretches.at(-1);
    if (!prev || BASINS.some((b) => prev.positions[b] !== positions[b][i]))
      stretches.push({ start: i, positions: perBasin((b) => positions[b][i]) });
    stretchOf.set(i, stretches.length - 1);
  }

  return { days, positions, stretches, stretchOf };
}

/** A stretch's dates, ending on the day the next one starts (like the name table). */
export function stretchRange(
  { days, stretches }: SeasonCalendar,
  stretch: number,
) {
  return dayRange(
    SEASON_DAYS[stretches[stretch].start],
    SEASON_DAYS[stretches[stretch + 1]?.start ?? days.at(-1)!],
  );
}
