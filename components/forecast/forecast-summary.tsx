import { Typography } from "antd";
import { isoDayLabel } from "@/lib/dates";
import type { NamesResponse } from "@/lib/types";
import SeasonCurveLink from "@/components/season/season-curve-link";

const { Text } = Typography;

/** The averages behind the forecast, with a link to the season curve. */
export default function ForecastSummary({ data }: { data: NamesResponse }) {
  const day = isoDayLabel(data.date);
  const year = data.date.slice(0, 4);

  return (
    <Text type="secondary">
      On average across {data.years.from}–{data.years.to} ({data.years.count}{" "}
      seasons), by {day} the Eastern Pacific has had{" "}
      <Text strong>{data.average.E.toFixed(2)}</Text> named storms and the
      Atlantic <Text strong>{data.average.L.toFixed(2)}</Text>. Names come from
      set {data.set} ({year} mod 6). <SeasonCurveLink date={data.date} />
    </Text>
  );
}
