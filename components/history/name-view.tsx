import { useState } from "react";
import { Flex, Switch, Table, Tag, Typography } from "antd";
import { BASIN_LABELS } from "@/lib/basins";
import { isoDayLabel } from "@/lib/dates";
import { nameSeasons, slotLetter } from "@/lib/name-history";
import type { NameSlot, SlotSeason } from "@/lib/types";
import DisplaySwitcher, { type HistoryDisplay } from "./display-switcher";
import StartCalendar, { addMark, type StartMark } from "./start-calendar";

const { Text } = Typography;

/**
 * "Atlantic set 0", "Eastern Pacific even-year set" for its X–Z, or
 * "Atlantic Greek alphabet".
 */
export function slotSet({
  basin,
  cycle,
  set,
  greek,
}: Pick<NameSlot, "basin" | "cycle" | "set" | "greek">) {
  if (greek) return `${BASIN_LABELS[basin]} Greek alphabet`;
  return cycle === 2
    ? `${BASIN_LABELS[basin]} ${set === 0 ? "even" : "odd"}-year set`
    : `${BASIN_LABELS[basin]} set ${set}`;
}

/** When a season's storm formed, or why it didn't. */
export function formedText(season: SlotSeason, currentYear: number) {
  if (season.start) return isoDayLabel(season.start);
  return season.year === currentYear ? "Not yet" : "Not reached";
}

/**
 * The seasons a name held its letter and the day its storm formed each time.
 * When the name didn't hold the letter from the first season on (it came in
 * later, or was retired), a switch fills the rest of the cycle with the
 * letter's other names.
 */
export default function NameView({
  slot,
  name,
  fill,
  onFillChange,
  currentYear,
}: {
  slot: NameSlot;
  name: string;
  fill: boolean;
  onFillChange: (fill: boolean) => void;
  currentYear: number;
}) {
  const [display, setDisplay] = useState<HistoryDisplay>("Calendar");
  const { seasons: own, complete } = nameSeasons(slot, name);
  const filling = fill && !complete;
  const shown = filling ? slot.seasons : own;
  const formed = own.filter((s) => s.start).length;
  const next = (slot.seasons.at(-1)?.year ?? currentYear) + slot.cycle;
  // A name still on today's list stays on it through the letter's next turn.
  const onList = name === slot.current;
  const listedTo = onList ? next : own.at(-1)?.year;
  const listedSeasons = own.length + (onList ? 1 : 0);

  const marks = new Map<string, StartMark[]>();
  for (const season of shown)
    if (season.start)
      addMark(marks, season.start, {
        key: `${season.year}`,
        basin: slot.basin,
        text: `${season.year} · ${season.name}`,
        muted: season.name !== name,
      });

  return (
    <Flex vertical gap={16}>
      <Text type="secondary">
        Letter <Text strong>{slotLetter(slot)}</Text> of the{" "}
        {slotSet(slot)}.{" "}
        {slot.greek ? (
          <>
            Greek names were only used once a season ran past W, in{" "}
            {slot.seasons.map((s) => s.year).join(" and ")}; the supplemental
            list took over in 2021. <Text strong>{name}</Text> formed in{" "}
            <Text strong>{formed}</Text> of them.
          </>
        ) : own.length > 0 ? (
          <>
            <Text strong>{name}</Text> {onList ? "has been" : "was"} on the
            list in {own[0].year}
            {listedTo !== own[0].year && `–${listedTo}`} ({listedSeasons}{" "}
            {listedSeasons === 1 ? "season" : "seasons"}) and formed in{" "}
            <Text strong>{formed}</Text> of them.
          </>
        ) : (
          <>
            <Text strong>{name}</Text> is on today&apos;s list; its letter
            next comes round in {next}.
          </>
        )}{" "}
        {name !== slot.current &&
          `Today's list has ${slot.current} in its place.`}
      </Text>

      <Flex justify="space-between" align="center" gap={12} wrap>
        {complete ? (
          <span />
        ) : (
          <Flex gap={8} align="center">
            <Switch size="small" checked={fill} onChange={onFillChange} />
            <Text>
              Fill {slot.seasons[0]?.year}–{slot.seasons.at(-1)?.year} with
              the letter&apos;s other names
            </Text>
          </Flex>
        )}
        <DisplaySwitcher value={display} onChange={setDisplay} />
      </Flex>

      {shown.length === 0 ? (
        <Text type="secondary">No seasons to show yet.</Text>
      ) : display === "Calendar" ? (
        <StartCalendar year={null} marks={marks} />
      ) : (
        <Table
          size="small"
          pagination={false}
          rowKey="year"
          dataSource={shown}
          columns={[
            { title: "Season", dataIndex: "year" },
            {
              title: "Name",
              dataIndex: "name",
              render: (value: string) =>
                value === name ? (
                  <Text strong>{value}</Text>
                ) : (
                  <Flex gap={6} align="center">
                    <Text>{value}</Text>
                    <Tag>Same letter</Tag>
                  </Flex>
                ),
            },
            {
              title: "Formed",
              key: "start",
              render: (_: unknown, season: SlotSeason) => (
                <Text
                  type={season.start ? undefined : "secondary"}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formedText(season, currentYear)}
                </Text>
              ),
            },
          ]}
        />
      )}
    </Flex>
  );
}
