import type { Basin } from "./basins";

// Categorical slots 1 and 2 of the dataviz reference palette; chrome is kept
// a step off the surface so the two lines carry the ink.
export const SERIES_COLOR: Record<Basin, string> = {
  E: "#2a78d6",
  L: "#eb6834",
};
export const GRID = "#e1e0d9";
export const AXIS = "#c3c2b7";
export const MUTED = "#898781";
export const SECONDARY = "#52514e";

// Calendar: alternate stretches are told apart by a light and a mid tint of
// the first series hue; the stretch of the open day turns a light red.
export const STRETCH_TINTS = ["#e3edf9", "#b9d2f0"];
export const ACTIVE_TINT = "#f5bdb6";
