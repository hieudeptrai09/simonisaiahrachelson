import { Table } from "antd";
import { BASINS, BASIN_LABELS } from "@/lib/basins";
import { SEASON_DAYS, dayLabel } from "@/lib/dates";
import type { SeasonAverage } from "@/lib/types";

/** The last day of each month, with its SEASON_DAYS index. */
const MONTH_ENDS = SEASON_DAYS.flatMap((day, i) => {
  const next = SEASON_DAYS[i + 1];
  return !next || next.endsWith("-01") ? [{ key: day, day, i }] : [];
});

/** The curve's values at the end of each month. */
export default function MonthTable({ average }: { average: SeasonAverage }) {
  return (
    <Table
      size="small"
      pagination={false}
      dataSource={MONTH_ENDS}
      columns={[
        { title: "By", dataIndex: "day", render: dayLabel },
        ...BASINS.map((basin) => ({
          title: BASIN_LABELS[basin],
          key: basin,
          align: "right" as const,
          render: (_: unknown, row: (typeof MONTH_ENDS)[number]) =>
            average[basin][row.i].toFixed(2),
        })),
      ]}
    />
  );
}
