import { useState } from "react";
import { useOutsidePointer } from "@/hooks/use-outside-pointer";
import { SEASON_DAYS } from "@/lib/dates";
import { seasonCalendar } from "@/lib/season-positions";
import type { SeasonAverage } from "@/lib/types";
import MonthGrid from "./month-grid";

/**
 * `date`'s year laid out as a calendar, shaded in stretches over which
 * neither basin's expected name changes. Hovering or tapping a day pops up its
 * stretch's dates (ending on the day the next one starts, like the table) and
 * letters.
 */
export default function NameCalendar({
  average,
  date,
}: {
  average: SeasonAverage;
  date: string;
}) {
  const year = Number(date.slice(0, 4));
  const calendar = seasonCalendar(average, year);
  const markedIndex = SEASON_DAYS.indexOf(date.slice(5));

  // Mouse opens on hover; touch opens on tap and closes on a tap elsewhere.
  const [openDay, setOpenDay] = useState<number | null>(null);
  const activeStretch =
    openDay === null ? null : (calendar.stretchOf.get(openDay) ?? null);
  useOutsidePointer(
    openDay !== null,
    (target) => !!target.closest("[data-day]"),
    () => setOpenDay(null),
  );

  return (
    <div
      className="grid gap-x-6 gap-y-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
    >
      {Array.from({ length: 12 }, (_, month) => (
        <MonthGrid
          key={month}
          year={year}
          month={month}
          calendar={calendar}
          openDay={openDay}
          activeStretch={activeStretch}
          markedIndex={markedIndex}
          onOpen={setOpenDay}
        />
      ))}
    </div>
  );
}
