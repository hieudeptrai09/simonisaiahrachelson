import { useState } from "react";
import { Flex, Table, Typography } from "antd";
import { BASINS, BASIN_LABELS, type Basin } from "@/lib/basins";
import { isoDayLabel } from "@/lib/dates";
import {
  seasonIn,
  slotLetter,
  slotOrder,
  yearSlots,
} from "@/lib/name-history";
import type { HistoryResponse, SlotSeason } from "@/lib/types";
import LineKey from "@/components/season/line-key";
import DisplaySwitcher, { type HistoryDisplay } from "./display-switcher";
import { formedText } from "./name-view";
import StartCalendar, { addMark, type StartMark } from "./start-calendar";

const { Text, Title } = Typography;

type Row = { order: number; label: string } & Partial<
  Record<Basin, SlotSeason>
>;

/**
 * Every letter of `year`'s lists and the day its storm formed, plus the storms
 * that took no name from the lists.
 */
export default function YearView({
  data,
  year,
}: {
  data: HistoryResponse;
  year: number;
}) {
  const [display, setDisplay] = useState<HistoryDisplay>("Calendar");

  // One row per letter, both basins side by side; Greek names after Z.
  const byOrder = new Map<number, Row>();
  const marks = new Map<string, StartMark[]>();
  for (const basin of BASINS)
    for (const slot of yearSlots(data.slots, basin, year)) {
      const season = seasonIn(slot, year)!;
      const order = slotOrder(slot);
      const label = slotLetter(slot);
      byOrder.set(order, { ...byOrder.get(order), order, label, [basin]: season });
      if (season.start)
        addMark(marks, season.start, {
          key: slot.id,
          basin,
          label,
          text: season.name,
        });
    }
  const rows = [...byOrder.values()].sort((a, b) => a.order - b.order);

  const others = BASINS.flatMap((basin) =>
    data.others[basin]
      .filter((storm) => storm.year === year)
      .map((storm) => ({ ...storm, basin })),
  );
  for (const storm of others)
    addMark(marks, storm.start, {
      key: `${storm.basin}-${storm.name}`,
      basin: storm.basin,
      label: storm.name.charAt(0),
      text: `${storm.name} (not from the list)`,
      muted: true,
    });

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Text type="secondary">
          {year} uses Atlantic set {year % 6} and Eastern Pacific set{" "}
          {year % 6}, with X, Y and Z from the Eastern Pacific{" "}
          {year % 2 === 0 ? "even" : "odd"}-year set. Letters mark the day
          each storm formed.
        </Text>
        <DisplaySwitcher value={display} onChange={setDisplay} />
      </Flex>

      {display === "Calendar" ? (
        <StartCalendar year={year} marks={marks} />
      ) : (
        <Table
          size="small"
          pagination={false}
          rowKey="order"
          dataSource={rows}
          columns={[
            {
              title: "Letter",
              dataIndex: "label",
              render: (label: string) => <Text strong>{label}</Text>,
            },
            ...BASINS.map((basin) => ({
              title: (
                <Flex gap={6} align="center">
                  <LineKey basin={basin} />
                  {BASIN_LABELS[basin]}
                </Flex>
              ),
              key: basin,
              render: (_: unknown, row: Row) => {
                const season = row[basin];
                if (!season) return <Text type="secondary">—</Text>;
                return (
                  <Flex justify="space-between" gap={8}>
                    <Text
                      strong={!!season.start}
                      type={season.start ? undefined : "secondary"}
                    >
                      {season.name}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formedText(season, data.years.to)}
                    </Text>
                  </Flex>
                );
              },
            })),
          ]}
        />
      )}

      {others.length > 0 && (
        <Flex vertical gap={4}>
          <Title level={5} style={{ margin: 0 }}>
            Named outside the year&apos;s lists
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Central Pacific names and storms that kept their name crossing
            from the other basin.
          </Text>
          {others.map((storm) => (
            <Flex key={`${storm.basin}-${storm.name}`} gap={6} align="center">
              <LineKey basin={storm.basin} />
              <Text>{storm.name}</Text>
              <Text type="secondary">{isoDayLabel(storm.start)}</Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
