import type { NextRequest } from "next/server";
import dayjs from "dayjs";
import { getDailyStormCounts } from "@/lib/hurricanes";
import {
  BASINS,
  FIRST_YEAR,
  SEASON_DAYS,
  parseIsoDate,
  type Basin,
  type SeasonResponse,
} from "@/lib/names";

// GET /api/season[?today=YYYY-MM-DD]
export async function GET(request: NextRequest) {
  // Same cutoff as /api/names: a season counts toward a day only once that day
  // has happened in it, judged by the viewer's local date.
  const todayParam = request.nextUrl.searchParams.get("today");
  const today =
    parseIsoDate(todayParam) ?? parseIsoDate(dayjs().format("YYYY-MM-DD"))!;

  const { maxYear, rows } = await getDailyStormCounts();

  // Every day's window ends in `latest` or the season before it, so tally
  // `latest` apart and add it only on the days that include it.
  const latest = Math.min(maxYear, today.year);
  const dayIndex = new Map(SEASON_DAYS.map((day, i) => [day, i]));
  const perDay = () =>
    Object.fromEntries(
      BASINS.map((basin) => [basin, SEASON_DAYS.map(() => 0)]),
    ) as Record<Basin, number[]>;
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
      const lastYear = day <= today.monthDay ? today.year : today.year - 1;
      const to = Math.min(maxYear, lastYear);
      const storms = earlierSum + (to === latest ? currentSum : 0);
      average[basin][i] =
        Math.round((storms / (to - FIRST_YEAR + 1)) * 100) / 100;
    });
  }

  return Response.json({
    years: { from: FIRST_YEAR, to: latest },
    average,
  } satisfies SeasonResponse);
}
