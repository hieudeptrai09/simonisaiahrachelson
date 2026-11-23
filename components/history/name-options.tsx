import { Flex, Typography, type SelectProps } from "antd";
import { BASINS, BASIN_LABELS, type Basin } from "@/lib/basins";
import { nameSeasons, slotLetter, slotNames } from "@/lib/name-history";
import type { NameSlot } from "@/lib/types";
import { slotSet } from "./name-view";

const { Text } = Typography;

export const NAME_ORDERS = ["A–Z", "First season", "List order"] as const;
export type NameOrder = (typeof NAME_ORDERS)[number];

type Entry = {
  slot: NameSlot;
  name: string;
  /** First season the name was on the list, or the next one its letter comes round. */
  first: number;
  span: string;
};

const BASIN_RANK: Record<Basin, number> = { E: 0, L: 1 };

const byName = (a: Entry, b: Entry) => a.name.localeCompare(b.name);
const byFirst = (a: Entry, b: Entry) => a.first - b.first;
const byBasin = (a: Entry, b: Entry) =>
  BASIN_RANK[a.slot.basin] - BASIN_RANK[b.slot.basin];
/** Six-year sets 0–5, then the Eastern Pacific's even- and odd-year X–Z; A to Z within each. */
const byList = (a: Entry, b: Entry) =>
  b.slot.cycle - a.slot.cycle ||
  a.slot.set - b.slot.set ||
  a.slot.position - b.slot.position;

const COMPARE: Record<NameOrder, (a: Entry, b: Entry) => number> = {
  "A–Z": (a, b) => byName(a, b) || byFirst(a, b) || byBasin(a, b),
  "First season": (a, b) => byFirst(a, b) || byName(a, b) || byBasin(a, b),
  "List order": (a, b) => byList(a, b) || byBasin(a, b) || byFirst(a, b),
};

/** Every name each slot has held or holds, with when it was first on the list. */
function entries(slots: NameSlot[], to: number): Entry[] {
  return slots.flatMap((slot) =>
    slotNames(slot).map((name) => {
      const { seasons } = nameSeasons(slot, name);
      const next = (slot.seasons.at(-1)?.year ?? to) + slot.cycle;
      return {
        slot,
        name,
        first: seasons[0]?.year ?? next,
        span: seasons.length
          ? `${seasons[0].year}${seasons.length > 1 ? `–${seasons.at(-1)!.year}` : ""}`
          : `from ${next}`,
      };
    }),
  );
}

const option = ({ slot, name, span }: Entry) => ({
  value: `${slot.id}|${name}`,
  search: name,
  label: (
    <Flex justify="space-between" gap={8}>
      <span>{name}</span>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {slotLetter(slot)} · {slotSet(slot)} · {span}
      </Text>
    </Flex>
  ),
});

/**
 * The name picker's options in `order`: one group per basin, or with `mixed`
 * a single list of both. A name that held two letters is listed under each.
 */
export function nameOptions(
  slots: NameSlot[],
  to: number,
  order: NameOrder,
  mixed: boolean,
): NonNullable<SelectProps["options"]> {
  const all = entries(slots, to).sort(COMPARE[order]);
  if (mixed) return all.map(option);
  return BASINS.map((basin) => ({
    label: BASIN_LABELS[basin],
    title: BASIN_LABELS[basin],
    options: all.filter((e) => e.slot.basin === basin).map(option),
  }));
}
