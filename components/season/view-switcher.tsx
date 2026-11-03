import { Segmented } from "antd";
import { CalendarDays, ChartLine } from "lucide-react";

export type SeasonViewName =
  | "Chart"
  | "Table (Date)"
  | "Table (Name)"
  | "Calendar";

const iconStyle = { verticalAlign: "middle" };

/** Picks how the season curve is shown. */
export default function ViewSwitcher({
  value,
  onChange,
}: {
  value: SeasonViewName;
  onChange: (value: SeasonViewName) => void;
}) {
  return (
    <Segmented<SeasonViewName>
      options={[
        {
          value: "Chart",
          title: "Chart",
          icon: <ChartLine size={16} style={iconStyle} />,
        },
        "Table (Date)",
        "Table (Name)",
        {
          value: "Calendar",
          title: "Calendar",
          icon: <CalendarDays size={16} style={iconStyle} />,
        },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}
