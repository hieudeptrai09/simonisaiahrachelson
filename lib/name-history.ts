// Which name held each letter of each list, season by season.

import { BASINS, perBasin, type Basin } from "./basins";
import { letter, positionOf } from "./format";
import { SUPPLEMENTAL_SET } from "./name-lists";
import type {
  HistoryResponse,
  NameLists,
  NameSlot,
  SlotSeason,
  StormStart,
} from "./types";

/** The first season of today's rotation: both basins' lists since 1979. */
export const NAME_HISTORY_FROM = 1979;

/** Overflow names before the supplemental list replaced them in 2021. */
const GREEK_NAMES =
  "Alpha Beta Gamma Delta Epsilon Zeta Eta Theta Iota Kappa Lambda Mu Nu Xi Omicron Pi Rho Sigma Tau Upsilon Phi Chi Psi Omega".split(
    " ",
  );
const GREEK_SYMBOLS = "αβγδεζηθικλμνξοπρστυφχψω";

/** A slot's initial: its letter, or its Greek symbol. */
export const slotLetter = ({ greek, position }: NameSlot) =>
  greek ? GREEK_SYMBOLS[position - 1] : letter(position);

/** Sort key down a year's lists: A to Z, then the Greek names. */
export const slotOrder = ({ greek, position }: NameSlot) =>
  (greek ? 100 : 0) + position;

/** Eastern Pacific X, Y and Z names alternate yearly; every other letter has six lists. */
export function cycleLength(basin: Basin, position: number) {
  return basin === "E" && position >= 22 ? 2 : 6;
}

const slotId = (basin: Basin, set: number, position: number) =>
  `${basin}-${set}-${position}`;

const slotOf = (basin: Basin, year: number, position: number) => {
  const cycle = cycleLength(basin, position);
  return slotId(basin, year % cycle, position);
};

/**
 * Splits each basin's storms into the letter slots of their year's list and
 * the rest (Greek and supplemental names, Central Pacific names, storms that
 * crossed over from the other basin). A season's slot can see more than one
 * storm with its initial; the one whose name recurs in that slot (in other
 * seasons or on today's list) holds it, else the earliest.
 */
export function nameHistory(
  storms: (StormStart & { basin: Basin })[],
  lists: NameLists,
  to: number,
): HistoryResponse {
  const from = NAME_HISTORY_FROM;
  const supplemental = new Set(
    BASINS.flatMap((b) => lists[b][SUPPLEMENTAL_SET] ?? []),
  );
  const others = perBasin(() => [] as StormStart[]);
  const greek = perBasin(() => [] as StormStart[]);

  // Storms sorted by start, grouped per basin, season and letter.
  const sorted = storms
    .filter((s) => s.year >= from && s.year <= to)
    .sort((a, b) => a.start.localeCompare(b.start));
  const candidates = new Map<string, (StormStart & { basin: Basin })[]>();
  for (const storm of sorted) {
    const position = positionOf(storm.name);
    const listLength = lists[storm.basin][0].length;
    if (GREEK_NAMES.includes(storm.name)) {
      greek[storm.basin].push(stripBasin(storm));
      continue;
    }
    if (
      position < 1 ||
      position > listLength ||
      supplemental.has(storm.name)
    ) {
      others[storm.basin].push(stripBasin(storm));
      continue;
    }
    const key = `${storm.basin}|${storm.year}|${position}`;
    candidates.set(key, [...(candidates.get(key) ?? []), storm]);
  }

  // How many seasons each name appears in each slot, counting today's list.
  const usage = new Map<string, number>();
  const count = (slot: string, name: string) =>
    usage.set(`${slot}|${name}`, (usage.get(`${slot}|${name}`) ?? 0) + 1);
  for (const [key, group] of candidates) {
    const [basin, year, position] = key.split("|");
    const slot = slotOf(basin as Basin, Number(year), Number(position));
    for (const storm of group) count(slot, storm.name);
  }
  for (const basin of BASINS)
    for (let set = 0; set < SUPPLEMENTAL_SET; set++)
      lists[basin][set].forEach((name, i) =>
        count(slotOf(basin, set, i + 1), name),
      );

  const held = new Map<string, StormStart>();
  for (const [key, group] of candidates) {
    const [basin, year, position] = key.split("|");
    const slot = slotOf(basin as Basin, Number(year), Number(position));
    // Stable sort keeps the earliest first among equals.
    const ranked = [...group].sort(
      (a, b) =>
        (usage.get(`${slot}|${b.name}`) ?? 0) -
        (usage.get(`${slot}|${a.name}`) ?? 0),
    );
    held.set(key, stripBasin(ranked[0]));
    for (const storm of ranked.slice(1))
      others[basin as Basin].push(stripBasin(storm));
  }
  for (const basin of BASINS)
    others[basin].sort((a, b) => a.start.localeCompare(b.start));

  const slots: NameSlot[] = [];
  for (const basin of BASINS) {
    lists[basin][0].forEach((_, i) => {
      const position = i + 1;
      const cycle = cycleLength(basin, position);
      for (let set = 0; set < cycle; set++) {
        const current = lists[basin][set][i];
        slots.push({
          id: slotId(basin, set, position),
          basin,
          position,
          cycle,
          set,
          current,
          seasons: slotSeasons(
            (year) => held.get(`${basin}|${year}|${position}`),
            current,
            firstYear(from, cycle, set),
            to,
            cycle,
          ),
        });
      }
    });
  }
  for (const basin of BASINS) slots.push(...greekSlots(basin, greek[basin]));

  return { years: { from, to }, slots, others };
}

