import { HEIGHT, type ChartScale } from "@/lib/chart-scale";
import { MUTED } from "@/lib/chart-theme";
import { SEASON_DAYS, monthLabel } from "@/lib/dates";

/** SEASON_DAYS index of the first of each month. */
const MONTH_STARTS = SEASON_DAYS.flatMap((day, i) =>
  day.endsWith("-01") ? [i] : [],
);

/** Month labels along the bottom, thinned out when the chart is narrow. */
export default function MonthAxis({ scale }: { scale: ChartScale }) {
  const labelEvery = scale.width < 420 ? 3 : scale.width < 640 ? 2 : 1;

  return (
    <>
      {MONTH_STARTS.map((i, n) =>
        n % labelEvery === 0 ? (
          <text key={i} x={scale.x(i)} y={HEIGHT - 8} fill={MUTED}>
            {monthLabel(SEASON_DAYS[i])}
          </text>
        ) : null,
      )}
    </>
  );
}
