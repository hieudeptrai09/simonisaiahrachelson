import { Flex, Popover, Typography } from "antd";
import { BASINS, BASIN_LABELS, type Basin } from "@/lib/basins";
import {
  ACTIVE_TINT,
  SECONDARY,
  SERIES_COLOR,
  STRETCH_TINTS,
} from "@/lib/chart-theme";
import { SEASON_DAYS, dayLabel } from "@/lib/dates";
import { letter } from "@/lib/format";
import { edgeLabel } from "@/lib/season-bounds";
import { stretchRange, type SeasonCalendar } from "@/lib/season-positions";
import type { SeasonEdge } from "@/lib/types";
import LineKey from "../line-key";

const { Text } = Typography;

/**
 * One day, tinted by its stretch, with a popup of the stretch's dates and
 * each basin's expected letter. A day on which a basin's average season
 * starts or ends shows an asterisk in the basin's colour instead of its number.
 */
export default function CalendarDay({
  day,
  index,
  calendar,
  open,
  active,
  marked,
  edges,
  onOpen,
}: {
  /** Day of the month. */
  day: number;
  /** SEASON_DAYS index. */
  index: number;
  calendar: SeasonCalendar;
  open: boolean;
  /** Whether this day is in the open day's stretch. */
  active: boolean;
  /** Whether this is the chosen date. */
  marked: boolean;
  /** Season starts and ends that fall on this day. */
  edges: SeasonEdge[];
  onOpen: (index: number | null) => void;
}) {
  const stretch = calendar.stretchOf.get(index)!;
  const { positions } = calendar;
  const letters = BASINS.map(
    (b) => `${BASIN_LABELS[b]} ${letter(positions[b][index])}`,
  ).join(", ");
  const edgeText = edges.map(
    (e) => `${edgeLabel(e)} on ${dayLabel(SEASON_DAYS[index])} (average)`,
  );

  return (
    <Popover
      open={open}
      trigger={[]}
      title={stretchRange(calendar, stretch)}
      content={
        <Flex vertical gap={4}>
          {BASINS.map((basin) => (
            <Flex key={basin} gap={6} align="center">
              <LineKey basin={basin} />
              <Text type="secondary">{BASIN_LABELS[basin]}</Text>
              <Text strong>{letter(positions[basin][index])}</Text>
            </Flex>
          ))}
          {edgeText.map((text) => (
            <Text key={text} type="secondary" style={{ fontSize: 12 }}>
              {text}
            </Text>
          ))}
        </Flex>
      }
    >
      <div
        data-day
        aria-label={[
          `${dayLabel(SEASON_DAYS[index])}: ${letters}`,
          ...edgeText,
        ].join(". ")}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") onOpen(index);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") onOpen(null);
        }}
        onClick={() => onOpen(index)}
        style={{
          cursor: "pointer",
          textAlign: "center",
          fontSize: 12,
          lineHeight: "24px",
          borderRadius: 4,
          fontVariantNumeric: "tabular-nums",
          color: SECONDARY,
          background: active ? ACTIVE_TINT : STRETCH_TINTS[stretch % 2],
          boxShadow: marked ? `inset 0 0 0 1.5px ${SECONDARY}` : undefined,
        }}
      >
        {edges.length > 0 ? (
          <span aria-hidden>
            {edges.map(({ basin, edge }) => (
              <EdgeMark key={`${basin}-${edge}`} basin={basin} />
            ))}
          </span>
        ) : (
          day
        )}
      </div>
    </Popover>
  );
}

/** An asterisk in a basin's colour, marking its average season start or end. */
export function EdgeMark({ basin }: { basin: Basin }) {
  return (
    <span aria-hidden style={{ color: SERIES_COLOR[basin], fontWeight: 700 }}>
      *
    </span>
  );
}