/**
 * One slot per Greek name up to the furthest one used, each spanning only the
 * seasons that ran into the Greek alphabet (2005 and 2020).
 */
function greekSlots(basin: Basin, storms: StormStart[]): NameSlot[] {
  const years = [...new Set(storms.map((s) => s.year))].sort((a, b) => a - b);
  const reached = Math.max(0, ...storms.map((s) => GREEK_NAMES.indexOf(s.name) + 1));
  return GREEK_NAMES.slice(0, reached).map((name, i) => ({
    id: `${basin}-greek-${i + 1}`,
    basin,
    position: i + 1,
    cycle: 0,
    set: 0,
    current: name,
    greek: true,
    seasons: years.map((year) => ({
      year,
      name,
      start:
        storms.find((s) => s.year === year && s.name === name)?.start ?? null,
    })),
  }));
}

const stripBasin = ({ year, name, start }: StormStart): StormStart => ({
  year,
  name,
  start,
});

/** First season on or after `from` with year mod cycle = set. */
const firstYear = (from: number, cycle: number, set: number) =>
  from + ((set - (from % cycle) + cycle) % cycle);

/**
 * A slot's seasons from `first` to `to`. A name only leaves a list after it's
 * used, so a season that never got to the letter had the next name the slot
 * went on to use, or today's name if it hasn't been used since.
 */
function slotSeasons(
  stormIn: (year: number) => StormStart | undefined,
  current: string,
  first: number,
  to: number,
  cycle: number,
): SlotSeason[] {
  const seasons: SlotSeason[] = [];
  let next = current;
  for (let year = first; year <= to; year += cycle) seasons.push({ year, name: "", start: null });
  for (let i = seasons.length - 1; i >= 0; i--) {
    const storm = stormIn(seasons[i].year);
    if (storm) next = storm.name;
    seasons[i] = { year: seasons[i].year, name: next, start: storm?.start ?? null };
  }
  return seasons;
}

/** A name in a slot: every season it held, and whether that spans the slot's. */
export function nameSeasons(slot: NameSlot, name: string) {
  const seasons = slot.seasons.filter((s) => s.name === name);
  const complete =
    seasons.length > 0 &&
    slot.seasons[0].name === name &&
    slot.seasons.at(-1)!.name === name;
  return { seasons, complete };
}

/** Every name a slot has held or holds now, oldest first. */
export function slotNames(slot: NameSlot) {
  return [...new Set([...slot.seasons.map((s) => s.name), slot.current])];
}

/** The slot of each letter in `year`'s list for a basin, Greek names after Z. */
export function yearSlots(slots: NameSlot[], basin: Basin, year: number) {
  return slots
    .filter((slot) => slot.basin === basin && seasonIn(slot, year))
    .sort((a, b) => slotOrder(a) - slotOrder(b));
}

/** The name and start a slot had in `year`, if the slot came round then. */
export const seasonIn = (slot: NameSlot, year: number) =>
  slot.seasons.find((s) => s.year === year);
