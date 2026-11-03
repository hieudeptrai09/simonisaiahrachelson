import { BASINS, FIRST_YEAR, perBasin, type Basin } from "./basins";
import { SEASON_DAYS, lastSeasonReaching, type Today } from "./dates";
import type { SeasonResponse } from "./types";

type DailyCount = {
  year: number;
  basin: Basin;
  month_day: string;
  storms: number;
};

/**
 * Average named storms formed between 1 Jan and each day of the season, from
 * per-day counts. Same cutoff as /api/names: a season counts toward a day only
 * once that day has happened in it.
 */
export function seasonAverage(
  rows: DailyCount[],
  maxYear: number,
  today: Pick<Today, "year" | "monthDay">,
): SeasonResponse {
  // Every day's window ends in `latest` or the season before it, so tally
  // `latest` apart and add it only on the days that include it.
  const latest = Math.min(maxYear, today.year);
  const dayIndex = new Map(SEASON_DAYS.map((day, i) => [day, i]));
  const perDay = () => perBasin(() => SEASON_DAYS.map(() => 0));
  const earlier = perDay();
  const current = perDay();
  for (const row of rows) {
    if (row.year > latest) continue;
    const bucket = row.year === latest ? current : earlier;
    bucket[row.basin][dayIndex.get(row.month_day)!] += row.storms;
  }

  const average = perDay();
  for (const basin of BASINS) {
    let earlierSum = 0;
    let currentSum = 0;
    SEASON_DAYS.forEach((day, i) => {
      earlierSum += earlier[basin][i];
      currentSum += current[basin][i];
      const to = Math.min(maxYear, lastSeasonReaching(day, today));
      const storms = earlierSum + (to === latest ? currentSum : 0);
      average[basin][i] =
        Math.round((storms / (to - FIRST_YEAR + 1)) * 100) / 100;
    });
  }

  return { years: { from: FIRST_YEAR, to: latest }, average };
}
