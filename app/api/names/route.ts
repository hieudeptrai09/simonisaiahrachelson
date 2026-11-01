import type { NextRequest } from "next/server";
import { getNameLists, getStormCounts } from "@/lib/hurricanes";
import {
  BASINS,
  lookupName,
  namePositions,
  parseIsoDate,
  setForYear,
  type NamesResponse,
} from "@/lib/names";

// GET /api/names?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const parsed = parseIsoDate(date);
  if (!parsed) {
    return Response.json(
      { error: "Expected ?date=YYYY-MM-DD" },
      { status: 400 },
    );
  }

  // Only average over years in which this day has already happened.
  const today = new Date().toISOString();
  const thisYear = Number(today.slice(0, 4));
  const lastYear =
    parsed.monthDay <= today.slice(5, 10) ? thisYear : thisYear - 1;

  const [{ from, to, counts }, lists] = await Promise.all([
    getStormCounts(parsed.monthDay, lastYear),
    getNameLists(),
  ]);

  const yearCount = to - from + 1;
  const average = { E: counts.E / yearCount, L: counts.L / yearCount };
  const set = setForYear(parsed.year);

  const names = Object.fromEntries(
    BASINS.map((basin) => [
      basin,
      namePositions(average[basin]).map((position) => ({
        position,
        hit: lookupName(lists, basin, set, position),
      })),
    ]),
  ) as NamesResponse["names"];

  return Response.json({
    date: date!,
    set,
    years: { from, to, count: yearCount },
    average,
    names,
  } satisfies NamesResponse);
}
