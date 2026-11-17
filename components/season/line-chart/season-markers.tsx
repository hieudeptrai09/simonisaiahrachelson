import { BASINS } from "@/lib/basins";
import { MARGIN, type ChartScale } from "@/lib/chart-scale";
import { SERIES_COLOR } from "@/lib/chart-theme";
import { SEASON_DAYS, dayLabel } from "@/lib/dates";
import type { SeasonBounds } from "@/lib/types";

const EDGES = ["start", "end"] as const;

/** Dashed rules at each basin's average season start and end, under the lines. */
export function SeasonRules({
  scale,
  bounds,
}: {
  scale: ChartScale;
  bounds: SeasonBounds;
}) {
  return (
    <g pointerEvents="none">
      {BASINS.flatMap((basin) => {
        const bound = bounds.basins[basin];
        if (!bound) return [];
        return EDGES.map((edge) => {
          const x = scale.x(bound[edge]);
          return (
            <line
              key={`${basin}-${edge}`}
              x1={x}
              x2={x}
              y1={MARGIN.top}
              y2={MARGIN.top + scale.plotH}
              stroke={SERIES_COLOR[basin]}
              strokeOpacity={0.7}
              strokeWidth={1}
              strokeDasharray="4 3"
              shapeRendering="crispEdges"
            />
          );
        });
      })}
    </g>
  );
}

/**
 * "Start 25 May" / "End 15 Nov" beside each rule, one row per basin near the
 * top of the plot, where the curves are low at the start and clear of the end.
 */
export function SeasonLabels({
  scale,
  bounds,
}: {
  scale: ChartScale;
  bounds: SeasonBounds;
}) {
  return (
    <g pointerEvents="none" style={{ fontSize: 11 }}>
      {BASINS.flatMap((basin, row) => {
        const bound = bounds.basins[basin];
        if (!bound) return [];
        return EDGES.map((edge) => {
          const x = scale.x(bound[edge]);
          const start = edge === "start";
          return (
            <text
              key={`${basin}-${edge}`}
              x={start ? x + 4 : x - 4}
              y={MARGIN.top + 12 + row * 14}
              textAnchor={start ? "start" : "end"}
              fill={SERIES_COLOR[basin]}
              stroke="#ffffff"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {start ? "Start" : "End"} {dayLabel(SEASON_DAYS[bound[edge]])}
            </text>
          );
        });
      })}
    </g>
  );
}
