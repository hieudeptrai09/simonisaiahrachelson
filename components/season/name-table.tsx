import { Table, Typography } from "antd";
import { BASINS, BASIN_LABELS } from "@/lib/basins";
import { letter } from "@/lib/format";
import { nameSpan, namesReached } from "@/lib/season-positions";
import type { SeasonAverage } from "@/lib/types";

const { Text } = Typography;

/**
 * When each name is the expected one: name #n runs from the first day the
 * average reaches n − 1 to the first day it reaches n (or 31 Dec).
 */
export default function NameTable({ average }: { average: SeasonAverage }) {
  // Every name whose start the average reaches by 31 Dec.
  const rows = Array.from({ length: namesReached(average) }, (_, i) => ({
    key: i + 1,
    position: i + 1,
  }));

  return (
    <Table
      size="small"
      pagination={false}
      dataSource={rows}
      columns={[
        {
          title: "Name",
          dataIndex: "position",
          render: (position: number) => <Text strong>{letter(position)}</Text>,
        },
        ...BASINS.map((basin) => ({
          title: BASIN_LABELS[basin],
          key: basin,
          render: (_: unknown, row: (typeof rows)[number]) => {
            const dates = nameSpan(average, basin, row.position);
            return (
              <Text
                type={dates ? undefined : "secondary"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {dates ?? "—"}
              </Text>
            );
          },
        })),
      ]}
    />
  );
}
