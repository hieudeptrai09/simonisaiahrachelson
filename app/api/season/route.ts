import type { NextRequest } from "next/server";
import { getDailyStormCounts, getSeasonExtents } from "@/lib/hurricanes";
import { resolveToday } from "@/lib/dates";
import { seasonAverage } from "@/lib/season-average";
import { seasonBounds } from "@/lib/season-bounds";
import type { SeasonResponse } from "@/lib/types";

// GET /api/season[?today=YYYY-MM-DD]
export async function GET(request: NextRequest) {
  const today = resolveToday(request.nextUrl.searchParams.get("today"));
  const [{ maxYear, rows }, extents] = await Promise.all([
    getDailyStormCounts(),
    getSeasonExtents(),
  ]);

  return Response.json({
    ...seasonAverage(rows, maxYear, today),
    bounds: seasonBounds(extents, maxYear, today),
  } satisfies SeasonResponse);
}
