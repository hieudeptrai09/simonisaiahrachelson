import type { NextRequest } from "next/server";
import {
  getActiveStorms,
  getLastFormedStorms,
  getNameLists,
  getStormCounts,
} from "@/lib/hurricanes";
import { lastSeasonReaching, parseIsoDate, resolveToday } from "@/lib/dates";
import { expectedNames, setForYear } from "@/lib/name-lists";
import type { NamesResponse } from "@/lib/types";

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

  // Only average over years in which this day has already happened.
  const today = resolveToday(request.nextUrl.searchParams.get("today"));
  const lastYear = lastSeasonReaching(parsed.monthDay, today);

  // ISO dates compare correctly as strings.
  const isPast = date! <= today.iso;
  const [{ from, to, counts }, lists, active, lastFormed] = await Promise.all([
    getStormCounts(parsed.monthDay, lastYear),
    getNameLists(),
    isPast ? getActiveStorms(date!) : null,
    isPast ? getLastFormedStorms(date!) : null,
  ]);

  const yearCount = to - from + 1;
  const average = { E: counts.E / yearCount, L: counts.L / yearCount };
  const set = setForYear(parsed.year);

  return Response.json({
    date: date!,
    set,
    years: { from, to, count: yearCount },
    average,
    names: expectedNames(lists, average, set),
    active,
    lastFormed,
  } satisfies NamesResponse);
}
