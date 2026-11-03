import type { PointerEvent } from "react";
import { MARGIN, type ChartScale } from "@/lib/chart-scale";
import { LAST_DAY } from "@/lib/dates";

/**
 * Invisible cover over the whole plot that reports the nearest day under the
 * pointer. Mouse reads on hover; touch reads on tap, so a swipe still scrolls.
 */
export default function HitArea({
  scale,
  onRead,
}: {
  scale: ChartScale;
  /** SEASON_DAYS index under the pointer, or null when the mouse leaves. */
  onRead: (index: number | null) => void;
}) {
  function indexAt(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    return Math.min(LAST_DAY, Math.max(0, Math.round(ratio * LAST_DAY)));
  }

  return (
    <rect
      x={MARGIN.left}
      y={MARGIN.top}
      width={scale.plotW}
      height={scale.plotH}
      fill="transparent"
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") onRead(indexAt(event));
      }}
      onPointerDown={(event) => onRead(indexAt(event))}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onRead(null);
      }}
    />
  );
}
