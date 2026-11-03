import { BASINS } from "./basins";
import { LAST_DAY } from "./dates";
import type { SeasonAverage } from "./types";

export const HEIGHT = 320;
export const MARGIN = { top: 24, right: 12, bottom: 28, left: 32 };

export type ChartScale = {
  /** Width of the whole chart, in px. */
  width: number;
  plotW: number;
  plotH: number;
  /** Top of the y-axis and the spacing of its ticks. */
  yMax: number;
  step: number;
  /** SEASON_DAYS index → px from the left. */
  x: (i: number) => number;
  /** Storm count → px from the top. */
  y: (v: number) => number;
};

/** Plot size, y-axis range and scales for a chart `width` px wide. */
export function chartScale(width: number, average: SeasonAverage): ChartScale {
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const peak = Math.max(...BASINS.map((basin) => average[basin][LAST_DAY]));
  const step = peak > 25 ? 10 : 5;
  const yMax = Math.max(step, Math.ceil(peak / step) * step);

  return {
    width,
    plotW,
    plotH,
    yMax,
    step,
    x: (i) => MARGIN.left + (i / LAST_DAY) * plotW,
    y: (v) => MARGIN.top + plotH - (v / yMax) * plotH,
  };
}
