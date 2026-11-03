import { Flex, Typography } from "antd";
import { BASINS, BASIN_LABELS } from "@/lib/basins";
import { MARGIN } from "@/lib/chart-scale";
import { SEASON_DAYS, dayLabel } from "@/lib/dates";
import type { SeasonAverage } from "@/lib/types";
import LineKey from "../line-key";

const { Text } = Typography;

/** Both basins' values on the day being read, beside the crosshair. */
export default function ChartTooltip({
  average,
  index,
  left,
  width,
}: {
  average: SeasonAverage;
  /** SEASON_DAYS index being read. */
  index: number;
  /** The crosshair's x, in px. */
  left: number;
  /** The chart's width, in px. */
  width: number;
}) {
  // Sit beside the crosshair, flipping to its left past the middle.
  const flip = left > width / 2;

  return (
    <div
      role="status"
      style={{
        position: "absolute",
        top: MARGIN.top,
        left: flip ? undefined : left + 12,
        right: flip ? width - left + 12 : undefined,
        pointerEvents: "none",
        background: "#ffffff",
        border: "1px solid rgba(11,11,11,0.10)",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(11,11,11,0.08)",
        padding: "8px 12px",
        whiteSpace: "nowrap",
      }}
    >
      <Text type="secondary" style={{ fontSize: 12 }}>
        By {dayLabel(SEASON_DAYS[index])}
      </Text>
      {BASINS.map((basin) => (
        <Flex key={basin} gap={8} align="center">
          <LineKey basin={basin} />
          <Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
            {average[basin][index].toFixed(2)}
          </Text>
          <Text type="secondary">{BASIN_LABELS[basin]}</Text>
        </Flex>
      ))}
    </div>
  );
}
