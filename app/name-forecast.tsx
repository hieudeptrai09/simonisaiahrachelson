"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Flex,
  Skeleton,
  Tag,
  Typography,
  message,
} from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  BASINS,
  BASIN_LABELS,
  SUPPLEMENTAL_SET,
  parseIsoDate,
  type NamesResponse,
} from "@/lib/names";

const { Text, Title } = Typography;
const ISO = "YYYY-MM-DD";

type Result = { date: string } & ({ data: NamesResponse } | { error: string });

export default function NameForecast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();

  // ?date= drives everything so the URL is shareable; fall back to today.
  const param = searchParams.get("date");
  const date = parseIsoDate(param) ? param! : dayjs().format(ISO);

  const [result, setResult] = useState<Result | null>(null);
  const loading = result?.date !== date;

  useEffect(() => {
    const controller = new AbortController();
    const today = dayjs().format(ISO);
    fetch(`/api/names?date=${date}&today=${today}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const body = await res.json();
        setResult(
          res.ok
            ? { date, data: body }
            : { date, error: body.error ?? res.statusText },
        );
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setResult({ date, error: err.message });
      });
    return () => controller.abort();
  }, [date]);

  function handleChange(value: Dayjs | null) {
    if (value)
      router.replace(`${pathname}?date=${value.format(ISO)}`, {
        scroll: false,
      });
  }

  async function copyLink() {
    const url = `${window.location.origin}${pathname}?date=${date}`;
    try {
      await navigator.clipboard.writeText(url);
      messageApi.success("Link copied");
    } catch {
      messageApi.info(url);
    }
  }

  return (
    <Flex vertical gap={24}>
      {contextHolder}
      <Flex gap={12} wrap align="center">
        <Flex gap={4} align="center">
          <Button
            size="large"
            aria-label="Previous day"
            icon={<ChevronLeft size={18} />}
            onClick={() => handleChange(dayjs(date, ISO).subtract(1, "day"))}
          />
          <DatePicker
            size="large"
            value={dayjs(date, ISO)}
            onChange={handleChange}
            allowClear={false}
            format="D MMM YYYY"
          />
          <Button
            size="large"
            aria-label="Next day"
            icon={<ChevronRight size={18} />}
            onClick={() => handleChange(dayjs(date, ISO).add(1, "day"))}
          />
        </Flex>
        <Button size="large" onClick={copyLink}>
          Copy link
        </Button>
      </Flex>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : "error" in result ? (
        <Alert
          type="error"
          showIcon
          message="Could not load names"
          description={result.error}
        />
      ) : (
        <Results data={result.data} />
      )}
    </Flex>
  );
}

function Results({ data }: { data: NamesResponse }) {
  const day = dayjs(data.date, ISO).format("D MMM");
  const year = data.date.slice(0, 4);

  return (
    <Flex vertical gap={16}>
      <Text type="secondary">
        On average across {data.years.from}–{data.years.to} ({data.years.count}{" "}
        seasons), by {day} the Eastern Pacific has had{" "}
        <Text strong>{data.average.E.toFixed(2)}</Text> named storms and the
        Atlantic <Text strong>{data.average.L.toFixed(2)}</Text>. Names come
        from set {data.set} ({year} mod 6).
      </Text>

      <div className="grid gap-4 sm:grid-cols-2">
        {BASINS.map((basin) => (
          <Card key={basin} title={`${BASIN_LABELS[basin]} (${basin})`}>
            <Flex vertical gap={16}>
              {data.names[basin].map(({ position, hit }) => (
                <Flex
                  key={position}
                  justify="space-between"
                  align="center"
                  gap={12}
                >
                  <Title
                    level={3}
                    style={{ margin: 0 }}
                    type={hit ? undefined : "secondary"}
                  >
                    {hit?.name ?? "Beyond the lists"}
                  </Title>
                  <Flex vertical align="end" gap={4}>
                    <Text type="secondary">#{position}</Text>
                    {hit?.set === SUPPLEMENTAL_SET && hit.set !== data.set && (
                      <Tag color="orange">Set 6 · #{hit.seq}</Tag>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        ))}
      </div>
    </Flex>
  );
}
