import { useState } from "react";
import dayjs from "dayjs";
import { Flex, Typography } from "antd";
import type { SeasonResponse } from "@/lib/types";
import Legend from "./legend";
import LineChart from "./line-chart/line-chart";
import MonthTable from "./month-table";
import NameCalendar from "./name-calendar/name-calendar";
import NameTable from "./name-table";
import ViewSwitcher, { type SeasonViewName } from "./view-switcher";

const { Text } = Typography;

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
      </Text>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Legend />
        <ViewSwitcher value={view} onChange={setView} />
      </Flex>
      {view === "Chart" ? (
        <LineChart average={data.average} marked={date.slice(5)} />
      ) : view === "Table (Date)" ? (
        <MonthTable average={data.average} />
      ) : view === "Table (Name)" ? (
        <NameTable average={data.average} />
      ) : (
        <NameCalendar average={data.average} date={date} />
      )}
    </Flex>
  );
}
