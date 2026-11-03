import { MARGIN, type ChartScale } from "@/lib/chart-scale";
import { AXIS, SECONDARY } from "@/lib/chart-theme";
import { LAST_DAY, SEASON_DAYS, dayLabel } from "@/lib/dates";

/** A vertical rule at the chosen day, labelled above the plot. */
export default function DateMarker({
  scale,
  index,
}: {
  scale: ChartScale;
  /** SEASON_DAYS index of the chosen day. */
  index: number;
}) {
  const x = scale.x(index);
  // Keep the label inside the chart near either end.
  const anchor =
    index > LAST_DAY * 0.85
      ? "end"
      : index < LAST_DAY * 0.15
        ? "start"
        : "middle";

  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={MARGIN.top}
        y2={MARGIN.top + scale.plotH}
        stroke={AXIS}
        strokeWidth={1}
        shapeRendering="crispEdges"
      />
      <text x={x} y={MARGIN.top - 8} textAnchor={anchor} fill={SECONDARY}>
        {dayLabel(SEASON_DAYS[index])}
      </text>
    </g>
  );
}
