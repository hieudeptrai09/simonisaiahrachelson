import { useState, type KeyboardEvent } from "react";
import { useElementWidth } from "@/hooks/use-element-width";
import { useOutsidePointer } from "@/hooks/use-outside-pointer";
import { HEIGHT, chartScale } from "@/lib/chart-scale";
import { LAST_DAY, SEASON_DAYS } from "@/lib/dates";
import type { SeasonAverage } from "@/lib/types";
import ChartTooltip from "./chart-tooltip";
import Crosshair from "./crosshair";
import DateMarker from "./date-marker";
import EndLabels from "./end-labels";
import GridAndYAxis from "./grid-and-y-axis";
import HitArea from "./hit-area";
import MonthAxis from "./month-axis";
import SeriesLines from "./series-lines";

const KEY_MOVES: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  PageUp: -30,
  PageDown: 30,
};

/**
 * Both basins' average curves through the year, with `marked` ("MM-DD")
 * flagged. Hover, tap or the arrow keys read off a day's values.
 */
export default function LineChart({
  average,
  marked,
}: {
  average: SeasonAverage;
  marked: string;
}) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  // A tapped reading stays until the next tap outside the chart.
  useOutsidePointer(
    hover !== null,
    (target) => !!wrapRef.current?.contains(target),
    () => setHover(null),
  );

  const scale = chartScale(width, average);
  const markedIndex = SEASON_DAYS.indexOf(marked);

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    if (!(event.key in KEY_MOVES)) return;
    event.preventDefault();
    const from = hover ?? (markedIndex >= 0 ? markedIndex : 0);
    setHover(Math.min(LAST_DAY, Math.max(0, from + KEY_MOVES[event.key])));
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", height: HEIGHT }}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="Line chart of average named storms by date for the Eastern Pacific and Atlantic. Use the arrow keys to read values."
          tabIndex={0}
          onKeyDown={handleKey}
          onBlur={() => setHover(null)}
          style={{ display: "block", outline: "none", fontSize: 12 }}
        >
          <GridAndYAxis scale={scale} />
          <MonthAxis scale={scale} />
          {markedIndex >= 0 && <DateMarker scale={scale} index={markedIndex} />}
          <SeriesLines scale={scale} average={average} />
          {hover === null ? (
            <EndLabels scale={scale} average={average} />
          ) : (
            <Crosshair scale={scale} average={average} index={hover} />
          )}
          <HitArea scale={scale} onRead={setHover} />
        </svg>
      )}

      {hover !== null && (
        <ChartTooltip
          average={average}
          index={hover}
          left={scale.x(hover)}
          width={width}
        />
      )}
    </div>
  );
}
