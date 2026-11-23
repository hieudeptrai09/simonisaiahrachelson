import type { NextRequest } from "next/server";
import { getNameLists, getStormStarts } from "@/lib/hurricanes";
import { resolveToday } from "@/lib/dates";
import { NAME_HISTORY_FROM, nameHistory } from "@/lib/name-history";
import type { HistoryResponse } from "@/lib/types";

// GET /api/history[?today=YYYY-MM-DD]
export async function GET(request: NextRequest) {
  const today = resolveToday(request.nextUrl.searchParams.get("today"));
  const [storms, lists] = await Promise.all([
    getStormStarts(NAME_HISTORY_FROM),
    getNameLists(),
  ]);

  return Response.json(
    nameHistory(storms, lists, today.year) satisfies HistoryResponse,
  );
}
