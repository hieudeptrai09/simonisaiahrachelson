import { BASINS } from "@/lib/basins";
import { MARGIN, type ChartScale } from "@/lib/chart-scale";
import { MUTED, SERIES_COLOR } from "@/lib/chart-theme";
import type { SeasonAverage } from "@/lib/types";

/** A vertical rule at the day being read, with a dot on each line. */
export default function Crosshair({
  scale,
  average,
  index,
}: {
  scale: ChartScale;
  average: SeasonAverage;
  /** SEASON_DAYS index being read. */
  index: number;
}) {
  const x = scale.x(index);

  return (
    <g pointerEvents="none">
      <line
        x1={x}
        x2={x}
        y1={MARGIN.top}
        y2={MARGIN.top + scale.plotH}
        stroke={MUTED}
        strokeWidth={1}
        shapeRendering="crispEdges"
      />
      {BASINS.map((basin) => (
        <circle
          key={basin}
          cx={x}
          cy={scale.y(average[basin][index])}
          r={4}
          fill={SERIES_COLOR[basin]}
          stroke="#ffffff"
          strokeWidth={2}
        />
      ))}
    </g>
  );
}
