import type { NextRequest } from "next/server";
import dayjs from "dayjs";
import {
  getActiveStorms,
  getLastFormedStorms,
  getNameLists,
  getStormCounts,
} from "@/lib/hurricanes";
import {
  BASINS,
  lookupName,
  namePositions,
  parseIsoDate,
  setForYear,
  type NamesResponse,
} from "@/lib/names";

// GET /api/names?date=YYYY-MM-DD[&today=YYYY-MM-DD]
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const parsed = parseIsoDate(date);
  if (!parsed) {
    return Response.json(
      { error: "Expected ?date=YYYY-MM-DD" },
      { status: 400 },
    );
  }

  // Only average over years in which this day has already happened. "Today"
  // is the viewer's local date (?today=), so the cutoff moves at their
  // midnight rather than UTC's; fall back to the server's local date.
  const todayParam = request.nextUrl.searchParams.get("today");
  const todayIso = parseIsoDate(todayParam)
    ? todayParam!
    : dayjs().format("YYYY-MM-DD");
  const today = parseIsoDate(todayIso)!;
  const lastYear =
    parsed.monthDay <= today.monthDay ? today.year : today.year - 1;

  // ISO dates compare correctly as strings.
  const isPast = date! <= todayIso;
  const [{ from, to, counts }, lists, active, lastFormed] = await Promise.all([
    getStormCounts(parsed.monthDay, lastYear),
    getNameLists(),
    isPast ? getActiveStorms(date!) : null,
    isPast ? getLastFormedStorms(date!) : null,
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
    active,
    lastFormed,
  } satisfies NamesResponse);
}
