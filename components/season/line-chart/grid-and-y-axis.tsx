import { MARGIN, type ChartScale } from "@/lib/chart-scale";
import { AXIS, GRID, MUTED } from "@/lib/chart-theme";

/** Horizontal gridlines with their storm-count labels; the zero line is the axis. */
export default function GridAndYAxis({ scale }: { scale: ChartScale }) {
  const { plotW, yMax, step, y } = scale;
  const ticks = Array.from({ length: yMax / step + 1 }, (_, i) => i * step);

  return (
    <>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={MARGIN.left}
            x2={MARGIN.left + plotW}
            y1={y(tick)}
            y2={y(tick)}
            stroke={tick === 0 ? AXIS : GRID}
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
          <text
            x={MARGIN.left - 8}
            y={y(tick)}
            dy="0.32em"
            textAnchor="end"
            fill={MUTED}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        </g>
      ))}
    </>
  );
}
