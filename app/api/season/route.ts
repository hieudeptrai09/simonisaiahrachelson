import type { NextRequest } from "next/server";
import { getDailyStormCounts } from "@/lib/hurricanes";
import { resolveToday } from "@/lib/dates";
import { seasonAverage } from "@/lib/season-average";
import type { SeasonResponse } from "@/lib/types";

// GET /api/season[?today=YYYY-MM-DD]
export async function GET(request: NextRequest) {
  const today = resolveToday(request.nextUrl.searchParams.get("today"));
  const { maxYear, rows } = await getDailyStormCounts();

  return Response.json(
    seasonAverage(rows, maxYear, today) satisfies SeasonResponse,
  );
}
