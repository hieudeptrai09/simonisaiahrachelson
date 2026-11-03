import dayjs from "dayjs";
import { Flex, Typography } from "antd";
import { SEASON_DAYS } from "@/lib/dates";
import type { SeasonCalendar } from "@/lib/season-positions";
import CalendarDay from "./calendar-day";

const { Text } = Typography;

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** One month as a Monday-first grid of days under a weekday header. */
export default function MonthGrid({
  year,
  month,
  calendar,
  openDay,
  activeStretch,
  markedIndex,
  onOpen,
}: {
  year: number;
  /** 0 = January. */
  month: number;
  calendar: SeasonCalendar;
  /** SEASON_DAYS index of the day whose popup is open, if any. */
  openDay: number | null;
  /** Stretch of the open day, if any. */
  activeStretch: number | null;
  /** SEASON_DAYS index of the chosen date. */
  markedIndex: number;
  onOpen: (index: number | null) => void;
}) {
  const first = dayjs(new Date(year, month, 1));
  // Monday-first offset of the 1st.
  const blanks = (first.day() + 6) % 7;

  return (
    <Flex vertical gap={4}>
      <Text strong>{first.format("MMMM")}</Text>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
      >
        {WEEKDAYS.map((weekday, i) => (
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
          const i = SEASON_DAYS.indexOf(first.date(d + 1).format("MM-DD"));
          return (
            <CalendarDay
              key={d}
              day={d + 1}
              index={i}
              calendar={calendar}
              open={openDay === i}
              active={calendar.stretchOf.get(i) === activeStretch}
              marked={i === markedIndex}
              onOpen={onOpen}
            />
          );
        })}
      </div>
    </Flex>
  );
}
