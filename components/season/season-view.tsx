import { useState } from "react";
import dayjs from "dayjs";
import { Flex, Typography } from "antd";
import type { SeasonBounds, SeasonResponse } from "@/lib/types";
import Legend from "./legend";
import LineChart from "./line-chart/line-chart";
import MonthTable from "./month-table";
import NameCalendar from "./name-calendar/name-calendar";
import NameTable from "./name-table";
import ViewSwitcher, { type SeasonViewName } from "./view-switcher";

const { Text } = Typography;

/** "1966–2025", or "start 1966–2026, end 1966–2025" once they differ. */
function boundYears({ from, start, end }: SeasonBounds["years"]) {
  return start === end
    ? `${from}–${end}`
    : `start ${from}–${start}, end ${from}–${end}`;
}

/** The season curve's caption and legend, and the view picked below them. */
export default function SeasonView({
  data,
  date,
}: {
  data: SeasonResponse;
  date: string;
}) {
  const [view, setView] = useState<SeasonViewName>("Chart");
  const partial = data.years.to === dayjs().year();

  return (
    <Flex vertical gap={16}>
      <Text type="secondary">
        Named storms formed between 1 Jan and each date, averaged over{" "}
        {data.years.from}–{data.years.to}
        {partial && ` (${data.years.to} only counts for dates it has reached)`}.
        The dates beside each basin are its average season, from the first
        storm reaching tropical-storm strength to the last one falling below
        it ({boundYears(data.bounds.years)}).
      </Text>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Legend bounds={data.bounds} />
        <ViewSwitcher value={view} onChange={setView} />
      </Flex>
      {view === "Chart" ? (
        <LineChart
          average={data.average}
          bounds={data.bounds}
          marked={date.slice(5)}
        />
      ) : view === "Table (Date)" ? (
        <MonthTable average={data.average} />
      ) : view === "Table (Name)" ? (
        <NameTable average={data.average} />
      ) : (
        <NameCalendar average={data.average} bounds={data.bounds} date={date} />
      )}
    </Flex>
  );
}
