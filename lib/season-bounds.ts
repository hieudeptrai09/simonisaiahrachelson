import { BASINS, BASIN_LABELS, FIRST_YEAR, perBasin, type Basin } from "./basins";
import { LAST_DAY, SEASON_DAYS, type Today } from "./dates";
import type { SeasonBounds, SeasonEdge } from "./types";

type SeasonExtent = {
  year: number;
  basin: Basin;
  first_day: string;
  last_day: string | null;
  years_on: number | null;
  ended: boolean;
};

const dayIndex = new Map(SEASON_DAYS.map((day, i) => [day, i]));

const meanDay = (days: number[]) =>
  days.length
    ? Math.min(
        LAST_DAY,
        Math.round(days.reduce((sum, d) => sum + d, 0) / days.length),
      )
    : null;

/**
 * Average start (first storm reaches tropical-storm strength) and end (last
 * storm drops below it) of each basin's season. The end averages the seasons
 * before today's, which have finished; a season whose best track isn't out yet
 * (some end_date missing) doesn't count toward it. The start also counts
 * today's season once its first storm has formed.
 */
export function seasonBounds(
  rows: SeasonExtent[],
  maxYear: number,
  today: Pick<Today, "year" | "monthDay">,
): SeasonBounds {
  const to = Math.min(maxYear, today.year - 1);
  const starts = perBasin(() => [] as number[]);
  const ends = perBasin(() => [] as number[]);
  let startTo = to;

  for (const row of rows) {
    const current = row.year === today.year && row.year <= maxYear;
    if (current && row.first_day <= today.monthDay) {
      starts[row.basin].push(dayIndex.get(row.first_day)!);
      startTo = today.year;
    }
    if (row.year > to) continue;
    starts[row.basin].push(dayIndex.get(row.first_day)!);
    if (row.ended && row.last_day !== null)
      // Days past 31 Dec carry on counting, so a January end isn't read as early.
      ends[row.basin].push(
        dayIndex.get(row.last_day)! + (row.years_on ?? 0) * SEASON_DAYS.length,
      );
  }

  return {
    years: { from: FIRST_YEAR, start: startTo, end: to },
    basins: perBasin((basin) => {
      const start = meanDay(starts[basin]);
      const end = meanDay(ends[basin]);
      return start === null || end === null ? null : { start, end };
    }),
  };
}

/** The season edges that fall on each SEASON_DAYS index. */
export function edgesByDay({ basins }: SeasonBounds) {
  const edges = new Map<number, SeasonEdge[]>();
  for (const basin of BASINS) {
    const bound = basins[basin];
    if (!bound) continue;
    for (const edge of ["start", "end"] as const) {
      const day = bound[edge];
      edges.set(day, [...(edges.get(day) ?? []), { basin, edge }]);
    }
  }
  return edges;
}

/** "Atlantic season starts" for an edge. */
export const edgeLabel = ({ basin, edge }: SeasonEdge) =>
  `${BASIN_LABELS[basin]} season ${edge === "start" ? "starts" : "ends"}`;
