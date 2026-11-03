import { BASINS, BASIN_LABELS } from "@/lib/basins";
import type { ChartScale } from "@/lib/chart-scale";
import { SECONDARY } from "@/lib/chart-theme";
import { LAST_DAY } from "@/lib/dates";
import type { SeasonAverage } from "@/lib/types";

/** Basin names at the right-hand end of each line. */
export default function EndLabels({
  scale,
  average,
}: {
  scale: ChartScale;
  average: SeasonAverage;
}) {
  // The higher line's label goes above it, the lower one's below.
  const [upper] = [...BASINS].sort(
    (a, b) => average[b][LAST_DAY] - average[a][LAST_DAY],
  );

  return (
    <>
      {BASINS.map((basin) => (
        <text
          key={basin}
          x={scale.x(LAST_DAY) - 4}
          y={scale.y(average[basin][LAST_DAY]) + (basin === upper ? -8 : 16)}
          textAnchor="end"
          fill={SECONDARY}
        >
          {BASIN_LABELS[basin]}
        </text>
      ))}
    </>
  );
}
