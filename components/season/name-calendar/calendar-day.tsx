import { Flex, Popover, Typography } from "antd";
import { BASINS, BASIN_LABELS } from "@/lib/basins";
import { ACTIVE_TINT, SECONDARY, STRETCH_TINTS } from "@/lib/chart-theme";
import { SEASON_DAYS, dayLabel } from "@/lib/dates";
import { letter } from "@/lib/format";
import { stretchRange, type SeasonCalendar } from "@/lib/season-positions";
import LineKey from "../line-key";

const { Text } = Typography;

/**
 * One day, tinted by its stretch, with a popup of the stretch's dates and
 * each basin's expected letter.
 */
export default function CalendarDay({
  day,
  index,
  calendar,
  open,
  active,
  marked,
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
  onOpen: (index: number | null) => void;
}) {
  const stretch = calendar.stretchOf.get(index)!;
  const { positions } = calendar;
  const letters = BASINS.map(
    (b) => `${BASIN_LABELS[b]} ${letter(positions[b][index])}`,
  ).join(", ");

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
        </Flex>
      }
    >
      <div
        data-day
        aria-label={`${dayLabel(SEASON_DAYS[index])}: ${letters}`}
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
        {day}
      </div>
    </Popover>
  );
}
