"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import dayjs from "dayjs";
import {
  Alert,
  Flex,
  Modal,
  Segmented,
  Skeleton,
  Table,
  Typography,
} from "antd";
import {
  BASINS,
  BASIN_LABELS,
  SEASON_DAYS,
  type Basin,
  type SeasonResponse,
} from "@/lib/names";

const { Link, Text } = Typography;
const ISO = "YYYY-MM-DD";

// Categorical slots 1 and 2 of the dataviz reference palette; chrome is kept
// a step off the surface so the two lines carry the ink.
const SERIES_COLOR: Record<Basin, string> = { E: "#2a78d6", L: "#eb6834" };
const GRID = "#e1e0d9";
const AXIS = "#c3c2b7";
const MUTED = "#898781";
const SECONDARY = "#52514e";

const HEIGHT = 320;
const MARGIN = { top: 24, right: 12, bottom: 28, left: 32 };

/** "MM-DD" → "D MMM", read against the leap year SEASON_DAYS is built on. */
const dayLabel = (monthDay: string) =>
  dayjs(`2024-${monthDay}`, ISO).format("D MMM");

type State = { data: SeasonResponse } | { error: string } | null;

/** A link that opens the season curve, marking `date` (YYYY-MM-DD) on it. */
export default function SeasonCurveLink({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>(null);

  // Fetch once, the first time the modal opens.
  useEffect(() => {
    if (!open || state) return;
    const today = dayjs().format(ISO);
    fetch(`/api/season?today=${today}`)
      .then(async (res) => {
        const body = await res.json();
        setState(
          res.ok ? { data: body } : { error: body.error ?? res.statusText },
        );
      })
      .catch((err: Error) => setState({ error: err.message }));
  }, [open, state]);

  return (
    <>
      <Link onClick={() => setOpen(true)}>See how the season builds</Link>
      <Modal
        title="Average named storms through the year"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        {!state ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : "error" in state ? (
          <Alert
            type="error"
            showIcon
            message="Could not load the season"
            description={state.error}
          />
        ) : (
          <Season data={state.data} date={date} />
        )}
      </Modal>
    </>
  );
}

function Season({ data, date }: { data: SeasonResponse; date: string }) {
  const [view, setView] = useState<"Chart" | "Table">("Chart");
  const partial = data.years.to === dayjs().year();

  return (
    <Flex vertical gap={16}>
      <Text type="secondary">
        Named storms formed between 1 Jan and each date, averaged over{" "}
        {data.years.from}–{data.years.to}
        {partial && ` (${data.years.to} only counts for dates it has reached)`}.
      </Text>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Legend />
        <Segmented
          options={["Chart", "Table"]}
          value={view}
          onChange={setView}
        />
      </Flex>
      {view === "Chart" ? (
        <LineChart average={data.average} marked={date.slice(5)} />
      ) : (
        <MonthTable average={data.average} />
      )}
    </Flex>
  );
}

function Legend() {
  return (
    <Flex gap={16} wrap>
      {BASINS.map((basin) => (
        <Flex key={basin} gap={6} align="center">
          <LineKey basin={basin} />
          <Text type="secondary">{BASIN_LABELS[basin]}</Text>
        </Flex>
      ))}
    </Flex>
  );
}

function LineKey({ basin }: { basin: Basin }) {
  return (
    <span
      aria-hidden
      style={{
        width: 14,
        height: 2,
        borderRadius: 1,
        background: SERIES_COLOR[basin],
      }}
    />
  );
}

function LineChart({
  average,
  marked,
}: {
  average: SeasonResponse["average"];
  marked: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current!;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const last = SEASON_DAYS.length - 1;
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const peak = Math.max(...BASINS.map((basin) => average[basin][last]));
  const step = peak > 25 ? 10 : 5;
  const yMax = Math.max(step, Math.ceil(peak / step) * step);
  const x = (i: number) => MARGIN.left + (i / last) * plotW;
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;

  const yTicks = Array.from({ length: yMax / step + 1 }, (_, i) => i * step);
  // First of each month; thin the labels out when the chart is narrow.
  const monthStarts = SEASON_DAYS.flatMap((day, i) =>
    day.endsWith("-01") ? [i] : [],
  );
  const labelEvery = width < 420 ? 3 : width < 640 ? 2 : 1;

  const markedIndex = SEASON_DAYS.indexOf(marked);
  // End labels: the higher line's goes above it, the lower one's below.
  const [upper] = [...BASINS].sort(
    (a, b) => average[b][last] - average[a][last],
  );

  function indexAt(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    return Math.min(last, Math.max(0, Math.round(ratio * last)));
  }

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      PageUp: -30,
      PageDown: 30,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const from = hover ?? (markedIndex >= 0 ? markedIndex : 0);
    setHover(Math.min(last, Math.max(0, from + moves[event.key])));
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
          {yTicks.map((tick) => (
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

          {monthStarts.map((i, n) =>
            n % labelEvery === 0 ? (
              <text key={i} x={x(i)} y={HEIGHT - 8} fill={MUTED}>
                {dayjs(`2024-${SEASON_DAYS[i]}`, ISO).format("MMM")}
              </text>
            ) : null,
          )}

          {markedIndex >= 0 && (
            <g>
              <line
                x1={x(markedIndex)}
                x2={x(markedIndex)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
                stroke={AXIS}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={x(markedIndex)}
                y={MARGIN.top - 8}
                textAnchor={
                  markedIndex > last * 0.85
                    ? "end"
                    : markedIndex < last * 0.15
                      ? "start"
                      : "middle"
                }
                fill={SECONDARY}
              >
                {dayLabel(marked)}
              </text>
            </g>
          )}

          {BASINS.map((basin) => (
            <path
              key={basin}
              d={average[basin]
                .map(
                  (v, i) =>
                    `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`,
                )
                .join("")}
              fill="none"
              stroke={SERIES_COLOR[basin]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {hover === null &&
            BASINS.map((basin) => (
              <text
                key={basin}
                x={x(last) - 4}
                y={y(average[basin][last]) + (basin === upper ? -8 : 16)}
                textAnchor="end"
                fill={SECONDARY}
              >
                {BASIN_LABELS[basin]}
              </text>
            ))}

          {hover !== null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
                stroke={MUTED}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              {BASINS.map((basin) => (
                <circle
                  key={basin}
                  cx={x(hover)}
                  cy={y(average[basin][hover])}
                  r={4}
                  fill={SERIES_COLOR[basin]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Hit area covers the whole plot so the crosshair snaps to the nearest day. */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={(event) => setHover(indexAt(event))}
            onPointerDown={(event) => setHover(indexAt(event))}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}

      {hover !== null && (
        <Tooltip
          average={average}
          index={hover}
          left={x(hover)}
          width={width}
        />
      )}
    </div>
  );
}

function Tooltip({
  average,
  index,
  left,
  width,
}: {
  average: SeasonResponse["average"];
  index: number;
  left: number;
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

/** The curve's values at the end of each month. */
function MonthTable({ average }: { average: SeasonResponse["average"] }) {
  const rows = SEASON_DAYS.flatMap((day, i) => {
    const next = SEASON_DAYS[i + 1];
    return !next || next.endsWith("-01") ? [{ key: day, day, i }] : [];
  });

  return (
    <Table
      size="small"
      pagination={false}
      dataSource={rows}
      columns={[
        { title: "By", dataIndex: "day", render: dayLabel },
        ...BASINS.map((basin) => ({
          title: BASIN_LABELS[basin],
          key: basin,
          align: "right" as const,
          render: (_: unknown, row: (typeof rows)[number]) =>
            average[basin][row.i].toFixed(2),
        })),
      ]}
    />
  );
}
