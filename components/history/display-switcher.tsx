import { Segmented } from "antd";
import { CalendarDays, Table2 } from "lucide-react";

export type HistoryDisplay = "Calendar" | "Table";

const iconStyle = { verticalAlign: "middle" };

/** Picks whether start dates are shown on a calendar or in a table. */
export default function DisplaySwitcher({
  value,
  onChange,
}: {
  value: HistoryDisplay;
  onChange: (value: HistoryDisplay) => void;
}) {
  return (
    <Segmented<HistoryDisplay>
      options={[
        {
          value: "Calendar",
          label: "Calendar",
          icon: <CalendarDays size={16} style={iconStyle} />,
        },
        {
          value: "Table",
          label: "Table",
          icon: <Table2 size={16} style={iconStyle} />,
        },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}
