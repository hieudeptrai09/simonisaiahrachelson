import { BASINS } from "@/lib/basins";
import type { ChartScale } from "@/lib/chart-scale";
import { SERIES_COLOR } from "@/lib/chart-theme";
import type { SeasonAverage } from "@/lib/types";

/** One line per basin through its daily averages. */
export default function SeriesLines({
  scale,
  average,
}: {
  scale: ChartScale;
  average: SeasonAverage;
}) {
  const { x, y } = scale;

  return (
    <>
      {BASINS.map((basin) => (
        <path
          key={basin}
          d={average[basin]
            .map(
              (v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`,
            )
            .join("")}
          fill="none"
          stroke={SERIES_COLOR[basin]}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}
