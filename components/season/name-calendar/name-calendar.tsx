import { useState } from "react";
import { Flex, Typography } from "antd";
import { useOutsidePointer } from "@/hooks/use-outside-pointer";
import { BASINS } from "@/lib/basins";
import { SEASON_DAYS } from "@/lib/dates";
import { edgesByDay } from "@/lib/season-bounds";
import { seasonCalendar } from "@/lib/season-positions";
import type { SeasonAverage, SeasonBounds } from "@/lib/types";
import { EdgeMark } from "./calendar-day";
import MonthGrid from "./month-grid";

const { Text } = Typography;

/**
 * `date`'s year laid out as a calendar, shaded in stretches over which
 * neither basin's expected name changes. Hovering or tapping a day pops up its
 * stretch's dates (ending on the day the next one starts, like the table) and
 * letters. Each basin's average season start and end are starred in its
 * colour.
 */
export default function NameCalendar({
  average,
  bounds,
  date,
}: {
  average: SeasonAverage;
  bounds: SeasonBounds;
  date: string;
}) {
  const year = Number(date.slice(0, 4));
  const calendar = seasonCalendar(average, year);
  const markedIndex = SEASON_DAYS.indexOf(date.slice(5));
  const edges = edgesByDay(bounds);

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
    <Flex vertical gap={12}>
      <Flex gap={4} align="center">
        {BASINS.map((basin) => (
          <EdgeMark key={basin} basin={basin} />
        ))}
        <Text type="secondary" style={{ marginLeft: 2, fontSize: 12 }}>
          Average season start or end, in place of the day&apos;s number
        </Text>
      </Flex>
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
            edges={edges}
            onOpen={setOpenDay}
          />
        ))}
      </div>
    </Flex>
  );
}
