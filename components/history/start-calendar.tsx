import { useState } from "react";
import dayjs from "dayjs";
import { Flex, Popover, Typography } from "antd";
import { useOutsidePointer } from "@/hooks/use-outside-pointer";
import { BASINS, type Basin } from "@/lib/basins";
import { MUTED, SECONDARY, SERIES_COLOR } from "@/lib/chart-theme";
import { dayLabel } from "@/lib/dates";
import LineKey from "@/components/season/line-key";

const { Text } = Typography;

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** A storm marked on the day it formed. */
export type StartMark = {
  key: string;
  basin: Basin;
  /** Shown in the day's cell in place of its number, e.g. the letter. */
  label?: string;
  /** Its line in the day's popup. */
  text: string;
  /** Drawn fainter: not the storm the view is about. */
  muted?: boolean;
};

/**
 * A year of month grids with each storm's formation day tinted in its basin's
 * colour. Hovering or tapping a tinted day lists its storms. With no `year`,
 * days are laid out by month only (leap year, no weekdays), for marks that
 * come from many seasons.
 */
export default function StartCalendar({
  year,
  marks,
}: {
  year: number | null;
  /** Marks per "MM-DD". */
  marks: Map<string, StartMark[]>;
}) {
  // Mouse opens on hover; touch opens on tap and closes on a tap elsewhere.
  const [openDay, setOpenDay] = useState<string | null>(null);
  useOutsidePointer(
    openDay !== null,
    (target) => !!target.closest("[data-start-day]"),
    () => setOpenDay(null),
  );

  return (
    <div
      className="grid gap-x-6 gap-y-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
    >
      {Array.from({ length: 12 }, (_, month) => {
        const first = dayjs(new Date(year ?? 2024, month, 1));
        // Monday-first offset of the 1st.
        const blanks = year === null ? 0 : (first.day() + 6) % 7;
        return (
          <Flex key={month} vertical gap={4}>
            <Text strong>{first.format("MMMM")}</Text>
            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
            >
              {year !== null &&
                WEEKDAYS.map((weekday, i) => (
                  <Text
                    key={i}
                    type="secondary"
                    style={{ fontSize: 11, textAlign: "center" }}
                  >
                    {weekday}
                  </Text>
                ))}
              {Array.from({ length: blanks }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: first.daysInMonth() }, (_, d) => {
                const monthDay = first.date(d + 1).format("MM-DD");
                return (
                  <StartDay
                    key={d}
                    day={d + 1}
                    monthDay={monthDay}
                    year={year}
                    marks={marks.get(monthDay) ?? []}
                    open={openDay === monthDay}
                    onOpen={setOpenDay}
                  />
                );
              })}
            </div>
          </Flex>
        );
      })}
    </div>
  );
}

/** One day: plain, or tinted with a popup listing the storms that formed on it. */
function StartDay({
  day,
  monthDay,
  year,
  marks,
  open,
  onOpen,
}: {
  day: number;
  monthDay: string;
  year: number | null;
  marks: StartMark[];
  open: boolean;
  onOpen: (monthDay: string | null) => void;
}) {
  const cell = {
    textAlign: "center" as const,
    fontSize: 12,
    lineHeight: "24px",
    borderRadius: 4,
    fontVariantNumeric: "tabular-nums",
  };
  if (marks.length === 0)
    return <div style={{ ...cell, color: MUTED }}>{day}</div>;

  const basins = BASINS.filter((b) => marks.some((m) => m.basin === b));
  const faint = marks.every((m) => m.muted);
  // One basin: its colour at a light (or, for muted marks, lighter) alpha.
  const background =
    basins.length === 1
      ? `${SERIES_COLOR[basins[0]]}${faint ? "1f" : "3d"}`
      : "#eeede8";
  const labelled = marks.filter((m) => m.label);
  const title = year === null ? dayLabel(monthDay) : dayjs(`${year}-${monthDay}`).format("D MMM YYYY");

  return (
    <Popover
      open={open}
      trigger={[]}
      title={title}
      content={
        <Flex vertical gap={4}>
          {marks.map((mark) => (
            <Flex key={mark.key} gap={6} align="center">
              <LineKey basin={mark.basin} />
              <Text type={mark.muted ? "secondary" : undefined}>
                {mark.text}
              </Text>
            </Flex>
          ))}
        </Flex>
      }
    >
      <div
        data-start-day
        aria-label={`${title}: ${marks.map((m) => m.text).join(", ")}`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") onOpen(monthDay);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") onOpen(null);
        }}
        onClick={() => onOpen(monthDay)}
        style={{
          ...cell,
          cursor: "pointer",
          fontWeight: 700,
          background,
          color: faint ? MUTED : SECONDARY,
        }}
      >
        {labelled.length > 0 ? (
          <span aria-hidden>
            {labelled.slice(0, 2).map((mark) => (
              <span
                key={mark.key}
                style={{ color: mark.muted ? MUTED : SERIES_COLOR[mark.basin] }}
              >
                {mark.label}
              </span>
            ))}
            {labelled.length > 2 && "+"}
          </span>
        ) : (
          <span
            style={{
              color:
                basins.length === 1 && !faint
                  ? SERIES_COLOR[basins[0]]
                  : undefined,
            }}
          >
            {day}
          </span>
        )}
      </div>
    </Popover>
  );
}

/** Adds a mark to the "MM-DD" day of a YYYY-MM-DD start. */
export function addMark(
  marks: Map<string, StartMark[]>,
  start: string,
  mark: StartMark,
) {
  const day = start.slice(5);
  marks.set(day, [...(marks.get(day) ?? []), mark]);
}
