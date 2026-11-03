export const BASINS = ["E", "L"] as const;
export type Basin = (typeof BASINS)[number];

export const BASIN_LABELS: Record<Basin, string> = {
  E: "Eastern Pacific",
  L: "Atlantic",
};

/** Lists start in 1966 — the first season in the hurricanes table. */
export const FIRST_YEAR = 1966;

/** "Eastern Pacific (E)": the heading of a basin's card. */
export const basinTitle = (basin: Basin) => `${BASIN_LABELS[basin]} (${basin})`;

/** A record with one entry per basin, built by `make`. */
export function perBasin<T>(make: (basin: Basin) => T): Record<Basin, T> {
  return Object.fromEntries(BASINS.map((basin) => [basin, make(basin)])) as Record<
    Basin,
    T
  >;
}
