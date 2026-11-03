import dayjs, { type Dayjs } from "dayjs";
import { Button, DatePicker, Flex } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ISO } from "@/lib/dates";

/** A date picker between previous-day and next-day buttons. */
export default function DateNavigator({
  date,
  onChange,
}: {
  /** YYYY-MM-DD */
  date: string;
  onChange: (value: Dayjs | null) => void;
}) {
  const value = dayjs(date, ISO);

  return (
    <Flex gap={4} align="center">
      <Button
        size="large"
        aria-label="Previous day"
        icon={<ChevronLeft size={18} />}
        onClick={() => onChange(value.subtract(1, "day"))}
      />
      <DatePicker
        size="large"
        value={value}
        onChange={onChange}
        allowClear={false}
        format="D MMM YYYY"
      />
      <Button
        size="large"
        aria-label="Next day"
        icon={<ChevronRight size={18} />}
        onClick={() => onChange(value.add(1, "day"))}
      />
    </Flex>
  );
}
